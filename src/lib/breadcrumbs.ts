import { CONTENT_ROUTES } from "@/lib/content-routes";
import { findMemberBySlug } from "@/data/team";

// One source for the visible breadcrumb trail. The structured-data trail on each
// page (breadcrumbLd and breadcrumbTrailLd in seo.ts and content-ld.ts) must use
// the same names; a unit test holds the two together.

export type Crumb = { name: string; to?: string };

/** Top-level pages: Home > name. Names match the primary navigation. */
export const TOP_LEVEL_CRUMBS: Readonly<Record<string, string>> = {
  "/about": "About",
  "/team": "Team",
  "/sectors": "Sectors",
  "/holdings": "Holdings",
  "/performance": "Performance",
  "/research": "Research",
  "/learn": "Learn",
  "/recruiting": "Recruiting",
  "/apply": "Apply",
  "/contact": "Contact",
  "/finance-clubs-at-purdue": "Finance Clubs at Purdue",
};

/** Pages that render their own trail inside their hero (see ContentHero). */
const SELF_RENDERED = new Set(CONTENT_ROUTES.map((r) => r.path));

/**
 * The trail after "Home" for a pathname, or null when the page has none: the home
 * page, 404s, and pages that draw their own trail.
 */
export function trailFor(rawPath: string): Crumb[] | null {
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;
  if (SELF_RENDERED.has(path)) return null;

  const top = TOP_LEVEL_CRUMBS[path];
  if (top) return [{ name: top }];

  const member = /^\/team\/([^/]+)$/.exec(path);
  if (member) {
    const entry = findMemberBySlug(member[1]);
    if (entry) return [{ name: "Team", to: "/team" }, { name: entry.member.name }];
  }
  return null;
}
