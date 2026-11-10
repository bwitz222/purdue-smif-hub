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
// sector breakdown (ssga.com SPY fund page, "Fund Sector Breakdown", as of
// 2026-10-19; sums to 99.99). GICS names map to this site's buckets:
// Information Technology -> Technology, Health Care -> Healthcare,
// Consumer Discretionary -> Consumer Cyclical, Consumer Staples -> Consumer
// Defensive. This is the FALLBACK: the daily refresh-etf-weights hook scrapes
// the same table into public.etf_sector_weights and the pages pass that in, so
// this only renders when the table is empty or unreadable.
export type EtfSectorWeights = Record<string, Record<string, number>>;

const ETF_SECTOR_WEIGHTS: EtfSectorWeights = {
  SPY: {
    Technology: 38.11,
    Financials: 11.7,
    "Communication Services": 9.7,
    Healthcare: 9.6,
    "Consumer Cyclical": 9.0,
    Industrials: 8.0,
    "Consumer Defensive": 4.8,
    Energy: 3.73,
    Utilities: 1.96,
    "Real Estate": 1.71,
    Materials: 1.68,
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

export type PortfolioSummary = {
  investedCapital: number;
  cashHoldings: number;
  portfolioValue: number;
  totalDayGain: number;
  totalDayChange: number;
  totalReturn: number;
  totalReturnPct: number;
  weightedBeta: number;
};

/**
 * Everything /holdings shows about the book, derived from one set of quotes:
 * positions with live value and weight, plus the summary KPIs. Day P&L derives
 * each position's prior value from (value / (1 + pct/100)), so the dollar and
 * percent day change share one base and their signs always agree.
 */
export function buildPortfolio(
  base: Holding[],
  quotes: Record<string, QuoteLike | undefined>,
  cashHoldings: number,
  fallbackBeta = 1,
): { holdings: Holding[]; summary: PortfolioSummary } {
  const updated = applyQuotes(base, quotes);
  const investedValue = updated.reduce((s, r) => s + r.value, 0);
  const priorInvested = updated.reduce((s, r) => {
    const q = quotes[r.symbol];
    if (!q) return s + r.value; // no quote: treat as unchanged
    return s + (1 + q.changePct / 100 !== 0 ? r.value / (1 + q.changePct / 100) : r.value);
  }, 0);
  const totalDayGain = investedValue - priorInvested;
  const portfolioValue = investedValue + cashHoldings;
  const costBasisTotal = updated.reduce((s, r) => s + r.costBasis, 0);
  const totalReturn = investedValue - costBasisTotal;
  return {
    holdings: updated.map((r) => ({
      ...r,
      allocation: portfolioValue > 0 ? (r.value / portfolioValue) * 100 : r.allocation,
    })),
    summary: {
      investedCapital: investedValue,
      cashHoldings,
      portfolioValue,
      totalDayGain,
      totalDayChange: priorInvested > 0 ? (totalDayGain / priorInvested) * 100 : 0,
      totalReturn,
      totalReturnPct: costBasisTotal > 0 ? (totalReturn / costBasisTotal) * 100 : 0,
      weightedBeta:
        investedValue > 0
          ? updated.reduce((s, r) => s + r.beta * r.value, 0) / investedValue
          : fallbackBeta,
    },
  };
}

/**
 * Best and worst day changes. The book is split in half rather than sliced from
 * both ends blind: with fewer than six positions the two windows would overlap
 * and one ticker could be listed as both a leader and a laggard.
 */
export function topMovers(holdings: Holding[], n = 3): { gainers: Holding[]; losers: Holding[] } {
  const sorted = [...holdings].sort((a, b) => b.dayChange - a.dayChange);
  const half = Math.min(n, Math.floor(sorted.length / 2));
  return { gainers: sorted.slice(0, half), losers: sorted.slice(sorted.length - half).reverse() };
}

// Sector breakdown in DOLLARS by industry, with SPY (or any ETF listed in
// ETF_SECTOR_WEIGHTS) split across its constituent sectors by weight.
function sectorDollarBreakdown(
  holdings: Holding[],
  etfWeights: EtfSectorWeights = ETF_SECTOR_WEIGHTS,
): Map<string, number> {
  const map = new Map<string, number>();
  holdings.forEach((h) => {
    const weights = etfWeights[h.symbol] ?? ETF_SECTOR_WEIGHTS[h.symbol];
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
export function sectorPercentBreakdown(
  holdings: Holding[],
  etfWeights: EtfSectorWeights = ETF_SECTOR_WEIGHTS,
): [string, number][] {
  const dollars = sectorDollarBreakdown(holdings, etfWeights);
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

// URL-safe id for a team name ("Healthcare & Utilities" -> "healthcare-utilities").
// /sectors puts it on each card as an anchor, and /holdings links to it.
export function teamSlug(team: string): string {
  return team
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Which coverage team owns an industry bucket, or undefined for an industry no
// team covers (the tests assert there are none among current holdings).
export function teamForIndustry(industry: string): string | undefined {
  return Object.entries(TEAM_INDUSTRIES).find(([, inds]) => inds.includes(industry))?.[0];
}

export type TeamAllocation = {
  team: string;
  industries: string[];
  /** Direct positions plus the team's share of ETF look-through. */
  dollars: number;
  pctOfInvested: number;
  /** Market value of the team's own single-name positions. */
  directDollars: number;
  /** The team's share of SPY (and any other look-through ETF). */
  etfDollars: number;
  /** Every direct position, largest first. ETFs are excluded: SPY has no single sector. */
  positions: Holding[];
  costBasis: number;
  /** Return on the direct positions only, in percent. */
  returnPct: number;
  /** First three of `positions`. */
  topHoldings: Holding[];
};

const isLookThroughEtf = (symbol: string, etfWeights: EtfSectorWeights) =>
  Boolean(etfWeights[symbol] ?? ETF_SECTOR_WEIGHTS[symbol]);

// Aggregates industries into coverage-team allocations. Uses the SAME
// sectorDollarBreakdown as /holdings so the numbers tie out: for every team,
// directDollars + etfDollars === dollars, and the teams sum to invested capital.
export function teamAllocations(
  holdings: Holding[],
  etfWeights: EtfSectorWeights = ETF_SECTOR_WEIGHTS,
): TeamAllocation[] {
  const dollarsByIndustry = sectorDollarBreakdown(holdings, etfWeights);
  const invested = holdings.reduce((s, h) => s + h.value, 0);
  return Object.entries(TEAM_INDUSTRIES).map(([team, industries]) => {
    const dollars = industries.reduce((s, ind) => s + (dollarsByIndustry.get(ind) || 0), 0);
    const positions = holdings
      .filter((h) => !isLookThroughEtf(h.symbol, etfWeights) && industries.includes(h.industry))
      .sort((a, b) => b.value - a.value);
    const directDollars = positions.reduce((s, h) => s + h.value, 0);
    const costBasis = positions.reduce((s, h) => s + h.costBasis, 0);
    return {
      team,
      industries,
      dollars,
      pctOfInvested: invested > 0 ? (dollars / invested) * 100 : 0,
      directDollars,
      etfDollars: Math.max(0, dollars - directDollars),
      positions,
      costBasis,
      returnPct: costBasis > 0 ? ((directDollars - costBasis) / costBasis) * 100 : 0,
      topHoldings: positions.slice(0, 3),
    };
  });
}

// Re-export baseHoldings for consumers that need the untouched static set.
export { baseHoldings };
