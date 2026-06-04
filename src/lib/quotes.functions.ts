import { createServerFn } from "@tanstack/react-start";

type Quote = { symbol: string; price: number; changePct: number };

// Polygon free/basic tier: the snapshot endpoints require a paid plan, but
// the "grouped daily" aggregate endpoint returns every US stock's last-close
// bar in ONE request — a full refresh of all holdings = 1 API call.
const COOLDOWN_MS = 5 * 60 * 1000;
const REFRESH_AFTER_MS = 6 * 60 * 60 * 1000;
let cooldownUntil = 0;

type PolygonBar = {
  T: string; // ticker
  c: number; // close
  o: number; // open
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

// Walk back up to 7 days to skip weekends/holidays/not-yet-published days.
async function fetchGroupedBars(
  apiKey: string,
): Promise<{ bars: Map<string, PolygonBar>; rateLimited: boolean; unauthorized: boolean }> {
  const bars = new Map<string, PolygonBar>();
  const today = new Date();
  for (let back = 1; back <= 7; back++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - back);
    const date = toYmd(d);
    const url = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true&apiKey=${apiKey}`;
    try {
      const res = await fetch(url);
      if (res.status === 429) return { bars, rateLimited: true, unauthorized: false };
      if (res.status === 401 || res.status === 403) {
        return { bars, rateLimited: false, unauthorized: true };
      }
      if (!res.ok) continue;
      const json = (await res.json()) as PolygonGroupedResponse;
      if (json.results && json.results.length > 0) {
        for (const b of json.results) bars.set(b.T, b);
        return { bars, rateLimited: false, unauthorized: false };
      }
    } catch {
      // try previous day
    }
  }
  return { bars, rateLimited: false, unauthorized: false };
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

    // Always serve persistent cache first.
    const { data: rows } = await supabaseAdmin
      .from("quote_cache")
      .select("symbol, price, change_pct, fetched_at")
      .in("symbol", data.symbols);

    const quotes: Record<string, Quote> = {};
    let newest = 0;
    const now = Date.now();
    for (const r of rows ?? []) {
      quotes[r.symbol] = {
        symbol: r.symbol,
        price: Number(r.price),
        changePct: Number(r.change_pct),
      };
      const ts = new Date(r.fetched_at).getTime();
      if (ts > newest) newest = ts;
    }

    const ageMs = newest > 0 ? now - newest : Infinity;
    // Trim defensively — pasted secrets sometimes carry stray whitespace,
    // which makes the constructed URL throw "Malformed input to a URL function".
    const apiKey = process.env.POLYGON_API_KEY?.trim();

    if (apiKey && now >= cooldownUntil && ageMs > REFRESH_AFTER_MS) {
      const { bars, rateLimited } = await fetchGroupedBars(apiKey);
      if (rateLimited) {
        cooldownUntil = Date.now() + COOLDOWN_MS;
      } else if (bars.size > 0) {
        const fetchedAt = new Date().toISOString();
        const upserts: Array<{
          symbol: string;
          price: number;
          change_pct: number;
          fetched_at: string;
        }> = [];
        for (const symbol of data.symbols) {
          const bar = bars.get(symbol);
          if (!bar || !isFinite(bar.c)) continue;
          const changePct = bar.o > 0 ? ((bar.c - bar.o) / bar.o) * 100 : 0;
          const quote: Quote = {
            symbol,
            price: bar.c,
            changePct: isFinite(changePct) ? changePct : 0,
          };
          quotes[symbol] = quote;
          upserts.push({
            symbol,
            price: quote.price,
            change_pct: quote.changePct,
            fetched_at: fetchedAt,
          });
        }
        if (upserts.length > 0) {
          await supabaseAdmin
            .from("quote_cache")
            .upsert(upserts, { onConflict: "symbol" });
          newest = Date.parse(fetchedAt);
        }
      }
    }

    const finalAge = newest > 0 ? Date.now() - newest : Infinity;
    return {
      quotes,
      cachedAt: newest > 0 ? newest : Date.now(),
      fresh: finalAge <= REFRESH_AFTER_MS,
      stale: finalAge > 24 * 60 * 60 * 1000,
    };
  });
