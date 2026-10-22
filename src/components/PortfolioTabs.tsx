import { Link } from "@tanstack/react-router";
import { NAV, isGroup } from "@/lib/nav";

const PORTFOLIO = NAV.find((i) => isGroup(i) && i.label === "Portfolio");
const TABS = PORTFOLIO && isGroup(PORTFOLIO) ? PORTFOLIO.children : [];

/**
 * Local tab bar shared by /holdings, /performance and /sectors, so the three
 * read as one product, the way the header groups them under "Portfolio".
 */
export function PortfolioTabs() {
  return (
    <nav aria-label="Portfolio" className="border-b border-border bg-background">
      <div className="container-prose flex items-center gap-6 overflow-x-auto scrollbar-hide">
        <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:inline">
          Portfolio
        </span>
        <ul className="flex gap-1">
          {TABS.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                className="relative inline-flex min-h-12 items-center px-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-transparent"
                activeProps={{ className: "!text-ink after:!bg-gold" }}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
