import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { socialMeta, canonical, breadcrumbLd, OG_ABOUT } from "@/lib/seo";
import { applyUrl } from "@/lib/apply-url";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { OnThisPage, type PageSection } from "@/components/OnThisPage";

/** Anchors for the in-page nav. Each id must match a <section id> below. */
const SECTIONS: readonly PageSection[] = [
  { id: "short-answer", label: "The short answer" },
  { id: "organizations", label: "The organizations" },
  { id: "where-we-fit", label: "Where SMIF fits" },
  { id: "how-to-choose", label: "How to choose" },
  { id: "faq", label: "FAQ" },
];

const PAGE_TITLE = "Finance & Investment Clubs at Purdue: A Complete Guide | Purdue SMIF";
const PAGE_DESCRIPTION =
  "An honest guide to the finance and investment clubs at Purdue University — what each one does, who it suits, and which club manages real money. Written by the Student Managed Investment Fund.";

/**
 * Category landing page.
 *
 * The fund ranks first for its own name and nowhere at all for the queries
 * students actually type — "Purdue finance clubs", "best investment clubs at
 * Purdue". Those results are owned by BoilerLink, the Daniels club directory,
 * and LinkedIn. This page exists to compete for that intent.
 *
 * The strategy is honesty, not positioning: a page that describes the other
 * organizations fairly is the one an answer engine will quote, and the one a
 * prospective analyst will trust. Descriptions are deliberately kept at the
 * level of what each org is *for* — specific meeting times and offerings
 * change every semester, so we point at BoilerLink for the current details
 * rather than publishing facts about other clubs that will quietly go stale.
 */

const FAQ = [
  {
    q: "What finance clubs are there at Purdue?",
    a: "Purdue has a broad set of finance and investment organizations. The most established include the Student Managed Investment Fund (SMIF), Investment & Trading at Purdue (ITP), the Investment Banking Academy, the Financial Management Association (FMA), the Banking & Markets Club, and the Wealth & Asset Management Association (WAMA). Most students interested in finance join more than one, because they serve genuinely different purposes.",
  },
  {
    q: "Which Purdue investment club manages real money?",
    a: "The Purdue Student Managed Investment Fund (SMIF) manages real university capital rather than a simulated portfolio. Every position is researched, debated, and voted on by students before it is entered, and performance is benchmarked against the S&P 500 and reported quarterly. That accountability is the main structural difference between SMIF and a paper-portfolio club.",
  },
  {
    q: "Do you need to be a business major to join a Purdue finance club?",
    a: "No. SMIF recruits from every college at Purdue, and roughly a third of its analysts come from non-business majors including engineering, computer science, agricultural economics, and the liberal arts. Most other finance organizations at Purdue are open to all majors as well. What matters is willingness to do the reading and defend a view.",
  },
  {
    q: "Can freshmen join finance clubs at Purdue?",
    a: "Yes. SMIF accepts first-year students who are ready to commit the time, and several current analysts joined as freshmen. Applying early is generally an advantage, because the analyst path runs analyst to senior analyst to sector head to executive board, and that progression takes semesters.",
  },
  {
    q: "How many finance clubs should I join at Purdue?",
    a: "One or two that you take seriously will do more for you than five you attend occasionally. Clubs value depth: a sector team wants an analyst who shows up prepared every week. Pick based on the work you actually want to do, not on the length of the list.",
  },
  {
    q: "Is SMIF the same as the Student Managed Venture Fund?",
    a: "No. They are separate programs. The Student Managed Investment Fund (SMIF) is a student organization investing in public markets, primarily U.S. equities and fixed income, and it recruits undergraduates and graduate students by application each semester. The Student Managed Venture Fund (SMVF) is a Master of Finance program at the Daniels School focused on venture capital and evaluating startups.",
  },
  {
    q: "How competitive is it to join Purdue SMIF?",
    a: "Each cycle SMIF receives roughly 100 to 150 applications and admits 15 to 25 analysts. The process is an application, a coffee chat, and a technical interview, and it runs about three weeks. Prior finance experience is not required; preparation and curiosity are.",
  },
];

