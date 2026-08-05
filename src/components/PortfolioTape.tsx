import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLiveQuotes } from "@/lib/quotes.functions";
import { liveQueryOptions } from "@/lib/live-query";
import { applyQuotes, baseHoldings } from "@/lib/portfolio";

/**
 * Day tape — a continuous marquee of day-change quotes across the book.
 *
 * This is the one piece of ambient motion on the site, and it earns its place
 * because the movement IS the information: a tape that scrolls is how a reader
 * knows these are live positions rather than a screenshot of a spreadsheet.
 *
 * The marquee itself (40s linear, paused on hover and on keyboard focus,
 * stopped entirely under prefers-reduced-motion) lives in styles.css as
 * .ticker-wrap / .ticker-inner.
 *
 * Accessibility: the scrolling track is aria-hidden and duplicated (the
 * animation translates -50%, so the second copy is what makes the loop
 * seamless — a screen reader would otherwise read every ticker twice). A
 * single sr-only sentence carries the same facts in a readable form.
 */
export function PortfolioTape({ className = "" }: { className?: string }) {
  const fetchQuotes = useServerFn(getLiveQuotes);
  const symbols = useMemo(() => baseHoldings.map((h) => h.symbol), []);
  const { data: quoteData } = useQuery({
    queryKey: ["live-quotes", symbols],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    ...liveQueryOptions,
  });

  // Falls back to the static day-change figures in src/data/holdings.ts when
  // there are no live quotes, so the tape is never an empty strip.
  const rows = useMemo(
    () => applyQuotes(baseHoldings, quoteData?.quotes ?? {}),
    [quoteData],
  );

  const advancing = rows.filter((r) => r.dayChange > 0).length;
  const declining = rows.filter((r) => r.dayChange < 0).length;

  return (
    <div className={`ticker-wrap border-y border-white/10 bg-ink/60 ${className}`}>
      <p className="sr-only">
        Day change across {rows.length} positions: {advancing} advancing, {declining} declining.
      </p>
      <div className="ticker-inner py-2" aria-hidden="true">
        {[0, 1].map((copy) => (
          <span key={copy} className="inline-flex shrink-0">
            {rows.map((h) => (
              <span
                key={`${copy}-${h.symbol}`}
                className="inline-flex items-baseline gap-2 px-5 font-mono text-[11px] tracking-[0.06em]"
              >
                <span className="font-semibold text-gold">{h.symbol}</span>
                <span className="text-on-dark-muted tabular-nums">{h.price.toFixed(2)}</span>
                <span
                  className={`tabular-nums ${h.dayChange >= 0 ? "text-gain-on-dark" : "text-loss-on-dark"}`}
                >
                  {h.dayChange >= 0 ? "▲" : "▼"}
                  {Math.abs(h.dayChange).toFixed(2)}%
                </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
