// Pure performance math over the monthly return series, split out of
// fund-performance.functions.ts so the same code can measure more than one
// window. No Supabase, no server-fn wrapper — importable from components and
// directly unit-testable.
//
// The one thing to be careful about here: `smif_growth` and `bench_growth` on
// a MonthlyPoint are cumulative FROM INCEPTION. A trailing window cannot just
// slice them, or the chart starts at whatever $1 had already become and the
// drawdown line inherits a peak set years before the window opened. Every
// window therefore re-bases growth to 1.00 at its first month and recomputes
// its own running peak — see rebaseSeries below.

export type MonthlyPoint = {
  month: string; // YYYY-MM-DD (first of month)
  smif_return_pct: number; // monthly return, 0 for transition months
  /** SPY total-return monthly %. null when that month has no benchmark row. */
  bench_return_pct: number | null;
  smif_growth: number; // cumulative growth-of-$1
  bench_growth: number; // cumulative growth-of-$1
  smif_drawdown_pct: number; // peak-to-current drawdown
  bench_drawdown_pct: number;
  is_transition: boolean;
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

export type WindowStats = {
  /** The window's months, with growth re-based and drawdown recomputed. */
  series: MonthlyPoint[];
  analytics: PerfAnalytics;
  /** Deepest drawdown WITHIN the window, not the all-time figure. */
  max_drawdown_pct: number;
  /** Annualized SPY total return over the same months, for the spread. */
  bench_annualized_pct: number;
  months: number;
};

export type PerfWindow = "5y" | "inception";

/** Trailing months per window. null = the whole series. */
export const WINDOW_MONTHS: Record<PerfWindow, number | null> = {
  "5y": 60,
  inception: null,
};

export const WINDOW_LABEL: Record<PerfWindow, string> = {
  "5y": "Trailing 5 years",
  inception: "Since inception",
};

// ── helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Re-base a slice so growth starts at 1.00 on its first month and the drawdown
 * peak is measured only within the slice.
 *
 * `startIdx` is the index in `full` where the window opens. The divisor is the
 * cumulative growth of the month BEFORE it (1 when the window opens at
 * inception), because growth at index i already includes month i's return.
 */
export function rebaseSeries(full: MonthlyPoint[], startIdx: number): MonthlyPoint[] {
  const smifBase = startIdx > 0 ? full[startIdx - 1].smif_growth : 1;
  const benchBase = startIdx > 0 ? full[startIdx - 1].bench_growth : 1;
  // A zero base would only arise from corrupt data, but dividing by it would
  // poison the whole window with Infinity rather than failing visibly.
  const sDiv = smifBase > 0 ? smifBase : 1;
  const bDiv = benchBase > 0 ? benchBase : 1;

  let smifPeak = 1;
  let benchPeak = 1;
  return full.slice(startIdx).map((p) => {
    const smifGrowth = p.smif_growth / sDiv;
    const benchGrowth = p.bench_growth / bDiv;
    if (smifGrowth > smifPeak) smifPeak = smifGrowth;
    if (benchGrowth > benchPeak) benchPeak = benchGrowth;
    return {
      ...p,
      smif_growth: Number(smifGrowth.toFixed(4)),
      bench_growth: Number(benchGrowth.toFixed(4)),
      smif_drawdown_pct: Number((((smifGrowth - smifPeak) / smifPeak) * 100).toFixed(3)),
      bench_drawdown_pct: Number((((benchGrowth - benchPeak) / benchPeak) * 100).toFixed(3)),
    };
  });
}

/**
 * Analytics over an already-re-based window.
 *
 * Two rules carried over from the original inline implementation, both of
 * which were bug fixes:
 *   • Custodian-transition bridge months carry an artificial 0% return, so
 *     they are excluded from volatility, the ratios and the month counts.
 *   • Beta, correlation, tracking error and alpha are two-series statistics
 *     and use only months where BOTH series reported. Treating a missing
 *     benchmark month as a 0% observation biases all four toward zero.
 */
export function computeAnalytics(series: MonthlyPoint[]): PerfAnalytics {
  const last = series[series.length - 1];
  const totalYears = series.length / 12;

  const real = series.filter((p) => !p.is_transition);
  const rs = real.map((p) => p.smif_return_pct);
  const nObs = rs.length;

  const paired = real.filter(
    (p): p is MonthlyPoint & { bench_return_pct: number } => p.bench_return_pct !== null,
  );
  const ps = paired.map((p) => p.smif_return_pct);
  const rb = paired.map((p) => p.bench_return_pct);

  const smifAnn = totalYears > 0 ? (Math.pow(last.smif_growth, 1 / totalYears) - 1) * 100 : 0;
  const benchAnn = totalYears > 0 ? (Math.pow(last.bench_growth, 1 / totalYears) - 1) * 100 : 0;

  const annVol = std(rs) * SQRT12;
  const downsideDev =
    Math.sqrt(rs.reduce((s, x) => s + Math.min(0, x) * Math.min(0, x), 0) / (nObs || 1)) * SQRT12;

  const varB = sampVar(rb);
  const beta = varB > 0 ? cov(ps, rb) / varB : 0;
  const diff = ps.map((x, i) => x - rb[i]);
  const trackingError = std(diff) * SQRT12;
  const sdS = std(ps);
  const sdB = std(rb);
  const correlation = sdS > 0 && sdB > 0 ? cov(ps, rb) / (sdS * sdB) : 0;

  return {
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
}

/**
 * Full stats for one window, or null when the history is too short to support
 * the label.
 *
 * Returning null rather than a number matters: slicing the last 60 months off
 * a 36-month history and annualizing it produces a real-looking figure that is
 * quietly measuring a three-year period under a "5Y" heading.
 */
export function computeWindowStats(
  full: MonthlyPoint[],
  months: number | null,
): WindowStats | null {
  if (full.length === 0) return null;
  if (months !== null && full.length < months) return null;

  const startIdx = months === null ? 0 : full.length - months;
  const series = rebaseSeries(full, startIdx);
  const last = series[series.length - 1];
  const totalYears = series.length / 12;

  return {
    series,
    analytics: computeAnalytics(series),
    max_drawdown_pct: series.reduce((m, p) => Math.min(m, p.smif_drawdown_pct), 0),
    bench_annualized_pct:
      totalYears > 0 ? (Math.pow(last.bench_growth, 1 / totalYears) - 1) * 100 : 0,
    months: series.length,
  };
}
