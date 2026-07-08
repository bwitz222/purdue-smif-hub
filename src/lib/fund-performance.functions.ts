import { createServerFn } from "@tanstack/react-start";

export type PerfRow = {
  year: number;
  smif_return: number;
  bench_return: number;
  is_audited: boolean;
};

export type PerfKpis = {
  one_year: number;
  five_year_annualized: number;
  inception_annualized: number;
};

export type FundPerformance = {
  rows: PerfRow[];
  kpis: PerfKpis | null;
  allAudited: boolean;
};

export const getFundPerformance = createServerFn({ method: "GET" }).handler(
  async (): Promise<FundPerformance | null> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const [{ data: rows, error: rowsErr }, { data: kpis, error: kpisErr }] = await Promise.all([
        supabaseAdmin
          .from("fund_performance")
          .select("year, smif_return, bench_return, is_audited")
          .order("year", { ascending: false }),
        supabaseAdmin
          .from("fund_performance_kpis")
          .select("one_year, five_year_annualized, inception_annualized")
          .eq("id", true)
          .maybeSingle(),
      ]);
      if (rowsErr || kpisErr) return null;
      const mapped: PerfRow[] = (rows ?? []).map((r) => ({
        year: Number(r.year),
        smif_return: Number(r.smif_return),
        bench_return: Number(r.bench_return),
        is_audited: Boolean(r.is_audited),
      }));
      const allAudited = mapped.length > 0 && mapped.every((r) => r.is_audited);
      return {
        rows: mapped,
        kpis: kpis
          ? {
              one_year: Number(kpis.one_year),
              five_year_annualized: Number(kpis.five_year_annualized),
              inception_annualized: Number(kpis.inception_annualized),
            }
          : null,
        allAudited,
      };
    } catch (e) {
      console.error("[fund-performance] fetch failed:", e);
      return null;
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Monthly history (since inception) + SPY total-return benchmark
// ─────────────────────────────────────────────────────────────────────────────

export type MonthlyPoint = {
  month: string; // YYYY-MM-DD (first of month)
  smif_return_pct: number; // monthly return, 0 for transition months
  bench_return_pct: number; // SPY total-return monthly, 0 if missing
  smif_growth: number; // cumulative growth-of-$1
  bench_growth: number; // cumulative growth-of-$1
  smif_drawdown_pct: number; // peak-to-current drawdown
  bench_drawdown_pct: number;
  is_transition: boolean;
};

export type MonthlyHistoryKpis = {
  one_year_pct: number;
  five_year_annualized_pct: number;
  inception_annualized_pct: number;
  max_drawdown_pct: number;
  bench_inception_annualized_pct: number;
};

// Risk & return analytics derived from the monthly return series. All percent
// figures are annualized where noted; ratios are dimensionless. Sharpe/Sortino
// assume a 0% risk-free rate; beta/alpha/correlation are vs the SPY total return.
export type PerfAnalytics = {
  cumulative_return_pct: number;
  annualized_return_pct: number;
  annualized_vol_pct: number;
  sharpe: number;
  sortino: number;
  beta: number;
  annualized_alpha_pct: number;
  tracking_error_pct: number;
  information_ratio: number;
  correlation: number;
  best_month_pct: number;
  worst_month_pct: number;
  positive_months_pct: number;
  observations: number;
};

export type FundMonthlyHistory = {
  series: MonthlyPoint[];
  inceptionMonth: string;
  lastMonth: string;
  kpis: MonthlyHistoryKpis;
  analytics: PerfAnalytics;
  benchSymbol: string;
};

type RawFundRow = {
  month: string;
  beginning_balance: number | string;
  market_change: number | string;
  dividends: number | string;
  interest: number | string;
  deposits: number | string;
  withdrawals: number | string;
  net_advisory_fees: number | string;
  ending_balance: number | string;
  is_transition: boolean;
};
type RawBenchRow = { month: string; close: number | string; return_pct: number | string | null };

function n(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const x = typeof v === "string" ? parseFloat(v) : v;
  return isFinite(x) ? x : 0;
}

export const getFundMonthlyHistory = createServerFn({ method: "GET" }).handler(
  async (): Promise<FundMonthlyHistory | null> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const [{ data: fund, error: fundErr }, { data: bench, error: benchErr }] = await Promise.all([
        supabaseAdmin
          .from("fund_monthly_history")
          .select(
            "month, beginning_balance, market_change, dividends, interest, deposits, withdrawals, net_advisory_fees, ending_balance, is_transition",
          )
          .order("month", { ascending: true }),
        supabaseAdmin
          .from("benchmark_monthly")
          .select("month, close, return_pct")
          .eq("symbol", "SPY")
          .order("month", { ascending: true }),
      ]);
      if (fundErr || benchErr || !fund || fund.length === 0) return null;

      const benchMap = new Map<string, RawBenchRow>();
      (bench ?? []).forEach((b) => benchMap.set(b.month, b as RawBenchRow));

      // Compute returns and cumulative growth.
      let smifGrowth = 1;
      let benchGrowth = 1;
      let smifPeak = 1;
      let benchPeak = 1;
      const series: MonthlyPoint[] = [];

      for (const raw of fund as RawFundRow[]) {
        const beg = n(raw.beginning_balance);
        const mc = n(raw.market_change);
        const div = n(raw.dividends);
        const intr = n(raw.interest);
        const dep = n(raw.deposits);
        const wd = n(raw.withdrawals);
        const fees = n(raw.net_advisory_fees);
        const end = n(raw.ending_balance);

        let smifRet = 0;
        if (!raw.is_transition && beg > 0) {
          const flows = dep - wd; // net external flows
          const investmentGain = mc + div + intr - fees;
          if (Math.abs(flows) < 1) {
            smifRet = investmentGain / beg;
          } else {
            // Modified Dietz: assume mid-month flows
            const denom = beg + 0.5 * flows;
            smifRet = denom > 0 ? (end - beg - flows) / denom : 0;
          }
        }

        const benchRow = benchMap.get(raw.month);
        const benchRet = benchRow ? n(benchRow.return_pct) / 100 : 0;

        smifGrowth *= 1 + smifRet;
        benchGrowth *= 1 + benchRet;
        if (smifGrowth > smifPeak) smifPeak = smifGrowth;
        if (benchGrowth > benchPeak) benchPeak = benchGrowth;

        series.push({
          month: raw.month,
          smif_return_pct: smifRet * 100,
          bench_return_pct: benchRet * 100,
          smif_growth: Number(smifGrowth.toFixed(4)),
          bench_growth: Number(benchGrowth.toFixed(4)),
          smif_drawdown_pct: Number((((smifGrowth - smifPeak) / smifPeak) * 100).toFixed(3)),
          bench_drawdown_pct: Number((((benchGrowth - benchPeak) / benchPeak) * 100).toFixed(3)),
          is_transition: !!raw.is_transition,
        });
      }

      // KPIs
      const last = series[series.length - 1];
      const first = series[0];
      const totalMonths = series.length;
      const totalYears = totalMonths / 12;

      const cumProd = (arr: MonthlyPoint[], pick: (p: MonthlyPoint) => number) =>
        arr.reduce((acc, p) => acc * (1 + pick(p) / 100), 1);

      const last12 = series.slice(-12);
      const oneYearPct = (cumProd(last12, (p) => p.smif_return_pct) - 1) * 100;

      const last60 = series.slice(-60);
      const fiveYearAnnPct =
        last60.length >= 12
          ? (Math.pow(cumProd(last60, (p) => p.smif_return_pct), 12 / last60.length) - 1) * 100
          : 0;

      const inceptionAnnPct =
        totalYears > 0 ? (Math.pow(last.smif_growth, 1 / totalYears) - 1) * 100 : 0;
      const benchInceptionAnnPct =
        totalYears > 0 ? (Math.pow(last.bench_growth, 1 / totalYears) - 1) * 100 : 0;

      const maxDD = series.reduce((m, p) => Math.min(m, p.smif_drawdown_pct), 0);

      // ── Risk & return analytics ──────────────────────────────────────────
      // Exclude custodian-transition bridge months (artificial 0% returns)
      // so volatility, beta, and the ratios reflect real market months only.
      const real = series.filter((p) => !p.is_transition);
      const rs = real.map((p) => p.smif_return_pct); // monthly %, SMIF
      const rb = real.map((p) => p.bench_return_pct); // monthly %, SPY total return
      const nObs = rs.length;

      const mean = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
      const sampVar = (a: number[]) => {
        if (a.length < 2) return 0;
        const m = mean(a);
        return a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1);
      };
      const std = (a: number[]) => Math.sqrt(sampVar(a));
      const cov = (a: number[], b: number[]) => {
        const nn = Math.min(a.length, b.length);
        if (nn < 2) return 0;
        const ma = mean(a);
        const mb = mean(b);
        let s = 0;
        for (let i = 0; i < nn; i++) s += (a[i] - ma) * (b[i] - mb);
        return s / (nn - 1);
      };

      const SQRT12 = Math.sqrt(12);
      const annVol = std(rs) * SQRT12; // %
      const smifAnn = inceptionAnnPct; // % (geometric, from cumulative growth)
      const benchAnn = benchInceptionAnnPct; // %
      const downsideDev =
        Math.sqrt(rs.reduce((s, x) => s + Math.min(0, x) * Math.min(0, x), 0) / (nObs || 1)) *
        SQRT12; // %
      const varB = sampVar(rb);
      const beta = varB > 0 ? cov(rs, rb) / varB : 0;
      const diff = rs.map((x, i) => x - (rb[i] ?? 0));
      const trackingError = std(diff) * SQRT12; // %
      const sdS = std(rs);
      const sdB = std(rb);
      const correlation = sdS > 0 && sdB > 0 ? cov(rs, rb) / (sdS * sdB) : 0;

      const analytics: PerfAnalytics = {
        cumulative_return_pct: (last.smif_growth - 1) * 100,
        annualized_return_pct: smifAnn,
        annualized_vol_pct: annVol,
        sharpe: annVol > 0 ? smifAnn / annVol : 0,
        sortino: downsideDev > 0 ? smifAnn / downsideDev : 0,
        beta,
        annualized_alpha_pct: smifAnn - beta * benchAnn,
        tracking_error_pct: trackingError,
        information_ratio: trackingError > 0 ? (smifAnn - benchAnn) / trackingError : 0,
        correlation,
        best_month_pct: nObs ? Math.max(...rs) : 0,
        worst_month_pct: nObs ? Math.min(...rs) : 0,
        positive_months_pct: nObs ? (rs.filter((x) => x > 0).length / nObs) * 100 : 0,
        observations: nObs,
      };

      return {
        series,
        inceptionMonth: first.month,
        lastMonth: last.month,
        benchSymbol: "SPY",
        analytics,
        kpis: {
          one_year_pct: oneYearPct,
          five_year_annualized_pct: fiveYearAnnPct,
          inception_annualized_pct: inceptionAnnPct,
          bench_inception_annualized_pct: benchInceptionAnnPct,
          max_drawdown_pct: maxDD,
        },
      };
    } catch (e) {
      console.error("[fund-monthly-history] fetch failed:", e);
      return null;
    }
  },
);
