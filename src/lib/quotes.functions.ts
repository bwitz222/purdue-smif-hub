import { createServerFn } from "@tanstack/react-start";
import { holdings as baseHoldings } from "@/data/holdings";
import { mergeQuotes, type QuoteSource } from "@/lib/quote-sources";

type Quote = { symbol: string; price: number; changePct: number };

export type QuotePayload = {
  quotes: Record<string, Quote>;
  /** When the cache was last written (epoch ms), not the session it holds. */
  cachedAt: number;
  /** The trading session the prices belong to (YYYY-MM-DD), once recorded. */
  sessionDate: string | null;
  /** Where the prices came from: the Polygon cache, or a newer second source. */
  source: QuoteSource | null;
};

// When the cache is stale or behind the latest completed session, the visitor's
// own request refreshes it, but we cap the wait so a slow provider never blocks
// the response. If the timeout wins, the refresh still finishes in the
// background and the next request is fresh. The refresh logic itself lives in
// quote-refresh.server.ts, shared with the nightly cron hook.
const REFRESH_TIMEOUT_MS = 6000;

type Row = { symbol: string; price: number; change_pct: number; fetched_at: string };

function toPayload(
  rows: Row[],
  sessionDate: string | null,
  source: QuoteSource | null,
): QuotePayload {
  const quotes: Record<string, Quote> = {};
  let newest = 0;
  for (const r of rows) {
    quotes[r.symbol] = {
      symbol: r.symbol,
      price: Number(r.price),
      changePct: Number(r.change_pct),
    };
    const ts = new Date(r.fetched_at).getTime();
    if (ts > newest) newest = ts;
  }
  return {
    quotes,
    cachedAt: newest > 0 ? newest : Date.now(),
    sessionDate,
    source,
  };
}

// Read-only snapshot of quote_cache for SSR loaders. Never touches the
// provider (no self-heal, no timeout risk on the SSR path); the client-side
// getLiveQuotes query takes over after hydration and owns refreshing.
export const getCachedQuotes = createServerFn({ method: "GET" }).handler(
  async (): Promise<QuotePayload> => {
    // Degrade, never throw. This runs in the /holdings route loader, so a
    // rejection here 500s the entire page even though the page ships a static
    // baseline (shares and cost basis from src/data/holdings.ts) that renders
    // fine without live prices. A stale or missing service-role key has taken
    // this path in production before; the right outcome is the baseline table.
    const { QUOTE_SESSION_KEY, readExternalCloses, readMeta, sessionDateFromMeta } =
      await import("@/lib/quote-refresh.server");
    let rows: Row[] = [];
    let sessionDate: string | null = null;
    let source: QuoteSource | null = null;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const res = await supabaseAdmin
        .from("quote_cache")
        .select("symbol, price, change_pct, fetched_at");
      if (res.error) throw res.error;
      rows = res.data ?? [];
      const meta = await readMeta(supabaseAdmin, [QUOTE_SESSION_KEY]);
      const merged = mergeQuotes({
        cache: rows,
        cacheSession: sessionDateFromMeta(meta[QUOTE_SESSION_KEY]),
        external: await readExternalCloses(supabaseAdmin),
        symbols: baseHoldings.map((h) => h.symbol),
      });
      rows = merged.rows;
      sessionDate = merged.sessionDate;
      source = merged.source;
    } catch (err) {
      console.error("[quotes] cached-quote read failed, serving baseline:", err);
    }
    return toPayload(rows, sessionDate, source);
  },
);

export const getLiveQuotes = createServerFn({ method: "POST" })
  .inputValidator((data: { symbols: string[] }) => {
    if (!data || !Array.isArray(data.symbols)) throw new Error("symbols required");
    const symbols = data.symbols
      .filter((s) => typeof s === "string" && /^[A-Z.-]{1,10}$/.test(s))
      .slice(0, 100);
    return { symbols };
  })
  .handler(async ({ data }): Promise<QuotePayload> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const {
      COOLDOWN_KEY,
      QUOTE_ATTEMPT_KEY,
      QUOTE_SESSION_KEY,
      needsRefresh,
      readExternalCloses,
      readMeta,
      refreshQuoteCache,
      sessionDateFromMeta,
      writeMeta,
    } = await import("@/lib/quote-refresh.server");

    // Read the persistent cache. We always have this to serve immediately, and
    // re-read it after a successful refresh so the same request returns fresh data.
    const readCache = async () => {
      const [{ data: rows }, meta] = await Promise.all([
        supabaseAdmin
          .from("quote_cache")
          .select("symbol, price, change_pct, fetched_at")
          .in("symbol", data.symbols),
        readMeta(supabaseAdmin, [COOLDOWN_KEY, QUOTE_SESSION_KEY, QUOTE_ATTEMPT_KEY]),
      ]);
      return { rows: (rows ?? []) as Row[], meta };
    };

    let { rows, meta } = await readCache();
    const now = Date.now();
    const newest = rows.reduce((m, r) => Math.max(m, new Date(r.fetched_at).getTime()), 0);
    const ageMs = newest > 0 ? now - newest : Infinity;
    // Trim defensively: pasted secrets sometimes carry stray whitespace, which
    // makes the constructed URL throw "Malformed input to a URL function".
    const apiKey = process.env.POLYGON_API_KEY?.trim();

    const due = needsRefresh({
      ageMs,
      sessionDate: sessionDateFromMeta(meta[QUOTE_SESSION_KEY]),
      lastAttemptMs: meta[QUOTE_ATTEMPT_KEY],
      now,
    });
    if (apiKey && due && now >= meta[COOLDOWN_KEY]) {
      // Self-heal: pg_cron is the primary refresh path, but nothing depends on it
      // firing. Either the cache is old, or it is behind the latest completed
      // session (the provider may have released a newer close since the last
      // run), so this visit refreshes it. Awaited so the visitor gets fresh
      // prices, capped by REFRESH_TIMEOUT_MS; on timeout the refresh still
      // completes in the background.
      await writeMeta(supabaseAdmin, QUOTE_ATTEMPT_KEY, now).catch(() => {});
      const refresh = refreshQuoteCache(supabaseAdmin, data.symbols, apiKey).catch((e) => {
        console.error("[quotes] refresh failed:", e);
        return null;
      });
      const finished = await Promise.race([
        refresh.then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), REFRESH_TIMEOUT_MS)),
      ]);
      if (finished) ({ rows, meta } = await readCache());
    }

    // A second source may hold a newer close than Polygon has released yet.
    const merged = mergeQuotes({
      cache: rows,
      cacheSession: sessionDateFromMeta(meta[QUOTE_SESSION_KEY]),
      external: await readExternalCloses(supabaseAdmin),
      symbols: data.symbols,
    });
    return toPayload(merged.rows as Row[], merged.sessionDate, merged.source);
  });
