import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Download } from "lucide-react";
import { socialMeta, canonical, breadcrumbLd, OG_LEARN } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { applyUrl } from "@/lib/apply-url";
import dcfAmzn from "@/assets/dcf-model-amzn.xlsx?url";
import amznThesis from "@/assets/amzn-investment-thesis.docx?url";
import amznCca from "@/assets/amzn-cca.xlsx?url";
import amznCcaCommentary from "@/assets/amzn-cca-commentary.docx?url";

const APPLICATION_URL = applyUrl("learn-cta");

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
      { title: "Learn Investing: Equity Research & Valuation | Purdue SMIF" },
      {
        name: "description",
        content:
          "The Purdue SMIF education hub: analyst training curriculum, reading list, research tools, and a glossary of investing terms.",
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
    scripts: [breadcrumbLd("Learn", "/learn")],
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
  { n: "01", title: "Accounting & Financial Statements", body: "Read the three statements, see how they link, and judge earnings quality from the footnotes." },
  { n: "02", title: "Valuation", body: "DCF mechanics, trading comps, and precedent transactions, and when each one actually applies." },
  { n: "03", title: "Industry & Competitive Analysis", body: "Five forces, moats, unit economics, and sizing the addressable market." },
  { n: "04", title: "Building the Pitch", body: "Thesis, variant perception, risks, and catalysts, assembled into the SMIF pitch format." },
  { n: "05", title: "Portfolio Construction & Risk", body: "Position sizing, diversification, benchmarking, and drawdown discipline." },
  { n: "06", title: "Markets, Macro & Fixed Income", body: "Rates, the yield curve, and credit, and how the top-down frames bottom-up ideas." },
];

const READING = [
  { title: "The Intelligent Investor", author: "Benjamin Graham", note: "The framework for value, margin of safety, and Mr. Market." },
  { title: "Common Stocks and Uncommon Profits", author: "Philip Fisher", note: "Qualitative scuttlebutt and what makes a business great." },
  { title: "The Most Important Thing", author: "Howard Marks", note: "Risk, cycles, and second-level thinking." },
  { title: "Investment Valuation", author: "Aswath Damodaran", note: "The reference text for DCF and relative valuation." },
  { title: "Financial Statement Analysis and Security Valuation", author: "Stephen Penman", note: "Accounting-based valuation, done rigorously." },
  { title: "Expectations Investing", author: "Mauboussin & Rappaport", note: "Reading the expectations priced into a stock." },
  { title: "Competition Demystified", author: "Bruce Greenwald", note: "A practical approach to moats and barriers to entry." },
  { title: "Security Analysis", author: "Graham & Dodd", note: "The original deep dive on analyzing securities." },
  { title: "Poor Charlie's Almanack", author: "Charlie Munger", note: "Mental models and the multidisciplinary approach." },
];

const TOOLS = [
  { name: "SEC EDGAR", url: "https://www.sec.gov/edgar", note: "Primary filings: 10-K, 10-Q, 8-K." },
  { name: "Damodaran Online", url: "https://pages.stern.nyu.edu/~adamodar/", note: "Free valuation data, spreadsheets, and lectures." },
  { name: "FRED", url: "https://fred.stlouisfed.org/", note: "Macro and interest-rate data from the St. Louis Fed." },
  { name: "LSEG", url: "https://www.lseg.com/", note: "Market data, analytics, and the Refinitiv terminal for institutional research." },
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/", note: "Real-time quotes, historical data, and news for public equities." },
  { name: "Bloomberg", url: "https://www.bloomberg.com/professional/", note: "The Bloomberg Terminal: data, analytics, and execution for finance professionals." },
];


const GLOSSARY = [
  { term: "Intrinsic Value", def: "What a business is actually worth based on the cash it will generate, independent of its market price." },
  { term: "DCF", def: "Discounted cash flow. Project future free cash flows and discount them to today at the cost of capital." },
  { term: "WACC", def: "Weighted average cost of capital. The blended required return on a firm's debt and equity; the discount rate in a DCF." },
  { term: "Free Cash Flow", def: "Cash left after operating costs and capital expenditures; what's actually available to investors." },
  { term: "Terminal Value", def: "The value of a business beyond the explicit forecast, often the largest piece of a DCF." },
  { term: "EV / EBITDA", def: "Enterprise value over EBITDA. A capital-structure-neutral valuation multiple." },
  { term: "Margin of Safety", def: "Buying well below intrinsic value so analytical errors don't become permanent losses." },
  { term: "Economic Moat", def: "A durable competitive advantage that protects a company's returns from competitors." },
  { term: "Catalyst", def: "A specific event expected to close the gap between price and value." },
  { term: "Alpha", def: "Return earned above what the benchmark would predict." },
  { term: "Beta", def: "A stock's volatility relative to the broader market." },
  { term: "Sharpe Ratio", def: "Excess return per unit of risk; risk-adjusted performance." },
];

