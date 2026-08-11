/**
 * A tiny inline trend line for a table row.
 *
 * Deliberately dumb: no axes, no ticks, no tooltip. It answers "which way has
 * this been going" at a glance while the reader is scanning a column of
 * numbers, and nothing more. The precise series lives on the position's
 * research page.
 *
 * Renders nothing at all when there are fewer than two points, so a symbol
 * with no stored history leaves an empty cell rather than a misleading flat
 * line. Purely decorative — `aria-hidden`, with the direction carried in the
 * row's own numbers.
 */
export function Sparkline({
  values,
  width = 64,
  height = 18,
  className = "",
}: {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 1.5;
  const usable = height - pad * 2;

  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = pad + (1 - (v - min) / span) * usable;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
