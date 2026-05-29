import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

export const Route = createFileRoute("/performance")({
  component: Performance,
  head: () => ({
    meta: [
      { title: "Performance — Purdue SMIF" },
      { name: "description", content: "Track record and historical performance of the Purdue Student Managed Investment Fund vs. the S&P 500." },
      { property: "og:title", content: "Performance & Track Record — Purdue SMIF" },
      { property: "og:description", content: "Annual and cumulative returns of the Purdue SMIF benchmarked against the S&P 500." },
      { property: "og:url", content: "https://purduesmif.org/performance" },
    ],
    links: [{ rel: "canonical", href: "https://purduesmif.org/performance" }],
  }),
});

const years = [
  { y: "2024", smif: 22.4,  bench: 24.2  },
  { y: "2023", smif: 27.1,  bench: 26.3  },
  { y: "2022", smif: -15.8, bench: -18.1 },
  { y: "2021", smif: 29.6,  bench: 28.7  },
  { y: "2020", smif: 19.2,  bench: 18.4  },
  { y: "2019", smif: 30.1,  bench: 31.5  },
];

const chronological = [...years].reverse();

const cumulative = (() => {
  let smif = 1, bench = 1;
  return [{ year: "2018", smif: 1, bench: 1 }].concat(
    chronological.map((r) => {
      smif  *= 1 + r.smif  / 100;
      bench *= 1 + r.bench / 100;
      return { year: r.y, smif: Number(smif.toFixed(3)), bench: Number(bench.toFixed(3)) };
    })
  );
})();

const annual = chronological.map((r) => ({ year: r.y, smif: r.smif, bench: r.bench }));

type Mode   = "cumulative" | "annual";
type Series = "both" | "smif" | "bench";

const fmtPct  = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
const fmtMult = (v: number) => `${v.toFixed(2)}×`;

const SMIF_COLOR  = "#CFB991";
const BENCH_COLOR = "#6B6860";

function ChartTooltip({ active, payload, label, mode }: {
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
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
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

const KPI_STATS = [
  { l: "1Y Return",             v: "+22.4%", pos: true  },
  { l: "5Y Annualized",         v: "+15.6%", pos: true  },
  { l: "Inception Annualized",  v: "+12.8%", pos: true  },
];

function Performance() {
  const [mode,   setMode]   = useState<Mode>("cumulative");
  const [series, setSeries] = useState<Series>("both");

  const data       = mode === "cumulative" ? cumulative : annual;
  const showSmif   = series !== "bench";
  const showBench  = series !== "smif";

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
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", lineHeight: "0.96" }}
          >
            Benchmarked.<br />
            Transparent.<br />
            <span className="text-gold/80">Quarterly.</span>
          </h1>
          <p className="mt-8 max-w-xl text-background/55 leading-relaxed text-lg">
            Measured against the S&P 500 Total Return Index.
            Returns shown are illustrative.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/8" />
      </section>

      {/* ── Work in progress notice ─────────────────────────────── */}
      <section className="container-prose pt-10">
        <div className="border border-destructive/20 bg-destructive/[0.06] px-6 py-5 md:px-8 md:py-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 flex-shrink-0 bg-destructive" />
            <p className="text-sm leading-relaxed text-destructive">
              <span className="font-semibold">Work in progress.</span>{" "}
              This page is currently being updated. Please check back at a later date.
            </p>
          </div>
        </div>
      </section>

      <section className="container-prose py-10 space-y-12">

        {/* ── KPI cards ─────────────────────────────────────────── */}
        <div className="grid gap-px bg-border md:grid-cols-3">
          {KPI_STATS.map(({ l, v, pos }) => (
            <div key={l} className="bg-card p-8 flex flex-col gap-1 border border-border">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{l}</div>
              <div className={`font-display text-4xl font-bold mt-1 ${pos ? "text-emerald-600" : "text-destructive"}`}>
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart ─────────────────────────────────────────────── */}
        <div className="border border-border bg-card p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Interactive</div>
              <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
                {mode === "cumulative" ? "Growth of $1 since 2018" : "Annual returns"}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex border border-border" role="group">
                {([{ k: "cumulative", label: "Cumulative" }, { k: "annual", label: "Annual" }] as { k: Mode; label: string }[]).map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setMode(b.k)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${
                      mode === b.k ? "bg-ink text-background" : "bg-background text-ink hover:bg-secondary"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="inline-flex border border-border" role="group">
                {([{ k: "both", label: "Both" }, { k: "smif", label: "SMIF" }, { k: "bench", label: "S&P 500" }] as { k: Series; label: string }[]).map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setSeries(b.k)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${
                      series === b.k ? "bg-gold-deep text-background" : "bg-background text-ink hover:bg-secondary"
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
                />
                <YAxis
                  stroke="#6B6860"
                  tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => mode === "cumulative" ? `${v.toFixed(1)}×` : `${v}%`}
                />
                {mode === "annual" && (
                  <ReferenceLine y={0} stroke="#E0DDD5" strokeWidth={1} />
                )}
                <Tooltip
                  cursor={{ stroke: "#CFB991", strokeDasharray: "4 4", strokeWidth: 1 }}
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
        </div>

        {/* ── Annual returns table ───────────────────────────────── */}
        <div className="overflow-hidden border border-border">
          <table className="w-full text-left">
            <thead className="bg-ink text-background">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Year</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">SMIF</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">S&P 500 TR</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Spread</th>
              </tr>
            </thead>
            <tbody>
              {years.map((r, idx) => {
                const spread = r.smif - r.bench;
                return (
                  <tr key={r.y} className={`border-t border-border hover:bg-secondary/50 transition-colors duration-150 ${idx % 2 !== 0 ? "bg-secondary/20" : ""}`}>
                    <td className="px-6 py-5 font-display font-bold text-ink">{r.y}</td>
                    <td className={`px-6 py-5 font-mono text-right font-medium ${r.smif >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {fmtPct(r.smif)}
                    </td>
                    <td className="px-6 py-5 font-mono text-right text-muted-foreground">{fmtPct(r.bench)}</td>
                    <td className={`px-6 py-5 font-mono text-right font-semibold ${spread >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                      {fmtPct(spread)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground max-w-3xl pb-8">
          Past performance does not guarantee future results. Figures shown for illustrative
          purposes; consult the latest annual report for audited returns.
        </p>
      </section>
    </>
  );
}
