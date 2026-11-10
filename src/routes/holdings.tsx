import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Filter, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { holdings as baseHoldings, type Holding } from "@/data/holdings";
import { getCachedQuotes } from "@/lib/quotes.functions";
import { socialMeta, canonical, breadcrumbLd, OG_HOLDINGS } from "@/lib/seo";
import { teamForIndustry, teamSlug, TEAM_INDUSTRIES } from "@/lib/portfolio";
import { useLiveBook } from "@/lib/use-live-book";
import { DataStatus } from "@/components/DataStatus";
import { asOfText } from "@/lib/market-calendar";

type HoldingsSearch = { team?: string; sector?: string; q?: string };

export const Route = createFileRoute("/holdings")({
  component: HoldingsPage,
  // Deep links from /sectors: ?team=Financials narrows the table to that
  // coverage team's positions, ?q=AMZN pre-fills the search. Unknown teams are
  // dropped so a stale link falls back to the full book.
  validateSearch: (search: Record<string, unknown>): HoldingsSearch => ({
    team:
      typeof search.team === "string" && search.team in TEAM_INDUSTRIES ? search.team : undefined,
    sector: typeof search.sector === "string" && search.sector ? search.sector : undefined,
    q: typeof search.q === "string" && search.q.trim() ? search.q.trim() : undefined,
  }),
  // SSR loader — seed the quote table from quote_cache (read-only, no
  // provider round-trip) so crawlers and no-JS visitors see real prices and
  // a real Day P&L instead of the static baseline / $0. The client-side
  // getLiveQuotes query takes over after hydration (initialDataUpdatedAt
  // keeps it stale-aware, so the self-heal still fires when the cache is old).
  loader: async () => ({ cachedQuotes: await getCachedQuotes() }),
  head: () => ({
    meta: [
      { title: "Portfolio Holdings: Purdue Student Managed Investment Fund" },
      {
        name: "description",
        content:
          "Current portfolio holdings of the Purdue Student Managed Investment Fund, including positions, allocations, and returns.",
      },
      ...socialMeta({
        title: "Portfolio Holdings | Purdue SMIF",
        description:
          "End-of-day snapshot of SMIF's positions, sector allocations, and returns across the real-money portfolio.",
        url: canonical("/holdings"),
        image: OG_HOLDINGS,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/holdings") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Purdue SMIF Holdings",
          description:
            "Active equity positions held by the Purdue Student Managed Investment Fund.",
          numberOfItems: baseHoldings.length,
          itemListElement: baseHoldings.map((h, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Thing",
              name: h.symbol,
              description: `${h.company} (${h.industry})`,
              identifier: h.symbol,
            },
          })),
        }),
      },
      breadcrumbLd("Portfolio Holdings", "/holdings"),
    ],
  }),
});

const fmtUSD = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    ...opts,
  });
const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmtNum = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

type SortKey = keyof Holding;

// (the ETF look-through weights live in @/lib/portfolio, so /sectors reuses the same math)

