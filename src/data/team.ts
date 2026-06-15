import type { Member } from "@/components/MemberCard";
import andrewLacambraPhoto from "@/assets/team/andrew-lacambra.jpg";
import ianTehPhoto from "@/assets/team/ian-teh.jpg";
import landonHaffnerPhoto from "@/assets/team/landon-haffner.jpg";
import yashitaPujariPhoto from "@/assets/team/yashita-pujari.jpg";
import chrisAndreouPhoto from "@/assets/team/chris-andreou.jpg";
import parthDamaPhoto from "@/assets/team/parth-dama.png";

const BIO_BY_NAME: Record<string, string> = {
  "Landon Haffner": "Landon Haffner is a sophomore in the Daniels School of Business, majoring in Finance with a minor in Real Estate Finance, Management Consulting and Entrepreneurship. He is interning at Lennar this summer in sales and land acquisition. In his free time, he enjoys going to the gym, golfing and playing rocket league with friends.",
  "Yashita Pujari": "Yashita Pujari is a junior in the Daniels School of Business, majoring in Business Analytics and Information Management. Outside of SMIF, she serves on the executive board of UR Global and will be a team lead for the Doster Leadership Conference. In her free time, she enjoys baking, reading and trying new restaurants.",
  "Chris Andreou": "Chris Andreou is a junior in the Daniels School of Business, majoring in Finance and Accounting. He has previously interned at Zurich Insurance as a Finance Intern. In his free time, he enjoys visiting new countries, weightlifting, playing basketball, and golfing.",
  "Parth Dama": "Parth Dama is a sophomore in the Purdue Integrated Business and Engineering (IBE) program. He is currently working as an Associate Consultant Intern at IBM in Data & AI, and is an incoming Markets Quantitative Analyst at Barclays for Summer 2027. In his free time, he enjoys lifting, playing poker, and watching basketball.",
  "Andrew Lacambra": "Andrew Lacambra is a senior in the Daniels School of Business, majoring in Finance and General Management. He previously interned at State Farm as a Fixed Income Investments Intern. In his free time, he enjoys visiting National Parks, going to the gym, and watching soccer & basketball.",
  "Ian Teh": "Ian Teh is a senior in the Daniels School of Business, majoring in Finance with a minor in Real Estate Finance. He has previously interned at CenterPoint Properties as a Capital Markets Summer Analyst. In his free time, he enjoys hiking, going to the gym, and cooking new cuisines.",
};

export const board: Member[] = [
  { name: "Andrew Lacambra", role: "Co-President", year: "Class of 2027", email: "alacambr@purdue.edu", photo: andrewLacambraPhoto, bio: BIO_BY_NAME["Andrew Lacambra"] },
  { name: "Ian Teh", role: "Co-President", year: "Class of 2027", email: "iteh@purdue.edu", photo: ianTehPhoto, bio: BIO_BY_NAME["Ian Teh"] },
  { name: "Hunter Specht", role: "Co-CIO & Co-Head of Education", year: "Class of 2027", email: "hspecht@purdue.edu", bio: "Drives portfolio strategy and final investment decisions across all sectors, and co-leads the analyst education curriculum." },
  { name: "Sandhya Gopinath", role: "Co-CIO & Co-Head of Education", year: "Class of 2028", email: "gopinas@purdue.edu", bio: "Drives portfolio strategy and final investment decisions across all sectors, and co-leads the analyst education curriculum." },
  { name: "Keren Wadhwani", role: "Treasurer and Director of Fundraising", year: "Class of 2028", email: "kwadhwan@purdue.edu", bio: "Oversees fund accounting, cash management, and leads fundraising efforts for the organization." },
  { name: "Chris Andreou", role: "Director of Talent and Operations", year: "Class of 2028", email: "andreou@purdue.edu", photo: chrisAndreouPhoto, bio: BIO_BY_NAME["Chris Andreou"] },
  { name: "Shaheera Ali", role: "Director of Marketing and Outreach", year: "Class of 2028", email: "ali251@purdue.edu", bio: "Leads marketing, branding, and external outreach for the fund." },
];


