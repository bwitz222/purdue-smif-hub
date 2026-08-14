// Primary nav — used by SiteHeader and the mobile menu.
export const NAV = [
  { to: "/about",        label: "About"       },
  { to: "/team",         label: "Team"        },
  { to: "/sectors",      label: "Sectors"     },
  { to: "/holdings",     label: "Holdings"    },
  { to: "/performance",  label: "Performance" },
  { to: "/research",     label: "Research"    },
  { to: "/learn",        label: "Learn"       },
  { to: "/recruiting",   label: "Recruiting"  },
] as const;

// Footer nav — the primary sections plus pages that earn internal links but
// don't belong in the header. /apply previously had no nav link at all (only
// body CTAs), which left the site's highest-intent page nearly unlinked.
export const FOOTER_NAV = [
  ...NAV,
  { to: "/finance-clubs-at-purdue", label: "Finance Clubs at Purdue" },
  { to: "/apply",                   label: "Apply"                  },
] as const;
