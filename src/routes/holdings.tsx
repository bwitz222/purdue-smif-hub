import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, AlertCircle, Filter, Search, ChevronRight, Download, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { holdings as baseHoldings, portfolioSummary as baseSummary, type Holding } from "@/data/holdings";
import { getLiveQuotes, getCachedQuotes } from "@/lib/quotes.functions";
import { getFundStats } from "@/lib/fund-stats.functions";
import { getRiskMetrics } from "@/lib/risk.functions";
import { getPriceHistory } from "@/lib/price-history.functions";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { socialMeta, canonical, breadcrumbLd, OG_HOLDINGS } from "@/lib/seo";
import { applyQuotes, sectorPercentBreakdown, teamForIndustry } from "@/lib/portfolio";
import { Treemap, type TreemapCell } from "@/components/Treemap";
import { Sparkline } from "@/components/Sparkline";
import { liveQueryOptions } from "@/lib/live-query";

export const Route = createFileRoute("/holdings")({
  component: HoldingsPage,
  // SSR loader — seed the quote table from quote_cache (read-only, no
  // provider round-trip) so crawlers and no-JS visitors see real prices and
  // a real Day P&L instead of the static baseline / $0. The client-side
  // getLiveQuotes query takes over after hydration (initialDataUpdatedAt
  // keeps it stale-aware, so the self-heal still fires when the cache is old).
  // priceHistory is best-effort: getPriceHistory resolves to {} rather than
  // throwing, and the sparkline column drops out entirely when it is empty.
  loader: async () => ({
    cachedQuotes: await getCachedQuotes(),
    priceHistory: await getPriceHistory(),
  }),
  head: () => ({
    meta: [
      { title: "Portfolio Holdings — Purdue Student Managed Investment Fund" },
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
      breadcrumbLd("Portfolio Holdings", "/holdings"),
    ],
  }),
});

const fmtUSD = (n: number, opts: Intl.NumberFormatOptions = {}) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, ...opts });
const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmtNum = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

type SortKey = keyof Holding;

