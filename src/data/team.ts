import type { Member } from "@/components/MemberCard";
import andrewLacambraPhoto from "@/assets/team/andrew-lacambra.webp";
import ianTehPhoto from "@/assets/team/ian-teh.webp";
import landonHaffnerPhoto from "@/assets/team/landon-haffner.webp";
import yashitaPujariPhoto from "@/assets/team/yashita-pujari.webp";
import chrisAndreouPhoto from "@/assets/team/chris-andreou.webp";
import parthDamaPhoto from "@/assets/team/parth-dama.webp";
import mikhailBilokinPhoto from "@/assets/team/mikhail-bilokin.webp";
import balthazarSchmittPhoto from "@/assets/team/balthazar-schmitt.webp";
import augustusMatushekPhoto from "@/assets/team/augustus-matushek.webp";
import jacobGeorgePhoto from "@/assets/team/jacob-george.webp";
import dallasWhitePhoto from "@/assets/team/dallas-white.webp";
import kerenWadhwaniPhoto from "@/assets/team/keren-wadhwani.webp";
import loganFriedmanPhoto from "@/assets/team/logan-friedman.webp";
import evanWrightPhoto from "@/assets/team/evan-wright.webp";
import sidVoonaPhoto from "@/assets/team/sid-voona.webp";
import shaheeraAliPhoto from "@/assets/team/shaheera-ali.webp";
import sandhyaGopinathPhoto from "@/assets/team/sandhya-gopinath.webp";
import karanvirSinghPhoto from "@/assets/team/karanvir-singh.webp";
import aydenWongPhoto from "@/assets/team/ayden-wong.webp";
import gauthamSanthanamPhoto from "@/assets/team/gautham-santhanam.webp";

