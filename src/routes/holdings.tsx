import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { holdings as baseHoldings, portfolioSummary as baseSummary, type Holding } from "@/data/holdings";
import { getLiveQuotes } from "@/lib/quotes.functions";

export const Route = createFileRoute("/holdings")({
  component: HoldingsPage,
  head: () => ({
    meta: [
      { title: "Holdings — Purdue SMIF" },
      {
        name: "description",
        content:
          "Current portfolio holdings of the Purdue Student Managed Investment Fund, including positions, allocations, and returns.",
      },
    ],
  }),
});

const fmtUSD = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, ...opts });
const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmtNum = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

type SortKey = keyof Holding;

function HoldingsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("allocation");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sector, setSector] = useState<string>("All");

  const fetchQuotes = useServerFn(getLiveQuotes);
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), []);
  const { data: quoteData, isFetching } = useQuery({
    queryKey: ["live-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    staleTime: 12 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Recompute holdings with live prices when available, recompute allocation
  // off the new total value so weights still sum to ~100% (excl. cash).
  const { holdings, portfolioSummary } = useMemo(() => {
    const quotes = quoteData?.quotes ?? {};
    const updated: Holding[] = baseHoldings.map((h) => {
      const q = quotes[h.symbol];
      if (!q) return h;
      const price = q.price;
      const value = price * h.shares;
      const totalReturn = value - h.costBasis;
      const returnPct = h.costBasis > 0 ? (totalReturn / h.costBasis) * 100 : 0;
      const dayChange = q.changePct;
      const dayGain = (dayChange / 100) * value;
      return { ...h, price, value, totalReturn, returnPct, dayChange, dayGain };
    });
    const investedValue = updated.reduce((s, r) => s + r.value, 0);
    const totalDayGain = updated.reduce((s, r) => s + r.dayGain, 0);
    const portfolioValue = investedValue + baseSummary.cashHoldings;
    const investedCapital = updated.reduce((s, r) => s + r.costBasis, 0);
    const totalReturn = investedValue - investedCapital;
    const totalReturnPct = investedCapital > 0 ? (totalReturn / investedCapital) * 100 : 0;
    const totalDayChange = investedValue > 0 ? (totalDayGain / investedValue) * 100 : 0;
    const weightedBeta =
      investedValue > 0
        ? updated.reduce((s, r) => s + r.beta * r.value, 0) / investedValue
        : baseSummary.weightedBeta;
    const withAlloc = updated.map((r) => ({
      ...r,
      allocation: portfolioValue > 0 ? (r.value / portfolioValue) * 100 : r.allocation,
    }));
    return {
      holdings: withAlloc,
      portfolioSummary: {
        investedCapital,
        cashHoldings: baseSummary.cashHoldings,
        portfolioValue,
        totalDayGain,
        totalDayChange,
        totalReturn,
        totalReturnPct,
        weightedBeta,
      },
    };
  }, [quoteData]);

  const sectors = useMemo<string[]>(
    () => ["All", ...Array.from(new Set(holdings.map((h) => h.industry)))],
    [holdings],
  );

  const rows = useMemo(() => {
    const filtered = sector === "All" ? holdings : holdings.filter((h) => h.industry === sector);
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [sortKey, sortDir, sector, holdings]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(typeof holdings[0][k] === "number" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey !== k ? (
      <ArrowUpDown className="h-3 w-3 opacity-40" />
    ) : sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );

  const cols: { k: SortKey; label: string; align?: "right" }[] = [
    { k: "company", label: "Company" },
    { k: "symbol", label: "Symbol" },
    { k: "industry", label: "Industry" },
    { k: "price", label: "Price", align: "right" },
    { k: "beta", label: "Beta", align: "right" },
    { k: "shares", label: "Shares", align: "right" },
    { k: "value", label: "Value", align: "right" },
    { k: "dayChange", label: "Day %", align: "right" },
    { k: "totalReturn", label: "Return", align: "right" },
    { k: "returnPct", label: "Return %", align: "right" },
    { k: "allocation", label: "Weight", align: "right" },
  ];

  const sectorBreakdown = useMemo(() => {
    const investedValue = holdings.reduce((s, h) => s + h.value, 0);
    const map = new Map<string, number>();
    holdings.forEach((h) => map.set(h.industry, (map.get(h.industry) || 0) + h.value));
    const entries = Array.from(map.entries()).map(
      ([s, v]) => [s, investedValue > 0 ? (v / investedValue) * 100 : 0] as [string, number],
    );
    return entries.sort((a, b) => b[1] - a[1]);
  }, [holdings]);

  const maxSectorPct = useMemo(
    () => sectorBreakdown.reduce((m, [, p]) => Math.max(m, p), 0),
    [sectorBreakdown],
  );

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
            Holdings
          </span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">
            Current portfolio.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A live snapshot of every position held by the Purdue Student Managed Investment Fund,
            with cost basis, returns, and portfolio weighting.
          </p>
        </div>
      </section>

      <section className="container-prose py-16">
        <div className="grid gap-6 md:grid-cols-4 mb-12">
          {[
            { l: "Portfolio Value", v: fmtUSD(portfolioSummary.portfolioValue, { maximumFractionDigits: 0 }) },
            { l: "Invested Capital", v: fmtUSD(portfolioSummary.investedCapital, { maximumFractionDigits: 0 }) },
            { l: "Cash Holdings", v: fmtUSD(portfolioSummary.cashHoldings, { maximumFractionDigits: 0 }) },
            { l: "Total Return", v: fmtPct(portfolioSummary.totalReturnPct) },
          ].map((k) => (
            <div key={k.l} className="border border-border bg-card p-6">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {k.l}
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-ink">{k.v}</div>
            </div>
          ))}
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="border border-border bg-card p-6 md:col-span-2">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Sector Allocation
            </div>
            <div className="space-y-2">
              {sectorBreakdown.map(([s, pct]) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-44 flex-shrink-0 truncate">{s}</span>
                  <div className="flex-1 h-2 bg-secondary">
                    <div
                      className="h-full bg-gradient-gold"
                      style={{ width: `${Math.min(100, (pct / 50) * 100)}%` }}
                    />
                  </div>
                  <span className="w-14 text-right font-mono text-xs text-muted-foreground">
                    {pct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-border bg-card p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Day Performance
            </div>
            <div className="font-display text-3xl font-bold text-destructive">
              {fmtUSD(portfolioSummary.totalDayGain)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {fmtPct(portfolioSummary.totalDayChange)} today
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Weighted Beta
              </div>
              <div className="mt-1 font-display text-2xl font-bold">
                {portfolioSummary.weightedBeta.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground mr-2">
            Filter
          </span>
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition ${
                sector === s
                  ? "bg-ink text-background border-ink"
                  : "bg-background text-ink border-border hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink text-background">
              <tr>
                {cols.map((c) => (
                  <th
                    key={c.k}
                    className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-wider ${
                      c.align === "right" ? "text-right" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggleSort(c.k)}
                      className={`inline-flex items-center gap-1.5 hover:text-gold transition ${
                        c.align === "right" ? "ml-auto" : ""
                      }`}
                    >
                      {c.label}
                      <SortIcon k={c.k} />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <tr
                  key={h.symbol}
                  className="border-t border-border hover:bg-secondary/40 transition"
                >
                  <td className="px-4 py-3 font-medium">{h.company}</td>
                  <td className="px-4 py-3 font-mono font-bold text-gold-deep">{h.symbol}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{h.industry}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmtUSD(h.price)}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmtNum(h.beta)}</td>
                  <td className="px-4 py-3 text-right font-mono">{h.shares.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {fmtUSD(h.value, { maximumFractionDigits: 0 })}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      h.dayChange >= 0 ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {fmtPct(h.dayChange)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      h.totalReturn >= 0 ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {fmtUSD(h.totalReturn, { maximumFractionDigits: 0 })}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-semibold ${
                      h.returnPct >= 0 ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {fmtPct(h.returnPct)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{h.allocation.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-secondary/60 font-semibold">
              <tr className="border-t-2 border-ink">
                <td className="px-4 py-4" colSpan={6}>
                  Total ({rows.length} positions)
                </td>
                <td className="px-4 py-4 text-right font-mono">
                  {fmtUSD(rows.reduce((s, r) => s + r.value, 0), { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-4 text-right font-mono">—</td>
                <td className="px-4 py-4 text-right font-mono">
                  {fmtUSD(rows.reduce((s, r) => s + r.totalReturn, 0), { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-4" />
                <td className="px-4 py-4 text-right font-mono">
                  {rows.reduce((s, r) => s + r.allocation, 0).toFixed(2)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="mt-8 text-xs text-muted-foreground max-w-3xl">
          {isFetching && !quoteData
            ? "Fetching live prices…"
            : quoteData?.cachedAt
              ? `Live prices via Alpha Vantage. Last updated ${new Date(quoteData.cachedAt).toLocaleString()}. Cached for 12 hours.`
              : "Live price data unavailable — showing last reported snapshot."}
        </p>

      </section>
    </>
  );
}
