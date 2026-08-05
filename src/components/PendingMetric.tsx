/**
 * A metric that does not have a value yet — designed as a state, not an error.
 *
 * "Not yet computed" printed four times in a row where figures should be reads
 * as a broken page. It isn't: those metrics need a history window the fund
 * hasn't accumulated, and saying so plainly is more credible than hiding the
 * tile. So instead of a value slot holding an apology, this renders a hairline
 * where the figure will land plus a sentence explaining what has to happen
 * first.
 *
 * Use `reason` for the mechanism ("Needs 60 sessions of daily history") and
 * `eta` for anything concrete about when ("41 sessions recorded so far").
 */
export function PendingMetric({
  label,
  reason,
  eta,
}: {
  label: string;
  reason: string;
  eta?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-dashed border-border bg-card/60 p-6 lg:p-7">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      {/* Where the figure will sit once there's one to show. */}
      <div className="mt-4 mb-3 h-px w-16 bg-border" aria-hidden="true" />
      <p className="text-sm leading-relaxed text-muted-foreground">{reason}</p>
      {eta && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {eta}
        </p>
      )}
    </div>
  );
}
