# Purdue SMIF: SEO and discoverability plan

Written 2026-11-10. Evidence comes from three research passes (Firecrawl SERP and competitor research, a technical audit of the code with Lighthouse, and a Semrush attempt) and from a crawl of the merged site. Status words are literal: **Done** means merged to the branch and verified; **Owner** means it needs a decision or an action outside the code; **Blocked** names what is missing.

## 1. Where the site stands

Positions below are from Firecrawl's index on 2026-11-10, directional rather than a rank tracker.

| Query                                  | purduesmif.org | Who is ahead                                                  |
| -------------------------------------- | -------------- | ------------------------------------------------------------- |
| purdue student managed investment fund | #1             | none                                                          |
| purdue smif                            | #1             | none                                                          |
| purdue equity research club            | #1             | none                                                          |
| finance clubs at purdue                | #2             | Daniels clubs directory                                       |
| how to join purdue smif                | #2             | LinkedIn post                                                 |
| student managed investment fund        | #3             | UGA Terry, Kennesaw State                                     |
| purdue investment club                 | #4             | BoilerLink and Instagram for ITP, the Daniels clubs directory |
| purdue stock pitch competition         | not in top 10  | Purdue Pitch portal, Moonshot, Daniels case competitions      |

Reading: the site owns its brand queries. The open ground is the generic head terms ("investment club", "student managed investment fund") and the pitch intent, and the three weak spots below.

1. **Facts disagree across the web.** The site says founded 1995, and that is confirmed (2026-11-10). LinkedIn and Instagram say 2009, and until this branch the site's own social-card images said "EST. 2009". Fund size ranges from $270,000 to $600,000 across the Daniels page, a Facebook group, RocketReach and the course catalog. Search engines and AI answers read all of these.
2. **The best page for the strongest target query had one internal link** (the footer).
3. **No page targeted** "student managed investment fund" as a concept, the pitch process, or the interview-prep long tail.

Already strong, and not touched: one h1 per page and no skipped levels, canonical and robots on every page, Organization schema with stable ids, FAQ markup, a good `llms.txt`, clean 404/301 behavior, immutable asset caching, zero layout shift, Lighthouse SEO 100.

## 2. Targets and how to measure them

| Target                                                                         | Measure                                | Where                                            |
| ------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------ |
| Hold #1 on brand queries                                                       | weekly position check                  | Search Console, Semrush position tracking        |
| Reach top 3 for "purdue investment club" and "student managed investment fund" | position, impressions, clicks          | Search Console                                   |
| Rank for "purdue stock pitch" intent                                           | position for the page `/stock-pitches` | Search Console                                   |
| Home mobile LCP under 2.5 s in the field                                       | p75 LCP                                | Vercel Speed Insights, Search Console CWV report |
| Every public fact identical across the site and its profiles                   | audit checklist in section 5           | manual, quarterly                                |
| 4 to 6 direct links from official Purdue pages                                 | referring domains                      | Search Console links report, Semrush backlinks   |

## 3. Workstreams

### A. Platform and performance: Done

- HTML now sends `s-maxage` with stale-while-revalidate (5 to 10 minutes for data pages, longer for static ones); social cards, favicon and logo cache for a day. The HTML is identical for every visitor and carries no cookies or personal data; live figures load through client queries after the page loads.
- Security headers: nosniff, referrer policy, permissions policy, X-Frame-Options. A Content-Security-Policy is deliberately not set yet (see section 6).
- Trailing-slash URLs such as `/about/` still get the router's 307 to `/about`. A permanent 308 was tried and removed: Vercel matches a route source without regard to the trailing slash, so the rule redirected `/about` to itself in an endless loop on the preview deployment. Fixing the 307 needs a different mechanism (for example the `trailingSlash` setting in `vercel.json`), tested on a preview first.
- The 56 KB logo PNG shown at 28 to 64 px is now a 4 KB WebP.
- JavaScript removed from the critical path: the contact form no longer ships the full Supabase client, zod or the toast library. Chunk sizes (raw): entry 586,708 to 498,136 bytes; `/contact` 263,116 to 59,264; `/holdings` 151,388 to 25,095. `framer-motion` is no longer a dependency.
- Home mobile LCP 3.1 s to 1.4 to 1.5 s (production build, brotli): the decorative skyline now loads small and at low priority, and the duplicate hero preload is gone.

