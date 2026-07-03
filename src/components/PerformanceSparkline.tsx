// Understated growth-of-$1 sparkline for the homepage performance band.
// SSR-safe (no window access), self-fetching via useQuery, and hides itself
// gracefully when the fund-monthly-history fetch fails or returns nothing.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFundMonthlyHistory } from "@/lib/fund-performance.functions";

const WIDTH = 260;
const HEIGHT = 60;

const MONTH_YEAR = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export function PerformanceSparkline() {
  const fetchHistory = useServerFn(getFundMonthlyHistory);
  const { data } = useQuery({
    queryKey: ["fund-monthly-history"],
    queryFn: () => fetchHistory(),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  if (!data || !data.series || data.series.length < 2) return null;

  const series = data.series;
  const vals = series.map((p) => p.smif_growth);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const stepX = WIDTH / (series.length - 1);

  const points = series
    .map((p, i) => {
      const x = i * stepX;
      const y = HEIGHT - ((p.smif_growth - min) / range) * HEIGHT;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = series[series.length - 1];
  const lastX = (series.length - 1) * stepX;
  const lastY = HEIGHT - ((last.smif_growth - min) / range) * HEIGHT;
  const multiple = last.smif_growth;

  return (
    <div className="flex flex-col items-start md:items-end gap-2">
      <svg
        viewBox={`0 -4 ${WIDTH} ${HEIGHT + 8}`}
        width={WIDTH}
        height={HEIGHT + 8}
        aria-hidden="true"
        className="overflow-visible"
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={lastX} cy={lastY} r={2.75} fill="var(--gold)" />
      </svg>
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        $1 → ${multiple.toFixed(2)} since {MONTH_YEAR(data.inceptionMonth)}
      </div>
    </div>
  );
}