type Org = {
  name: string;
  short: string;
  focus: string;
  realMoney: string;
  bestFor: string;
};

const ORGS: Org[] = [
  {
    name: "Student Managed Investment Fund",
    short: "SMIF",
    focus: "Fundamental equity and fixed income research, portfolio management",
    realMoney: "Yes — real university capital",
    bestFor: "Asset management, equity research, and investing roles",
  },
  {
    name: "Investment & Trading at Purdue",
    short: "ITP",
    focus: "Investing education, valuation instruction, markets and trading discussion",
    realMoney: "Educational portfolio",
    bestFor: "Learning valuation from the ground up, and markets exposure",
  },
  {
    name: "Investment Banking Academy",
    short: "IBA",
    focus: "Investment banking recruiting preparation, mentorship, industry treks",
    realMoney: "No",
    bestFor: "Students targeting investment banking analyst roles",
  },
  {
    name: "Financial Management Association",
    short: "FMA",
    focus: "Broad finance education, speakers, and professional resources",
    realMoney: "No",
    bestFor: "Exploring finance careers before specializing",
  },
  {
    name: "Banking & Markets Club",
    short: "BMC",
    focus: "Banking and capital markets careers and technical preparation",
    realMoney: "No",
    bestFor: "Capital markets and banking recruiting",
  },
  {
    name: "Wealth & Asset Management Association",
    short: "WAMA",
    focus: "Wealth management, financial advising, and asset management careers",
    realMoney: "No",
    bestFor: "Private wealth and advisory career paths",
  },
];

export const Route = createFileRoute("/finance-clubs-at-purdue")({
  component: FinanceClubs,
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      ...socialMeta({
        title: "Finance & Investment Clubs at Purdue: A Complete Guide",
        description: PAGE_DESCRIPTION,
        url: canonical("/finance-clubs-at-purdue"),
        image: OG_ABOUT,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/finance-clubs-at-purdue") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": "https://www.purduesmif.org/finance-clubs-at-purdue#faq",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": "https://www.purduesmif.org/finance-clubs-at-purdue#article",
          headline: "Finance and Investment Clubs at Purdue: A Complete Guide",
          description: PAGE_DESCRIPTION,
          url: "https://www.purduesmif.org/finance-clubs-at-purdue",
          author: { "@id": "https://www.purduesmif.org/#organization" },
          publisher: { "@id": "https://www.purduesmif.org/#organization" },
          about: [
            { "@type": "Thing", name: "Finance clubs at Purdue University" },
            { "@type": "Thing", name: "Investment clubs at Purdue University" },
            { "@type": "Thing", name: "Student managed investment funds" },
          ],
        }),
      },
      breadcrumbLd("Finance Clubs at Purdue", "/finance-clubs-at-purdue"),
    ],
  }),
});

