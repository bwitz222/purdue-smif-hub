import { describe, it, expect } from "vitest";
import { formatAumK, baselineAumDisplay } from "./portfolio";
import { holdings, portfolioSummary } from "@/data/holdings";

describe("formatAumK", () => {
  it("rounds to the nearest thousand", () => {
    expect(formatAumK(637507.5)).toBe("$638K");
    expect(formatAumK(637499)).toBe("$637K");
    expect(formatAumK(1000)).toBe("$1K");
  });

  it("groups thousands once the figure passes a million", () => {
    expect(formatAumK(1_250_000)).toBe("$1,250K");
  });

  it("handles zero without producing a negative or empty string", () => {
    expect(formatAumK(0)).toBe("$0K");
  });
});

/**
 * These guard the offline fallback shown on the home route.
 *
 * FALLBACK_STATS.aum_display is derived from portfolioSummary rather than
 * typed by hand, precisely so it cannot drift away from the positions the
 * site lists. That only holds while portfolioSummary itself agrees with the
 * holdings table, so assert the chain end to end: edit one position without
 * updating the summary and these fail rather than silently shipping a stale
 * "last known" number.
 */
describe("committed portfolio baseline", () => {
  it("investedCapital equals the sum of holding values", () => {
    const sum = holdings.reduce((acc, h) => acc + h.value, 0);
    // Cent-level tolerance: the table carries values rounded to the cent.
    expect(Math.abs(sum - portfolioSummary.investedCapital)).toBeLessThan(0.01);
  });

  it("portfolioValue equals invested capital plus cash", () => {
    const total = portfolioSummary.investedCapital + portfolioSummary.cashHoldings;
    expect(Math.abs(total - portfolioSummary.portfolioValue)).toBeLessThan(0.01);
  });

  it("baselineAumDisplay tracks the committed portfolio value", () => {
    expect(baselineAumDisplay).toBe(formatAumK(portfolioSummary.portfolioValue));
  });

  it("allocations sum to the invested share of the portfolio, not to 100%", () => {
    // Each row's allocation is a percentage of TOTAL portfolio value, cash
    // included, so the positions alone sum to invested/total — currently
    // ~97.6%, with the ~2.4% remainder being cash. Tolerance covers the
    // per-row rounding to two decimals.
    const alloc = holdings.reduce((acc, h) => acc + h.allocation, 0);
    const investedShare =
      (portfolioSummary.investedCapital / portfolioSummary.portfolioValue) * 100;
    expect(Math.abs(alloc - investedShare)).toBeLessThan(0.25);
  });
});
