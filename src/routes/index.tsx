import { createFileRoute, Link } from "@tanstack/react-router";
import skyline640 from "@/assets/nyc-skyline-640.webp";
import skyline1024 from "@/assets/nyc-skyline-1024.webp";
import skylineImg from "@/assets/nyc-skyline.webp";
import teamPhoto480 from "@/assets/team-photo-480.webp";
import teamPhoto800 from "@/assets/team-photo-800.webp";
import teamPhoto from "@/assets/team-photo.webp";
import campusImg from "@/assets/hero-campus.webp";
import { PLACEMENT_FIRMS } from "@/data/fund-facts";
import { applyUrl } from "@/lib/apply-url";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFundStats } from "@/lib/fund-stats.functions";
import { getPublications } from "@/lib/publications.functions";
import { SERIES_LABEL } from "@/lib/publication-series";
import { sectorTeams, totalMemberCount } from "@/data/team";
import { liveQueryOptions } from "@/lib/live-query";

import { socialMeta, canonical, OG_HOME } from "@/lib/seo";
import { PerformanceSparkline } from "@/components/PerformanceSparkline";

const HOME_TITLE = "Purdue SMIF: Student Managed Investment Fund";
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
      // No manual image preload: React preloads the eager team photo itself, once,
      // from its srcSet and sizes. A second, hand-written preload for the same
      // image was a duplicate request and, with fetchpriority high, made phones
      // fetch a below-the-fold photo ahead of the text that is the first paint.
    ],
  }),
});

// Last-resort fallback used ONLY when the fund_stats table fetch fails.
// The live values come from the DB (computed server-side from holdings ×
// latest quotes + cash). Refresh aum_display whenever the fund's assets move
// materially so a failed fetch still shows a reasonable approximation.
//
// Headcount and team count are DERIVED, not typed in. team.ts warns that
// hardcoding the roster size "is how the site ended up claiming 52, 54, and
// '50+' at the same time" — and this object was still the one saying "50+"
// against an actual 35. Deriving them means the roster is the single source
// of truth and these can never drift again.
const FALLBACK_STATS = {
  aum_display: "$600K",
  active_members: String(totalMemberCount),
  founded_year: 1995,
  sector_teams: sectorTeams.length,
};

// House style B4: no K/M/B abbreviations. "$600K" becomes "$600,000",
// "$1.2M" becomes "$1.2 Million". Returns the number and unit pieces, plus the
// full string for running text.
function parseStatDisplay(display: string): { prefix: string; value: number; suffix: string } {
  const match = display.match(/^([^\d.-]*)([\d.]+)\s*([KMB])?(.*)$/i);
  if (!match) return { prefix: "", value: 0, suffix: display };
  const prefix = match[1] ?? "";
  const num = parseFloat(match[2]) || 0;
  const unit = (match[3] ?? "").toUpperCase();
  const rest = match[4] ?? "";
  if (unit === "K") return { prefix, value: num * 1000, suffix: rest };
  if (unit === "M") return { prefix, value: num, suffix: ` Million${rest}` };
  if (unit === "B") return { prefix, value: num, suffix: ` Billion${rest}` };
  return { prefix, value: num, suffix: rest };
}

function houseCurrency(display: string): string {
  const p = parseStatDisplay(display);
  return `${p.prefix}${p.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${p.suffix}`;
}

const PILLARS = [
  {
    title: "Investment Research",
    body: "Bottom-up fundamental analysis across equity sector teams. Every pitch is defended live before the full investment committee, with the same rigor as a professional fund.",
  },
  {
    title: "Mentorship & Recruiting",
    body: "Direct access to Purdue alumni at investment banks, hedge funds, and asset managers, plus structured preparation to compete for those seats.",
  },
  {
    title: "Real Portfolio",
    body: "Students vote on every position. Performance is benchmarked against the S&P 500 and reported quarterly. No simulations: real capital, real accountability.",
  },
];

