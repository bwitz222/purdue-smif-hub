import { describe, it, expect } from "vitest";
import {
  rebaseSeries,
  computeAnalytics,
  computeWindowStats,
  WINDOW_MONTHS,
  type MonthlyPoint,
} from "./fund-analytics";

/**
 * The trap these tests exist for: smif_growth is cumulative FROM INCEPTION, so
 * a trailing window that slices it without re-basing starts the chart at
 * whatever $1 had already become and reports a drawdown whose peak was set
 * before the window opened.
 */

/** Build a series from monthly % returns, exactly the way the loader does. */
function build(returns: Array<{ smif: number; bench?: number | null; transition?: boolean }>) {
  let smifGrowth = 1;
  let benchGrowth = 1;
  let smifPeak = 1;
  let benchPeak = 1;
  return returns.map((r, i) => {
    const bench = r.bench === undefined ? r.smif : r.bench;
    smifGrowth *= 1 + r.smif / 100;
    if (bench !== null) benchGrowth *= 1 + bench / 100;
    if (smifGrowth > smifPeak) smifPeak = smifGrowth;
    if (benchGrowth > benchPeak) benchPeak = benchGrowth;
    const month = `${2000 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}-01`;
    return {
      month,
      smif_return_pct: r.smif,
      bench_return_pct: bench,
      smif_growth: Number(smifGrowth.toFixed(4)),
      bench_growth: Number(benchGrowth.toFixed(4)),
      smif_drawdown_pct: Number((((smifGrowth - smifPeak) / smifPeak) * 100).toFixed(3)),
      bench_drawdown_pct: Number((((benchGrowth - benchPeak) / benchPeak) * 100).toFixed(3)),
      is_transition: !!r.transition,
    } satisfies MonthlyPoint;
  });
}

const flat = (n: number, pct: number) => Array.from({ length: n }, () => ({ smif: pct }));

describe("rebaseSeries", () => {
  it("starts the window at the window's own first month, not at inception", () => {
    // +10%/mo for 24 months. $1 is already 1.10^12 by the time month 13 opens.
    const full = build(flat(24, 10));
    const win = rebaseSeries(full, 12);

    expect(win).toHaveLength(12);
    // First month of the window shows one month of growth, not thirteen.
    expect(win[0].smif_growth).toBeCloseTo(1.1, 3);
    // Last month shows 12 months of growth, not 24.
    expect(win[win.length - 1].smif_growth).toBeCloseTo(Math.pow(1.1, 12), 2);
    // Sanity: the un-rebased series really had grown much further.
    expect(full[full.length - 1].smif_growth).toBeCloseTo(Math.pow(1.1, 24), 1);
  });

  it("is an identity on growth when the window opens at inception", () => {
    const full = build(flat(10, 3));
    const win = rebaseSeries(full, 0);
    expect(win.map((p) => p.smif_growth)).toEqual(full.map((p) => p.smif_growth));
  });

  it("resets the drawdown peak to the window, so an earlier peak is not inherited", () => {
    // A big run-up, a crash, then a flat stretch. The all-time peak is set in
    // month 1-3; the trailing window opens after the crash has already landed.
    const full = build([
      { smif: 100 },
      { smif: 100 },
      { smif: -50 },
      { smif: 0 },
      { smif: 0 },
      { smif: 0 },
    ]);
    // All-time: peaked at 4.0, fell to 2.0 -> -50%.
    expect(Math.min(...full.map((p) => p.smif_drawdown_pct))).toBeCloseTo(-50, 1);

    // Window covering only the flat tail has no drawdown at all.
    const win = rebaseSeries(full, 3);
    expect(Math.min(...win.map((p) => p.smif_drawdown_pct))).toBeCloseTo(0, 3);
  });

  it("re-bases the benchmark on its own base, independently of the fund", () => {
    const full = build([
      { smif: 50, bench: 10 },
      { smif: 0, bench: 0 },
      { smif: 10, bench: 20 },
    ]);
    const win = rebaseSeries(full, 2);
    expect(win[0].smif_growth).toBeCloseTo(1.1, 3);
    expect(win[0].bench_growth).toBeCloseTo(1.2, 3);
  });
});

