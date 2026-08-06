# Applicant Keyword Map — purduesmif.org

**Date:** August 6, 2026
**Companion document:** [`seo-audit.md`](./seo-audit.md), which contains the
method, the data limits, and the technical findings. Read its "Method and limits"
section before using this one.

---

## How to read this

**Persona.** One reader: a Purdue undergraduate targeting a career in high
finance — equity research, asset management, private equity, investment banking,
private credit, and the seats around them — who is deciding whether to apply to
SMIF or choosing between finance clubs. That career motive is the reason they
search at all, so cluster 7 treats it at full width rather than as an
afterthought. Terms that only a recruiter, alum, or sponsor would search are
excluded; they matter, but they are a different document.

**Almost no volume data.** The KeywordTool connector ran on its guest tier, which
returns keyword strings without metrics on all but a handful of terms. Terms are
ordered within each cluster by **intent** — how close the searcher is to
submitting an application — not by traffic. Where a term did return volume it is
stated inline; `private credit` in cluster 7E is the only strategically relevant
one. See the audit's method section.

**Sources.** Terms marked ◆ appeared verbatim in Google or Bing autocomplete
data pulled this session. Unmarked terms are synthesized from the persona, the
site's own copy, and the competitive set. Both kinds are worth writing for; the
◆ terms simply carry evidence that someone types them.

**Coverage** is assessed against the copy actually in the repository:

| Value       | Meaning                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Covered** | A page targets this and the copy would satisfy the searcher.                                    |
| **Partial** | The page exists and the topic is touched, but the phrasing, depth, or internal linking is weak. |
| **Gap**     | Nothing on the site addresses this.                                                             |

Search terms are reproduced lowercase, as typed. They are data, not prose, so
editorial style does not apply to them.

---

## Cluster 1 — Brand and acronym variants

The navigational cluster. Someone already knows the name and is looking for the
site. Note P0-3 in the audit: "SMIF" is entity-poisoned in both Google and Bing,
which makes the mishearing rows below more valuable than they look.

| Term                                              | Intent                    | Target         | Coverage                            |
| ------------------------------------------------- | ------------------------- | -------------- | ----------------------------------- |
| purdue smif ◆                                     | Navigational              | `/`            | Covered                             |
| smif purdue ◆                                     | Navigational              | `/`            | Covered                             |
| purdue student managed investment fund            | Navigational              | `/`            | Covered                             |
| purdue university student managed investment fund | Navigational              | `/`            | Covered                             |
| student managed investment fund purdue            | Navigational              | `/`            | Covered                             |
| purdue smif website ◆                             | Navigational              | `/`            | Covered                             |
| purdue smif application                           | Transactional             | `/apply`       | Partial — page is orphaned          |
| purdue smif recruiting                            | Transactional             | `/recruiting`  | Covered                             |
| purdue smif club                                  | Navigational              | `/about`       | Partial                             |
| purdue smif holdings                              | Informational             | `/holdings`    | Covered                             |
| purdue smif performance                           | Informational             | `/performance` | Covered                             |
| purdue smif team                                  | Informational             | `/team`        | Covered                             |
| purdue smif members                               | Informational             | `/team`        | Covered                             |
| purdue smif alumni                                | Informational             | `/team`        | Partial — `/alumni` 301s to `/team` |
| purdue smif linkedin                              | Navigational              | Off-site       | Covered via `sameAs`                |
| purdue smif instagram                             | Navigational              | Off-site       | Covered via `sameAs`                |
| purdue smif substack                              | Navigational              | Off-site       | Covered via `sameAs`                |
| purdue smif contact                               | Navigational              | `/contact`     | Partial — not in nav                |
| purdue smif email                                 | Navigational              | `/contact`     | Covered                             |
| **purdue smith fund**                             | Navigational, misheard    | `/`            | **Gap**                             |
| **purdue smith investment fund**                  | Navigational, misheard    | `/`            | **Gap**                             |
| **purdue s.m.i.f** / purdue s m i f               | Navigational, spelled out | `/`            | **Gap**                             |
| **what does smif stand for purdue**               | Informational             | `/about`       | **Gap**                             |
| **purdue smif meaning**                           | Informational             | `/about`       | **Gap**                             |

The five gaps share one fix: a single sentence somewhere on `/about` or `/` that
expands the acronym and acknowledges the collision, along the lines of _"SMIF
stands for Student Managed Investment Fund. It is pronounced like 'smif,' and it
is not related to any Smith on campus."_ That reads as a joke and functions as a
disambiguation signal.

## Cluster 2 — Category: what a student managed fund even is

Someone has heard the category name but does not yet know it exists at Purdue.
Broad, national, competitive, and the top of the funnel.

