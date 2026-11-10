// The indexable content pages added by the SEO content track, in one place.
//
// Each page builds its <title>, meta description, and canonical from its entry
// here, and the sitemap should be generated from this list too (see the hand-off
// note in the track report: sitemap[.]xml.ts is owned by another track). Keeping
// the copy next to the path means a title cannot drift from the URL it names, and
// the unit test can hold every entry to the length limits search results enforce.
//
// `lastmod` is the date the page's content last changed. Bump it when the copy is
// edited; it feeds both the visible "Updated" line and Article dateModified.

export type ContentRoute = {
  path: string;
  /** <title>: 60 characters or fewer so it is not truncated in results. */
  title: string;
  /** Meta description: 140 to 155 characters. */
  description: string;
  /** Short name for breadcrumbs and nav. */
  name: string;
  /** ISO date the content was last changed. */
  lastmod: string;
  /** ISO date the page was first published. */
  published: string;
};

const FIRST_PUBLISHED = "2026-11-10";

export const CONTENT_ROUTES: readonly ContentRoute[] = [
  {
    path: "/student-managed-investment-funds",
    name: "Student Managed Investment Funds",
    title: "Student Managed Investment Funds Explained | Purdue SMIF",
    description:
      "What a student managed investment fund is, how one is structured and governed, and how Purdue SMIF invests real university capital under faculty oversight.",
    lastmod: "2026-11-10",
    published: FIRST_PUBLISHED,
  },
  {
    path: "/stock-pitches",
    name: "Stock Pitches",
    title: "How Purdue SMIF Stock Pitches Work | Purdue SMIF",
    description:
      "How Purdue SMIF analysts build and defend a stock pitch before the investment committee, how a vote decides it, and where to read the pitch decks.",
    lastmod: "2026-11-10",
    published: FIRST_PUBLISHED,
  },
  {
    path: "/recruiting/technical-interview-prep",
    name: "Technical Interview Prep",
    title: "Technical Interview Prep for Purdue SMIF | Purdue SMIF",
    description:
      "Prepare for the Purdue SMIF technical interview: accounting foundations, valuation basics, market awareness, and how to structure a stock pitch.",
    lastmod: "2026-11-10",
    published: FIRST_PUBLISHED,
  },
  {
    path: "/recruiting/behavioral-interview-prep",
    name: "Behavioral Interview Prep",
    title: "Behavioral Interview Prep for Purdue SMIF | Purdue SMIF",
    description:
      "Prepare for the Purdue SMIF behavioral interview: know your why, build STAR stories, learn the fund, and ask sharp questions of your interviewers.",
    lastmod: "2026-11-10",
    published: FIRST_PUBLISHED,
  },
  {
    path: "/learn/glossary",
    name: "Investing Glossary",
    title: "Investing Glossary: DCF, WACC, EV/EBITDA | Purdue SMIF",
    description:
      "Plain-English definitions of intrinsic value, DCF, WACC, free cash flow, EV/EBITDA, margin of safety, alpha, beta, and the Sharpe ratio from Purdue SMIF.",
    lastmod: "2026-11-10",
    published: FIRST_PUBLISHED,
  },
] as const;

export const contentRoute = (path: string): ContentRoute => {
  const found = CONTENT_ROUTES.find((r) => r.path === path);
  if (!found) throw new Error(`No content route registered for ${path}`);
  return found;
};

/** "2026-11-10" -> "November 10, 2026" (house style: full month in body copy). */
export const formatLongDate = (iso: string): string =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
