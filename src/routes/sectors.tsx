import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
  RefreshCw,
} from "lucide-react";
import { socialMeta, canonical, OG_SECTORS } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getLiveQuotes } from "@/lib/quotes.functions";
import { getRiskMetrics } from "@/lib/risk.functions";
import { applyQuotes, teamAllocations, baseHoldings } from "@/lib/portfolio";
import { liveQueryOptions } from "@/lib/live-query";
import { sectorTeams, fixedIncomeMacro, portfolioManagers } from "@/data/team";

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
      { title: "Coverage Teams | Purdue SMIF" },
      { name: "description", content: "SMIF coverage spans eight equity sector teams, Fixed Income & Macro, and Portfolio + Risk Management." },
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
            <div
              aria-live="polite"
              className="mt-6 inline-flex items-center gap-2 border border-border bg-background/60 px-3 py-1.5 text-xs font-mono text-muted-foreground"
            >
              {isFetching ? (
                <><RefreshCw className="h-3 w-3 animate-spin text-gold" /> Refreshing allocations…</>
              ) : asOf ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                  Allocations as of {asOf} close
                </>
              ) : quoteData?.cachedAt ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                  Allocations · latest end-of-day close
                </>
              ) : (
                <>Last reported snapshot</>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-prose py-20">
        <div className="flex items-baseline justify-between mb-8 gap-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-ink">Equity coverage</h2>
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            % of invested capital
          </span>
        </div>
        <RevealGroup className="grid gap-px bg-border md:grid-cols-2" stagger={0.04}>
          {EQUITY_TEAMS.map(({ Icon, name, lead }) => {
            const alloc = teams.get(name);
            const pms = pmsForEquityTeam(name);
            return (
              <RevealItem key={name} className="bg-background">
                <article className="flex h-full flex-col p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <Icon className="mt-1 h-6 w-6 shrink-0 text-gold-deep" />
                      <div>
                        <h3 className="font-display text-xl font-bold text-ink">{name}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">{lead}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-3xl font-bold text-ink leading-none">
                        {alloc ? fmtPct(alloc.pctOfInvested) : "—"}
                      </div>
                      <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        {alloc ? fmtUSD0(alloc.dollars) : ""}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                        Portfolio Manager
                      </div>
                      <div className="mt-1.5 text-sm text-ink">
                        {pms.length ? pms.join(", ") : <span className="text-muted-foreground italic">Open seat</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
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
                          <li className="text-muted-foreground italic">No direct positions yet</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-border">
                    <Link
                      to="/team"
                      search={{ sector: name }}
                      className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep hover:text-ink transition-colors"
                    >
                      View team
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      <section className="container-prose pb-24">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-8">Process teams</h2>
        <RevealGroup className="grid gap-px bg-border md:grid-cols-2" stagger={0.04}>
          {PROCESS_TEAMS.map(({ Icon, name, lead }) => {
            const pms = pmsForProcessTeam(name);
            return (
              <RevealItem key={name} className="bg-background">
                <article className="flex h-full flex-col p-8">
                  <div className="flex items-start gap-4">
                    <Icon className="mt-1 h-6 w-6 shrink-0 text-gold-deep" />
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
                      {pms.length ? pms.join(", ") : <span className="text-muted-foreground italic">Open seat</span>}
                    </div>
                  </div>
                  <div className="mt-auto pt-8">
                    <Link
                      to="/team"
                      search={{ sector: name }}
                      className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep hover:text-ink transition-colors"
                    >
                      View team
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
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