| Term                                                   | Intent        | Target         | Coverage                                                           |
| ------------------------------------------------------ | ------------- | -------------- | ------------------------------------------------------------------ |
| student managed investment fund ◆                      | Informational | `/about`       | Partial                                                            |
| student managed investment funds ◆                     | Informational | `/about`       | Partial                                                            |
| what is a student managed investment fund ◆            | Informational | `/about`       | Partial                                                            |
| what is student managed investment fund ◆              | Informational | `/about`       | Partial                                                            |
| student managed fund ◆                                 | Informational | `/about`       | Partial                                                            |
| student managed funds ◆                                | Informational | `/about`       | Partial                                                            |
| student run investment fund                            | Informational | `/about`       | Partial                                                            |
| student managed investment portfolio ◆                 | Informational | `/holdings`    | Partial                                                            |
| student managed endowment fund ◆                       | Informational | `/about`       | Gap                                                                |
| student managed hedge fund ◆                           | Informational | `/about`       | Gap                                                                |
| college investment fund                                | Informational | `/about`       | Gap                                                                |
| university student investment fund                     | Informational | `/about`       | Gap                                                                |
| how does a student managed investment fund work        | Informational | `/about`       | Partial                                                            |
| how to start a student managed investment fund ◆       | Informational | —              | Out of scope                                                       |
| student managed investment fund class ◆                | Informational | `/learn`       | Gap — MGMT 51300 exists but is unmentioned                         |
| student managed investment fund reddit ◆               | Research      | —              | Off-site only                                                      |
| largest student managed investment fund ◆              | Comparative   | `/performance` | Gap                                                                |
| best student managed investment funds ◆                | Comparative   | `/performance` | Gap                                                                |
| top 25 largest student managed investment fund smifs ◆ | Comparative   | —              | Gap                                                                |
| student managed investment fund consortium ◆           | Informational | `/recruiting`  | Partial — the SMIF Finance Club Consortium appears in the calendar |
| student managed investment fund interview ◆            | Transactional | `/recruiting`  | Covered                                                            |

`/about` ranks "Partial" throughout because it explains what _this_ fund is
without first defining the category. A searcher landing cold on
"what is a student managed investment fund" needs the general answer before the
specific one. One added paragraph closes most of this cluster.

The MGMT 51300 course catalog entry is a real asset the site never references.
An academic course with the same name is strong third-party corroboration.

## Cluster 3 — Purdue club discovery

The student knows they want a finance club at Purdue and does not yet know which
ones exist. This is where the applicant pool is actually sourced.

| Term                                      | Intent     | Target     | Coverage                   |
| ----------------------------------------- | ---------- | ---------- | -------------------------- |
| purdue finance club ◆                     | Discovery  | `/about`   | Covered                    |
| purdue finance clubs ◆                    | Discovery  | `/about`   | Covered                    |
| finance club purdue ◆                     | Discovery  | `/about`   | Covered                    |
| purdue university finance club ◆          | Discovery  | `/about`   | Covered                    |
| purdue investment club ◆                  | Discovery  | `/about`   | Covered                    |
| purdue investment clubs ◆                 | Discovery  | `/about`   | Covered                    |
| investment club purdue ◆                  | Discovery  | `/about`   | Covered                    |
| purdue university investment club ◆       | Discovery  | `/about`   | Covered                    |
| purdue investing club                     | Discovery  | `/about`   | Partial                    |
| purdue business clubs ◆                   | Discovery  | `/about`   | Partial                    |
| purdue business school clubs ◆            | Discovery  | `/about`   | Partial                    |
| business clubs at purdue ◆                | Discovery  | `/about`   | Partial                    |
| purdue daniels school of business clubs ◆ | Discovery  | `/about`   | Partial                    |
| purdue business student organizations ◆   | Discovery  | `/about`   | Partial                    |
| purdue business organizations ◆           | Discovery  | `/about`   | Partial                    |
| purdue clubs organizations ◆              | Discovery  | `/about`   | Gap                        |
| list of clubs at purdue ◆                 | Discovery  | —          | Gap — BoilerLink owns this |
| purdue boilerlink clubs ◆                 | Discovery  | Off-site   | Covered via `sameAs`       |
| boilerlink purdue clubs ◆                 | Discovery  | Off-site   | Covered via `sameAs`       |
| reddit purdue clubs ◆                     | Research   | —          | Off-site only              |
| purdue clubs website ◆                    | Discovery  | —          | Gap                        |
| purdue stock club                         | Discovery  | `/about`   | Gap                        |
| purdue trading club                       | Discovery  | `/sectors` | Gap                        |
| purdue investment and trading club ◆      | Competitor | `/about`   | Partial                    |
| purdue investment banking club ◆          | Competitor | `/about`   | Partial                    |
| purdue quantitative finance club ◆        | Competitor | —          | Gap                        |
| purdue quant finance club ◆               | Competitor | —          | Gap                        |
| quant club purdue ◆                       | Competitor | —          | Gap                        |
| purdue consulting clubs ◆                 | Adjacent   | —          | Out of scope               |

