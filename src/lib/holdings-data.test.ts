import { describe, it, expect } from "vitest";
import { holdings, portfolioSummary } from "../data/holdings";

/**
 * The static fallback summary is what /holdings renders whenever the live
 * quote fetch yields nothing, so it has to agree with its own position rows.
 * Two fields didn't: totalReturnPct was computed over portfolio value while
 * the page computes it over cost basis, and weightedBeta was simply stale.
 */
const sum = (f: (h: (typeof holdings)[number]) => number) => holdings.reduce((s, h) => s + f(h), 0);

const investedValue = sum((h) => h.value);
const costBasis = sum((h) => h.costBasis);

describe("portfolioSummary ties to its rows", () => {
  it("invested capital", () => {
    expect(portfolioSummary.investedCapital).toBeCloseTo(investedValue, 2);
  });

  it("portfolio value = invested + cash", () => {
    expect(portfolioSummary.portfolioValue).toBeCloseTo(investedValue + portfolioSummary.cashHoldings, 2);
  });

  it("day gain", () => {
    expect(portfolioSummary.totalDayGain).toBeCloseTo(sum((h) => h.dayGain), 2);
  });

  it("total return", () => {
    expect(portfolioSummary.totalReturn).toBeCloseTo(investedValue - costBasis, 2);
  });

  // holdings.tsx:214 — (totalReturn / costBasisTotal) * 100
  it("total return % is measured over cost basis, not portfolio value", () => {
    expect(portfolioSummary.totalReturnPct).toBeCloseTo(((investedValue - costBasis) / costBasis) * 100, 2);
  });

  // holdings.tsx:216 — value-weighted over invested value
  it("weighted beta", () => {
    expect(portfolioSummary.weightedBeta).toBeCloseTo(sum((h) => h.beta * h.value) / investedValue, 3);
  });
});

describe("each holding row is internally consistent", () => {
  it.each(holdings.map((h) => [h.symbol, h] as const))("%s", (_symbol, h) => {
    expect(h.shares * h.price).toBeCloseTo(h.value, 2);
    expect(h.value - h.costBasis).toBeCloseTo(h.totalReturn, 2);
    expect((h.totalReturn / h.costBasis) * 100).toBeCloseTo(h.returnPct, 1);
  });
});
