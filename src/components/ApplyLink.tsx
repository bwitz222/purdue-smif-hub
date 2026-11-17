import type { MouseEventHandler, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { APPLICATIONS_OPEN, applyUrl, type ApplyPlacement } from "@/lib/apply-url";

/**
 * The one Apply button. While the form is open it leaves for Qualtrics in a new
 * tab; while it is closed it goes to /apply, which says so and explains when
 * the next window opens. Every Apply CTA on the site renders through this, so
 * closing a cycle is one constant in src/lib/apply-url.ts.
 */
export function ApplyLink({
  placement,
  className,
  children,
  icon = true,
  onClick,
}: {
  placement: ApplyPlacement;
  className?: string;
  children: ReactNode;
  /** Trailing icon. Off for the compact header button. */
  icon?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  if (!APPLICATIONS_OPEN) {
    return (
      <Link to="/apply" className={className} onClick={onClick}>
        {children}
        {icon && <ArrowRight className="h-4 w-4 arrow-slide" aria-hidden="true" />}
      </Link>
    );
  }
  return (
    <a
      href={applyUrl(placement)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
      {icon && <ExternalLink className="h-4 w-4" aria-hidden="true" />}
      <span className="sr-only">(opens application form in new tab)</span>
    </a>
  );
}
