// Site-wide SEO constants and helpers for TanStack Start head() blocks.
// Keep canonical/og:url builders here so leaf routes never hardcode the host.

export const SITE_URL = "https://www.purduesmif.org";
export const OG_IMAGE = `${SITE_URL}/og-share.jpg`;
export const OG_HOME = `${SITE_URL}/og-home.jpg`;
export const OG_HOLDINGS = `${SITE_URL}/og-holdings.jpg`;
export const OG_TEAM = `${SITE_URL}/og-team.jpg`;
export const OG_ABOUT = `${SITE_URL}/og-about.jpg`;
export const OG_RECRUITING = `${SITE_URL}/og-recruiting.jpg`;
export const OG_PERFORMANCE = `${SITE_URL}/og-performance.jpg`;
export const OG_RESEARCH = `${SITE_URL}/og-research.jpg`;
export const OG_LEARN = `${SITE_URL}/og-learn.jpg`;
export const OG_SECTORS = `${SITE_URL}/og-sectors.jpg`;
export const OG_APPLY = `${SITE_URL}/og-apply.jpg`;
export const OG_CONTACT = `${SITE_URL}/og-contact.jpg`;
export const OG_FINANCE_CLUBS = `${SITE_URL}/og-finance-clubs.jpg`;
const OG_IMAGE_ALT = "Purdue SMIF: Student Managed Investment Fund, Daniels School of Business";

/**
 * Alt text for each social card, keyed by image URL. It describes what the card
 * itself shows (its headline and imagery), not claims about the fund, so it
 * stays true when a page's copy changes. Unknown images fall back to the
 * generic OG_IMAGE_ALT.
 */
const OG_ALT_BY_URL: Record<string, string> = {
  [OG_IMAGE]: OG_IMAGE_ALT,
  [OG_HOME]:
    "Members of the Purdue Student Managed Investment Fund on the staircase at the Daniels School of Business",
  [OG_ABOUT]: "About Purdue SMIF, over a gold line drawing of a city skyline",
  [OG_HOLDINGS]: "Portfolio Holdings, over a rising line chart",
  [OG_TEAM]: "Meet the Team: the analysts of the Purdue Student Managed Investment Fund",
  [OG_SECTORS]: "Sectors: coverage teams, one portfolio",
  [OG_PERFORMANCE]: "Performance: track record, transparent, benchmarked",
  [OG_RESEARCH]: "Research: thesis-driven, rigorous, student-led",
  [OG_LEARN]: "Learn: education hub, models, frameworks",
  [OG_RECRUITING]: "Apply to Join Purdue SMIF, with a recruiting timeline across fall and spring",
  [OG_APPLY]: "Apply to Purdue SMIF",
  [OG_CONTACT]: "Get in touch with Purdue SMIF",
  [OG_FINANCE_CLUBS]: "Finance Clubs at Purdue: a complete guide from Purdue SMIF",
};

export const ogAlt = (image: string) => OG_ALT_BY_URL[image] ?? OG_IMAGE_ALT;

/**
 * Intrinsic pixel size of each social card, keyed by URL.
 *
 * These MUST match the file on disk. Declaring a size the image doesn't have
 * makes crawlers reserve the wrong box: Facebook and LinkedIn size the
 * preview from these tags before they finish fetching the image, so a wrong
 * value renders a stretched or letterboxed card. Only /apply and /contact
 * were ever actually 1216x640; the other nine cards are 1536x1024, and the
 * finance-clubs card is 1200x630.
 */
const OG_SIZE_1216 = { width: "1216", height: "640" } as const;
const OG_SIZE_1536 = { width: "1536", height: "1024" } as const;
const OG_SIZE_1200 = { width: "1200", height: "630" } as const;

const OG_SIZE_BY_URL: Record<string, { width: string; height: string }> = {
  [`${SITE_URL}/og-apply.jpg`]: OG_SIZE_1216,
  [`${SITE_URL}/og-contact.jpg`]: OG_SIZE_1216,
  [OG_FINANCE_CLUBS]: OG_SIZE_1200,
};

const ogSize = (image: string) => OG_SIZE_BY_URL[image] ?? OG_SIZE_1536;

export const canonical = (path: string) => `${SITE_URL}${path}`;

