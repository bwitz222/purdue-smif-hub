# Off-site entity cleanup (Phase 4)

Phase 4 of the SEO/AEO audit. Unlike phases 1–3, none of this lives in this
repository — it runs on platforms that need account access. This document
carries the exact copy to paste, so the work is a sequence of copy-paste
operations rather than a writing task.

**Why it matters more than anything left on-site.** The audit's third critical
finding was that stale third-party facts were beating the fund's own numbers:
AI answers asserted the fund managed "approximately $400,000" while the site
said otherwise. Models resolve an entity by looking for agreement across the
sources it links to. Every profile below is reachable from this site's
`sameAs` array, so each one is currently a vote on what SMIF *is*.

---

## 0. The canonical facts

Every profile below should agree with these. They match the site as deployed.

| Field | Value |
|---|---|
| Full name | Purdue Student Managed Investment Fund |
| Short name | Purdue SMIF |
| Founded | 2009 |
| Affiliation | Mitch Daniels School of Business, Purdue University |
| Assets under management | approximately $600,000 of real university capital |
| Benchmark | S&P 500 Total Return Index; audited monthly performance since October 2013 |
| Structure | 8 equity sector teams, a Fixed Income & Macro team, and a Portfolio + Risk Management team, overseen by a 7-member executive board elected each spring |
| Faculty advisors | Lulu Zeng; Alexander Boquist |
| Admissions | 15–25 analysts per cycle from 100–150 applicants; open to all majors |
| Time commitment | ~6 hours per week |
| Email | smif26@purdue.edu |
| Address | Daniels School of Business, 403 Mitch Daniels Blvd, West Lafayette, IN 47907 |
| Website | https://www.purduesmif.org |

**Deliberately omit a member headcount.** The site derives it from the published
roster, so any number typed into a third-party profile will drift the moment
someone joins or graduates — which is the exact failure mode this phase exists
to fix. Describe the structure instead.

---

## 1. BoilerLink — highest priority

`https://boilerlink.purdue.edu/organization/smif`

This is almost certainly where the stale "$400,000" figure that AI answers
repeat originates. It is also Purdue's official directory, which makes it the
single most authoritative third-party statement about the fund, and it is the
first entry in the site's `sameAs` array.

**Description field — paste verbatim:**

> The Purdue Student Managed Investment Fund (SMIF) is a student-run investment
> fund at the Mitch Daniels School of Business, Purdue University. Founded in
> 2009, SMIF manages approximately $600,000 of real university capital across
> U.S. equities and fixed income — not a simulated portfolio.
>
> Analysts work on sector teams, research individual companies from the bottom
> up, and pitch positions to the full investment committee, which votes before
> anything enters the portfolio. Performance is benchmarked against the S&P 500
> Total Return Index and reported quarterly; audited monthly performance has
> been tracked since October 2013. Every holding and every quarter of
> performance is published at https://www.purduesmif.org.
>
> The fund is organized into eight equity sector teams, a Fixed Income & Macro
> team, and a Portfolio + Risk Management team, overseen by a seven-member
> executive board elected each spring and by faculty advisors at the Daniels
> School.
>
> SMIF recruits by application each fall and spring and is open to students
> from every college at Purdue — roughly a third of analysts come from
> non-business majors. Applications, the recruiting calendar, and interview
> prep are at https://www.purduesmif.org/recruiting.
>
> Contact: smif26@purdue.edu

