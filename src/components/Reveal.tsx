import type { ReactNode } from "react";

/**
 * Layout wrappers kept from the old scroll-reveal system.
 *
 * Every section used to fade up as it scrolled into view. That is one effect
 * repeated everywhere, and it hid content until JS ran. The site now has a
 * single entrance (the home hero, in CSS) and responses to user actions, so
 * these render plain, always-visible blocks. The names and props stay so route
 * files keep their structure; `delay`, `y` and `stagger` are accepted and
 * ignored.
 */
interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function Reveal({ children, className }: RevealProps) {
  return <div className={className}>{children}</div>;
}

export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  y?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
