// Pure, dependency-free portfolio risk/return math.
//
// Nothing here does I/O or imports app code — every function is a plain
// transform over number arrays, unit-tested against hand-verified fixtures in
// risk-metrics.test.ts. The daily risk job
// (src/routes/api/public/hooks/compute-risk.ts) builds the portfolio NAV series
// and feeds it through these functions; the results are persisted to
// public.portfolio_risk_metrics and read by the holdings page.
//
// Conventions:
//   • Returns are simple daily returns (fractions, e.g. 0.012 = +1.2%).
//   • "Annualized" uses 252 trading days: vol × √252, geometric return ^(252/n).
//   • Percentiles use the R-7 / Excel PERCENTILE.INC linear-interpolation rule.
//   • VaR is historical simulation (empirical percentile of the return series),
//     returned as a POSITIVE loss magnitude.

export const TRADING_DAYS_PER_YEAR = 252;

/** Simple daily returns from a level/price series: r_t = P_t / P_{t-1} − 1. */
export function dailyReturns(levels: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1];
    if (prev > 0) out.push(levels[i] / prev - 1);
  }
  return out;
}

/** Arithmetic mean; 0 for an empty series. */
export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/** Sample standard deviation (Bessel-corrected, n−1). 0 for fewer than 2 points. */
export function sampleStdDev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = xs.reduce((s, x) => s + (x - m) * (x - m), 0) / (xs.length - 1);
  return Math.sqrt(v);
}

/** Annualized volatility = daily sample stddev × √(periodsPerYear). */
export function annualizedVolatility(
  returns: number[],
  periodsPerYear = TRADING_DAYS_PER_YEAR,
): number {
  return sampleStdDev(returns) * Math.sqrt(periodsPerYear);
}

/**
 * Annualized geometric return from a daily return series.
 * (∏(1 + r))^(periodsPerYear / n) − 1. Returns −1 if the book is wiped out.
 */
export function annualizedReturn(
  returns: number[],
  periodsPerYear = TRADING_DAYS_PER_YEAR,
): number {
  if (returns.length === 0) return 0;
  const growth = returns.reduce((g, r) => g * (1 + r), 1);
  if (growth <= 0) return -1;
  return Math.pow(growth, periodsPerYear / returns.length) - 1;
}

/**
 * Annualized Sharpe ratio: (R_p − R_f) / σ_annual. All inputs annualized
 * decimals. Returns null when volatility is 0 (ratio undefined) so callers
 * render "unavailable" rather than Infinity/NaN.
 */
export function sharpeRatio(
  annualizedReturnPct: number,
  riskFreeRate: number,
  annualizedVol: number,
): number | null {
  if (!(annualizedVol > 0)) return null;
  return (annualizedReturnPct - riskFreeRate) / annualizedVol;
}

/**
 * Percentile via linear interpolation between closest ranks (R-7 /
 * Excel PERCENTILE.INC). p in [0, 100]. NaN for an empty series.
 */
export function percentile(xs: number[], p: number): number {
  if (xs.length === 0) return NaN;
  if (xs.length === 1) return xs[0];
  const sorted = [...xs].sort((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (rank - lo);
}

/**
 * Historical-simulation VaR. Sorts the empirical return distribution and takes
 * the (1 − confidence) percentile, then applies it to portfolioValue.
 *   VaR = −1 × percentile(returns, (1−confidence)×100) × portfolioValue
 * Returned as a positive loss magnitude (pct and dollars). A non-negative tail
 * percentile (no loss at that quantile) floors to 0.
 */
export function historicalVaR(
  returns: number[],
  confidence: number,
  portfolioValue: number,
): { pct: number; dollars: number } {
  const q = percentile(returns, (1 - confidence) * 100);
  const lossPct = q < 0 ? -q : 0;
  return { pct: lossPct, dollars: lossPct * portfolioValue };
}

export type Position = { value: number; side?: "long" | "short" };

/**
 * Gross and net exposure as percentages of total portfolio value (NAV,
 * including cash). A position with negative value, or side "short", counts as
 * short.
 *   Gross = (Σ|long| + Σ|short|) / NAV × 100
 *   Net   = (Σ long − Σ short) / NAV × 100   (signed)
 * Returns null when NAV ≤ 0. For a long-only book that also holds cash, gross
 * and net are equal and below 100% by the cash weight.
 */
export function exposures(
  positions: Position[],
  totalPortfolioValue: number,
): { grossPct: number; netPct: number } | null {
  if (!(totalPortfolioValue > 0)) return null;
  let longV = 0;
  let shortV = 0;
  for (const p of positions) {
    if (p.side === "short" || p.value < 0) shortV += Math.abs(p.value);
    else longV += p.value;
  }
  return {
    grossPct: ((longV + shortV) / totalPortfolioValue) * 100,
    netPct: ((longV - shortV) / totalPortfolioValue) * 100,
  };
}
