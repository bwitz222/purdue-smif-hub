import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Download } from "lucide-react";
import { socialMeta, canonical, breadcrumbLd, OG_LEARN, PAGE_META } from "@/lib/seo";
import { GLOSSARY, termSlug } from "@/data/glossary";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { OnThisPage, type PageSection } from "@/components/OnThisPage";
import { applyUrl } from "@/lib/apply-url";
import dcfAmzn from "@/assets/dcf-model-amzn.xlsx?url";
import amznThesis from "@/assets/amzn-investment-thesis.docx?url";
import amznCca from "@/assets/amzn-cca.xlsx?url";
import amznCcaCommentary from "@/assets/amzn-cca-commentary.docx?url";

const APPLICATION_URL = applyUrl("learn-cta");

/** Anchors for the in-page nav. Each id must match a <section id> below. */
const SECTIONS: readonly PageSection[] = [
  { id: "tracks", label: "Two tracks" },
  { id: "path", label: "Learning path" },
  { id: "reading", label: "Reading list" },
  { id: "tools", label: "Tools" },
  { id: "models", label: "Example models" },
  { id: "glossary", label: "Key terms" },
];

const EXAMPLES = [
  {
    title: "DCF Model: Amazon (AMZN)",
    note: "A worked discounted cash flow on Amazon. Drivers, WACC build, terminal value, and a sensitivity table. Use it as a reference for structure and formatting.",
    href: dcfAmzn,
    filename: "DCF-Model-AMZN.xlsx",
    kind: "Excel · DCF",
  },
  {
    title: "One-Page Thesis: Amazon (AMZN)",
    note: "A one-page investment thesis on Amazon. Shows how to frame the setup, catalysts, valuation, and risks in the format we pitch in fund meetings.",
    href: amznThesis,
    filename: "AMZN-Investment-Thesis-SMIF.docx",
    kind: "Word · Thesis memo",
  },
  {
    title: "Comparable Company Analysis: Amazon (AMZN)",
    note: "A trading comps set for Amazon. Peer selection, calendarized metrics, and EV/Revenue, EV/EBITDA, and P/E multiples to triangulate valuation alongside the DCF.",
    href: amznCca,
    filename: "AMZN-Comparable-Company-Analysis-SMIF.xlsx",
    kind: "Excel · Comps",
  },
  {
    title: "CCA Commentary: Amazon (AMZN)",
    note: "Written commentary that pairs with the AMZN comps. Explains peer choice, multiple selection, and how to read the implied valuation range.",
    href: amznCcaCommentary,
    filename: "AMZN-CCA-Commentary-SMIF.docx",
    kind: "Word · Comps commentary",
  },
];

export const Route = createFileRoute("/learn")({
  component: Learn,
  head: () => ({
    meta: [
      { title: PAGE_META.learn.title },
      {
        name: "description",
        content: PAGE_META.learn.description,
      },
      ...socialMeta({
        title: "Learn Investing: Equity Research & Valuation | Purdue SMIF",
        description:
          "Analyst training, course companion material, reading list, tools, and a glossary for serious students of investing.",
        url: canonical("/learn"),
        image: OG_LEARN,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/learn") }],
    scripts: [
      // The DefinedTermSet for the glossary lives on /learn/glossary, where the
      // definitions are the page. This page links there.
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          "@id": `${canonical("/learn")}#course`,
          name: "Purdue SMIF Analyst Training",
          description:
            "A six-module analyst curriculum covering financial statements, valuation, competitive analysis, pitch construction, portfolio and risk, and macro and fixed income.",
          provider: { "@id": "https://www.purduesmif.org/#organization" },
          url: canonical("/learn"),
          educationalLevel: "Undergraduate",
          isAccessibleForFree: true,
          teaches: CURRICULUM.map((m) => m.title),
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Blended",
            courseWorkload: "PT6H",
          },
        }),
      },
      breadcrumbLd("Learn", "/learn"),
    ],
  }),
});

const TRACKS = [
  {
    title: "Analyst Training",
    body: "A structured path for fund members. Onboarding starts with accounting and valuation, builds to a defensible pitch, and continues with portfolio and risk work through your time in the fund.",
  },
  {
    title: "Course Companion",
    body: "Supplemental material for the finance courses we teach. Readings, concept explainers, and slides that sit alongside lectures for students who want to go deeper.",
  },
];

