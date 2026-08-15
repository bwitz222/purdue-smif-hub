import { useReducedMotion } from "framer-motion";
import { jumpToSection } from "@/lib/jump-to";

export type PageSection = {
  /** Must match the id on the target <section>. */
  id: string;
  /** Short label — the section's heading, trimmed to a noun phrase. */
  label: string;
};

/**
 * In-page section navigation for long routes.
 *
 * Three of these pages now run past a thousand words across seven or more
 * sections, and until now the only way to reach the last one was to scroll or
 * to tab through everything above it.
 *
 * Built on real <a href="#id"> elements rather than buttons, so the links work
 * with JavaScript disabled, can be opened in a new tab, and can have their
 * target copied. The click handler enhances that default with focus management
 * (see jumpToSection) and falls through to native behavior if the target is
 * missing.
 *
 * The visible label is a <span>, deliberately not a heading: the document
 * outline is what this component describes, so adding headings to it would
 * pollute the thing being summarized. The nav is named via aria-label instead,
 * which also makes it a distinct landmark from "Primary" and "Footer".
 */
export function OnThisPage({
  sections,
  className = "",
}: {
  sections: readonly PageSection[];
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (sections.length === 0) return null;

  return (
    <nav aria-label="On this page" className={`border-b border-border bg-background ${className}`}>
      <div className="container-prose flex flex-col gap-3 py-5 md:flex-row md:items-center md:gap-6">
        <span
          aria-hidden="true"
          className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground"
        >
          On this page
        </span>
        {/* Wraps rather than scrolling horizontally: the e2e suite fails any
            page whose document scrollWidth exceeds its clientWidth. */}
        <ul className="flex flex-wrap items-center gap-x-2 gap-y-2">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  if (jumpToSection(s.id, { reduce })) e.preventDefault();
                }}
                className="press inline-flex min-h-11 items-center rounded-full border border-border bg-background px-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground hover:border-ink hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
