import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { holdings as baseHoldings, portfolioSummary as baseSummary, type Holding } from "@/data/holdings";
import { getLiveQuotes } from "@/lib/quotes.functions";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { socialMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/holdings")({
  component: HoldingsPage,
  head: () => ({
    meta: [
      { title: "Portfolio Holdings — Purdue SMIF" },
      { name: "description", content: "Current portfolio holdings of the Purdue Student Managed Investment Fund, including positions, allocations, and returns." },
      ...socialMeta({
        title: "Portfolio Holdings — Purdue SMIF",
        description: "Live view of SMIF's positions, sector allocations, and returns across the real-money portfolio.",
        url: canonical("/holdings"),
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/holdings") }],
  }),
});

const fmtUSD = (n: number, opts: Intl.NumberFormatOptions = {}) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, ...opts });
const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmtNum = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

type SortKey = keyof Holding;

const ETF_SECTOR_WEIGHTS: Record<string, Record<string, number>> = { SPY: { Technology: 33.5, Financials: 13.5, "Consumer Cyclical": 10.5, Healthcare: 10.0, "Communication Services": 9.5, Industrials: 8.5, "Consumer Defensive": 5.5, Energy: 3.0, Utilities: 2.5, "Real Estate": 2.0, Materials: 1.5 } };