The "finance club" and "investment club" rows are Covered because the root
`alternateName` array (`__root.tsx:89-94`) claims both phrases and `/about`
argues them in body copy. That work is already done and is the single best SEO
decision on the site.

The "business clubs" rows sit at Partial because the site never uses the phrase
"business club" — it is a broader net a searcher casts before narrowing.

## Cluster 4 — Comparison and decision

**The highest-value cluster in this document.** A student searching here has
decided to join something and is choosing between options. They convert.

| Term                                           | Intent               | Target   | Coverage             |
| ---------------------------------------------- | -------------------- | -------- | -------------------- |
| best finance club at purdue                    | Decision             | `/about` | Partial              |
| best investment club purdue                    | Decision             | `/about` | Partial              |
| which finance club should i join purdue        | Decision             | `/about` | Partial              |
| best clubs for finance majors purdue           | Decision             | `/about` | Gap                  |
| purdue smif vs investment banking club         | Decision             | `/about` | Gap                  |
| purdue investment banking academy vs smif      | Decision             | `/about` | Gap                  |
| smif vs ibc purdue                             | Decision             | `/about` | Gap                  |
| how is smif different from other finance clubs | Decision             | `/apply` | Covered — FAQ item 2 |
| is smif a finance club or an investment club   | Decision             | `/apply` | Covered — FAQ item 1 |
| is smif worth it                               | Decision             | `/about` | Gap                  |
| is purdue smif hard to get into                | Decision             | `/apply` | Covered — FAQ item 7 |
| what finance clubs look best on a resume       | Decision             | `/about` | Gap                  |
| most prestigious clubs at purdue               | Decision             | —        | Gap                  |
| purdue investment banking academy ◆            | Competitor           | `/about` | Gap                  |
| purdue finance workshop                        | Competitor           | —        | Gap                  |
| purdue financial management association        | Competitor           | —        | Gap                  |
| student managed venture fund purdue            | Adjacent, confusable | `/about` | Gap                  |
| purdue smvf                                    | Adjacent, confusable | —        | Gap                  |

`src/routes/about.tsx:132-190` already carries the comparison argument, and the
`/apply` FAQ answers three of these outright. The failure is distributional, not
editorial: the answers exist on the least-linked page on the site. Fixing P0-1 in
the audit does more for this cluster than any new copy would.

The named-competitor rows are Gaps because the site never names another
organization. That is a defensible editorial position. Worth deciding
consciously, because a student typing "purdue investment banking academy vs smif"
is asking a question only SMIF can answer well, and right now the only pages that
mention the Academy are the Academy's own and the Daniels School's.

## Cluster 5 — Application and recruiting

High intent, seasonally spiked around the Fall 2026 calendar
(`src/routes/recruiting.tsx:129-140`).

| Term                                       | Intent        | Target        | Coverage                      |
| ------------------------------------------ | ------------- | ------------- | ----------------------------- |
| how to join purdue smif                    | Transactional | `/apply`      | Partial — orphaned page       |
| how to join purdue investment club         | Transactional | `/apply`      | Partial                       |
| purdue smif application                    | Transactional | `/apply`      | Partial                       |
| purdue smif application deadline           | Transactional | `/recruiting` | Covered                       |
| purdue smif recruiting timeline            | Transactional | `/recruiting` | Covered                       |
| purdue smif callout                        | Transactional | `/recruiting` | Covered — `Event` schema      |
| purdue finance club callout                | Transactional | `/recruiting` | Covered                       |
| smif callout meeting                       | Transactional | `/recruiting` | Covered                       |
| purdue smif interview                      | Transactional | `/recruiting` | Covered                       |
| purdue smif interview questions            | Transactional | `/recruiting` | Covered                       |
| purdue smif coffee chat                    | Transactional | `/recruiting` | Covered                       |
| how competitive is smif                    | Evaluative    | `/apply`      | Covered — FAQ item 7          |
| smif acceptance rate                       | Evaluative    | `/apply`      | Covered — FAQ item 7          |
| purdue smif application fall 2026          | Transactional | `/recruiting` | Covered                       |
| purdue finance club applications fall 2026 | Transactional | `/recruiting` | Partial                       |
| when do purdue clubs recruit               | Transactional | `/recruiting` | Partial                       |
| purdue fall club recruitment finance       | Transactional | `/recruiting` | Partial                       |
| b-involved fair purdue                     | Discovery     | `/recruiting` | Covered — in calendar         |
| daniels club expo                          | Discovery     | `/recruiting` | Covered — in calendar         |
| purdue club expo finance                   | Discovery     | `/recruiting` | Partial                       |
| purdue smif rawls hall                     | Navigational  | `/recruiting` | Covered — room numbers listed |
| what happens after you join smif           | Informational | `/apply`      | Covered — FAQ item 9          |

