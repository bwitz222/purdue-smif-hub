import { useEffect, useRef, useState } from "react";

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

/** Ease-out that settles gently, close to the site's cubic-bezier(0.22, 1, 0.36, 1). */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

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
  const [inView, setInView] = useState(false);
  // First render (server + client hydration) always shows the final value.
  const [display, setDisplay] = useState(to);
  const current = useRef(to);
  const startedRef = useRef(false);

  // Once: the first time the number is 10% inside the viewport edges.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "-10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Before the count-up runs (not in view yet) or when reduced-motion is on,
    // always show the current final value. This keeps late/updated `to` values
    // (e.g. a live-quote refresh changing a KPI) in sync instead of leaving the
    // first-paint number frozen on screen.
    if (!inView || reduce) {
      current.current = to;
      setDisplay(to);
      return;
    }

    // First time in view we count up from `from`; on later `to` changes we
    // animate from the number on screen so the headline tracks the new data.
    const start = startedRef.current ? current.current : from;
    startedRef.current = true;

    let raf = 0;
    let t0: number | null = null;
    // The first frame keeps the final value painted; the animation starts on the
    // next one by jumping back to the start.
    const step = (now: number) => {
      if (t0 === null) t0 = now;
      const p = Math.min(1, (now - t0) / (duration * 1000));
      const value = p >= 1 ? to : start + (to - start) * easeOut(p);
      current.current = value;
      setDisplay(value);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, from, duration]);

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
