# Purdue SMIF

The website for the Purdue Student Managed Investment Fund — <https://www.purduesmif.org>.

TanStack Start (React + Vite, SSR) on Vercel, with Supabase for live data.

## Running it locally

```bash
npm install
cp .env.example .env    # then fill in the values below
npm run dev             # http://localhost:8080
```

### Environment variables

The app reads these at build and request time. Without them, pages still render —
every route degrades to static data rather than erroring — but live quotes,
performance, publications and the contact form will not work.

| Variable                        | Needed for                            | Where it comes from                                       |
| ------------------------------- | ------------------------------------- | --------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Browser-side Supabase client          | Supabase project settings                                 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-side Supabase client          | Supabase project settings (public by design)              |
| `SUPABASE_URL`                  | SSR / server functions                | Same value as the `VITE_` one                             |
| `SUPABASE_PUBLISHABLE_KEY`      | SSR / server functions                | Same value as the `VITE_` one                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Quote cache, fund stats, risk metrics | Supabase project settings — **server only, never expose** |
| `REFRESH_HOOK_SECRET`           | Gating the two cron webhooks          | Any high-entropy string; must match the pg_cron jobs      |
| `POLYGON_API_KEY`               | End-of-day prices                     | polygon.io                                                |
| `ALPHA_VANTAGE_API_KEY`         | S&P 500 benchmark, risk-free rate     | alphavantage.co                                           |

In production these live in the Vercel project's Environment Variables, not in
the repository. See `.env.example` for the annotated list.

## Scripts

| Command                    | What it does                                                     |
| -------------------------- | ---------------------------------------------------------------- |
| `npm run dev`              | Vite dev server                                                  |
| `npm run build`            | Production build (Nitro → Vercel Build Output API)               |
| `npm test`                 | Unit tests (Vitest)                                              |
| `npm run test:e2e`         | Boots a dev server, drives every page in Chromium, runs axe-core |
| `npm run lint`             | ESLint                                                           |
| `npm run format`           | Prettier                                                         |
| `npm run publish:research` | Post a PDF/deck to `/research` (see "Posting research" below)    |

`test:e2e` needs a Chromium. CI installs one with `npx playwright install chromium`.
If you already have a browser on disk, point at it:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

## Where the content lives

Most of what you'd want to change is data, not components.

| What                                                      | File                                          | Notes                                                                                                                                                          |
| --------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Roster: names, roles, emails, class years, bios, LinkedIn | `src/data/team.ts`                            | Grouped by board / sector team / FIM / PM / faculty                                                                                                            |
| Member headshots                                          | `src/assets/team/*.webp`                      | Wired up in `PHOTO_BY_NAME` in `src/data/team.ts`                                                                                                              |
| Portfolio positions: shares, cost basis, industry, beta   | `src/data/holdings.ts`                        | Refreshed each quarter against the custody statement. Live prices come from Supabase and overwrite the rest                                                    |
| Recruiting calendar                                       | `src/lib/recruiting-calendar.ts` (`CALENDAR`) | Drives the countdown, the schema.org Events, the `.ics` download, and whether every Apply button is live (open from the first event until the first interview) |
| Learn curriculum and downloads                            | `src/routes/learn.tsx`                        | Downloadable models live in `src/assets/`                                                                                                                      |
| Page titles, descriptions, social cards                   | each route's `head()` + `src/lib/seo.ts`      | `socialMeta()` builds the OG/Twitter block                                                                                                                     |
| Header, footer and search navigation                      | `src/lib/nav.ts`                              | 5 primary items (Portfolio and Join are groups); the header search indexes these pages too                                                                     |

Publications on `/research`, fund stats, quotes and performance history come from
Supabase, not from files.

### Adding a team member

1. Add them to the right group in `src/data/team.ts`.
2. Drop a square-ish headshot at `src/assets/team/<first-last>.webp` and register
   it in `PHOTO_BY_NAME`. Without one, the card falls back to initials.
3. Optionally add a bio to `BIO_BY_NAME` and a URL to `LINKEDIN_BY_NAME`.

Everything else follows automatically: the roster page, the per-member page at
`/team/<first-last>`, the sitemap entry and the `Person` structured data are all
derived from `memberDirectory`.

### Posting research

Everything on `/research` (The Macro Brief, pitch decks, equity research,
semester and annual reports) is a row in the Supabase `publications` table plus
a file in the `publications` storage bucket. One command does both:

```bash
npm run publish:research -- --category pitch --file ./NVDA-pitch.pdf \
  --title "NVIDIA (NVDA): The Inference Build-Out" --date 2026-11-04 \
  --ticker NVDA --sector "Information Technology" --position Long \
  --authors "Chris Andreou, Parth Dama" --description "One-sentence summary."
```

- `--category`: `macro`, `pitch`, `equity_research`, `semester`, or `annual`.
- `--date` is the publication date shown on the site. `--issue` numbers a Macro Brief.
- Pitch decks need `--ticker`; `--sector` and `--position` (`Long`/`Short`) are optional.
- Add `--dry-run` first to check the row without uploading anything.
- Needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your environment or `.env`.
  The service-role key is admin access, so keep it on your own machine.

It appears on the site on the next page load; no redeploy. PDF is best for decks
(it previews in the browser); `.pptx`, `.docx` and `.xlsx` also work.

## Architecture notes worth knowing

- **Route loaders must not throw.** `/holdings` and `/research` used to return
  HTTP 500 whenever Supabase was unreachable, because a rejected loader takes the
  whole page down. Both now catch and fall back to static data. If you add a
  loader that fetches, degrade rather than throw — `npm run test:e2e` runs with no
  Supabase credentials specifically to catch this.
- **Motion is a shared vocabulary**, not per-component CSS. `.press`,
  `.hover-lift`, `.hover-raise`, `.row-rail`, `.arrow-slide`, `.icon-pop`,
  `.link-underline` are defined in `src/styles.css` and are all gated behind
  `prefers-reduced-motion`.
- **Colour tokens are contrast-checked.** `--gold-deep` is set to a value that
  clears WCAG AA on every ground it is used against. If you darken a background or
  lighten that token, re-run `npm run test:e2e` — it fails on any new axe violation.
- **12px is the type floor.** Nothing visible renders under 12px; `npm run test:e2e`
  fails on any page that does. Use `text-xs` for the smallest labels, never `text-[10px]`.
- **Apply buttons go through `<ApplyCta>`.** It links to the Qualtrics form only while
  the application window in `src/lib/recruiting-calendar.ts` is open, and to /recruiting
  or a mailing-list email otherwise. Don't hand-roll `applyUrl()` links.
- **`src/routeTree.gen.ts` is generated.** Don't edit it.

## Deployment

Pushing to `main` triggers a Vercel production deploy. Pull requests get preview
deployments. CI (`.github/workflows/ci.yml`) runs typecheck, unit tests, the
production build, and the browser + accessibility suite on every pull request.
