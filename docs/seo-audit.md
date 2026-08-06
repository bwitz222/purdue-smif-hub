# SEO Audit — purduesmif.org

**Date:** August 6, 2026
**Scope:** organic search performance for one visitor type — a Purdue student
targeting a career in high finance (equity research, asset management, private
equity, investment banking, private credit, and adjacent seats) who is deciding
which finance club to apply to.
**Companion document:** [`seo-keyword-map.md`](./seo-keyword-map.md), the search
terms this audit is measured against.

---

## Method and limits

Read this section before acting on anything below. Two constraints shaped what
this audit can and cannot claim.

**Almost no search volume data.** Keyword research ran through the KeywordTool
MCP connector on its guest tier. That tier returns keyword strings but withholds
metrics: of roughly 2,600 terms pulled across 19 seed queries, 7 carried cached
search volume. **Every priority call in these two documents is therefore based on
intent quality — how close the searcher is to submitting an application — and not
on volume.** A term that 12 people search in September, all of them sophomores
who then apply, outranks a term 4,000 strangers search. That is the right basis
for a recruiting site anyway, but nothing here should be read as a traffic
forecast.

The one exception worth naming: `private credit` returned 27,100 monthly searches
with a trend value of +22. It is the only strategically relevant term in the
engagement with hard numbers behind it, and it is a phrase this site never uses.
See finding 4.

Confirming volume elsewhere needs a paid tier or a Google Search Console export,
and Search Console will be better regardless because it reports the queries this
site already surfaces for.

**The live site was verified through Vercel, not a direct fetch.** Ordinary HTTP
to `purduesmif.org` and `www.purduesmif.org` is refused at this session's proxy
(`403` to `CONNECT`), because Cloudflare bot management fronts the domain. The
production HTML was instead retrieved through Vercel's authenticated fetch, which
returned `HTTP 200` and the complete server-rendered document. Findings marked
**[verified in production]** were checked against that response.

Still outside reach: real index coverage, Core Web Vitals, and the two look-alike
domains in finding 2, which the same proxy refuses. Those remain
**[unverified]**.

Findings cite `path:line` against the working tree at commit `213247c`, which is
also the commit currently serving production.

### Production state at time of audit

