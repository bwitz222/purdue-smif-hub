import type { Member } from "@/components/MemberCard";

export const board: Member[] = [
  { name: "Aaron Mitchell", role: "President", year: "Senior · Finance", bio: "Leads the fund's strategic direction and oversees executive operations. Previously interned in equity research at a bulge-bracket bank." },
  { name: "Priya Shah", role: "Chief Investment Officer", year: "Senior · Quantitative Finance", bio: "Drives portfolio strategy and final investment decisions across all sectors. Focused on factor-based and quantitative approaches." },
  { name: "Marcus Chen", role: "VP, Research", year: "Junior · Economics", bio: "Coordinates fundamental research processes and pitch quality across the eight sector teams." },
  { name: "Elena Rodríguez", role: "VP, Risk Management", year: "Senior · Industrial Engineering", bio: "Owns portfolio risk monitoring, factor exposure analysis, and the fund's drawdown framework." },
  { name: "Tyler Brooks", role: "VP, Recruiting", year: "Junior · Finance", bio: "Manages the analyst recruitment pipeline, interviews, and onboarding for new members each semester." },
  { name: "Anjali Patel", role: "Treasurer", year: "Junior · Accounting", bio: "Oversees fund accounting, cash management, and reporting to the Daniels School and university stakeholders." },
  { name: "Jordan Williams", role: "VP, Education", year: "Senior · Finance & Computer Science", bio: "Designs the analyst training curriculum, including modeling bootcamps and weekly research workshops." },
];

const make = (
  team: string,
  members: Array<[string, string, string]>,
): Member[] =>
  members.map(([name, role, year], i) => ({
    name,
    role,
    year,
    bio: i === 0
      ? `Leads the ${team} team, driving sector strategy, idea generation, and final pitch review.`
      : `Covers names within the ${team} mandate. Builds full operating models, valuation, and pitches new ideas to the investment committee.`,
  }));