const PHOTO_BY_NAME: Record<string, string> = {
  "Andrew Lacambra": andrewLacambraPhoto,
  "Ian Teh": ianTehPhoto,
  "Landon Haffner": landonHaffnerPhoto,
  "Yashita Pujari": yashitaPujariPhoto,
  "Chris Andreou": chrisAndreouPhoto,
  "Parth Dama": parthDamaPhoto,
};

const PHOTO_POSITION_BY_NAME: Record<string, string> = {
  "Landon Haffner": "62% 37%",
  "Yashita Pujari": "center 22%",
};

const PHOTO_SCALE_BY_NAME: Record<string, number> = {
  "Landon Haffner": 1.45,
};

// Members listed on the executive board — for these, sector/PM team entries
// keep the generic stock bio so the personal bio only appears once (on the board).
const BOARD_NAMES = new Set(board.map((m) => m.name));

type Entry = [name: string, role: string, email?: string, gradYear?: string];

const make = (team: string, members: Entry[]): Member[] =>
  members.map(([name, role, email, gradYear], i) => ({
    name: name || "Open Position",
    role,
    year: gradYear ? `Class of ${gradYear}` : "",
    email: email || undefined,
    placeholder: !name,
    photo: name ? PHOTO_BY_NAME[name] : undefined,
    photoPosition: name ? PHOTO_POSITION_BY_NAME[name] : undefined,
    photoScale: name ? PHOTO_SCALE_BY_NAME[name] : undefined,
    bio: (name && BIO_BY_NAME[name] && !BOARD_NAMES.has(name))
      ? BIO_BY_NAME[name]
      : i === 0
        ? `Leads the ${team} team, driving sector strategy, idea generation, and final pitch review.`
        : `Covers names within the ${team} mandate. Builds full operating models, valuation, and pitches new ideas to the investment committee.`,
  }));

export const sectorTeams = [
  {
    name: "Information Technology",
    description: "Software, semiconductors, hardware, and IT services across mega-caps and emerging growth.",
    members: make("Information Technology", [
      ["Chris Andreou", "Head, Sector", "andreou@purdue.edu", "2028"],
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
      ["Ayden Wong", "Head, Sector", "wong482@purdue.edu", "2028"],
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
      ["Alex Belanger", "Head, Sector", "belangea@purdue.edu", "2027"],
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
      ["Evan Wright", "Head, Sector", "wrigh712@purdue.edu", "2027"],
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
      ["Ian Teh", "Head, Sector", "iteh@purdue.edu", "2027"],
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
      ["", "Head, Sector"],
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
      ["", "Head, Sector"],
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
      ["Jacob George", "Head, Sector", "georg243@purdue.edu", "2029"],
      ["Alejandro Cabrales", "Senior Analyst", "acabrale@purdue.edu", "2028"],
      ["Arav Ginde", "Senior Analyst", "aginde@purdue.edu", "2027"],
      ["Veer Sanyal", "Senior Analyst", "vsanyal@purdue.edu", "2028"],
      ["", "Analyst"],
    ]),
  },
];

export const fixedIncomeMacro: Member[] = make("Fixed Income & Macro", [
  ["Andrew Lacambra", "Head, Fixed Income & Macro", "alacambr@purdue.edu", "2027"],
  ["Keren Wadhwani", "Senior Analyst, Rates", "kwadhwan@purdue.edu", "2028"],
  ["Aditya Balaji", "Analyst, Credit", "balaji57@purdue.edu", "2028"],
  ["Balthazar Schmit", "Analyst, FX & Macro", "bschm@purdue.edu", "2028"],
]).map((m) => (m.name === "Andrew Lacambra" ? { ...m, photo: andrewLacambraPhoto } : m));

export const portfolioManagers: Member[] = make("Portfolio + Risk Management", [
  ["Hunter Specht", "Lead Portfolio Manager", "hspecht@purdue.edu", "2027"],
  ["Sandhya Gopinath", "Portfolio Manager", "gopinas@purdue.edu", "2028"],
  ["Yashita Pujari", "Portfolio Manager, Risk", "ypujari@purdue.edu", "2028"],
  ["Anushka Patel", "Portfolio Manager, Performance", "pate3115@purdue.edu", "2029"],
  ["Abhipsa Prajapati", "Portfolio Manager, Trading", "aprajap@purdue.edu", "2029"],
  ["", "Risk Analyst"],
]);