`/recruiting` is the strongest page on the site for its cluster. Ten `Event`
nodes with real dates, rooms, `.ics` download, and per-event calendar links is
more than most university departments ship.

## Cluster 6 — Eligibility and objections

Every term here is a reason someone talks themselves out of applying. All of them
are already answered on `/apply`, and none of that copy is reachable from the
nav. This cluster is the clearest argument for the P0-1 fix.

| Term                                                     | Intent    | Target   | Coverage             |
| -------------------------------------------------------- | --------- | -------- | -------------------- |
| do i need finance experience to join an investment club  | Objection | `/apply` | Covered — FAQ item 4 |
| do you need experience to join a student investment fund | Objection | `/apply` | Covered              |
| investment club for non finance majors                   | Objection | `/apply` | Covered — FAQ item 6 |
| is smif only for finance majors                          | Objection | `/apply` | Covered — FAQ item 6 |
| can engineering majors join finance clubs purdue         | Objection | `/apply` | Partial              |
| can non business majors join purdue business clubs       | Objection | `/apply` | Partial              |
| purdue finance club time commitment                      | Objection | `/apply` | Covered — FAQ item 5 |
| how many hours a week is an investment club              | Objection | `/apply` | Covered              |
| can i be in multiple clubs at purdue                     | Objection | `/apply` | Covered — FAQ item 3 |
| can freshmen join purdue smif                            | Objection | `/apply` | Covered — FAQ item 8 |
| can freshmen join investment clubs                       | Objection | `/apply` | Covered              |
| can seniors join smif                                    | Objection | `/apply` | Covered — FAQ item 8 |
| what gpa do you need for purdue finance clubs            | Objection | `/apply` | Gap                  |
| what major do you need for an investment club            | Objection | `/apply` | Covered              |

The single Gap is GPA. The FAQ never states a threshold, while the Investment
Banking Academy publicly advertises a minimum. Whether SMIF has one is an
organizational question, not an SEO one, but the silence is conspicuous to
anyone comparing the two.

## Cluster 7 — Breaking into high finance

The actual motivation behind most applications, and the largest cluster in this
document. SMIF exists for students targeting high finance broadly: equity
research, asset management, private equity, investment banking, private credit,
and the adjacent seats around them. The keyword surface has to match that scope.

**The site does not currently match it.** Across every route, the copy names
four destinations and no more:

| Where                      | Copy                                                                                        | Paths named            |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| `src/routes/index.tsx:163` | "careers in asset management, investment banking, and equity research"                      | AM, IB, ER             |
| `src/routes/index.tsx:60`  | "Purdue alumni at investment banks, hedge funds, and asset managers"                        | IB, HF, AM             |
| `src/routes/about.tsx`     | Employer logos: Morgan Stanley, Barclays, BMO Capital, Wells Fargo, Deloitte, PwC, EY, KPMG | Banks and the Big Four |

Private equity and private credit appear **nowhere on the site**. Neither does
venture capital, sales and trading, restructuring, or corporate development. A
sophomore targeting a private equity seat reads this site and does not see
themselves in it, which costs applications before it costs rankings.

The gap is a positioning problem, not a capability problem. The underlying
material is already there and simply unlabelled:

- `src/routes/learn.tsx:81` — Module 02 covers "DCF mechanics, trading comps, and
  **precedent transactions**." Precedent transactions is deal work, and it is
  never framed that way.
- `src/routes/learn.tsx:85` — Module 06, "Markets, Macro & Fixed Income," covers
  "rates, the yield curve, and **credit**." That is the private credit bridge.
- `src/routes/sectors.tsx:46` — the Fixed Income & Macro team covers "rates,
  **credit**, FX, and global macro."

What is genuinely absent is leveraged buyout modeling. There is no LBO module,
no LBO template alongside the AMZN discounted cash flow and comparable company
analysis files, and no mention of the paper LBO — the single most predictable
private equity interview exercise.

### 7A — Investment banking

| Term                                                         | Intent | Target        | Coverage                      |
| ------------------------------------------------------------ | ------ | ------------- | ----------------------------- |
| how to get into investment banking from purdue               | Career | `/about`      | Gap                           |
| purdue investment banking placement                          | Career | `/about`      | Partial — logos, no narrative |
| purdue investment banking recruiting                         | Career | `/recruiting` | Gap                           |
| purdue wall street placement                                 | Career | `/about`      | Gap                           |
| what clubs help you get into investment banking              | Career | `/about`      | Gap                           |
| how to break into investment banking ◆                       | Career | `/learn`      | Gap                           |
| how to break into investment banking from a non target ◆     | Career | `/about`      | Gap                           |
| how to get into investment banking with no experience ◆      | Career | `/learn`      | Gap                           |
| how to get into investment banking internship ◆              | Career | `/recruiting` | Gap                           |
| how to get into investment banking with engineering degree ◆ | Career | `/apply`      | Partial                       |
| investment banking summer analyst 2027                       | Career | `/recruiting` | Gap                           |
| investment banking sophomore diversity program               | Career | `/recruiting` | Gap                           |

