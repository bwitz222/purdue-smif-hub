import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { applyUrl, type ApplyPlacement } from "@/lib/apply-url";
import { RECRUITING_EMAIL } from "@/lib/recruiting-calendar";
import { useApplicationsOpen } from "@/lib/use-applications-open";

const UPDATES_HREF = `mailto:${RECRUITING_EMAIL}?subject=${encodeURIComponent(
  "Add me to the SMIF recruiting list",
)}`;

/**
 * The site's single Apply button. While the window is open it links to the
 * Qualtrics form (new tab). While it is closed it never offers a dead form:
 * it goes to /recruiting ("How to join"), or, where the page already links
 * to /recruiting next to it, to an email asking for next-cycle updates.
 */
export function ApplyCta({
  placement,
  className,
  closed = "recruiting",
  openLabel = "Apply to Join",
  icon = true,
  onClick,
}: {
  placement: ApplyPlacement;
  className?: string;
  closed?: "recruiting" | "updates";
  openLabel?: ReactNode;
  icon?: boolean;
  onClick?: () => void;
}) {
  const open = useApplicationsOpen();
  if (open) {
    return (
      <a
        href={applyUrl(placement)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
      >
        {openLabel}
        {icon && <ExternalLink className="h-4 w-4" aria-hidden="true" />}
        <span className="sr-only">(opens application form in new tab)</span>
      </a>
    );
  }
  if (closed === "updates") {
    return (
      <a href={UPDATES_HREF} onClick={onClick} className={className}>
        Get recruiting updates
      </a>
    );
  }
  return (
    <Link to="/recruiting" onClick={onClick} className={className}>
      How to join
    </Link>
  );
}