// LinkedIn profiles, keyed by name, applied across board, sector teams, FIM, and PM groups.
const LINKEDIN_BY_NAME: Record<string, string> = {
  "Gabriel Fridman": "https://www.linkedin.com/in/gabriel-fridman-a5732b242",
  "Fabian Segura Vargas": "https://www.linkedin.com/in/fabianseguravargas",
  "Ayden Wong": "https://www.linkedin.com/in/aydenwongzhifeng",
  "Karanvir Singh": "https://www.linkedin.com/in/karansingh70",
  "Riley Collins": "https://www.linkedin.com/in/riley-collins7",
  "Mikhail Bilokin": "https://www.linkedin.com/in/michael-bilokin",
  "Evan Wright": "https://www.linkedin.com/in/evan-wright-purdue",
  "Logan Friedman": "https://www.linkedin.com/in/loganfriedman",
  "Alex Belanger": "https://www.linkedin.com/in/belangeralexander",
  "Daniel Friedman": "https://www.linkedin.com/in/daniel-friedman-7072aa292",
  "Aditya Balaji": "https://www.linkedin.com/in/aditya-balaji-a5452b22a",
  "Balthazar Schmit": "https://www.linkedin.com/in/balthazarschmitt",
  "Andrew Lacambra": "https://www.linkedin.com/in/andrew-lacambra-241a96314",
  "Keren Wadhwani": "https://www.linkedin.com/in/keren-wadhwani",
  "Brock Heller": "https://www.linkedin.com/in/brock-heller",
  "Gautham Santhanam": "https://www.linkedin.com/in/gautham-santhanam",
  "Sid Voona": "https://www.linkedin.com/in/siddharth-voona-2b4b86344",
  "Ian Teh": "https://www.linkedin.com/in/ianteh2027",
  "Augustus Matushek": "https://www.linkedin.com/in/augustus-matushek",
  "Cooper Weiss": "https://www.linkedin.com/in/cooper-weiss-1a87a1350",
  "Dallas White": "https://www.linkedin.com/in/dallas-white-97037a378",
  "Shaheera Ali": "https://www.linkedin.com/in/shaheeraali",
  "Landon Haffner": "https://www.linkedin.com/in/landonhaffner",
  "Chris Andreou": "https://www.linkedin.com/in/c-andreou",
  "Parth Dama": "https://www.linkedin.com/in/parthdama",
  "Abhipsa Prajapati": "https://www.linkedin.com/in/abhipsa-prajapati-942755360",
  "Hunter Specht": "https://www.linkedin.com/in/hunterspecht",
  "Sandhya Gopinath": "https://www.linkedin.com/in/sandhya--gopinath",
  "Anushka Patel": "https://www.linkedin.com/in/anushka-patel-01a252277",
  "Yashita Pujari": "https://www.linkedin.com/in/yashitarpujari",
  "Jacob George": "https://www.linkedin.com/in/jacobmigeorge",
  "Alejandro Cabrales": "https://www.linkedin.com/in/alejandro-cabrales",
  "Arav Ginde": "https://www.linkedin.com/in/aravginde",
  "Veer Sanyal": "https://www.linkedin.com/in/veersanyal",
};

const attachLinkedIn = <T extends Member>(m: T): T =>
  LINKEDIN_BY_NAME[m.name] && !m.linkedin ? { ...m, linkedin: LINKEDIN_BY_NAME[m.name] } : m;

// Inject linkedin URLs into the exported collections so every group renders them.
board.forEach((m, i) => { board[i] = attachLinkedIn(m); });
fixedIncomeMacro.forEach((m, i) => { fixedIncomeMacro[i] = attachLinkedIn(m); });
portfolioManagers.forEach((m, i) => { portfolioManagers[i] = attachLinkedIn(m); });
sectorTeams.forEach((t) => { t.members.forEach((m, i) => { t.members[i] = attachLinkedIn(m); }); });