function Learn() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-background">
        <div className="container-prose py-28 max-w-3xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Education</span>
            <h1
              className="mt-4 font-display text-5xl font-bold md:text-6xl"
              style={{ lineHeight: "1.02" }}
            >
              Learn the craft,<br />
              <span className="text-gold">then prove it.</span>
            </h1>
            <p className="mt-6 text-lg text-on-dark-secondary">
              The same material our analysts train on, and a companion to the courses we teach. Build the foundation, then defend a real pitch with real capital on the line.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Two tracks */}
      <section className="bg-background border-t border-border py-28">
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <span className="rule-gold mb-5 block" />
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Two tracks,<br />one standard.
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

      {/* Curriculum — a syllabus, with the module index alongside the modules.
          Six numbered rows in a flat stack read like six more cards; a sticky
          contents rail says "this is a course, and here is its shape". */}
      <section className="bg-secondary/40 border-t border-border py-28">
        <div className="container-prose grid gap-12 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              The learning path.
            </h2>
            <nav aria-label="Curriculum modules" className="mt-6 border-t border-border">
              {CURRICULUM.map((m) => (
                <a
                  key={m.n}
                  href={`#module-${m.n}`}
                  className="group row-rail flex items-baseline gap-3 border-b border-border py-2.5 text-sm transition-colors hover:bg-background/60"
                >
                  <span className="font-mono text-[11px] tracking-[0.18em] text-gold-deep">{m.n}</span>
                  <span className="text-muted-foreground group-hover:text-ink">{m.title}</span>
                </a>
              ))}
            </nav>
          </div>

          <RevealGroup className="border-t border-border" stagger={0.024}>
            {CURRICULUM.map((m) => (
              <RevealItem key={m.n} className="border-b border-border py-8">
                <div id={`module-${m.n}`} className="scroll-mt-20">
                  <div className="font-mono text-xs uppercase tracking-[0.22em] text-gold-deep">
                    Module {m.n}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-semibold text-ink md:text-2xl">
                    {m.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{m.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Reading list */}
      <section className="bg-background border-t border-border py-28">
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <span className="rule-gold mb-5 block" />
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Reading list.
            </h2>
          </Reveal>
          {/* A reading list is a list. Nine equal cards made every title look
              like a product tile; the citation form makes them look like books. */}
          <RevealGroup className="border-t border-border" stagger={0.024}>
            {READING.map((b) => (
              <RevealItem key={b.title}>
                <div className="grid gap-1 border-b border-border py-5 md:grid-cols-[minmax(0,22rem)_1fr] md:items-baseline md:gap-8">
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-snug text-ink">
                      {b.title}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {b.author}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{b.note}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Resources & tools */}
      <section className="bg-background border-t border-border py-28">
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Tools we use.
            </h2>
          </Reveal>
          <RevealGroup className="border-t border-border" stagger={0.024}>
            {TOOLS.map((t) => (
              <RevealItem key={t.name}>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group row-rail -mx-2 grid gap-1 border-b border-border px-2 py-4 transition-colors duration-200 hover:bg-secondary/40 md:grid-cols-[minmax(0,14rem)_1fr_auto] md:items-baseline md:gap-8"
                >
                  <h3 className="font-display text-lg font-semibold text-ink transition-colors group-hover:text-gold-deep">
                    {t.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t.note}</p>
                  <ExternalLink
                    className="icon-pop h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-gold-deep"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </RevealItem>
            ))}
          </RevealGroup>

        </div>
      </section>

      {/* Example models */}
      <section className="bg-background border-t border-border py-28">
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <span className="rule-gold mb-5 block" />
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Example models.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Worked examples from our analyst training. Open them, tear them apart, and build your own.
            </p>
          </Reveal>
          {/* Downloadable files, presented as files: kind and name first, so
              you can tell an Excel model from a Word memo before you click. */}
          <RevealGroup className="border-t border-border" stagger={0.024}>
            {EXAMPLES.map((e) => (
              <RevealItem key={e.title}>
                <a
                  href={e.href}
                  download={e.filename}
                  className="group row-rail -mx-2 grid gap-1 border-b border-border px-2 py-5 transition-colors duration-200 hover:bg-secondary/40 md:grid-cols-[minmax(0,12rem)_1fr_auto] md:items-baseline md:gap-8"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-gold-deep">
                    {e.kind}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold text-ink transition-colors group-hover:text-gold-deep">
                      {e.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {e.note}
                    </span>
                  </span>
                  <Download
                    className="icon-pop h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-gold-deep"
                    aria-hidden="true"
                  />
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Glossary */}
      <section className="bg-secondary/40 border-t border-border py-28">

        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Key terms.
            </h2>
          </Reveal>
          {/* A glossary is a definition list, and marking it up as one is both
              better semantics and a smaller, faster read than 20 cards. */}
          <dl className="grid border-t border-border md:grid-cols-2 md:gap-x-12">
            {GLOSSARY.map((g) => (
              <div key={g.term} className="border-b border-border py-5">
                <dt className="font-display text-lg font-semibold text-ink">{g.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{g.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink text-background py-32">
        <Reveal className="container-prose max-w-3xl text-center">
          <span className="rule-gold block mb-6 mx-auto" />
          <h2 className="font-display font-bold text-background" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
            The resources are free.<br />
            <span className="text-gold">The seat is earned.</span>
          </h2>
          <p className="mt-6 text-on-dark-secondary max-w-xl mx-auto">
            Members get the full training and a senior mentor. Applications open each fall and spring.
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