### B. Metadata, structured data, AI readiness: Done

- Titles 50 to 60 characters and descriptions 140 to 155, held by unit tests; one title pattern, `Topic | Purdue SMIF`.
- Per-card social image alt text; a dedicated social card for the finance-clubs guide.
- The 404 and error pages render exactly one title and one `noindex` robots tag (they rendered two of each).
- Organization schema: removed the unsupported slogan, two ambiguous aliases and the retired SearchAction; added `legalName` and `contactPoint`.
- Member pages: templated titles and descriptions, headshot in the Person schema, no email address in structured data.
- Sitemap: 60 URLs, each with a real `lastmod` (data pages use their data date); `changefreq` and `priority` removed because Google ignores them.
- Dataset markup for `/holdings` and for `/performance` (the latter only when real data loaded, because the page labels fallback figures as illustrative). Article dates, image and a visible "Updated" line on the finance-clubs guide.
- Recruiting events are published as structured data only when the time and venue are confirmed (7 of 10 today).
- `llms.txt` refreshed, `llms-full.txt` added, web app manifest added.

### C. Content and internal linking: Done

New indexable pages, each with its own title, description, one keyword-bearing h1, breadcrumbs and FAQ drawn only from existing site copy:

- `/student-managed-investment-funds`: the pillar page for the head term.
- `/stock-pitches`: how pitches work and where to read the decks. It states plainly that no public pitch competition is listed; do not add one unless it exists.
- `/recruiting/technical-interview-prep` and `/recruiting/behavioral-interview-prep`: the existing guides moved to their own URLs, with summaries and the old anchors kept on `/recruiting`.
- `/learn/glossary`: the glossary as its own page.
  Also: a plain "what is SMIF" section on the home page with employers as real text, descriptive internal links to the finance-clubs guide from the home, about, apply, recruiting and learn pages, member pages linking to their sector team, and keyword-bearing headings (`/apply` is now "How to join Purdue SMIF", `/contact` is "Contact Purdue SMIF").

### D. Entity consistency: Partly done, rest is Owner

This is the highest-value item and no code can do it.

1. **Founding year: decided, 1995. Done on the site.** The site, structured data, `llms.txt`, the production `fund_stats` row and now the social cards all say 1995. LinkedIn and Instagram still say 2009 (owner action, item 2). Until they change, AI answers and search snippets can still pick the wrong year.
2. Fix every profile to match: LinkedIn and Instagram bios, the Daniels MS Finance page (states about $400,000), the Purdue course catalog (states $300,000 as of 2017), the Facebook group, RocketReach.
3. Decide whether to state the origin gift (LinkedIn and RocketReach mention a $100,000 donation) and the course-credit option (BoilerLink lists 1 or 2 credit hours); both are on other sites but not on this one.
4. **Social cards: Done.** Four cards carried text that contradicted the site and were corrected in place (only the text line changed): `og-about` and `og-share` ("EST. 2009" to "EST. 1995"; "Premier" dropped), `og-team` ("50+ analysts across 10 sector teams" to "50+ members across 10 teams"), `og-sectors` ("Eleven coverage teams" to "Eight equity sector teams"). Sizes are unchanged, so the declared dimensions still match. Facts still undecided: fund size as-of date, the origin gift, and the course-credit option (item 3).
   Social platforms cache cards by URL. After deploy, re-scrape the key pages in the LinkedIn Post Inspector and the Facebook Sharing Debugger so the old images stop showing.

### E. Authority and off-site: Owner

