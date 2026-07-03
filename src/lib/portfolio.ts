// Shared portfolio math used by /holdings and /sectors so the two pages
// can't drift apart. Given the static baseHoldings (shares × cost basis)
// and a symbol->quote map, this computes:
//   • updated holdings with live value
//   • sector allocation of INVESTED capital (industries), attributing SPY
//     across sectors via the ETF weights map
// Team-level aggregation (e.g. "Healthcare & Utilities" = Healthcare +
// Utilities) is layered on top by consumers using TEAM_INDUSTRIES below.

import { holdings as baseHoldings, type Holding } from "@/data/holdings";

// SPY sector weights (%) — hardcoded snapshot of State Street's published
// sector breakdown. Refresh periodically (roughly once per year, or when SPY
// re-composition materially moves any sector by >0.5pp) so the fund's
// look-through sector allocation stays honest.
export const ETF_SECTOR_WEIGHTS: Record<string, Record<string, number>> = {
  SPY: {
    Technology: 33.5,
    Financials: 13.5,
    "Consumer Cyclical": 10.5,
    Healthcare: 10.0,
    "Communication Services": 9.5,
    Industrials: 8.5,
    "Consumer Defensive": 5.5,
    Energy: 3.0,
    Utilities: 2.5,
    "Real Estate": 2.0,
    Materials: 1.5,
  },
};

export type QuoteLike = { price: number; changePct: number };

export function applyQuotes(
  base: Holding[],
  quotes: Record<string, QuoteLike | undefined>,
): Holding[] {
  return base.map((h) => {
    const q = quotes[h.symbol];
    if (!q) return h;
    const price = q.price;
    const value = price * h.shares;
    const totalReturn = value - h.costBasis;
    const returnPct = h.costBasis > 0 ? (totalReturn / h.costBasis) * 100 : 0;
    const dayChange = q.changePct;
    const priorValue = 1 + dayChange / 100 !== 0 ? value / (1 + dayChange / 100) : value;
    const dayGain = value - priorValue;
    return { ...h, price, value, totalReturn, returnPct, dayChange, dayGain };
  });
}

// Sector breakdown in DOLLARS by industry, with SPY (or any ETF listed in
// ETF_SECTOR_WEIGHTS) split across its constituent sectors by weight.
export function sectorDollarBreakdown(holdings: Holding[]): Map<string, number> {
  const map = new Map<string, number>();
  holdings.forEach((h) => {
    const weights = ETF_SECTOR_WEIGHTS[h.symbol];
    if (weights) {
      const total = Object.values(weights).reduce((s, w) => s + w, 0);
      Object.entries(weights).forEach(([sec, w]) => {
        map.set(sec, (map.get(sec) || 0) + h.value * (w / total));
      });
    } else {
      map.set(h.industry, (map.get(h.industry) || 0) + h.value);
    }
  });
  return map;
}

// Convenience: returns [industry, pctOfInvested] tuples sorted desc.
export function sectorPercentBreakdown(holdings: Holding[]): [string, number][] {
  const dollars = sectorDollarBreakdown(holdings);
  const invested = holdings.reduce((s, h) => s + h.value, 0);
  return Array.from(dollars.entries())
    .map(([s, v]) => [s, invested > 0 ? (v / invested) * 100 : 0] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}

// Coverage team → the industry buckets it owns. Kept in one place so
// /sectors and /team can't disagree with /holdings on which sector owns
// which industries. Combined teams collapse multiple industries.
export const TEAM_INDUSTRIES: Record<string, string[]> = {
  "Information Technology": ["Technology"],
  "Healthcare & Utilities": ["Healthcare", "Utilities"],
  Financials: ["Financials"],
  "Consumer Discretionary": ["Consumer Cyclical"],
  "Consumer Staples": ["Consumer Defensive"],
  Industrials: ["Industrials", "Materials"],
  "Energy & Real Estate": ["Energy", "Real Estate"],
  Communications: ["Communication Services"],
};

export type TeamAllocation = {
  team: string;
  industries: string[];
  dollars: number;
  pctOfInvested: number;
  topHoldings: Holding[]; // top by value, excludes ETFs (SPY)
};

// Aggregates industries into coverage-team allocations. Uses the SAME
// sectorDollarBreakdown as /holdings so the numbers tie out. Top holdings
// list is drawn from direct (non-ETF) positions only, since SPY has no
// single sector.
export function teamAllocations(holdings: Holding[]): TeamAllocation[] {
  const dollarsByIndustry = sectorDollarBreakdown(holdings);
  const invested = holdings.reduce((s, h) => s + h.value, 0);
  return Object.entries(TEAM_INDUSTRIES).map(([team, industries]) => {
    const dollars = industries.reduce((s, ind) => s + (dollarsByIndustry.get(ind) || 0), 0);
    const direct = holdings
      .filter((h) => !ETF_SECTOR_WEIGHTS[h.symbol] && industries.includes(h.industry))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
    return {
      team,
      industries,
      dollars,
      pctOfInvested: invested > 0 ? (dollars / invested) * 100 : 0,
      topHoldings: direct,
    };
  });
}

// Re-export baseHoldings for consumers that need the untouched static set.
export { baseHoldings };
