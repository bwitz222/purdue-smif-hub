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
import { fmtMult, fmtPct, type IncMode, type Mode } from "@/lib/perf-format";

// The two performance charts. Loaded lazily by the /performance route so the
// charting library stays off the page's critical path.

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

export function MonthlyChart({
  data,
  mode,
  showSmif,
  showBench,
  tickFormatter,
}: {
  data: Array<{ month: string; smif: number; bench: number }>;
  mode: IncMode;
  showSmif: boolean;
  showBench: boolean;
  tickFormatter: (iso: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {mode === "growth" ? (
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
            tickFormatter={tickFormatter}
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
            content={<MonthlyTooltip mode={mode} />}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingTop: 16, fontFamily: "IBM Plex Mono" }}
          />
          {showSmif && (
            <Area
              type="monotone"
              dataKey="smif"
              name="SMIF"
              stroke={SMIF_COLOR}
              strokeWidth={2.5}
              fill="url(#smifGrad)"
            />
          )}
          {showBench && (
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
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E0DDD5" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#6B6860"
            tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }}
            tickLine={false}
            axisLine={{ stroke: "#E0DDD5" }}
            tickFormatter={tickFormatter}
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
            content={<MonthlyTooltip mode={mode} />}
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
              dot={false}
              stroke={SMIF_COLOR}
              strokeWidth={2.5}
            />
          )}
          {showBench && (
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
  );
}

export function AnnualChart({
  data,
  mode,
  showSmif,
  showBench,
}: {
  data: Array<{ year: string; smif: number; bench: number }>;
  mode: Mode;
  showSmif: boolean;
  showBench: boolean;
}) {
  return (
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
  );
}
