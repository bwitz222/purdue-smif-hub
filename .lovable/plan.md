# Audit Fix Pass

Implemented in three sequenced passes. Pushbacks from my review are honored: **#5 surgical not blanket, #7 skipped, #15 skipped.**

---

## Sector allocation visual fix (new, surfaced this turn)

**Problem:** Bars use `width: (pct / 40) * 100%` — a 40% sector fills the whole bar. So a 12% sector looks like ~30% of the bar, making the portfolio look more concentrated than it is. The "scale 0–40%" caption doesn't undo the visual bias; people read bar length, not captions.

**Fix:** Two options, recommend (A):
- **(A) True scale 0–100%:** bar width = `pct%` directly. A 12% slice looks like 12% of the bar. Drop the "scale 0–40%" label. Honest, unbiased.
- **(B) Scale to max-in-set:** bar width = `pct / maxPct * 100%`, label as "relative to largest holding." Useful for comparison but misleading for absolute weight. Skip.

Going with (A). Also right-align the % readout and widen the label column on mobile so long sector names don't truncate ("Information Technology").

---

## Pass A — Correctness & Accessibility

1. **Mobile menu → Radix Dialog** (`SiteHeader.tsx`). Replace hand-rolled `motion.div` with `Dialog` + `DialogContent` from shadcn. Keep the framer entrance animation via Dialog's built-in data-state transitions. Removes focus-trap, Esc, return-focus, and `inert` gaps in one swap.
2. **Remove `.dark` block entirely** (`styles.css`). No theme toggle exists; delete `.dark { … }` and `@custom-variant dark`. Brand is light-only.
3. **Hide missing contact links** (`MemberCard.tsx`, `MemberDetailSheet.tsx`). Drop the `memberEmail()` fallback. Render Email button only if `m.email`. Render LinkedIn button only if `m.linkedin`. Open-position card keeps its hardcoded `smif26@purdue.edu`.
4. **Holdings table ARIA** (`holdings.tsx`). Add `aria-sort` to sortable `<th>` (`"ascending" | "descending" | "none"`). Add `aria-pressed` to sector filter chips.
5. **Touch targets ≥ 44×44** — mobile menu trigger, team social icons, sector filter chips. Use `min-h-11 min-w-11` or padding bumps.
6. **`<em className="not-italic">` → `<span>`** in `index.tsx`, `about.tsx`, team intro. Semantic cleanup for screen readers.
7. **`border-white/8` audit.** Tailwind v4 arbitrary opacity needs `/[0.08]` syntax, not `/8`. Replace with `border-white/10` (closest stepped value) site-wide.
8. **SEO meta gaps.** Add `head()` with route-specific title/description/og to any route missing them (audit `index.tsx`, `holdings.tsx`, `team.tsx`, `about.tsx`, `recruiting.tsx`, `publications.tsx`, `contact.tsx`, `sectors.tsx`, `performance.tsx`, `apply.tsx`).
9. **`prefers-reduced-motion` for framer.** `Reveal.tsx` and other `whileInView` components should short-circuit to final state when `useReducedMotion()` returns true.
10. **Member photo 404 noise.** `MemberCard` currently fires jpg→png→null network requests for every member without a `photo`. Track loaded slugs or check existence once; stop hammering 404s on every render.

## Pass B — Mobile & Performance

11. **Holdings table → mobile cards below `md`.** Stacked card per position: symbol + company on top, then a 2-col mini-grid of price, day %, return %, weight. Full 11-col table at `md+`. Keep the sticky sector filter above both.
12. **Hero headline cap** (`index.tsx`). `clamp(2.75rem, 7.5vw, 6rem)`. Verify the stacked name structure doesn't overflow at 360–414px.
13. **LCP hero image.** Add `fetchPriority="high"` and `decoding="async"` on the hero `<img>`. Add `<link rel="preload" as="image" href="...">` in the index route's `head()`.
14. **Sticky header repaint.** Replace `style={{ boxShadow: ... }}` driven by state with a CSS class toggle (`data-scrolled="true"` attribute + selector). One DOM attr write per scroll instead of a React re-render.

## Pass C — Visual restraint

15. **Drop `01/02/03` from home pillars** (`index.tsx`). Keep icons. Leave `about.tsx` process 01–04 alone (it's actually sequential).
16. **Eyebrow audit (surgical, not slash-and-burn).** Keep eyebrows where they add a category the h2 doesn't restate; remove only redundant ones. Concrete cuts (TBD during implementation, expect ~4–6 removals out of ~14, not 10+).
17. **Pillar card hover stripe → background tint.** Remove the `scale-y-0 → scale-y-100` left stripe; on hover apply `bg-secondary/40` + slight icon weight/color shift.
18. **Keep the stat-block `border-l-2 border-gold`** (pushback on item 6). It's editorial and fits the brand.
19. **Keep em dashes** (pushback on item 7). No global find/replace.
20. **Skip copy rewrite** (pushback on item 15). Flag separately for the team to review — not an engineering change.
21. **Process card double-numbering** (`about.tsx`). Keep the giant gold display number, drop the small-caps `01` kicker above it.
22. **Run `bun run format`** at the end.

---

## Out of scope / explicitly skipped

- Item 5 as written ("strip to 3-4 eyebrows total") — too aggressive for this editorial language. Surgical pass instead.
- Item 6 stat-block stripe — kept, fits brand.
- Item 7 em dash purge — kept; em dashes are intentional editorial punctuation paired with Cormorant.
- Item 15 copy rewrite — taste/voice decision, belongs with the team, not an engineering ticket.

---

## Technical notes

- Radix Dialog import path: shadcn already ships `src/components/ui/dialog.tsx`. No new deps.
- Sector bar component is small enough to keep inline; no extraction needed.
- For `aria-sort`, value depends on whether the column is the active `sortKey` — inactive columns get `"none"`.
- For the mobile holdings cards, the existing `holdings` array shape is sufficient; no data changes.
- `prefers-reduced-motion`: framer exports `useReducedMotion()` from `framer-motion` — use that hook inside `Reveal`.
- Don't touch `src/integrations/supabase/*`, `routeTree.gen.ts`, or `.env`.

## Verification

- Build after each pass.
- Browser screenshots at 375px and 1280px for mobile menu, holdings table, sector bars, home pillars.
- Confirm sector bar widths sum visually to the percentages shown (e.g. Information Technology at ~25% should be ~1/4 the bar width).
