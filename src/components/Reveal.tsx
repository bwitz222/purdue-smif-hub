import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}

/**
 * Scroll-triggered fade-up wrapper. Animates once when 15% in view.
 *
 * Renders content visible by default for SSR/no-JS/crawlers — only switches
 * to the framer-motion variant after hydration. This prevents shipping
 * `opacity:0` HTML to anyone whose JS hasn't booted yet.
 */
function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const mounted = useHasMounted();
  const Tag = motion[as] as typeof motion.div;

  if (reduce || !mounted) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay },
    },
  };

  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={variants}
      className={className}
    >
      {children}
    </Tag>
  );
}

/** Stagger children with `<RevealItem>` items inside. */
import { Children } from "react";

export function RevealGroup({
  children,
  stagger = 0.08,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mounted = useHasMounted();
  if (reduce || !mounted) return <div className={className}>{children}</div>;
  // Cap total stagger time at 600ms so long lists don't drag the entrance out.
  const count = Math.max(1, Children.count(children));
  const cappedStagger = Math.min(stagger, 0.6 / count);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: cappedStagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  y = 20,
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
        visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
