## Alumni Page Plan

A new `/alumni` route, structured as a sub-page under About: linked from the About page and footer, **not** added to the top nav (keeps it at 5 items). Visually and tonally consistent with `/team` and `/about` — Reveal animations, gold/ink palette, mono kickers, display headings, card hover states.

### Route & nav wiring
- Create `src/routes/alumni.tsx` with route-specific `head()` (title, description, og:title, og:description, canonical, JSON-LD `ItemList` of alumni).
- Add an "Alumni Network" link/section to `src/routes/about.tsx`.
- Add an "Alumni" link to `src/components/SiteFooter.tsx`.
- Leave `SiteHeader` untouched.

### Data layer
- New `src/data/alumni.ts` exporting:
  - `Alumnus` type: `name`, `gradYear`, `roleAtSMIF` (e.g. "Former Co-President", "Energy Sector Lead"), `currentTitle`, `currentCompany`, `industry`, `location?`, `linkedin?`, `bio?`, `featured?: boolean`, `photo?`.
  - `alumni: Alumnus[]` — ~24 realistic placeholder entries spread across grad years 2015–2025 and across target firms (BB IB, EB, MM PE, HF, AM, consulting, corp dev, tech).
  - `placementFirms: { name: string; category: string; count: number }[]` — ~20 firms grouped by category (Investment Banking, Asset & Wealth Management, Private Equity / Credit, Hedge Funds, Consulting, Corporate / Tech). Wordmark-style text tiles, no logo files needed.
  - `notableSpotlights: string[]` — names of 3 alumni to feature.

### Page sections (top → bottom)

1. **Hero band** — ink background, gold kicker "Alumni Network", display headline ("Where Boilermakers go next."), short blurb. Three count-up KPI tiles using existing `CountUp`: *Alumni*, *Firms placed*, *Years running* (since 2009).

2. **Placement showcase** — "Selected placements" section. Category-grouped wordmark grid (4–5 cols on desktop, 2 on mobile), each tile shows firm name + small count badge ("3 alumni"). Hover lifts to gold border, matching MemberCard treatment. Wrapped in `Reveal` for stagger.

3. **Notable alumni spotlights** — 3 large editorial cards (asymmetric layout: 1 wide + 2 stacked, or 3-up on desktop). Pull-quote, name, grad year, current role, LinkedIn link. Larger photo aspect, gold accent rule.

4. **Alumni directory** — searchable/filterable grid reusing the `/team` UX pattern:
   - Search input + filter chips: `All / Investment Banking / Buy-side / Consulting / Tech / Other` + grad-year `Select`.
   - Reuses `MemberCard` styling via a new lightweight `AlumniCard` (same border/hover/typography) showing role-at-SMIF as kicker, name, "Class of YYYY", "Current Title @ Company", LinkedIn icon link.
   - Empty state mirrors team page.

5. **Network & mentorship CTA** — split panel:
   - Left: "Are you an alum?" — short blurb, button to mailto/contact form to update info, LinkedIn group link (placeholder URL).
   - Right: "Mentor a current analyst" — describes speaker series + 1:1 mentorship, button to contact page.
   - Below: subtle "Give back" line linking to a fundraising/contact mailto.

6. **Footer note** — "Class of 2009 → present" timeline strip (thin gold rule with year markers) as a quiet closing flourish.

### Design notes & ideas folded in
- **Reuse** existing tokens (`gold`, `gold-deep`, `gold-mid`, `ink`, `shadow-elegant`, `bg-gradient-gold`) and `Reveal` animation wrapper — no new colors or motion primitives.
- **Wordmark tiles** instead of real logos avoid trademark/asset issues and stay on-brand with the editorial typography.
- **Cards are clickable** like the team page — opens a `MemberDetailSheet`-style side sheet (a new `AlumniDetailSheet` mirroring it) with bio, current role, LinkedIn.
- **SEO**: alumni listed as `Person` items with `alumniOf: "Purdue Student Managed Investment Fund"`.
- **Recruiting signal**: placement firms grouped by category doubles as a credibility section for prospective applicants — reinforces the fund's recruiting pipeline narrative.
- **Future-proof**: data file is the single source of truth; you can replace placeholders incrementally without touching the page.

### Files touched
- New: `src/routes/alumni.tsx`, `src/data/alumni.ts`, `src/components/AlumniCard.tsx`, `src/components/AlumniDetailSheet.tsx`.
- Edited: `src/routes/about.tsx` (add Alumni Network teaser block linking to `/alumni`), `src/components/SiteFooter.tsx` (add Alumni link), `src/routes/sitemap[.]xml.ts` (add `/alumni`).
- Untouched: `SiteHeader`, team data, holdings, all existing routes.

### Open question (proceeding with a default unless you say otherwise)
- Placeholder data tone: I'll use **plausible but clearly generic** names (e.g. "Jordan Park, Class of 2019, Associate @ Goldman Sachs") so it reads as real without misrepresenting any actual alum. You can swap them as you gather the real list.
