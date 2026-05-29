
# Purdue SMIF — Outside Audit

Walked the site as if I'd never seen it before. Read the code, loaded the live preview, scrolled, screenshotted. Below is what I'd hand a client. No softening.

The site is genuinely good-looking — editorial typography, restrained palette, the sector-bar fix from last round reads honestly now. But there are real credibility and SEO problems hiding under the polish, and the homepage above-the-fold is doing too much.

Severity: **P0** = ship-blocker / credibility risk, **P1** = clearly broken or wrong, **P2** = quality / polish.

---

## P0 — Credibility & SEO basics

**1. Domain is split-brained across the codebase.**
- `src/routes/__root.tsx` JSON-LD: `purduesmif.lovable.app`
- `public/robots.txt` Sitemap directive: `purduesmif.lovable.app`
- `src/routes/sitemap[.]xml.ts` `BASE_URL`: `purduesmif.lovable.app`
- Per-route canonicals + og:url: `purduesmif.org`
- Root `og:url` is literally `"/"` (not a valid absolute URL — OG requires absolute)

Crawlers will see two different canonical hosts pointing at each other. Pick **`https://purduesmif.org`** everywhere (it's the project domain per the knowledge file) and burn the `.lovable.app` references.

**2. `og:image` is a Lovable R2 preview screenshot.**
`__root.tsx` line 34 points at `pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/.../id-preview-...lovable.app-...png`. That URL is ephemeral, contains "id-preview" in the path (LinkedIn previewers will literally show "id-preview" in the source), and isn't on your domain. Also: per the head-meta knowledge file, **og:image must only live on leaf routes** — a root-level og:image overrides every child page's share preview. Move it off root and generate a real branded share card hosted on `purduesmif.org`.

**3. Fabricated performance numbers on a real-domain finance site.**
`src/routes/performance.tsx` lines 22–29 hard-code years 2019–2024 with specific SMIF returns vs. benchmark. If these aren't audited real numbers from the fund, publishing them on the public web is a problem — not just "tacky," but materially misleading for a fund that solicits applications and (presumably) donations. Three acceptable paths: (a) replace with audited numbers from the SMIF advisor, (b) label the section "Illustrative — sample data" above the chart, or (c) remove the chart until real data exists. The current "track record" framing implies these are real.

**4. Demo ticker undermines the whole hero.**
A "Demo" pill in the corner doesn't cancel the perception that those green/red percentages are live market data on a fund's homepage. Average visitor reads "they're showing me their portfolio in real time" → discovers it's fake → trust drops. Either wire it to a real quote feed (you already have `getLiveQuotes` server fn) or delete the ticker. A fake ticker on a real fund site is worse than no ticker.

---

## P1 — Wrong, broken, or actively hurting

**5. `fetchpriority` casing in route `links`.**
`src/routes/index.tsx` line 19: `{ rel: "preload", as: "image", href: tradingImg, fetchpriority: "high" }`. React serializes link attributes as-typed; the spec attribute is lowercase `fetchpriority` on HTML, but TanStack's head serializer expects React-style `fetchPriority`. Verify in the rendered HTML — if it's getting dropped, your LCP preload isn't actually preloading.

**6. Duplicate Google Fonts stylesheet.**
`__root.tsx` line 41 loads the Cormorant + IBM Plex stylesheet. `index.tsx` line 20 loads the exact same stylesheet again in the route's `links`. Browser dedupes, but it's still two parser hits and signals sloppy head management. Remove from `index.tsx`.

**7. Reveal ships invisible HTML to crawlers and no-JS visitors.**
`src/components/Reveal.tsx` uses framer-motion's `initial="hidden"` (`opacity: 0`). Server-rendered HTML therefore contains all content with `opacity:0`, only revealed after hydration + intersection. Two consequences:
- Some crawlers (and any RSS/scraper without a JS engine) get a page with body text invisible.
- The full-page screenshot I just took looked like an empty black void below the hero because IO never fires when nothing scrolls.

Fix: render visible-by-default; use CSS `@starting-style` + view-timeline, or have Reveal render `opacity:1` as the initial server state and animate only after `useEffect` confirms client. Or wrap framer's variants so SSR HTML is visible.

**8. Twitter card type.**
You set `twitter:card: "summary"` but provide a large twitter:image. Should be `"summary_large_image"` to actually get the big preview.

**9. JSON-LD Organization uses wrong URL.**
Same domain issue as #1 — `@id` and `url` are `purduesmif.lovable.app`. Schema.org identifiers in JSON-LD become a Google entity-graph signal. You want them on the canonical domain.

**10. Sitemap is static; doesn't include `lastmod`.**
`sitemap[.]xml.ts` only emits `changefreq` + `priority` — Google deprecated `priority` as a ranking signal years ago and treats `changefreq` as a weak hint. The one thing Google actually uses, `<lastmod>`, isn't there. Add `lastmod` (today's ISO date is fine for static routes; per-content date for holdings/publications once those are data-driven).

