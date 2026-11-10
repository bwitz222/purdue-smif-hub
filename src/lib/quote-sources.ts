// Decides which closing prices the site shows when two sources disagree about
// how recent the data is. Pure and side-effect free so every rule is testable.
//
//   cache     quote_cache, the Polygon end-of-day cache (releases closes late)
//   external  external_quotes, closes pushed by a second source (Zacks)
//
// Rules, in order:
//  1. An external set is considered only if its session is strictly newer than
//     the cache's. On a tie the cache wins (Polygon's prices are split-adjusted),
//     so Polygon takes over by itself as soon as it catches up.
//  2. The session must be a completed trading session, never one in the future.
//  3. It must cover every requested symbol with a usable price and previous
//     close. A partial set is ignored entirely: mixing two sessions inside one
//     portfolio would make every total on the page wrong.
//  4. No price may sit more than MAX_MOVE from the cached price. That catches a
//     split or a unit error (a price in cents) without needing a split calendar;
//     if any row fails, the whole external set is ignored.
import { lastCompletedSession } from "@/lib/market-calendar";

export type CacheRow = { symbol: string; price: number; change_pct: number; fetched_at: string };

export type ExternalClose = {
  symbol: string;
  source: string;
  session_date: string;
  price: number;
  prev_close: number | null;
  fetched_at?: string;
};

export type QuoteSource = "polygon" | "zacks";

export type MergeResult = {
  rows: CacheRow[];
  /** Session the returned rows belong to (YYYY-MM-DD), when known. */
  sessionDate: string | null;
  source: QuoteSource | null;
  /** Why an external set was passed over, for logs. Absent when none existed. */
  skipped?: string;
};

/** Largest price change vs the cache that is still believed to be a real move. */
export const MAX_MOVE = 0.5;

const isQuoteSource = (s: string): s is QuoteSource => s === "zacks" || s === "polygon";
const usable = (n: number | null | undefined): n is number =>
  typeof n === "number" && isFinite(n) && n > 0;

export function mergeQuotes(opts: {
  cache: CacheRow[];
  cacheSession: string | null;
  external: ExternalClose[];
  symbols: string[];
  now?: Date;
}): MergeResult {
  const { cache, cacheSession, external, symbols } = opts;
  const now = opts.now ?? new Date();
  const base: MergeResult = {
    rows: cache,
    sessionDate: cacheSession,
    source: cache.length > 0 ? "polygon" : null,
  };
  if (external.length === 0 || symbols.length === 0) return base;

  const ceiling = lastCompletedSession(now);
  // Newest eligible (source, session) group.
  const groups = new Map<string, ExternalClose[]>();
  for (const e of external) {
    if (!isQuoteSource(e.source)) continue;
    if (e.session_date > ceiling) continue;
    if (cacheSession && e.session_date <= cacheSession) continue;
    const key = `${e.source}|${e.session_date}`;
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  if (groups.size === 0) return { ...base, skipped: "no external session newer than the cache" };
  const [key, rows] = [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))[0];
  const [source, sessionDate] = key.split("|") as [QuoteSource, string];

  const bySymbol = new Map(rows.map((r) => [r.symbol, r]));
  const cachedPrice = new Map(cache.map((r) => [r.symbol, r.price]));
  const merged: CacheRow[] = [];
  for (const symbol of symbols) {
    const e = bySymbol.get(symbol);
    if (!e || !usable(e.price) || !usable(e.prev_close)) {
      return { ...base, skipped: `${source} set incomplete: ${symbol} missing or unusable` };
    }
    const cached = cachedPrice.get(symbol);
    if (usable(cached) && Math.abs(e.price / cached - 1) > MAX_MOVE) {
      return {
        ...base,
        skipped: `${source} ${symbol} moved ${((e.price / cached - 1) * 100).toFixed(0)}% vs cache; ignoring set`,
      };
    }
    merged.push({
      symbol,
      price: e.price,
      change_pct: (e.price / e.prev_close - 1) * 100,
      fetched_at: e.fetched_at ?? now.toISOString(),
    });
  }
  return { rows: merged, sessionDate, source };
}
