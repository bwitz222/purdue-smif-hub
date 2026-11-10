// The interview prep guide, shared by /recruiting (summary) and the two guide
// pages. Moved here unchanged from the recruiting route so each guide can have its
// own URL without the copy existing twice.

export type PrepCardData = { title: string; items: string[] };

export const BEHAVIORAL_CARDS: PrepCardData[] = [
  {
    title: "Know Your 'Why'",
    items: [
      "Why finance? Why investing? Why SMIF specifically?",
      "Tie answers to specific experiences (a class, a book, a market event), not buzzwords.",
      "Have a thoughtful answer for 'why this sector' if asked.",
    ],
  },
  {
    title: "STAR Stories",
    items: [
      "Prepare 3-4 stories: leadership, teamwork, conflict, failure.",
      "Situation → Task → Action → Result. Keep each story to ~90 seconds.",
      "Reuse stories across questions; depth beats breadth.",
    ],
  },
  {
    title: "Know SMIF",
    items: [
      "Read our About, Sectors, and Holdings pages before you walk in.",
      "Understand the structure: analyst → senior analyst → portfolio manager → executive board.",
      "Reference a recent publication or holding that genuinely caught your interest.",
    ],
  },
  {
    title: "Ask Sharp Questions",
    items: [
      "Always have 2-3 questions ready for your interviewers.",
      "Avoid questions answered on the website. Ask about their experience, not logistics.",
      "Good prompt: 'What's a position you pushed back on in committee and why?'",
    ],
  },
];

export const TECHNICAL_CARDS: PrepCardData[] = [
  {
    title: "Accounting Foundations",
    items: [
      "Walk through the three financial statements and how they link.",
      "Depreciation +$10: walk through the impact on IS, CF, and BS (after taxes).",
      "Know the difference between EBITDA, operating income, and net income.",
    ],
  },
  {
    title: "Valuation Basics",
    items: [
      "Understand the big picture: a company is worth the present value of its future cash flows.",
      "Learn the three main approaches: DCF (intrinsic), comparables (relative), and precedent transactions.",
      "Start with P/E and EV/EBITDA: know what they measure and when each is useful.",
    ],
  },
  {
    title: "Market Awareness",
    items: [
      "Know where the S&P 500, Nasdaq, 10Y Treasury, and Fed Funds rate sit directionally.",
      "Be ready to discuss one recent market headline and its implications.",
      "Daily reads: WSJ, Bloomberg, FT, Axios Markets, Matt Levine's Money Stuff.",
    ],
  },
  {
    title: "Stock Pitch",
    items: [
      "Prepare one long idea: thesis, 2-3 catalysts, valuation, and key risks.",
      "Pick a name you genuinely understand, not the most complex one you can find.",
      "Structure: 'I'd buy X at $Y because… Catalysts are… Valuation supports… Risks are…'",
    ],
  },
];

export const DAY_OF: string[] = [
  "Business professional dress: suit and tie or equivalent.",
  "Arrive 10 minutes early. Silence your phone.",
  "Bring printed copies of your resume and a notepad.",
  "Know your resume cold; anything on it is fair game.",
  "Firm handshake, eye contact, and smile.",
  "Be yourself. We evaluate fit as much as skill.",
];