**11. 404 vs. error-boundary inconsistency.**
`__root.tsx`: `NotFoundComponent` uses `bg-ink` dark theme; `ErrorComponent` uses `bg-background` light theme. Same site, two visual languages for failure states. Pick one.

**12. `min-h-screen` on the 404 component.**
Use `min-h-dvh` per the a11y knowledge file — `vh` units leave a gap below the mobile address bar on iOS.

---

## P2 — Polish / quality

**13. Hero h1 is five lines tall.**
`Purdue / Student / Managed / Investment / Fund` stacked vertically is dramatic but pushes the CTAs and stats below the fold on a 1440×900 desktop. It's also the LCP element — clamped at `7.5vw` it dominates render time. A two-line treatment ("Purdue Student Managed / Investment Fund" with "Student" in gold) keeps the editorial feel without burying the action.

**14. Double animation on hero stats.**
`CountUp` numbers AND `RevealItem` fade-up trigger at the same moment. Pick one — count-up reads as more confident; fade-up adds nothing on top of it.

**15. Footer renders inside the empty section in static screenshot.**
Cosmetic, but related to #7 — if a journalist or grant officer prints the homepage, they get a black void.

**16. Routes are written as one-line JSX.**
`src/routes/index.tsx` lines 112–115 are 1,000+ character single lines. Unreadable in code review, unreadable in `git blame`. Run `bun run format` or set up Prettier on save.

**17. Font payload.**
4 weights of Cormorant + 4 of IBM Plex Sans + 2 of IBM Plex Mono = ~10 weight requests. Drop to 2 weights per family (display: 600/700; body: 400/500; mono: 400). For the hero headline specifically, consider Google Fonts `&text=PurdueStudntMagInvFd` subsetting since it never changes.

**18. Hero `text-background/65` body copy contrast.**
On `bg-ink`, `background/65` lands around 4.0:1 — under AA for normal text. Bump to `/80`.

**19. Hero ticker badge `text-background/55`.**
Same issue, smaller font — under AA. The badge that calls itself "Demo" should at minimum be legible.

**20. Skip-to-content link.**
Missing. On every page. Keyboard users tab through the entire header on every nav.

**21. Sticky stat block in mission section.**
`-bottom-5 -left-5 bg-gold` over the NYC image — at the `md` breakpoint specifically (768–1024px), verify it doesn't clip into the previous section's bottom border.

**22. Pillars copy mentions "10 sector coverage teams"** while the sectors page presumably lists the actual teams. Confirm they match. If the fund has 8 sector teams + 2 specialist teams, write that — odd round numbers are a tell.

**23. CTA section bottom — anchor target attribute.**
The "Apply to Join" `<a>` has `target="_blank" rel="noopener noreferrer"` ✓, but the visible label gives no indication it opens externally to Qualtrics. Add a small "↗" or "(opens form)" so users aren't surprised.

---

## What I'd fix first (if you only do three)

1. **Kill the fake ticker and either label or remove the chart** (#3, #4). Credibility lives or dies here.
2. **Unify the domain to `purduesmif.org` everywhere and move og:image off root** (#1, #2, #9). One pass, fixes Google + LinkedIn + Twitter previews.
3. **Render Reveal content visible-by-default** (#7). The opacity-zero SSR is the kind of bug that bites you in a Lighthouse audit at the worst possible time.

The rest is genuine polish. The bones are good.

---

## What this plan does NOT do

This is an audit, not an edit. No files have been changed. Approve and I'll implement the P0/P1 items in one focused pass and stop for review before touching the polish list — that way you can sanity-check the numbers question (#3) with the SMIF advisor before I change anything in `performance.tsx`.