| Item                  | Value                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| Live URL              | `https://www.purduesmif.org` — HTTP 200, server-rendered                 |
| Apex behavior         | `purduesmif.org` → `308` permanent redirect → `www`                      |
| Vercel project        | `purdue-smif-hub`, framework `tanstack-start`, Node 24.x                 |
| Production deployment | `dpl_F6s1aDa6gGXhWyFtvbTVyNUor2Bh`, state `READY`                        |
| Production commit     | `213247c` (merge of PR #11), branch `main`                               |
| Edge                  | Cloudflare in front of Vercel (`cf-ray` present, `x-vercel-cache: MISS`) |
| Caching               | `public, max-age=0, must-revalidate` — SSR per request                   |

The apex-to-`www` direction is correct and matches the canonical tag, the
sitemap, and `SITE_URL` in `src/lib/seo.ts:4`. No mismatch anywhere.

---

## What already works

Stating this first so the fix list reads as additive rather than corrective. For
a student-run site, the technical baseline here is unusually strong.

**Rendering.** Every route is server-rendered through `src/server.ts` and Nitro's
Vercel preset. There is no `index.html` in the repository at all; the HTML shell
is the React root at `src/routes/__root.tsx:148-150`. Crawlers receive complete
markup with head tags resolved, not a hydration stub. This is the single most
common failure mode for club sites built on Vite, and this site does not have it.

**Metadata.** `src/lib/seo.ts` centralizes the work: a `canonical()` builder
(`:37`), `socialMeta()` (`:62-91`) emitting a full Open Graph and Twitter block,
and `breadcrumbLd()` (`:43-55`). All 12 content routes carry a distinct title,
description, canonical link, and social card. No route hardcodes the host.

**Structured data.** Organization and WebSite nodes in a `@graph`
(`__root.tsx:79-139`), with `alternateName`, `foundingDate`, `parentOrganization`,
postal address, and a `sameAs` array that correctly leads with BoilerLink. On top
of that: `BreadcrumbList` on 11 routes, `FAQPage`, `AboutPage`, `ContactPage`,
`ProfilePage`, `Person`, `Event` ×10, and three `ItemList` variants.

**Testing rigor.** `src/lib/seo.test.ts` parses the actual JPEG SOF marker of
each social card to assert the declared `og:image:width` and `og:image:height`
match the file on disk. Almost nobody does this. It exists because Facebook and
LinkedIn size the preview box from those tags before the image finishes loading,
so a wrong value ships a stretched card.

**Crawl directives.** `public/robots.txt` allows everything, disallows only the
secret-gated `/api/` webhooks, and points at the sitemap.
`src/routes/sitemap[.]xml.ts` generates 11 static entries plus one per member
profile. Its deliberate omission of `<lastmod>` (`:24-25`) is defensible: a
lastmod stamped with the request date trains crawlers to ignore the field.
`public/llms.txt` exists and is genuinely well written.

---

## P0 findings

### 1. `/apply` is orphaned from the site's own link graph

The most search-valuable page on the site receives one internal link, and that
link is hidden on mobile.

`src/lib/nav.ts:3-12` defines the canonical nav as eight routes. `/apply` and
`/contact` are not among them, and both `SiteHeader` (`:48`, `:102`) and
`SiteFooter` (`:25`) render from that same array. Meanwhile every "Apply to Join"
call to action resolves through `applyUrl(placement)`
(`src/lib/apply-url.ts:19-27`) and points off-site to Qualtrics:

| Surface              | Line                         | Destination                       |
| -------------------- | ---------------------------- | --------------------------------- |
| Header button        | `SiteHeader.tsx:61`          | Qualtrics                         |
| Mobile menu          | `SiteHeader.tsx:134`, `:144` | Qualtrics                         |
| Home hero            | `index.tsx:117`              | Qualtrics                         |
| Home closing CTA     | `index.tsx:266`              | Qualtrics                         |
| Footer               | —                            | no apply link at all              |
| Home mission section | `index.tsx:200`              | `/apply`, `hidden md:inline-flex` |

So `/apply` has exactly one inbound internal link, and it is invisible below the
`md` breakpoint. Search engines distribute authority along internal links; a page
this isolated reads as peripheral no matter how good it is.

**[verified in production]** The live homepage HTML confirms all of it: the
primary nav renders exactly eight anchors, About through Recruiting, with no
`/apply`; the header button resolves to
`purdue.ca1.qualtrics.com/...&utm_content=header-apply`; the footer "Explore"
column repeats the same eight; and the document contains exactly one
`href="/apply"`, carrying `class="group hidden md:inline-flex ..."`.

It is not peripheral. `/apply` carries the `FAQPage` schema
(`src/routes/apply.tsx:30-42`) built from nine question-and-answer pairs
(`:73-110`) that answer, almost verbatim, the questions prospective applicants
type into Google:

- "Is SMIF a finance club or an investment club?"
- "How is SMIF different from other finance clubs at Purdue?"
- "Do I need finance experience to apply?"
- "Is SMIF only for finance majors?"
- "How competitive is the application?"
- "Can freshmen apply?"

That is cluster 4 and cluster 6 of the keyword map, the two highest-intent
clusters, already answered in copy, already marked up for rich results, and
effectively unlinked. The content problem is solved. The plumbing is not.

**Recommended change.** Add `/apply` to `NAV` in `src/lib/nav.ts`. Point the
header and mobile-menu buttons at `/apply` instead of `applyUrl()`, and keep the
Qualtrics link as the primary button on that page, where it already lives
(`apply.tsx:209-253`).

Two consequences to decide on before implementing. First, the funnel gains one
click between "Apply" and the form — real friction, weighed against a page that
can finally rank on questions it already answers, and against a landing page that
sets expectations before someone opens a 10-minute form. Second, the
`"header-apply"` and `"mobile-menu"` members of the `ApplyPlacement` union
(`src/lib/apply-url.ts:8-17`) become unreferenced, so the change should either
drop them or reassign them to the on-page buttons to keep Qualtrics attribution
intact.

A lighter alternative, if the click cost is unacceptable: leave every CTA pointed
at Qualtrics and instead add contextual `/apply` links from `/about`,
`/recruiting`, `/learn`, and the footer. Weaker signal, zero friction.

### 2. Look-alike properties rank on brand searches

**Ownership, confirmed.** The only hostnames SMIF operates are `purduesmif.org`
and `www.purduesmif.org`. This is confirmed two ways: the fund's own statement,
and the Vercel project's domain list, which contains those two plus Vercel's
automatic `.vercel.app` hostnames and nothing else. **Neither of the properties
below belongs to SMIF.**

| Property                           | Status                                                                                                                                      | Evidence                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `www.purduesmif.org`               | Canonical, SMIF-operated. States $638,000 in assets under management.                                                                       | Fetched, HTTP 200                              |
| `www.purduesmif.com`               | Not SMIF's. Appears on brand searches titled "About Us \| SMIF Website," with a summary citing roughly $450,000 in assets under management. | **Search-index snippets only — never fetched** |
| `purdue-smif-xmmhrmch.manus.space` | Not SMIF's. Appears on brand searches as "Purdue SMIF - Student Managed Investment Fund." Presentation suggests AI-generated.               | **Search-index snippets only — never fetched** |

**Evidence limitation, stated plainly.** Both look-alikes were surfaced by web
search and were never retrieved directly; the session's network policy refused
them at the proxy exactly as it refused the real site. So this audit cannot
confirm they are currently live, cannot confirm their present content, and cannot
confirm the $450,000 figure is on the page today rather than in a stale index
entry. What can be confirmed is that both rank on brand queries.

That is still the problem worth acting on. A prospective applicant searching the
fund's name is shown results that are not the fund's, at least one of them
carrying an assets-under-management figure roughly 40% below the real one. An
assistant summarizing "how much does Purdue SMIF manage" may quote it.

**Recommended actions**, none of which are code changes:

1. **Verify first.** Open both URLs from a normal browser and record what they
   actually serve today. Everything below depends on that.
2. **`purduesmif.com`** — since SMIF does not own it, the options are acquiring
   the registration if it is available, or, if it misrepresents the organization,
   requesting removal through the registrar or host. Do not assume it is
   recoverable.
3. **`purdue-smif-xmmhrmch.manus.space`** — request removal from the publishing
   platform. Google Search Console's removals tool only affects Google's index
   and only for pages you verify ownership of, so it will not apply here.
4. **Do not add either to `sameAs`** (`__root.tsx:118-127`). `sameAs` asserts
   "these are also us," which is the opposite of the goal.
5. The durable defense is making `purduesmif.org` unambiguously the strongest
   result: findings 1, 3, and 4 all serve that.

**Related, minor:** the stat band renders assets under management as `$638K`
(verified in the production HTML). SMIF editorial style never abbreviates
thousands. `$638,000` is the correct form and also reads as more precise, which
is the point on a page arguing that the money is real.

**Related, minor:** the stat band renders assets under management as `$638K`
(`src/routes/index.tsx:76-81`, fallback `:43-48`). SMIF editorial style never
abbreviates thousands. `$638,000` is the correct form and also reads as more
precise, which is the point on a page arguing that the money is real.

### 3. The acronym is entity-poisoned — optimize for the description instead

"SMIF" does not belong to this organization in any search index, and the data is
blunt about it.

Google autocomplete for `purdue smif` returns almost entirely Braden Smith
basketball terms: `purdue smith assists`, `purdue braden smith height`,
`purdue smith basketball`, `purdue smith hall`. Google is not disambiguating a
rare term; it is correcting what it assumes is a typo for "smith." Bing behaves
the same way, returning `purdue smith hall`, `purdue smart plan`, and
`purdue smif n wessun`. Bare `smif` maps to Smif-N-Wessun, a hip-hop duo, and to
SMIF pods, the wafer carriers used in semiconductor fabs.

This is not a fixable ranking gap. It is a naming collision with a Big Ten
basketball program and a 1990s rap catalog, and neither is going to yield.

**What follows from it:**

- Rankings will be won on descriptive phrases — "purdue student managed
  investment fund," "purdue investment club," "purdue finance club" — not on the
  acronym. The site already leans this way, which is the right instinct.
- The mishearing is worth owning deliberately. A student who heard the name
  spoken at a callout will type `purdue smith fund` or `purdue smif club`.
  Nothing on the site currently contains the string "Smith."
- `alternateName` (`__root.tsx:89-94`) currently lists four variants. Adding
  "SMIF at Purdue" and "Purdue SMIF Club" costs nothing and widens the entity's
  surface. Note that schema `alternateName` is an entity signal, not a ranking
  keyword; it will not by itself win the "smith" queries.
- Practically: never write a title tag where "SMIF" is the only identifying
  token. Every current title already pairs it with descriptive words. Keep that
  rule.

### 4. The site describes a narrower career surface than the fund serves

SMIF is built for students breaking into high finance broadly: equity research,
asset management, private equity, investment banking, private credit, and the
adjacent seats. The site names four of those and stops.

| Location                   | Copy                                                                                 | Paths named          |
| -------------------------- | ------------------------------------------------------------------------------------ | -------------------- |
| `src/routes/index.tsx:163` | "careers in asset management, investment banking, and equity research"               | AM, IB, ER           |
| `src/routes/index.tsx:60`  | "Purdue alumni at investment banks, hedge funds, and asset managers"                 | IB, HF, AM           |
| `src/routes/about.tsx`     | Employer logos: Morgan Stanley, Barclays, BMO Capital, Wells Fargo, and the Big Four | Banks and accounting |

A repository-wide search returns zero occurrences of "private equity," "private
credit," "venture capital," "sales and trading," "restructuring," or "corporate
development" anywhere in the routes, components, or `llms.txt`. **[verified in
production]** — both sentences appear in the live homepage HTML exactly as
quoted, and none of those six phrases appears anywhere in the served document. The word "credit"
appears twice, both times describing what the Fixed Income & Macro team analyzes
(`src/routes/sectors.tsx:46`, `src/routes/learn.tsx:85`), never as a destination
a member might be aiming for.