function KpiCard({
  label,
  value,
  sub,
  accent,
  animatedValue,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative" | "neutral";
  animatedValue?: React.ReactNode;
}) {
  const valueColor = accent === "positive" ? "text-gain" : accent === "negative" ? "text-loss" : "text-ink";
  return (
    <div className="border border-border bg-card p-6 flex flex-col gap-1">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl font-bold ${valueColor} mt-1`}>{animatedValue ?? value}</div>
      {sub && <div className="text-xs text-muted-foreground font-mono mt-0.5">{sub}</div>}
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
  const fetchQuotes = useServerFn(getLiveQuotes);
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), []);
  const { data: quoteData, isFetching } = useQuery({ queryKey: ["live-quotes", symbols], queryFn: () => fetchQuotes({ data: { symbols } }), staleTime: 12 * 60 * 60 * 1000 });

  // Sticky compact summary appears after the hero scrolls past.
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { holdings, portfolioSummary } = useMemo(() => {
    const quotes = quoteData?.quotes ?? {};
    const updated: Holding[] = baseHoldings.map((h) => { const q = quotes[h.symbol]; if (!q) return h; const price = q.price; const value = price * h.shares; const totalReturn = value - h.costBasis; const returnPct = h.costBasis > 0 ? (totalReturn / h.costBasis) * 100 : 0; const dayChange = q.changePct; const dayGain = (dayChange / 100) * value; return { ...h, price, value, totalReturn, returnPct, dayChange, dayGain }; });
    const investedValue = updated.reduce((s, r) => s + r.value, 0);
    const totalDayGain = updated.reduce((s, r) => s + r.dayGain, 0);
    const portfolioValue = investedValue + baseSummary.cashHoldings;
    const costBasisTotal = updated.reduce((s, r) => s + r.costBasis, 0);
    const totalReturn = investedValue - costBasisTotal;
    const totalReturnPct = costBasisTotal > 0 ? (totalReturn / costBasisTotal) * 100 : 0;
    const totalDayChange = investedValue > 0 ? (totalDayGain / investedValue) * 100 : 0;
    const weightedBeta = investedValue > 0 ? updated.reduce((s, r) => s + r.beta * r.value, 0) / investedValue : baseSummary.weightedBeta;
    const withAlloc = updated.map((r) => ({ ...r, allocation: portfolioValue > 0 ? (r.value / portfolioValue) * 100 : r.allocation }));
    return { holdings: withAlloc, portfolioSummary: { investedCapital: portfolioValue - baseSummary.cashHoldings, cashHoldings: baseSummary.cashHoldings, portfolioValue, totalDayGain, totalDayChange, totalReturn, totalReturnPct, weightedBeta } };
  }, [quoteData]);

  const sectorBreakdown = useMemo(() => { const investedValue = holdings.reduce((s, h) => s + h.value, 0); const map = new Map<string, number>(); holdings.forEach((h) => { const weights = ETF_SECTOR_WEIGHTS[h.symbol]; if (weights) { const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0); Object.entries(weights).forEach(([sec, w]) => { const attributed = h.value * (w / totalWeight); map.set(sec, (map.get(sec) || 0) + attributed); }); } else { map.set(h.industry, (map.get(h.industry) || 0) + h.value); } }); return Array.from(map.entries()).map(([s, v]) => [s, investedValue > 0 ? (v / investedValue) * 100 : 0] as [string, number]).sort((a, b) => b[1] - a[1]); }, [holdings]);

  const sectors = useMemo<string[]>(() => ["All", ...Array.from(new Set(holdings.map((h) => h.industry)))], [holdings]);
  const rows = useMemo(() => { const filtered = sector === "All" ? holdings : holdings.filter((h) => h.industry === sector); return [...filtered].sort((a, b) => { const av = a[sortKey]; const bv = b[sortKey]; if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av; return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av)); }); }, [sortKey, sortDir, sector, holdings]);
  const toggleSort = (k: SortKey) => { if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortKey(k); setSortDir(typeof holdings[0]?.[k] === "number" ? "desc" : "asc"); } };
  const cols: { k: SortKey; label: string; align?: "right" }[] = [{ k: "company", label: "Company" },{ k: "symbol", label: "Ticker" },{ k: "industry", label: "Industry" },{ k: "price", label: "Price", align: "right" },{ k: "beta", label: "Beta", align: "right" },{ k: "shares", label: "Shares", align: "right" },{ k: "value", label: "Value", align: "right" },{ k: "dayChange", label: "Day", align: "right" },{ k: "totalReturn", label: "Return $", align: "right" },{ k: "returnPct", label: "Return %", align: "right" },{ k: "allocation", label: "Weight", align: "right" }];
  const dayAccent = portfolioSummary.totalDayGain >= 0 ? "positive" : "negative";

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
          <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">A snapshot of every position held by the Purdue Student Managed Investment Fund, with cost basis, returns, and portfolio weighting.</p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
            {isFetching ? (
              <><RefreshCw className="h-3 w-3 animate-spin text-gold" />Refreshing prices…</>
            ) : quoteData?.cachedAt ? (
              <>Daily snapshot — updated at market close ({new Date(quoteData.cachedAt).toLocaleDateString()})</>
            ) : (
              <>Showing last reported snapshot</>
            )}
          </div>
        </div>
      </section>
      <section className="container-prose py-14 space-y-10">
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

        <h2 className="sr-only">Holdings</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground mr-1">Sector</span>
          {sectors.map((s) => {
            const active = sector === s;
            return (
              <button
                key={s}
                onClick={() => setSector(s)}
                aria-pressed={active}
                className={`min-h-11 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors duration-150 cursor-pointer ${active ? "bg-ink text-background border-ink" : "bg-background text-foreground border-border hover:border-ink hover:bg-secondary"}`}
              >
                {s}
              </button>
            );
          })}
        </div>

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
        <div className="hidden md:block overflow-x-auto border border-border"><table className="w-full text-left text-sm"><thead className="bg-ink text-background"><tr>{cols.map((c) => { const ariaSort: "ascending" | "descending" | "none" = sortKey === c.k ? (sortDir === "asc" ? "ascending" : "descending") : "none"; return (<th key={c.k} aria-sort={ariaSort} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${c.align === "right" ? "text-right" : ""}`}><button onClick={() => toggleSort(c.k)} className={`inline-flex items-center gap-1.5 hover:text-gold transition-colors duration-150 cursor-pointer ${c.align === "right" ? "ml-auto" : ""}`}>{c.label}<SortIcon active={sortKey === c.k} dir={sortDir} /></button></th>); })}</tr></thead><tbody>{rows.map((h, idx) => (<tr key={h.symbol} className={`border-t border-border hover:bg-secondary/50 transition-colors duration-150 ${idx % 2 === 0 ? "" : "bg-secondary/20"}`}><td className="px-4 py-3 font-medium whitespace-nowrap">{h.company}</td><td className="px-4 py-3 font-mono font-bold text-gold-deep tracking-wider">{h.symbol}</td><td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{h.industry}</td><td className="px-4 py-3 text-right font-mono">{fmtUSD(h.price)}</td><td className="px-4 py-3 text-right font-mono text-muted-foreground">{fmtNum(h.beta)}</td><td className="px-4 py-3 text-right font-mono">{h.shares.toLocaleString()}</td><td className="px-4 py-3 text-right font-mono">{fmtUSD(h.value, { maximumFractionDigits: 0 })}</td><td className={`px-4 py-3 text-right font-mono font-medium ${h.dayChange >= 0 ? "text-emerald-600" : "text-destructive"}`}>{fmtPct(h.dayChange)}</td><td className={`px-4 py-3 text-right font-mono ${h.totalReturn >= 0 ? "text-emerald-600" : "text-destructive"}`}>{fmtUSD(h.totalReturn, { maximumFractionDigits: 0 })}</td><td className={`px-4 py-3 text-right font-mono font-semibold ${h.returnPct >= 0 ? "text-emerald-600" : "text-destructive"}`}>{fmtPct(h.returnPct)}</td><td className="px-4 py-3 text-right font-mono text-muted-foreground">{h.allocation.toFixed(2)}%</td></tr>))}</tbody><tfoot className="bg-secondary/60 border-t-2 border-ink font-semibold"><tr><td className="px-4 py-4" colSpan={6}>Total · {rows.length} position{rows.length !== 1 ? "s" : ""}</td><td className="px-4 py-4 text-right font-mono">{fmtUSD(rows.reduce((s, r) => s + r.value, 0), { maximumFractionDigits: 0 })}</td><td className="px-4 py-4 text-right font-mono text-muted-foreground">—</td><td className={`px-4 py-4 text-right font-mono ${rows.reduce((s, r) => s + r.totalReturn, 0) >= 0 ? "text-emerald-600" : "text-destructive"}`}>{fmtUSD(rows.reduce((s, r) => s + r.totalReturn, 0), { maximumFractionDigits: 0 })}</td><td className="px-4 py-4" /><td className="px-4 py-4 text-right font-mono">{rows.reduce((s, r) => s + r.allocation, 0).toFixed(2)}%</td></tr></tfoot></table></div>
      </section>
    </>
  );
}
