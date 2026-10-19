import { createFileRoute, Link } from "@tanstack/react-router";
import skylineImg from "@/assets/nyc-skyline.webp";
import teamPhoto from "@/assets/team-photo.webp";
import { ArrowRight, ArrowUpRight, TrendingUp, Users, Award, BarChart3, Mail } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFundStats } from "@/lib/fund-stats.functions";
import { getPublications, type PublicationRow } from "@/lib/publications.functions";
import { SERIES_LABEL } from "@/lib/publication-series";
import { sectorTeams, studentCount, facultyCount } from "@/data/team";
import { liveQueryOptions } from "@/lib/live-query";
import { SUBSTACK_URL } from "@/lib/nav";
import { ApplyCta } from "@/components/ApplyCta";

import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { socialMeta, canonical, OG_HOME } from "@/lib/seo";
import { PerformanceSparkline } from "@/components/PerformanceSparkline";

const HOME_TITLE = "Purdue SMIF — Student Managed Investment Fund";
const HOME_DESCRIPTION =
  "Purdue SMIF is the student investment club at the Daniels School of Business: the university's student-managed fund, where analysts invest real capital.";

export const Route = createFileRoute("/")({
  // The three newest publications, rendered server-side so the home page links
  // straight into fresh research (getPublications degrades to [] on failure).
  loader: async () => ({ latest: (await getPublications()).slice(0, 3) }),
  component: Index,
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      ...socialMeta({
        title: HOME_TITLE,
        description: HOME_DESCRIPTION,
        url: canonical("/"),
        image: OG_HOME,
      }),
    ],
    links: [
      { rel: "canonical", href: canonical("/") },
      { rel: "preload", as: "image", href: teamPhoto, fetchPriority: "high" },
    ],
  }),
});

// Last-resort fallback used ONLY when the fund_stats table fetch fails.
// The live AUM comes from the DB (computed server-side from holdings ×
// latest quotes + cash). Refresh aum_display whenever the fund's assets move
// materially so a failed fetch still shows a reasonable approximation.
const FALLBACK_STATS = {
  aum_display: "$600K",
  founded_year: 1995,
};

// Parse a display string like "$600K" into { prefix, value, suffix }
// so CountUp can animate the numeric portion while preserving formatting.
function parseStatDisplay(display: string): { prefix: string; value: number; suffix: string } {
  const match = display.match(/^([^\d.-]*)([\d.]+)(.*)$/);
  if (!match) return { prefix: "", value: 0, suffix: display };
  return { prefix: match[1] ?? "", value: parseFloat(match[2]) || 0, suffix: match[3] ?? "" };
}

const PILLARS = [
  {
    Icon: BarChart3,
    title: "Investment Research",
    body: "Bottom-up fundamental analysis across equity sector teams. Every pitch is defended live before the full investment committee, with the same rigor as a professional fund.",
  },
  {
    Icon: Users,
    title: "Mentorship & Recruiting",
    body: "Direct access to Purdue alumni at investment banks, hedge funds, and asset managers, plus structured preparation to compete for those seats.",
  },
  {
    Icon: Award,
    title: "Real Portfolio",
    body: "Students vote on every position. Performance is benchmarked against the S&P 500 and reported quarterly. No simulations: real capital, real accountability.",
  },
];

const formatPubDate = (iso: string) =>
  // UTC so the server render and the browser agree on the day.
  new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Series and ticker only: titles already carry the issue number
// ("The Macro Brief #002: …").
const seriesLine = (p: PublicationRow) =>
  [SERIES_LABEL[p.category] ?? "Report", p.ticker].filter(Boolean).join(" · ");

