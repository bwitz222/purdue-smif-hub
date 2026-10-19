// Site navigation, used by SiteHeader (desktop bar + mobile menu), SiteFooter
// and the header search.
//
// Five primary items, two of them groups. The October 2026 peer audit found a
// median of 5 primary links across 20 leading buy- and sell-side sites; the
// header had grown to 8 plus Apply. Grouping changes no URLs.

export type NavLink = {
  to:
    | "/about"
    | "/holdings"
    | "/performance"
    | "/sectors"
    | "/research"
    | "/team"
    | "/recruiting"
    | "/learn"
    | "/apply"
    | "/contact"
    | "/finance-clubs-at-purdue";
  label: string;
  /** One line shown under the label in dropdowns and search results. */
  description?: string;
};

export type NavGroup = { label: string; children: NavLink[] };

export type NavItem = NavLink | NavGroup;

export const isGroup = (item: NavItem): item is NavGroup => "children" in item;

export const NAV: NavItem[] = [
  { to: "/about", label: "About", description: "History, process, governance and FAQ" },
  {
    label: "Portfolio",
    children: [
      {
        to: "/holdings",
        label: "Holdings",
        description: "Every position, priced at the latest close",
      },
      {
        to: "/performance",
        label: "Performance",
        description: "Returns and risk against the S&P 500",
      },
      {
        to: "/sectors",
        label: "Sectors",
        description: "Allocation and the team behind each sector",
      },
    ],
  },
  { to: "/research", label: "Research", description: "The Macro Brief, pitches and reports" },
  { to: "/team", label: "Team", description: "Board, sector teams and faculty advisors" },
  {
    label: "Join",
    children: [
      {
        to: "/recruiting",
        label: "Recruiting",
        description: "Event calendar and interview prep",
      },
      { to: "/learn", label: "Learn", description: "The curriculum our analysts train on" },
      { to: "/apply", label: "Apply", description: "What we look for and how it works" },
    ],
  },
];

/** Every page link in NAV, groups flattened, in order. */
export const NAV_LINKS: NavLink[] = NAV.flatMap((item) => (isGroup(item) ? item.children : [item]));

export const SUBSTACK_URL = "https://purduesmif.substack.com";

// Footer nav — every primary page plus pages that earn internal links but
// don't belong in the header. /contact has its own footer column.
export const FOOTER_NAV: NavLink[] = [
  ...NAV_LINKS,
  { to: "/finance-clubs-at-purdue", label: "Finance Clubs at Purdue" },
];
