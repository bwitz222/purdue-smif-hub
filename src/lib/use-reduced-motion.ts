import { useEffect, useState } from "react";

/**
 * True when the visitor prefers reduced motion. False during server rendering and
 * the first client render, then follows the media query, including live changes.
 * This replaces framer-motion's hook so the library is not shipped for one query.
 */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}
