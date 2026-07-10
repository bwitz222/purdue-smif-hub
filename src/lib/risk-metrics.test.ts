import { describe, it, expect } from "vitest";
import {
  dailyReturns,
  mean,
  sampleStdDev,
  annualizedVolatility,
  annualizedReturn,
  sharpeRatio,
  percentile,
  historicalVaR,
  exposures,
} from "./risk-metrics";

const approx = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;

describe("dailyReturns", () => {
  it("computes P_t/P_{t-1} - 1 and drops the first point", () => {
    const r = dailyReturns([100, 110, 99]);
    expect(r).toHaveLength(2);
    expect(r[0]).toBeCloseTo(0.1, 12);
    expect(r[1]).toBeCloseTo(-0.1, 12);
  });
  it("returns empty for <2 levels", () => {
    expect(dailyReturns([100])).toEqual([]);
    expect(dailyReturns([])).toEqual([]);
  });
  it("skips a non-positive prior price instead of dividing by zero", () => {
    const r = dailyReturns([0, 100, 110]);
    expect(r).toHaveLength(1);
    expect(r[0]).toBeCloseTo(0.1, 12);
  });
});

describe("mean / sampleStdDev", () => {
  it("mean of 1..5 is 3", () => expect(mean([1, 2, 3, 4, 5])).toBe(3));
  it("sample stddev of 1..5 is 1.5811388… (n-1 denominator)", () => {
    // var = (4+1+0+1+4)/(5-1) = 2.5 → sqrt = 1.5811388300841898
    expect(sampleStdDev([1, 2, 3, 4, 5])).toBeCloseTo(1.5811388300841898, 12);
  });
  it("stddev is 0 for <2 points", () => {
    expect(sampleStdDev([5])).toBe(0);
    expect(sampleStdDev([])).toBe(0);
  });
});

describe("annualizedVolatility", () => {
  it("scales daily stddev by sqrt(periodsPerYear)", () => {
    const r = [0.01, -0.01, 0.02, -0.02, 0.0];
    const daily = sampleStdDev(r);
    expect(annualizedVolatility(r, 252)).toBeCloseTo(daily * Math.sqrt(252), 12);
  });
});

describe("annualizedReturn", () => {
  it("geometric-compounds then annualizes (1 'year' => growth-1)", () => {
    // growth = 1.01*1.02*0.99 = 1.019898; periodsPerYear=3 => exponent 1
    expect(annualizedReturn([0.01, 0.02, -0.01], 3)).toBeCloseTo(0.019898, 9);
  });
  it("annualizes a partial window upward", () => {
    // 21 days of +0.1% -> growth 1.001^21, annualized ^(252/21=12)
    const r = Array(21).fill(0.001);
    const growth = Math.pow(1.001, 21);
    expect(annualizedReturn(r, 252)).toBeCloseTo(Math.pow(growth, 12) - 1, 9);
  });
  it("returns 0 for an empty series", () => expect(annualizedReturn([])).toBe(0));
});

describe("sharpeRatio", () => {
  it("(0.10 - 0.04) / 0.15 = 0.4", () => {
    expect(sharpeRatio(0.1, 0.04, 0.15)).toBeCloseTo(0.4, 12);
  });
  it("is null when volatility is 0 (undefined ratio, not Infinity)", () => {
    expect(sharpeRatio(0.1, 0.04, 0)).toBeNull();
  });
});

describe("percentile (R-7 interpolation)", () => {
  const xs = [-0.05, -0.04, -0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03, 0.04];
  it("5th percentile of the 10-point fixture interpolates to -0.0455", () => {
    // rank = 0.05*(10-1)=0.45 -> -0.05 + (-0.04 - -0.05)*0.45 = -0.0455
    expect(percentile(xs, 5)).toBeCloseTo(-0.0455, 12);
  });
  it("median of 1..4 is 2.5", () => expect(percentile([1, 2, 3, 4], 50)).toBeCloseTo(2.5, 12));
  it("0th and 100th are min and max", () => {
    expect(percentile(xs, 0)).toBe(-0.05);
    expect(percentile(xs, 100)).toBe(0.04);
  });
  it("does not mutate the input array", () => {
    const a = [3, 1, 2];
    percentile(a, 50);
    expect(a).toEqual([3, 1, 2]);
  });
});

describe("historicalVaR (historical simulation)", () => {
  const xs = [-0.05, -0.04, -0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03, 0.04];
  it("95% 1-day VaR = -1 x 5th-percentile x value (positive loss)", () => {
    const { pct, dollars } = historicalVaR(xs, 0.95, 1_000_000);
    expect(pct).toBeCloseTo(0.0455, 12); // -(-0.0455)
    expect(dollars).toBeCloseTo(45_500, 6);
  });
  it("99% VaR sits deeper in the tail than 95%", () => {
    const v95 = historicalVaR(xs, 0.95, 1_000_000).dollars;
    const v99 = historicalVaR(xs, 0.99, 1_000_000).dollars;
    expect(v99).toBeGreaterThan(v95);
  });
  it("floors to 0 loss when the tail percentile is non-negative", () => {
    const allUp = [0.01, 0.02, 0.03, 0.04, 0.05];
    expect(historicalVaR(allUp, 0.95, 1_000_000).pct).toBe(0);
  });
});

describe("exposures", () => {
  it("long-only with cash: gross = net < 100% by the cash weight", () => {
    // two longs summing 300 against NAV 400 (100 cash) -> 75% / 75%
    const e = exposures([{ value: 100 }, { value: 200 }], 400)!;
    expect(e.grossPct).toBeCloseTo(75, 12);
    expect(e.netPct).toBeCloseTo(75, 12);
  });
  it("long/short book: gross adds magnitudes, net subtracts (signed)", () => {
    const e = exposures([{ value: 100 }, { value: -50 }], 100)!;
    expect(e.grossPct).toBeCloseTo(150, 12); // (100+50)/100
    expect(e.netPct).toBeCloseTo(50, 12); //   (100-50)/100
  });
  it("honors an explicit short side even with positive value", () => {
    const e = exposures([{ value: 100, side: "long" }, { value: 50, side: "short" }], 100)!;
    expect(e.grossPct).toBeCloseTo(150, 12);
    expect(e.netPct).toBeCloseTo(50, 12);
  });
  it("returns null when NAV <= 0", () => {
    expect(exposures([{ value: 100 }], 0)).toBeNull();
  });
});

// Guards the sign of the whole VaR pipeline end-to-end: a mostly-down series
// must produce a positive loss number.
describe("integration sanity", () => {
  it("VaR of a left-skewed series is a positive dollar loss", () => {
    const r = [...Array(95).fill(0.001), ...Array(5).fill(-0.06)];
    const { pct, dollars } = historicalVaR(r, 0.95, 500_000);
    expect(pct).toBeGreaterThan(0);
    expect(dollars).toBeGreaterThan(0);
    expect(approx(dollars, pct * 500_000)).toBe(true);
  });
});
