import { createServerFn } from "@tanstack/react-start";

type Quote = { symbol: string; price: number; changePct: number };

// In-memory cooldown so a rate-limited provider can't be hammered every request.
// Lives per server instance and is fine to lose on cold start — at worst we make
// one extra failing fetch before reinstating the cooldown.
const COOLDOWN_MS = 15 * 60 * 1000;
const REFRESH_AFTER_MS = 12 * 60 * 60 * 1000;
let cooldownUntil = 0;
let refreshInflight: Promise<void> | null = null;

type AlphaVantageResponse = {
  "Global Quote"?: Record<string, string>;
  Note?: string;
  Information?: string;
};

async function fetchQuoteFromProvider(
  symbol: string,
  apiKey: string,
): Promise<{ quote: Quote | null; rateLimited: boolean }> {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
      symbol,
    )}&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return { quote: null, rateLimited: false };
    const json = (await res.json()) as AlphaVantageResponse;

    // Alpha Vantage signals rate-limit / quota with a "Note" or "Information"
    // string and no Global Quote. Detect it so we can stop hammering.
    if (!json["Global Quote"] || !json["Global Quote"]["05. price"]) {
      const rateLimited = Boolean(json.Note || json.Information);
      return { quote: null, rateLimited };
    }

    const q = json["Global Quote"];
    const price = parseFloat(q["05. price"]);
    const changePctStr = (q["10. change percent"] || "0%").replace("%", "");
    const changePct = parseFloat(changePctStr);
    if (!isFinite(price)) return { quote: null, rateLimited: false };
    return {
      quote: { symbol, price, changePct: isFinite(changePct) ? changePct : 0 },
      rateLimited: false,
    };
  } catch {
    return { quote: null, rateLimited: false };
  }
}

async function backgroundRefresh(symbols: string[]): Promise<void> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return;
  if (Date.now() < cooldownUntil) return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  for (const symbol of symbols) {
    if (Date.now() < cooldownUntil) break;
    const { quote, rateLimited } = await fetchQuoteFromProvider(symbol, apiKey);
    if (rateLimited) {
      cooldownUntil = Date.now() + COOLDOWN_MS;
      break;
    }
    if (!quote) continue;
    // Upsert each success individually so partial progress is durable.
    await supabaseAdmin
      .from("quote_cache")
      .upsert(
        {
          symbol: quote.symbol,
          price: quote.price,
          change_pct: quote.changePct,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "symbol" },
      );
  }
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Always serve from the persistent cache first — even if it's stale,
    // it's better than blank values from a rate-limited provider.
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

    const ageMs = newest > 0 ? Date.now() - newest : Infinity;
    const shouldRefresh =
      ageMs > REFRESH_AFTER_MS && Date.now() >= cooldownUntil;

    // Kick off a background refresh — do NOT await. The response returns
    // immediately with whatever the cache currently holds.
    if (shouldRefresh && !refreshInflight) {
      refreshInflight = backgroundRefresh(data.symbols).finally(() => {
        refreshInflight = null;
      });
      refreshInflight.catch((err) => {
        console.error("[quotes] background refresh failed:", err);
      });
    }

    return {
      quotes,
      cachedAt: newest > 0 ? newest : Date.now(),
      fresh: ageMs <= REFRESH_AFTER_MS,
      stale: ageMs > 24 * 60 * 60 * 1000,
    };
  });
