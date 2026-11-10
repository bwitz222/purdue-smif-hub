import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
import { useLiveBook } from "@/lib/use-live-book";
import { asOfText } from "@/lib/market-calendar";
import { socialMeta, canonical, breadcrumbLd, OG_SECTORS } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { teamAllocations, teamSlug, type TeamAllocation } from "@/lib/portfolio";
import { sectorTeams, fixedIncomeMacro, portfolioManagers, LEAD_ROLE } from "@/data/team";
import type { Member } from "@/components/MemberCard";

type EquityTeam = {
  Icon: typeof Cpu;
  name: string;
  lead: string;
};
type ProcessTeam = EquityTeam & { links?: { to: "/holdings" | "/performance"; label: string }[] };

const EQUITY_TEAMS: EquityTeam[] = [
  {
    Icon: Cpu,
    name: "Information Technology",
    lead: "Software, semiconductors, and IT services across mega-caps and emerging growth.",
  },
  {
    Icon: HeartPulse,
    name: "Healthcare & Utilities",
    lead: "Pharma, biotech, med-tech, managed care, and regulated utilities.",
  },
  {
    Icon: Banknote,
    name: "Financials",
    lead: "Banks, insurers, asset managers, and capital markets infrastructure.",
  },
  {
    Icon: ShoppingBag,
    name: "Consumer Discretionary",
    lead: "Retail, autos, leisure, and other cyclical consumer names.",
  },
  {
    Icon: Home,
    name: "Consumer Staples",
    lead: "Food, beverage, household products, and other defensive consumer names.",
  },
  {
    Icon: Factory,
    name: "Industrials",
    lead: "Aerospace & defense, machinery, transports, and capital goods (incl. materials).",
  },
  {
    Icon: Zap,
    name: "Energy & Real Estate",
    lead: "Integrated energy, E&P, midstream, refiners, and listed real estate (REITs).",
  },
  {
    Icon: Wifi,
    name: "Communications",
    lead: "Telecom, media, interactive entertainment, and select platform names.",
  },
];

const PROCESS_TEAMS: ProcessTeam[] = [
  {
    Icon: LineChart,
    name: "Fixed Income & Macro",
    lead: "Rates, credit, FX, and global macro themes that frame equity positioning.",
  },
  {
    Icon: Briefcase,
    name: "Portfolio + Risk Management",
    lead: "Allocation, risk oversight, trading, and performance attribution.",
    links: [
      { to: "/holdings", label: "See the full book" },
      { to: "/performance", label: "See performance" },
    ],
  },
];

const ALL_TEAM_NAMES = [...EQUITY_TEAMS.map((t) => t.name), ...PROCESS_TEAMS.map((t) => t.name)];

