import { describe, expect, it } from "vitest";
import { holdings } from "@/data/holdings";
import {
  TEAM_INDUSTRIES,
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
