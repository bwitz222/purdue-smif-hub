// Facts about the fund that more than one page states: the employers its members
// go on to, the four-step decision process, and the investment policy summary.
// They live here so the home page, /about, and the explainer pages quote one
// source instead of retyping it.

/** Mirrors the logos in `placements-2026.png`. Kept as text because the logo
    wall is a single image — screen readers and crawlers cannot read it. */
export const PLACEMENT_FIRMS = [
  "Morgan Stanley",
  "Barclays",
  "BMO",
  "Wells Fargo",
  "Deloitte",
  "PwC",
  "EY",
  "Accenture",
  "Crowe",
  "MFS Investment Management",
  "Julius Bär",
  "CBRE",
  "Zurich Insurance",
  "Huntington Bank",
  "State Farm",
  "Simon Property Group",
  "IBM",
  "Caterpillar",
  "Cummins",
  "Northrop Grumman",
  "CenterPoint Energy",
  "NASA",
] as const;

export const PROCESS = [
  {
    n: "01",
    t: "Idea Generation",
    d: "Analysts screen their sectors for compelling setups: catalysts, mispricing, or structural change the market hasn't priced.",
  },
  {
    n: "02",
    t: "Deep Research",
    d: "Financial modeling, channel checks, and management review. Every assumption documented, every risk stress-tested.",
  },
  {
    n: "03",
    t: "Pitch & Debate",
    d: "Theses defended live before the full investment committee. Pushback is expected. Weak arguments don't survive.",
  },
  {
    n: "04",
    t: "Vote & Monitor",
    d: "Members vote. Accepted positions enter the real portfolio. Every holding reviewed quarterly against its original thesis.",
  },
];

export const IPS = [
  {
    t: "Objective",
    d: "Long-term capital appreciation benchmarked against the S&P 500, while providing an authentic asset-management learning experience.",
  },
  {
    t: "Eligible Universe",
    d: "Primarily U.S.-listed equities and fixed income; ADRs permitted. No options, futures, leverage, or short positions.",
  },
  {
    t: "Diversification",
    d: "Position sizes capped per name and per sector. Maintain meaningful exposure across all covered sectors.",
  },
  {
    t: "Risk Controls",
    d: "Ongoing monitoring of factor exposures, drawdowns, and concentration. Quarterly reviews with the faculty advisors.",
  },
  {
    t: "Decision Process",
    d: "Every trade requires a written thesis, valuation, and a majority vote of the investment committee.",
  },
  {
    t: "Reporting",
    d: "Performance and attribution reported each semester to the Daniels School and university stakeholders.",
  },
];
