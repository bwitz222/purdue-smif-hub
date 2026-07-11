import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { socialMeta, canonical, OG_ABOUT } from "@/lib/seo";
import { applyUrl } from "@/lib/apply-url";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

const PAGE_TITLE = "About | Purdue SMIF";
const PAGE_DESCRIPTION = "How the Purdue Student Managed Investment Fund researches, debates, and votes on every real-money position: our history, philosophy, and process.";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      ...socialMeta({
        title: "About Purdue SMIF: History, Philosophy & Process",
        description: PAGE_DESCRIPTION,
        url: canonical("/about"),
        image: OG_ABOUT,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/about") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About | Purdue SMIF",
          url: "https://www.purduesmif.org/about",
          about: { "@id": "https://www.purduesmif.org/#organization" },
        }),
      },
    ],
  }),
});

const PROCESS = [
  { n: "01", t: "Idea Generation",  d: "Analysts screen their sectors for compelling setups: catalysts, mispricing, or structural change the market hasn't priced." },
  { n: "02", t: "Deep Research",    d: "Financial modeling, channel checks, and management review. Every assumption documented, every risk stress-tested." },
  { n: "03", t: "Pitch & Debate",   d: "Theses defended live before the full investment committee. Pushback is expected. Weak arguments don't survive." },
  { n: "04", t: "Vote & Monitor",   d: "Members vote. Accepted positions enter the real portfolio. Every holding reviewed quarterly against its original thesis." },
];

const IPS = [
  { t: "Objective",        d: "Long-term capital appreciation benchmarked against the S&P 500, while providing an authentic asset-management learning experience." },
  { t: "Eligible Universe",d: "Primarily U.S.-listed equities and fixed income; ADRs permitted. No options, futures, leverage, or short positions." },
  { t: "Diversification",  d: "Position sizes capped per name and per sector. Maintain meaningful exposure across all covered sectors." },
  { t: "Risk Controls",    d: "Ongoing monitoring of factor exposures, drawdowns, and concentration. Quarterly reviews with the faculty advisor." },
  { t: "Decision Process", d: "Every trade requires a written thesis, valuation, and a majority vote of the investment committee." },
  { t: "Reporting",        d: "Performance and attribution reported each semester to the Daniels School and university stakeholders." },
];

