import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Cpu,
  HeartPulse,
  Banknote,
  Factory,
  ShoppingBag,
  Zap,
  Wifi,
  Home,
  LineChart,
  Briefcase,
} from "lucide-react";
import { socialMeta, canonical, breadcrumbLd, OG_SECTORS } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getLiveQuotes } from "@/lib/quotes.functions";
import { getRiskMetrics } from "@/lib/risk.functions";
import { applyQuotes, teamAllocations, baseHoldings } from "@/lib/portfolio";
import { liveQueryOptions } from "@/lib/live-query";
import { sectorTeams, fixedIncomeMacro, portfolioManagers } from "@/data/team";
import { nextEvent } from "@/data/recruiting";
import { SweepRule } from "@/components/SectionRule";
import { useInViewOnce } from "@/lib/use-in-view-once";

type EquityTeam = {
  Icon: typeof Cpu;
  name: string;
  lead: string;
};
type ProcessTeam = EquityTeam;

const EQUITY_TEAMS: EquityTeam[] = [
  { Icon: Cpu, name: "Information Technology", lead: "Software, semiconductors, and IT services across mega-caps and emerging growth." },
  { Icon: HeartPulse, name: "Healthcare & Utilities", lead: "Pharma, biotech, med-tech, managed care, and regulated utilities." },
  { Icon: Banknote, name: "Financials", lead: "Banks, insurers, asset managers, and capital markets infrastructure." },
  { Icon: ShoppingBag, name: "Consumer Discretionary", lead: "Retail, autos, leisure, and other cyclical consumer names." },
  { Icon: Home, name: "Consumer Staples", lead: "Food, beverage, household products, and other defensive consumer names." },
  { Icon: Factory, name: "Industrials", lead: "Aerospace & defense, machinery, transports, and capital goods (incl. materials)." },
  { Icon: Zap, name: "Energy & Real Estate", lead: "Integrated energy, E&P, midstream, refiners, and listed real estate (REITs)." },
  { Icon: Wifi, name: "Communications", lead: "Telecom, media, interactive entertainment, and select platform names." },
];

const PROCESS_TEAMS: ProcessTeam[] = [
  { Icon: LineChart, name: "Fixed Income & Macro", lead: "Rates, credit, FX, and global macro themes that frame equity positioning." },
  { Icon: Briefcase, name: "Portfolio + Risk Management", lead: "Allocation, risk oversight, trading, and performance attribution." },
];

const ALL_TEAM_NAMES = [...EQUITY_TEAMS.map((t) => t.name), ...PROCESS_TEAMS.map((t) => t.name)];

export const Route = createFileRoute("/sectors")({
  component: Sectors,
  head: () => ({
    meta: [
      { title: "Sector Coverage Teams & Equity Research | Purdue SMIF" },
      { name: "description", content: "Purdue SMIF covers the market bottom-up: eight equity sector teams plus Fixed Income & Macro and Portfolio + Risk Management, each led by a student PM." },
      ...socialMeta({
        title: "Coverage Teams | Purdue SMIF",
        description: "Eight equity sector teams plus Fixed Income & Macro and Portfolio + Risk Management cover the SMIF investment universe.",
        url: canonical("/sectors"),
        image: OG_SECTORS,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/sectors") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Purdue SMIF Coverage Teams",
          description: "Equity sector teams, Fixed Income & Macro, and Portfolio + Risk Management groups at the Purdue Student Managed Investment Fund.",
          numberOfItems: ALL_TEAM_NAMES.length,
          itemListElement: ALL_TEAM_NAMES.map((name, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "Thing", name },
          })),
        }),
      },
      breadcrumbLd("Coverage Teams", "/sectors"),
    ],
  }),
});

const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const fmtUSD0 = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Portfolio manager name(s) for a given equity team, pulled from team.ts.
// make() sets the first member of each sector team's `members` to role
// "Portfolio Manager", so we look at that leading entry (and skip
// unfilled placeholder seats).
function pmsForEquityTeam(name: string): string[] {
  const t = sectorTeams.find((s) => s.name === name);
  if (!t) return [];
  const first = t.members[0];
  if (first && !first.placeholder && first.name) return [first.name];
  return [];
}

function pmsForProcessTeam(name: string): string[] {
  if (name === "Fixed Income & Macro") {
    return fixedIncomeMacro
      .filter((m) => !m.placeholder && m.role === "Portfolio Manager")
      .map((m) => m.name);
  }
  if (name === "Portfolio + Risk Management") {
    return portfolioManagers
      .filter((m) => !m.placeholder && m.role === "Portfolio Manager")
      .map((m) => m.name);
  }
  return [];
}