- **Official Purdue links** (the largest ranking lever left; one link from business.purdue.edu outweighs most on-site tuning). Ask for a direct link to purduesmif.org, and a correction where noted:
  1. business.purdue.edu MS Finance Student Experience page: fix the "$400,000" and point "Apply to Join SMIF" at the site.
  2. business.purdue.edu undergraduate student clubs page (currently links to BoilerLink only).
  3. The Daniels "Purdue business clubs build leaders" article.
  4. The Purdue Finance Workshop page.
  5. The catalog entry for MGMT/FIN 51300 (stale size).
  6. The campuslabs organization profile (add the site URL).
  7. The three faculty advisor profile pages.
- **Substack** ("The Boiler Beta") has one post. Either publish on the weekly cadence it promises or stop promising it.
- **One short video** explaining how the fund invests real money (YouTube or Reels); none exists today.
- **Independent coverage:** a Daniels School news item or campus press piece. This is the route to third-party corroboration. Do not create a Wikipedia article without independent secondary sources.
- **Google Business Profile and Search Console:** confirm ownership of both the apex and `www` properties, submit the sitemap, and request indexing for the new pages. These could not be checked from here.

### F. Measurement: Blocked on Semrush

- Semrush returned no data: seven toolkits reported no API units and Traffic reported no subscription, so there are no volume, difficulty or backlink numbers in this plan and none were estimated. Add API units (and a Semrush project for the domain), then rerun domain overview, keyword research for the ten target seeds, organic positions 4 to 20, competitors and backlink gaps.
- Firecrawl cannot see People Also Ask or other SERP features; they need Semrush or a manual check.
- Wire field data to decisions: Speed Insights is already loaded. Set a budget (home p75 LCP under 2.5 s, entry chunk under 100 KB brotli).

### G. Next content (not started)

- On-site research pages (`/research/<slug>`) with abstract, date, author and ticker, so reports are indexable pages instead of off-site files. Needs live data to verify.
- Per-member social images; dated, recurring content (Macro Brief and semester letters as on-site posts).
- A `/stock-pitches` section for any real public event, if one exists.

## 4. Roadmap

| Window        | Work                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Week 1        | Ship this branch. Decide the remaining facts (D3). Submit the sitemap in Search Console. Add Semrush API units and rerun research (F).                    |
| Weeks 2 to 4  | Correct third-party profiles (D2). Send the Purdue link requests (E). Check the live contact form once after deploy.               |
| Weeks 4 to 8  | Review Search Console for the new pages' impressions and queries; tune titles on pages with high impressions and low clicks. Publish on-site research pages (G). |
| Weeks 8 to 12 | Refresh dated pages, reassess head-term positions, add the next missing page indicated by Search Console queries.                                                |

## 5. Quarterly fact check

Each quarter confirm that these read the same on the site, its structured data, `llms.txt`, LinkedIn, Instagram, BoilerLink, the Daniels pages and the course catalog: founding year, fund size (with an as-of date), member count, advisor names, program structure, application cycle and contact address.

## 6. Risks and notes

- **Caching:** HTML is cached at the edge for minutes. Live numbers on `/holdings` update through client queries after the page loads, so they do not depend on the cached HTML, but a crawler sees the figures as of the render.
- **Content-Security-Policy:** not enforced; the allowed origins (analytics, Supabase, the application forms) were not enumerated. Add it in report-only mode first.
- **Sitemap dates:** static pages share `LAST_CONTENT_UPDATE` in `src/lib/seo.ts`. Bump it whenever page copy changes, or the dates stop being truthful.
- **Holidays:** the market calendar and its "behind by N sessions" labels list NYSE holidays through 2027.
- **Always test header and redirect rules on a deployed preview.** They looked correct in the build config and broke four pages on the real deployment.
- **Verified on a deployed preview:** pages return 200 with no redirect loop; the first request to a page is a cache MISS and the second a HIT (`x-vercel-cache`), so edge caching works. Vercel removes `s-maxage` from the header it shows clients, so the visible value is just `public`. The security headers are present, and `/about/` redirects to `/about` (307).
- **Not verified:** the `@PurdueSMIF` Twitter handle (the site returned an error) and the contact form's database insert (no credentials locally; do one real submission after deploy).