export const Route = createFileRoute("/sectors")({
  component: Sectors,
  head: () => ({
    meta: [
      { title: "Sector Coverage Teams & Equity Research | Purdue SMIF" },
      {
        name: "description",
        content:
          "Purdue SMIF covers the market bottom-up: eight equity sector teams plus Fixed Income & Macro and Portfolio + Risk Management, each led by a student PM.",
      },
      ...socialMeta({
        title: "Coverage Teams | Purdue SMIF",
        description:
          "Eight equity sector teams plus Fixed Income & Macro and Portfolio + Risk Management cover the SMIF investment universe.",
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
          description:
            "Equity sector teams, Fixed Income & Macro, and Portfolio + Risk Management groups at the Purdue Student Managed Investment Fund.",
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
const fmtUSD0 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
// Typeset minus, explicit plus: the sign carries the meaning, color only echoes it.
const fmtSigned = (n: number) => `${n >= 0 ? "+" : "\u2212"}${Math.abs(n).toFixed(1)}%`;

// Portfolio manager name(s) for a given team, pulled from team.ts. Matched on
// the declared role rather than on array position: a team whose lead seat is
// vacant must return [] and render "Open seat", never promote whoever happens
// to sit first in the list.
const leadsOf = (members: Member[]): string[] =>
  members.filter((m) => m.role === LEAD_ROLE).map((m) => m.name);

function pmsForEquityTeam(name: string): string[] {
  const t = sectorTeams.find((s) => s.name === name);
  return t ? leadsOf(t.members) : [];
}

function pmsForProcessTeam(name: string): string[] {
  if (name === "Fixed Income & Macro") return leadsOf(fixedIncomeMacro);
  if (name === "Portfolio + Risk Management") return leadsOf(portfolioManagers);
  return [];
}

// One coverage team, read against the holdings book. Every ticker links to its
// row on /holdings, the footer link opens /holdings scoped to this team, and
// the card carries an anchor id so /holdings can link back to it.
function TeamCard({
  Icon,
  name,
  lead,
  alloc,
  pms,
}: {
  Icon: typeof Cpu;
  name: string;
  lead: string;
  alloc: TeamAllocation | undefined;
  pms: string[];
}) {
  const positions = alloc?.positions ?? [];
  return (
    <article
      id={teamSlug(name)}
      className="group section-anchor flex h-full flex-col p-6 transition-colors duration-200 hover:bg-secondary/30 sm:p-8"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Icon className="mt-1 h-6 w-6 shrink-0 text-ink" />
          <div>
            <h3 className="font-display text-ink">{name}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{lead}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-3xl font-bold text-ink leading-none">
            {alloc ? fmtPct(alloc.pctOfInvested) : "n/a"}
          </div>
          <div className="mt-1 text-xs font-mono text-muted-foreground">
            {alloc ? fmtUSD0(alloc.dollars) : ""}
          </div>
        </div>
      </div>

      {alloc && (
        <p className="mt-4 text-xs font-mono text-muted-foreground">
          {fmtUSD0(alloc.directDollars)} held directly
          {alloc.etfDollars > 0 && <> + {fmtUSD0(alloc.etfDollars)} through SPY</>}
        </p>
      )}

      <div className="mt-6">
        <div className="text-xs font-mono text-muted-foreground">
          {pms.length > 1 ? "Portfolio Managers" : "Portfolio Manager"}
        </div>
        <div className="mt-1.5 text-sm text-ink">
          {pms.length ? pms.join(", ") : <span className="italic">Open seat</span>}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="text-sm text-ink">
            {positions.length} {positions.length === 1 ? "position" : "positions"}
          </h4>
          {alloc && positions.length > 0 && (
            <span className="text-xs font-mono text-muted-foreground">
              {fmtSigned(alloc.returnPct)} on cost
            </span>
          )}
        </div>
        {positions.length ? (
          <ul className="mt-2 border-t border-border text-sm">
            {positions.map((h) => (
              <li key={h.symbol} className="border-b border-border">
                <Link
                  to="/holdings"
                  search={{ q: h.symbol }}
                  className="row-rail grid min-h-11 grid-cols-[3.5rem_1fr_auto_4rem] items-center gap-3 px-2 hover:bg-secondary"
                >
                  <span className="font-mono font-bold text-gold-deep">{h.symbol}</span>
                  <span className="truncate text-ink">{h.company}</span>
                  <span className="font-mono text-ink">{fmtUSD0(h.value)}</span>
                  <span
                    className={`text-right font-mono ${h.returnPct >= 0 ? "text-gain" : "text-loss"}`}
                  >
                    {fmtSigned(h.returnPct)}
                  </span>
                  <span className="sr-only">, open {h.symbol} in Holdings</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm italic">
            No direct positions yet. This team's share comes from SPY.
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-6">
        <Link
          to="/holdings"
          search={{ team: name }}
          className="link-underline inline-flex min-h-6 items-center gap-1.5 text-sm font-bold text-gold-deep hover:text-ink"
        >
          View in Holdings
          <ArrowRight className="h-3.5 w-3.5 arrow-slide" />
        </Link>
        <Link
          to="/team"
          search={{ sector: name }}
          className="link-underline inline-flex min-h-6 items-center gap-1.5 text-sm font-bold text-gold-deep hover:text-ink"
        >
          View team
          <ArrowRight className="h-3.5 w-3.5 arrow-slide" />
        </Link>
      </div>
    </article>
  );
}

function Sectors() {
  // Same snapshot as /holdings: quotes, risk and ETF weights polled together.
  const { holdings: updated, etfWeights, status } = useLiveBook();
  const { isFetching } = status;
  const teams = useMemo(() => {
    const allocations = teamAllocations(updated, etfWeights?.weights);
    return new Map(allocations.map((a) => [a.team, a]));
  }, [updated, etfWeights]);
  // Book-level totals, so the cards can be read against /holdings: the teams
  // below sum to invested capital, direct positions plus SPY look-through.
  const book = useMemo(() => {
    const all = Array.from(teams.values());
    return {
      invested: updated.reduce((sum, h) => sum + h.value, 0),
      direct: all.reduce((sum, t) => sum + t.directDollars, 0),
      lookThrough: all.reduce((sum, t) => sum + t.etfDollars, 0),
      positions: all.reduce((sum, t) => sum + t.positions.length, 0),
    };
  }, [teams, updated]);

  const asOf = status.quotes.sessionDate ? asOfText(status.quotes) : null;

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <Reveal>
            <span className="rule-gold mb-5 block" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
              Coverage
            </span>
            <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">
              Purdue SMIF sector teams
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Eight equity sector teams cover the investable universe from the bottom up. A Fixed
              Income &amp; Macro group frames the rate and credit backdrop, and Portfolio + Risk
              Management oversees allocation, trading, and performance. Analysts on each team pitch
              ideas to the full fund; see{" "}
              <Link
                to="/stock-pitches"
                className="link-underline font-bold text-gold-deep hover:text-ink"
              >
                how SMIF stock pitches work
              </Link>
              , or read about{" "}
              <Link
                to="/student-managed-investment-funds"
                className="link-underline font-bold text-gold-deep hover:text-ink"
              >
                student managed investment funds
              </Link>
              .
            </p>
            <div
              aria-live="polite"
              className="mt-6 inline-flex items-center gap-2 border border-border bg-background/60 px-3 py-1.5 text-xs font-mono text-muted-foreground"
            >
              {isFetching ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-gold" /> Refreshing allocations…
                </>
              ) : asOf ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                  Allocations as of {asOf}
                </>
              ) : (
                <>Last reported snapshot</>
              )}
            </div>
            <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
              <div className="border-t border-ink pt-3">
                <dd className="font-display text-2xl text-ink">{fmtUSD0(book.invested)}</dd>
                <dt className="text-sm">Invested capital</dt>
              </div>
              <div className="border-t border-ink pt-3">
                <dd className="font-display text-2xl text-ink">{book.positions}</dd>
                <dt className="text-sm">Single-name positions</dt>
              </div>
              <div className="border-t border-ink pt-3">
                <dd className="font-display text-2xl text-ink">{fmtUSD0(book.direct)}</dd>
                <dt className="text-sm">Held directly by teams</dt>
              </div>
              <div className="border-t border-ink pt-3">
                <dd className="font-display text-2xl text-ink">{fmtUSD0(book.lookThrough)}</dd>
                <dt className="text-sm">SPY, split by sector</dt>
              </div>
            </dl>
            <p className="mt-6 max-w-2xl text-sm">
              Each team's percentage is its share of invested capital, the same figure as the Sector
              Allocation on{" "}
              <Link to="/holdings" className="link-underline font-bold text-gold-deep">
                Holdings
              </Link>
              . SPY has no single sector, so it is divided across all eleven by State Street's
              published weights and credited to the team that owns each one.
            </p>
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
          {EQUITY_TEAMS.map(({ Icon, name, lead }) => (
            <RevealItem key={name} className="bg-background">
              <TeamCard
                Icon={Icon}
                name={name}
                lead={lead}
                alloc={teams.get(name)}
                pms={pmsForEquityTeam(name)}
              />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="container-prose pb-24">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-ink mb-8">Process teams</h2>
        <RevealGroup className="grid gap-px bg-border md:grid-cols-2" stagger={0.04}>
          {PROCESS_TEAMS.map(({ Icon, name, lead, links }) => {
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
                      {pms.length ? (
                        pms.join(", ")
                      ) : (
                        <span className="text-muted-foreground italic">Open seat</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-8">
                    {links?.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="link-underline inline-flex min-h-6 items-center gap-1.5 text-sm font-bold text-gold-deep hover:text-ink"
                      >
                        {l.label}
                        <ArrowRight className="h-3.5 w-3.5 arrow-slide" />
                      </Link>
                    ))}
                    <Link
                      to="/team"
                      search={{ sector: name }}
                      className="link-underline inline-flex min-h-6 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep hover:text-ink transition-colors"
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