### 7B — Equity research

| Term                                       | Intent | Target      | Coverage |
| ------------------------------------------ | ------ | ----------- | -------- |
| equity research analyst internship ◆       | Career | `/research` | Gap      |
| how to get an equity research internship   | Career | `/research` | Gap      |
| equity research summer analyst             | Career | `/research` | Gap      |
| how to become an equity research analyst ◆ | Career | `/learn`    | Partial  |
| equity research vs investment banking      | Career | `/about`    | Gap      |
| buy-side vs sell-side research             | Career | `/about`    | Gap      |
| equity research analyst job description ◆  | Career | `/research` | Gap      |

Strongest natural fit on the site. `/research` publishes real analyst reports,
which almost no undergraduate competitor can show. It is also the cluster where
the site currently claims the least.

### 7C — Asset management

| Term                                    | Intent | Target   | Coverage                 |
| --------------------------------------- | ------ | -------- | ------------------------ |
| asset management internship             | Career | `/about` | Gap                      |
| how to get into asset management        | Career | `/about` | Gap                      |
| asset management vs investment banking  | Career | `/about` | Gap                      |
| asset management vs sales and trading ◆ | Career | `/about` | Gap                      |
| how to become a portfolio manager       | Career | `/team`  | Partial — PM roles exist |
| buy-side internship undergrad           | Career | `/about` | Gap                      |
| long only asset manager internship      | Career | `/about` | Gap                      |

The closest match between what SMIF actually does day to day and a career path.
Students run a real long-only book with named portfolio managers. Nothing on the
site connects those two facts.

### 7D — Private equity

Named as a target outcome; absent from the site entirely.

| Term                                                          | Intent   | Target        | Coverage |
| ------------------------------------------------------------- | -------- | ------------- | -------- |
| how to break into private equity from undergrad ◆             | Career   | `/about`      | **Gap**  |
| how to get into private equity out of college ◆               | Career   | `/about`      | **Gap**  |
| how to get into private equity after college ◆                | Career   | `/about`      | **Gap**  |
| how to break into private equity without banking experience ◆ | Career   | `/about`      | **Gap**  |
| how to break into private equity with no experience ◆         | Career   | `/about`      | **Gap**  |
| how to get into private equity with an engineering degree ◆   | Career   | `/apply`      | **Gap**  |
| how to break into private equity without ib ◆                 | Career   | `/about`      | **Gap**  |
| private equity recruiting undergrad                           | Career   | `/recruiting` | **Gap**  |
| private equity interview questions                            | Prep     | `/recruiting` | **Gap**  |
| paper lbo                                                     | Prep     | `/learn`      | **Gap**  |
| lbo model ◆                                                   | Learning | `/learn`      | **Gap**  |
| how to build an lbo model ◆                                   | Learning | `/learn`      | **Gap**  |
| walk me through an lbo model ◆                                | Prep     | `/learn`      | **Gap**  |
| lbo model template ◆                                          | Learning | `/learn`      | **Gap**  |
| basic lbo model test ◆                                        | Prep     | `/learn`      | **Gap**  |

The `lbo model` family is the highest-value unclaimed opportunity in this
document. It runs parallel to the `dcf model` terms the site already serves with
a downloadable file, the searcher intent is identical, and SMIF already teaches
the valuation layer underneath it. An LBO template next to the existing AMZN
models would claim a proven query shape at low cost.

### 7E — Private credit

| Term                                 | Intent   | Target     | Coverage            |
| ------------------------------------ | -------- | ---------- | ------------------- |
| private credit ◆                     | Category | `/sectors` | **Gap**             |
| what is private credit ◆             | Category | `/learn`   | **Gap**             |
| private credit analyst ◆             | Career   | `/sectors` | **Gap**             |
| private credit analyst jobs ◆        | Career   | `/sectors` | **Gap**             |
| private credit internship            | Career   | `/sectors` | **Gap**             |
| how to break into private credit     | Career   | `/about`   | **Gap**             |
| private credit vs investment banking | Career   | `/about`   | **Gap**             |
| credit analysis for beginners        | Learning | `/learn`   | Partial — Module 06 |
| leveraged loans explained            | Learning | `/learn`   | **Gap**             |
| direct lending analyst               | Career   | `/sectors` | **Gap**             |

**This is the one term in the entire engagement that returned real metrics.**
`private credit` shows 27,100 monthly searches with a trend value of +22, meaning
demand is rising rather than flat. Every other term in both documents came back
without data, so treat this as the single quantified data point available.

