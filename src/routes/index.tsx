import { createFileRoute, Link } from "@tanstack/react-router";
import tradingImg from "@/assets/nyc-skyline.webp";
import campusImg from "@/assets/hero-campus.webp";
import { applyUrl } from "@/lib/apply-url";
import { ArrowRight, TrendingUp, Users, Award, BarChart3, ChevronRight, ExternalLink } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFundStats } from "@/lib/fund-stats.functions";
import { liveQueryOptions } from "@/lib/live-query";

import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { SectionRule, SectionRuleOnDark } from "@/components/SectionRule";
import { socialMeta, canonical } from "@/lib/seo";
import { PerformanceSparkline } from "@/components/PerformanceSparkline";
import { LivePortfolioPanel } from "@/components/LivePortfolioPanel";
import { PortfolioTape } from "@/components/PortfolioTape";

const HOME_TITLE = "Purdue SMIF — Student Managed Investment Fund";
const HOME_DESCRIPTION = "Purdue SMIF is the student investment club at the Daniels School of Business: the university's student-managed fund, where analysts invest real capital.";


export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      ...socialMeta({
        title: HOME_TITLE,
        description: HOME_DESCRIPTION,
        url: canonical("/"),
      }),
    ],
    links: [
      { rel: "canonical", href: canonical("/") },
      { rel: "preload", as: "image", href: tradingImg, fetchPriority: "high" },
    ],
  }),
});

// Last-resort fallback used ONLY when the fund_stats table fetch fails.
// The live values come from the DB (computed server-side from holdings ×
// latest quotes + cash). Refresh these numbers whenever the fund's stats
// move materially so a failed fetch still shows a reasonable approximation.
const FALLBACK_STATS = {
  aum_display: "$638K",
  active_members: "50+",
  founded_year: 2009,
  sector_teams: 10,
};

// Parse a display string like "$600K" or "50+" into { prefix, value, suffix }
// so CountUp can animate the numeric portion while preserving formatting.
function parseStatDisplay(display: string): { prefix: string; value: number; suffix: string } {
  const match = display.match(/^([^\d.-]*)([\d.]+)(.*)$/);
  if (!match) return { prefix: "", value: 0, suffix: display };
  return { prefix: match[1] ?? "", value: parseFloat(match[2]) || 0, suffix: match[3] ?? "" };
}

const PILLARS = [
  { Icon: BarChart3, title: "Investment Research", body: "Bottom-up fundamental analysis across equity sector teams. Every pitch is defended live before the full investment committee, with the same rigor as a professional fund." },
  { Icon: Users, title: "Mentorship & Recruiting", body: "Direct access to Purdue alumni at investment banks, hedge funds, and asset managers, plus structured preparation to compete for those seats." },
  { Icon: Award, title: "Real Portfolio", body: "Students vote on every position. Performance is benchmarked against the S&P 500 and reported quarterly. No simulations: real capital, real accountability." },
];