const CURRICULUM = [
  {
    n: "01",
    title: "Accounting & Financial Statements",
    body: "Read the three statements, see how they link, and judge earnings quality from the footnotes.",
  },
  {
    n: "02",
    title: "Valuation",
    body: "DCF mechanics, trading comps, and precedent transactions, and when each one actually applies.",
  },
  {
    n: "03",
    title: "Industry & Competitive Analysis",
    body: "Five forces, moats, unit economics, and sizing the addressable market.",
  },
  {
    n: "04",
    title: "Building the Pitch",
    body: "Thesis, variant perception, risks, and catalysts, assembled into the SMIF pitch format.",
  },
  {
    n: "05",
    title: "Portfolio Construction & Risk",
    body: "Position sizing, diversification, benchmarking, and drawdown discipline.",
  },
  {
    n: "06",
    title: "Markets, Macro & Fixed Income",
    body: "Rates, the yield curve, and credit, and how the top-down frames bottom-up ideas.",
  },
];

const READING = [
  {
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    note: "The framework for value, margin of safety, and Mr. Market.",
  },
  {
    title: "Common Stocks and Uncommon Profits",
    author: "Philip Fisher",
    note: "Qualitative scuttlebutt and what makes a business great.",
  },
  {
    title: "The Most Important Thing",
    author: "Howard Marks",
    note: "Risk, cycles, and second-level thinking.",
  },
  {
    title: "Investment Valuation",
    author: "Aswath Damodaran",
    note: "The reference text for DCF and relative valuation.",
  },
  {
    title: "Financial Statement Analysis and Security Valuation",
    author: "Stephen Penman",
    note: "Accounting-based valuation, done rigorously.",
  },
  {
    title: "Expectations Investing",
    author: "Mauboussin & Rappaport",
    note: "Reading the expectations priced into a stock.",
  },
  {
    title: "Competition Demystified",
    author: "Bruce Greenwald",
    note: "A practical approach to moats and barriers to entry.",
  },
  {
    title: "Security Analysis",
    author: "Graham & Dodd",
    note: "The original deep dive on analyzing securities.",
  },
  {
    title: "Poor Charlie's Almanack",
    author: "Charlie Munger",
    note: "Mental models and the multidisciplinary approach.",
  },
];

const TOOLS = [
  {
    name: "SEC EDGAR",
    url: "https://www.sec.gov/edgar",
    note: "Primary filings: 10-K, 10-Q, 8-K.",
  },
  {
    name: "Damodaran Online",
    url: "https://pages.stern.nyu.edu/~adamodar/",
    note: "Free valuation data, spreadsheets, and lectures.",
  },
  {
    name: "FRED",
    url: "https://fred.stlouisfed.org/",
    note: "Macro and interest-rate data from the St. Louis Fed.",
  },
  {
    name: "LSEG",
    url: "https://www.lseg.com/",
    note: "Market data, analytics, and the Refinitiv terminal for institutional research.",
  },
  {
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/",
    note: "Real-time quotes, historical data, and news for public equities.",
  },
  {
    name: "Bloomberg",
    url: "https://www.bloomberg.com/professional/",
    note: "The Bloomberg Terminal: data, analytics, and execution for finance professionals.",
  },
];