/**
 * An unfilled PM seat, designed as an opportunity rather than as missing data.
 *
 * "Open seat" in muted italics read like a gap in the roster the site had
 * failed to fill. It's the opposite: it's the single most concrete recruiting
 * pitch on the site, so it links to the calendar and names the next event.
 */
function OpenSeat() {
  // SSR-safe: null until mounted, so the server and the first client render
  // agree. The resting label works with or without a date.
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => setNowMs(Date.now()), []);
  const next = nowMs === null ? null : nextEvent(nowMs);

  return (
    <Link
      to="/recruiting"
      className="press group mt-0.5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 border border-gold-deep/40 px-2.5 py-1.5 text-xs font-semibold text-gold-deep transition-colors hover:border-gold-deep hover:bg-secondary"
    >
      Open seat
      <span className="font-normal text-muted-foreground">
        {next ? `· next: ${next.name}, ${next.date}` : "· recruiting each fall and spring"}
      </span>
      <ArrowRight className="arrow-slide h-3 w-3" aria-hidden="true" />
    </Link>
  );
}

/**
 * A team's share of invested capital, drawn left to right on first view.
 *
 * The ladder IS the data visualisation on this page, so it gets the data-draw
 * tier (900ms, out-expo) the same way the sector bars on /holdings and the
 * chart paths on /performance do. Bars stagger down the ladder so the eye
 * reads the ranking in order rather than seeing eight bars appear at once.
 *
 * The width is set from the first paint — the draw scales a transform on top
 * of it, so the number is never gated behind the animation, and under reduced
 * motion the bar is simply already at full length.
 */
function AllocationBar({ pct, index }: { pct: number; index: number }) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLSpanElement>(0.3);
  const drawn = reduce || inView;
  return (
    <span ref={ref} aria-hidden="true" className="relative h-1.5 flex-1 bg-muted">
      <span
        className="absolute inset-y-0 left-0 origin-left bg-gradient-gold"
        style={{
          width: `${pct}%`,
          transform: `scaleX(${drawn ? 1 : 0})`,
          transition: reduce
            ? "none"
            : `transform var(--dur-data) var(--ease-out-expo) ${Math.min(index, 7) * 40}ms`,
        }}
      />
    </span>
  );
}

