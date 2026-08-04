import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useInViewOnce } from "@/lib/use-in-view-once";

/**
 * Drives the chart-draw motion for recharts.
 *
 * Charts draw left to right **on first view only**. Recharts re-runs its
 * entrance animation whenever the series data changes, which on /performance
 * means every Growth/Drawdown/Rolling toggle would replay a 1.6s draw — the
 * "counters that re-run on every scroll pass" problem, in chart form. So:
 *
 *   1. `active` is false until the chart enters the viewport,
 *   2. it turns on for exactly one draw,
 *   3. then latches off, so every later re-render paints instantly.
 *
 * Under `prefers-reduced-motion` it never turns on at all: the chart appears
 * already drawn, which is the correct resting state, not a degraded one.
 *
 * Usage:
 *   const { ref, active } = useDrawOnce();
 *   <div ref={ref}><ResponsiveContainer>
 *     <Line isAnimationActive={active} animationDuration={1600} />
 *     <Line isAnimationActive={active} animationDuration={1600} animationBegin={120} />
 *   </ResponsiveContainer></div>
 */
export function useDrawOnce(durationMs = 1600) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.15);
  const [done, setDone] = useState(false);

  const active = !reduce && inView && !done;

  useEffect(() => {
    if (!active) return;
    // Latch off once the draw (plus the benchmark's 120ms trail) has finished.
    const id = setTimeout(() => setDone(true), durationMs + 200);
    return () => clearTimeout(id);
  }, [active, durationMs]);

  return { ref, active };
}
