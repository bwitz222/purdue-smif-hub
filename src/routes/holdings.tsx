import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, AlertCircle, Filter, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { holdings as baseHoldings, portfolioSummary as baseSummary, type Holding } from "@/data/holdings";
import { getLiveQuotes } from "@/lib/quotes.functions";
import { getFundStats } from "@/lib/fund-stats.functions";
import { getRiskMetrics } from "@/lib/risk.functions";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { socialMeta, canonical, OG_HOLDINGS } from "@/lib/seo";
import { applyQuotes, sectorPercentBreakdown } from "@/lib/portfolio";
import { liveQueryOptions } from "@/lib/live-query";

export const Route = createFileRoute("/holdings")({
  component: HoldingsPage,
  head: () => ({
    meta: [
      { title: "Portfolio Holdings | Purdue SMIF" },
      { name: "description", content: "Current portfolio holdings of the Purdue Student Managed Investment Fund, including positions, allocations, and returns." },
      ...socialMeta({
        title: "Portfolio Holdings | Purdue SMIF",
        description: "End-of-day snapshot of SMIF's positions, sector allocations, and returns across the real-money portfolio.",
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
          description: "Active equity positions held by the Purdue Student Managed Investment Fund.",
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
    ],
  }),
});

const fmtUSD = (n: number, opts: Intl.NumberFormatOptions = {}) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, ...opts });
const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmtNum = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

type SortKey = keyof Holding;

// (ETF_SECTOR_WEIGHTS lives in @/lib/portfolio so /sectors reuses the same map)

