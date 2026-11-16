import { Link, useLocation, type LinkProps } from "@tanstack/react-router";
import { trailFor } from "@/lib/breadcrumbs";

/**
 * Visible breadcrumbs for every inner page, rendered once in the root layout so a
 * page cannot forget them. It sits in the same Black as the header, directly
 * under it. The matching BreadcrumbList structured data is emitted by each route.
 */
export function BreadcrumbBar() {
  const { pathname } = useLocation();
  const trail = trailFor(pathname);
  if (!trail) return null;

  return (
    <nav aria-label="Breadcrumb" className="border-b border-white/10 bg-ink">
      <ol className="container-prose flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm text-on-dark-secondary">
        <li>
          <Link to="/" className="underline underline-offset-4 hover:text-gold">
            Home
          </Link>
        </li>
        {trail.map((c, i) => (
          <li key={c.name} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {c.to ? (
              <Link
                to={c.to as LinkProps["to"]}
                className="underline underline-offset-4 hover:text-gold"
              >
                {c.name}
              </Link>
            ) : (
              <span aria-current={i === trail.length - 1 ? "page" : undefined}>{c.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