The asymmetry is stark: private credit is the fastest-growing seat in high
finance, SMIF runs a Fixed Income & Macro team that already covers credit
(`sectors.tsx:46`), and the word "credit" appears in exactly two places on the
site, neither framed as a career path.

### 7F — Hedge funds and public markets

| Term                                        | Intent | Target        | Coverage              |
| ------------------------------------------- | ------ | ------------- | --------------------- |
| hedge fund internship college student       | Career | `/about`      | Partial — one mention |
| how to get into a hedge fund from undergrad | Career | `/about`      | Gap                   |
| hedge fund analyst                          | Career | `/about`      | Gap                   |
| long short equity analyst                   | Career | `/holdings`   | Gap                   |
| how to pitch a short                        | Prep   | `/recruiting` | Gap                   |

`index.tsx:60` names hedge funds once, in a mentorship context. Everything else
is a gap, despite the fund running exactly the long-only research process a
fundamental hedge fund seat screens for.

### 7G — Sales and trading, and adjacent seats

| Term                                      | Intent   | Target        | Coverage |
| ----------------------------------------- | -------- | ------------- | -------- |
| sales and trading ◆                       | Category | `/sectors`    | **Gap**  |
| what is sales and trading in finance ◆    | Category | `/learn`      | **Gap**  |
| is sales and trading investment banking ◆ | Category | `/about`      | **Gap**  |
| sales and trading analyst ◆               | Career   | `/sectors`    | **Gap**  |
| sales and trading interview questions     | Prep     | `/recruiting` | **Gap**  |
| sales and trading brain teasers ◆         | Prep     | `/recruiting` | **Gap**  |
| venture capital internship undergrad      | Career   | `/about`      | **Gap**  |
| how to break into venture capital         | Career   | `/about`      | **Gap**  |
| restructuring investment banking          | Career   | `/about`      | **Gap**  |
| corporate development analyst             | Career   | `/about`      | **Gap**  |
| growth equity analyst                     | Career   | `/about`      | **Gap**  |

Venture capital deserves a note: Purdue runs a separate Student Managed Venture
Fund. If SMIF does not place into venture capital, this row should stay a
deliberate gap rather than a target, and the distinction is worth stating so
students self-route correctly instead of applying to the wrong fund.

### 7H — Cross-path and comparison

Where an undecided student actually starts. Highest intent in the cluster,
because someone comparing paths has not yet chosen one and is open to influence.

| Term                                          | Intent     | Target        | Coverage |
| --------------------------------------------- | ---------- | ------------- | -------- |
| investment banking vs private equity          | Comparison | `/about`      | Gap      |
| equity research vs asset management           | Comparison | `/about`      | Gap      |
| private credit vs private equity              | Comparison | `/about`      | Gap      |
| buy-side vs sell-side                         | Comparison | `/about`      | Gap      |
| high finance careers explained                | Category   | `/learn`      | Gap      |
| what is high finance                          | Category   | `/learn`      | Gap      |
| best finance career path                      | Comparison | `/about`      | Gap      |
| finance internship sophomore year             | Career     | `/recruiting` | Gap      |
| how to get a finance internship as a freshman | Career     | `/recruiting` | Gap      |
| purdue finance career outcomes                | Career     | `/about`      | Partial  |
| what skills do you need for high finance      | Category   | `/learn`      | Partial  |

### What to do with this cluster

One page, `/careers` or a substantial section on `/about`, that names every path
SMIF actually places into and states honestly what the fund gives a student
pursuing each one. Structure it by destination — equity research, asset
management, private equity, investment banking, private credit, and the rest —
so each has a heading a search engine can match.

Two constraints on writing it. First, name only paths with a real placement
record behind them. The `/about` employer logos are banks and the Big Four with
no private equity or private credit firm shown, so if alumni have placed into
those seats the logos should reflect it, and if they have not, the copy should
describe the skills that transfer rather than implying placements that did not
happen. Second, do not chase bare "how to break into investment banking" or
"how to break into private equity." Those belong to Wall Street Oasis and
Mergers & Inquisitions. The winnable versions are Purdue-qualified and
club-qualified: "how to break into private equity from undergrad at purdue,"
"what clubs help you get into private equity."

## Cluster 8 — Skill and learning

Top of funnel, aimed at `/learn`. A first-year searching "how to build a dcf" is
12 months from applying, which makes this a slow but compounding cluster. `/learn`
already has the substance; it has the thinnest schema on the site (audit P1-5).

