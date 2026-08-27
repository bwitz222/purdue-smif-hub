import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  computeWindowStats,
  WINDOW_MONTHS,
  WINDOW_LABEL,
  type PerfWindow,
} from "@/lib/fund-analytics";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatMonth } from "@/lib/format-month";
import { socialMeta, canonical, breadcrumbLd, OG_PERFORMANCE } from "@/lib/seo";
import { Reveal } from "@/components/Reveal";
import {
  getFundPerformance,
  getFundMonthlyHistory,
  type PerfRow,
  type PerfKpis,
  type MonthlyPoint,
} from "@/lib/fund-performance.functions";

export const Route = createFileRoute("/performance")({
  component: Performance,
  // SSR loader — fetch both series server-side so crawlers, link previews,
  // and no-JS visitors get the real figures instead of the illustrative
  // fallbacks (the client useQuery calls below seed from this and own
  // refreshing thereafter).
  loader: async () => {
    const [perf, monthly] = await Promise.all([getFundPerformance(), getFundMonthlyHistory()]);
    return { perf, monthly };
  },
  head: () => ({
    meta: [
      { title: "Performance & Track Record vs. the S&P 500 | Purdue SMIF" },
      {
        name: "description",
        content:
          "Annual and cumulative returns of Purdue SMIF benchmarked against the S&P 500 Total Return Index, with Sharpe, alpha, beta, and drawdown analytics since 2013.",
      },
      ...socialMeta({
        title: "Performance & Track Record | Purdue SMIF",
        description:
          "Annual and cumulative returns of the Purdue SMIF benchmarked against the S&P 500.",
        url: canonical("/performance"),
        image: OG_PERFORMANCE,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/performance") }],
    scripts: [breadcrumbLd("Performance", "/performance")],
  }),
});

// Hardcoded fallback — used only if the fund_performance table fetch fails.
const FALLBACK_ROWS: PerfRow[] = [
  { year: 2024, smif_return: 22.4, bench_return: 24.2, is_audited: false },
  { year: 2023, smif_return: 27.1, bench_return: 26.3, is_audited: false },
  { year: 2022, smif_return: -15.8, bench_return: -18.1, is_audited: false },
  { year: 2021, smif_return: 29.6, bench_return: 28.7, is_audited: false },
  { year: 2020, smif_return: 19.2, bench_return: 18.4, is_audited: false },
  { year: 2019, smif_return: 30.1, bench_return: 31.5, is_audited: false },
];
const FALLBACK_KPIS: PerfKpis = {
  one_year: 22.4,
  five_year_annualized: 15.6,
  inception_annualized: 12.8,
};

type Mode = "cumulative" | "annual";
type Series = "both" | "smif" | "bench";
type IncMode = "growth" | "drawdown" | "rolling";

const fmtPct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
const fmtMult = (v: number) => `${v.toFixed(2)}×`;
const fmtPctPlain = (v: number) => `${v.toFixed(1)}%`; // no leading + (vol, tracking error…)
// A KPI whose window isn't fully populated renders "—" rather than a number
// measuring a shorter period than its label claims.
const fmtPctOrDash = (v: number | null) => (v === null ? "—" : fmtPct(v));
const fmtRatio = (v: number) => v.toFixed(2); // Sharpe, beta, correlation…

const SMIF_COLOR = "#CEB888";
const BENCH_COLOR = "#6B6860";

function ChartTooltip({
  active,
  payload,
  label,
  mode,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  mode: Mode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-background px-4 py-3 shadow-elegant">
      <div className="font-display text-sm font-bold text-ink">{label}</div>
      <div className="mt-2 space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-3 text-xs">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-mono font-semibold text-ink">
              {mode === "cumulative" ? fmtMult(p.value) : fmtPct(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyTooltip({
  active,
  payload,
  label,
  mode,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
  mode: IncMode;
}) {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) =>
    mode === "growth" ? fmtMult(v) : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
  return (
    <div className="border border-border bg-background px-4 py-3 shadow-elegant">
      <div className="font-display text-sm font-bold text-ink">
        {label ? formatMonth(label) : ""}
      </div>
      <div className="mt-2 space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-3 text-xs">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-mono font-semibold text-ink">{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Performance() {
  const [mode, setMode] = useState<Mode>("cumulative");
  const [series, setSeries] = useState<Series>("both");
  const [incMode, setIncMode] = useState<IncMode>("growth");
  const [incSeries, setIncSeries] = useState<Series>("both");
  const [perfWindow, setPerfWindow] = useState<PerfWindow>("5y");

  const initial = Route.useLoaderData();

  const fetchPerf = useServerFn(getFundPerformance);
  const { data: perfData } = useQuery({
    queryKey: ["fund-performance"],
    queryFn: () => fetchPerf(),
    staleTime: 60 * 60 * 1000,
    // null = the SSR fetch failed; pass undefined so the client refetches
    // immediately instead of treating null as fresh data for staleTime.
    initialData: initial.perf ?? undefined,
  });

  const fetchMonthly = useServerFn(getFundMonthlyHistory);
  const { data: monthlyData } = useQuery({
    queryKey: ["fund-monthly-history"],
    queryFn: () => fetchMonthly(),
    staleTime: 60 * 60 * 1000,
    initialData: initial.monthly ?? undefined,
  });

  const years: PerfRow[] =
    perfData?.rows && perfData.rows.length > 0 ? perfData.rows : FALLBACK_ROWS;
  const kpis: PerfKpis = perfData?.kpis ?? FALLBACK_KPIS;
  const allAudited = years.length > 0 && years.every((r) => r.is_audited);

  // Both measurement windows, derived from the single monthly series with the
  // same pure helpers the server uses. computeWindowStats re-bases growth to
  // the window's first month and recomputes the drawdown peak inside it —
  // slicing the cumulative-from-inception figures would carry an old peak in.
  const windows = useMemo(() => {
    const full = monthlyData?.series ?? [];
    return {
      "5y": computeWindowStats(full, WINDOW_MONTHS["5y"]),
      inception: computeWindowStats(full, WINDOW_MONTHS.inception),
    };
  }, [monthlyData]);

  // Fall back rather than render a window the data cannot support.
  const activeWindow: PerfWindow = windows[perfWindow] ? perfWindow : "inception";
  const windowStats = windows[activeWindow];
  const windowLabel = WINDOW_LABEL[activeWindow];
  const windowStartMonth = windowStats?.series[0]?.month ?? monthlyData?.inceptionMonth ?? "";

  // Prefer real KPIs derived from the monthly series when available.
  const KPI_STATS = useMemo(() => {
    if (monthlyData) {
      const k = monthlyData.kpis;
      return [
        { l: "1Y Return", v: fmtPctOrDash(k.one_year_pct), pos: (k.one_year_pct ?? 0) >= 0 },
        {
          l: "5Y Annualized",
          v: fmtPctOrDash(k.five_year_annualized_pct),
          pos: (k.five_year_annualized_pct ?? 0) >= 0,
        },
        {
          l: "Inception Annualized",
          v: fmtPct(k.inception_annualized_pct),
          pos: k.inception_annualized_pct >= 0,
        },
        {
          l: activeWindow === "5y" ? "Max Drawdown · 5Y" : "Max Drawdown",
          v: fmtPct(windowStats?.max_drawdown_pct ?? k.max_drawdown_pct),
          pos: false,
        },
      ];
    }
    return [
      { l: "1Y Return", v: fmtPct(kpis.one_year), pos: kpis.one_year >= 0 },
      {
        l: "5Y Annualized",
        v: fmtPct(kpis.five_year_annualized),
        pos: kpis.five_year_annualized >= 0,
      },
      {
        l: "Inception Annualized",
        v: fmtPct(kpis.inception_annualized),
        pos: kpis.inception_annualized >= 0,
      },
    ];
  }, [monthlyData, kpis, activeWindow, windowStats]);

  // Risk & return analytics — derived server-side from the monthly series.
  type Tone = "pos" | "neg" | "neutral";
  const toneClass = (t: Tone) =>
    t === "pos" ? "text-gain" : t === "neg" ? "text-loss" : "text-ink";
  const a = windowStats?.analytics;
  const analyticsPrimary: { l: string; v: string; tone: Tone; sub: string }[] = a
    ? [
        {
          l: "Cumulative Return",
          v: fmtPct(a.cumulative_return_pct),
          tone: a.cumulative_return_pct >= 0 ? "pos" : "neg",
          sub: windowLabel,
        },
        {
          l: "Annualized Volatility",
          v: fmtPctPlain(a.annualized_vol_pct),
          tone: "neutral",
          sub: "Std. dev × √12",
        },
        {
          l: "Sharpe Ratio",
          v: fmtRatio(a.sharpe),
          tone: a.sharpe >= 0 ? "pos" : "neg",
          sub: "rf 0%",
        },
        {
          l: "Sortino Ratio",
          v: fmtRatio(a.sortino),
          tone: a.sortino >= 0 ? "pos" : "neg",
          sub: "Downside, rf 0%",
        },
        { l: "Beta vs S&P 500", v: fmtRatio(a.beta), tone: "neutral", sub: "Monthly" },
        {
          l: "Annualized Alpha",
          v: fmtPct(a.annualized_alpha_pct),
          tone: a.annualized_alpha_pct >= 0 ? "pos" : "neg",
          sub: "vs SPY, rf 0%",
        },
        {
          l: "Tracking Error",
          v: fmtPctPlain(a.tracking_error_pct),
          tone: "neutral",
          sub: "Annualized",
        },
        {
          l: "Information Ratio",
          v: fmtRatio(a.information_ratio),
          tone: a.information_ratio >= 0 ? "pos" : "neg",
          sub: "Active return / TE",
        },
      ]
    : [];
  const analyticsSecondary: { l: string; v: string; tone: Tone }[] = a
    ? [
        { l: "Best Month", v: fmtPct(a.best_month_pct), tone: "pos" },
        { l: "Worst Month", v: fmtPct(a.worst_month_pct), tone: "neg" },
        { l: "Positive Months", v: fmtPctPlain(a.positive_months_pct), tone: "neutral" },
        { l: "Correlation to S&P 500", v: fmtRatio(a.correlation), tone: "neutral" },
      ]
    : [];

  const { cumulative, annual, baseYear } = useMemo(() => {
    const chronological = [...years].sort((a, b) => a.year - b.year);
    const baseYear = chronological.length > 0 ? chronological[0].year - 1 : 2018;
    let smif = 1,
      bench = 1;
    const cumulative = [{ year: String(baseYear), smif: 1, bench: 1 }].concat(
      chronological.map((r) => {
        smif *= 1 + r.smif_return / 100;
        bench *= 1 + r.bench_return / 100;
        return {
          year: String(r.year),
          smif: Number(smif.toFixed(3)),
          bench: Number(bench.toFixed(3)),
        };
      }),
    );
    const annual = chronological.map((r) => ({
      year: String(r.year),
      smif: r.smif_return,
      bench: r.bench_return,
    }));
    return { cumulative, annual, baseYear };
  }, [years]);

  // Monthly chart series + rolling-1Y derived series.
  const monthlySeries = useMemo(() => {
    const pts: MonthlyPoint[] = windowStats?.series ?? [];
    if (incMode === "rolling") {
      // 12-month trailing return at each point
      const out: Array<{ month: string; smif: number; bench: number }> = [];
      for (let i = 11; i < pts.length; i++) {
        let s = 1,
          b = 1;
        for (let j = i - 11; j <= i; j++) {
          s *= 1 + pts[j].smif_return_pct / 100;
          b *= 1 + (pts[j].bench_return_pct ?? 0) / 100;
        }
        out.push({ month: pts[i].month, smif: (s - 1) * 100, bench: (b - 1) * 100 });
      }
      return out;
    }
    if (incMode === "drawdown") {
      return pts.map((p) => ({
        month: p.month,
        smif: p.smif_drawdown_pct,
        bench: p.bench_drawdown_pct,
      }));
    }
    return pts.map((p) => ({ month: p.month, smif: p.smif_growth, bench: p.bench_growth }));
  }, [windowStats, incMode]);

  // Only show January tick labels so the long axis stays readable.
  const monthlyTickFormatter = (iso: string) => {
    const [y, m] = iso.split("-");
    return m === "01" ? y : "";
  };

  const data = mode === "cumulative" ? cumulative : annual;
  const showSmif = series !== "bench";
  const showBench = series !== "smif";
  const showIncSmif = incSeries !== "bench";
  const showIncBench = incSeries !== "smif";

  const tableRows = useMemo(() => [...years].sort((a, b) => b.year - a.year), [years]);

  const monthlyChartTitle = useMemo(() => {
    if (!monthlyData || !windowStartMonth) return "Growth of $1";
    const startYear = windowStartMonth.slice(0, 4);
    return incMode === "growth"
      ? `Growth of $1 since ${formatMonth(windowStartMonth)}`
      : incMode === "drawdown"
        ? `Peak-to-trough drawdown since ${startYear}`
        : `Rolling 12-month return since ${startYear}`;
  }, [monthlyData, windowStartMonth, incMode]);

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────── */}
      <section className="relative bg-ink text-background overflow-hidden">
        <div className="container-prose py-28">
          <div className="flex items-center gap-3 mb-8">
            <span className="rule-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/70">
              Performance
            </span>
          </div>
          <h1
            className="font-display font-bold text-background max-w-3xl"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", lineHeight: "1.02" }}
          >
            Benchmarked.
            <br />
            Transparent.
            <br />
            <span className="text-gold/80">Quarterly.</span>
          </h1>
          <p className="mt-8 max-w-xl text-on-dark-secondary leading-relaxed text-lg">
            Measured against the S&amp;P 500 Total Return Index (SPY). The fund was established in
            1995; the audited monthly series begins October 2013, when it moved to its current
            custodian.
            {monthlyData ? "" : allAudited ? "" : " Returns shown are illustrative."}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </section>

      {!monthlyData && !allAudited && (
        <div className="container-prose pt-10">
          <div className="border border-gold/40 bg-secondary/30 p-5 md:p-6 flex items-start gap-4">
            <span className="rule-gold mt-2 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-gold-deep mb-1">
                Work in progress
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This page is being refined. Returns shown are illustrative placeholders pending the
                next audited reporting cycle; treat them as such until the published annual report
                goes live.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="container-prose py-10 space-y-12 pt-14">
        {/* ── KPI cards ─────────────────────────────────────────── */}
        <Reveal
          className={`grid gap-px bg-border ${KPI_STATS.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}
        >
          {KPI_STATS.map(({ l, v, pos }) => (
            <div
              key={l}
              className="bg-card p-8 flex flex-col gap-1 border border-border hover-raise"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{l}</div>
              <div
                className={`font-display text-4xl font-bold mt-1 inline-flex items-baseline gap-1.5 ${pos ? "text-gain" : "text-loss"}`}
              >
                {pos ? (
                  <ArrowUp className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <ArrowDown className="h-6 w-6" aria-hidden="true" />
                )}
                <span>{v}</span>
              </div>
            </div>
          ))}
        </Reveal>

        {/* ── Measurement window ────────────────────────────────── */}
        {/* Governs the analytics block and the monthly chart below it. Both
            used to be since-inception with no way to say so on the page; the
            labels underneath now name whichever window is selected. Hidden
            when the history is too short to support a 5Y figure, since there
            would be nothing to switch between. */}
        {monthlyData && windows["5y"] && (
          <Reveal className="flex flex-wrap items-center gap-x-4 gap-y-2" delay={0.01}>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Measurement window
            </span>
            <div
              className="inline-flex border border-border"
              role="group"
              aria-label="Measurement window"
            >
              {(
                [
                  { k: "5y", label: "5Y" },
                  { k: "inception", label: "Since inception" },
                ] as { k: PerfWindow; label: string }[]
              ).map((b) => (
                <button
                  key={b.k}
                  onClick={() => setPerfWindow(b.k)}
                  aria-pressed={activeWindow === b.k}
                  className={`press px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                    activeWindow === b.k
                      ? "bg-ink text-background"
                      : "bg-background text-ink hover:bg-secondary"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Applies to the analytics and monthly chart below. The annual table and the 1Y / 5Y /
              inception cards above are unaffected.
            </span>
          </Reveal>
        )}

        {/* ── Risk & return analytics ───────────────────────────── */}
        {a && a.observations >= 12 && (
          <Reveal className="space-y-4" delay={0.02}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
                Risk &amp; return analytics
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground whitespace-nowrap">
                {a.observations} mo · monthly basis
              </span>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {analyticsPrimary.map(({ l, v, tone, sub }) => (
                <div
                  key={l}
                  className="bg-card p-6 flex flex-col gap-1 border border-border hover-raise"
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {l}
                  </div>
                  <div className={`font-display text-3xl font-bold mt-1 ${toneClass(tone)}`}>
                    {v}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">{sub}</div>
                </div>
              ))}
            </div>
            <div className="grid gap-px bg-border grid-cols-2 lg:grid-cols-4">
              {analyticsSecondary.map(({ l, v, tone }) => (
                <div
                  key={l}
                  className="bg-card px-6 py-5 flex flex-col gap-0.5 border border-border hover-raise"
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {l}
                  </div>
                  <div className={`font-display text-xl font-bold ${toneClass(tone)}`}>{v}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Computed from monthly SMIF and S&amp;P 500 total-return (SPY) returns since{" "}
              {formatMonth(windowStartMonth)}
              {activeWindow === "5y" ? " (trailing 5 years)" : " (inception)"}, excluding
              custodian-transition bridge months. Sharpe and Sortino assume a 0% risk-free rate;
              alpha, beta, and correlation are measured against the S&amp;P 500 total-return index.
            </p>
          </Reveal>
        )}

        {/* ── Monthly series (windowed, live) ────────────────────── */}
        {monthlyData && monthlyData.series.length > 0 && (
          <Reveal className="border border-border bg-card p-6 md:p-10" delay={0.04}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">
                  {windowLabel} · Monthly · updated {formatMonth(monthlyData.lastMonth)}
                </div>
                <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
                  {monthlyChartTitle}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="inline-flex border border-border" role="group">
                  {(
                    [
                      { k: "growth", label: "Growth of $1" },
                      { k: "drawdown", label: "Drawdown" },
                      { k: "rolling", label: "Rolling 1Y" },
                    ] as { k: IncMode; label: string }[]
                  ).map((b) => (
                    <button
                      key={b.k}
                      onClick={() => setIncMode(b.k)}
                      className={`press px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                        incMode === b.k
                          ? "bg-ink text-background"
                          : "bg-background text-ink hover:bg-secondary"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                <div className="inline-flex border border-border" role="group">
                  {(
                    [
                      { k: "both", label: "Both" },
                      { k: "smif", label: "SMIF" },
                      { k: "bench", label: "SPY TR" },
                    ] as { k: Series; label: string }[]
                  ).map((b) => (
                    <button
                      key={b.k}
                      onClick={() => setIncSeries(b.k)}
                      className={`press px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                        incSeries === b.k
                          ? "bg-gold-deep text-background"
                          : "bg-background text-ink hover:bg-secondary"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {incMode === "growth" ? (
                  <AreaChart
                    data={monthlySeries}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="smifGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SMIF_COLOR} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={SMIF_COLOR} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BENCH_COLOR} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={BENCH_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E0DDD5" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#6B6860"
                      tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                      tickLine={false}
                      axisLine={{ stroke: "#E0DDD5" }}
                      tickFormatter={monthlyTickFormatter}
                      interval={0}
                      minTickGap={20}
                    />
                    <YAxis
                      stroke="#6B6860"
                      tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v.toFixed(1)}×`}
                    />
                    <Tooltip
                      cursor={{ stroke: "#CEB888", strokeDasharray: "4 4", strokeWidth: 1 }}
                      content={<MonthlyTooltip mode={incMode} />}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, paddingTop: 16, fontFamily: "IBM Plex Mono" }}
                    />
                    {showIncSmif && (
                      <Area
                        type="monotone"
                        dataKey="smif"
                        name="SMIF"
                        stroke={SMIF_COLOR}
                        strokeWidth={2.5}
                        fill="url(#smifGrad)"
                      />
                    )}
                    {showIncBench && (
                      <Area
                        type="monotone"
                        dataKey="bench"
                        name="S&P 500 TR (SPY)"
                        stroke={BENCH_COLOR}
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        fill="url(#benchGrad)"
                      />
                    )}
                  </AreaChart>
                ) : (
                  <LineChart
                    data={monthlySeries}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#E0DDD5" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#6B6860"
                      tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                      tickLine={false}
                      axisLine={{ stroke: "#E0DDD5" }}
                      tickFormatter={monthlyTickFormatter}
                      interval={0}
                      minTickGap={20}
                    />
                    <YAxis
                      stroke="#6B6860"
                      tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v.toFixed(0)}%`}
                    />
                    <ReferenceLine y={0} stroke="#E0DDD5" strokeWidth={1} />
                    <Tooltip
                      cursor={{ stroke: "#CEB888", strokeDasharray: "4 4", strokeWidth: 1 }}
                      content={<MonthlyTooltip mode={incMode} />}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, paddingTop: 16, fontFamily: "IBM Plex Mono" }}
                    />
                    {showIncSmif && (
                      <Line
                        type="monotone"
                        dataKey="smif"
                        name="SMIF"
                        dot={false}
                        stroke={SMIF_COLOR}
                        strokeWidth={2.5}
                      />
                    )}
                    {showIncBench && (
                      <Line
                        type="monotone"
                        dataKey="bench"
                        name="S&P 500 TR (SPY)"
                        dot={false}
                        stroke={BENCH_COLOR}
                        strokeWidth={2}
                        strokeDasharray="6 4"
                      />
                    )}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              SMIF returns derived from monthly custodian statements (Modified Dietz for months with
              external cash flows). S&P 500 benchmark is SPY adjusted close (total return, includes
              reinvested dividends). Custodian-transition months (Nov 2024, Mar 2025) bridged at 0%
              return.
            </p>
          </Reveal>
        )}

        {/* ── Annual chart ─────────────────────────────────────── */}
        <Reveal className="border border-border bg-card p-6 md:p-10" delay={0.08}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Annual · Audited Years
              </div>
              <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
                {mode === "cumulative" ? `Growth of $1 since ${baseYear}` : "Annual returns"}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex border border-border" role="group">
                {(
                  [
                    { k: "cumulative", label: "Cumulative" },
                    { k: "annual", label: "Annual" },
                  ] as { k: Mode; label: string }[]
                ).map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setMode(b.k)}
                    className={`press px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                      mode === b.k
                        ? "bg-ink text-background"
                        : "bg-background text-ink hover:bg-secondary"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="inline-flex border border-border" role="group">
                {(
                  [
                    { k: "both", label: "Both" },
                    { k: "smif", label: "SMIF" },
                    { k: "bench", label: "S&P 500" },
                  ] as { k: Series; label: string }[]
                ).map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setSeries(b.k)}
                    className={`press px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                      series === b.k
                        ? "bg-gold-deep text-background"
                        : "bg-background text-ink hover:bg-secondary"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E0DDD5" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="#6B6860"
                  tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E0DDD5" }}
                  minTickGap={24}
                  interval="preserveStartEnd"
                />

                <YAxis
                  stroke="#6B6860"
                  tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (mode === "cumulative" ? `${v.toFixed(1)}×` : `${v}%`)}
                />
                {mode === "annual" && <ReferenceLine y={0} stroke="#E0DDD5" strokeWidth={1} />}
                <Tooltip
                  cursor={{ stroke: "#CEB888", strokeDasharray: "4 4", strokeWidth: 1 }}
                  content={<ChartTooltip mode={mode} />}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 16, fontFamily: "IBM Plex Mono" }}
                />
                {showSmif && (
                  <Line
                    type="monotone"
                    dataKey="smif"
                    name="SMIF"
                    stroke={SMIF_COLOR}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: SMIF_COLOR, strokeWidth: 0 }}
                    activeDot={{ r: 6, stroke: SMIF_COLOR, strokeWidth: 2, fill: "#fff" }}
                  />
                )}
                {showBench && (
                  <Line
                    type="monotone"
                    dataKey="bench"
                    name="S&P 500 TR"
                    stroke={BENCH_COLOR}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={{ r: 3, fill: BENCH_COLOR, strokeWidth: 0 }}
                    activeDot={{ r: 5, stroke: BENCH_COLOR, strokeWidth: 2, fill: "#fff" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Reveal>

        {/* ── Annual returns table ───────────────────────────────── */}
        <Reveal className="overflow-x-auto border border-border">
          <table className="w-full min-w-[520px] text-left">
            <thead className="bg-ink text-background">
              <tr>
                <th className="px-3 py-3 md:px-6 md:py-4 text-xs font-semibold uppercase tracking-wider">
                  Year
                </th>
                <th className="px-3 py-3 md:px-6 md:py-4 text-xs font-semibold uppercase tracking-wider text-right">
                  SMIF
                </th>
                <th className="px-3 py-3 md:px-6 md:py-4 text-xs font-semibold uppercase tracking-wider text-right">
                  S&P 500 TR
                </th>
                <th className="px-3 py-3 md:px-6 md:py-4 text-xs font-semibold uppercase tracking-wider text-right">
                  Spread
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r, idx) => {
                const spread = r.smif_return - r.bench_return;
                return (
                  <tr
                    key={r.year}
                    className={`border-t border-border hover:bg-secondary/50 transition-colors duration-150 ${idx % 2 !== 0 ? "bg-secondary/20" : ""}`}
                  >
                    <td className="px-3 py-4 md:px-6 md:py-5 font-display font-bold text-ink">
                      {r.year}
                    </td>
                    <td
                      className={`px-3 py-4 md:px-6 md:py-5 font-mono text-right font-medium ${r.smif_return >= 0 ? "text-gain" : "text-loss"}`}
                    >
                      <span className="inline-flex items-center justify-end gap-1">
                        {r.smif_return >= 0 ? (
                          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {fmtPct(r.smif_return)}
                      </span>
                    </td>
                    <td className="px-3 py-4 md:px-6 md:py-5 font-mono text-right text-muted-foreground">
                      {fmtPct(r.bench_return)}
                    </td>
                    <td
                      className={`px-3 py-4 md:px-6 md:py-5 font-mono text-right font-semibold ${spread >= 0 ? "text-gain" : "text-loss"}`}
                    >
                      {fmtPct(spread)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Reveal>

        <div className="border-t border-border pt-6 pb-8 mt-4 space-y-2 text-xs text-muted-foreground max-w-3xl">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Methodology &amp; disclaimer
          </div>
          <p>
            <span className="font-semibold text-foreground">Data source:</span> monthly NAV series
            maintained by the fund. Daily quotes on the Holdings page are Polygon.io end-of-day
            closes, refreshed daily after the market close.
          </p>
          <p>
            <span className="font-semibold text-foreground">Methodology:</span> monthly returns are
            computed on a Modified Dietz basis to account for intra-month contributions and
            withdrawals. The benchmark is the S&amp;P 500 Total Return (SPY, dividends reinvested).
          </p>
          <p>
            <span className="font-semibold text-foreground">Measurement window:</span> the risk and
            return analytics and the monthly chart default to the trailing five years, the period
            with the most complete custodian data. Growth and drawdown are re-based to the start of
            whichever window is selected, so a five-year drawdown is the deepest fall within those
            five years rather than an all-time figure. The full record since October 2013 remains
            available from the window control, and the annual table below is always the complete
            series.
          </p>
          <p>
            Past performance does not guarantee future results.
            {monthlyData ? "" : allAudited ? "" : " Figures shown for illustrative purposes;"} see
            the latest annual report for audited figures.
          </p>
        </div>
      </section>
    </>
  );
}