This costs applications before it costs rankings. A sophomore targeting private
equity reads the mission copy, sees three paths that are not theirs, and
concludes the fund is for someone else.

**The capability is already there and simply unlabelled.** `learn.tsx:81` teaches
precedent transactions, which is deal work. `learn.tsx:85` teaches rates, the
yield curve, and credit, which is the private credit foundation. `sectors.tsx:46`
runs a team covering rates, credit, FX, and macro. What is genuinely missing is
leveraged buyout modeling: no LBO module, no LBO template beside the AMZN
discounted cash flow and comparable company analysis files, and no mention of the
paper LBO, which is the most predictable private equity interview exercise there
is.

The keyword consequence is large. Cluster 7 of the keyword map now runs eight
sub-clusters, and the private equity and private credit sections are almost
entirely Gap. Notably, `private credit` is the **only term in this entire
engagement that returned search volume** — 27,100 monthly with a rising trend
value of +22 — against a site that never uses the phrase.

**Recommendation.** Add a `/careers` page, or a substantial section on `/about`,
organized by destination with one heading per path. Two constraints. First, name
only paths with a real placement record; the employer logos currently show banks
and the Big Four with no private equity or private credit firm, so either the
logos should reflect those placements or the copy should describe transferable
skills rather than imply placements that did not happen. Second, do not chase
bare "how to break into private equity" — that belongs to Wall Street Oasis. The
winnable phrasings are Purdue-qualified and club-qualified.

