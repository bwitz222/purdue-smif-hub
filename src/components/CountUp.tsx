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

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Respect reduced-motion: leave the final value in place.
      return;
    }

    // Defer to the next animation frame so the first paint keeps the
    // final value; only then do we jump back to `from` and animate up.
    // This guarantees we never commit a wrong value to the DOM *before*
    // paint, only as part of the post-hydration visual flourish.
    let stop: (() => void) | undefined;
    const raf = requestAnimationFrame(() => {
      mv.set(from);
      setDisplay(from);
      const controls = animate(mv, to, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (v) => setDisplay(v),
      });
      stop = () => controls.stop();
    });

    return () => {
      cancelAnimationFrame(raf);
      stop?.();
    };
  }, [inView, to, from, duration, mv]);

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
