import { createServerFn } from "@tanstack/react-start";
import { computeAnalytics, type MonthlyPoint, type PerfAnalytics } from "@/lib/fund-analytics";

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

// MonthlyPoint and PerfAnalytics are defined in @/lib/fund-analytics, which
// holds the pure math so it can be reused per window and unit-tested without a
// Supabase client. Re-exported here for existing importers.
export type { MonthlyPoint, PerfAnalytics } from "@/lib/fund-analytics";

type MonthlyHistoryKpis = {
  /** null when there is less than a full 12-month window. */
  one_year_pct: number | null;
  /** null when there is less than a full 60-month window. */
  five_year_annualized_pct: number | null;
  inception_annualized_pct: number;
  max_drawdown_pct: number;
  bench_inception_annualized_pct: number;
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

        // A month with no benchmark row, or a null return_pct, is MISSING —
        // not a flat month. benchmark_monthly is written two rows at a time
        // and the earlier row's return_pct is null by construction, so gaps
        // are normal. Coercing them to 0 drew a flat segment on the SPY line
        // and, worse, fed beta / correlation / tracking error / alpha a
        // fabricated zero-return observation, biasing all four toward zero.
        const benchRow = benchMap.get(raw.month);
        const rawBenchRet = benchRow?.return_pct;
        const benchRet =
          rawBenchRet === null || rawBenchRet === undefined ? null : n(rawBenchRet) / 100;

        smifGrowth *= 1 + smifRet;
        if (benchRet !== null) benchGrowth *= 1 + benchRet;
        if (smifGrowth > smifPeak) smifPeak = smifGrowth;
        if (benchGrowth > benchPeak) benchPeak = benchGrowth;

        series.push({
          month: raw.month,
          smif_return_pct: smifRet * 100,
          bench_return_pct: benchRet === null ? null : benchRet * 100,
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

      // Both windows return null rather than a number when the history is too
      // short to support the label. slice(-12) on 6 months of data is 6 months,
      // and slice(-60) on 36 months annualized a three-year figure under a
      // "5Y Annualized" heading — a real number, quietly measuring something
      // other than what it claimed.
      const last12 = series.slice(-12);
      const oneYearPct =
        last12.length >= 12 ? (cumProd(last12, (p) => p.smif_return_pct) - 1) * 100 : null;

      const last60 = series.slice(-60);
      const fiveYearAnnPct =
        last60.length >= 60
          ? (Math.pow(
              cumProd(last60, (p) => p.smif_return_pct),
              12 / last60.length,
            ) -
              1) *
            100
          : null;

      const inceptionAnnPct =
        totalYears > 0 ? (Math.pow(last.smif_growth, 1 / totalYears) - 1) * 100 : 0;
      const benchInceptionAnnPct =
        totalYears > 0 ? (Math.pow(last.bench_growth, 1 / totalYears) - 1) * 100 : 0;

      const maxDD = series.reduce((m, p) => Math.min(m, p.smif_drawdown_pct), 0);

      // Risk & return analytics over the full series. /performance re-computes
      // these per selected window from `series` using the same pure helpers,
      // so this is the since-inception view.
      const analytics: PerfAnalytics = computeAnalytics(series);

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