Two supporting changes worth pairing with it: ship an LBO model template
alongside the existing AMZN files on `/learn`, and add private credit to the
Fixed Income & Macro description on `/sectors` as a career destination rather
than only an asset class.

---

## P1 findings

### 5. `/holdings` has essentially no indexable prose

The page has one `<h1>` (`src/routes/holdings.tsx:286`, "Current portfolio.") and
four `<h2>` elements that are all `sr-only`: Portfolio Summary (`:338`), Sector
Allocation (`:409`), Today's Movers (`:455`), Holdings (`:491`). Everything else
is a data table.

The screen-reader-only headings are correct accessibility practice and should
stay. The problem is that nothing else on the page explains what is being shown.
For a search engine the page reads as a ticker grid with a two-word heading.

`/holdings` is also the page that best supports the site's central claim — that
the capital is real. It carries `priority 1.0`-adjacent weight in the sitemap
(`sitemap[.]xml.ts:25`, `changefreq: daily`) and is linked from the home hero.

**Recommendation:** add two or three sentences of standing prose below the `h1`
describing what the table shows, how positions enter the Portfolio, and how often
prices refresh. Make at least the "Sector Allocation" and "Holdings" headings
visible. This is a copy change, not a schema change, and it does not require
touching the live-quote path.

### 6. No `Course` or `LearningResource` schema on `/learn`