// (the ETF look-through weights live in @/lib/portfolio, so /sectors reuses the same math)

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
    <div className="border border-border bg-card p-6 flex flex-col gap-1 hover-lift-sm" title={hint}>
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      {muted ? (
        <div className="text-lg font-semibold text-muted-foreground mt-2">{value}</div>
      ) : (
        <div className={`font-display text-3xl font-bold ${valueColor} mt-1`}>{animatedValue ?? value}</div>
      )}
      {sub && <div className="text-xs text-muted-foreground font-mono mt-0.5">{sub}</div>}
      {asOf && (
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">
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

/** Signed percentage with a direction arrow. Colour comes from the cell. */
function Delta({ v }: { v: number }) {
  return (
    <span className="inline-flex items-center justify-end gap-0.5">
      {v >= 0 ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />}
      {fmtPct(v)}
    </span>
  );
}

/**
 * A table column. `k` doubles as the sort key for real Holding fields;
 * decorative columns set sortable:false and are skipped by the CSV export.
 */
type ColumnKey = SortKey | "trend";
type Column = {
  k: ColumnKey;
  label: string;
  align?: "right";
  sortable?: boolean;
  cell: (h: Holding) => React.ReactNode;
  /** Omitted for decorative columns; presence is what puts a column in the CSV. */
  csv?: (h: Holding) => string;
  cls?: string | ((h: Holding) => string);
  foot?: (rows: Holding[]) => React.ReactNode;
};

/**
 * The expanded row.
 *
 * Every figure here is derived from data the fund already maintains — shares,
 * cost basis, live price, beta, and the industry-to-team map in
 * src/lib/portfolio.ts. Nothing is editorial: there is no thesis text in the
 * data model, so the panel does not pretend there is. It answers "what did we
 * pay, what is it worth now, and who owns this position", then hands off to
 * the sector team's page.
 */
function PositionDetail({ h }: { h: Holding }) {
  const costPerShare = h.shares > 0 ? h.costBasis / h.shares : 0;
  const team = teamForIndustry(h.industry);
  const facts: { label: string; value: string; tone?: "gain" | "loss" }[] = [
    { label: "Cost basis", value: fmtUSD(h.costBasis, { maximumFractionDigits: 0 }) },
    { label: "Average cost", value: fmtUSD(costPerShare) },
    { label: "Unrealized P&L", value: fmtUSD(h.totalReturn, { maximumFractionDigits: 0 }), tone: h.totalReturn >= 0 ? "gain" : "loss" },
    { label: "Day P&L", value: fmtUSD(h.dayGain, { maximumFractionDigits: 0 }), tone: h.dayGain >= 0 ? "gain" : "loss" },
    { label: "Beta", value: fmtNum(h.beta) },
    { label: "Weight", value: `${h.allocation.toFixed(2)}%` },
  ];
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <dl className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{f.label}</dt>
            <dd className={`mt-1 font-mono text-sm ${f.tone === "gain" ? "text-gain" : f.tone === "loss" ? "text-loss" : ""}`}>
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex shrink-0 flex-col gap-1 lg:items-end">
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Covered by
        </span>
        {team ? (
          <Link
            to="/sectors"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep hover:text-ink transition-colors duration-200"
          >
            {team}
            <ArrowRight className="h-3.5 w-3.5 arrow-slide" aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Index sleeve — no single team</span>
        )}
      </div>
    </div>
  );
}

/** RFC 4180 quoting — company names contain commas and ampersands. */
function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function downloadCsv(rows: Holding[], columns: Column[], label: string) {
  if (typeof window === "undefined") return;
  const cols = columns.filter((c) => c.csv);
  const lines = [
    cols.map((c) => csvCell(c.label)).join(","),
    ...rows.map((h) => cols.map((c) => csvCell(c.csv!(h))).join(",")),
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `purdue-smif-holdings-${label}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function HoldingsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("allocation");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sector, setSector] = useState<string>("All");
  const [showSticky, setShowSticky] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  // One row open at a time — a table with six panels open stops being a table.
  const [expanded, setExpanded] = useState<string | null>(null);
  const [allocView, setAllocView] = useState<"position" | "sector">("position");
  const fetchQuotes = useServerFn(getLiveQuotes);
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), []);
  // The server serves the end-of-day cache and self-heals it when stale; the
  // client polls on the shared live-data cadence (see liveQueryOptions) so
  // /holdings, /sectors and / stay on the same update logic. Each fetch
  // recomputes every derived value here (KPIs, weighted beta, sector
  // breakdown, leaders/laggards, table).
  const initial = Route.useLoaderData();
  // Memoised so the `??` fallback doesn't mint a fresh {} each render and
  // invalidate the columns memo that depends on it.
  const priceHistory = useMemo(() => initial.priceHistory ?? {}, [initial.priceHistory]);
  const { data: quoteData, isFetching, error, refetch } = useQuery({
    queryKey: ["live-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    ...liveQueryOptions,
    // SSR seed from quote_cache; initialDataUpdatedAt anchors staleness to the
    // cache's real age so a >30-min-old cache still refetches (and self-heals)
    // immediately on mount.
    initialData: initial.cachedQuotes ?? undefined,
    initialDataUpdatedAt: initial.cachedQuotes?.cachedAt,
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
    //
    // applyQuotes was imported here but never called — the lines this replaces
    // were a byte-for-byte copy of it, which is exactly how /holdings and
    // /sectors would eventually disagree about the same numbers.
    const updated: Holding[] = applyQuotes(baseHoldings, quotes);
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

  // Both allocation views, built from the same numbers the table shows.
  const allocationCells = useMemo<TreemapCell[]>(() => {
    if (allocView === "sector") {
      // sectorPercentBreakdown is % of INVESTED capital, so cash is out of
      // scope here by definition — the caption says so.
      return sectorBreakdown.map(([name, pct]) => ({ key: name, label: name, pct }));
    }
    const cells: TreemapCell[] = holdings
      .slice()
      .sort((a, b) => b.allocation - a.allocation)
      .map((h) => ({
        key: h.symbol,
        label: h.symbol,
        pct: h.allocation,
        sub: fmtUSD(h.value, { maximumFractionDigits: 0, notation: "compact" }),
      }));
    // Cash is a real part of the portfolio and appears in neither the table
    // nor the old bar list. If the picture is "where the money sits", the
    // uninvested part belongs in it.
    const cashPct =
      portfolioSummary.portfolioValue > 0
        ? (portfolioSummary.cashHoldings / portfolioSummary.portfolioValue) * 100
        : 0;
    if (cashPct > 0) {
      cells.push({
        key: "__cash",
        label: "CASH",
        pct: cashPct,
        sub: fmtUSD(portfolioSummary.cashHoldings, { maximumFractionDigits: 0, notation: "compact" }),
        hatched: true,
      });
    }
    return cells;
  }, [allocView, sectorBreakdown, holdings, portfolioSummary]);

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
  // One config drives the header, the body cells, the CSV export and the
  // footer. Adding, reordering or dropping a column is a single edit here
  // instead of four coordinated ones, and the colSpan arithmetic in the
  // footer can never drift out of step with the header.
  const columns = useMemo<Column[]>(() => {
    const base: Column[] = [
      { k: "company", label: "Company", cell: (h) => h.company, csv: (h) => h.company,
        cls: "px-4 py-3 font-medium" },
      { k: "symbol", label: "Ticker", cell: (h) => h.symbol, csv: (h) => h.symbol,
        cls: "px-4 py-3 font-mono font-bold text-gold-deep tracking-wider" },
      { k: "industry", label: "Industry", cell: (h) => h.industry, csv: (h) => h.industry,
        cls: "px-4 py-3 text-xs text-muted-foreground whitespace-nowrap" },
      { k: "price", label: "Price", align: "right", cell: (h) => fmtUSD(h.price),
        csv: (h) => h.price.toFixed(2), cls: "px-4 py-3 text-right font-mono" },
      { k: "beta", label: "Beta", align: "right", cell: (h) => fmtNum(h.beta),
        csv: (h) => h.beta.toFixed(2), cls: "px-4 py-3 text-right font-mono text-muted-foreground" },
      { k: "shares", label: "Shares", align: "right", cell: (h) => h.shares.toLocaleString(),
        csv: (h) => String(h.shares), cls: "px-4 py-3 text-right font-mono" },
      { k: "value", label: "Value", align: "right",
        cell: (h) => fmtUSD(h.value, { maximumFractionDigits: 0 }),
        csv: (h) => h.value.toFixed(2), cls: "px-4 py-3 text-right font-mono",
        foot: (rs) => fmtUSD(rs.reduce((t, r) => t + r.value, 0), { maximumFractionDigits: 0 }) },
      { k: "dayChange", label: "Day", align: "right", cell: (h) => <Delta v={h.dayChange} />,
        csv: (h) => h.dayChange.toFixed(2),
        cls: (h) => `px-4 py-3 text-right font-mono font-medium ${h.dayChange >= 0 ? "text-gain" : "text-loss"}` },
      { k: "totalReturn", label: "Return $", align: "right",
        cell: (h) => fmtUSD(h.totalReturn, { maximumFractionDigits: 0 }),
        csv: (h) => h.totalReturn.toFixed(2),
        cls: (h) => `px-4 py-3 text-right font-mono ${h.totalReturn >= 0 ? "text-gain" : "text-loss"}`,
        foot: (rs) => {
          const t = rs.reduce((acc, r) => acc + r.totalReturn, 0);
          return <span className={t >= 0 ? "text-gain" : "text-loss"}>{fmtUSD(t, { maximumFractionDigits: 0 })}</span>;
        } },
      { k: "returnPct", label: "Return %", align: "right", cell: (h) => <Delta v={h.returnPct} />,
        csv: (h) => h.returnPct.toFixed(2),
        cls: (h) => `px-4 py-3 text-right font-mono font-semibold ${h.returnPct >= 0 ? "text-gain" : "text-loss"}` },
      { k: "allocation", label: "Weight", align: "right", cell: (h) => `${h.allocation.toFixed(2)}%`,
        csv: (h) => h.allocation.toFixed(2), cls: "px-4 py-3 text-right font-mono text-muted-foreground",
        foot: (rs) => `${rs.reduce((t, r) => t + r.allocation, 0).toFixed(2)}%` },
    ];
    // The sparkline needs stored history. When price_history is unreachable
    // the column is dropped rather than rendering a row of blanks.
    if (Object.keys(priceHistory).length > 0) {
      base.splice(4, 0, {
        k: "trend",
        label: "30d",
        sortable: false,
        cell: (h) => <Sparkline values={priceHistory[h.symbol] ?? []} />,
        cls: (h) => `px-4 py-3 ${(priceHistory[h.symbol]?.length ?? 0) > 1 && (priceHistory[h.symbol]!.at(-1)! >= priceHistory[h.symbol]![0]) ? "text-gain" : "text-loss"}`,
      });
    }
    return base;
  }, [priceHistory]);
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
            <div className="mt-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
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
              className="border border-ink px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-ink hover:text-background press cursor-pointer shrink-0"
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
            value={fmtUSD(portfolioSummary.totalDayGain, { maximumFractionDigits: 0 })}
            sub={fmtPct(portfolioSummary.totalDayChange) + " today"}
            accent={dayAccent}
            animatedValue={<CountUp to={portfolioSummary.totalDayGain} duration={1.4} format={(n) => fmtUSD(n, { maximumFractionDigits: 0 })} />}
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

        <h2 className="sr-only">Allocation</h2>
        <Reveal className="grid gap-px bg-border md:grid-cols-3">
          <div className="md:col-span-2 bg-card border border-border p-6">
            <div className="flex items-baseline justify-between mb-5 gap-3 flex-wrap">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Allocation</div>
              {/* Area, not a bar list: "what dominates this book" is a question
                  about size, and SPY at ~42% is the answer. */}
              <div className="inline-flex border border-border" role="group" aria-label="Allocation view">
                {([
                  { k: "position" as const, label: "By position" },
                  { k: "sector" as const, label: "By sector" },
                ]).map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setAllocView(b.k)}
                    aria-pressed={allocView === b.k}
                    className={`press px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                      allocView === b.k ? "bg-ink text-background" : "bg-background text-ink hover:bg-secondary"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <Treemap cells={allocationCells} />
            <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {allocView === "position"
                ? "% of portfolio, cash included"
                : "% of invested capital · SPY attributed across sectors by index weight"}
            </p>
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
                <div key={panel.title} className="bg-card border border-border p-6 hover-lift-sm">
                  <div className="flex items-baseline justify-between mb-4 gap-3">
                    <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{panel.title}</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">By day change %</span>
                  </div>
                  <ul className="space-y-1">
                    {panel.items.map((h) => (
                      <li key={h.symbol}>
                        <button
                          type="button"
                          onClick={() => setSector(h.industry)}
                          className="group row-rail w-full flex items-center gap-3 px-2 py-2 -mx-2 text-left hover:bg-secondary/40 cursor-pointer press"
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap" role="status" aria-live="polite">
              {rows.length} of {holdings.length} positions
            </div>
          </div>
          <button
            onClick={() => downloadCsv(rows, columns, sector === "All" ? "all" : sector.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
            disabled={rows.length === 0}
            className="press inline-flex min-h-11 shrink-0 items-center gap-2 self-start border border-border bg-background px-4 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-ink hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer lg:self-auto"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </button>
        </div>

        {/* Sector filter. This used to fall back to a <select> above eight
            options — which, with ten industries in the data, meant the select
            was what actually rendered. A scrolling chip row matches /team and
            keeps every option one tap away. */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:flex-wrap md:overflow-visible md:px-0" role="group" aria-label="Filter by sector">
          {sectors.map((sec) => {
            const active = sector === sec;
            return (
              <button
                key={sec}
                onClick={() => setSector(sec)}
                aria-pressed={active}
                // min-h-11 keeps the touch target ≥44px; py-2.5 makes the
                // visual block match that height so the hit area and the
                // rendered chip share the same bounds (no offset clicks).
                className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider border press cursor-pointer ${active ? "bg-ink text-background border-ink" : "bg-background text-foreground border-border hover:border-ink hover:bg-secondary"}`}
              >
                {sec}
              </button>
            );
          })}
        </div>

        {rows.length === 0 ? (
          <div className="border border-dashed border-border p-12 text-center" role="status" aria-live="polite">
            <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
            <div className="font-display text-xl font-semibold">{emptyMessage}</div>
            <p className="text-sm text-muted-foreground mt-2">Try a different sector or clear the filter.</p>
            <button
              onClick={() => { setSector("All"); setQuery(""); }}
              className="inline-flex items-center gap-2 mt-5 border border-ink px-4 py-2 text-xs uppercase tracking-wider hover:bg-ink hover:text-background press cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="md:hidden space-y-3">
              {rows.map((h) => (
                <div key={h.symbol} className="border border-border bg-card p-4 hover-lift-sm">
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
            <div className="hidden md:block overflow-x-auto [contain:paint] border border-border">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Portfolio holdings, sortable by column. Each row expands to show cost basis and the coverage team that owns the position.
                  </caption>
                  {/* Sticky under the 56px site header so column meaning
                      survives a scroll of 23 rows. */}
                  <thead className="sticky top-14 z-20 bg-ink text-background">
                    <tr>
                      {columns.map((c) => {
                        const sortable = c.sortable !== false;
                        const active = sortable && sortKey === c.k;
                        const ariaSort: "ascending" | "descending" | "none" =
                          active ? (sortDir === "asc" ? "ascending" : "descending") : "none";
                        return (
                          <th
                            key={c.k}
                            scope="col"
                            aria-sort={sortable ? ariaSort : undefined}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] whitespace-nowrap ${c.align === "right" ? "text-right" : ""}`}
                          >
                            {sortable ? (
                              <button
                                onClick={() => toggleSort(c.k as SortKey)}
                                className={`inline-flex items-center gap-1.5 hover:text-gold transition-colors duration-150 cursor-pointer ${c.align === "right" ? "ml-auto" : ""}`}
                              >
                                {c.label}
                                <SortIcon active={active} dir={sortDir} />
                              </button>
                            ) : (
                              c.label
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((h, idx) => {
                      const open = expanded === h.symbol;
                      return (
                        <Fragment key={h.symbol}>
                          <tr className={`border-t border-border hover:bg-secondary/50 transition-colors duration-150 ${idx % 2 === 0 ? "" : "bg-secondary/20"} ${open ? "bg-secondary/50" : ""}`}>
                            {columns.map((c, ci) => (
                              <td key={c.k} className={typeof c.cls === "function" ? c.cls(h) : c.cls}>
                                {ci === 0 ? (
                                  // The disclosure lives in the first cell rather
                                  // than a column of its own: a twelfth column
                                  // pushed the table past its container at every
                                  // width, and the company name is what a reader
                                  // is pointing at when they want more anyway.
                                  <button
                                    onClick={() => setExpanded(open ? null : h.symbol)}
                                    aria-expanded={open}
                                    aria-controls={`detail-${h.symbol}`}
                                    className="press -ml-1 inline-flex items-center gap-1.5 text-left hover:text-gold-deep cursor-pointer"
                                  >
                                    <ChevronRight
                                      className={`h-3.5 w-3.5 shrink-0 text-gold-deep transition-transform duration-200 ${open ? "rotate-90" : ""} motion-reduce:transition-none`}
                                      aria-hidden="true"
                                    />
                                    {c.cell(h)}
                                    <span className="sr-only">— {open ? "hide" : "show"} detail</span>
                                  </button>
                                ) : (
                                  c.cell(h)
                                )}
                              </td>
                            ))}
                          </tr>
                          {open && (
                            <tr id={`detail-${h.symbol}`} className="border-t border-border bg-secondary/50">
                              <td colSpan={columns.length} className="px-4 py-5">
                                <PositionDetail h={h} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-secondary/60 border-t-2 border-ink font-semibold">
                    <tr>
                      {columns.map((c, ci) =>
                        ci === 0 ? (
                          <td key={c.k} className="px-4 py-4">
                            Total · {rows.length} position{rows.length !== 1 ? "s" : ""}
                          </td>
                        ) : (
                          <td key={c.k} className={`px-4 py-4 font-mono ${c.align === "right" ? "text-right" : ""}`}>
                            {c.foot ? (
                              c.foot(rows)
                            ) : (
                              <>
                                <span aria-hidden="true" className="text-muted-foreground">-</span>
                                <span className="sr-only">Not applicable</span>
                              </>
                            )}
                          </td>
                        ),
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
          </>
        )}

        <div className="border-t border-border pt-6 mt-10 space-y-2 text-xs text-muted-foreground max-w-3xl">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-muted-foreground">Methodology &amp; disclaimer</div>
          <p><span className="font-semibold text-foreground">Data source:</span> quotes are Polygon.io end-of-day closes, refreshed daily after the market close (and on page visits when the cache is stale). Share counts and cost basis are maintained by the fund.</p>
          <p><span className="font-semibold text-foreground">Methodology:</span> position value = shares × latest close. Portfolio total includes uninvested cash. Aggregate day P&amp;L dollar and percent are computed against the same prior-day total.</p>
          <p>Past performance does not guarantee future results. See the latest annual report for audited figures.</p>
        </div>
      </section>
    </>
  );
}

