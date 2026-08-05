import type { ReactNode } from "react";
import { useInViewOnce } from "@/lib/use-in-view-once";

/**
 * The section head primitive: an optional eyebrow over a 2px gold hairline
 * that sweeps in from the left when the section enters the viewport.
 *
 * This is the ONLY scroll-triggered motion in the system. It replaced the
 * fade-up-everything pass that used to run on every block of every page — see
 * the note at the top of Reveal.tsx.
 *
 * `index` staggers rules down a long section by 140ms each, capped so a page
 * with many heads doesn't end up waiting seconds for the last one.
 */
export function SectionRule({
  eyebrow,
  index = 0,
  width = "2.5rem",
  className = "",
  children,
}: {
  eyebrow?: ReactNode;
  index?: number;
  /** Rule width. Use "100%" for full-bleed section dividers. */
  width?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.2);
  const delay = Math.min(index, 4) * 140;

  return (
    <div ref={ref} className={className}>
      <span
        aria-hidden="true"
        className="hairline-sweep"
        data-swept={inView ? "true" : "false"}
        style={{ width, ["--sweep-delay" as string]: `${delay}ms` }}
      />
      {eyebrow && (
        <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
          {eyebrow}
        </span>
      )}
      {children}
    </div>
  );
}

/**
 * The rule on its own, for dropping in above an existing heading without
 * restructuring the markup around it. Same 620ms sweep, same stagger.
 */
export function SweepRule({
  index = 0,
  width = "2.5rem",
  className = "",
}: {
  index?: number;
  width?: string;
  className?: string;
}) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>(0.2);
  const delay = Math.min(index, 4) * 140;
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`hairline-sweep ${className}`}
      data-swept={inView ? "true" : "false"}
      style={{ width, ["--sweep-delay" as string]: `${delay}ms` }}
    />
  );
}

/**
 * Same sweep, tuned for dark grounds where `--gold-deep` would be unreadable.
 */
export function SectionRuleOnDark({
  eyebrow,
  index = 0,
  width = "2.5rem",
  className = "",
  children,
}: {
  eyebrow?: ReactNode;
  index?: number;
  width?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.2);
  const delay = Math.min(index, 4) * 140;

  return (
    <div ref={ref} className={className}>
      <span
        aria-hidden="true"
        className="hairline-sweep"
        data-swept={inView ? "true" : "false"}
        style={{ width, ["--sweep-delay" as string]: `${delay}ms` }}
      />
      {eyebrow && (
        <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          {eyebrow}
        </span>
      )}
      {children}
    </div>
  );
}
