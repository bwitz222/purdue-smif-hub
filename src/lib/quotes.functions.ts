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
    const ageBySymbol = new Map<string, number>();
    let newest = 0;
    const now = Date.now();
    for (const r of rows ?? []) {
      quotes[r.symbol] = {
        symbol: r.symbol,
        price: Number(r.price),
        changePct: Number(r.change_pct),
      };
      const ts = new Date(r.fetched_at).getTime();
      ageBySymbol.set(r.symbol, now - ts);
      if (ts > newest) newest = ts;
    }

    // Cloudflare Workers kill fire-and-forget promises the moment the
    // response is sent, so refresh synchronously — but only a tiny batch
    // per request to stay under Alpha Vantage's 5/min limit and the
    // Worker CPU budget. With ~23 symbols, ~5 page loads = full refresh.
    const REFRESH_BATCH = 5;
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (apiKey && now >= cooldownUntil) {
      // Stalest first; symbols missing from cache rank as oldest of all.
      const candidates = data.symbols
        .map((s) => ({ s, age: ageBySymbol.get(s) ?? Infinity }))
        .filter((c) => c.age > REFRESH_AFTER_MS)
        .sort((a, b) => b.age - a.age)
        .slice(0, REFRESH_BATCH)
        .map((c) => c.s);

      for (const symbol of candidates) {
        if (Date.now() < cooldownUntil) break;
        const { quote, rateLimited } = await fetchQuoteFromProvider(symbol, apiKey);
        if (rateLimited) {
          cooldownUntil = Date.now() + COOLDOWN_MS;
          break;
        }
        if (!quote) continue;
        const fetchedAt = new Date().toISOString();
        await supabaseAdmin.from("quote_cache").upsert(
          {
            symbol: quote.symbol,
            price: quote.price,
            change_pct: quote.changePct,
            fetched_at: fetchedAt,
          },
          { onConflict: "symbol" },
        );
        // Reflect the fresh value in this response too.
        quotes[quote.symbol] = quote;
        const ts = Date.parse(fetchedAt);
        if (ts > newest) newest = ts;
      }
    }

    const ageMs = newest > 0 ? Date.now() - newest : Infinity;
    return {
      quotes,
      cachedAt: newest > 0 ? newest : Date.now(),
      fresh: ageMs <= REFRESH_AFTER_MS,
      stale: ageMs > 24 * 60 * 60 * 1000,
    };
  });
