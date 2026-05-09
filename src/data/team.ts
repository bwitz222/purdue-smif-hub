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
    name: name || "Open Position",
    role,
    year,
    placeholder: !name,
    bio: i === 0
      ? `Leads the ${team} team, driving sector strategy, idea generation, and final pitch review.`
      : `Covers names within the ${team} mandate. Builds full operating models, valuation, and pitches new ideas to the investment committee.`,
  }));

export const sectorTeams = [
  {
    name: "Information Technology",
    description: "Software, semiconductors, hardware, and IT services across mega-caps and emerging growth.",
    members: make("Information Technology", [
      ["Chris Andreou", "Sector Lead", ""],
      ["Parth Dama", "Senior Analyst", ""],
      ["Shaheera Ali", "Analyst", ""],
      ["Landon Haffner", "Analyst", ""],
      ["", "Analyst", ""],
    ]),
  },
  {
    name: "Consumer Discretionary",
    description: "Retail, autos, leisure, apparel, and other cyclical consumer names.",
    members: make("Consumer Discretionary", [
      ["Ayden Wong", "Sector Lead", ""],
      ["Riley Collins", "Senior Analyst", ""],
      ["Karanvir Singh", "Senior Analyst", ""],
      ["", "Analyst", ""],
      ["", "Analyst", ""],
    ]),
  },
  {
    name: "Financials",
    description: "Banks, insurers, asset managers, and capital markets infrastructure.",
    members: make("Financials", [
      ["Alex Belanger", "Sector Lead", ""],
      ["Daniel Friedman", "Senior Analyst", ""],
      ["", "Analyst", ""],
      ["", "Analyst", ""],
      ["", "Analyst", ""],
    ]),
  },
  {
    name: "Consumer Staples",
    description: "Food, beverage, household products, and other defensive consumer names.",
    members: make("Consumer Staples", [
      ["Evan Wright", "Sector Lead", ""],
      ["Logan Friedman", "Senior Analyst", ""],
      ["Mikhail Bilokin", "Analyst", ""],
      ["", "Analyst", ""],
      ["", "Analyst", ""],
    ]),
  },
  {
    name: "Industrials",
    description: "Aerospace & defense, machinery, transports, and capital goods.",
    members: make("Industrials", [
      ["Ian Teh", "Sector Lead", ""],
      ["Dallas White", "Senior Analyst", ""],
      ["Cooper Weiss", "Senior Analyst", ""],
      ["Augustus Matushek", "Senior Analyst", ""],
      ["", "Analyst", ""],
    ]),
  },
  {
    name: "Healthcare & Utilities",
    description: "Pharma, biotech, med-tech, managed care, and regulated utilities.",
    members: make("Healthcare & Utilities", [
      ["", "Sector Lead", ""],
      ["Gautham Santhanam", "Senior Analyst", ""],
      ["Brock Heller", "Senior Analyst", ""],
      ["Sid Voona", "Senior Analyst", ""],
      ["", "Analyst", ""],
    ]),
  },
  {
    name: "Communications",
    description: "Telecom, media, interactive entertainment, and select platform names.",
    members: make("Communications", [
      ["", "Sector Lead", ""],
      ["Gabriel Fridman", "Senior Analyst", ""],
      ["", "Analyst", ""],
      ["", "Analyst", ""],
      ["", "Analyst", ""],
    ]),
  },
  {
    name: "Energy & Real Estate",
    description: "Integrated energy, E&P, midstream, refiners, and listed real estate (REITs).",
    members: make("Energy & Real Estate", [
      ["Jacob George", "Sector Lead", ""],
      ["Alejandro Cabrales", "Senior Analyst", ""],
      ["Arav Ginde", "Senior Analyst", ""],
      ["Veer Sanyal", "Senior Analyst", ""],
      ["", "Analyst", ""],
    ]),
  },
];

export const fixedIncomeMacro: Member[] = make("Fixed Income & Macro", [
  ["Andrew Lacambra", "Head — Fixed Income & Macro", ""],
  ["Keren Wadhwani", "Senior Analyst — Rates", ""],
  ["Aditya Balaji", "Analyst — Credit", ""],
  ["Balthazar Schmit", "Analyst — FX & Macro", ""],
]);

export const portfolioManagers: Member[] = make("Portfolio + Risk Management", [
  ["Hunter Specht", "Lead Portfolio Manager", ""],
  ["Sandhya Gopinath", "Portfolio Manager", ""],
  ["Yashita Pujari", "Portfolio Manager — Risk", ""],
  ["Anushka Patel", "Portfolio Manager — Performance", ""],
  ["Abhipsa Prajapati", "Portfolio Manager — Trading", ""],
  ["", "Risk Analyst", ""],
]);
