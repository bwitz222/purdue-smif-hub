import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export const Route = createFileRoute("/holdings/performance")({
  component: Performance,
  head: () => ({
    meta: [
      { title: "Performance — Purdue SMIF" },
      {
        name: "description",
        content:
          "Track record and historical performance of the Purdue Student Managed Investment Fund vs. the S&P 500.",
      },
    ],
  }),
});

const years = [
  { y: "2024", smif: 22.4, bench: 24.2 },
  { y: "2023", smif: 27.1, bench: 26.3 },
  { y: "2022", smif: -15.8, bench: -18.1 },
  { y: "2021", smif: 29.6, bench: 28.7 },
  { y: "2020", smif: 19.2, bench: 18.4 },
  { y: "2019", smif: 30.1, bench: 31.5 },
];

// Annual returns -> growth of $1 (chronological)
const chronological = [...years].reverse();
const cumulative = (() => {
  let smif = 1;
  let bench = 1;
  const start = [{ year: "2018", smif: 1, bench: 1 }];
  return start.concat(
    chronological.map((r) => {
      smif *= 1 + r.smif / 100;
      bench *= 1 + r.bench / 100;
      return {
        year: r.y,
        smif: Number(smif.toFixed(3)),
        bench: Number(bench.toFixed(3)),
      };
    }),
  );
})();

const annual = chronological.map((r) => ({
  year: r.y,
  smif: r.smif,
  bench: r.bench,
}));

type Mode = "cumulative" | "annual";
type Series = "both" | "smif" | "bench";

const fmtPct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
const fmtMult = (v: number) => `${v.toFixed(2)}×`;

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
    <div className="border border-border bg-background px-4 py-3 shadow-lg">
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

function Performance() {
  const [mode, setMode] = useState<Mode>("cumulative");
  const [series, setSeries] = useState<Series>("both");

  const data = mode === "cumulative" ? cumulative : annual;
  const showSmif = series !== "bench";
  const showBench = series !== "smif";

  // Purdue old gold + ink
  const SMIF_COLOR = "hsl(43 74% 49%)";
  const BENCH_COLOR = "hsl(0 0% 30%)";

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
            Performance
          </span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">
            Benchmarked. Transparent. Reviewed quarterly.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Performance is measured against the S&P 500 Total Return Index. Returns shown are
            illustrative.
          </p>
        </div>
      </section>

      <section className="container-prose py-24">
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {[
            { l: "1Y Return", v: "+22.4%" },
            { l: "5Y Annualized", v: "+15.6%" },
            { l: "Inception Annualized", v: "+12.8%" },
          ].map((k) => (
            <div key={k.l} className="border border-border bg-card p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {k.l}
              </div>
              <div className="mt-3 font-display text-4xl font-bold text-ink">{k.v}</div>
            </div>
          ))}
        </div>

        {/* Interactive chart */}
        <div className="border border-border bg-card p-6 md:p-10 mb-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Interactive
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">
                {mode === "cumulative" ? "Growth of $1 since 2018" : "Annual returns"}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex border border-border" role="group" aria-label="Chart mode">
                {(
                  [
                    { k: "cumulative", label: "Cumulative" },
                    { k: "annual", label: "Annual" },
                  ] as { k: Mode; label: string }[]
                ).map((b) => (
                  <button
                    key={b.k}
                    onClick={() => setMode(b.k)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                      mode === b.k
                        ? "bg-ink text-background"
                        : "bg-background text-ink hover:bg-secondary"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="inline-flex border border-border" role="group" aria-label="Series">
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
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                      series === b.k
                        ? "bg-gold-deep text-ink"
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
                <CartesianGrid stroke="hsl(0 0% 90%)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="hsl(0 0% 40%)"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(0 0% 80%)" }}
                />
                <YAxis
                  stroke="hsl(0 0% 40%)"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    mode === "cumulative" ? `${v.toFixed(1)}×` : `${v}%`
                  }
                />
                {mode === "annual" && (
                  <ReferenceLine y={0} stroke="hsl(0 0% 70%)" strokeWidth={1} />
                )}
                <Tooltip
                  cursor={{ stroke: "hsl(0 0% 60%)", strokeDasharray: "3 3" }}
                  content={<ChartTooltip mode={mode} />}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
                {showSmif && (
                  <Line
                    type="monotone"
                    dataKey="smif"
                    name="SMIF"
                    stroke={SMIF_COLOR}
                    strokeWidth={3}
                    dot={{ r: 4, fill: SMIF_COLOR, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
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
                    activeDot={{ r: 5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-hidden border border-border">
          <table className="w-full text-left">
            <thead className="bg-ink text-background">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Year</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">SMIF</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                  S&P 500 TR
                </th>
              </tr>
            </thead>
            <tbody>
              {years.map((r) => (
                <tr key={r.y} className="border-t border-border">
                  <td className="px-6 py-5 font-display font-bold">{r.y}</td>
                  <td className="px-6 py-5 font-mono">{fmtPct(r.smif)}</td>
                  <td className="px-6 py-5 font-mono text-muted-foreground">{fmtPct(r.bench)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-xs text-muted-foreground max-w-3xl">
          Past performance does not guarantee future results. Figures shown for illustrative
          purposes; consult the latest annual report for audited returns.
        </p>
      </section>
    </>
  );
}