| Term                                   | Intent   | Target      | Coverage                          |
| -------------------------------------- | -------- | ----------- | --------------------------------- |
| how to build a dcf                     | Learning | `/learn`    | Partial                           |
| what is a discounted cash flow         | Learning | `/learn`    | Partial                           |
| dcf model example                      | Learning | `/learn`    | Covered — downloadable AMZN model |
| dcf model excel template               | Learning | `/learn`    | Covered                           |
| comparable company analysis            | Learning | `/learn`    | Covered — AMZN comps file         |
| comps analysis example                 | Learning | `/learn`    | Partial                           |
| how to value a stock                   | Learning | `/learn`    | Partial                           |
| how to learn valuation                 | Learning | `/learn`    | Partial                           |
| equity research report example         | Learning | `/research` | Covered                           |
| how to write an equity research report | Learning | `/learn`    | Partial                           |
| how to read a 10-k                     | Learning | `/learn`    | Gap                               |
| financial modeling for students        | Learning | `/learn`    | Partial                           |
| free financial modeling course         | Learning | `/learn`    | Gap                               |
| investing books for beginners          | Learning | `/learn`    | Covered — nine-book list          |
| best books on value investing          | Learning | `/learn`    | Covered                           |
| finance glossary                       | Learning | `/learn`    | Covered — key terms section       |

The downloadable models are the strongest unclaimed asset on the site. "dcf model
excel template" is the kind of query that earns links from other students, and
SMIF is giving away a real one with no schema describing it.

## Cluster 9 — Interview preparation

Aimed at `/recruiting`, whose prep guide is already substantial. Note that this
cluster serves two audiences at once: SMIF applicants, and students preparing for
banking interviews generally. The second group is larger and links more.

| Term                                                | Intent | Target        | Coverage |
| --------------------------------------------------- | ------ | ------------- | -------- |
| purdue smif interview questions                     | Prep   | `/recruiting` | Covered  |
| investment club interview questions ◆               | Prep   | `/recruiting` | Partial  |
| finance club interview questions                    | Prep   | `/recruiting` | Partial  |
| stock pitch ◆                                       | Prep   | `/recruiting` | Partial  |
| how to do a stock pitch ◆                           | Prep   | `/recruiting` | Partial  |
| stock pitch example ◆                               | Prep   | `/research`   | Partial  |
| stock pitch template                                | Prep   | `/learn`      | Gap      |
| stock pitch investment banking interview ◆          | Prep   | `/recruiting` | Partial  |
| stock pitch equity research interview ◆             | Prep   | `/recruiting` | Partial  |
| tell me about a stock you like                      | Prep   | `/recruiting` | Partial  |
| what stock would you pitch                          | Prep   | `/recruiting` | Partial  |
| investment banking interview questions ◆            | Prep   | `/recruiting` | Gap      |
| investment banking technical interview questions ◆  | Prep   | `/recruiting` | Partial  |
| investment banking behavioral interview questions ◆ | Prep   | `/recruiting` | Partial  |
| behavioral interview questions finance              | Prep   | `/recruiting` | Partial  |
| walk me through a dcf                               | Prep   | `/learn`      | Gap      |
| three financial statements interview question       | Prep   | `/learn`      | Gap      |
| star method finance interview                       | Prep   | `/recruiting` | Covered  |
| accounting interview questions finance club         | Prep   | `/recruiting` | Partial  |

"stock pitch" and its variants are the most promising cluster on this page. The
`/recruiting` prep guide has a Stock Pitch card, `/research` publishes real
pitches, and `/learn` teaches the valuation underneath. Three pages hold pieces
of one answer and none of them is organized around the query.

## Cluster 10 — Prospective and incoming students

Searched before enrollment, or during the first weeks on campus. Lower intent,
long lead time, and the source of the strongest applicants because they arrive
already looking.

| Term                                         | Intent     | Target   | Coverage     |
| -------------------------------------------- | ---------- | -------- | ------------ |
| what clubs should i join purdue freshman     | Discovery  | `/about` | Gap          |
| purdue finance major clubs                   | Discovery  | `/about` | Partial      |
| best extracurriculars for finance majors     | Discovery  | `/about` | Gap          |
| things to do at purdue for finance majors    | Discovery  | `/about` | Gap          |
| purdue business school extracurriculars      | Discovery  | `/about` | Gap          |
| is purdue good for finance                   | Evaluative | `/about` | Gap          |
| purdue finance program                       | Evaluative | —        | Out of scope |
| purdue finance major                         | Evaluative | —        | Out of scope |
| purdue daniels school of business worth it ◆ | Evaluative | —        | Out of scope |
| purdue daniels school of business ranking ◆  | Evaluative | —        | Out of scope |
| purdue daniels school of business clubs ◆    | Discovery  | `/about` | Partial      |

The "Out of scope" rows belong to `business.purdue.edu` and are unwinnable. The
Gaps are winnable and currently unaddressed.

## Cluster 11 — Peer benchmarking

The `[school] student managed investment fund` pattern is one of the densest in
the autocomplete data pulled this session. Every one of these returned as a
Google suggestion:

