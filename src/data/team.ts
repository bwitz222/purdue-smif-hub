import type { Member } from "@/components/MemberCard";

export const board: Member[] = [
  { name: "Andrew Lacambra", role: "Co-President", year: "Class of 2027", email: "alacambr@purdue.edu", bio: "Co-leads the fund's strategic direction and executive operations alongside the other Co-President." },
  { name: "Ian Teh", role: "Co-President", year: "Class of 2027", email: "iteh@purdue.edu", bio: "Co-leads the fund's strategic direction and executive operations alongside the other Co-President." },
  { name: "Hunter Specht", role: "Co-CIO & Co-Head of Education", year: "Class of 2027", email: "hspecht@purdue.edu", bio: "Drives portfolio strategy and final investment decisions across all sectors, and co-leads the analyst education curriculum." },
  { name: "Sandhya Gopinath", role: "Co-CIO & Co-Head of Education", year: "Class of 2028", email: "gopinas@purdue.edu", bio: "Drives portfolio strategy and final investment decisions across all sectors, and co-leads the analyst education curriculum." },
  { name: "Keren Wadhwani", role: "Treasurer and Director of Fundraising", year: "Class of 2028", email: "kwadhwan@purdue.edu", bio: "Oversees fund accounting, cash management, and leads fundraising efforts for the organization." },
  { name: "Chris Andreou", role: "Director of Talent and Operations", year: "Class of 2028", email: "andreou@purdue.edu", bio: "Manages recruiting, onboarding, and day-to-day operations across the fund." },
  { name: "Shaheera Ali", role: "Director of Marketing and Outreach", year: "Class of 2028", email: "ali251@purdue.edu", bio: "Leads marketing, branding, and external outreach for the fund." },
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
      ["Fabian Segura Vargas", "Senior Analyst", "fsegurav@purdue.edu", "2028"],
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
      ["", "Analyst"],
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
  ["Sandhya Gopinath", "Portfolio Manager", "gopinas@purdue.edu", "2028"],
  ["Yashita Pujari", "Portfolio Manager — Risk", "ypujari@purdue.edu", "2028"],
  ["Anushka Patel", "Portfolio Manager — Performance", "pate3115@purdue.edu", "2029"],
  ["Abhipsa Prajapati", "Portfolio Manager — Trading", "aprajap@purdue.edu", "2029"],
  ["", "Risk Analyst"],
]);
