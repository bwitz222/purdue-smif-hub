// Single canonical nav config — used by SiteHeader, SiteFooter, and the
// mobile menu so every route renders an identical item set.
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