function Learn() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-background">
        <div className="container-prose py-28 max-w-3xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              Education
            </span>
            <h1
              className="mt-4 font-display text-5xl font-bold md:text-6xl"
              style={{ lineHeight: "1.02" }}
            >
              Learn the craft,
              <br />
              <span className="text-gold">then prove it.</span>
            </h1>
            <p className="mt-4 text-xl text-gold">
              Learn investing: equity research, valuation, and portfolio management.
            </p>
            <p className="mt-6 text-lg text-on-dark-secondary">
              The same material our analysts train on, and a companion to the courses we teach.
              Build the foundation, then defend a real pitch with real capital on the line.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Two tracks */}
      <OnThisPage sections={SECTIONS} />

      <section
        id="tracks"
        aria-labelledby="tracks-h"
        className="bg-background border-t border-border py-28 section-anchor"
      >
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <span className="rule-gold mb-5 block" />
            <h2
              id="tracks-h"
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Two tracks,
              <br />
              one standard.
            </h2>
          </Reveal>
          <RevealGroup className="grid md:grid-cols-2 border-t border-border" stagger={0.1}>
            {TRACKS.map((t) => (
              <RevealItem
                key={t.title}
                className="border-b md:border-b-0 md:border-r border-border last:border-r-0 p-8 lg:p-10"
              >
                <h3 className="font-display text-2xl font-semibold text-ink mb-3">{t.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{t.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Curriculum / learning path */}
      <section
        id="path"
        aria-labelledby="path-h"
        className="bg-secondary/40 border-t border-border py-28 section-anchor"
      >
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <h2
              id="path-h"
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              The learning path.
            </h2>
          </Reveal>
          <RevealGroup className="border-t border-border" stagger={0.06}>
            {CURRICULUM.map((m) => (
              <RevealItem
                key={m.n}
                className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 border-b border-border py-8"
              >
                <div className="font-mono text-xs uppercase tracking-[0.22em] text-gold-deep md:pt-1">
                  {m.n}
                </div>
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-ink mb-2">
                    {m.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{m.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Reading list */}
      <section
        id="reading"
        aria-labelledby="reading-h"
        className="bg-background border-t border-border py-28 section-anchor"
      >
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <span className="rule-gold mb-5 block" />
            <h2
              id="reading-h"
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Reading list.
            </h2>
          </Reveal>
          <RevealGroup
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border"
            stagger={0.05}
          >
            {READING.map((b) => (
              <RevealItem key={b.title} className="bg-background p-7 lg:p-8 flex flex-col">
                <h3 className="font-display text-lg font-semibold text-ink leading-snug">
                  {b.title}
                </h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {b.author}
                </p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{b.note}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Resources & tools */}
      <section
        id="tools"
        aria-labelledby="tools-h"
        className="bg-background border-t border-border py-28 section-anchor"
      >
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <h2
              id="tools-h"
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Tools we use.
            </h2>
          </Reveal>
          <RevealGroup
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border"
            stagger={0.05}
          >
            {TOOLS.map((t) => (
              <RevealItem key={t.name} className="bg-background">
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col h-full p-7 lg:p-8 hover:bg-secondary/40 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-ink group-hover:text-gold-deep transition-colors">
                      {t.name}
                    </h3>
                    <ExternalLink
                      className="h-4 w-4 text-muted-foreground group-hover:text-gold-deep transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.note}</p>
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Example models */}
      <section
        id="models"
        aria-labelledby="models-h"
        className="bg-background border-t border-border py-28 section-anchor"
      >
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <span className="rule-gold mb-5 block" />
            <h2
              id="models-h"
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Example models.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Worked examples from our analyst training. Open them, tear them apart, and build your
              own.
            </p>
          </Reveal>
          <RevealGroup
            className="grid sm:grid-cols-2 gap-px bg-border border border-border"
            stagger={0.05}
          >
            {EXAMPLES.map((e) => (
              <RevealItem key={e.title} className="bg-background">
                <a
                  href={e.href}
                  download={e.filename}
                  className="group flex flex-col h-full p-7 lg:p-8 hover:bg-secondary/40 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-ink group-hover:text-gold-deep transition-colors">
                      {e.title}
                    </h3>
                    <Download
                      className="h-4 w-4 text-muted-foreground group-hover:text-gold-deep transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    {e.kind}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{e.note}</p>
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Glossary */}
      <section
        id="glossary"
        aria-labelledby="glossary-h"
        className="bg-secondary/40 border-t border-border py-28 section-anchor"
      >
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <h2
              id="glossary-h"
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Key terms.
            </h2>
          </Reveal>
          <p className="max-w-2xl">
            {GLOSSARY.length} terms behind the curriculum and the stock pitches analysts defend,
            each defined in a sentence on the{" "}
            <Link
              to="/learn/glossary"
              className="link-underline font-bold text-gold-deep hover:text-ink"
            >
              investing glossary
            </Link>
            .
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {GLOSSARY.map((g) => (
              <li key={g.term}>
                <Link
                  to="/learn/glossary"
                  hash={termSlug(g.term)}
                  className="press inline-flex min-h-11 items-center rounded-sm border border-border px-3.5 text-sm font-bold text-ink hover:border-ink"
                >
                  {g.term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink text-background py-32">
        <Reveal className="container-prose max-w-3xl text-center">
          <span className="rule-gold block mb-6 mx-auto" />
          <h2
            className="font-display font-bold text-background"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
          >
            The resources are free.
            <br />
            <span className="text-gold">The seat is earned.</span>
          </h2>
          <p className="mt-6 text-on-dark-secondary max-w-xl mx-auto">
            Members get the full training and a senior mentor. Applications open each fall and
            spring. Preparing to apply? Start with the{" "}
            <Link
              to="/recruiting/technical-interview-prep"
              className="link-underline font-bold text-gold hover:text-background"
            >
              technical interview guide
            </Link>{" "}
            and the{" "}
            <Link
              to="/stock-pitches"
              className="link-underline font-bold text-gold hover:text-background"
            >
              stock pitch format
            </Link>
            , or compare{" "}
            <Link
              to="/finance-clubs-at-purdue"
              className="link-underline font-bold text-gold hover:text-background"
            >
              finance clubs at Purdue
            </Link>
            .
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={APPLICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex items-center justify-center gap-2.5 bg-gold px-9 py-4 text-sm font-semibold text-ink hover:bg-gold-mid"
            >
              Apply to Join
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens application form in new tab)</span>
            </a>
            <Link
              to="/recruiting"
              className="press inline-flex items-center justify-center gap-2 border border-background/30 px-9 py-4 text-sm font-semibold text-background hover:border-gold hover:text-gold"
            >
              Recruiting & prep guide
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
