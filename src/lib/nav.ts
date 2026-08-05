// Single canonical nav config — used by SiteHeader, SiteFooter, and the
// mobile menu so every route renders an identical item set.
//
// Eight flat items ("About, Team, Sectors, Holdings, Performance, Research,
// Learn, Recruiting") gave a visitor no way to tell that half of them describe
// a portfolio and half describe an organization. They're grouped now:
//
//   The Fund      — who we are and how we train
//   The Portfolio — what we own and how it has done
//   Join Us       — how to get in
//
// /apply and /contact are real routes that were never in the header; they
// belong under Join Us and are surfaced there.

export type NavItem = {
  to: string;
  label: string;
  /** One line shown under the label in the desktop dropdown panel. */
  blurb: string;
};

export type NavGroup = {
  label: string;
  /** Short line describing the group, shown at the head of the panel. */
  summary: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "The Fund",
    summary: "Who runs the money and how they're trained.",
    items: [
      {
        to: "/about",
        label: "About",
        blurb: "Mandate, process, and how a pitch becomes a position.",
      },
      {
        to: "/team",
        label: "Team",
        blurb: "The board, the sector teams, and the faculty advisors.",
      },
      {
        to: "/learn",
        label: "Learn",
        blurb: "The analyst curriculum, reading list, and worked models.",
      },
    ],
  },
  {
    label: "The Portfolio",
    summary: "Real capital, marked to the last close.",
    items: [
      {
        to: "/holdings",
        label: "Holdings",
        blurb: "Every position, with weights, returns, and risk metrics.",
      },
      {
        to: "/performance",
        label: "Performance",
        blurb: "Track record against the S&P 500, with the risk numbers.",
      },
      { to: "/sectors", label: "Coverage", blurb: "How the book is allocated across ten teams." },
      {
        to: "/research",
        label: "Research",
        blurb: "Pitches, semester reviews, and annual reports.",
      },
    ],
  },
  {
    label: "Join Us",
    summary: "Recruiting runs each fall and spring.",
    items: [
      {
        to: "/recruiting",
        label: "Recruiting",
        blurb: "The calendar, the countdown, and the interview prep guide.",
      },
      { to: "/apply", label: "Apply", blurb: "What we look for and what the application asks." },
      { to: "/contact", label: "Contact", blurb: "Reach the board directly." },
    ],
  },
];

/** The group a path belongs to, for active-state on the desktop triggers. */
export function groupForPath(pathname: string): string | null {
  for (const g of NAV_GROUPS) {
    if (g.items.some((i) => pathname === i.to || pathname.startsWith(i.to + "/"))) {
      return g.label;
    }
  }
  return null;
}
