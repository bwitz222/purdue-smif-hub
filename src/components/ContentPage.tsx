import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { formatLongDate } from "@/lib/content-routes";
import type { Faq } from "@/lib/content-ld";

// Shared layout for the explanatory pages (pillar, prep guides, pitches,
// glossary): a Black title band with breadcrumbs, then a single readable column.
// It exists so those pages look and read the same and so the document outline is
// right everywhere: one h1 in the hero, h2 per section, h3 inside sections.

/** Inline link inside body copy. Aged Gold passes AA on the White page surface. */
export const PROSE_LINK = "link-underline font-bold text-gold-deep hover:text-ink";

type Crumb = { name: string; to?: LinkProps["to"] };

export function ContentHero({
  h1,
  lead,
  crumbs,
}: {
  h1: string;
  lead: string;
  crumbs: readonly Crumb[];
}) {
  return (
    <section className="bg-ink text-background">
      <div className="container-prose section-y max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-on-dark-secondary">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link to="/" className="underline underline-offset-4 hover:text-gold">
                Home
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {c.to ? (
                  <Link to={c.to} className="underline underline-offset-4 hover:text-gold">
                    {c.name}
                  </Link>
                ) : (
                  <span aria-current={i === crumbs.length - 1 ? "page" : undefined}>{c.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <span className="rule-gold mb-6" />
        <h1
          className="font-display font-bold text-background"
          style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: "1.05" }}
        >
          {h1}
        </h1>
        <p className="mt-6 text-lg text-on-dark-secondary">{lead}</p>
      </div>
    </section>
  );
}

/** The readable column. `updated` renders the visible last-changed date. */
export function ContentBody({ children, updated }: { children: ReactNode; updated: string }) {
  return (
    <article className="container-prose section-y">
      <div className="mx-auto max-w-3xl space-y-14">
        <p className="text-sm">
          Updated <time dateTime={updated}>{formatLongDate(updated)}</time>
        </p>
        {children}
      </div>
    </article>
  );
}

export function ProseSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="section-anchor space-y-5">
      <h2 id={`${id}-h`} className="font-display text-3xl font-bold text-ink md:text-4xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FaqSection({ id = "faq", faq }: { id?: string; faq: readonly Faq[] }) {
  return (
    <ProseSection id={id} title="Common questions">
      <div className="divide-y divide-border border-y border-border">
        {faq.map((f) => (
          <div key={f.q} className="py-5">
            <h3 className="font-display text-xl font-bold text-ink">{f.q}</h3>
            <p className="mt-2">{f.a}</p>
          </div>
        ))}
      </div>
    </ProseSection>
  );
}

export function NextSteps({
  title = "Keep going",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby="next-h" className="border-t border-ink pt-8">
      <h2 id="next-h" className="font-display text-3xl font-bold text-ink md:text-4xl">
        {title}
      </h2>
      <ul className="mt-5 space-y-3 list-disc pl-5 marker:text-gold-deep">{children}</ul>
    </section>
  );
}