/** Stable @id of the Organization node emitted from the root route. */
export const ORG_ID = `${SITE_URL}/#organization`;

/**
 * Date the site's static content was last meaningfully edited (YYYY-MM-DD).
 * Humans bump this when they change page copy; the sitemap `lastmod` for static
 * pages and the Article `dateModified` read it. It is never stamped from the
 * clock: a lastmod that changes on every request teaches crawlers to ignore it.
 */
export const LAST_CONTENT_UPDATE = "2026-11-10";

/**
 * BreadcrumbList JSON-LD for a top-level subpage (Home > name).
 * Return value plugs directly into a route head()'s `scripts` array.
 */
export function breadcrumbLd(name: string, path: string) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${path}` },
      ],
    }),
  };
}

/**
 * Build a complete social-card meta block for a leaf route.
 * Always emits Open Graph + Twitter title/description/image so previews
 * are correct on every platform regardless of which tags they prefer.
 */
export function socialMeta({
  title,
  description,
  url,
  type = "website",
  image = OG_IMAGE,
  imageAlt,
}: {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article" | "profile";
  image?: string;
  /** Overrides the per-card default from OG_ALT_BY_URL. */
  imageAlt?: string;
}) {
  const { width, height } = ogSize(image);
  const alt = imageAlt ?? ogAlt(image);
  return [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:image", content: image },
    { property: "og:image:width", content: width },
    { property: "og:image:height", content: height },
    { property: "og:image:alt", content: alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: alt },
  ];
}

// ── Titles and descriptions ────────────────────────────────────────────────

/**
 * Title and description for the pages whose current strings are off-pattern
 * (titles over 60 characters, descriptions under 140 or over 155). One title
 * pattern, `Page topic | Purdue SMIF`, 50 to 60 characters; descriptions 140 to
 * 155 characters, each with a verb and the phrase people search for. A unit test
 * enforces the ranges. `financeClubs` is already wired into its route; the
 * other three are for routes owned elsewhere to adopt.
 */
export const PAGE_META = {
  financeClubs: {
    title: "Finance Clubs at Purdue: A Complete Guide | Purdue SMIF",
    description:
      "Compare the finance and investment clubs at Purdue University: what each does, who it suits, and which one manages real money. By Purdue SMIF students.",
  },
  research: {
    title: "Research: Macro Brief, Pitch Decks & Reports | Purdue SMIF",
    description:
      "Read the Macro Brief, stock pitch decks, equity research, semester letters and annual reports written by Purdue Student Managed Investment Fund analysts.",
  },
  holdings: {
    title: "Portfolio Holdings, Allocations & Returns | Purdue SMIF",
    description:
      "See every position held by the Purdue Student Managed Investment Fund: cost basis, returns, sector allocation and risk metrics, updated after market close.",
  },
  learn: {
    title: "Learn Investing: Equity Research & Valuation | Purdue SMIF",
    description:
      "Use the Purdue SMIF education hub: analyst training curriculum, reading list, DCF and comps models, research tools and a glossary of investing terms.",
  },
} as const;

// ── Events ─────────────────────────────────────────────────────────────────

const PLACEHOLDER = /\b(tbd|tba|to be (determined|announced)|n\/a)\b/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whether a calendar item is complete enough to publish as schema.org Event
 * markup. Google requires a real start date and a real location for event rich
 * results and treats placeholders such as "TBD" as invalid, so an item with an
 * unconfirmed date, time or place stays in the visible calendar only.
 */
export function isEmittableEvent(ev: {
  iso?: string | null;
  time?: string | null;
  location?: string | null;
}): boolean {
  const iso = (ev.iso ?? "").trim();
  const time = (ev.time ?? "").trim();
  const location = (ev.location ?? "").trim();
  if (!ISO_DATE.test(iso)) return false;
  if (!time || PLACEHOLDER.test(time)) return false;
  if (!location || PLACEHOLDER.test(location)) return false;
  return true;
}

// ── Member pages ───────────────────────────────────────────────────────────

const MAX_DESCRIPTION = 155;

/**
 * Meta description for a member profile, built only from fields every member
 * has (name, role, team, class year), never from the free-text bio: bios can
 * run past 280 characters and include personal detail that does not belong in a
 * search snippet. Tries the most informative sentence first and drops detail
 * until it fits in 155 characters.
 */
export function memberDescription(m: { name: string; role: string; year: string }, team: string) {
  const fund = "the Purdue Student Managed Investment Fund";
  const school = "at the Daniels School of Business";
  const article = /^[aeiou]/i.test(m.role) ? "an" : "a";
  const isFaculty = team === "Faculty Advisors";
  const isBoard = team === "Executive Board";

  const lead = isFaculty
    ? `${m.name} is a Faculty Advisor to ${fund}`
    : isBoard
      ? `${m.name} serves as ${m.role} on the executive board of ${fund}`
      : `${m.name} is ${article} ${m.role} on the ${team} team of ${fund}`;
  const classYear = /^Class of /.test(m.year) ? m.year : "";

  const candidates = [
    classYear ? `${lead}, ${classYear}, ${school}.` : `${lead} ${school}.`,
    `${lead} ${school}.`,
    `${lead}.`,
  ];
  return candidates.find((c) => c.length <= MAX_DESCRIPTION) ?? candidates[candidates.length - 1];
}

// ── Datasets ───────────────────────────────────────────────────────────────

/**
 * schema.org Dataset for /holdings. The positions table is a daily-refreshed
 * dataset, which is what Google Dataset Search indexes. `dateModified` is the
 * trading session the prices belong to when it is known; it is left out rather
 * than guessed when it is not.
 */
export function holdingsDatasetLd(asOf?: string | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE_URL}/holdings#dataset`,
    name: "Purdue Student Managed Investment Fund portfolio holdings",
    description:
      "Positions held by the Purdue Student Managed Investment Fund: shares, cost basis, end-of-day price, market value, return and portfolio weight, refreshed after each market close.",
    url: `${SITE_URL}/holdings`,
    inLanguage: "en",
    isAccessibleForFree: true,
    creator: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    keywords: ["student managed investment fund", "portfolio holdings", "equity portfolio"],
    variableMeasured: [
      "Shares",
      "Cost basis",
      "End-of-day price",
      "Market value",
      "Total return",
      "Portfolio weight",
      "Sector allocation",
    ],
    ...(asOf && ISO_DATE.test(asOf) ? { dateModified: asOf } : {}),
  };
}