`/learn` is the richest keyword surface on the site: a six-module curriculum, a
nine-book reading list, a tools section, a glossary, and downloadable AMZN DCF and
comparable company analysis models (`src/assets/dcf-model-amzn.xlsx`,
`amzn-cca.xlsx`). Its headings alone (`learn.tsx:134-140`) cover most of keyword
cluster 8.

It carries only a `BreadcrumbList`. A `Course` or `ItemList` of
`LearningResource` nodes over the six modules would make the curriculum eligible
for structured presentation, and it is the one page here whose content genuinely
warrants it.

### 7. No web app manifest

There is no `site.webmanifest` or `manifest.json` in `public/`, and no
`<link rel="manifest">` in `__root.tsx:67-78`. `theme-color` is set (`:60`) and
both favicon formats exist, so this is the last piece of a standard install
surface. Low effort, small payoff, no risk.

### 8. No `SearchAction` on the `WebSite` node

The `WebSite` node (`__root.tsx:129-135`) has no `potentialAction`. This is
correct as things stand, because the site has no search endpoint to point one at.
Recording it here as a conditional: if site-wide search ever ships, add the
sitelinks searchbox at the same time. Do not add it before then, since declaring
a search endpoint that does not exist is worse than declaring nothing.

---

## P2 findings

### 9. `/research` structured data sits in the body, not the head

`src/routes/research.tsx:99-104` renders its `ItemList` of `Article` nodes as a
raw `<script>` inside the component body via `dangerouslySetInnerHTML`, unlike
every other route, which emits schema through `head()`.

**This is not the crawl problem it looks like.** The route has a real SSR loader
(`:16`) and reads through `Route.useLoaderData()` (`:57`), so the publications
are resolved server-side and the JSON-LD ships in the initial HTML. Google
accepts JSON-LD anywhere in the document. The escaping at `:96` is careful work.

Two genuine but small notes. The block is gated on `pubs.length === 0`
(`:77`), so during a Supabase outage the page still renders while the schema
silently vanishes — consistent with the repo's documented degradation policy, but
worth knowing. And the inconsistency with the other 11 routes is a maintenance
trap more than a ranking one.

### 10. `keywords` meta tag is dead weight

`__root.tsx:58` ships a nine-term `keywords` meta. Google has ignored this tag
since 2009 and Bing treats it as a spam signal at worst, noise at best. Harmless
to keep, cleaner to delete. Worth noting that its content is a decent record of
intended positioning, so if it goes, the keyword map document replaces it.

### 11. `twitter:site` points at a possibly nonexistent account

`__root.tsx:65` declares `@PurdueSMIF`. No X or Twitter link appears in `sameAs`
(`:118-127`) or in `SiteFooter`, which links BoilerLink, Instagram, LinkedIn, and
Substack. Either the account exists and should be in `sameAs` and the footer, or
it does not and the tag should go. **[unverified]** — confirm before changing.

### 12. Title and Open Graph title diverge on several routes

`/about` uses `<title>` "About Purdue SMIF — Student Investment Club & Fund" but
`og:title` "About Purdue SMIF: History, Philosophy & Process". `/holdings` and
`/research` differ similarly. This is legitimate practice, since a search title
and a shared-card title do different jobs. Flagged only to confirm it is
deliberate rather than drift, and to make sure nobody "fixes" it later by
accident.

### 13. Stale `wrangler.jsonc`

`wrangler.jsonc` is Cloudflare configuration named `tanstack-start-app`, left
over from Lovable hosting and contradicted by `vite.config.ts:14`
(`nitro: { preset: "vercel" }`). No SEO effect. Deleting it removes a false trail
for anyone auditing the deploy target.

### 14. Two render-blocking font stylesheets from a cross-origin host

`__root.tsx:75-77` loads two Google Fonts stylesheets. The split is already
thoughtful: body font with `display=swap`, display and mono with
`display=optional`, and both origins preconnected (`:71-72`). Self-hosting IBM
Plex Sans would remove two cross-origin round trips from the critical path and
help Largest Contentful Paint. **[unverified]** — Core Web Vitals could not be
measured this session, so treat this as a hypothesis to test in PageSpeed
Insights before spending effort on it.