describe("computeWindowStats", () => {
  it("returns null rather than mislabelling a window the history cannot support", () => {
    const short = build(flat(36, 1));
    // 36 months of history cannot produce a 5Y figure.
    expect(computeWindowStats(short, 60)).toBeNull();
    // ...but the since-inception window is always available.
    expect(computeWindowStats(short, null)).not.toBeNull();
  });

  it("takes exactly the trailing N months", () => {
    const full = build(flat(120, 1));
    const w = computeWindowStats(full, WINDOW_MONTHS["5y"])!;
    expect(w.months).toBe(60);
    expect(w.series[0].month).toBe(full[60].month);
    expect(w.series[w.series.length - 1].month).toBe(full[119].month);
  });

  it("reports max drawdown within the window, not all time", () => {
    const full = build([...[{ smif: 100 }, { smif: -60 }], ...flat(70, 0)]);
    const inception = computeWindowStats(full, null)!;
    const fiveY = computeWindowStats(full, 60)!;
    expect(inception.max_drawdown_pct).toBeCloseTo(-60, 1);
    expect(fiveY.max_drawdown_pct).toBeCloseTo(0, 3);
  });

  it("annualizes the window over the window's own length", () => {
    // 10%/yr compounded monthly-equivalent over 120 months; the trailing 60
    // months annualize to the same rate as the full period when it is constant.
    const monthly = (Math.pow(1.1, 1 / 12) - 1) * 100;
    const full = build(flat(120, monthly));
    const inception = computeWindowStats(full, null)!;
    const fiveY = computeWindowStats(full, 60)!;
    expect(inception.analytics.annualized_return_pct).toBeCloseTo(10, 1);
    expect(fiveY.analytics.annualized_return_pct).toBeCloseTo(10, 1);
    // Cumulative, by contrast, must differ: ~159% vs ~61%.
    expect(inception.analytics.cumulative_return_pct).toBeCloseTo(159.37, 0);
    expect(fiveY.analytics.cumulative_return_pct).toBeCloseTo(61.05, 0);
  });
});

describe("computeAnalytics", () => {
  it("excludes custodian-transition months from the return statistics", () => {
    const withTransition = build([
      { smif: 5 },
      { smif: -3 },
      { smif: 0, transition: true },
      { smif: 4 },
    ]);
    const a = computeAnalytics(withTransition);
    // 4 months in the series, 3 real observations.
    expect(a.observations).toBe(3);
    // The artificial 0% month must not count as a non-positive real month.
    expect(a.positive_months_pct).toBeCloseTo((2 / 3) * 100, 6);
    expect(a.worst_month_pct).toBeCloseTo(-3, 6);
  });

  it("ignores months where the benchmark did not report when pairing", () => {
    // A missing benchmark month coerced to 0% would drag beta toward zero.
    const paired = build([
      { smif: 4, bench: 2 },
      { smif: -2, bench: -1 },
      { smif: 6, bench: 3 },
      { smif: -4, bench: -2 },
    ]);
    const withGap = build([
      { smif: 4, bench: 2 },
      { smif: -2, bench: -1 },
      { smif: 6, bench: 3 },
      { smif: -4, bench: -2 },
      { smif: 8, bench: null },
    ]);
    // The fund returns exactly 2x the benchmark, so beta is 2 either way.
    expect(computeAnalytics(paired).beta).toBeCloseTo(2, 6);
    expect(computeAnalytics(withGap).beta).toBeCloseTo(2, 6);
    expect(computeAnalytics(withGap).correlation).toBeCloseTo(1, 6);
  });

  it("reports zero alpha when the fund tracks the benchmark exactly", () => {
    const identical = build([{ smif: 3 }, { smif: -2 }, { smif: 5 }, { smif: 1 }]);
    const a = computeAnalytics(identical);
    expect(a.beta).toBeCloseTo(1, 6);
    expect(a.annualized_alpha_pct).toBeCloseTo(0, 6);
    expect(a.tracking_error_pct).toBeCloseTo(0, 6);
  });
});