**Also check on that page:** the website field points at `https://www.purduesmif.org`
(with `www`, matching the site's canonical), and any officer list is current.

---

## 2. LinkedIn company page

`https://www.linkedin.com/company/purdue-smif`

**Tagline** (LinkedIn limit 120 characters — this is 92):

> Student-run investment fund at Purdue's Daniels School of Business. Real capital since 2009.

**About** (limit 2,000 characters — this is 1,178):

> The Purdue Student Managed Investment Fund (SMIF) is a student-run investment
> fund at the Mitch Daniels School of Business, Purdue University. Founded in
> 2009, we manage approximately $600,000 of real university capital across U.S.
> equities and fixed income.
>
> The portfolio is real, not simulated. Analysts join a sector team, research
> individual companies from the bottom up, and defend a written thesis and
> valuation before the full investment committee, which votes before any
> position is entered. Performance is benchmarked against the S&P 500 Total
> Return Index and reported quarterly, and every holding is published publicly.
>
> The fund runs eight equity sector teams, a Fixed Income & Macro team, and a
> Portfolio + Risk Management team, under a seven-member executive board elected
> each spring and faculty oversight at the Daniels School.
>
> Members have gone on to Morgan Stanley, Barclays, BMO Capital Markets, Wells
> Fargo, and the Big 4 accounting firms.
>
> We recruit by application each fall and spring, admitting 15–25 analysts from
> 100–150 applicants, and we take students from every college at Purdue.
>
> Holdings, performance, and recruiting: https://www.purduesmif.org

**Fields to set:** Website `https://www.purduesmif.org` · Industry
`Investment Management` · Company size `11-50 employees` · Type
`Nonprofit` · Founded `2009` · Location `West Lafayette, Indiana`.

---

## 3. Instagram

`https://www.instagram.com/smif_purdue/`

**Bio** (limit 150 characters — this is 124):

> Purdue's student-managed investment fund 📈 Real university capital since 2009
> Daniels School of Business
> Holdings + apply ⬇️

**Link in bio:** `https://www.purduesmif.org` — or point it at
`https://www.purduesmif.org/recruiting` during a recruiting cycle.

---

## 4. Substack

`https://purduesmif.substack.com/`

**About page opening paragraph:**

> Research and commentary from the Purdue Student Managed Investment Fund, a
> student-run investment fund at Purdue University's Daniels School of Business.
> Founded in 2009, SMIF manages approximately $600,000 of real university
> capital, benchmarked against the S&P 500. Everything here is written by
> student analysts. Holdings and performance are published at
> https://www.purduesmif.org.

**Also:** set the publication description and ensure the Substack links back to
`purduesmif.org`. The link is currently one-directional — the site links out,
the newsletter does not link back — which wastes the association.

---

## 5. The link from business.purdue.edu

This is the single highest-value item in the entire audit and the only one
that requires another department to act.

`https://business.purdue.edu/undergraduate/student-experience/clubs.php` ranks
for the category queries this whole effort targets — "Purdue finance clubs",
"best investment clubs at Purdue" — where purduesmif.org does not appear at
all. One link from that page is worth more than any remaining on-site change.

**Ask:** that the Daniels club listing links SMIF's entry to
`https://www.purduesmif.org` (many entries link only to BoilerLink), and that
the blurb matches the canonical description above.

**Draft email — needs a recipient at Daniels student services or the finance
department, and should be sent from a purdue.edu address:**

> Subject: SMIF listing on the Daniels clubs page — link + description update
>
> Hi [name],
>
> I'm [name], [role] of the Purdue Student Managed Investment Fund. We've just
> finished a rebuild of purduesmif.org, where we now publish our full holdings,
> audited performance against the S&P 500, and our investment policy statement.
>
> Two small asks about SMIF's entry on the Daniels clubs page:
>
> 1. Could the listing link to https://www.purduesmif.org? Prospective students
>    who find us through the Daniels site currently have no route to the
>    portfolio, the recruiting calendar, or the application.
> 2. Could the description be updated to: "A student-run investment fund
>    managing approximately $600,000 of real university capital since 2009.
>    Analysts research and pitch individual companies, and the fund's holdings
>    and performance against the S&P 500 are published publicly."
>
> Happy to send anything else useful — we also publish a recruiting calendar
> each semester that we're glad to share ahead of callouts.
>
> Thanks,
> [name] · smif26@purdue.edu

**Worth asking for at the same time:** a link from the finance program page,
`https://business.purdue.edu/undergraduate/academics/finance.php`, which also
ranks for adjacent queries.

---

## 6. Look-alike domains — verify before acting

Two other properties rank on SMIF's brand name:

- `https://www.purduesmif.com/about-us` — an older "SMIF Website"
- `https://purdue-smif-xmmhrmch.manus.space/` — an AI-generated clone

**What is confirmed:** the Vercel project backing this site serves only
`purduesmif.org` and `www.purduesmif.org`. Neither look-alike is served from
this account, so neither can be redirected from here.

**What is not confirmed:** whether SMIF (or a former officer) owns
`purduesmif.com` on some other host. Both domains are unreachable from the
build environment, so nothing about their live content has been verified
first-hand — the descriptions above come from search-index snippets only.
Check the registrar and ask past officers before treating either as an
outside party.

**Then, depending on the answer:**

- *If SMIF controls purduesmif.com* — 301 it to `https://www.purduesmif.org`.
  That is the cleanest outcome: it consolidates brand signals instead of
  splitting them, and removes a second, staler description of the fund.
- *If it belongs to a former officer* — ask for the transfer or the redirect.
- *If neither* — do not attempt a takedown on SEO grounds. Out-rank it: the
  real site now has more content, better structure, and a live portfolio. The
  manus.space clone in particular has no inbound links and will not hold.

The clone is worth a separate look on accuracy grounds rather than SEO
grounds. If it publishes fabricated holdings or performance under the fund's
name, that is a misrepresentation issue for the executive board and possibly
for Purdue's trademark office — a different and more serious problem than
duplicate content.

---

## 7. Search Console and Bing (carried over from Phase 2)

Neither can be done from a build environment; both need a property-specific
token from an account owner.

1. Create the Google Search Console property for `https://www.purduesmif.org`.
2. Verify by DNS TXT record, or paste the `google-site-verification` meta into
   the root `head()` in `src/routes/__root.tsx`.
3. Submit `https://www.purduesmif.org/sitemap.xml` — it is live and correct,
   and `robots.txt` already declares it.
4. Repeat in Bing Webmaster Tools, which can import the Google property.
5. In the Vercel project dashboard, enable **Analytics** and **Speed Insights**.
   The scripts are already deployed and inert until those toggles are on.

---

## Suggested order

1. BoilerLink description — highest authority, most likely source of the stale figure
2. Vercel Analytics + Speed Insights toggles — one click each, starts the measurement clock
3. Search Console property + sitemap submission
4. LinkedIn, Instagram, Substack — one sitting
5. The business.purdue.edu email — longest lead time, so send it early even though it lands last
6. Look-alike domain ownership check

## Re-measuring

Re-run these queries in ~30 days and record whether purduesmif.org appears:

- `Purdue finance clubs`
- `best investment clubs at Purdue University to join`
- `Purdue investment club real money`
- `which Purdue club manages real money`
- `how much does Purdue SMIF manage` — watch specifically for whether the
  answer has moved off "$400,000"

The first three are the category queries the site was absent from at audit
time. The last is the clearest single test of whether this phase worked.
