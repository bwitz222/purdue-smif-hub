import { motion, useReducedMotion } from "framer-motion";
import {
  Children,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

/**
 * ── Why this file no longer fades anything up ───────────────────────────────
 *
 * `Reveal` used to fade-and-lift every block on every page as it scrolled into
 * view. Under the motion system that pass is gone: the hairline sweep on
 * section heads (see SectionRule.tsx) is the only scroll-triggered motion on
 * the site. An institutional site earns trust by being calm, and content that
 * animates simply because it exists is decoration — it clarifies no number, no
 * state change, and no relationship.
 *
 * `Reveal` is kept as a transparent wrapper rather than deleted so the ~40 call
 * sites across eleven routes keep their layout classNames without a mechanical
 * rename. It renders a plain <div>. `delay` and `y` are accepted and ignored.
 *
 * `RevealGroup` / `RevealItem` were repurposed into the ROW CASCADE: rows enter
 * on a 24ms stagger, capped at the first 12, and everything after that appears
 * instantly. Use them for tabular and list data (holdings rows, the research
 * list) — not for cards, sections, or prose.
 */

interface RevealProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  children: ReactNode;
  /** Accepted for call-site compatibility. No longer has any effect. */
  delay?: number;
  /** Accepted for call-site compatibility. No longer has any effect. */
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}

export function Reveal({
  children,
  className,
  as = "div",
  // Swallowed: kept in the signature so existing call sites compile.
  delay: _delay,
  y: _y,
  ...rest
}: RevealProps) {
  // `as` widens the element type, so the spread is typed against the div
  // attribute set and cast at the boundary rather than per call site.
  const Tag = as as "div";
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
}

function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Row cascade — 24ms stagger, capped at the first 12 children. */
export function RevealGroup({
  children,
  stagger = 0.024,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mounted = useHasMounted();
  // Render visible markup for SSR, crawlers, and no-JS: never ship opacity:0.
  if (reduce || !mounted) return <div className={className}>{children}</div>;

  const count = Math.max(1, Children.count(children));
  // Cap the total cascade at 12 rows' worth (~288ms). Row 13 onward inherits
  // the parent's `visible` state immediately, so a 40-row table doesn't spend
  // a second filling in.
  const cappedStagger = Math.min(stagger, (stagger * 12) / count);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: cappedStagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  y = 8,
  className,
}: {
  children: ReactNode;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mounted = useHasMounted();
  if (reduce || !mounted) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