---

## Findings from production verification

Two issues that source code cannot reveal. Both were found by fetching the live
site and reading the Vercel project configuration.

### 15. Cloudflare bot management may be blocking legitimate crawlers — P1

`www.purduesmif.org` sits behind Cloudflare, not Vercel's edge directly. The
production response carries `server: cloudflare` and a `cf-ray` header, and the
HTML has a Cloudflare challenge script injected before `</body>` that loads
`/cdn-cgi/challenge-platform/scripts/jsd/main.js`. The `.vercel.app` hostname
returns `server: Vercel` with no such script, which confirms Cloudflare is
applied only to the custom domain.

This is why every ordinary HTTP request in this engagement failed with `403` at
the CONNECT stage while the Vercel-authenticated fetch succeeded. Something in
front of the site is refusing automated clients.

Googlebot and Bingbot are normally allowlisted by Cloudflare, so this is a risk
rather than a confirmed failure — and the site does rank on brand queries, which
means Googlebot has gotten through at some point. But the same protection that
blocked this audit will block link-checkers, schema validators, social-card
scrapers, and the crawlers behind AI assistants, none of which enjoy the same
allowlisting.

**Recommended checks**, in order of value:

1. Google Search Console → Crawl stats and the URL Inspection tool's live test.
   That is the only authoritative answer to whether Googlebot is being served.
2. Cloudflare → Security Events, filtered to bot-score blocks, to see what is
   actually being challenged.
3. Confirm the Cloudflare "Verified Bots" allowlist is on.
4. Test the social-card scrapers directly, since a blocked scraper means no
   preview image on LinkedIn, and finding 4's own note about `seo.test.ts`
   guarding those dimensions is wasted if the crawler never gets the file.

### 16. Three `.vercel.app` hostnames serve the full site — P2

The Vercel project has five domains attached:

| Domain                                                   | Serves                        |
| -------------------------------------------------------- | ----------------------------- |
| `www.purduesmif.org`                                     | Canonical production          |
| `purduesmif.org`                                         | 308 → `www`                   |
| `purdue-smif-hub.vercel.app`                             | **Full site, HTTP 200**       |
| `purdue-smif-hub-bwitz222s-projects.vercel.app`          | Vercel default                |
| `purdue-smif-hub-git-main-bwitz222s-projects.vercel.app` | Vercel default, tracks `main` |

`purdue-smif-hub.vercel.app` was fetched and returns the complete site with
`HTTP 200` rather than redirecting. In principle that is duplicate content on a
second hostname.

**In practice it is already handled**, and correctly: the `.vercel.app` response
emits `<link rel="canonical" href="https://www.purduesmif.org/">` and
`og:url` pointing at the real domain, because `src/lib/seo.ts:4` hardcodes
`SITE_URL` rather than deriving it from the request host. That is the right
design and it is doing its job here.

No action needed. Recorded so that nobody later "fixes" `SITE_URL` to be
request-derived, which would break the protection. If belt-and-braces is wanted,
a host check in `src/start.ts` could 308 any `.vercel.app` request to the
canonical host, but that also breaks preview deployments and is not worth it.

## Off-site footprint

| Property                   | URL                                                      | In `sameAs`?            |
| -------------------------- | -------------------------------------------------------- | ----------------------- |
| BoilerLink org page        | `boilerlink.purdue.edu/organization/smif`                | Yes, listed first       |
| LinkedIn company page      | `linkedin.com/company/purdue-smif`                       | Yes                     |
| Instagram                  | `instagram.com/smif_purdue`                              | Yes                     |
| Substack                   | `purduesmif.substack.com`                                | Yes                     |
| CampusLabs contact page    | `purdue.campuslabs.com/engage/organization/smif/contact` | No — mirrors BoilerLink |
| Facebook group             | `facebook.com/groups/purduesmif`                         | No                      |
| Course catalog, MGMT 51300 | `catalog.purdue.edu`                                     | No — university-owned   |

