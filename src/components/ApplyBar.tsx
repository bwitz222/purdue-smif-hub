import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { applyUrl } from "@/lib/apply-url";
import { useCountdown, staticNextEventLabel } from "@/lib/recruiting-calendar";

/**
 * Persistent Apply bar for small screens.
 *
 * The header's Apply button scrolls out of reach on a phone and nothing
 * replaces it, so past the first screen there is no way to act. This slides in
 * once the reader has committed to the page and carries the recruiting
 * deadline with it, so the ask has a reason attached.
 *
 * Mounted globally in __root.tsx rather than per-route, deliberately:
 *  - outside RouteTransition, so navigating does not tear down and restart the
 *    countdown interval;
 *  - outside the layout flex column, so it never affects document flow;
 *  - after the skip link in DOM order, so it cannot steal the first tab stop.
 *
 * Ticks once a minute. The bar only shows days and hours, so a per-second
 * interval would re-render 60× more often than the text changes.
 */

/** Pages whose own primary action is already "apply" — a bar would duplicate it. */
const SUPPRESSED_ON = new Set(["/apply", "/contact"]);

const SHOW_AFTER_PX = 600;

export function ApplyBar() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const countdown = useCountdown(60_000);
  const [visible, setVisible] = useState(false);

  // Toggle on a data attribute via a rAF-throttled scroll listener rather than
  // React state per scroll event — same approach as SiteHeader's scroll shadow.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > SHOW_AFTER_PX);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (SUPPRESSED_ON.has(location.pathname)) return null;

  // Server and first client render both land on the static label, so hydration
  // cannot mismatch; the live countdown replaces it after mount.
  const fallback = staticNextEventLabel();
  const expired = countdown?.expired ?? (countdown === null && fallback.expired);

  let detail: string;
  if (expired) {
    detail = "Next cycle announced here";
  } else if (countdown && !countdown.expired) {
    detail =
      countdown.days > 0
        ? `${countdown.days}d ${countdown.hours}h · ${countdown.event.name}`
        : `${countdown.hours}h ${countdown.minutes}m · ${countdown.event.name}`;
  } else {
    detail = `${fallback.date} · ${fallback.name}`;
  }

  return (
    <div
      data-visible={visible ? "true" : "false"}
      className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-gold bg-ink px-6 pt-3 lg:hidden ${
        reduce ? "" : "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      } ${visible ? "translate-y-0" : "translate-y-full"}`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-on-dark-muted">
          {expired ? "Recruiting closed" : "Fall 2026 recruiting"}
        </div>
        <div className="truncate font-mono text-xs tracking-[0.04em] text-gold">{detail}</div>
      </div>
      <a
        href={applyUrl("mobile-sticky-bar")}
        target="_blank"
        rel="noopener noreferrer"
        className="press inline-flex shrink-0 items-center gap-2 bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink hover:bg-gold-mid"
      >
        Apply
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">(opens application form in new tab)</span>
      </a>
    </div>
  );
}