export const sectorTeams = [
  {
    name: "Information Technology",
    description: "Software, semiconductors, hardware, and IT services across mega-caps and emerging growth.",
    members: make("Information Technology", [
      ["Daniel Park", "Sector Head — IT", "Senior · Computer Science"],
      ["Ria Krishnan", "Senior Analyst", "Junior · Finance"],
      ["Sam O'Connor", "Analyst", "Sophomore · Economics"],
      ["Maya Thompson", "Analyst", "Sophomore · Finance"],
      ["Lucas Hwang", "Analyst", "Junior · Industrial Engineering"],
    ]),
  },
  {
    name: "Healthcare & Utilities",
    description: "Pharma, biotech, med-tech, managed care, and regulated utilities.",
    members: make("Healthcare & Utilities", [
      ["Olivia Bennett", "Sector Head — Healthcare & Utilities", "Senior · Biology & Finance"],
      ["Nikhil Rao", "Senior Analyst", "Junior · Finance"],
      ["Hannah Wu", "Analyst", "Sophomore · Pharmacy"],
      ["Caleb Foster", "Analyst", "Junior · Economics"],
      ["Ava Lindgren", "Analyst", "Sophomore · Finance"],
    ]),
  },
  {
    name: "Financials",
    description: "Banks, insurers, asset managers, and capital markets infrastructure.",
    members: make("Financials", [
      ["Ethan Caldwell", "Sector Head — Financials", "Senior · Finance"],
      ["Sofia Marín", "Senior Analyst", "Junior · Accounting"],
      ["Jacob Reyes", "Analyst", "Sophomore · Finance"],
      ["Grace Nakamura", "Analyst", "Junior · Economics"],
      ["Owen Patel", "Analyst", "Sophomore · Finance"],
    ]),
  },
  {
    name: "Consumer Discretionary",
    description: "Retail, autos, leisure, apparel, and other cyclical consumer names.",
    members: make("Consumer Discretionary", [
      ["Isabella Ross", "Sector Head — Consumer Discretionary", "Senior · Marketing & Finance"],
      ["Aiden Sharma", "Senior Analyst", "Junior · Finance"],
      ["Zoë Carter", "Analyst", "Sophomore · Economics"],
      ["Mateo Alvarez", "Analyst", "Sophomore · Finance"],
      ["Chloe Davies", "Analyst", "Junior · Supply Chain"],
    ]),
  },
  {
    name: "Consumer Staples",
    description: "Food, beverage, household products, and other defensive consumer names.",
    members: make("Consumer Staples", [
      ["Madison Clarke", "Sector Head — Consumer Staples", "Senior · Finance"],
      ["Ravi Iyer", "Senior Analyst", "Junior · Economics"],
      ["Ella Berg", "Analyst", "Sophomore · Finance"],
      ["Tomás Rivera", "Analyst", "Sophomore · Supply Chain"],
      ["Hana Suzuki", "Analyst", "Junior · Marketing"],
    ]),
  },
  {
    name: "Industrials",
    description: "Aerospace & defense, machinery, transports, and capital goods.",
    members: make("Industrials", [
      ["Noah Brennan", "Sector Head — Industrials", "Senior · Mechanical Engineering"],
      ["Layla Hassan", "Senior Analyst", "Junior · Finance"],
      ["Ryan O'Sullivan", "Analyst", "Sophomore · Industrial Engineering"],
      ["Kira Yamamoto", "Analyst", "Junior · Economics"],
      ["Diego Fuentes", "Analyst", "Sophomore · Finance"],
    ]),
  },
  {
    name: "Energy & Real Estate",
    description: "Integrated energy, E&P, midstream, refiners, and listed real estate (REITs).",
    members: make("Energy & Real Estate", [
      ["Henry Whitfield", "Sector Head — Energy & Real Estate", "Senior · Chemical Engineering"],
      ["Amara Okafor", "Senior Analyst", "Junior · Economics"],
      ["Liam Garrett", "Analyst", "Sophomore · Finance"],
      ["Yara Haddad", "Analyst", "Junior · Industrial Engineering"],
      ["Theo Larsen", "Analyst", "Sophomore · Real Estate"],
    ]),
  },
  {
    name: "Communications",
    description: "Telecom, media, interactive entertainment, and select platform names.",
    members: make("Communications", [
      ["Benjamin Foley", "Sector Head — Communications", "Senior · Finance"],
      ["Tessa Nguyen", "Senior Analyst", "Junior · Economics"],
      ["Marcus Hill", "Analyst", "Sophomore · Marketing"],
      ["Naomi Becker", "Analyst", "Junior · Finance"],
      ["Felix Andersson", "Analyst", "Sophomore · Communications"],
    ]),
  },
];

export const fixedIncomeMacro: Member[] = make("Fixed Income & Macro", [
  ["Vikram Desai", "Head — Fixed Income & Macro", "Senior · Quantitative Finance"],
  ["Helena Sokolov", "Senior Analyst — Rates", "Junior · Economics"],
  ["Amir Kassem", "Analyst — Credit", "Sophomore · Finance"],
  ["Brielle Tanaka", "Analyst — FX & Macro", "Junior · Economics"],
  ["Caden Murphy", "Analyst — Macro", "Sophomore · Mathematics"],
  ["Sienna Walsh", "Analyst — Credit", "Sophomore · Finance"],
]);

export const portfolioManagers: Member[] = make("Portfolio + Risk Management", [
  ["Logan Pierce", "Lead Portfolio Manager", "Senior · Finance"],
  ["Isabel Moreno", "Portfolio Manager", "Senior · Quantitative Finance"],
  ["Connor Bishop", "Portfolio Manager — Risk", "Senior · Industrial Engineering"],
  ["Priscilla Adeyemi", "Portfolio Manager — Performance", "Junior · Finance"],
  ["Nathan Cole", "Portfolio Manager — Trading", "Junior · Economics"],
  ["Mira Saleh", "Risk Analyst", "Junior · Finance"],
]);
