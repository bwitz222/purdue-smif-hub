export type AlumniIndustry =
  | "Investment Banking"
  | "Private Equity / Credit"
  | "Hedge Funds"
  | "Asset & Wealth Management"
  | "Consulting"
  | "Corporate / Tech";

export interface Alumnus {
  name: string;
  gradYear: number;
  roleAtSMIF: string;
  currentTitle: string;
  currentCompany: string;
  industry: AlumniIndustry;
  location?: string;
  linkedin?: string;
  bio?: string;
  featured?: boolean;
  quote?: string;
}

// Placeholder roster — swap in real alumni as you collect them.
export const alumni: Alumnus[] = [
  { name: "Jordan Park",       gradYear: 2024, roleAtSMIF: "Co-President",                 currentTitle: "Investment Banking Analyst", currentCompany: "Morgan Stanley",          industry: "Investment Banking",        location: "New York, NY",   featured: true,  quote: "SMIF was the first place I learned that conviction has to be earned, not asserted.", bio: "Led the fund's strategic direction senior year after two years on the Industrials team. Now covers software M&A on Morgan Stanley's tech group." },
  { name: "Riya Shankar",      gradYear: 2024, roleAtSMIF: "Chief Investment Officer",     currentTitle: "Private Equity Associate",   currentCompany: "Vista Equity Partners",   industry: "Private Equity / Credit",   location: "Austin, TX",     featured: true,  quote: "Every pitch had to survive the room before it survived the market. That stuck with me.", bio: "CIO during the 2023-24 academic year. Joined Vista's flagship fund directly out of undergrad." },
  { name: "Ethan Walsh",       gradYear: 2023, roleAtSMIF: "Financials Sector Lead",       currentTitle: "Equity Research Associate",  currentCompany: "Barclays",                industry: "Investment Banking",        location: "New York, NY",                    bio: "Covers U.S. regional banks for Barclays equity research." },
  { name: "Megan Liu",         gradYear: 2023, roleAtSMIF: "Healthcare Senior Analyst",    currentTitle: "Investment Banking Analyst", currentCompany: "Goldman Sachs",           industry: "Investment Banking",        location: "New York, NY",                    bio: "Healthcare M&A coverage at Goldman after pitching three biotech names to the committee." },
  { name: "Daniel Okafor",     gradYear: 2023, roleAtSMIF: "Portfolio Manager",            currentTitle: "Macro Strategist",           currentCompany: "Bridgewater Associates",  industry: "Hedge Funds",               location: "Westport, CT",   featured: true,  quote: "The reps you put in at SMIF compound; by senior year you're already pattern-matching.", bio: "Built the original macro overlay framework still used by the FIM team today." },
  { name: "Sophia Kessler",    gradYear: 2022, roleAtSMIF: "Director of Education",        currentTitle: "Investment Associate",       currentCompany: "Blackstone",              industry: "Private Equity / Credit",   location: "New York, NY",                    bio: "Two years in Blackstone's tactical opportunities group after a stint in IB." },
  { name: "Marcus Chen",       gradYear: 2022, roleAtSMIF: "Industrials Sector Lead",      currentTitle: "Investment Banking Associate", currentCompany: "BMO Capital Markets",   industry: "Investment Banking",        location: "Chicago, IL"                                                                                                                                          },
  { name: "Anika Reddy",       gradYear: 2022, roleAtSMIF: "Consumer Senior Analyst",      currentTitle: "Strategy Consultant",        currentCompany: "Bain & Company",          industry: "Consulting",                location: "Chicago, IL"                                                                                                                                          },
  { name: "Tyler Brennan",     gradYear: 2021, roleAtSMIF: "Energy Sector Lead",           currentTitle: "Investment Banking Associate", currentCompany: "Citi",                   industry: "Investment Banking",        location: "Houston, TX"                                                                                                                                          },
  { name: "Hannah Mendoza",    gradYear: 2021, roleAtSMIF: "Tech Senior Analyst",          currentTitle: "Senior Product Manager",     currentCompany: "Microsoft",               industry: "Corporate / Tech",          location: "Seattle, WA"                                                                                                                                          },
  { name: "Kevin Yamada",      gradYear: 2021, roleAtSMIF: "Fixed Income Lead",            currentTitle: "Credit Analyst",             currentCompany: "PIMCO",                   industry: "Asset & Wealth Management", location: "Newport Beach, CA"                                                                                                                                    },
  { name: "Olivia Petrov",     gradYear: 2020, roleAtSMIF: "Co-President",                 currentTitle: "VP, Investment Banking",     currentCompany: "Wells Fargo",             industry: "Investment Banking",        location: "Charlotte, NC",                   bio: "Promoted to VP in the Wells Fargo financial sponsors group in 2025." },
  { name: "Brandon Carrillo",  gradYear: 2020, roleAtSMIF: "Healthcare Sector Lead",       currentTitle: "Investment Associate",       currentCompany: "KKR",                     industry: "Private Equity / Credit",   location: "New York, NY"                                                                                                                                          },
  { name: "Lauren Petersen",   gradYear: 2019, roleAtSMIF: "CIO",                          currentTitle: "Equity Research VP",          currentCompany: "JPMorgan",                industry: "Investment Banking",        location: "New York, NY"                                                                                                                                          },
  { name: "Nathan Brooks",     gradYear: 2019, roleAtSMIF: "Consumer Sector Lead",         currentTitle: "Senior Associate",            currentCompany: "Deloitte",                industry: "Consulting",                location: "Chicago, IL"                                                                                                                                          },
  { name: "Priya Venkatesh",   gradYear: 2018, roleAtSMIF: "Tech Sector Lead",             currentTitle: "Strategy & Operations Lead",  currentCompany: "Google",                  industry: "Corporate / Tech",          location: "Mountain View, CA"                                                                                                                                    },
  { name: "Connor Reilly",     gradYear: 2018, roleAtSMIF: "Financials Senior Analyst",    currentTitle: "Portfolio Manager",           currentCompany: "Fidelity Investments",    industry: "Asset & Wealth Management", location: "Boston, MA"                                                                                                                                           },
  { name: "Isabella Romero",   gradYear: 2017, roleAtSMIF: "Director of Operations",       currentTitle: "Investment Banking VP",       currentCompany: "Lazard",                  industry: "Investment Banking",        location: "New York, NY"                                                                                                                                          },
  { name: "Aaron Kowalski",    gradYear: 2017, roleAtSMIF: "Industrials Senior Analyst",   currentTitle: "Director, Corporate Dev.",    currentCompany: "Caterpillar",             industry: "Corporate / Tech",          location: "Peoria, IL"                                                                                                                                            },
  { name: "Vanessa Howell",    gradYear: 2016, roleAtSMIF: "Co-President",                 currentTitle: "Principal",                   currentCompany: "GTCR",                    industry: "Private Equity / Credit",   location: "Chicago, IL"                                                                                                                                          },
  { name: "Sean McCarthy",     gradYear: 2016, roleAtSMIF: "Energy Senior Analyst",        currentTitle: "Senior Research Analyst",     currentCompany: "Citadel",                 industry: "Hedge Funds",               location: "Chicago, IL"                                                                                                                                          },
  { name: "Grace Kim",         gradYear: 2015, roleAtSMIF: "CIO",                          currentTitle: "Managing Consultant",         currentCompany: "McKinsey & Company",      industry: "Consulting",                location: "New York, NY"                                                                                                                                          },
  { name: "Robert Tanaka",     gradYear: 2015, roleAtSMIF: "Portfolio Manager",            currentTitle: "Director, Investments",       currentCompany: "Northern Trust",          industry: "Asset & Wealth Management", location: "Chicago, IL"                                                                                                                                          },
  { name: "Emily Schroeder",   gradYear: 2014, roleAtSMIF: "Founding Treasurer",           currentTitle: "Investment Director",         currentCompany: "BlackRock",               industry: "Asset & Wealth Management", location: "New York, NY",                    bio: "One of the fund's earliest treasurers. Now leads multi-asset solutions at BlackRock." },
];

