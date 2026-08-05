import type { ReactNode } from "react";

export type MetricTier = "lead" | "support" | "footnote";
export type MetricTone = "positive" | "negative" | "neutral";

const toneClass = (tone: MetricTone) =>
  tone === "positive" ? "text-gain" : tone === "negative" ? "text-loss" : "text-ink";

/**
 * One metric, at one of three weights.
 *
 * A wall of identically-sized tiles tells a reader that every number matters
 * equally, which is never true. `lead` carries the figure the page is about,
 * `support` carries the evidence, and `footnote` carries the numbers a
 * sophisticated reader will want but nobody scans for. Same data, stated
 * hierarchy.
 */
export function MetricTile({
  label,
  value,
  sub,
  tone = "neutral",
  tier = "support",
  asOf,
  hint,
  children,
}: {
  label: string;
  /** The formatted figure. Ignored when `children` is supplied. */
  value?: string;
  sub?: string;
  tone?: MetricTone;
  tier?: MetricTier;
  asOf?: string;
  /** Plain-language explanation, surfaced as a title attribute. */
  hint?: string;
  /** Custom value rendering (e.g. a CountUp). Replaces `value`. */
  children?: ReactNode;
}) {
  if (tier === "footnote") {
    return (
      <div className="flex items-baseline justify-between gap-3 bg-card px-5 py-3.5" title={hint}>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className={`font-mono text-sm font-semibold tabular-nums ${toneClass(tone)}`}>
          {children ?? value}
        </span>
      </div>
    );
  }

  const size = tier === "lead" ? "text-4xl lg:text-5xl" : "text-2xl";

  return (
    <div
      className="hover-raise flex flex-col gap-1 border border-border bg-card p-6 lg:p-7"
      title={hint}
    >
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className={`font-display font-bold ${size} mt-1 ${toneClass(tone)}`}>
        {children ?? value}
      </div>
      {sub && <div className="mt-0.5 font-mono text-xs text-muted-foreground">{sub}</div>}
      {asOf && (
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          As of {asOf}
        </div>
      )}
    </div>
  );
}