function Index() {
  const { latest } = Route.useLoaderData();
  const fetchStats = useServerFn(getFundStats);
  const { data: fundStats } = useQuery({
    queryKey: ["fund-stats"],
    queryFn: () => fetchStats(),
    ...liveQueryOptions,
  });
  // AUM is live. Headcount and team count are DERIVED from the roster, never
  // read from fund_stats: the table said "50+" members and 10 coverage teams
  // while /team listed 49 students and 8 equity sector teams. The roster is
  // the single source of truth (see src/data/team.ts).
  const aumDisplay = fundStats?.aum_display ?? FALLBACK_STATS.aum_display;
  const foundedYear = fundStats?.founded_year ?? FALLBACK_STATS.founded_year;
  const currentYear = new Date().getFullYear();
  const trackRecordYears = Math.max(0, currentYear - foundedYear);
  const aum = parseStatDisplay(aumDisplay);
  const newest = latest[0];
  const STATS = [
    {
      key: "aum",
      value: (
        <>
          {aum.prefix && <span>{aum.prefix}</span>}
          <CountUp to={aum.value} duration={1.8} />
          <span>{aum.suffix}</span>
        </>
      ),
      label: "Assets under management",
      sub: "Real university capital",
    },
    {
      key: "members",
      value: <CountUp to={studentCount} duration={1.4} />,
      label: "Student members",
      sub: `Plus ${facultyCount} faculty advisors`,
    },
    {
      key: "years",
      value: (
        <>
          <CountUp to={trackRecordYears} duration={1.2} />
          <span>Y</span>
        </>
      ),
      label: "Years investing",
      sub: `Since ${foundedYear}`,
    },
    {
      key: "teams",
      value: <CountUp to={sectorTeams.length} duration={1.0} />,
      label: "Equity sector teams",
      sub: "Plus fixed income & macro",
    },
  ];

  return (
    <>
      {/* Hero. Sized to content, not to the viewport: at 1440×900 the newest
          publication and all four stats sit in the first screen. The audit
          that drove this found research 3,100px down the page and the stat
          labels below the fold. */}
      <section className="relative isolate overflow-hidden bg-ink text-background">
        {/* Texture only; the team photo is the subject. */}
        <div aria-hidden="true" className="absolute inset-0">
          <img
            src={skylineImg}
            alt=""
            width={1600}
            height={1216}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" />
        </div>
        <div className="relative container-prose grid gap-x-16 gap-y-8 pt-10 pb-12 lg:grid-cols-12 lg:pt-14 lg:pb-14">
          {/* 1. Identity + direct answer */}
          <div className="lg:col-span-7 lg:row-start-1">
            <div className="animate-fade-in flex items-center gap-3 mb-6">
              <span className="rule-gold animate-expand-x delay-100" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Daniels School of Business · Est. {foundedYear}
              </span>
            </div>
            <h1
              className="animate-fade-up delay-200 font-display font-bold text-background"
              style={{ fontSize: "clamp(2.25rem, 4.2vw, 3.5rem)", lineHeight: "1.06" }}
            >
              Purdue <span className="text-gold">Student</span> Managed
              <br />
              Investment Fund
            </h1>
            {/* Direct-answer paragraph. This is the featured-snippet / AI Overview
                extraction zone, so it names the entity, its category, the
                university, and the hard facts in plain prose — a crawler that
                reads nothing else should still be able to answer "what is
                Purdue SMIF" and "how much does it manage" from these two
                sentences. Keep it declarative; do not turn it back into a
                tagline. */}
            <p className="animate-fade-up delay-300 mt-6 max-w-2xl text-on-dark-primary text-base leading-relaxed">
              The Purdue Student Managed Investment Fund (SMIF) is a student-run investment fund at
              Purdue University's Daniels School of Business. Founded in {foundedYear}, SMIF manages{" "}
              {aumDisplay} of real university capital across U.S. equities and fixed income,
              benchmarked against the S&amp;P 500 and reported quarterly.
            </p>
          </div>

          {/* 2. Stats: directly under the answer on a phone, a full-width row
              under everything on desktop. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:col-span-12 lg:row-start-4 lg:grid-cols-4 lg:gap-x-8 lg:border-t lg:border-white/10 lg:pt-8">
            {STATS.map((stat) => (
              <div key={stat.key} className="border-t border-gold/50 pt-3 lg:border-t-0 lg:pt-0">
                <div
                  suppressHydrationWarning
                  className="font-display text-3xl font-bold leading-none text-gold sm:text-4xl lg:text-5xl"
                >
                  {stat.value}
                </div>
                <p className="mt-2 text-sm font-medium text-background">{stat.label}</p>
                <p className="mt-0.5 text-xs text-on-dark-secondary">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* 3. Calls to action */}
          <div className="animate-fade-up delay-400 flex flex-wrap gap-3 lg:col-span-7 lg:row-start-2">
            <ApplyCta
              placement="home-hero"
              className="press group inline-flex items-center gap-2.5 bg-gold px-7 py-3.5 text-sm font-semibold text-ink hover:bg-gold-mid"
            />
            <Link
              to="/holdings"
              className="press inline-flex items-center gap-2.5 border border-background/25 px-7 py-3.5 text-sm font-semibold text-background hover:border-gold hover:text-gold"
            >
              View the portfolio
            </Link>
          </div>

          {/* 4. The newest publication, in the first screen. */}
          {newest && (
            <a
              href={newest.url}
              target="_blank"
              rel="noreferrer"
              className="animate-fade-up delay-500 group block border border-white/15 bg-white/[0.03] p-5 transition-colors duration-200 hover:border-gold/60 lg:col-span-7 lg:row-start-3 lg:self-start"
            >
              <span className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                <span>Latest · {seriesLine(newest)}</span>
                <time
                  dateTime={newest.created_at}
                  className="shrink-0 font-mono font-normal text-on-dark-secondary"
                >
                  {formatPubDate(newest.created_at)}
                </time>
              </span>
              <span className="mt-2 flex items-start justify-between gap-4">
                <span className="font-display text-xl font-bold leading-snug text-background group-hover:text-gold transition-colors duration-200">
                  {newest.title}
                </span>
                <ArrowUpRight
                  className="mt-1 h-4 w-4 shrink-0 text-on-dark-secondary transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                  aria-hidden="true"
                />
              </span>
            </a>
          )}

          {/* 5. The photo is content — real people, real alt text. Pre-cropped
              to 3:4 so object-cover never crops anyone at render. */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-span-3 lg:row-start-1 lg:self-center">
            <img
              src={teamPhoto}
              alt="Members of the Purdue Student Managed Investment Fund on the staircase at the Daniels School of Business."
              width={1200}
              height={1600}
              fetchPriority="high"
              decoding="async"
              className="animate-fade-up delay-300 mx-auto w-full max-w-[400px] aspect-[3/4] object-cover shadow-elegant lg:mr-0"
            />
          </div>
        </div>
      </section>

      {/* Latest research: the work comes before the pitch. Hidden when there's none. */}
      {latest.length > 0 && (
        <section className="bg-background py-20 lg:py-24" aria-labelledby="latest-research-h">
          <div className="container-prose">
            <Reveal className="flex items-end justify-between mb-10 gap-8 flex-wrap">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep block mb-4">
                  Research
                </span>
                <h2
                  id="latest-research-h"
                  className="font-display font-bold text-ink"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  Latest from the fund
                </h2>
              </div>
              <Link
                to="/research"
                className="group inline-flex min-h-6 items-center gap-2 text-sm font-semibold text-ink border-b-2 border-gold pb-1 hover:text-gold-deep transition-colors duration-200"
              >
                All research
                <ArrowRight className="h-4 w-4 arrow-slide" />
              </Link>
            </Reveal>
            <RevealGroup className="grid border-t border-border md:grid-cols-3" stagger={0.1}>
              {latest.map((p) => (
                <RevealItem
                  key={p.id}
                  className="border-b md:border-b-0 md:border-r border-border last:border-r-0 p-8 transition-colors duration-300 hover:bg-secondary/50"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
                    {seriesLine(p)}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold leading-snug text-ink">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="link-underline hover:text-gold-deep"
                    >
                      {p.title}
                    </a>
                  </h3>
                  {p.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {p.description}
                    </p>
                  )}
                  <time
                    dateTime={p.created_at}
                    className="mt-4 block font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {formatPubDate(p.created_at)}
                  </time>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* The Macro Brief: subscribe. A link-out, not an embed, so the site
          still sets no third-party cookies. */}
      <section className="border-y border-border bg-secondary/60" aria-labelledby="subscribe-h">
        <Reveal className="container-prose flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 id="subscribe-h" className="font-display text-2xl font-bold text-ink md:text-3xl">
              Get The Macro Brief.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Rates, inflation, the Fed and cross-asset moves, written by our Fixed Income &amp;
              Macro team every two weeks. Free, by email.
            </p>
          </div>
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex shrink-0 items-center gap-2 self-start bg-ink px-7 py-3.5 text-sm font-semibold text-background hover:bg-ink/85 md:self-auto"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Subscribe on Substack
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </Reveal>
      </section>

      {/* Performance teaser */}
      <section className="bg-background py-20">
        <Reveal className="container-prose flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep block mb-4">
              Portfolio
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">
              Benchmarked against the S&amp;P 500.
              <br className="hidden md:block" /> Reported every quarter.
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-10 flex-shrink-0 w-full md:w-auto">
            <PerformanceSparkline />
            <div className="flex gap-4 flex-shrink-0">
              <Link
                to="/performance"
                className="press group inline-flex items-center gap-2 bg-ink px-7 py-3.5 text-sm font-semibold text-background hover:bg-ink/85"
              >
                Performance
                <ArrowRight className="h-4 w-4 arrow-slide" />
              </Link>
              <Link
                to="/holdings"
                className="press inline-flex items-center gap-2 border border-ink px-7 py-3.5 text-sm font-semibold text-ink hover:bg-ink hover:text-background"
              >
                Holdings
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Mission + pillars, on the light ground. This used to be a second
          full-height ink section stacked under the hero (about 2,250px of
          dark before the first light section). */}
      <section className="bg-secondary/40 border-t border-border py-24 lg:py-28">
        <div className="container-prose">
          <Reveal className="grid gap-10 md:grid-cols-12 md:items-end mb-14">
            <div className="md:col-span-6">
              <span className="rule-gold mb-5 block" />
              <h2
                className="font-display font-bold text-ink"
                style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)", lineHeight: "1.05" }}
              >
                Real capital.
                <br />
                Real research.
                <br />
                <span className="text-gold-deep">Real outcomes.</span>
              </h2>
            </div>
            <div className="md:col-span-6 space-y-4">
              <p className="text-lg leading-relaxed text-foreground">
                SMIF is Purdue's student investment club with a real portfolio. Analysts apply
                institutional frameworks to fundamental equity research under faculty mentorship,
                building skills that carry straight into asset management, investment banking and
                equity research.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Every semester, analysts pitch positions to the full fund. Accepted ideas enter the
                portfolio; rejected ones come back with feedback that sharpens the next pitch.
              </p>
              <Link
                to="/about"
                className="group inline-flex min-h-6 items-center gap-2 text-sm font-semibold text-ink border-b-2 border-gold pb-1 hover:text-gold-deep transition-colors duration-200"
              >
                How the fund works
                <ArrowRight className="h-4 w-4 arrow-slide" />
              </Link>
            </div>
          </Reveal>
          <RevealGroup
            className="grid md:grid-cols-3 border-t border-border bg-background"
            stagger={0.12}
          >
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

      {/* CTA */}
      <section className="bg-ink text-background py-28 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          <span
            className="font-display font-bold text-white/[0.03] leading-none whitespace-nowrap"
            style={{ fontSize: "clamp(5rem, 20vw, 16rem)" }}
          >
            SMIF
          </span>
        </div>
        <Reveal className="relative container-prose text-center max-w-3xl mx-auto">
          <TrendingUp className="mx-auto h-7 w-7 text-gold mb-8 opacity-75" />
          <h2
            className="font-display font-bold text-background"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)" }}
          >
            Ready to invest
            <br />
            in your future?
          </h2>
          <p className="mt-6 max-w-lg mx-auto text-background/75 leading-relaxed">
            We recruit each fall and spring semester, looking for curious, rigorous students from
            every college at Purdue.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <ApplyCta
              placement="home-cta"
              className="press group inline-flex items-center justify-center gap-2.5 bg-gold px-9 py-4 text-sm font-semibold text-ink hover:bg-gold-mid"
            />
            <Link
              to="/team"
              className="press inline-flex items-center justify-center gap-2 border border-background/20 px-9 py-4 text-sm font-semibold text-background hover:border-gold hover:text-gold"
            >
              Meet the Team
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