export const placementFirms: { name: string; category: AlumniIndustry; count: number }[] = [
  { name: "Goldman Sachs",          category: "Investment Banking",        count: 3 },
  { name: "Morgan Stanley",         category: "Investment Banking",        count: 4 },
  { name: "JPMorgan",               category: "Investment Banking",        count: 3 },
  { name: "Barclays",               category: "Investment Banking",        count: 2 },
  { name: "Citi",                   category: "Investment Banking",        count: 2 },
  { name: "Wells Fargo",            category: "Investment Banking",        count: 3 },
  { name: "BMO Capital Markets",    category: "Investment Banking",        count: 2 },
  { name: "Lazard",                 category: "Investment Banking",        count: 1 },
  { name: "Blackstone",             category: "Private Equity / Credit",   count: 2 },
  { name: "KKR",                    category: "Private Equity / Credit",   count: 1 },
  { name: "Vista Equity Partners",  category: "Private Equity / Credit",   count: 1 },
  { name: "GTCR",                   category: "Private Equity / Credit",   count: 1 },
  { name: "Citadel",                category: "Hedge Funds",               count: 2 },
  { name: "Bridgewater",            category: "Hedge Funds",               count: 1 },
  { name: "BlackRock",              category: "Asset & Wealth Management", count: 2 },
  { name: "PIMCO",                  category: "Asset & Wealth Management", count: 1 },
  { name: "Fidelity",               category: "Asset & Wealth Management", count: 2 },
  { name: "Northern Trust",         category: "Asset & Wealth Management", count: 1 },
  { name: "McKinsey & Company",     category: "Consulting",                count: 2 },
  { name: "Bain & Company",         category: "Consulting",                count: 1 },
  { name: "Deloitte",               category: "Consulting",                count: 3 },
  { name: "Google",                 category: "Corporate / Tech",          count: 1 },
  { name: "Microsoft",              category: "Corporate / Tech",          count: 1 },
  { name: "Caterpillar",            category: "Corporate / Tech",          count: 2 },
];

export const placementCategories: AlumniIndustry[] = [
  "Investment Banking",
  "Private Equity / Credit",
  "Hedge Funds",
  "Asset & Wealth Management",
  "Consulting",
  "Corporate / Tech",
];