const BIO_BY_NAME: Record<string, string> = {
  "Landon Haffner": "Landon Haffner is a sophomore in the Daniels School of Business, majoring in Finance with a minor in Real Estate Finance, Management Consulting and Entrepreneurship. He is interning at Lennar this summer in sales and land acquisition. In his free time, he enjoys going to the gym, golfing and playing rocket league with friends.",
  "Yashita Pujari": "Yashita Pujari is a junior in the Daniels School of Business, majoring in Business Analytics and Information Management. Outside of SMIF, she serves on the executive board of UR Global and will be a team lead for the Doster Leadership Conference. In her free time, she enjoys baking, reading and trying new restaurants.",
  "Chris Andreou": "Chris Andreou is a junior in the Daniels School of Business, majoring in Finance and Accounting. He has previously interned at Zurich Insurance as a Finance Intern. In his free time, he enjoys visiting new countries, weightlifting, playing basketball, and golfing.",
  "Parth Dama": "Parth Dama is a sophomore in the Purdue Integrated Business and Engineering (IBE) program. He is currently working as an Associate Consultant Intern at IBM in Data & AI, and is an incoming Markets Quantitative Analyst at Barclays for Summer 2027. In his free time, he enjoys lifting, playing poker, and watching basketball.",
  "Andrew Lacambra": "Andrew Lacambra is a senior in the Daniels School of Business, majoring in Finance and General Management. He previously interned at State Farm as a Fixed Income Investments Intern. In his free time, he enjoys visiting National Parks, going to the gym, and watching soccer & basketball.",
  "Ian Teh": "Ian Teh is a senior in the Daniels School of Business, majoring in Finance with a minor in Real Estate Finance. He has previously interned at CenterPoint Properties as a Capital Markets Summer Analyst. In his free time, he enjoys hiking, going to the gym, and cooking new cuisines.",
  "Mikhail Bilokin": "Michael Bilokin is a sophomore in the Daniels School of Business, majoring in Finance and Accounting. In his free time, he enjoys playing chess, poker, and following financial markets.",
  "Balthazar Schmitt": "Balthazar Schmitt is a junior majoring in Mathematics and Economics. He has previously interned at CBRE and Turner and Townsend, working within project management. Outside of classes and work, he enjoys taking long drives in the countryside, hiking mountains, skiing, and making music.",
  "Augustus Matushek": "Augustus Matushek is a sophomore in the Daniels School of Business, majoring in Finance and Accounting. Augie previously interned at Centier Bank, where he worked as a Business Planning & Analysis Intern. In his free time, he enjoys reading, going to the gym, and working on his golf game.",
  "Jacob George": "Jacob George is a sophomore in the Daniels School of Business, majoring in Finance and Business Analytics Information Management. Outside of SMIF, he is a Capital Markets Intern with Simon Property Group. In his free time, he enjoys going to the gym, DJing diverse styles of music, and all things Purdue sports.",
  "Dallas White": "Dallas White is a sophomore in the Daniels School of Business, majoring in Finance and Accounting with a minor in Business Economics. He is running KNA Autocare this summer, honing his entrepreneurial and sales skills. In his free time, he enjoys traveling, exercise, and listening to music.",
  "Keren Wadhwani": "Keren Wadhwani is a junior in the Daniels School of Business, majoring in Quantitative Economics and Finance with a minor in Art History. She previously interned at energyRe as an M&A and Investments Intern and is a Girls Who Invest Scholar. Outside of SMIF, she is a competitive triathlete with a passion for fine art. In her free time, she enjoys running, swimming, visiting museums, and painting.",
  "Logan Friedman": "Logan Friedman is a junior in the College of Engineering, majoring in Mechanical Engineering with a minor in Finance. He is currently working as a Mechanical Engineering Intern at Northrop Grumman. In his free time, he enjoys hiking, surfing, and pickleball.",
  "Sid Voona": "Siddharth Voona is a sophomore in the Daniels School of Business, majoring in Finance and Accounting. He has previously interned at MD Global Partners as an Investment Banking Analyst and is the President of Purdue's Banking and Markets Club. In his free time, he enjoys playing guitar, poker, and cooking.",
  "Evan Wright": "Evan Wright is a senior in the Daniels School of Business, pursuing dual degrees in Accounting and Finance with a concentration in Management Consulting. Outside of SMIF, he is currently working as an Audit & Assurance Intern at Deloitte, having previously interned in audit and assurance at Crowe. Raised in central Indiana with roots in agriculture, he brings a ground-level perspective to his equity research and a genuine interest in agribusiness as an investment theme. In his free time, he enjoys playing golf, following the markets, and spending time outdoors.",
  "Shaheera Ali": "Shaheera Ali is a junior in the Daniels School of Business, majoring in Finance and Business Analytics & Information Management. She is currently interning as an Audit & Assurance Technology Controls Discovery Intern at Deloitte. In her free time, she enjoys film theory, kayaking, and exploring new places.",
  "Sandhya Gopinath": "Sandhya Gopinath is a Junior in the Daniels School of Business, majoring in Finance and Business Analytics & Information Management. She has previously interned at NextGear Capital by Cox Automotive as a Financial Analyst Intern. In her free time, she enjoys playing table tennis, pickleball, going to the gym and watching thriller shows.",
  "Brock Heller": "Brock Heller is a senior in the Daniels School of Business, majoring in Finance. In his free time, he likes to golf, watch college basketball, and travel.",
  "Alex Belanger": "Alex Belanger is a senior in the Daniels School of Business, majoring in Finance. He previously interned at Huntington Bank as a Leveraged Finance Intern. In his free time, he enjoys going to the gym, playing chess, and watching football.",
  "Gautham Santhanam": "Gautham Santhanam is a junior in the Daniels School of Business, majoring in Finance and Accounting. He has previously interned at Hartford HealthCare as a Finance Intern. In his free time, he enjoys playing tennis, solving Rubik's cubes, and trying new food.",
  "Daniel Friedman": "Daniel Friedman is a senior in the Daniels School of Business, majoring in Finance and Accounting. He previously interned at Allied Solutions as a Financial Reporting & Acquisitions Intern. In his free time, he enjoys golfing, visiting national parks, and learning about history.",
  "Cooper Weiss": "Cooper Weiss is a junior in the Daniels School of Business, majoring in Finance and Business Analytics & Information Management. Outside of SMIF, he has previously interned at Ivy Wealth Partners as a Financial Advisor. In his free time, he enjoys golf, playing and teaching tennis, and weightlifting.",
  "Ayden Wong": "Ayden Wong is a rising senior in the Daniels School of Business, majoring in Business Analytics & Information Management and Finance. Outside of SMIF, he previously interned at Accenture as a Strategy & Consulting Intern. In his free time, he enjoys running, traveling, and reading up on financial markets.",
  "Karanvir Singh": "Karanvir Singh is a sophomore in the Daniels School of Business, majoring in Quantitative Economics with concentrations in International Business and Leadership. He has previously interned at Elanco as a Financial Analyst and currently works with the Center for Asia Leadership. In his free time, he enjoys spending time outdoors and playing basketball.",
  "Veer Sanyal": "Veer Sanyal is a junior in the Daniels School of Business, majoring in Integrated Business and Engineering. Outside of SMIF, he is currently working as a consulting extern with Scouting America through the Daniels Summer Externship Program. In his free time, he enjoys making origami, weightlifting, and photography.",
  "Anushka Patel": "Anushka Patel is a sophomore in the Daniels School of Business at Purdue University, pursuing a B.S. in Quantitative Business Economics and a B.A. in Global Studies with a certification in Data Science. She currently serves as a Portfolio Management Associate with the Student Managed Investment Fund and as a Senior Consultant with 180 Degrees Consulting. Outside of academics, she enjoys art, vintage and thrifted fashion, and public speaking.",
  "Abhipsa Prajapati": "Abhipsa Prajapati is a sophomore in the Daniels School of Business, majoring in Mathematics and Quantitative Economics with a minor in Political Science. She is currently conducting AI and finance research through the Wharton AI Research Fellowship at the University of Pennsylvania and previously worked as a Private Credit Analyst. Outside of SMIF, she serves as Corporate Partnership Chair for Women in Consulting and is an Equity Research Analyst with Investment and Trading at Purdue. In her free time, she enjoys bouldering, playing tennis, golfing, and sailing.",
  "Fabian Segura Vargas": "Fabian Segura Vargas is a junior in the Daniels School of Business, majoring in Finance and Business Analytics & Information Management (BAIM). He previously interned at Cummins as a Finance Systems Intern. In his free time, he enjoys playing and watching sports, and filmmaking.",
};

