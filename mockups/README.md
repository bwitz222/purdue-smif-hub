# Site optimization mockups

Ten pages of purduesmif.org, rebuilt against the site's own design language, so
the design decisions can be reviewed before anyone touches production code.
**Nothing under `src/` is modified by anything in this directory.**

Start at `dist/index.html` — it lists every change with its rationale and links
to all ten pages.

## Building

```bash
node mockups/build.mjs        # mockups/src/*.html → mockups/dist/*.html
```

Each page in `dist/` is fully self-contained: fonts, CSS, JavaScript, and images
are inlined, so a file can be opened straight off disk or published on its own.
The build fails loudly if any include marker goes unresolved.

## Layout

| Path | What it is |
| --- | --- |
| `src/*.html` | Page sources. Include markers, no boilerplate. |
| `_shared/system.css` | The design system. Tokens, type scale, components, motion. |
| `_shared/motion.js` | Behavior. Reveal, count-up, sort, filter, sheet, drawer, theme. |
| `_shared/fonts.css` | Cormorant Garamond 700 + IBM Plex Sans 400/600 + Plex Mono 400, latin subset, base64-inlined. |
| `_shared/header.html`, `footer.html`, `style.html`, `script.html` | Shared partials. |
| `_shared/paths/*.txt` | Pre-computed SVG path data for the performance charts. |
| `build.mjs` | The inliner. Zero dependencies. |
| `dist/` | Generated output. Do not edit by hand. |

### Include syntax

```html
<!--@include _shared/header.html-->        <!-- inlines a file, recursively -->
<!--@img src/assets/hero-campus.webp-->    <!-- emits a data: URI -->
```

Include paths resolve from `mockups/`; image paths resolve from the repo root.

## Design system notes

Tokens in `_shared/system.css` are copied verbatim from `src/styles.css`, so the
mockups cannot drift from the ratified brand. Three tokens are deliberately
different, and each is a recommendation in its own right:

- **`--gain`** moved from `#2E7D52` to `#2A7049`. The live value measures 4.38:1
  on the `--secondary` ground (`#F2EFE7`) at 14px and fails WCAG AA. Like
  `--gold-deep`, this is a derived semantic color rather than a ratified brand
  color, so it is free to move; the new value clears AA at 5.22:1.
- **`--chrome` / `--chrome-soft`** are new. Surfaces that stay dark in both
  registers — header, footer, drawer, mobile apply bar, every `.section--dark`
  band — cannot ride on `--ink`, because desk mode inverts it.
- **`--chart-smif` / `--chart-bench` / `--chart-grid` / `--chart-axis`** are new.
  These were hardcoded inline in `src/routes/performance.tsx`, which let the
  charts drift from the rest of the page.

Everything else — `#CEB888`, `#0A0A0A`, `#7F6335`, `#FAFAF6`, zero radius,
Cormorant/Plex, and the whole `.press` / `.hover-lift` / `.row-rail` /
`.arrow-slide` / `.link-underline` motion vocabulary — is carried over as-is.

## Three bugs worth knowing about

These were hit while building the mockups and are worth checking against the
real components when any of this is ported:

1. **A `::before` on a `<tr>` shifts the whole row.** The pseudo-element is
   inline content, so the table layout algorithm wraps it in an anonymous
   table-cell, pushing every real cell one column right and un-aligning the body
   from its own header. `.row-rail` therefore hangs the rail off
   `td:first-child` on table rows. `src/routes/holdings.tsx` applies `.row-rail`
   to `<tr>` elements — worth a look.
2. **`[hidden]` loses to any author `display` rule.** The UA rule is
   user-agent priority, so `display: flex` on a card silently beats it and the
   "hidden" element keeps rendering. The reset carries
   `[hidden] { display: none !important }`.
3. **Filtering must not touch expandable detail rows.** Matching them with the
   generic row selector un-hides every collapsed thesis the moment a filter is
   cleared, and sorting must move each detail row with its parent or every
   thesis ends up under the wrong position.

## Verification

Checks run against `dist/` with Playwright and axe-core:

- Zero axe violations (WCAG 2.0/2.1 A and AA) on all eleven pages, in the light
  register and in desk mode.
- No horizontal page overflow at 390, 768, 1280, and 1920 px; wide tables scroll
  inside their own container.
- No JavaScript errors at any of those widths.
- Sorting, filtering, search, empty states, row expansion, the slide-over sheet,
  the mega-menu, the mobile drawer, and the apply bar all verified, including
  keyboard-only operation, focus trapping, and focus restoration.
- Under `prefers-reduced-motion: reduce`, every page renders with all content
  visible and no animation running.
- With JavaScript disabled, revealed content is still visible.
