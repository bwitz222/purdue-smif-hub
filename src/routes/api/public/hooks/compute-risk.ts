import { createFileRoute } from "@tanstack/react-router";
import { holdings as baseHoldings } from "@/data/holdings";
import {
  dailyReturns,
  annualizedVolatility,
  annualizedReturn,
  sharpeRatio,
  historicalVaR,
  exposures,
  TRADING_DAYS_PER_YEAR,
} from "@/lib/risk-metrics";

// Daily portfolio risk job.
//
// Architecture (Polygon free tier is 5 requests/minute, so we never burst 23
// per-ticker calls in one request):
//   • mode=backfill — one-time / repair. Pulls ~400 calendar days of daily
//     closes per holding via ranged aggregates, throttled under the rate limit
//     with 429 backoff, into public.price_history. Slow (~5 min); run manually.
//   • default (daily) — appends just the latest authorized trading day for all
//     holdings using ONE grouped-daily call, then recomputes. Fast + timeout-safe
//     for pg_cron / serverless.
//
// Either mode ends by reading the trailing price_history window, rebuilding the
// portfolio NAV series with CURRENT share counts (a "current-portfolio" risk
// view — how volatile is the book we hold today, per the spec's "weighted return
// if NAV isn't tracked daily"), pulling the live 3-month T-bill rate, computing
// Volatility / Sharpe / 1-day Historical VaR / Gross-Net Exposure via the
// unit-tested risk-metrics module, and upserting public.portfolio_risk_metrics.
//
// Auth: server-only REFRESH_HOOK_SECRET via the `x-refresh-secret` header.

const MIN_SUFFICIENT = 60; // fewer return obs -> vol/sharpe/var reported insufficient
const LOOKBACK_CAP = TRADING_DAYS_PER_YEAR; // cap the return series at 252 obs
const HISTORY_BACKDAYS = 400; // calendar days of history to keep/backfill
const RATE_DELAY_MS = 13_000; // > 12s between ranged calls => <= 5/min (free tier)
const MAX_RETRIES = 4;

type PolyAgg = { T?: string; t: number; c: number };
type PolyResp = { results?: PolyAgg[]; status?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ymd = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// ── Polygon fetchers ────────────────────────────────────────────────────────

/** Ranged daily closes for one ticker, retrying on 429 with linear backoff. */
async function fetchRangedCloses(
  symbol: string,
  from: string,
  to: string,
  apiKey: string,
): Promise<Map<string, number>> {
  const url = `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(
    symbol,
  )}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=500&apiKey=${apiKey}`;
  const out = new Map<string, number>();
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await sleep(RATE_DELAY_MS);
        continue;
      }
      if (!res.ok) return out;
      const json = (await res.json()) as PolyResp;
      for (const b of json.results ?? []) {
        if (isFinite(b.c) && b.c > 0) out.set(ymd(b.t), b.c);
      }
      return out;
    } catch {
      await sleep(1000);
    }
  }
  return out;
}

/**
 * Grouped-daily closes for the most recent authorized trading day (one call,
 * plus a few walk-backs past weekends/holidays/unsettled days). Returns the
 * trading date and a symbol→close map for the holdings we care about.
 */
