import { useEffect, useRef, useState } from "react";

/**
 * Fires once, the first time the element enters the viewport, then disconnects.
 *
 * Deliberately not framer-motion's `useInView`: this is used by the hairline
 * sweep on every section head, and a page can carry a dozen of them. A bare
 * IntersectionObserver that unobserves itself is a fraction of the cost, and
 * the sweep is a CSS transition rather than a per-frame animation.
 *
 * SSR-safe: returns `false` on the server and on the first client render, so
 * hydration matches. Callers must render readable content regardless — the
 * sweep is presentational, and nothing may be gated behind it.
 */
export function useInViewOnce<T extends Element = HTMLDivElement>(
  amount = 0.2,
): { ref: React.RefObject<T | null>; inView: boolean } {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver (very old browsers, some test runners): show the
    // resting state immediately rather than leaving the element unswept.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  return { ref, inView };
}