The `sameAs` array covers the four properties the organization controls and
actively maintains, which is the correct scope. The Facebook group is the only
arguable omission, and only if it is still active. A university-owned catalog
page cannot go in `sameAs`, but it is a useful third-party corroboration signal
that the entity is real.

## Competitive set

The organizations an applicant is choosing between, and what each brings:

| Organization                     | Web presence                                                                    | Relative strength                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Investment Banking Academy       | `purdueiba.wixsite.com/piba`, plus 4+ feature articles on `business.purdue.edu` | Strongest. University-domain coverage a student-run site cannot match on authority.            |
| Investment Banking Club (IBC)    | Listed on `business.purdue.edu` student clubs page                              | Moderate. Institutional listing, no independent site found.                                    |
| Investment & Trading at Purdue   | Listed on `business.purdue.edu`                                                 | Moderate.                                                                                      |
| Financial Management Association | Listed on `business.purdue.edu`                                                 | Moderate.                                                                                      |
| Purdue Finance Workshop          | `business.purdue.edu/centers/finance-workshop/`                                 | University-owned page.                                                                         |
| Student Managed Venture Fund     | BoilerLink, LinkedIn                                                            | Low, but note the name collision — SMVF and SMIF are confusable in search and in conversation. |

Two things follow. First, on any query the Daniels School itself writes about,
`business.purdue.edu` will outrank `purduesmif.org` on domain authority alone.
Competing head-on for "purdue investment banking" is not winnable. Second, SMIF
holds a claim none of them can make: real capital, published holdings, published
performance against the S&P 500 Index. `src/routes/about.tsx:132-190` already
argues exactly this, and it is the right argument. The strategic move is to own
the comparison queries — the ones where a student is deciding _between_ clubs —
rather than the category queries the school's own domain will take.

---

## Fix list

| #   | Finding                                            | Priority | Effort   | Files                                                                                      |
| --- | -------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------ |
| 1   | Link `/apply` into the nav and header CTA          | P0       | Low      | `src/lib/nav.ts`, `src/components/SiteHeader.tsx`, `src/lib/apply-url.ts`                  |
| 2   | Consolidate `.com` and remove the manus clone      | P0       | Off-repo | Domain registrar, Search Console                                                           |
| 3   | Widen `alternateName`; keep titles descriptive     | P0       | Low      | `src/routes/__root.tsx:89-94`                                                              |
| 4   | Name the full career surface (PE, PC, S&T, VC)     | P0       | Medium   | `src/routes/about.tsx` or new `/careers`, `src/routes/sectors.tsx`, `src/routes/learn.tsx` |
| 5   | Add prose and visible headings to `/holdings`      | P1       | Medium   | `src/routes/holdings.tsx`                                                                  |
| 6   | Add `Course`/`LearningResource` schema to `/learn` | P1       | Medium   | `src/routes/learn.tsx`                                                                     |
| 7   | Add a web app manifest                             | P1       | Low      | `public/`, `src/routes/__root.tsx`                                                         |
| 8   | `SearchAction` — only if search ships              | P1       | —        | `src/routes/__root.tsx`                                                                    |
| 9   | Move `/research` schema into `head()`              | P2       | Low      | `src/routes/research.tsx`                                                                  |
| 10  | Delete the `keywords` meta                         | P2       | Trivial  | `src/routes/__root.tsx:58`                                                                 |
| 11  | Verify or remove `twitter:site`                    | P2       | Trivial  | `src/routes/__root.tsx:65`                                                                 |
| 12  | Confirm title/OG divergence is deliberate          | P2       | Trivial  | Several routes                                                                             |
| 13  | Delete `wrangler.jsonc`                            | P2       | Trivial  | `wrangler.jsonc`                                                                           |
| 14  | Test self-hosted fonts against current LCP         | P2       | Medium   | `src/routes/__root.tsx:75-77`                                                              |
| 15  | Confirm Cloudflare is not blocking crawlers        | P1       | Low      | Search Console + Cloudflare dashboard, no code                                             |
| 16  | `.vercel.app` duplicate hosts — already handled    | P2       | None     | No action; do not make `SITE_URL` request-derived                                          |

## Recommended next step

Connect Google Search Console and export the query report. It replaces the one
thing this audit could not obtain — what people actually search to reach this
site — and it does so with the site's own data rather than a third-party
estimate. Everything in the keyword map becomes testable at that point.