function Index() {
  const fetchStats = useServerFn(getFundStats);
  const { data: fundStats } = useQuery({
    queryKey: ["fund-stats"],
    queryFn: () => fetchStats(),
    ...liveQueryOptions,
  });
  const s = fundStats ?? FALLBACK_STATS;
  const currentYear = new Date().getFullYear();
  const trackRecordYears = Math.max(0, currentYear - s.founded_year);
  const aum = parseStatDisplay(s.aum_display);
  const members = parseStatDisplay(s.active_members);
  const STATS = [
    { kind: "aum" as const, label: "Assets Under Management", sub: "actively deployed" },
    { kind: "members" as const, label: "Active Members", sub: "across all years" },
    { kind: "track" as const, label: "Track Record", sub: `since est. ${s.founded_year}` },
    { kind: "sectors" as const, label: "Sector Coverage Teams", sub: "bottom-up research" },
  ];
  return (
    <>
      {/* Hero — the live book above the fold.
          The skyline is a ground, not the subject: every finance club has that
          photograph, and none of them can show a real portfolio. */}
      <section className="relative isolate overflow-hidden bg-ink min-h-[100dvh] flex flex-col">
        <div aria-hidden="true" className="absolute inset-0">
          <img
            src={tradingImg}
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover opacity-[0.13]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/80 to-ink" />
        </div>

        <div className="relative flex-1 container-prose flex flex-col justify-center py-20 lg:py-24 text-background">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Left: who we are, in one breath */}
            <div>
              <div className="animate-fade-in flex items-center gap-3 mb-7">
                <span className="rule-gold animate-expand-x delay-100" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/80">
                  Daniels School of Business · Est. {s.founded_year}
                </span>
              </div>
              <h1
                className="animate-fade-up font-display font-bold text-background"
                style={{ fontSize: "clamp(2.4rem, 5.4vw, 4.5rem)", lineHeight: "1.02" }}
              >
                Purdue <span className="text-gold">Student</span> Managed Investment Fund
              </h1>
              <p className="animate-fade-up mt-6 max-w-lg text-on-dark-primary text-base leading-relaxed">
                Students run this book. Real university capital, a disciplined research
                process, and every position defended live before the committee.
              </p>
              <div className="animate-fade-up mt-8 flex flex-wrap gap-4">
                <a
                  href={applyUrl("home-hero")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press group inline-flex items-center gap-2.5 bg-gold px-8 py-3.5 text-sm font-semibold text-ink hover:bg-gold-mid"
                >
                  Apply to Join
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">(opens application form in new tab)</span>
                </a>
                <Link
                  to="/performance"
                  className="press group inline-flex items-center gap-2.5 border border-background/25 px-8 py-3.5 text-sm font-semibold text-background hover:border-gold hover:text-gold"
                >
                  Track record
                  <ArrowRight className="arrow-slide h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right: the thing no other club can show */}
            <div className="animate-fade-up lg:pl-4">
              <LivePortfolioPanel />
            </div>
          </div>

          {/* Stats — one hairline row, not a four-up band competing with the panel */}
          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-gold/40 pt-6 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-bold leading-none text-gold lg:text-4xl">
                  {stat.kind === "aum" ? (
                    <>
                      {aum.prefix && <span>{aum.prefix}</span>}
                      <CountUp to={aum.value} rollId="home-aum" />
                      <span>{aum.suffix}</span>
                    </>
                  ) : stat.kind === "members" ? (
                    <>
                      {members.prefix && <span>{members.prefix}</span>}
                      <CountUp to={members.value} rollId="home-members" />
                      <span>{members.suffix}</span>
                    </>
                  ) : stat.kind === "track" ? (
                    <>
                      <CountUp to={trackRecordYears} rollId="home-track" />
                      <span>Y+</span>
                    </>
                  ) : (
                    <CountUp to={s.sector_teams} rollId="home-sectors" />
                  )}
                </div>
                <div className="mt-2.5 text-[10px] uppercase tracking-[0.24em] text-on-dark-secondary font-medium">
                  {stat.label}
                </div>
                <div className="mt-1 text-[10px] text-on-dark-dim font-mono uppercase tracking-[0.18em]">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        <PortfolioTape />
      </section>

      {/* Mission */}
      <section className="bg-ink text-background py-32 overflow-hidden">
        <div className="container-prose">
          <SectionRuleOnDark className="max-w-2xl mb-20">
            <h2 className="mt-5 font-display font-bold text-background" style={{ fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}>
              Real capital.<br />Real research.<br />
              <span className="text-gold/70">Real outcomes.</span>
            </h2>
          </SectionRuleOnDark>
          <div className="grid md:grid-cols-5 gap-16 items-start">
            <Reveal className="md:col-span-3 space-y-5" delay={0.1}>
              <p className="text-background/85 text-lg leading-relaxed">
                SMIF is Purdue's student investment club with a real portfolio: it gives students the rare opportunity to manage actual investment capital under faculty mentorship. Our analysts apply institutional-grade frameworks to fundamental equity research, building skills that translate directly to careers in asset management, investment banking, and equity research.
              </p>
              <p className="text-background/75 leading-relaxed">
                Every semester, analysts pitch positions to the full fund. Accepted ideas enter the real portfolio. Rejected ideas come with feedback that sharpens the next pitch. This is the closest an undergraduate education gets to the actual job.
              </p>
              <Link to="/about" className="group inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-mid transition-colors duration-200 mt-2 cursor-pointer">
                Learn about our process
                <ChevronRight className="h-4 w-4 arrow-slide" />
              </Link>
            </Reveal>
            <Reveal className="md:col-span-2 relative" delay={0.2}>
              <img
                src={campusImg}
                alt="Purdue's Daniels School of Business campus"
                loading="lazy"
                width={1600}
                height={1200}
                className="w-full aspect-[3/4] object-cover shadow-elegant"
              />
              <div className="absolute -bottom-5 -left-5 bg-gold p-5 shadow-gold hidden lg:block">
                <div className="font-display text-3xl font-bold text-ink leading-none">{trackRecordYears}Y+</div>
                <div className="text-xs uppercase tracking-wider text-ink/75 mt-1">Track record</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-background border-t border-border py-32">
        <div className="container-prose">
          <Reveal className="flex items-end justify-between mb-16 gap-8 flex-wrap">
            <SectionRule>
              <h2 className="mt-5 font-display font-bold text-ink" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)" }}>
                Three pillars<br />of the fund
              </h2>
            </SectionRule>
            <Link to="/apply" className="group hidden md:inline-flex items-center gap-2 text-sm font-semibold text-ink border-b-2 border-gold pb-1 hover:text-gold-deep transition-colors duration-200 cursor-pointer">
              Apply to join
              <ArrowRight className="h-4 w-4 arrow-slide" />
            </Link>
          </Reveal>
          <RevealGroup className="grid md:grid-cols-3 border-t border-border" stagger={0.12}>
            {PILLARS.map(({ Icon, title, body }) => (
              <RevealItem
                key={title}
                className="group relative border-b md:border-b-0 md:border-r border-border last:border-r-0 p-8 lg:p-10 transition-colors duration-300 hover:bg-secondary/50"
              >
                <div className="mb-8 flex items-center justify-start">
                  <Icon className="h-6 w-6 text-gold-deep transition-all duration-200 group-hover:text-ink group-hover:scale-110" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-ink mb-4">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Performance teaser */}
      <section className="bg-secondary/60 border-t border-border py-20">
        <Reveal className="container-prose flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">
              Benchmarked against the S&amp;P 500.<br className="hidden md:block" />
              Reported every quarter.
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-10 flex-shrink-0 w-full md:w-auto">
            <PerformanceSparkline />
            <div className="flex gap-4 flex-shrink-0">
              <Link to="/performance" className="press group inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-sm font-semibold text-background hover:bg-ink/85 cursor-pointer">
                Performance
                <ArrowRight className="h-4 w-4 arrow-slide" />
              </Link>
              <Link to="/holdings" className="press inline-flex items-center gap-2 border border-ink px-7 py-3.5 text-sm font-semibold text-ink hover:bg-ink hover:text-background cursor-pointer">
                Holdings
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="bg-ink text-background py-32 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span
            className="font-display font-bold text-white/[0.03] leading-none whitespace-nowrap"
            style={{ fontSize: "clamp(5rem, 20vw, 16rem)" }}
          >
            SMIF
          </span>
        </div>
        <Reveal className="relative container-prose text-center max-w-3xl mx-auto">
          <TrendingUp className="mx-auto h-7 w-7 text-gold mb-8 opacity-75" aria-hidden="true" />
          <h2 className="font-display font-bold text-background" style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}>
            Ready to invest<br />in your future?
          </h2>
          <p className="mt-6 max-w-lg mx-auto text-background/75 leading-relaxed">
            Applications open each fall and spring semester. We're looking for curious, rigorous students from every college at Purdue.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={applyUrl("home-cta")}
              target="_blank"
              rel="noopener noreferrer"
              className="press group inline-flex items-center justify-center gap-2.5 bg-gold px-9 py-4 text-sm font-semibold text-ink hover:bg-gold-mid cursor-pointer"
            >
              Apply to Join
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens application form in new tab)</span>
            </a>
            <Link to="/team" className="press inline-flex items-center justify-center gap-2 border border-background/20 px-9 py-4 text-sm font-semibold text-background hover:border-gold hover:text-gold cursor-pointer">
              Meet the Team
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