function Sectors() {
  const fetchQuotes = useServerFn(getLiveQuotes);
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), []);
  const { data: quoteData, isFetching } = useQuery({
    queryKey: ["live-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    ...liveQueryOptions,
  });

  // Only used for the true market-session date on the banner; shares the
  // ["risk-metrics"] cache with /holdings so it's a deduped, near-free read.
  const fetchRisk = useServerFn(getRiskMetrics);
  const { data: risk } = useQuery({
    queryKey: ["risk-metrics"],
    queryFn: () => fetchRisk(),
    ...liveQueryOptions,
  });

  const teams = useMemo(() => {
    const updated = applyQuotes(baseHoldings, quoteData?.quotes ?? {});
    const allocations = teamAllocations(updated);
    return new Map(allocations.map((a) => [a.team, a]));
  }, [quoteData]);

  // Ranked by weight, heaviest first — the ladder's whole point is that the
  // reading order matches the allocation order.
  const rankedEquityTeams = useMemo(
    () =>
      EQUITY_TEAMS.map((t) => ({
        ...t,
        alloc: teams.get(t.name),
        pms: pmsForEquityTeam(t.name),
      })).sort((a, b) => (b.alloc?.pctOfInvested ?? 0) - (a.alloc?.pctOfInvested ?? 0)),
    [teams],
  );
  // Bars scale against the heaviest team rather than 100%, so the spread
  // between teams is visible instead of eight short stubs.
  const maxTeamPct = Math.max(...rankedEquityTeams.map((t) => t.alloc?.pctOfInvested ?? 0), 1);

  // True session date of the quotes (Polygon's latest completed close), from
  // the risk metrics' as_of — not quoteData.cachedAt, which is the fetch time.
  const asOf = risk?.asOf
    ? new Date(risk.asOf + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <Reveal>
            <span className="rule-gold mb-5 block" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Coverage</span>
            <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Our teams.</h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Eight equity sector teams cover the investable universe from the bottom up. A Fixed Income &amp; Macro group frames the rate and credit backdrop, and Portfolio + Risk Management oversees allocation, trading, and performance.
            </p>
            {/* Resting state is the as-of line; a refresh in flight shows a
                hairline rather than swapping the text. Same treatment as the
                Holdings masthead. */}
            <div className="mt-6 inline-block">
              <div
                aria-live="polite"
                className="font-mono text-xs text-muted-foreground"
              >
                {asOf ? (
                  <>Allocations as of {asOf} close</>
                ) : quoteData?.cachedAt ? (
                  <>Allocations · latest end-of-day close</>
                ) : (
                  <>Last reported snapshot</>
                )}
              </div>
              <div className="mt-1.5 h-0.5 w-full overflow-hidden bg-border">
                <span
                  aria-hidden="true"
                  className={`block h-full bg-gradient-gold transition-transform duration-500 ${
                    isFetching ? "animate-fade-in w-1/3" : "w-full"
                  }`}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Allocation ladder. Eight identical cards in a 2-up grid said every
          team carries the same weight, which is never true. Ranked full-width
          rows with proportional bars say what the book actually looks like. */}
      <section className="container-prose py-20">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <SweepRule index={0} className="mb-3" />
            <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">Equity coverage</h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            % of invested capital
          </span>
        </div>
        <RevealGroup className="border-t border-border" stagger={0.024}>
          {rankedEquityTeams.map(({ Icon, name, lead, alloc, pms }, i) => (
            <RevealItem key={name}>
              <article className="group grid gap-x-8 gap-y-4 border-b border-border py-7 transition-colors duration-200 hover:bg-secondary/30 md:grid-cols-[1.5fr_1fr_auto] md:items-start">
                {/* Identity + weight bar */}
                <div>
                  <div className="flex items-start gap-3.5">
                    <Icon className="icon-pop mt-1 h-5 w-5 shrink-0 text-gold-deep" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-bold text-ink">{name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{lead}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 md:pl-9">
                    <AllocationBar
                      pct={alloc ? (alloc.pctOfInvested / maxTeamPct) * 100 : 0}
                      index={i}
                    />
                    <span className="font-display text-2xl font-bold leading-none text-ink tabular-nums">
                      {alloc ? fmtPct(alloc.pctOfInvested) : "—"}
                    </span>
                    <span className="w-20 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {alloc ? fmtUSD0(alloc.dollars) : ""}
                    </span>
                  </div>
                </div>

                {/* Who runs it, and what's in it */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 md:gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Portfolio Manager
                    </div>
                    <div className="mt-1.5 text-sm text-ink">
                      {pms.length ? pms.join(", ") : <OpenSeat />}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Top holdings
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-sm text-ink">
                      {alloc && alloc.topHoldings.length ? (
                        alloc.topHoldings.map((h) => (
                          <li key={h.symbol} className="flex items-baseline gap-2">
                            <span className="font-mono text-xs text-gold-deep">{h.symbol}</span>
                            <span className="truncate text-muted-foreground">{h.company}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground">
                          Covered through the index position
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="md:pt-1">
                  <Link
                    to="/team"
                    search={{ sector: name }}
                    className="link-underline inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep transition-colors hover:text-ink"
                  >
                    View team
                    <ArrowRight className="arrow-slide h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="container-prose pb-24">
        <SweepRule index={1} className="mb-3" />
        <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-8">Process teams</h2>
        <RevealGroup className="grid gap-px bg-border md:grid-cols-2" stagger={0.04}>
          {PROCESS_TEAMS.map(({ Icon, name, lead }) => {
            const pms = pmsForProcessTeam(name);
            return (
              <RevealItem key={name} className="bg-background">
                <article className="group flex h-full flex-col p-8 transition-colors duration-200 hover:bg-secondary/30">
                  <div className="flex items-start gap-4">
                    <Icon className="mt-1 h-6 w-6 shrink-0 text-gold-deep icon-pop" />
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink">{name}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">{lead}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                      {pms.length > 1 ? "Portfolio Managers" : "Portfolio Manager"}
                    </div>
                    <div className="mt-1.5 text-sm text-ink">
                      {pms.length ? pms.join(", ") : <OpenSeat />}
                    </div>
                  </div>
                  <div className="mt-auto pt-8">
                    <Link
                      to="/team"
                      search={{ sector: name }}
                      className="link-underline inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep hover:text-ink transition-colors"
                    >
                      View team
                      <ArrowRight className="h-3.5 w-3.5 arrow-slide" />
                    </Link>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>
    </>
  );
}