export const board: Member[] = [
  { name: "Andrew Lacambra", role: "Co-President", year: "Class of 2027", email: "alacambr@purdue.edu", photo: andrewLacambraPhoto, bio: BIO_BY_NAME["Andrew Lacambra"] },
  { name: "Ian Teh", role: "Co-President", year: "Class of 2027", email: "iteh@purdue.edu", photo: ianTehPhoto, bio: BIO_BY_NAME["Ian Teh"] },
  { name: "Hunter Specht", role: "Co-CIO & Co-Head of Education", year: "Class of 2027", email: "hspecht@purdue.edu", bio: "Drives portfolio strategy and final investment decisions across all sectors, and co-leads the analyst education curriculum." },
  { name: "Sandhya Gopinath", role: "Co-CIO & Co-Head of Education", year: "Class of 2028", email: "gopinas@purdue.edu", photo: sandhyaGopinathPhoto, bio: BIO_BY_NAME["Sandhya Gopinath"] },
  { name: "Keren Wadhwani", role: "Treasurer and Director of Fundraising", year: "Class of 2028", email: "kwadhwan@purdue.edu", photo: kerenWadhwaniPhoto, bio: BIO_BY_NAME["Keren Wadhwani"] },
  { name: "Chris Andreou", role: "Director of Talent and Operations", year: "Class of 2028", email: "andreou@purdue.edu", photo: chrisAndreouPhoto, bio: BIO_BY_NAME["Chris Andreou"] },
  { name: "Shaheera Ali", role: "Director of Marketing and Outreach", year: "Class of 2028", email: "ali251@purdue.edu", photo: shaheeraAliPhoto, bio: BIO_BY_NAME["Shaheera Ali"] },
];