function KpiCard({
  label,
  value,
  sub,
  accent,
  asOf,
  hint,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative" | "neutral";
  asOf?: string;
  hint?: string;
  muted?: boolean;
}) {
  const valueColor =
    accent === "positive" ? "text-gain" : accent === "negative" ? "text-loss" : "text-ink";
  return (
    <div className="border border-border bg-card p-6 flex flex-col gap-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      {muted ? (
        <div className="text-lg font-semibold text-muted-foreground mt-2">{value}</div>
      ) : (
        <div className={`font-display text-3xl font-bold ${valueColor} mt-1`}>{value}</div>
      )}
      {sub && <div className="text-xs text-muted-foreground font-mono mt-0.5">{sub}</div>}
      {asOf && <div className="text-xs font-mono text-muted-foreground mt-1">As of {asOf}</div>}
      {/* Rendered as real copy rather than a title attribute. These plain-English
          one-liners are the clearest explanations of Sharpe, VaR, and exposure
          anywhere on the site, and as tooltips they were invisible to text
          extraction — and unreachable for anyone not using a mouse. */}
      {hint && (
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
  return dir === "asc" ? (
    <ArrowUp className="h-3 w-3 text-gold" />
  ) : (
    <ArrowDown className="h-3 w-3 text-gold" />
  );
}

function HoldingsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("allocation");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const team = search.team;
  const [sector, setSector] = useState<string>(search.sector ?? "All");
  const [showSticky, setShowSticky] = useState(false);
  const [query, setQuery] = useState(search.q ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(search.q ?? "");
  // A link from /sectors can land while this page is already mounted (browser
  // back/forward), so follow the URL rather than only reading it once.
  useEffect(() => {
    setSector(search.sector ?? "All");
    setQuery(search.q ?? "");
    setDebouncedQuery(search.q ?? "");
  }, [search.sector, search.q, search.team]);
  // One snapshot of the book: quotes, cash, risk metrics and ETF weights are
  // polled together, and the summary, movers, sector allocation and table are
  // all derived from it (see use-live-book.ts).
  const initial = Route.useLoaderData();
  const {
    holdings,
    summary: portfolioSummary,
    sectorBreakdown,
    movers,
    risk,
    quoteData,
    status,
  } = useLiveBook(initial.cachedQuotes);
  const { isFetching, error } = status;
  const refetch = status.refetchAll;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  // Sticky compact summary appears after the hero scrolls past — md+ only.
  // On mobile the sticky bar would stack under the site header and eat
  // viewport, so we skip the scroll listener entirely below md.
  //
  // The breakpoint is re-checked on change, not just once on mount. Reading
  // matchMedia a single time meant rotating a phone to landscape never brought
  // the bar back for the rest of the session, and narrowing a desktop window
  // left the scroll listener attached with the bar overlapping the mobile
  // header.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    let detachScroll: (() => void) | undefined;

    const onScroll = () => setShowSticky(window.scrollY > 420);

    const sync = () => {
      detachScroll?.();
      detachScroll = undefined;
      if (!mq.matches) {
        setShowSticky(false);
        return;
      }
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      detachScroll = () => window.removeEventListener("scroll", onScroll);
    };

    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      detachScroll?.();
    };
  }, []);

  const teamIndustries = team ? TEAM_INDUSTRIES[team] : undefined;
  const scoped = useMemo(
    () => (teamIndustries ? holdings.filter((h) => teamIndustries.includes(h.industry)) : holdings),
    [holdings, teamIndustries],
  );
  const sectors = useMemo<string[]>(
    () => ["All", ...Array.from(new Set(scoped.map((h) => h.industry)))],
    [scoped],
  );
  const rows = useMemo(() => {
    let filtered = sector === "All" ? scoped : scoped.filter((h) => h.industry === sector);
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (h) => h.symbol.toLowerCase().includes(q) || h.company.toLowerCase().includes(q),
      );
    }
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number")
        return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [sortKey, sortDir, sector, scoped, debouncedQuery]);
  const emptyMessage =
    sector !== "All" && debouncedQuery
      ? `No positions match "${debouncedQuery}" in ${sector}`
      : debouncedQuery
        ? `No positions match "${debouncedQuery}"`
        : `No positions in ${sector}`;
  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(typeof holdings[0]?.[k] === "number" ? "desc" : "asc");
    }
  };
  const cols: { k: SortKey; label: string; align?: "right" }[] = [
    { k: "company", label: "Company" },
    { k: "symbol", label: "Ticker" },
    { k: "industry", label: "Industry" },
    { k: "price", label: "Price", align: "right" },
    { k: "beta", label: "Beta", align: "right" },
    { k: "shares", label: "Shares", align: "right" },
    { k: "value", label: "Value", align: "right" },
    { k: "dayChange", label: "Day", align: "right" },
    { k: "totalReturn", label: "Return $", align: "right" },
    { k: "returnPct", label: "Return %", align: "right" },
    { k: "allocation", label: "Weight", align: "right" },
  ];
  const dayAccent = portfolioSummary.totalDayGain >= 0 ? "positive" : "negative";

  // Risk-card display strings. Volatility/Sharpe/VaR need >=60 obs of history;
  // exposure needs none, so it renders even when history is insufficient.
  const riskAsOf = risk?.asOf ? asOfText(status.risk) : undefined;
  const quotesAsOf = status.quotes.sessionDate ? asOfText(status.quotes) : undefined;
  const noRisk = !risk;
  const insufficient = !!risk && !risk.sufficient;
  // Each metric is guarded on its own value, not on `sufficient`. They are
  // separate nullable columns read with select("*"), and numOrNull maps any
  // non-finite value to null — so a row with sufficient = true but a null
  // metric used to throw inside render and take the whole page to the error
  // boundary instead of degrading one card.
  const metric = <T,>(v: T | null | undefined, render: (v: T) => string) =>
    noRisk
      ? "Not yet computed"
      : insufficient
        ? "Insufficient history"
        : v == null
          ? "Not yet computed"
          : render(v);

  const volDisplay = metric(risk?.annualizedVolPct, (v) => `${v.toFixed(1)}%`);
  const sharpeDisplay =
    noRisk || insufficient
      ? metric(risk?.sharpe, (v) => v.toFixed(2))
      : risk?.sharpe == null
        ? "Rate unavailable"
        : risk.sharpe.toFixed(2);
  const varDisplay = metric(risk?.var95Dollar, (v) => fmtUSD(v, { maximumFractionDigits: 0 }));
  const exposureDisplay =
    risk?.grossExposurePct == null ? "Not yet computed" : `${risk.grossExposurePct.toFixed(1)}%`;
  const varLookbackNote =
    risk?.sufficient && risk.var95Pct != null
      ? `${risk.var95Pct.toFixed(2)}% · trailing ${risk.lookbackDays} trading days${risk.fullYear ? "" : " (<1yr)"}`
      : "95% confidence, 1-day horizon";

  return (
    <>
      {/* Sticky compact summary — appears on scroll */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[3.875rem] left-0 right-0 z-40 border-b border-border bg-background"
          >
            <div className="container-prose flex items-center justify-between gap-4 py-2.5 text-xs">
              <div className="flex items-center gap-5 font-mono overflow-x-auto">
                <span className="text-muted-foreground hidden sm:inline">Portfolio</span>
                <span>
                  <span className="text-muted-foreground">Value</span>{" "}
                  <span className="font-semibold text-ink">
                    {fmtUSD(portfolioSummary.portfolioValue, { maximumFractionDigits: 0 })}
                  </span>
                </span>
                <span>
                  <span className="text-muted-foreground">Day</span>{" "}
                  <span
                    className={`font-semibold ${dayAccent === "positive" ? "text-gain" : "text-loss"}`}
                  >
                    {fmtPct(portfolioSummary.totalDayChange)}
                  </span>
                </span>
                <span className="hidden sm:inline">
                  <span className="text-muted-foreground">Total</span>{" "}
                  <span
                    className={`font-semibold ${portfolioSummary.totalReturnPct >= 0 ? "text-gain" : "text-loss"}`}
                  >
                    {fmtPct(portfolioSummary.totalReturnPct)}
                  </span>
                </span>
              </div>
              <span className="hidden md:inline text-xs text-muted-foreground whitespace-nowrap">
                {rows.length} positions
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="border-b border-border bg-background">
        <div className="container-prose py-20">
          <span className="rule-gold mb-5 block" />
          <h1 className="font-display text-ink">Current portfolio.</h1>
          <DataStatus status={status} />
          <p className="mt-8 max-w-2xl text-muted-foreground leading-relaxed">
            A snapshot of every position held by the Purdue Student Managed Investment Fund, with
            cost basis, returns, and portfolio weighting.
          </p>
        </div>
      </section>
      <section className="container-prose py-14 space-y-10">
        {error && (
          <div
            role="alert"
            className="border border-loss/40 bg-loss/5 p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-sm text-foreground">
              <AlertCircle className="h-4 w-4 text-loss shrink-0" aria-hidden="true" />
              <span>Couldn't refresh quotes. Showing the last reported snapshot.</span>
            </div>
            <button
              onClick={() => refetch()}
              className="border border-ink px-3 py-1.5 text-xs hover:bg-ink hover:text-background press cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}
        {/* Section headings are visible rather than sr-only. The page
            previously had no rendered h2 at all, which left it with no outline
            for a reader and nothing for a parser to segment on. Styled with the
            page's own label typography so they read as native furniture. */}
        <h2 className="text-muted-foreground">Portfolio Summary</h2>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Portfolio Value"
            asOf={quotesAsOf}
            value={fmtUSD(portfolioSummary.portfolioValue, { maximumFractionDigits: 0 })}
          />
          <KpiCard
            label="Cash Holdings"
            value={fmtUSD(portfolioSummary.cashHoldings, { maximumFractionDigits: 0 })}
            sub={`${((portfolioSummary.cashHoldings / portfolioSummary.portfolioValue) * 100).toFixed(1)}% of portfolio`}
          />
          <KpiCard
            label="Total Return"
            asOf={quotesAsOf}
            value={fmtPct(portfolioSummary.totalReturnPct)}
            sub={fmtUSD(portfolioSummary.totalReturn, { maximumFractionDigits: 0 })}
            accent={portfolioSummary.totalReturnPct >= 0 ? "positive" : "negative"}
          />
          <KpiCard
            label="Day P&L (latest session)"
            value={fmtUSD(portfolioSummary.totalDayGain, { maximumFractionDigits: 0 })}
            sub={`${fmtPct(portfolioSummary.totalDayChange)} on the latest session`}
            asOf={quotesAsOf}
            accent={dayAccent}
          />
          <KpiCard
            label="Annualized Volatility"
            value={volDisplay}
            muted={noRisk || insufficient}
            sub={risk?.sufficient ? "Std. dev of daily returns × √252" : undefined}
            asOf={risk?.sufficient ? riskAsOf : undefined}
            hint="How much the portfolio's value swings, annualized. Higher means more variable."
          />
          <KpiCard
            label="Sharpe Ratio"
            value={sharpeDisplay}
            muted={noRisk || insufficient || risk?.sharpe == null}
            sub={
              risk?.sufficient && risk?.riskFreeRatePct != null
                ? `Excess return per unit risk · rf ${risk.riskFreeRatePct.toFixed(2)}%`
                : risk?.sufficient
                  ? "Excess return per unit of risk"
                  : undefined
            }
            asOf={risk?.sufficient ? riskAsOf : undefined}
            hint="Return earned above the risk-free rate per unit of volatility. Higher is better."
          />
          <KpiCard
            label="95% 1-Day VaR"
            value={varDisplay}
            muted={noRisk || insufficient}
            sub={varLookbackNote}
            asOf={risk?.sufficient ? riskAsOf : undefined}
            hint="On a typical bad day (the worst 5% of days in the lookback window), the portfolio could lose about this much."
          />
          <KpiCard
            label="Gross / Net Exposure"
            value={exposureDisplay}
            muted={noRisk || risk?.grossExposurePct == null}
            sub={
              risk?.netExposurePct != null
                ? `Net ${risk.netExposurePct >= 0 ? "+" : ""}${risk.netExposurePct.toFixed(1)}% · long-only book`
                : undefined
            }
            asOf={risk?.grossExposurePct != null ? riskAsOf : undefined}
            hint="Share of NAV invested in the market. Gross counts all positions, net is longs minus shorts, equal here because the fund is long-only."
          />
        </div>

        <div className="grid gap-px bg-border md:grid-cols-3">
          <div className="md:col-span-2 bg-card border border-border p-6">
            <div className="flex items-baseline justify-between mb-5 gap-3">
              {/* Was a div duplicated by an sr-only h2 above the grid, which
                  announced the same text twice. One real heading instead. */}
              <h2 className="text-muted-foreground">Sector Allocation</h2>
              <div className="text-xs font-mono text-muted-foreground">
                % of invested capital{quotesAsOf ? `, ${quotesAsOf}` : ""}
                {status.weights.sessionDate && <> · SPY weights {asOfText(status.weights)}</>}
              </div>
            </div>
            <div className="space-y-2.5">
              {sectorBreakdown.map(([s, pct]) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  {teamForIndustry(s) ? (
                    <Link
                      to="/sectors"
                      hash={teamSlug(teamForIndustry(s) as string)}
                      className="link-underline w-32 md:w-44 flex-shrink-0 truncate text-xs text-foreground hover:text-gold-deep"
                      title={`${s}: covered by the ${teamForIndustry(s)} team`}
                    >
                      {s}
                    </Link>
                  ) : (
                    <span
                      className="w-32 md:w-44 flex-shrink-0 truncate text-xs text-foreground"
                      title={s}
                    >
                      {s}
                    </span>
                  )}
                  <div className="flex-1 h-1.5 bg-muted relative">
                    {/* True 0–100 scale: bar width = pct so visual length matches the actual weight. */}
                    <div className="h-full bg-gold" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-muted-foreground tabular-nums">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border p-6 flex flex-col gap-6">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Weighted Beta</div>
              <div className="font-display text-4xl font-bold text-ink">
                {portfolioSummary.weightedBeta.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                vs. 1.00 S&amp;P 500
              </div>
            </div>
            <div className="border-t border-border pt-5">
              <div className="text-xs text-muted-foreground mb-2">Invested Capital</div>
              <div className="font-display text-2xl font-bold text-ink">
                {fmtUSD(portfolioSummary.investedCapital, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>

        {!(isFetching && !quoteData) && (
          <div>
            <h2 className="mb-4 text-muted-foreground">
              Movers{quotesAsOf ? `, ${quotesAsOf}` : ""}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
              {[
                { title: "Leaders", items: movers.gainers },
                { title: "Laggards", items: movers.losers },
              ].map((panel) => (
                <div key={panel.title} className="bg-card border border-border p-6">
                  <div className="flex items-baseline justify-between mb-4 gap-3">
                    <span className="text-xs text-muted-foreground">{panel.title}</span>
                    <span className="text-xs font-mono text-muted-foreground">By day change %</span>
                  </div>
                  <ul className="space-y-1">
                    {panel.items.map((h) => (
                      <li key={h.symbol}>
                        <button
                          type="button"
                          onClick={() => {
                            // A mover can sit outside the team being viewed; carry the
                            // industry in the URL so the team scope drops cleanly.
                            if (team && !TEAM_INDUSTRIES[team]?.includes(h.industry))
                              navigate({ search: { sector: h.industry }, replace: true });
                            else setSector(h.industry);
                          }}
                          className="group row-rail w-full flex items-center gap-3 px-2 py-2 -mx-2 text-left hover:bg-secondary/40 cursor-pointer press"
                        >
                          {/* Visible text is the accessible name (WCAG 2.5.3, label
                              in name); the action is appended for screen readers. */}
                          <span className="font-mono font-bold text-gold-deep w-16">
                            {h.symbol}
                          </span>
                          <span className="text-sm truncate flex-1">{h.company}</span>
                          <span
                            className={`font-mono font-semibold w-20 text-right inline-flex items-center justify-end gap-0.5 ${h.dayChange >= 0 ? "text-gain" : "text-loss"}`}
                          >
                            {h.dayChange >= 0 ? (
                              <ArrowUp className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="h-3 w-3" aria-hidden="true" />
                            )}
                            {fmtPct(h.dayChange)}
                          </span>
                          <span className="sr-only">, filter holdings to {h.industry}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-muted-foreground">Holdings</h2>
        {team && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 border border-border border-l-4 border-l-gold bg-background px-4 py-3 text-sm"
          >
            <span className="text-ink">
              Showing the <strong>{team}</strong> team's {scoped.length}{" "}
              {scoped.length === 1 ? "position" : "positions"} ({teamIndustries?.join(", ")}). SPY
              is not listed here; its look-through share is counted in the sector allocation above.
            </span>
            <span className="flex items-center gap-4">
              <Link
                to="/sectors"
                hash={teamSlug(team)}
                className="link-underline inline-flex min-h-6 items-center font-bold text-gold-deep hover:text-ink"
              >
                Back to team
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSector("All");
                  navigate({ search: {}, replace: true });
                }}
                className="inline-flex min-h-6 items-center font-bold text-ink underline underline-offset-4 cursor-pointer"
              >
                Show all holdings
              </button>
            </span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ticker or company…"
              aria-label="Search holdings"
              className="w-full border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Sector</span>
            {sectors.length > 8 ? (
              <label className="inline-flex items-center gap-2">
                <span className="sr-only">Filter by sector</span>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  aria-label="Filter by sector"
                  className="min-h-11 border border-border bg-background px-3 text-xs font-semibold text-foreground outline-none focus:border-ink"
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              sectors.map((s) => {
                const active = sector === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    aria-pressed={active}
                    // min-h-11 keeps the touch target ≥44px; py-2.5 makes the
                    // visual block match that height so the hit area and the
                    // rendered chip share the same bounds (no offset clicks).
                    className={`inline-flex min-h-11 items-center px-3 py-2.5 text-xs font-semibold border press cursor-pointer ${active ? "bg-ink text-background border-ink" : "bg-background text-foreground border-border hover:border-ink hover:bg-secondary"}`}
                  >
                    {s}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <div
            className="border border-dashed border-border p-12 text-center"
            role="status"
            aria-live="polite"
          >
            <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
            <div className="font-display text-xl font-semibold">{emptyMessage}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Try a different sector or clear the filter.
            </p>
            <button
              onClick={() => {
                setSector("All");
                setQuery("");
                if (team) navigate({ search: {}, replace: true });
              }}
              className="inline-flex items-center gap-2 mt-5 border border-ink px-4 py-2 text-xs hover:bg-ink hover:text-background press cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="md:hidden space-y-3">
              {rows.map((h) => (
                <div key={h.symbol} className="border border-border bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-sm font-bold text-gold-deep">{h.symbol}</div>
                      <div className="text-sm font-medium truncate">{h.company}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {h.industry}
                        {teamForIndustry(h.industry) && (
                          <>
                            {" · "}
                            <Link
                              to="/sectors"
                              hash={teamSlug(teamForIndustry(h.industry) as string)}
                              className="link-underline font-bold text-gold-deep"
                            >
                              {teamForIndustry(h.industry)} team
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm">{fmtUSD(h.price)}</div>
                      <div
                        className={`font-mono text-xs inline-flex items-center justify-end gap-0.5 ${h.dayChange >= 0 ? "text-gain" : "text-loss"}`}
                      >
                        {h.dayChange >= 0 ? (
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        )}
                        {fmtPct(h.dayChange)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3 text-xs">
                    <div>
                      <div className="text-xs text-muted-foreground">Value</div>
                      <div className="font-mono mt-0.5">
                        {fmtUSD(h.value, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Return</div>
                      <div
                        className={`font-mono font-semibold mt-0.5 inline-flex items-center gap-0.5 ${h.returnPct >= 0 ? "text-gain" : "text-loss"}`}
                      >
                        {h.returnPct >= 0 ? (
                          <ArrowUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3 w-3" aria-hidden="true" />
                        )}
                        {fmtPct(h.returnPct)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Weight</div>
                      <div className="font-mono mt-0.5 text-muted-foreground">
                        {h.allocation.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto border border-border">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Portfolio holdings, sortable by column</caption>
                <thead className="bg-ink text-background">
                  <tr>
                    {cols.map((c) => {
                      const ariaSort: "ascending" | "descending" | "none" =
                        sortKey === c.k ? (sortDir === "asc" ? "ascending" : "descending") : "none";
                      return (
                        <th
                          key={c.k}
                          aria-sort={ariaSort}
                          className={`px-4 py-3 text-xs font-semibold whitespace-nowrap ${c.align === "right" ? "text-right" : ""}`}
                        >
                          <button
                            onClick={() => toggleSort(c.k)}
                            className={`inline-flex items-center gap-1.5 hover:text-gold transition-colors duration-150 cursor-pointer ${c.align === "right" ? "ml-auto" : ""}`}
                          >
                            {c.label}
                            <SortIcon active={sortKey === c.k} dir={sortDir} />
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h, idx) => (
                    <tr
                      key={h.symbol}
                      className={`border-t border-border hover:bg-secondary/50 transition-colors duration-150 ${idx % 2 === 0 ? "" : "bg-secondary/20"}`}
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{h.company}</td>
                      <td className="px-4 py-3 font-mono font-bold text-gold-deep">{h.symbol}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {h.industry}
                        {teamForIndustry(h.industry) && (
                          <Link
                            to="/sectors"
                            hash={teamSlug(teamForIndustry(h.industry) as string)}
                            className="link-underline block text-gold-deep hover:text-ink"
                          >
                            {teamForIndustry(h.industry)} team
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{fmtUSD(h.price)}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {fmtNum(h.beta)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {h.shares.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {fmtUSD(h.value, { maximumFractionDigits: 0 })}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-medium ${h.dayChange >= 0 ? "text-gain" : "text-loss"}`}
                      >
                        <span className="inline-flex items-center justify-end gap-0.5">
                          {h.dayChange >= 0 ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          )}
                          {fmtPct(h.dayChange)}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono ${h.totalReturn >= 0 ? "text-gain" : "text-loss"}`}
                      >
                        {fmtUSD(h.totalReturn, { maximumFractionDigits: 0 })}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-semibold ${h.returnPct >= 0 ? "text-gain" : "text-loss"}`}
                      >
                        <span className="inline-flex items-center justify-end gap-0.5">
                          {h.returnPct >= 0 ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          )}
                          {fmtPct(h.returnPct)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {h.allocation.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-background border-t-2 border-ink font-semibold">
                  <tr>
                    <td className="px-4 py-4" colSpan={6}>
                      Total · {rows.length} position{rows.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-4 text-right font-mono">
                      {fmtUSD(
                        rows.reduce((s, r) => s + r.value, 0),
                        { maximumFractionDigits: 0 },
                      )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-muted-foreground">
                      <span aria-hidden="true">-</span>
                      <span className="sr-only">Not applicable</span>
                    </td>
                    <td
                      className={`px-4 py-4 text-right font-mono ${rows.reduce((s, r) => s + r.totalReturn, 0) >= 0 ? "text-gain" : "text-loss"}`}
                    >
                      {fmtUSD(
                        rows.reduce((s, r) => s + r.totalReturn, 0),
                        { maximumFractionDigits: 0 },
                      )}
                    </td>
                    <td className="px-4 py-4" />
                    <td className="px-4 py-4 text-right font-mono">
                      {rows.reduce((s, r) => s + r.allocation, 0).toFixed(2)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        <div className="border-t border-border pt-6 mt-10 space-y-2 text-xs text-muted-foreground max-w-3xl">
          <div className="text-xs font-mono font-semibold text-muted-foreground">
            Methodology &amp; disclaimer
          </div>
          <p>
            <span className="font-semibold text-foreground">Data source:</span> quotes are
            end-of-day closes. Polygon.io is the primary source, refreshed daily after the market
            close (and on page visits when the cache is stale). When{" "}
            <a
              href="https://www.zacks.com/?utm_source=smif_site"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-bold text-gold-deep"
            >
              Zacks Investment Research
            </a>{" "}
            has a newer close than Polygon has released, that close is shown instead, and the source
            is named under Prices and day change. Share counts and cost basis are maintained by the
            fund.
          </p>
          <p>
            <span className="font-semibold text-foreground">Methodology:</span> position value =
            shares × latest close. Portfolio total includes uninvested cash. Aggregate day P&amp;L
            dollar and percent are computed against the same prior-day total.
          </p>
          <p>
            Past performance does not guarantee future results. See the latest annual report for
            audited figures.
          </p>
        </div>
      </section>
    </>
  );
}
