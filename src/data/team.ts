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

type Entry = [name: string, role: string, email?: string, gradYear?: string];

const make = (team: string, members: Entry[]): Member[] =>
  members.map(([name, role, email, gradYear], i) => ({
    name: name || "Open Position",
    role,
    year: gradYear ? `Class of ${gradYear}` : "",
    email: email || undefined,
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
      ["Chris Andreou", "Sector Lead", "andreou@purdue.edu", "2028"],
      ["Parth Dama", "Senior Analyst", "damap@purdue.edu", "2029"],
      ["Shaheera Ali", "Analyst", "ali251@purdue.edu", "2028"],
      ["Landon Haffner", "Analyst", "haffnel@purdue.edu", "2029"],
      ["", "Analyst"],
    ]),
  },
  {
    name: "Consumer Discretionary",
    description: "Retail, autos, leisure, apparel, and other cyclical consumer names.",
    members: make("Consumer Discretionary", [
      ["Ayden Wong", "Sector Lead", "wong482@purdue.edu", "2028"],
      ["Riley Collins", "Senior Analyst", "colli571@purdue.edu", "2028"],
      ["Karanvir Singh", "Senior Analyst", "sing2553@purdue.edu", "2028"],
      ["", "Analyst"],
      ["", "Analyst"],
    ]),
  },
  {
    name: "Financials",
    description: "Banks, insurers, asset managers, and capital markets infrastructure.",
    members: make("Financials", [
      ["Alex Belanger", "Sector Lead", "belangea@purdue.edu", "2027"],
      ["Daniel Friedman", "Senior Analyst", "friedmd@purdue.edu", "Dec 2026"],
      ["", "Analyst"],
      ["", "Analyst"],
      ["", "Analyst"],
    ]),
  },
  {
    name: "Consumer Staples",
    description: "Food, beverage, household products, and other defensive consumer names.",
    members: make("Consumer Staples", [
      ["Evan Wright", "Sector Lead", "wrigh712@purdue.edu", "2027"],
      ["Logan Friedman", "Senior Analyst", "friedml@purdue.edu", "2028"],
      ["Mikhail Bilokin", "Analyst", "mbilokin@purdue.edu", "2029"],
      ["", "Analyst"],
      ["", "Analyst"],
    ]),
  },
  {
    name: "Industrials",
    description: "Aerospace & defense, machinery, transports, and capital goods.",
    members: make("Industrials", [
      ["Ian Teh", "Sector Lead", "iteh@purdue.edu", "2027"],
      ["Dallas White", "Senior Analyst", "whit1259@purdue.edu", "2029"],
      ["Cooper Weiss", "Senior Analyst", "weiss109@purdue.edu", "2028"],
      ["Augustus Matushek", "Senior Analyst", "amatush@purdue.edu", "2029"],
      ["Fabian Segura Vargas", "Analyst", "fsegurav@purdue.edu", "2028"],
    ]),
  },
  {
    name: "Healthcare & Utilities",
    description: "Pharma, biotech, med-tech, managed care, and regulated utilities.",
    members: make("Healthcare & Utilities", [
      ["", "Sector Lead"],
      ["Gautham Santhanam", "Senior Analyst", "gsanthan@purdue.edu", "2028"],
      ["Brock Heller", "Senior Analyst", "baheller@purdue.edu", "2027"],
      ["Sid Voona", "Senior Analyst", "voona@purdue.edu", "2028"],
      ["", "Analyst"],
    ]),
  },
  {
    name: "Communications",
    description: "Telecom, media, interactive entertainment, and select platform names.",
    members: make("Communications", [
      ["", "Sector Lead"],
      ["Gabriel Fridman", "Senior Analyst", "gfridman@purdue.edu", "2028"],
      ["", "Analyst"],
      ["", "Analyst"],
      ["", "Analyst"],
    ]),
  },
  {
    name: "Energy & Real Estate",
    description: "Integrated energy, E&P, midstream, refiners, and listed real estate (REITs).",
    members: make("Energy & Real Estate", [
      ["Jacob George", "Sector Lead", "georg243@purdue.edu", "2029"],
      ["Alejandro Cabrales", "Senior Analyst", "acabrale@purdue.edu", "2028"],
      ["Arav Ginde", "Senior Analyst", "aginde@purdue.edu", "2027"],
      ["Veer Sanyal", "Senior Analyst", "vsanyal@purdue.edu", "2028"],
      ["", "Analyst"],
    ]),
  },
];

export const fixedIncomeMacro: Member[] = make("Fixed Income & Macro", [
  ["Andrew Lacambra", "Head — Fixed Income & Macro", "alacambr@purdue.edu", "2027"],
  ["Keren Wadhwani", "Senior Analyst — Rates", "kwadhwan@purdue.edu", "2028"],
  ["Aditya Balaji", "Analyst — Credit", "balaji57@purdue.edu", "2028"],
  ["Balthazar Schmit", "Analyst — FX & Macro", "bschm@purdue.edu", "2028"],
]);

export const portfolioManagers: Member[] = make("Portfolio + Risk Management", [
  ["Hunter Specht", "Lead Portfolio Manager", "hspecht@purdue.edu", "2027"],
  ["Sandhya Gopinath", "Portfolio Manager", "sgopinat@purdue.edu", "2028"],
  ["Yashita Pujari", "Portfolio Manager — Risk", "ypujari@purdue.edu", "2028"],
  ["Anushka Patel", "Portfolio Manager — Performance", "pate3115@purdue.edu", "2029"],
  ["Abhipsa Prajapati", "Portfolio Manager — Trading", "aprajap@purdue.edu", "2029"],
  ["", "Risk Analyst"],
]);