async function fetchLatestGroupedDay(
  wanted: Set<string>,
  apiKey: string,
): Promise<{ date: string; closes: Map<string, number> } | null> {
  const today = Date.now();
  for (let back = 0; back <= 10; back++) {
    const d = ymd(today - back * 24 * 60 * 60 * 1000);
    const url = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${d}?adjusted=true&apiKey=${apiKey}`;
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await sleep(RATE_DELAY_MS);
        back--; // retry same day
        continue;
      }
      if (res.status === 403 || !res.ok) continue; // too-recent/unauthorized -> older day
      const json = (await res.json()) as PolyResp;
      if (!json.results || json.results.length === 0) continue;
      const closes = new Map<string, number>();
      for (const b of json.results) {
        if (b.T && wanted.has(b.T) && isFinite(b.c) && b.c > 0) closes.set(b.T, b.c);
      }
      if (closes.size > 0) return { date: d, closes };
    } catch {
      // try the previous day
    }
  }
  return null;
}

/** Latest 3-month Treasury yield (percent), live. null on any failure. */
async function fetchRiskFreeRatePct(apiKey: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=daily&maturity=3month&apikey=${encodeURIComponent(apiKey)}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Array<{ date: string; value: string }> };
    for (const row of json.data ?? []) {
      const v = parseFloat(row.value);
      if (isFinite(v)) return v; // newest-first
    }
    return null;
  } catch {
    return null;
  }
}

// ── price_history writers ─────────────────────────────────────────────────────

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

async function upsertPriceRows(
  supabaseAdmin: Admin,
  rows: Array<{ symbol: string; date: string; close: number }>,
): Promise<void> {
  const CHUNK = 1000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await supabaseAdmin
      .from("price_history")
      .upsert(rows.slice(i, i + CHUNK), { onConflict: "symbol,date" });
  }
}

async function backfill(
  supabaseAdmin: Admin,
  symbols: string[],
  apiKey: string,
): Promise<number> {
  const to = ymd(Date.now());
  const from = ymd(Date.now() - HISTORY_BACKDAYS * 24 * 60 * 60 * 1000);
  const rows: Array<{ symbol: string; date: string; close: number }> = [];
  for (let i = 0; i < symbols.length; i++) {
    const closes = await fetchRangedCloses(symbols[i], from, to, apiKey);
    for (const [date, close] of closes) rows.push({ symbol: symbols[i], date, close });
    if (i < symbols.length - 1) await sleep(RATE_DELAY_MS); // stay under 5/min
  }
  await upsertPriceRows(supabaseAdmin, rows);
  return rows.length;
}

async function appendLatestDay(
  supabaseAdmin: Admin,
  symbols: string[],
  apiKey: string,
): Promise<{ date: string | null; count: number }> {
  const day = await fetchLatestGroupedDay(new Set(symbols), apiKey);
  if (!day) return { date: null, count: 0 };
  const rows = symbols
    .filter((s) => day.closes.has(s))
    .map((s) => ({ symbol: s, date: day.date, close: day.closes.get(s)! }));
  await upsertPriceRows(supabaseAdmin, rows);
  return { date: day.date, count: rows.length };
}

// ── compute + store ───────────────────────────────────────────────────────────

async function computeAndStore(
  supabaseAdmin: Admin,
  avKey: string | undefined,
): Promise<Record<string, unknown>> {
  const symbols = baseHoldings.map((h) => h.symbol);
  const sharesBySymbol = new Map(baseHoldings.map((h) => [h.symbol, h.shares]));
  const cutoff = ymd(Date.now() - HISTORY_BACKDAYS * 24 * 60 * 60 * 1000);

  // Paginate: PostgREST caps a select at 1000 rows, and the trailing window is
  // ~252 days × 23 symbols (~5.8k rows). Read in pages until exhausted.
  const rows: Array<{ symbol: string; date: string; close: number }> = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabaseAdmin
      .from("price_history")
      .select("symbol, date, close")
      .gte("date", cutoff)
      .order("date", { ascending: true })
      .order("symbol", { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }

  const bySymbol = new Map<string, Map<string, number>>();
  for (const r of rows ?? []) {
    const price = Number(r.close);
    if (!isFinite(price) || price <= 0) continue;
    if (!bySymbol.has(r.symbol)) bySymbol.set(r.symbol, new Map());
    bySymbol.get(r.symbol)!.set(r.date, price);
  }
  const pricedSymbols = symbols.filter((s) => (bySymbol.get(s)?.size ?? 0) > 0);

  // Dates where every priced symbol has a close (clean NAV series).
  const dateCounts = new Map<string, number>();
  for (const s of pricedSymbols) {
    for (const d of bySymbol.get(s)!.keys()) dateCounts.set(d, (dateCounts.get(d) ?? 0) + 1);
  }
  const commonDates = [...dateCounts.entries()]
    .filter(([, c]) => c === pricedSymbols.length)
    .map(([d]) => d)
    .sort();

  const cash = await getCashHoldings(supabaseAdmin);
  const nav = commonDates.map((d) => {
    let invested = 0;
    for (const s of pricedSymbols) invested += (sharesBySymbol.get(s) ?? 0) * bySymbol.get(s)!.get(d)!;
    return invested + cash;
  });

  let returns = dailyReturns(nav);
  if (returns.length > LOOKBACK_CAP) returns = returns.slice(-LOOKBACK_CAP);
  const nObs = returns.length;
  const sufficient = nObs >= MIN_SUFFICIENT;
  const fullYear = nObs >= LOOKBACK_CAP;
  const asOf = commonDates[commonDates.length - 1] ?? ymd(Date.now());

  const portfolioValue = nav.length > 0 ? nav[nav.length - 1] : cash;
  const lastDate = commonDates[commonDates.length - 1];
  const latestPositions = pricedSymbols.map((s) => ({
    value: (sharesBySymbol.get(s) ?? 0) * (bySymbol.get(s)!.get(lastDate) ?? 0),
  }));
  const exp = exposures(latestPositions, portfolioValue);

  const rfPct = avKey ? await fetchRiskFreeRatePct(avKey) : null;

  let annRetPct: number | null = null;
  let annVolPct: number | null = null;
  let sharpe: number | null = null;
  let var95: { pct: number; dollars: number } | null = null;
  let var99: { pct: number; dollars: number } | null = null;
  if (sufficient) {
    const annRet = annualizedReturn(returns);
    const annVol = annualizedVolatility(returns);
    annRetPct = annRet * 100;
    annVolPct = annVol * 100;
    sharpe = rfPct != null ? sharpeRatio(annRet, rfPct / 100, annVol) : null;
    const v95 = historicalVaR(returns, 0.95, portfolioValue);
    const v99 = historicalVaR(returns, 0.99, portfolioValue);
    var95 = { pct: v95.pct * 100, dollars: v95.dollars };
    var99 = { pct: v99.pct * 100, dollars: v99.dollars };
  }

  const row = {
    as_of: asOf,
    lookback_days: nObs,
    full_year: fullYear,
    sufficient,
    annualized_return_pct: annRetPct,
    annualized_vol_pct: annVolPct,
    sharpe,
    risk_free_rate_pct: rfPct,
    rf_source: rfPct != null ? "Alpha Vantage 3-Month Treasury (DGS3MO)" : null,
    var95_pct: var95?.pct ?? null,
    var95_dollar: var95?.dollars ?? null,
    var99_pct: var99?.pct ?? null,
    var99_dollar: var99?.dollars ?? null,
    gross_exposure_pct: exp?.grossPct ?? null,
    net_exposure_pct: exp?.netPct ?? null,
    portfolio_value: portfolioValue,
    symbols_priced: pricedSymbols.length,
    computed_at: new Date().toISOString(),
  };
  const { error } = await supabaseAdmin
    .from("portfolio_risk_metrics")
    .upsert(row, { onConflict: "as_of" });
  if (error) throw new Error(error.message);

  return {
    asOf,
    observations: nObs,
    sufficient,
    fullYear,
    symbolsPriced: pricedSymbols.length,
    totalSymbols: symbols.length,
    riskFreePct: rfPct,
  };
}

async function getCashHoldings(supabaseAdmin: Admin): Promise<number> {
  try {
    const { data } = await supabaseAdmin
      .from("fund_stats")
      .select("cash_holdings")
      .eq("id", true)
      .maybeSingle();
    const c = Number(data?.cash_holdings);
    return isFinite(c) ? c : 0;
  } catch {
    return 0;
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/hooks/compute-risk")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expectedSecret = process.env.REFRESH_HOOK_SECRET?.trim();
        const provided = request.headers.get("x-refresh-secret")?.trim();
        if (!expectedSecret || !provided || provided !== expectedSecret) {
          return json({ ok: false, error: "Unauthorized" }, 401);
        }

        // TEMP diagnostic (auth-gated, no secrets): fingerprint the env this
        // deployment actually sees, to pinpoint an env misconfiguration.
        if (new URL(request.url).searchParams.get("diag") === "1") {
          const u = process.env.SUPABASE_URL ?? "";
          const sk = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
          return json({
            ok: true,
            diag: true,
            supabaseUrl: u,
            urlPresent: u.length > 0,
            serviceKeyPrefix: sk.slice(0, 12),
            serviceKeyLen: sk.length,
          });
        }

        const apiKey = process.env.POLYGON_API_KEY?.trim();
        if (!apiKey) return json({ ok: false, error: "POLYGON_API_KEY not configured" }, 500);
        const avKey = process.env.ALPHA_VANTAGE_API_KEY?.trim();
        const mode = new URL(request.url).searchParams.get("mode") ?? "daily";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const symbols = baseHoldings.map((h) => h.symbol);

        try {
          let ingest: Record<string, unknown>;
          if (mode === "backfill") {
            const written = await backfill(supabaseAdmin, symbols, apiKey);
            ingest = { mode, rowsWritten: written };
          } else {
            const appended = await appendLatestDay(supabaseAdmin, symbols, apiKey);
            ingest = { mode, appendedDate: appended.date, appendedCount: appended.count };
          }
          const metrics = await computeAndStore(supabaseAdmin, avKey);
          return json({ ok: true, ...ingest, ...metrics });
        } catch (e) {
          return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
        }
      },
    },
  },
});
