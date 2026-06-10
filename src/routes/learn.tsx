import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Download } from "lucide-react";
import { socialMeta, canonical, OG_RECRUITING } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { applyUrl } from "@/lib/apply-url";
import dcfAmzn from "@/assets/dcf-model-amzn.xlsx.asset.json";

const APPLICATION_URL = applyUrl("learn-cta");

const EXAMPLES = [
  {
    title: "DCF Model — Amazon (AMZN)",
    note: "A worked discounted cash flow on Amazon. Drivers, WACC build, terminal value, and a sensitivity table. Use it as a reference for structure and formatting.",
    href: dcfAmzn.url,
    filename: "DCF-Model-AMZN.xlsx",
    kind: "Excel · DCF",
  },
];


export const Route = createFileRoute("/learn")({
  component: Learn,
  head: () => ({
    meta: [
      { title: "Learn — Purdue SMIF" },
      {
        name: "description",
        content:
          "The Purdue SMIF education hub — analyst training curriculum, reading list, research tools, and a glossary of investing terms.",
      },
      ...socialMeta({
        title: "Learn — Purdue SMIF",
        description:
          "Analyst training, course companion material, reading list, tools, and a glossary for serious students of investing.",
        url: canonical("/learn"),
        image: OG_RECRUITING,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/learn") }],
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
  { name: "Koyfin", url: "https://www.koyfin.com/", note: "Market data, charting, and screening." },
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

      {/* Curriculum / learning path */}
      <section className="bg-secondary/40 border-t border-border py-28">
        <div className="container-prose">
          <Reveal className="max-w-2xl mb-14">
            <h2 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
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
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-ink mb-2">{m.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{m.body}</p>
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
          <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border" stagger={0.05}>
            {READING.map((b) => (
              <RevealItem key={b.title} className="bg-background p-7 lg:p-8 flex flex-col">
                <h3 className="font-display text-lg font-semibold text-ink leading-snug">{b.title}</h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{b.author}</p>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{b.note}</p>
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
          <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border" stagger={0.05}>
            {TOOLS.map((t) => (
              <RevealItem key={t.name} className="bg-background">
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col h-full p-7 lg:p-8 hover:bg-secondary/40 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-ink group-hover:text-gold-deep transition-colors">{t.name}</h3>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-gold-deep transition-colors" aria-hidden="true" />
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
          <RevealGroup className="grid sm:grid-cols-2 gap-px bg-border border border-border" stagger={0.05}>
            {EXAMPLES.map((e) => (
              <RevealItem key={e.title} className="bg-background">
                <a
                  href={e.href}
                  download={e.filename}
                  className="group flex flex-col h-full p-7 lg:p-8 hover:bg-secondary/40 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold text-ink group-hover:text-gold-deep transition-colors">{e.title}</h3>
                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-gold-deep transition-colors" aria-hidden="true" />
                  </div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">{e.kind}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{e.note}</p>
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
          <RevealGroup className="grid md:grid-cols-2 gap-px bg-border border border-border" stagger={0.04}>
            {GLOSSARY.map((g) => (
              <RevealItem key={g.term} className="bg-background p-7 lg:p-8">
                <h3 className="font-display text-lg font-semibold text-ink mb-2">{g.term}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{g.def}</p>
              </RevealItem>
            ))}
          </RevealGroup>
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
              className="inline-flex items-center justify-center gap-2.5 bg-gold px-9 py-4 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200"
            >
              Apply to Join
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens application form in new tab)</span>
            </a>
            <Link
              to="/recruiting"
              className="inline-flex items-center justify-center gap-2 border border-background/30 px-9 py-4 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200"
            >
              Recruiting & prep guide
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