function FinanceClubs() {
  return (
    <>
      {/* ── Page header ───────────────────────────────────────────── */}
      <section className="relative bg-ink text-background overflow-hidden">
        <div className="container-prose py-28">
          <Reveal>
            <span className="rule-gold mb-8 animate-expand-x" />
            <h1
              className="font-display font-bold text-background max-w-4xl"
              style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.8rem)", lineHeight: "1.04" }}
            >
              Finance and investment<br />
              clubs at <span className="text-gold/80">Purdue.</span>
            </h1>
            {/* Direct-answer zone: the first thing a crawler or a model reads
                should answer the query outright, not tease it. */}
            <p className="mt-8 max-w-2xl text-on-dark-primary leading-relaxed text-lg">
              Purdue University has a deep bench of finance and investment organizations, and
              most students interested in markets end up joining more than one. This guide
              covers the main ones, what each is actually for, and how to choose. It is written
              by the Student Managed Investment Fund — the club that manages real university
              capital — so we have said plainly where we fit and where another organization is
              the better first stop.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── The short answer ──────────────────────────────────────── */}
      <OnThisPage sections={SECTIONS} />

      <section id="short-answer" aria-labelledby="short-answer-h" className="border-b border-border bg-secondary/40 section-anchor">
        <div className="container-prose py-24">
          <Reveal className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
              The short answer
            </span>
            <h2 id="short-answer-h" className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Pick by the work, not the name.
            </h2>
            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Finance clubs at Purdue split roughly three ways. Some exist to teach you the
                craft — valuation, financial statements, how a market actually clears. Some
                exist to get you a specific job, and organize around the recruiting calendar
                for banking, consulting, or wealth management. And one manages a real portfolio
                with real money and real consequences.
              </p>
              <p>
                Those are different products, and the honest answer to which club is best is
                that it depends entirely on what you want out of the next four years. A
                sophomore who has never opened a 10-K should probably start somewhere that
                teaches fundamentals. A junior who already models companies for fun and wants
                to defend a thesis in front of a committee wants something else.
              </p>
              <p>
                The one distinction worth understanding before you apply anywhere: whether the
                portfolio is real. Most student organizations run simulated or educational
                books, which is a perfectly good way to learn. The Student Managed Investment
                Fund invests actual university capital, which changes the character of the work
                — positions are voted on, performance is benchmarked against the S&amp;P 500 and
                reported quarterly, and a bad thesis costs the university money rather than
                points in a game.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────────── */}
      <section id="organizations" aria-labelledby="organizations-h" className="border-b border-border section-anchor">
        <div className="container-prose py-24">
          <Reveal className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
              At a glance
            </span>
            <h2 id="organizations-h" className="mt-4 font-display text-3xl font-bold md:text-4xl">
              The main organizations.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Offerings and meeting formats change every semester, so treat this as a map
              rather than a schedule. BoilerLink, Purdue&apos;s official student organization
              directory, carries the current details for every group listed here.
            </p>
          </Reveal>

          {/* Wide table scrolls inside its own container so the page body never
              scrolls horizontally on mobile. */}
          <Reveal>
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
                <caption className="sr-only">
                  Finance and investment organizations at Purdue University compared by focus,
                  whether they manage real money, and who they best suit.
                </caption>
                <thead className="bg-secondary/60">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">Organization</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Primary focus</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Real capital</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Best suited to</th>
                  </tr>
                </thead>
                <tbody>
                  {ORGS.map((o) => (
                    <tr key={o.short} className="border-t border-border align-top">
                      <th scope="row" className="px-5 py-4 font-semibold">
                        {o.name}
                        <span className="mt-1 block font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground">
                          {o.short}
                        </span>
                      </th>
                      <td className="px-5 py-4 text-muted-foreground">{o.focus}</td>
                      <td className="px-5 py-4 text-muted-foreground">{o.realMoney}</td>
                      <td className="px-5 py-4 text-muted-foreground">{o.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Where SMIF fits ───────────────────────────────────────── */}
      <section id="where-we-fit" aria-labelledby="where-we-fit-h" className="border-b border-border bg-secondary/40 section-anchor">
        <div className="container-prose py-24">
          <Reveal className="max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
              Where we fit
            </span>
            <h2 id="where-we-fit-h" className="mt-4 font-display text-3xl font-bold md:text-4xl">
              What the Student Managed Investment Fund is.
            </h2>
            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                The Purdue Student Managed Investment Fund is a student-run investment fund at
                the Daniels School of Business. It was founded in 2009 and manages real
                university capital across U.S. equities and fixed income. Analysts work on
                sector teams, research single names from the bottom up, and pitch positions to
                the full investment committee, which votes before anything enters the
                portfolio.
              </p>
              <p>
                The structure is deliberately close to a real fund. There are eight equity
                sector teams, a Fixed Income &amp; Macro group that frames the rate and credit
                backdrop, and a Portfolio + Risk Management team that handles sizing,
                monitoring, and attribution. The fund publishes its holdings and its
                performance against the S&amp;P 500 on this site, which is unusual for a student
                organization and is intentional: if we are going to claim the portfolio is
                real, the record should be public.
              </p>
              <p>
                It is not the right first stop for everyone. The time commitment is roughly six
                hours a week, the reading is genuine, and pitches get pushback. Students who
                want a broad introduction to finance careers, or who are still deciding whether
                markets interest them at all, are often better served starting with an
                education-first organization and applying to SMIF a semester or two later. That
                path is common and we recruit plenty of analysts who took it.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="press group inline-flex items-center gap-2.5 border border-ink/20 px-7 py-3 text-sm font-semibold hover:border-gold hover:text-gold-deep transition-colors duration-200"
              >
                How the fund works
                <ArrowRight className="h-4 w-4 arrow-slide" />
              </Link>
              <Link
                to="/performance"
                className="press group inline-flex items-center gap-2.5 border border-ink/20 px-7 py-3 text-sm font-semibold hover:border-gold hover:text-gold-deep transition-colors duration-200"
              >
                See the track record
                <ArrowRight className="h-4 w-4 arrow-slide" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How to choose ─────────────────────────────────────────── */}
      <section id="how-to-choose" aria-labelledby="how-to-choose-h" className="border-b border-border section-anchor">
        <div className="container-prose py-24">
          <Reveal className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
              How to choose
            </span>
            <h2 id="how-to-choose-h" className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Three questions worth answering first.
            </h2>
          </Reveal>
          <RevealGroup className="grid gap-10 md:grid-cols-3">
            {[
              {
                t: "What do you want to be doing?",
                d: "Research and investing, deal execution, and advising are different jobs with different daily work. Clubs organize around those differences. Sitting in on one meeting of each is the fastest way to find out which one holds your attention when nobody is grading you.",
              },
              {
                t: "How much time can you actually give?",
                d: "Be honest about the semester ahead. An organization you attend fully is worth more than three you attend partially, both for what you learn and for the recommendation you eventually want from the people running it.",
              },
              {
                t: "Where are you starting from?",
                d: "There is no shame in not knowing what EBITDA is yet. Education-first clubs exist precisely for that, and they feed the more selective organizations. Nearly every senior analyst in SMIF was a beginner two years earlier.",
              },
            ].map((c) => (
              <RevealItem key={c.t}>
                <h3 className="font-display text-xl font-bold">{c.t}</h3>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" aria-labelledby="faq-h" className="border-b border-border bg-secondary/40 section-anchor">
        <div className="container-prose py-24">
          <Reveal className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
              Common questions
            </span>
            <h2 id="faq-h" className="mt-4 font-display text-3xl font-bold md:text-4xl">
              Questions, answered.
            </h2>
          </Reveal>
          {/* Answers render as visible prose rather than inside a collapsed
              accordion. The schema above carries the same text, but plain-text
              extractors only see what is actually rendered. */}
          <RevealGroup className="grid gap-x-14 gap-y-10 md:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <RevealItem key={q}>
                <h3 className="font-display text-lg font-bold">{q}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────── */}
      <section className="bg-ink text-background">
        <div className="container-prose py-24">
          <Reveal className="max-w-2xl">
            <span className="rule-gold mb-6 block" />
            <h2
              className="font-display font-bold text-background"
              style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", lineHeight: "1.06" }}
            >
              Think the real portfolio<br />is the one you want?
            </h2>
            <p className="mt-6 text-on-dark-secondary leading-relaxed">
              Applications open each fall and spring. We recruit for curiosity, work ethic, and
              intellectual honesty, not pedigree — and we have taken students from every major
              at Purdue.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={applyUrl("finance-clubs-guide")}
                target="_blank"
                rel="noopener noreferrer"
                className="press group inline-flex items-center gap-2.5 bg-gold px-8 py-3.5 text-sm font-semibold text-ink hover:bg-gold-mid"
              >
                Apply to Join
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">(opens application form in new tab)</span>
              </a>
              <Link
                to="/recruiting"
                className="press inline-flex items-center gap-2.5 border border-background/25 px-8 py-3.5 text-sm font-semibold text-background hover:border-gold hover:text-gold"
              >
                Recruiting calendar
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
