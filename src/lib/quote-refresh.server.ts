// Server-only: the one implementation of "pull the latest end-of-day closes from
// Polygon into quote_cache". It is used by the nightly cron hook
// (routes/api/public/hooks/refresh-quotes.ts) and by the visitor self-heal in
// quotes.functions.ts, which used to carry two diverging copies.
//
// Polygon's grouped-daily endpoint returns every US stock's bar for one date in
// a single request, so two consecutive sessions cost two calls. The plan only
// releases a close some time after the session ends; days it has not released
// return 403 and are skipped, which is why the newest session it can give us is
// recorded alongside the prices (QUOTE_SESSION_KEY).
import { sessionsBehind } from "@/lib/market-calendar";
import type { ExternalClose } from "@/lib/quote-sources";

type PolygonBar = { T: string; c: number; o: number };
type PolygonGroupedResponse = { results?: PolygonBar[]; status?: string };

export type SupabaseAdmin = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

export const COOLDOWN_KEY = "polygon_cooldown_until";
/** Date (UTC midnight) of the trading session the cached prices belong to. */
export const QUOTE_SESSION_KEY = "quotes_session";
/** When a visitor last triggered a catch-up attempt; throttles retries. */
export const QUOTE_ATTEMPT_KEY = "quotes_last_attempt";

const COOLDOWN_MS = 5 * 60 * 1000;
/** Cache older than this is refreshed by the next visitor. */
const REFRESH_AFTER_MS = 6 * 60 * 60 * 1000;
/** While the cache is behind the latest completed session, retry at most this often. */
const CATCH_UP_RETRY_MS = 30 * 60 * 1000;

const toYmd = (d: Date) => d.toISOString().slice(0, 10);

type GroupedResult = {
  latest: Map<string, PolygonBar> | null;
  prior: Map<string, PolygonBar> | null;
  /** The trading date `latest` belongs to. */
  latestDate: string | null;
  rateLimited: boolean;
  unauthorized: boolean;
};

