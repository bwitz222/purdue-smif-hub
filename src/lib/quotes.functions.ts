import { createServerFn } from "@tanstack/react-start";

type Quote = { symbol: string; price: number; changePct: number };

// Polygon free tier: 5 req/min. The batch snapshot endpoint returns every
// requested ticker in ONE call, so a full refresh of all holdings = 1 call.
const COOLDOWN_MS = 5 * 60 * 1000;
const REFRESH_AFTER_MS = 6 * 60 * 60 * 1000;
let cooldownUntil = 0;

type PolygonSnapshotTicker = {
  ticker: string;
  todaysChangePerc?: number;
  day?: { c?: number; o?: number };
  prevDay?: { c?: number };
  lastTrade?: { p?: number };
  min?: { c?: number };
};

type PolygonSnapshotResponse = {
  status?: string;
  tickers?: PolygonSnapshotTicker[];
  error?: string;
};

async function fetchSnapshots(
  symbols: string[],
  apiKey: string,
): Promise<{ quotes: Quote[]; rateLimited: boolean }> {
  if (symbols.length === 0) return { quotes: [], rateLimited: false };
  try {
    const tickers = symbols.join(",");
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${encodeURIComponent(
      tickers,
    )}&apiKey=${apiKey}`;
    const res = await fetch(url);
    if (res.status === 429) return { quotes: [], rateLimited: true };
    if (!res.ok) return { quotes: [], rateLimited: false };
    const json = (await res.json()) as PolygonSnapshotResponse;
    if (!json.tickers) return { quotes: [], rateLimited: false };

    const out: Quote[] = [];
    for (const t of json.tickers) {
      // Prefer most current price: day close → last trade → min close → prev close.
      const price =
        (t.day?.c && t.day.c > 0 ? t.day.c : undefined) ??
        t.lastTrade?.p ??
        t.min?.c ??
        t.prevDay?.c;
      if (!price || !isFinite(price)) continue;
      const changePct = typeof t.todaysChangePerc === "number" ? t.todaysChangePerc : 0;
      out.push({
        symbol: t.ticker,
        price,
        changePct: isFinite(changePct) ? changePct : 0,
      });
    }
    return { quotes: out, rateLimited: false };
  } catch {
    return { quotes: [], rateLimited: false };
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
    const apiKey = process.env.POLYGON_API_KEY;

    if (apiKey && now >= cooldownUntil && ageMs > REFRESH_AFTER_MS) {
      const { quotes: fresh, rateLimited } = await fetchSnapshots(data.symbols, apiKey);
      if (rateLimited) {
        cooldownUntil = Date.now() + COOLDOWN_MS;
      } else if (fresh.length > 0) {
        const fetchedAt = new Date().toISOString();
        const upserts = fresh.map((q) => ({
          symbol: q.symbol,
          price: q.price,
          change_pct: q.changePct,
          fetched_at: fetchedAt,
        }));
        for (const q of fresh) quotes[q.symbol] = q;
        await supabaseAdmin
          .from("quote_cache")
          .upsert(upserts, { onConflict: "symbol" });
        newest = Date.parse(fetchedAt);
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