function KpiCard({
  label,
  value,
  sub,
  accent,
  animatedValue,
  asOf,
  hint,
  muted,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative" | "neutral";
  animatedValue?: React.ReactNode;
  asOf?: string;
  hint?: string;
  muted?: boolean;
}) {
  const valueColor = accent === "positive" ? "text-gain" : accent === "negative" ? "text-loss" : "text-ink";
  return (
    <div className="border border-border bg-card p-6 flex flex-col gap-1" title={hint}>
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      {muted ? (
        <div className="text-lg font-semibold text-muted-foreground mt-2">{value}</div>
      ) : (
        <div className={`font-display text-3xl font-bold ${valueColor} mt-1`}>{animatedValue ?? value}</div>
      )}
      {sub && <div className="text-xs text-muted-foreground font-mono mt-0.5">{sub}</div>}
      {asOf && (
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/70 mt-1">
          As of {asOf}
        </div>
      )}
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
  return dir === "asc" ? <ArrowUp className="h-3 w-3 text-gold" /> : <ArrowDown className="h-3 w-3 text-gold" />;
}

function HoldingsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("allocation");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sector, setSector] = useState<string>("All");
  const [showSticky, setShowSticky] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const fetchQuotes = useServerFn(getLiveQuotes);
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), []);
  // The server serves the end-of-day cache and self-heals it when stale; the
  // client polls on the shared live-data cadence (see liveQueryOptions) so
  // /holdings, /sectors and / stay on the same update logic. Each fetch
  // recomputes every derived value here (KPIs, weighted beta, sector
  // breakdown, leaders/laggards, table).
  const { data: quoteData, isFetching, error, refetch } = useQuery({
    queryKey: ["live-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    ...liveQueryOptions,
  });

  const fetchFundStats = useServerFn(getFundStats);
  const { data: fundStats } = useQuery({
    queryKey: ["fund-stats"],
    queryFn: () => fetchFundStats(),
    ...liveQueryOptions,
  });
  const cashHoldings = fundStats?.cash_holdings ?? baseSummary.cashHoldings;

  // Pre-computed daily risk metrics (Volatility, Sharpe, VaR, Exposure). Computed
  // by the daily compute-risk job; the page only reads and formats them.
  const fetchRisk = useServerFn(getRiskMetrics);
  const { data: risk } = useQuery({
    queryKey: ["risk-metrics"],
    queryFn: () => fetchRisk(),
    ...liveQueryOptions,
  });

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  // Sticky compact summary appears after the hero scrolls past — md+ only.
  // On mobile the sticky bar would stack under the site header and eat
  // viewport, so we skip the listener entirely below md.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) {
      setShowSticky(false);
      return;
    }
    const onScroll = () => setShowSticky(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { holdings, portfolioSummary } = useMemo(() => {
    const quotes = quoteData?.quotes ?? {};
    // Day P&L math: derive priorValue per position from (value / (1 + pct/100))
    // so the aggregate day-change dollar and percent are computed off the SAME
    // prior-day base and their signs always agree.
    const updated: Holding[] = baseHoldings.map((h) => {
      const q = quotes[h.symbol];
      if (!q) return h;
      const price = q.price;
      const value = price * h.shares;
      const totalReturn = value - h.costBasis;
      const returnPct = h.costBasis > 0 ? (totalReturn / h.costBasis) * 100 : 0;
      const dayChange = q.changePct;
      const priorValue = 1 + dayChange / 100 !== 0 ? value / (1 + dayChange / 100) : value;
      const dayGain = value - priorValue;
      return { ...h, price, value, totalReturn, returnPct, dayChange, dayGain };
    });
    const investedValue = updated.reduce((s, r) => s + r.value, 0);
    const priorInvested = updated.reduce((s, r) => {
      const q = quotes[r.symbol];
      if (!q) return s + r.value; // no quote: treat as unchanged
      return s + (1 + q.changePct / 100 !== 0 ? r.value / (1 + q.changePct / 100) : r.value);
    }, 0);
    const totalDayGain = investedValue - priorInvested;
    const portfolioValue = investedValue + cashHoldings;
    const costBasisTotal = updated.reduce((s, r) => s + r.costBasis, 0);
    const totalReturn = investedValue - costBasisTotal;
    const totalReturnPct = costBasisTotal > 0 ? (totalReturn / costBasisTotal) * 100 : 0;
    const totalDayChange = priorInvested > 0 ? (totalDayGain / priorInvested) * 100 : 0;
    const weightedBeta = investedValue > 0 ? updated.reduce((s, r) => s + r.beta * r.value, 0) / investedValue : baseSummary.weightedBeta;
    const withAlloc = updated.map((r) => ({ ...r, allocation: portfolioValue > 0 ? (r.value / portfolioValue) * 100 : r.allocation }));
    return { holdings: withAlloc, portfolioSummary: { investedCapital: portfolioValue - cashHoldings, cashHoldings, portfolioValue, totalDayGain, totalDayChange, totalReturn, totalReturnPct, weightedBeta } };
  }, [quoteData, cashHoldings]);

  const sectorBreakdown = useMemo(() => sectorPercentBreakdown(holdings), [holdings]);

  const sectors = useMemo<string[]>(() => ["All", ...Array.from(new Set(holdings.map((h) => h.industry)))], [holdings]);
  const rows = useMemo(() => {
    let filtered = sector === "All" ? holdings : holdings.filter((h) => h.industry === sector);
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter((h) => h.symbol.toLowerCase().includes(q) || h.company.toLowerCase().includes(q));
    }
    return [...filtered].sort((a, b) => { const av = a[sortKey]; const bv = b[sortKey]; if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av; return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av)); });
  }, [sortKey, sortDir, sector, holdings, debouncedQuery]);
  const movers = useMemo(() => {
    const sorted = [...holdings].sort((a, b) => b.dayChange - a.dayChange);
    return { gainers: sorted.slice(0, 3), losers: sorted.slice(-3).reverse() };
  }, [holdings]);
  const emptyMessage = sector !== "All" && debouncedQuery
    ? `No positions match "${debouncedQuery}" in ${sector}`
    : debouncedQuery
    ? `No positions match "${debouncedQuery}"`
    : `No positions in ${sector}`;
  const toggleSort = (k: SortKey) => { if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir(typeof holdings[0]?.[k] === "number" ? "desc" : "asc"); } };
  const cols: { k: SortKey; label: string; align?: "right" }[] = [{ k: "company", label: "Company" },{ k: "symbol", label: "Ticker" },{ k: "industry", label: "Industry" },{ k: "price", label: "Price", align: "right" },{ k: "beta", label: "Beta", align: "right" },{ k: "shares", label: "Shares", align: "right" },{ k: "value", label: "Value", align: "right" },{ k: "dayChange", label: "Day", align: "right" },{ k: "totalReturn", label: "Return $", align: "right" },{ k: "returnPct", label: "Return %", align: "right" },{ k: "allocation", label: "Weight", align: "right" }];
  const dayAccent = portfolioSummary.totalDayGain >= 0 ? "positive" : "negative";

  // Risk-card display strings. Volatility/Sharpe/VaR need >=60 obs of history;
  // exposure needs none, so it renders even when history is insufficient.
  const riskAsOf = risk?.asOf
    ? new Date(risk.asOf + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : undefined;
  const noRisk = !risk;
  const insufficient = !!risk && !risk.sufficient;
  const volDisplay = noRisk ? "Not yet computed" : insufficient ? "Insufficient history" : `${risk!.annualizedVolPct!.toFixed(1)}%`;
  const sharpeDisplay = noRisk
    ? "Not yet computed"
    : insufficient
    ? "Insufficient history"
    : risk!.sharpe == null
    ? "Rate unavailable"
    : risk!.sharpe.toFixed(2);
  const varDisplay = noRisk ? "Not yet computed" : insufficient ? "Insufficient history" : fmtUSD(risk!.var95Dollar!, { maximumFractionDigits: 0 });
  const exposureDisplay = noRisk || risk!.grossExposurePct == null ? "Not yet computed" : `${risk!.grossExposurePct.toFixed(1)}%`;
  const varLookbackNote = risk?.sufficient
    ? `${risk.var95Pct!.toFixed(2)}% · trailing ${risk.lookbackDays} trading days${risk.fullYear ? "" : " (<1yr)"}`
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
            className="fixed top-14 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-md shadow-sm"
          >
            <div className="container-prose flex items-center justify-between gap-4 py-2.5 text-xs">
              <div className="flex items-center gap-5 font-mono overflow-x-auto">
                <span className="uppercase tracking-[0.22em] text-muted-foreground hidden sm:inline">Portfolio</span>
                <span><span className="text-muted-foreground">Value</span> <span className="font-semibold text-ink">{fmtUSD(portfolioSummary.portfolioValue, { maximumFractionDigits: 0 })}</span></span>
                <span><span className="text-muted-foreground">Day</span> <span className={`font-semibold ${dayAccent === "positive" ? "text-gain" : "text-loss"}`}>{fmtPct(portfolioSummary.totalDayChange)}</span></span>
                <span className="hidden sm:inline"><span className="text-muted-foreground">Total</span> <span className={`font-semibold ${portfolioSummary.totalReturnPct >= 0 ? "text-gain" : "text-loss"}`}>{fmtPct(portfolioSummary.totalReturnPct)}</span></span>
              </div>
              <span className="hidden md:inline text-[10px] uppercase tracking-[0.22em] text-muted-foreground whitespace-nowrap">{rows.length} positions</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="border-b border-border bg-secondary/30">
        <div className="container-prose py-20">
          <span className="rule-gold mb-5 block" />
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-4">Portfolio Holdings</span>
          <h1 className="font-display font-bold text-ink" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>Current portfolio.</h1>
          <div
            aria-live="polite"
            aria-atomic="true"
            className="mt-5 inline-flex items-center gap-2 border border-border bg-background/60 px-3 py-1.5 text-xs font-mono text-muted-foreground"
          >
            {isFetching ? (
              <><RefreshCw className="h-3 w-3 animate-spin text-gold" /> Refreshing quotes…</>
            ) : riskAsOf ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                {/* Session date of the data (Polygon's latest completed close),
                    NOT the fetch time — cachedAt is shown as "Updated" below. */}
                As of {riskAsOf} close
              </>
            ) : quoteData?.cachedAt ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                Latest end-of-day close
              </>
            ) : (
              <>Last reported snapshot</>
            )}
          </div>
          {quoteData?.cachedAt && (
            <div className="mt-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/70">
              Updated {new Date(quoteData.cachedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
            </div>
          )}
          {quoteData?.cachedAt && (Date.now() - new Date(quoteData.cachedAt).getTime()) > 24 * 60 * 60 * 1000 && (
            <div className="mt-2 text-xs text-muted-foreground italic" role="status">
              Snapshot is more than 24 hours old; prices may have changed.
            </div>
          )}
          <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">A snapshot of every position held by the Purdue Student Managed Investment Fund, with cost basis, returns, and portfolio weighting.</p>
        </div>
      </section>
      <section className="container-prose py-14 space-y-10">
        {error && (
          <div role="alert" className="border border-loss/40 bg-loss/5 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <AlertCircle className="h-4 w-4 text-loss shrink-0" aria-hidden="true" />
              <span>Couldn't refresh quotes. Showing the last reported snapshot.</span>
            </div>
            <button
              onClick={() => refetch()}
              className="border border-ink px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-ink hover:text-background transition-colors cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}
        <h2 className="sr-only">Portfolio Summary</h2>
        <Reveal className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Portfolio Value"
            value={fmtUSD(portfolioSummary.portfolioValue, { maximumFractionDigits: 0 })}
            animatedValue={<CountUp to={portfolioSummary.portfolioValue} duration={1.8} format={(n) => fmtUSD(n, { maximumFractionDigits: 0 })} />}
          />
          <KpiCard
            label="Cash Holdings"
            value={fmtUSD(portfolioSummary.cashHoldings, { maximumFractionDigits: 0 })}
            sub={`${((portfolioSummary.cashHoldings / portfolioSummary.portfolioValue) * 100).toFixed(1)}% of portfolio`}
            animatedValue={<CountUp to={portfolioSummary.cashHoldings} duration={1.4} format={(n) => fmtUSD(n, { maximumFractionDigits: 0 })} />}
          />
          <KpiCard
            label="Total Return"
            value={fmtPct(portfolioSummary.totalReturnPct)}
            sub={fmtUSD(portfolioSummary.totalReturn, { maximumFractionDigits: 0 })}
            accent={portfolioSummary.totalReturnPct >= 0 ? "positive" : "negative"}
            animatedValue={<CountUp to={portfolioSummary.totalReturnPct} duration={1.6} format={(n) => fmtPct(n)} />}
          />
          <KpiCard
            label="Day P&L"
            value={fmtUSD(portfolioSummary.totalDayGain)}
            sub={fmtPct(portfolioSummary.totalDayChange) + " today"}
            accent={dayAccent}
            animatedValue={<CountUp to={portfolioSummary.totalDayGain} duration={1.4} format={(n) => fmtUSD(n)} />}
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
            hint="Share of NAV invested in the market. Gross counts all positions, net is longs minus shorts — equal here because the fund is long-only."
          />
        </Reveal>

        <h2 className="sr-only">Sector Allocation</h2>
        <Reveal className="grid gap-px bg-border md:grid-cols-3">
          <div className="md:col-span-2 bg-card border border-border p-6">
            <div className="flex items-baseline justify-between mb-5 gap-3">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sector Allocation</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/70">% of invested capital</div>
            </div>
            <div className="space-y-2.5">
              {sectorBreakdown.map(([s, pct], i) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-32 md:w-44 flex-shrink-0 truncate text-xs text-foreground/80" title={s}>{s}</span>
                  <div className="flex-1 h-1.5 bg-muted relative">
                    {/* True 0–100 scale: bar width = pct so visual length matches the actual weight. */}
                    <motion.div
                      className="h-full bg-gradient-gold origin-left"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.9, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-xs text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border p-6 flex flex-col gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Weighted Beta</div>
              <div className="font-display text-4xl font-bold text-ink">
                <CountUp to={portfolioSummary.weightedBeta} decimals={2} duration={1.4} />
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">vs. 1.00 S&amp;P 500</div>
            </div>
            <div className="border-t border-border pt-5">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Invested Capital</div>
              <div className="font-display text-2xl font-bold text-ink">
                <CountUp to={portfolioSummary.investedCapital} duration={1.6} format={(n) => fmtUSD(n, { maximumFractionDigits: 0 })} />
              </div>
            </div>
          </div>
        </Reveal>

        {!(isFetching && !quoteData) && (
          <Reveal>
            <h2 className="sr-only">Today's Movers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
              {[
                { title: "Today's Leaders", items: movers.gainers },
                { title: "Today's Laggards", items: movers.losers },
              ].map((panel) => (
                <div key={panel.title} className="bg-card border border-border p-6">
                  <div className="flex items-baseline justify-between mb-4 gap-3">
                    <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{panel.title}</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/70">By day change %</span>
                  </div>
                  <ul className="space-y-1">
                    {panel.items.map((h) => (
                      <li key={h.symbol}>
                        <button
                          type="button"
                          onClick={() => setSector(h.industry)}
                          className="w-full flex items-center gap-3 px-2 py-2 -mx-2 text-left hover:bg-secondary/40 cursor-pointer transition-colors"
                          aria-label={`Filter by ${h.industry} (${h.symbol})`}
                        >
                          <span className="font-mono font-bold text-gold-deep tracking-wider w-16">{h.symbol}</span>
                          <span className="text-sm truncate flex-1">{h.company}</span>
                          <span className={`font-mono font-semibold w-20 text-right inline-flex items-center justify-end gap-0.5 ${h.dayChange >= 0 ? "text-gain" : "text-loss"}`}>
                            {h.dayChange >= 0 ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />}
                            {fmtPct(h.dayChange)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <h2 className="sr-only">Holdings</h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
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
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground mr-1">Sector</span>
            {sectors.length > 8 ? (
              <label className="inline-flex items-center gap-2">
                <span className="sr-only">Filter by sector</span>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  aria-label="Filter by sector"
                  className="min-h-11 border border-border bg-background px-3 text-xs font-semibold uppercase tracking-wider text-foreground outline-none focus:border-ink"
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
                    className={`inline-flex min-h-11 items-center px-3 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors duration-150 cursor-pointer ${active ? "bg-ink text-background border-ink" : "bg-background text-foreground border-border hover:border-ink hover:bg-secondary"}`}
                  >
                    {s}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
            <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
            <div className="font-display text-xl font-semibold">{emptyMessage}</div>
            <p className="text-sm text-muted-foreground mt-2">Try a different sector or clear the filter.</p>
            <button
              onClick={() => { setSector("All"); setQuery(""); }}
              className="inline-flex items-center gap-2 mt-5 border border-ink px-4 py-2 text-xs uppercase tracking-wider hover:bg-ink hover:text-background transition-colors cursor-pointer"
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
                      <div className="font-mono text-sm font-bold text-gold-deep tracking-wider">{h.symbol}</div>
                      <div className="text-sm font-medium truncate">{h.company}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{h.industry}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm">{fmtUSD(h.price)}</div>
                      <div className={`font-mono text-xs inline-flex items-center justify-end gap-0.5 ${h.dayChange >= 0 ? "text-gain" : "text-loss"}`}>
                        {h.dayChange >= 0 ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />}
                        {fmtPct(h.dayChange)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3 text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Value</div>
                      <div className="font-mono mt-0.5">{fmtUSD(h.value, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Return</div>
                      <div className={`font-mono font-semibold mt-0.5 inline-flex items-center gap-0.5 ${h.returnPct >= 0 ? "text-gain" : "text-loss"}`}>
                        {h.returnPct >= 0 ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />}
                        {fmtPct(h.returnPct)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Weight</div>
                      <div className="font-mono mt-0.5 text-muted-foreground">{h.allocation.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: full table */}
            <div className="hidden md:block overflow-x-auto border border-border"><table className="w-full text-left text-sm"><caption className="sr-only">Portfolio holdings, sortable by column</caption><thead className="bg-ink text-background"><tr>{cols.map((c) => { const ariaSort: "ascending" | "descending" | "none" = sortKey === c.k ? (sortDir === "asc" ? "ascending" : "descending") : "none"; return (<th key={c.k} aria-sort={ariaSort} className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap ${c.align === "right" ? "text-right" : ""}`}><button onClick={() => toggleSort(c.k)} className={`inline-flex items-center gap-1.5 hover:text-gold transition-colors duration-150 cursor-pointer ${c.align === "right" ? "ml-auto" : ""}`}>{c.label}<SortIcon active={sortKey === c.k} dir={sortDir} /></button></th>); })}</tr></thead><tbody>{rows.map((h, idx) => (<tr key={h.symbol} className={`border-t border-border hover:bg-secondary/50 transition-colors duration-150 ${idx % 2 === 0 ? "" : "bg-secondary/20"}`}><td className="px-4 py-3 font-medium whitespace-nowrap">{h.company}</td><td className="px-4 py-3 font-mono font-bold text-gold-deep tracking-wider">{h.symbol}</td><td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{h.industry}</td><td className="px-4 py-3 text-right font-mono">{fmtUSD(h.price)}</td><td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmtNum(h.beta)}</td><td className="px-4 py-3 text-right font-mono">{h.shares.toLocaleString()}</td><td className="px-4 py-3 text-right font-mono">{fmtUSD(h.value, { maximumFractionDigits: 0 })}</td><td className={`px-4 py-3 text-right font-mono font-medium ${h.dayChange >= 0 ? "text-gain" : "text-loss"}`}><span className="inline-flex items-center justify-end gap-0.5">{h.dayChange >= 0 ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />}{fmtPct(h.dayChange)}</span></td><td className={`px-4 py-3 text-right font-mono ${h.totalReturn >= 0 ? "text-gain" : "text-loss"}`}>{fmtUSD(h.totalReturn, { maximumFractionDigits: 0 })}</td><td className={`px-4 py-3 text-right font-mono font-semibold ${h.returnPct >= 0 ? "text-gain" : "text-loss"}`}><span className="inline-flex items-center justify-end gap-0.5">{h.returnPct >= 0 ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />}{fmtPct(h.returnPct)}</span></td><td className="px-4 py-3 text-right font-mono text-muted-foreground">{h.allocation.toFixed(2)}%</td></tr>))}</tbody><tfoot className="bg-secondary/60 border-t-2 border-ink font-semibold"><tr><td className="px-4 py-4" colSpan={6}>Total · {rows.length} position{rows.length !== 1 ? "s" : ""}</td><td className="px-4 py-4 text-right font-mono">{fmtUSD(rows.reduce((s, r) => s + r.value, 0), { maximumFractionDigits: 0 })}</td><td className="px-4 py-4 text-right font-mono text-muted-foreground"><span aria-hidden="true">-</span><span className="sr-only">Not applicable</span></td><td className={`px-4 py-4 text-right font-mono ${rows.reduce((s, r) => s + r.totalReturn, 0) >= 0 ? "text-gain" : "text-loss"}`}>{fmtUSD(rows.reduce((s, r) => s + r.totalReturn, 0), { maximumFractionDigits: 0 })}</td><td className="px-4 py-4" /><td className="px-4 py-4 text-right font-mono">{rows.reduce((s, r) => s + r.allocation, 0).toFixed(2)}%</td></tr></tfoot></table></div>
          </>
        )}

        <div className="border-t border-border pt-6 mt-10 space-y-2 text-xs text-muted-foreground max-w-3xl">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-muted-foreground/80">Methodology &amp; disclaimer</div>
          <p><span className="font-semibold text-foreground">Data source:</span> quotes are Polygon.io end-of-day closes, refreshed roughly every 6 hours. Share counts and cost basis are maintained by the fund.</p>
          <p><span className="font-semibold text-foreground">Methodology:</span> position value = shares × latest close. Portfolio total includes uninvested cash. Aggregate day P&amp;L dollar and percent are computed against the same prior-day total.</p>
          <p>Past performance does not guarantee future results. See the latest annual report for audited figures.</p>
        </div>
      </section>
    </>
  );
}

