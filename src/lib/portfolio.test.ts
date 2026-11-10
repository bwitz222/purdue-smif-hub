import { describe, expect, it } from "vitest";
import { holdings } from "@/data/holdings";
import {
  TEAM_INDUSTRIES,
  buildPortfolio,
  topMovers,
  sectorPercentBreakdown,
  teamAllocations,
  teamForIndustry,
  teamSlug,
} from "@/lib/portfolio";

// The /sectors cards and the /holdings sector allocation are two views of one
// book. These tests keep them from drifting apart.
describe("team allocations tie to holdings", () => {
  const teams = teamAllocations(holdings);
  const invested = holdings.reduce((s, h) => s + h.value, 0);

  it("every non-ETF holding belongs to exactly one coverage team", () => {
    for (const h of holdings.filter((x) => x.industry !== "ETF")) {
      expect(teamForIndustry(h.industry), `${h.symbol} (${h.industry})`).toBeDefined();
    }
  });

  it("no industry is claimed by two teams", () => {
    const all = Object.values(TEAM_INDUSTRIES).flat();
    expect(new Set(all).size).toBe(all.length);
  });

  it("teams sum to invested capital", () => {
    const total = teams.reduce((s, t) => s + t.dollars, 0);
    expect(total).toBeCloseTo(invested, 4);
    expect(teams.reduce((s, t) => s + t.pctOfInvested, 0)).toBeCloseTo(100, 4);
  });

  it("direct plus look-through equals the team total", () => {
    for (const t of teams) expect(t.directDollars + t.etfDollars).toBeCloseTo(t.dollars, 4);
  });

  it("every direct position appears in exactly one team's list", () => {
    const listed = teams.flatMap((t) => t.positions.map((p) => p.symbol));
    const direct = holdings.filter((h) => h.industry !== "ETF").map((h) => h.symbol);
    expect([...listed].sort()).toEqual([...direct].sort());
  });

  it("matches the industry rows of the holdings sector allocation", () => {
    const byIndustry = new Map(sectorPercentBreakdown(holdings));
    for (const t of teams) {
      const fromIndustries = t.industries.reduce((s, i) => s + (byIndustry.get(i) ?? 0), 0);
      expect(t.pctOfInvested).toBeCloseTo(fromIndustries, 6);
    }
  });
});

describe("teamSlug", () => {
  it("produces stable anchors", () => {
    expect(teamSlug("Healthcare & Utilities")).toBe("healthcare-utilities");
    expect(teamSlug("Energy & Real Estate")).toBe("energy-real-estate");
    expect(teamSlug("Information Technology")).toBe("information-technology");
  });
});

describe("buildPortfolio", () => {
  const symbols = holdings.map((h) => h.symbol);
  // +2% on every name, so the expected day change is easy to state.
  const quotes = Object.fromEntries(
    holdings.map((h) => [h.symbol, { price: h.price, changePct: 2 }]),
  );

  it("weights positions against portfolio value, cash included", () => {
    const { holdings: rows, summary } = buildPortfolio(holdings, quotes, 10_000);
    expect(summary.portfolioValue).toBeCloseTo(summary.investedCapital + 10_000, 6);
    const weights = rows.reduce((s, r) => s + r.allocation, 0);
    const cashWeight = (10_000 / summary.portfolioValue) * 100;
    expect(weights + cashWeight).toBeCloseTo(100, 6);
  });

  it("day P&L dollars and percent share one base and one sign", () => {
    const { summary } = buildPortfolio(holdings, quotes, 0);
    expect(summary.totalDayChange).toBeCloseTo(2, 6);
    expect(Math.sign(summary.totalDayGain)).toBe(Math.sign(summary.totalDayChange));
  });

  it("treats a position with no quote as unchanged", () => {
    const partial = { [symbols[0]]: { price: holdings[0].price, changePct: 5 } };
    const { summary } = buildPortfolio(holdings, partial, 0);
    expect(summary.totalDayGain).toBeGreaterThan(0);
    expect(summary.totalDayChange).toBeLessThan(5);
  });

  it("return is value minus cost basis", () => {
    const { summary, holdings: rows } = buildPortfolio(holdings, quotes, 0);
    const cost = rows.reduce((s, r) => s + r.costBasis, 0);
    expect(summary.totalReturn).toBeCloseTo(summary.investedCapital - cost, 6);
  });
});

describe("topMovers", () => {
  const mk = (symbol: string, dayChange: number) => ({ ...holdings[0], symbol, dayChange });
  it("never lists a ticker as both leader and laggard", () => {
    const { gainers, losers } = topMovers([mk("A", 3), mk("B", 1), mk("C", -2)]);
    const both = gainers.filter((g) => losers.some((l) => l.symbol === g.symbol));
    expect(both).toHaveLength(0);
  });
  it("orders leaders high to low and laggards low to high", () => {
    const rows = ["A", "B", "C", "D", "E", "F", "G"].map((s, i) => mk(s, 3 - i));
    const { gainers, losers } = topMovers(rows);
    expect(gainers.map((g) => g.symbol)).toEqual(["A", "B", "C"]);
    expect(losers.map((l) => l.symbol)).toEqual(["G", "F", "E"]);
  });
});
