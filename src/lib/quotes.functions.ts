import { createServerFn } from "@tanstack/react-start";

type Quote = { symbol: string; price: number; changePct: number };

// Polygon free/basic tier: the snapshot endpoints require a paid plan, but
// the "grouped daily" aggregate endpoint returns every US stock's last-close
// bar in ONE request. We pull TWO consecutive trading days (= 2 API calls)
// so the day-change reflects the real overnight gap, not just intraday.
const COOLDOWN_MS = 5 * 60 * 1000;
const REFRESH_AFTER_MS = 6 * 60 * 60 * 1000;
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
  for (let back = 1; back <= 10 && found.length < 2; back++) {
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

    // Always serve persistent cache first — never block on the network.
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

    const now = Date.now();
    const ageMs = newest > 0 ? now - newest : Infinity;
    // Trim defensively — pasted secrets sometimes carry stray whitespace,
    // which makes the constructed URL throw "Malformed input to a URL function".
    const apiKey = process.env.POLYGON_API_KEY?.trim();

    if (apiKey && ageMs > REFRESH_AFTER_MS) {
      const cooldownUntil = await getCooldownUntil(supabaseAdmin);
      if (now >= cooldownUntil) {
        // Fire-and-forget — do NOT block the response on the Polygon round trip.
        // The pg_cron scheduled job is the primary refresh path; this is a fallback.
        refreshFromPolygon(supabaseAdmin, data.symbols, apiKey).catch((e) => {
          console.error("[quotes] background refresh failed:", e);
        });
      }
    }

    return {
      quotes,
      cachedAt: newest > 0 ? newest : Date.now(),
      fresh: ageMs <= REFRESH_AFTER_MS,
      stale: ageMs > 24 * 60 * 60 * 1000,
    };
  });