fordham ◆ · uga ◆ · stevens ◆ · bucknell ◆ · ksu ◆ · usf ◆ · csuf ◆ ·
clemson ◆ · georgia tech ◆ · nyu ◆ · booth ◆ · miami ◆ · lsu ◆ · cornell ◆ ·
fiu ◆ · fau ◆ · gmu ◆ · harvard ◆ · hofstra ◆ · seton hall ◆ · dayton ◆ ·
providence college ◆ · kennesaw state ◆ · wichita state ◆ · grand canyon ◆ ·
geneseo ◆ · sacred heart ◆ · barry ◆ · bmcc ◆ · american university ◆ ·
minnesota ◆ · nsu ◆ · cpp ◆ · fdu ◆ · fairfield ◆ · lincoln ◆ · citadel ◆ ·
usyd ◆ · uq ◆ · griffith ◆ · corvinus ◆

**Purdue does not appear in this set.** Google has learned the pattern and has
not learned that Purdue fits it.

This is the cleanest single opportunity in the document. The query shape is
proven, the competition is other student organizations rather than commercial
publishers, and the slot is open. It is also mostly a distribution problem rather
than a content one — the pattern is learned from consistent naming across many
pages and inbound links, which is exactly what the duplicate `.com` and the
manus clone are diluting (audit P0-2).

## Cluster 12 — Assistant and zero-click answers

Increasingly the first surface a student sees, and the one where the stale `.com`
does real damage. Phrasings here are conversational rather than keyword-shaped.

| Prompt                                              | Target                | Coverage                                       |
| --------------------------------------------------- | --------------------- | ---------------------------------------------- |
| what is purdue smif                                 | `public/llms.txt`     | Covered                                        |
| how do i join purdue's investment fund              | `llms.txt` → `/apply` | Partial                                        |
| what finance clubs are at purdue                    | `llms.txt` → `/about` | Partial                                        |
| how much money does purdue smif manage              | `/`                   | **At risk** — the `.com` says roughly $450,000 |
| is purdue smif competitive                          | `/apply` FAQ          | Gap in `llms.txt`                              |
| do i need to be a finance major for purdue smif     | `/apply` FAQ          | Gap in `llms.txt`                              |
| what does purdue smif look for in applicants        | `/apply`              | Gap in `llms.txt`                              |
| when does purdue smif recruit                       | `/recruiting`         | Gap in `llms.txt`                              |
| how does purdue smif compare to other finance clubs | `/about`              | Partial                                        |

`public/llms.txt` is already well built and describes every route. What it does
not carry is the answers themselves. Adding the current assets under management
figure and condensed versions of the `/apply` FAQ answers would mean an assistant
quotes the correct number and the correct eligibility rules rather than
reconstructing them from a three-year-old `.com` page.

---

## Priority shortlist

Thirteen terms worth acting on first, chosen for intent quality and for how
little new work each requires.

| #   | Term                                                    | Page that should own it | What has to change                                                      |
| --- | ------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| 1   | is smif a finance club or an investment club            | `/apply`                | Nothing on the page. Link it into the nav — audit P0-1.                 |
| 2   | do i need finance experience to join an investment club | `/apply`                | Same. The answer already exists.                                        |
| 3   | which finance club should i join purdue                 | `/about`                | Sharpen the existing comparison section to use the searcher's phrasing. |
| 4   | purdue student managed investment fund                  | `/`                     | Nothing. Protect it by consolidating the `.com` — audit P0-2.           |
| 5   | purdue smith fund                                       | `/` or `/about`         | One disambiguation sentence expanding the acronym.                      |
| 6   | what is a student managed investment fund               | `/about`                | One paragraph defining the category before describing this fund.        |
| 7   | how to join purdue smif                                 | `/apply`                | Internal linking, plus an H2 using this exact phrasing.                 |
| 8   | dcf model excel template                                | `/learn`                | Schema on the downloadable models — audit P1-5.                         |
| 9   | how to do a stock pitch                                 | `/recruiting`           | Consolidate the pitch guidance now split across three pages.            |
| 10  | purdue student managed investment fund _(peer pattern)_ | `/`                     | Consistent naming plus link consolidation — cluster 11.                 |
| 11  | lbo model / paper lbo                                   | `/learn`                | An LBO template beside the AMZN files, plus a module. Cluster 7D.       |
| 12  | private credit analyst                                  | `/sectors` or `/about`  | Name credit as a career path. The Fixed Income team already covers it.  |
| 13  | how to break into private equity from undergrad         | `/about` or `/careers`  | A careers section naming every path SMIF places into. Cluster 7.        |

Six of the first ten require no new copy at all — internal links, a consolidated
domain, and one disambiguation sentence. Items 11 through 13 do require new
work, and they are here because the career surface the fund actually serves is
wider than the surface the site describes. That is the second structural finding
in these documents, alongside the orphaned `/apply` page.
