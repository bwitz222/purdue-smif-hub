import { createServerFn } from "@tanstack/react-start";

type Quote = { symbol: string; price: number; changePct: number };

// Polygon free/basic tier: the snapshot endpoints require a paid plan, but
// the "grouped daily" aggregate endpoint returns every US stock's last-close
// bar in ONE request. We pull TWO consecutive trading days (= 2 API calls)
// so the day-change reflects the real overnight gap, not just intraday.
const COOLDOWN_MS = 5 * 60 * 1000;
const REFRESH_AFTER_MS = 6 * 60 * 60 * 1000;
// When the cache is stale, the visitor's own request refreshes it, but we cap
// the wait so a slow provider never blocks the response — if the timeout wins,
// the refresh still finishes in the background and the next request is fresh.
const REFRESH_TIMEOUT_MS = 6000;
const COOLDOWN_KEY = "polygon_cooldown_until";

type PolygonBar = {
  T: string;
  c: number;
  o: number;
  h?: number;
  l?: number;
  v?: number;
  t?: number;
};

type PolygonGroupedResponse = {
  status?: string;
  resultsCount?: number;
  results?: PolygonBar[];
  message?: string;
};

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Walk back up to 10 days to find the TWO most recent trading days
// (skipping weekends/holidays/not-yet-published days).
async function fetchTwoDaysGroupedBars(
  apiKey: string,
): Promise<{
  latest: Map<string, PolygonBar> | null;
  prior: Map<string, PolygonBar> | null;
  rateLimited: boolean;
  unauthorized: boolean;
}> {
  const found: Array<Map<string, PolygonBar>> = [];
  const today = new Date();
  // Start at back=0 (today): Polygon publishes the grouped end-of-day bar a few
  // hours after the close, so as soon as it exists we capture the *latest*
  // session. If today's bar isn't out yet (or it's a weekend/holiday) the day
  // returns 0 results and we fall through to the prior trading days.
  for (let back = 0; back <= 10 && found.length < 2; back++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - back);
    const date = toYmd(d);
    const url = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true&apiKey=${apiKey}`;
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        return { latest: found[0] ?? null, prior: found[1] ?? null, rateLimited: true, unauthorized: false };
      }
      if (res.status === 401 || res.status === 403) {
        return { latest: found[0] ?? null, prior: found[1] ?? null, rateLimited: false, unauthorized: true };
      }
      if (!res.ok) continue;
      const json = (await res.json()) as PolygonGroupedResponse;
      if (json.results && json.results.length > 0) {
        const m = new Map<string, PolygonBar>();
        for (const b of json.results) m.set(b.T, b);
        found.push(m);
      }
    } catch {
      // try previous day
    }
  }
  return {
    latest: found[0] ?? null,
    prior: found[1] ?? null,
    rateLimited: false,
    unauthorized: false,
  };
}

type SupabaseAdmin = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

async function getCooldownUntil(supabaseAdmin: SupabaseAdmin): Promise<number> {
  const { data } = await supabaseAdmin
    .from("quote_meta")
    .select("value_ts")
    .eq("key", COOLDOWN_KEY)
    .maybeSingle();
  if (!data?.value_ts) return 0;
  const t = Date.parse(data.value_ts as unknown as string);
  return isFinite(t) ? t : 0;
}

async function setCooldownUntil(
  supabaseAdmin: SupabaseAdmin,
  untilMs: number,
): Promise<void> {
  await supabaseAdmin
    .from("quote_meta")
    .upsert(
      { key: COOLDOWN_KEY, value_ts: new Date(untilMs).toISOString() },
      { onConflict: "key" },
    );
}

async function refreshFromPolygon(
  supabaseAdmin: SupabaseAdmin,
  symbols: string[],
  apiKey: string,
): Promise<void> {
  const { latest, prior, rateLimited } = await fetchTwoDaysGroupedBars(apiKey);
  if (rateLimited) {
    await setCooldownUntil(supabaseAdmin, Date.now() + COOLDOWN_MS);
    return;
  }
  if (!latest || latest.size === 0) return;

  const fetchedAt = new Date().toISOString();
  const upserts: Array<{
    symbol: string;
    price: number;
    change_pct: number;
    fetched_at: string;
  }> = [];
  for (const symbol of symbols) {
    const bar = latest.get(symbol);
    if (!bar || !isFinite(bar.c)) continue;
    const priorBar = prior?.get(symbol);
    let changePct = 0;
    if (priorBar && isFinite(priorBar.c) && priorBar.c > 0) {
      changePct = ((bar.c - priorBar.c) / priorBar.c) * 100;
    } else if (bar.o > 0) {
      changePct = ((bar.c - bar.o) / bar.o) * 100;
    }
    upserts.push({
      symbol,
      price: bar.c,
      change_pct: isFinite(changePct) ? changePct : 0,
      fetched_at: fetchedAt,
    });
  }
  if (upserts.length > 0) {
    await supabaseAdmin
      .from("quote_cache")
      .upsert(upserts, { onConflict: "symbol" });
  }
}

export const getLiveQuotes = createServerFn({ method: "POST" })
  .inputValidator((data: { symbols: string[] }) => {
    if (!data || !Array.isArray(data.symbols)) throw new Error("symbols required");
    const symbols = data.symbols
      .filter((s) => typeof s === "string" && /^[A-Z.\-]{1,10}$/.test(s))
      .slice(0, 100);
    return { symbols };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Read the persistent cache. We always have this to serve immediately, and
    // re-read it after a successful refresh so the same request returns fresh data.
    const readCache = async () => {
      const { data: rows } = await supabaseAdmin
        .from("quote_cache")
        .select("symbol, price, change_pct, fetched_at")
        .in("symbol", data.symbols);
      const quotes: Record<string, Quote> = {};
      let newest = 0;
      for (const r of rows ?? []) {
        quotes[r.symbol] = {
          symbol: r.symbol,
          price: Number(r.price),
          changePct: Number(r.change_pct),
        };
        const ts = new Date(r.fetched_at).getTime();
        if (ts > newest) newest = ts;
      }
      return { quotes, newest };
    };

    let { quotes, newest } = await readCache();

    const now = Date.now();
    let ageMs = newest > 0 ? now - newest : Infinity;
    // Trim defensively — pasted secrets sometimes carry stray whitespace,
    // which makes the constructed URL throw "Malformed input to a URL function".
    const apiKey = process.env.POLYGON_API_KEY?.trim();

    if (apiKey && ageMs > REFRESH_AFTER_MS) {
      const cooldownUntil = await getCooldownUntil(supabaseAdmin);
      if (now >= cooldownUntil) {
        // Self-heal: the pg_cron job is the primary refresh path, but we no
        // longer depend on it firing. When the cache is stale, this visit
        // refreshes it — awaited so the visitor gets fresh prices — but capped
        // by REFRESH_TIMEOUT_MS. If the provider is slow and the timeout wins,
        // the refresh still completes in the background (its own .catch keeps it
        // from becoming an unhandled rejection) and the next request is fresh.
        const refresh = refreshFromPolygon(supabaseAdmin, data.symbols, apiKey).catch((e) => {
          console.error("[quotes] refresh failed:", e);
        });
        const refreshed = await Promise.race([
          refresh.then(() => true),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), REFRESH_TIMEOUT_MS)),
        ]);
        if (refreshed) {
          ({ quotes, newest } = await readCache());
          ageMs = newest > 0 ? Date.now() - newest : Infinity;
        }
      }
    }

    return {
      quotes,
      cachedAt: newest > 0 ? newest : Date.now(),
      fresh: ageMs <= REFRESH_AFTER_MS,
      stale: ageMs > 24 * 60 * 60 * 1000,
    };
  });