function About() {
  return (
    <>
      {/* ── Page header ───────────────────────────────────────────── */}
      <section className="relative bg-ink text-background overflow-hidden">
        <div className="container-prose py-28">
          <Reveal>
            <span className="rule-gold mb-8 animate-expand-x" />
            <h1
              className="font-display font-bold text-background max-w-3xl"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", lineHeight: "1.02" }}
            >
              A legacy of<br />
              disciplined<br />
              <span className="text-gold/80">investing.</span>
            </h1>
            <p className="mt-8 max-w-xl text-on-dark-secondary leading-relaxed text-lg">
              Founded at the Daniels School of Business. Built on the conviction
              that the best way to learn investing is to actually invest.
            </p>
          </Reveal>
        </div>
        {/* Decorative rule */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </section>

      {/* ── History ───────────────────────────────────────────────── */}
      <section className="container-prose py-24 grid gap-16 md:grid-cols-3">
        <Reveal className="md:col-span-1">
          <span className="rule-gold block mb-5" />
          <h2 className="font-display text-2xl font-bold">Our History</h2>
        </Reveal>
        <div className="md:col-span-2 space-y-6 text-lg text-muted-foreground">
          <Reveal delay={0.1}>
            <p>
              Founded at the Daniels School of Business, the Purdue Student Managed
              Investment Fund began as a small group of finance students with a single
              conviction: that the best way to learn investing is to invest. From an
              initial capital allocation, the fund has grown to manage real assets on
              behalf of the university.
            </p>
            <p className="mt-6">
              Each cycle, the fund admits 15 to 25 analysts from a pool of more than 100
              applicants. Members have placed at Morgan Stanley, Barclays, BMO Capital
              Markets, Wells Fargo, and Big 4 accounting firms.
            </p>
          </Reveal>

          <div className="pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep mb-6">
              Where Our Members Go
            </h3>
            <RevealGroup className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border" stagger={0.05}>
              {[
                "Morgan Stanley",
                "Barclays",
                "BMO Capital",
                "Wells Fargo",
                "Deloitte",
                "PwC",
                "EY",
                "KPMG",
              ].map((firm) => (
                <RevealItem
                  key={firm}
                  className="bg-background flex items-center justify-center px-4 py-8 text-center hover:bg-secondary/50 transition-colors duration-200"
                >
                  <span className="font-display text-sm font-semibold text-ink/75 tracking-tight">
                    {firm}
                  </span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ── Philosophy ────────────────────────────────────────────── */}
      <section className="bg-ink text-background py-24">
        <div className="container-prose grid gap-16 md:grid-cols-3">
          <Reveal>
            <span className="rule-gold block mb-5" />
            <h2 className="font-display text-2xl font-bold text-gold">Philosophy</h2>
          </Reveal>
          <Reveal className="md:col-span-2 space-y-6 text-lg text-background/70" delay={0.1}>
            <p>
              We are long-term, fundamentally-driven investors. Every position must
              be supported by a rigorous thesis: a differentiated view, a defensible
              valuation, and a clearly-articulated catalyst path.
            </p>
            <p>
              We invest with patience, manage risk with discipline, and prize
              intellectual honesty above all else. When the facts change, we change
              our minds.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────── */}
      <section className="container-prose py-24">
        <Reveal className="mb-16">
          <span className="rule-gold block mb-5" />
          <h2
            className="font-display font-bold text-ink"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
          >
            Our process
          </h2>
        </Reveal>
        <RevealGroup className="grid gap-px bg-border md:grid-cols-4" stagger={0.1}>
          {PROCESS.map(({ n, t, d }) => (
            <RevealItem key={n} className="bg-background p-8 lg:p-10 group hover:bg-secondary/50 transition-colors duration-300">
              <div className="font-display text-5xl font-bold text-gold/25 leading-none mb-6 group-hover:text-gold/45 transition-colors duration-300">
                {n}
              </div>
              <h3 className="font-display text-xl font-semibold text-ink mb-3">{t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ── IPS ───────────────────────────────────────────────────── */}
      <section className="bg-secondary/40 border-t border-border py-24">
        <div className="container-prose grid gap-16 md:grid-cols-3">
          <Reveal className="md:col-span-1">
            <span className="rule-gold block mb-5" />
            <h2 className="font-display text-2xl font-bold">Investment Policy Statement</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              The governing document defining our objectives, eligible investments,
              risk parameters, and member responsibilities.
            </p>
          </Reveal>
          <div className="md:col-span-2">
            <RevealGroup className="grid gap-px bg-border sm:grid-cols-2" stagger={0.06}>
              {IPS.map(({ t, d }) => (
                <RevealItem key={t} className="bg-background p-6 hover:bg-secondary/50 transition-colors duration-200">
                  <h3 className="font-display text-base font-bold text-ink mb-2">{t}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
                </RevealItem>
              ))}
            </RevealGroup>
            <p className="mt-6 text-xs text-muted-foreground">
              The full IPS is reviewed annually and available on request from the executive board.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-ink text-background py-20">
        <Reveal className="container-prose flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-background">
              Ready to put our process to work?
            </h2>
            <p className="mt-3 max-w-md text-sm text-background/65">Apply to be part of the research process — from pitch to portfolio decision.</p>
          </div>
          <div className="flex gap-4 shrink-0">
            <a
              href={applyUrl("about-cta")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-gold px-7 py-3.5 text-sm font-semibold text-ink hover:bg-gold-mid transition-colors duration-200"
            >
              Apply to Join
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <Link
              to="/team"
              className="inline-flex items-center gap-2 border border-background/20 px-7 py-3.5 text-sm font-semibold text-background hover:border-gold hover:text-gold transition-colors duration-200"
            >
              Meet the Team
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
