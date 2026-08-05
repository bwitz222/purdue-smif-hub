import type { PerfRow } from "@/lib/fund-performance.functions";

type Analytics = {
  cumulative_return_pct: number;
  annualized_return_pct: number;
  annualized_alpha_pct: number;
  information_ratio: number;
  beta: number;
  observations: number;
};

const pct1 = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
const ratio = (v: number) => v.toFixed(2);

/**
 * The honest sentence, composed from the live analytics.
 *
 * The page reports a large cumulative return alongside negative annualized
 * alpha and a negative information ratio. Sophisticated readers — the alumni
 * and recruiters this site most wants — will notice the tension immediately,
 * and a page that reports both figures without acknowledging the gap looks
 * either naive or evasive. Neither is what the fund is.
 *
 * So the lede states the tension before the grid does, and every branch of it
 * is derived: alpha positive or negative, ahead of or behind the index,
 * winning more calendar years than not. A future data refresh can move any of
 * these numbers without ever producing a sentence the metric grid contradicts.
 * Intellectual honesty is already in the mission copy; this is the layout
 * demonstrating it.
 */
export function PerformanceLede({
  analytics,
  rows,
  inceptionLabel,
  benchGrowth,
  fundGrowth,
}: {
  analytics: Analytics;
  rows: PerfRow[];
  inceptionLabel: string;
  /** Growth of $1 in the benchmark, since inception. */
  benchGrowth: number;
  /** Growth of $1 in the fund, since inception. */
  fundGrowth: number;
}) {
  const years = rows.length;
  const wins = rows.filter((r) => r.smif_return > r.bench_return).length;
  const aheadOfIndex = fundGrowth >= benchGrowth;
  const alphaPositive = analytics.annualized_alpha_pct >= 0;
  const irPositive = analytics.information_ratio >= 0;

  return (
    <section aria-labelledby="perf-lede" className="border-l-2 border-gold pl-6 md:pl-8">
      <h2
        id="perf-lede"
        className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep"
      >
        Where the fund actually stands
      </h2>

      <p
        className="mt-5 max-w-4xl font-display font-bold leading-[1.15] text-ink"
        style={{ fontSize: "clamp(1.4rem, 2.6vw, 2.25rem)" }}
      >
        Since {inceptionLabel}, $1 in the fund has become ${fundGrowth.toFixed(2)} — against $
        {benchGrowth.toFixed(2)} in the S&amp;P 500.{" "}
        {aheadOfIndex ? (
          <>That is ahead of the index in absolute terms.</>
        ) : (
          <>That is behind the index in absolute terms.</>
        )}
      </p>

      <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
        {years > 0 && (
          <>
            The fund beat the benchmark in {wins} of {years} calendar year
            {years === 1 ? "" : "s"}.{" "}
          </>
        )}
        {alphaPositive && irPositive ? (
          <>
            Risk-adjusted, that holds up: annualized alpha is {pct1(analytics.annualized_alpha_pct)}{" "}
            against a beta of {ratio(analytics.beta)}, and the information ratio is{" "}
            {ratio(analytics.information_ratio)} — the fund is being paid for the active risk it
            takes.
          </>
        ) : (
          <>
            On a risk-adjusted basis it does not: annualized alpha is{" "}
            {pct1(analytics.annualized_alpha_pct)} against a beta of {ratio(analytics.beta)}, and
            the information ratio is {ratio(analytics.information_ratio)}. In plain terms, most of
            the return has come from market exposure rather than from stock selection, and the
            active bets have not yet paid for the risk they carry.
          </>
        )}{" "}
        We publish both numbers because a student fund that only reports the flattering one is not
        teaching anybody anything. Everything below is the evidence, computed from{" "}
        {analytics.observations} months of returns.
      </p>
    </section>
  );
}