function Index() {
  const { latest } = Route.useLoaderData();
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
    { kind: "track" as const, label: "Years Investing", sub: `since est. ${s.founded_year}` },
    { kind: "sectors" as const, label: "Sector Coverage Teams", sub: "bottom-up research" },
  ];
  return (
    <>
      {/* Hero. The one orchestrated moment on the site: the title block
          arrives in sequence on first load. Nothing below it moves.
          The skyline is a texture under a flat 80% Black overlay (house style
          A5: Black overlay, 65 to 80%, with White text). No gradient. */}
      <section className="relative isolate overflow-hidden bg-ink flex flex-col">
        <div aria-hidden="true" className="absolute inset-0">
          {/* Texture under an 85% Black overlay, so it is served small and at low
              priority: it was the largest paint on a phone (LCP 3.1s) while
              carrying no information. The headline is now what paints first. */}
          <img
            src={skyline1024}
            srcSet={`${skyline640} 640w, ${skyline1024} 1024w, ${skylineImg} 1600w`}
            sizes="100vw"
            alt=""
            width={1600}
            height={1216}
            fetchPriority="low"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/85" />
        </div>
        <div className="relative flex-1 container-prose flex flex-col justify-center py-14 lg:py-20 text-background">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <span className="rule-gold animate-expand-x mb-6" />
              <h1 className="animate-fade-up delay-100 text-4xl lg:text-6xl text-background">
                Purdue Student Managed Investment Fund
              </h1>
              {/* Direct-answer paragraph. This is the featured-snippet / AI Overview
                extraction zone, so it names the entity, its category, the
                university, and the hard facts in plain prose, so a crawler that
                reads nothing else should still be able to answer "what is
                Purdue SMIF" and "how much does it manage" from these two
                sentences. Keep it declarative; do not turn it back into a
                tagline. */}
              <p className="animate-fade-up delay-200 mt-6 max-w-2xl text-on-dark-secondary text-lg">
                The Purdue Student Managed Investment Fund (SMIF) is a student-run investment fund
                at Purdue University's Daniels School of Business. Founded in {s.founded_year}, SMIF
                manages {houseCurrency(s.aum_display)} of real university capital across U.S.
                equities and fixed income, benchmarked against the S&amp;P 500 and reported
                quarterly.
              </p>
              <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-3">
                <a
                  href={applyUrl("home-hero")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-3 text-base font-bold text-ink hover:bg-gold-mid"
                >
                  Apply to Join
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">(opens application form in new tab)</span>
                </a>
                <Link
                  to="/holdings"
                  className="press inline-flex items-center gap-2.5 rounded-sm border border-background/40 px-7 py-3 text-base text-background hover:border-gold hover:text-gold"
                >
                  View Portfolio
                </Link>
              </div>
            </div>

            {/* The photo is the point of this section, so it renders at full
                opacity, and it is content, not decoration: it carries real alt
                text and sits outside the aria-hidden backdrop above. The asset
                is pre-cropped to 3:4, which makes object-cover a no-op here. */}
            <div className="lg:col-span-5">
              <img
                src={teamPhoto800}
                srcSet={`${teamPhoto480} 480w, ${teamPhoto800} 800w, ${teamPhoto} 1200w`}
                sizes="(min-width: 1024px) 456px, 100vw"
                alt="Members of the Purdue Student Managed Investment Fund on the staircase at the Daniels School of Business."
                width={1200}
                height={1600}
                decoding="async"
                className="animate-fade-up delay-200 w-full max-h-[70vh] lg:max-h-none aspect-[3/4] object-cover"
              />
            </div>
          </div>

          {/* Fund facts. Real figures, so they stay; set as a ruled data row. */}
          <dl className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 max-w-4xl">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col border-t border-gold pt-3">
                <dd
                  suppressHydrationWarning
                  className="order-1 text-4xl font-bold text-gold leading-none"
                >
                  {stat.kind === "aum" ? (
                    <>
                      {aum.prefix && <span>{aum.prefix}</span>}
                      {aum.value.toLocaleString("en-US")}
                      <span>{aum.suffix}</span>
                    </>
                  ) : stat.kind === "members" ? (
                    <>
                      {members.prefix && <span>{members.prefix}</span>}
                      {members.value.toLocaleString("en-US")}
                      <span>{members.suffix}</span>
                    </>
                  ) : stat.kind === "track" ? (
                    <>
                      {trackRecordYears}
                      <span>+</span>
                    </>
                  ) : (
                    s.sector_teams
                  )}
                </dd>
                <dt className="order-2 mt-3 text-sm text-background">{stat.label}</dt>
                <dd className="order-3 text-xs text-on-dark-muted">{stat.sub}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The plain answer to "what is the Purdue Student Managed Investment
          Fund?", for a reader and for a search engine. Every fact here is stated
          elsewhere on the site: the founding year and AUM in the hero, the
          structure and process on /about and /sectors, the employers on /about. */}
      <section className="bg-background section-y" aria-labelledby="what-is-smif-h">
        <div className="container-prose grid gap-8 md:grid-cols-12 md:gap-16">
          <h2 id="what-is-smif-h" className="md:col-span-4">
            What is the Purdue Student Managed Investment Fund?
          </h2>
          <div className="space-y-5 md:col-span-8">
            <p>
              The Purdue Student Managed Investment Fund (SMIF) is a student-run investment fund at
              Purdue University's Daniels School of Business, founded in {s.founded_year}. Students
              manage real university capital, currently {houseCurrency(s.aum_display)}, across U.S.
              equities and fixed income, under a written investment policy statement and faculty
              oversight.
            </p>
            <p>
              Eight equity sector teams research the market from the bottom up. Analysts pitch
              positions to the full fund, and nothing enters the portfolio without a written thesis,
              a valuation, and a majority vote. Performance is benchmarked against the S&amp;P 500
              and reported quarterly, and every holding is published on the{" "}
              <Link to="/holdings" className="link-underline font-bold text-gold-deep">
                Holdings page
              </Link>
              .
            </p>
            <p>Members go on to work at firms including {PLACEMENT_FIRMS.join(", ")}.</p>
            <p>
              Choosing between student investment clubs? Compare{" "}
              <Link
                to="/finance-clubs-at-purdue"
                className="link-underline font-bold text-gold-deep"
              >
                finance clubs at Purdue
              </Link>
              , read how{" "}
              <Link
                to="/student-managed-investment-funds"
                className="link-underline font-bold text-gold-deep"
              >
                student managed investment funds work
              </Link>
              , or see{" "}
              <Link to="/apply" className="link-underline font-bold text-gold-deep">
                how to join Purdue SMIF
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Mission. Dark Black, one step off the hero's Black, so the two dark
          bands read as two sections. */}
      <section className="bg-ink-soft text-background section-y overflow-hidden">
        <div className="container-prose">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
            <div className="md:col-span-7 space-y-5">
              <span className="rule-gold" />
              <h2 className="text-background max-w-xl">Students manage real capital.</h2>
              <p className="text-on-dark-primary text-lg">
                SMIF is Purdue's student investment club with a real portfolio: it gives students
                the rare opportunity to manage actual investment capital under faculty mentorship.
                Our analysts apply institutional-grade frameworks to fundamental equity research,
                building skills that translate directly to careers in asset management, investment
                banking, and equity research.
              </p>
              <p className="text-on-dark-secondary">
                Every semester, analysts pitch positions to the full fund. Accepted ideas enter the
                real portfolio. Rejected ideas come with feedback that sharpens the next pitch. This
                is the closest an undergraduate education gets to the actual job.
              </p>
              <Link
                to="/about"
                className="group inline-flex min-h-6 items-center gap-2 text-base font-bold text-gold hover:text-background"
              >
                Learn about our process
                <ChevronRight className="h-4 w-4 arrow-slide" />
              </Link>
            </div>
            <div className="md:col-span-5">
              <img
                src={campusImg}
                alt="Purdue's Daniels School of Business campus"
                loading="lazy"
                width={1024}
                height={683}
                className="w-full aspect-[4/3] md:aspect-[3/4] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars: ruled rows, weighted by what a prospective member is deciding.
          Title left, substance right. */}
      <section className="bg-background section-y">
        <div className="container-prose">
          <div className="flex items-end justify-between mb-10 gap-8 flex-wrap">
            <h2>Three pillars of the fund</h2>
            <Link
              to="/apply"
              className="group hidden md:inline-flex items-center gap-2 text-base font-bold text-ink border-b-2 border-gold pb-1 hover:text-gold-deep"
            >
              Apply to join
              <ArrowRight className="h-4 w-4 arrow-slide" />
            </Link>
          </div>
          <div className="border-t border-ink">
            {PILLARS.map(({ title, body }) => (
              <div
                key={title}
                className="grid gap-2 md:grid-cols-12 md:gap-10 border-b border-border py-6 md:py-8"
              >
                <h3 className="md:col-span-4 text-xl text-ink">{title}</h3>
                <p className="md:col-span-8 max-w-2xl">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest research: peer fund sites (Bridgewater, AQR, Oaktree) lead with
          their newest thinking; this surfaces ours. Hidden when there's none. */}
      {latest.length > 0 && (
        <section className="bg-secondary section-y" aria-labelledby="latest-research-h">
          <div className="container-prose">
            <div className="flex items-end justify-between mb-8 gap-8 flex-wrap">
              <h2 id="latest-research-h">Latest from the fund</h2>
              <Link
                to="/research"
                className="group inline-flex min-h-6 items-center gap-2 text-base font-bold text-ink border-b-2 border-gold pb-1 hover:text-gold-deep"
              >
                All research
                <ArrowRight className="h-4 w-4 arrow-slide" />
              </Link>
            </div>
            <div className="grid border-t border-ink md:grid-cols-3">
              {latest.map((p) => (
                <div
                  key={p.id}
                  className="border-b md:border-b-0 md:border-r border-border last:border-0 py-6 md:px-8 md:first:pl-0 md:last:pr-0"
                >
                  <div className="text-sm font-bold text-ink">
                    {[SERIES_LABEL[p.category] ?? "Report", p.ticker].filter(Boolean).join(" · ")}
                  </div>
                  <h3 className="mt-2 text-xl leading-snug text-ink">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="link-underline hover:text-gold-deep"
                    >
                      {p.title}
                    </a>
                  </h3>
                  <time dateTime={p.created_at} className="mt-3 block text-sm">
                    {/* UTC so the server render and the browser agree on the day. */}
                    {new Date(p.created_at).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Performance teaser */}
      <section className="bg-background border-t border-border py-14">
        <div className="container-prose flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <h2 className="max-w-md">Benchmarked against the S&amp;P 500. Reported every quarter.</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-10 flex-shrink-0 w-full md:w-auto">
            <PerformanceSparkline />
            <div className="flex gap-3 flex-shrink-0">
              <Link
                to="/performance"
                className="press group inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3 text-base font-bold text-background hover:bg-ink-soft"
              >
                Performance
                <ArrowRight className="h-4 w-4 arrow-slide" />
              </Link>
              <Link
                to="/holdings"
                className="press inline-flex items-center gap-2 rounded-sm border border-ink px-6 py-3 text-base text-ink hover:bg-ink hover:text-background"
              >
                Holdings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Apply. Left-aligned and specific: what happens, when, who. */}
      <section className="bg-ink text-background section-y">
        <div className="container-prose grid md:grid-cols-12 gap-8 md:gap-16 items-end">
          <div className="md:col-span-7">
            <span className="rule-gold mb-5" />
            <h2 className="text-background">Join a sector team.</h2>
            <p className="mt-4 max-w-xl text-on-dark-secondary text-lg">
              Applications open each fall and spring semester. We're looking for curious, rigorous
              students from every college at Purdue.
            </p>
          </div>
          <div className="md:col-span-5 flex flex-col sm:flex-row md:justify-end gap-3">
            <a
              href={applyUrl("home-cta")}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex items-center justify-center gap-2.5 rounded-sm bg-gold px-7 py-3 text-base font-bold text-ink hover:bg-gold-mid"
            >
              Apply to Join
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens application form in new tab)</span>
            </a>
            <Link
              to="/team"
              className="press inline-flex items-center justify-center gap-2 rounded-sm border border-background/40 px-7 py-3 text-base text-background hover:border-gold hover:text-gold"
            >
              Meet the Team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
