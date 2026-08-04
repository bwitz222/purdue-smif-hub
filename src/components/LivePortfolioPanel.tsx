import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLiveQuotes } from "@/lib/quotes.functions";
import { getFundStats } from "@/lib/fund-stats.functions";
import { liveQueryOptions } from "@/lib/live-query";
import { applyQuotes, baseHoldings } from "@/lib/portfolio";
import { portfolioSummary as fallbackSummary } from "@/data/holdings";
import { CountUp } from "@/components/CountUp";
import { PerformanceSparkline } from "@/components/PerformanceSparkline";

const fmtUSD0 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

/**
 * The live book, above the fold.
 *
 * Every finance club has a skyline photograph and a serif headline. The one
 * thing no other club can put on a homepage is a real portfolio marked to the
 * last close — so it goes in the first viewport, not in a stat band below it.
 *
 * Joins the existing ["live-quotes"] and ["fund-stats"] query caches rather
 * than opening its own, so /holdings, /sectors and this panel always agree and
 * a visit costs one fetch, not three. When there is no live data at all (no
 * Supabase credentials, provider outage), it falls back to the static
 * portfolioSummary — the panel must never render as an empty frame.
 */
export function LivePortfolioPanel() {
  const fetchQuotes = useServerFn(getLiveQuotes);
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), []);
  const { data: quoteData } = useQuery({
    queryKey: ["live-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    ...liveQueryOptions,
  });

  const fetchStats = useServerFn(getFundStats);
  const { data: fundStats } = useQuery({
    queryKey: ["fund-stats"],
    queryFn: () => fetchStats(),
    ...liveQueryOptions,
  });

  const { value, dayChangePct, top } = useMemo(() => {
    const rows = applyQuotes(baseHoldings, quoteData?.quotes ?? {});
    const invested = rows.reduce((s, r) => s + r.value, 0);
    const cash = fundStats?.cash_holdings ?? fallbackSummary.cashHoldings;
    const priorInvested = rows.reduce((s, r) => {
      const denom = 1 + r.dayChange / 100;
      return s + (denom !== 0 ? r.value / denom : r.value);
    }, 0);
    const total = invested + cash;
    const ranked = [...rows]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((r) => ({
        symbol: r.symbol,
        pct: total > 0 ? (r.value / total) * 100 : r.allocation,
        dayChange: r.dayChange,
      }));
    return {
      value: total > 0 ? total : fallbackSummary.portfolioValue,
      dayChangePct:
        priorInvested > 0 ? ((invested - priorInvested) / priorInvested) * 100 : fallbackSummary.totalDayChange,
      top: ranked,
    };
  }, [quoteData, fundStats]);

  const up = dayChangePct >= 0;
  // Bars are scaled against the largest position, not against 100%, so the
  // shape of the book reads at a glance instead of five near-identical stubs.
  const maxPct = Math.max(...top.map((t) => t.pct), 1);

  return (
    <div className="border border-white/12 bg-ink/70 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
          The book
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-dark-muted">
          Latest close
        </span>
      </div>

      <div className="px-6 py-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-on-dark-muted">
          Portfolio value
        </div>
        <div className="mt-1.5 flex items-baseline gap-4">
          <span className="font-display text-5xl font-bold leading-none text-background lg:text-6xl">
            <CountUp to={value} duration={1.2} rollId="home-portfolio-value" format={fmtUSD0} />
          </span>
          <span
            className={`font-mono text-sm font-semibold tabular-nums ${up ? "text-gain-on-dark" : "text-loss-on-dark"}`}
          >
            {fmtPct(dayChangePct)}
            <span className="ml-1.5 text-on-dark-muted">today</span>
          </span>
        </div>

        <div className="mt-7">
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-on-dark-muted">
            Largest positions
          </div>
          <ul className="mt-3 space-y-2">
            {top.map((t) => (
              <li key={t.symbol} className="flex items-center gap-3">
                <span className="w-14 shrink-0 font-mono text-xs font-bold tracking-wider text-gold">
                  {t.symbol}
                </span>
                <span className="relative h-1 flex-1 bg-white/10">
                  <span
                    className="absolute inset-y-0 left-0 bg-gradient-gold"
                    style={{ width: `${(t.pct / maxPct) * 100}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-on-dark-secondary">
                  {t.pct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
          <PerformanceSparkline onDark />
          <Link
            to="/holdings"
            className="group inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gold hover:text-gold-mid"
          >
            All positions
            <ArrowRight className="arrow-slide h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
