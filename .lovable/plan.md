## Goals

1. SSR/no-JS-safe countdown with explicit "applications closed" state.
2. Mobile calendar rows = single ≥44px tap target with a visible add-to-calendar affordance.
3. Restore the Faculty Advisor section on `/team` with the two professors.
4. Sticky sector switcher on `/team` redesigned as chip controls (mobile + desktop) with anchor-jump filtering.
5. Run SEO + accessibility audits after build.

---

## 1. Countdown — SSR / no-JS fallback

File: `src/routes/recruiting.tsx`

- Compute a deterministic "next event" at module scope using the build-time `Date.now()` so server-rendered HTML names a real upcoming event (not just `CALENDAR[0]`). Pass it into `<Countdown />` as a prop so SSR markup matches first client paint.
- Render the resting headline + date/time inside a `<noscript>`-equivalent always-visible block (`<p className="...">`) and tag the live ticker `<span aria-hidden="true">` so screen readers and no-JS users get one clean sentence: "Applications for SMIF Callout 1 open Tue, Aug 25 · 7:30 PM ET."
- If `nextUpcomingEvent === null` and the last event is in the past, render an `<p role="status">` "Applications are closed for the Fall 2026 cycle" block — replaces the current div, gains semantic role.
- Keep ticker units but wrap in `aria-hidden`; expose plain-text countdown ("3 days, 4 hours") via `sr-only` updated on the second tick.

## 2. Mobile calendar rows — single ≥44px tap block

File: `src/routes/recruiting.tsx` (the `CALENDAR.map` block).

- Collapse the 4-column grid to a stacked layout under `md`. Each row becomes a single `<a>` with `min-h-[64px]`, `p-4`, full-width tap surface, and a right-aligned `CalendarPlus` icon button affordance (label "Add to calendar") that's always visible on mobile rather than hover-only.
- Date + name on row 1, time + location on row 2; the `CalendarPlus` icon sits at the right edge with `aria-hidden` (the link's `aria-label` already conveys intent).
- Preserve the existing desktop 12-col grid at `md:` and up.
- Add `focus-visible` ring tokens for keyboard users.

## 3. Faculty Advisor section

Files: `src/data/team.ts`, `src/routes/team.tsx`, two new headshot assets.

- Add a `facultyAdvisors` export to `src/data/team.ts`:
  - Lulu Zeng — "Faculty Advisor" — "Teaches Fixed Income and Financial Modeling."
  - Alexander Boquist — "Faculty Advisor" — "Teaches Honors Financial Management and Futures & Options."
- Use Purdue Krannert faculty photos as placeholders via `imagegen` (neutral portrait-style illustrations) since real headshots weren't provided. **Confirm:** is generating stand-in portraits acceptable, or should I leave the photo slot as initials-only until you upload real headshots? I'll default to **initials-only avatar tiles** (no fabricated faces) unless you say otherwise.
- Restore a `Faculty Advisors` section on `/team` placed between the FIM and PM blocks, using a compact 2-up `MemberCard`-style layout (no "Apply" CTA, no role chip).
- Add to JSON-LD `ItemList` so the schema reflects the full roster.

## 4. Sticky sector switcher — chips + anchor-jump

File: `src/routes/team.tsx`.

Replace the current `<Select>` in the sticky filter bar with a horizontally scrollable chip row that works for both viewports:

- Chips: `All`, `Leadership`, each sector name, `FI & Macro`, `PM + Risk`, `Faculty`.
- Container: `flex gap-2 overflow-x-auto snap-x` on mobile, wraps onto one line `md:flex-wrap md:overflow-visible` on desktop. Each chip ≥36px tall, `min-w-max`, `rounded-full` border with active state using `bg-ink text-background`.
- Clicking a chip does two things: sets the active filter (same state as today) AND smooth-scrolls to that section's anchor (`#leadership`, `#sectors-<slug>`, `#fim`, `#pm`, `#faculty`). Add matching `id="..."` to each section heading.
- Keep the URL `?sector=` sync logic so deep links still work; chips read from / write to the same state.
- Keep the search input above the chip row on mobile, side-by-side on `md+`.
- Remove the old shadcn `Select` import if unused.

## 5. Audits

- After build passes, call `seo_chat--trigger_scan` and `security--run_security_scan`.
- Read findings, fix anything actionable (missing alt text on the new advisor tiles, anchor labels, etc.), and report results.

---

## Technical notes

- No DB changes. No new packages.
- `Countdown` becomes a server-aware component: deterministic SSR text, client-only ticker enhancement.
- All new tap targets verified ≥44px (mobile) per a11y skill.
- Section anchors get `scroll-mt-28` so the sticky header doesn't cover them after jumping.

---

## Open question

Confirm whether you want me to **generate placeholder portraits** for Profs. Zeng and Boquist, or render **initials-only avatar tiles** until you upload real headshots. Default: initials-only.
