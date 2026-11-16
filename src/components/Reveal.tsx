import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";

// Scroll-triggered entrances built on CSS transitions and IntersectionObserver.
// This replaces framer-motion, which cost about 125 KB of JavaScript on every
// page for fade-ups and one bar animation.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * "visible"  server render, no-JS, crawlers, reduced motion: content is shown as is.
 * "hidden"   armed after hydration, waiting to scroll into view.
 * "shown"    in view: transitions to its resting state, once.
 *
 * Content is visible by default so nobody whose JavaScript has not booted (or who
 * has asked for reduced motion) is ever handed opacity:0 HTML.
 */
type Phase = "visible" | "hidden" | "shown";

/** Fine-grained thresholds so an element taller than the viewport still fires. */
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReveal<T extends HTMLElement>(amount: number): [RefObject<T | null>, Phase] {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<Phase>("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    setPhase("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Either a fraction of the element is visible, or the visible part fills
          // that fraction of the viewport (an element taller than the screen can
          // never reach the first condition).
          const viewport = e.rootBounds?.height ?? window.innerHeight;
          if (
            e.isIntersecting &&
            (e.intersectionRatio >= amount || e.intersectionRect.height >= viewport * amount)
          ) {
            setPhase("shown");
            io.disconnect();
            return;
          }
        }
      },
      { threshold: THRESHOLDS },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  return [ref, phase];
}

function fadeUpStyle(phase: Phase, y: number, duration: number, delay: number) {
  if (phase === "visible") return undefined;
  if (phase === "hidden") return { opacity: 0, transform: `translateY(${y}px)` } as CSSProperties;
  const t = `${duration}s ${EASE} ${delay}s`;
  return { opacity: 1, transform: "none", transition: `opacity ${t}, transform ${t}` };
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

/** Scroll-triggered fade-up wrapper. Animates once when 15% in view. */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const [ref, phase] = useReveal<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={className} style={fadeUpStyle(phase, y, 0.72, delay)}>
      {children}
    </div>
  );
}

type GroupState = { phase: Phase; stagger: number; next: () => number };
const GroupContext = createContext<GroupState | null>(null);

/** Stagger children with `<RevealItem>` items inside. */
export function RevealGroup({
  children,
  stagger = 0.08,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  const [ref, phase] = useReveal<HTMLDivElement>(0.15);
  const counter = useRef(0);
  // Cap total stagger time at 600ms so long lists don't drag the entrance out.
  const count = Math.max(1, Children.count(children));
  const value: GroupState = {
    phase,
    stagger: Math.min(stagger, 0.6 / count),
    next: () => counter.current++,
  };
  return (
    <GroupContext.Provider value={value}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </GroupContext.Provider>
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
  const group = useContext(GroupContext);
  const [index] = useState(() => group?.next() ?? 0);
  if (!group) return <div className={className}>{children}</div>;
  // Items that mount after the group (a list being filtered) never wait longer
  // than the 600ms ceiling.
  const delay = Math.min(index * group.stagger, 0.6);
  return (
    <div className={className} style={fadeUpStyle(group.phase, y, 0.62, delay)}>
      {children}
    </div>
  );
}

/**
 * A bar that grows from its left edge when scrolled into view. The caller sets
 * the final width; this only animates scaleX from 0 to 1.
 */
export function GrowBar({
  width,
  delay = 0,
  className,
}: {
  width: string;
  delay?: number;
  className?: string;
}) {
  const [ref, phase] = useReveal<HTMLDivElement>(0.4);
  const style: CSSProperties = { width };
  if (phase === "hidden") style.transform = "scaleX(0)";
  if (phase === "shown") {
    style.transform = "scaleX(1)";
    style.transition = `transform 0.9s ${EASE} ${delay}s`;
  }
  return <div ref={ref} className={`origin-left ${className ?? ""}`} style={style} />;
}