// Walk back up to 10 days to find the two most recent sessions the plan will
// release (skipping weekends, holidays, and not-yet-released days).
async function fetchTwoDaysGroupedBars(apiKey: string): Promise<GroupedResult> {
  const found: Array<{ date: string; bars: Map<string, PolygonBar> }> = [];
  const today = new Date();
  const result = (flags: Partial<GroupedResult> = {}): GroupedResult => ({
    latest: found[0]?.bars ?? null,
    prior: found[1]?.bars ?? null,
    latestDate: found[0]?.date ?? null,
    rateLimited: false,
    unauthorized: false,
    ...flags,
  });
  for (let back = 0; back <= 10 && found.length < 2; back++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - back);
    const date = toYmd(d);
    const url = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true&apiKey=${apiKey}`;
    try {
      const res = await fetch(url);
      if (res.status === 429) return result({ rateLimited: true });
      if (res.status === 401) return result({ unauthorized: true });
      // 403 NOT_AUTHORIZED: this (too-recent) day is not released on the current
      // plan. Fall through to the most recent session that is.
      if (res.status === 403 || !res.ok) continue;
      const json = (await res.json()) as PolygonGroupedResponse;
      if (json.results && json.results.length > 0) {
        const bars = new Map<string, PolygonBar>();
        for (const b of json.results) bars.set(b.T, b);
        found.push({ date, bars });
      }
    } catch {
      // try the previous day
    }
  }
  return result();
}

type QuoteRow = { symbol: string; price: number; change_pct: number; fetched_at: string };

/** Day change is vs the prior session's close; falls back to open-to-close. */
function buildQuoteRows(
  symbols: string[],
  latest: Map<string, PolygonBar>,
  prior: Map<string, PolygonBar> | null,
  fetchedAt: string,
): QuoteRow[] {
  const rows: QuoteRow[] = [];
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
    rows.push({
      symbol,
      price: bar.c,
      change_pct: isFinite(changePct) ? changePct : 0,
      fetched_at: fetchedAt,
    });
  }
  return rows;
}

/** quote_meta values as epoch milliseconds (0 when absent). */
export async function readMeta(
  supabaseAdmin: SupabaseAdmin,
  keys: string[],
): Promise<Record<string, number>> {
  const out: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
  const { data } = await supabaseAdmin.from("quote_meta").select("key, value_ts").in("key", keys);
  for (const row of data ?? []) {
    const t = row.value_ts ? Date.parse(row.value_ts) : NaN;
    if (isFinite(t)) out[row.key] = t;
  }
  return out;
}

export async function writeMeta(
  supabaseAdmin: SupabaseAdmin,
  key: string,
  ms: number,
): Promise<void> {
  await supabaseAdmin
    .from("quote_meta")
    .upsert({ key, value_ts: new Date(ms).toISOString() }, { onConflict: "key" });
}

/** quote_meta stores the session as a timestamp; the UI wants YYYY-MM-DD. */
export const sessionDateFromMeta = (ms: number): string | null =>
  ms > 0 ? new Date(ms).toISOString().slice(0, 10) : null;

/** True when the cache should be refreshed: too old, or behind the latest completed close. */
export function needsRefresh(opts: {
  ageMs: number;
  sessionDate: string | null;
  lastAttemptMs: number;
  now: number;
}): boolean {
  if (opts.ageMs > REFRESH_AFTER_MS) return true;
  if (!opts.sessionDate) return false;
  const behind = sessionsBehind(opts.sessionDate, new Date(opts.now)) > 0;
  return behind && opts.now - opts.lastAttemptMs > CATCH_UP_RETRY_MS;
}

export type RefreshOutcome =
  | { status: "ok"; updated: number; sessionDate: string; fetchedAt: string }
  | { status: "no-bars" | "rate-limited" | "unauthorized" }
  | { status: "db-error"; error: string };

export async function refreshQuoteCache(
  supabaseAdmin: SupabaseAdmin,
  symbols: string[],
  apiKey: string,
): Promise<RefreshOutcome> {
  const { latest, prior, latestDate, rateLimited, unauthorized } =
    await fetchTwoDaysGroupedBars(apiKey);
  if (rateLimited) {
    await writeMeta(supabaseAdmin, COOLDOWN_KEY, Date.now() + COOLDOWN_MS);
    return { status: "rate-limited" };
  }
  if (unauthorized) return { status: "unauthorized" };
  if (!latest || latest.size === 0 || !latestDate) return { status: "no-bars" };

  const fetchedAt = new Date().toISOString();
  const rows = buildQuoteRows(symbols, latest, prior, fetchedAt);
  if (rows.length > 0) {
    const { error } = await supabaseAdmin
      .from("quote_cache")
      .upsert(rows, { onConflict: "symbol" });
    if (error) return { status: "db-error", error: error.message };
    await writeMeta(supabaseAdmin, QUOTE_SESSION_KEY, Date.parse(`${latestDate}T00:00:00Z`));
  }
  return { status: "ok", updated: rows.length, sessionDate: latestDate, fetchedAt };
}

/**
 * Closes pushed by a second source (see external_quotes). Never throws: if the
 * table has not been created yet, or the read fails, the site simply shows the
 * Polygon cache as before.
 */
export async function readExternalCloses(supabaseAdmin: SupabaseAdmin): Promise<ExternalClose[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("external_quotes")
      .select("symbol, source, session_date, price, prev_close, fetched_at");
    if (error || !data) return [];
    return data.map((r) => ({
      symbol: r.symbol,
      source: r.source,
      session_date: r.session_date,
      price: Number(r.price),
      prev_close: r.prev_close === null ? null : Number(r.prev_close),
      fetched_at: r.fetched_at,
    }));
  } catch (e) {
    console.error("[quotes] external closes read failed:", e);
    return [];
  }
}