/**
 * schema.org Dataset for /performance: monthly and annual fund returns against
 * the S&P 500 Total Return Index. The audited monthly series begins October
 * 2013, per the page's own methodology note.
 */
export function performanceDatasetLd(asOf?: string | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE_URL}/performance#dataset`,
    name: "Purdue Student Managed Investment Fund performance versus the S&P 500",
    description:
      "Monthly and annual returns of the Purdue Student Managed Investment Fund, built from custodian statements and benchmarked against the S&P 500 Total Return Index, with Sharpe ratio, alpha, beta and drawdown analytics.",
    url: `${SITE_URL}/performance`,
    inLanguage: "en",
    isAccessibleForFree: true,
    temporalCoverage: "2013-10-01/..",
    creator: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    keywords: ["student managed investment fund", "fund performance", "S&P 500 benchmark"],
    variableMeasured: [
      "Monthly return",
      "Annual return",
      "Cumulative growth",
      "Benchmark return",
      "Sharpe ratio",
      "Alpha",
      "Beta",
      "Maximum drawdown",
    ],
    ...(asOf && ISO_DATE.test(asOf) ? { dateModified: asOf } : {}),
  };
}

// ── Sitemap ────────────────────────────────────────────────────────────────

export type SitemapEntry = { path: string; lastmod: string };

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * XML for sitemap.xml. Every entry carries a real `lastmod` (YYYY-MM-DD);
 * `changefreq` and `priority` are deliberately absent because Google ignores
 * both. An entry with a malformed lastmod is a bug, so it throws rather than
 * shipping a sitemap crawlers will quietly discard.
 */
export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((e) => {
    if (!ISO_DATE.test(e.lastmod))
      throw new Error(`Bad sitemap lastmod for ${e.path}: ${e.lastmod}`);
    return [
      "  <url>",
      `    <loc>${escapeXml(`${SITE_URL}${e.path}`)}</loc>`,
      `    <lastmod>${e.lastmod}</lastmod>`,
      "  </url>",
    ].join("\n");
  });
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}