const PHOTO_BY_NAME: Record<string, string> = {
  "Andrew Lacambra": andrewLacambraPhoto,
  "Ian Teh": ianTehPhoto,
  "Landon Haffner": landonHaffnerPhoto,
  "Yashita Pujari": yashitaPujariPhoto,
  "Chris Andreou": chrisAndreouPhoto,
  "Parth Dama": parthDamaPhoto,
  "Mikhail Bilokin": mikhailBilokinPhoto,
  "Balthazar Schmitt": balthazarSchmittPhoto,
  "Augustus Matushek": augustusMatushekPhoto,
  "Jacob George": jacobGeorgePhoto,
  "Dallas White": dallasWhitePhoto,
  "Keren Wadhwani": kerenWadhwaniPhoto,
  "Logan Friedman": loganFriedmanPhoto,
  "Evan Wright": evanWrightPhoto,
  "Sid Voona": sidVoonaPhoto,
  "Shaheera Ali": shaheeraAliPhoto,
  "Sandhya Gopinath": sandhyaGopinathPhoto,
  "Karanvir Singh": karanvirSinghPhoto,
  "Ayden Wong": aydenWongPhoto,
  "Gautham Santhanam": gauthamSanthanamPhoto,
};

const PHOTO_POSITION_BY_NAME: Record<string, string> = {
  "Landon Haffner": "62% 37%",
  "Yashita Pujari": "center 22%",
  // Tall portrait crops — bias the square toward the face near the top.
  "Ayden Wong": "center 20%",
  "Gautham Santhanam": "center 20%",
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
    role: i === 0 ? "Portfolio Manager" : role,
    year: gradYear ? `Class of ${gradYear}` : "",
    email: email || undefined,
    placeholder: !name,
    photo: name ? PHOTO_BY_NAME[name] : undefined,
    photoPosition: name ? PHOTO_POSITION_BY_NAME[name] : undefined,
    photoScale: name ? PHOTO_SCALE_BY_NAME[name] : undefined,
    // Personal bios only — we no longer ship the copy-paste analyst
    // boilerplate. Sector leads keep their generic leadership line when
    // they don't have a personal bio; everyone else shows name · role ·
    // class year · links cleanly. (F9 of the audit.)
    bio: (name && BIO_BY_NAME[name] && !BOARD_NAMES.has(name))
      ? BIO_BY_NAME[name]
      : i === 0 && name
        ? `Leads the ${team} team, driving sector strategy, idea generation, and final pitch review.`
        : "",
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
      ["Mikhail Bilokin", "Analyst", "mbilokin@purdue.edu", "2029"],
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
      ["", "Analyst"],
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
  ["Balthazar Schmitt", "Analyst, FX & Macro", "bschm@purdue.edu", "2028"],
]).map((m) => (m.name === "Andrew Lacambra" ? { ...m, photo: andrewLacambraPhoto } : m));

export const portfolioManagers: Member[] = make("Portfolio + Risk Management", [
  ["Hunter Specht", "Portfolio Manager", "hspecht@purdue.edu", "2027"],
  ["Sandhya Gopinath", "Portfolio Manager", "gopinas@purdue.edu", "2028"],
  ["Yashita Pujari", "Portfolio Management Associate", "ypujari@purdue.edu", "2028"],
  ["Anushka Patel", "Portfolio Management Associate", "pate3115@purdue.edu", "2029"],
  ["Abhipsa Prajapati", "Portfolio Management Associate", "aprajap@purdue.edu", "2029"],
  ["", "Portfolio Management Associate"],
]);

// Faculty Advisors — Daniels School professors who advise SMIF. Real
// headshots not yet provided, so cards render initials-only tiles.
export const facultyAdvisors: Member[] = [
  {
    name: "Lulu Zeng",
    role: "Faculty Advisor",
    year: "Daniels School of Business",
    bio: "Teaches Fixed Income and Financial Modeling.",
  },
  {
    name: "Alexander Boquist",
    role: "Faculty Advisor",
    year: "Daniels School of Business",
    bio: "Teaches Honors Financial Management and Futures & Options.",
  },
];


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
  "Balthazar Schmitt": "https://www.linkedin.com/in/balthazarschmitt",
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
