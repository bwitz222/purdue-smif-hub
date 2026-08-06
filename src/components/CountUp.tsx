import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Format the numeric value. Receives the current number, returns a string. */
  format?: (n: number) => string;
  className?: string;
}

/**
 * Animates a number from `from` to `to`.
 *
 * SSR safety: the server-rendered HTML AND the first client render both
 * commit the FINAL formatted value (`to`). Crawlers, social preview
 * scrapers, and no-JS users always see the real resting number — never 0
 * and never a mid-animation frame.
 *
 * The count-up animation is a purely client-side visual effect that starts
 * only after hydration + first paint (deferred via requestAnimationFrame,
 * gated by IntersectionObserver). If the user prefers reduced motion, we
 * skip the animation entirely and leave the final value on screen.
 */
export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  format,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(to);
  // First render (server + client hydration) always shows the final value.
  const [display, setDisplay] = useState(to);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Before the count-up runs (not in view yet) or when reduced-motion is on,
    // always show the current final value. This keeps late/updated `to` values
    // (e.g. a live-quote refresh changing a KPI) in sync instead of leaving the
    // first-paint number frozen on screen.
    if (!inView || reduce) {
      setDisplay(to);
      return;
    }

    // The entrance count runs ONCE. These KPIs are seeded with fallback values
    // and then replaced when the fund-stats query resolves, typically a second
    // or two after load. Re-animating on that swap made every number count up,
    // rest, then visibly count a second time — a jump long after the page
    // looked settled. Once the entrance has completed, later data lands
    // silently on screen.
    if (finishedRef.current) {
      mv.set(to);
      setDisplay(to);
      return;
    }

    // Defer to the next animation frame so the first paint keeps the
    // final value; only then do we jump back to the start and animate up.
    // If `to` changes while the entrance is still in flight we retarget from
    // the current value rather than restarting, so the number keeps moving.
    const start = startedRef.current ? mv.get() : from;
    startedRef.current = true;

    // Only re-render when the *formatted* value would actually change.
    // onUpdate fires every frame, but a stat like "10 sector teams" has ten
    // distinct states across sixty frames; the rest were wasted renders.
    const precision = 10 ** decimals;
    const quantize = (v: number) => Math.round(v * precision) / precision;

    let stop: (() => void) | undefined;
    const raf = requestAnimationFrame(() => {
      mv.set(start);
      setDisplay(quantize(start));
      const controls = animate(mv, to, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => {
          const next = quantize(v);
          setDisplay((prev) => (prev === next ? prev : next));
        },
        onComplete: () => {
          finishedRef.current = true;
          // Pin the exact target. The final onUpdate can land a hair short of
          // `to`, and quantizing that would rest the stat one unit low.
          setDisplay(to);
        },
      });
      stop = () => controls.stop();
    });

    return () => {
      cancelAnimationFrame(raf);
      stop?.();
    };
  }, [inView, to, from, duration, decimals, mv]);

  const formatted = format
    ? format(display)
    : `${prefix}${display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
