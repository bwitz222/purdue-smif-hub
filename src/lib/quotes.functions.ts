import { createServerFn } from "@tanstack/react-start";

type Quote = { symbol: string; price: number; changePct: number };

// In-memory cache (per server instance). Alpha Vantage free tier = 25 req/day,
// so we cache aggressively. 12h TTL means at most 2 full refreshes per day.
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
let cache: { at: number; quotes: Record<string, Quote> } | null = null;
let inflight: Promise<Record<string, Quote>> | null = null;

async function fetchQuote(symbol: string, apiKey: string): Promise<Quote | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
      symbol,
    )}&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as { "Global Quote"?: Record<string, string> };
    const q = json["Global Quote"];
    if (!q || !q["05. price"]) return null;
    const price = parseFloat(q["05. price"]);
    const changePctStr = (q["10. change percent"] || "0%").replace("%", "");
    const changePct = parseFloat(changePctStr);
    if (!isFinite(price)) return null;
    return { symbol, price, changePct: isFinite(changePct) ? changePct : 0 };
  } catch {
    return null;
  }
}

async function fetchAll(symbols: string[]): Promise<Record<string, Quote>> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) throw new Error("ALPHA_VANTAGE_API_KEY is not configured");

  const out: Record<string, Quote> = {};
  // Sequential to avoid burning rate-limit on concurrent bursts.
  for (const s of symbols) {
    const q = await fetchQuote(s, apiKey);
    if (q) out[s] = q;
  }
  return out;
}

export const getLiveQuotes = createServerFn({ method: "POST" })
  .inputValidator((data: { symbols: string[] }) => {
    if (!data || !Array.isArray(data.symbols)) throw new Error("symbols required");
    const symbols = data.symbols
      .filter((s) => typeof s === "string" && /^[A-Z.\-]{1,10}$/.test(s))
      .slice(0, 50);
    return { symbols };
  })
  .handler(async ({ data }) => {
    const now = Date.now();
    if (cache && now - cache.at < CACHE_TTL_MS) {
      return { quotes: cache.quotes, cachedAt: cache.at, fresh: false };
    }
    if (!inflight) {
      inflight = fetchAll(data.symbols).finally(() => {
        // clear after settle so future stale loads can refresh
        setTimeout(() => {
          inflight = null;
        }, 0);
      });
    }
    const quotes = await inflight;
    // Only cache if we got at least some quotes (rate-limit returns empty).
    if (Object.keys(quotes).length > 0) {
      cache = { at: Date.now(), quotes };
    }
    return {
      quotes: cache?.quotes ?? quotes,
      cachedAt: cache?.at ?? Date.now(),
      fresh: true,
    };
  });
