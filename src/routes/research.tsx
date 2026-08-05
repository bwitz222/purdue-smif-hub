import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Download, ExternalLink, Rss, Search } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { SweepRule } from "@/components/SectionRule";
import { socialMeta, canonical, breadcrumbLd, OG_RESEARCH } from "@/lib/seo";
import { getPublications, type PublicationRow } from "@/lib/publications.functions";

const SUBSTACK_URL = "https://purduesmif.substack.com";

export const Route = createFileRoute("/research")({
  // SSR loader — the publications list is fetched on the server so the
  // page renders fully-formed HTML (no client-side loading spinner, fully
  // indexable by crawlers). Client-side search/sort still operate on the
  // returned array.
  loader: async (): Promise<{ pubs: PublicationRow[] }> => ({ pubs: await getPublications() }),
  component: Research,
  head: () => ({
    meta: [
      { title: "Equity Research Reports & Publications | Purdue SMIF" },
      { name: "description", content: "Equity research, single-name stock pitches, semester performance reviews, and annual reports authored by Purdue SMIF analysts and curated by fund leadership." },
      ...socialMeta({
        title: "Equity Research & Reports | Purdue SMIF",
        description: "Read SMIF's equity research pitches, semester performance reviews, and annual reports.",
        url: canonical("/research"),
        image: OG_RESEARCH,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/research") }],
    scripts: [breadcrumbLd("Research", "/research")],
  }),
});

type Category = "equity_research" | "semester" | "annual";
type SortKey = "newest" | "oldest" | "title";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "equity_research", label: "Equity Research" },
  { value: "semester", label: "Semester Reports" },
  { value: "annual", label: "Annual Reports" },
];

const CATEGORY_LABEL: Record<Category, string> = {
  equity_research: "Equity Research",
  semester: "Semester Report",
  annual: "Annual Report",
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// The sample AMZN files carry a real created_at from when they were seeded,
// which isn't when the work was done. Label them by term instead of by row
// timestamp.
function displayDate(pub: PublicationRow): string {
  if (/sample/i.test(pub.title)) return "Spring 2026";
  return new Date(pub.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * What's coming, stated plainly.
 *
 * A library this small looks broken when it's presented as three category
 * grids that happen to be empty. Naming the next drop makes the same sparseness
 * read as a publishing schedule that hasn't come round yet — which is what it
 * is. Update this whenever a cycle closes.
 */
const NEXT_REPORT = {
  title: "Fall 2026 semester review",
  due: "December 2026",
  note: "End-of-term performance and attribution land here once the semester closes, followed by the annual report after the fiscal-year audit.",
};

function Research() {
  const { pubs } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo<PublicationRow[]>(() => {
    const q = query.trim().toLowerCase();
    let base = category === "all" ? pubs : pubs.filter((p) => p.category === category);
    if (q) {
      base = base.filter(
        (p: PublicationRow) =>
          p.title.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...base];
    if (sort === "newest") sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    else if (sort === "oldest") sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    else sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [pubs, query, sort, category]);

  // The newest publication carries the page; the rest are the list beneath it.
  // Only feature when nothing is filtered — a "latest" block that changes as
  // you type is a search result wearing a hat.
  const isUnfiltered = category === "all" && query.trim() === "";
  const featured = useMemo<PublicationRow | null>(() => {
    if (!isUnfiltered || pubs.length === 0) return null;
    return [...pubs].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];
  }, [pubs, isUnfiltered]);
  const listed = featured ? filtered.filter((p) => p.id !== featured.id) : filtered;

  const jsonLd = useMemo(() => {
    if (pubs.length === 0) return null;
    const ld = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: pubs.map((p: PublicationRow, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Article",
          headline: p.title,
          description: p.description ?? "",
          datePublished: p.created_at,
          publisher: { "@id": "https://www.purduesmif.org/#organization" },
        },
      })),
    });
    // Escape "<" so a "</script>" sequence inside any title/description can't
    // break out of the ld+json <script> block (defense-in-depth; publication
    // content is admin-curated, but writes could be re-opened in future).
    return ld.replace(/</g, "\\u003c");
  }, [pubs]);

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Research</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Reports & research from the fund.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Browse equity research, semester performance reviews, and annual reports authored by SMIF members. This library is view-only and curated by fund leadership.
          </p>
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noreferrer"
            className="press mt-8 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-background hover:bg-ink/90"
          >
            <Rss className="h-4 w-4" /> Read us on Substack
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>
      </section>

      <section className="container-prose py-16">
        {/* One featured publication, then a compact list. The old shell — three
            category headers, a sort control, and a filter row — was larger than
            the library it governed, and four files spread across 3:4 card
            tiles read as an empty grid rather than a deliberate one. */}
        {featured && (
          <article className="mb-12 border-t-2 border-gold bg-card">
            <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:gap-10 md:p-8">
              <div className="flex items-start gap-3">
                <FileText className="h-8 w-8 shrink-0 text-gold-deep" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
                    Latest · {CATEGORY_LABEL[featured.category]}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {displayDate(featured)}
                    {formatBytes(featured.file_size) && ` · ${formatBytes(featured.file_size)}`}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">
                  {featured.title}
                </h2>
                {featured.description && (
                  <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                    {featured.description}
                  </p>
                )}
                <a
                  href={featured.url}
                  target="_blank"
                  rel="noreferrer"
                  className="press group mt-5 inline-flex items-center gap-2 border border-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-ink hover:text-background"
                >
                  <Download className="icon-pop h-3.5 w-3.5" aria-hidden="true" />
                  Read the report
                </a>
              </div>
            </div>
          </article>
        )}

        {/* One control row, not three headers plus two controls. */}
        <SweepRule className="mb-4" />
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {[{ value: "all" as const, label: "All" }, ...CATEGORIES].map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  aria-pressed={active}
                  className={`press inline-flex min-h-11 items-center border px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                    active
                      ? "border-ink bg-ink text-background"
                      : "border-border bg-background text-foreground hover:border-ink hover:bg-secondary"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports…"
                aria-label="Search reports"
                className="w-full border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
              />
            </div>
            <label className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="sr-only sm:not-sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort reports"
                className="min-h-11 border border-input bg-background px-2 text-xs font-medium tracking-normal text-foreground outline-none focus:border-gold"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </label>
          </div>
        </div>

        {/* The library itself: a dated list. */}
        {listed.length > 0 ? (
          <RevealGroup className="divide-y divide-border border-b border-border">
            {listed.map((p) => (
              <RevealItem key={p.id}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group row-rail -mx-2 flex flex-col gap-1 px-2 py-5 transition-colors hover:bg-secondary/40 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-gold-deep">
                    {displayDate(p)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold leading-tight">
                      {p.title}
                    </span>
                    {p.description && (
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {p.description}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {CATEGORY_LABEL[p.category]}
                    {formatBytes(p.file_size) && <span>{formatBytes(p.file_size)}</span>}
                    <Download className="icon-pop h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">Download (opens in a new tab)</span>
                  </span>
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <p className="border-b border-border py-10 text-sm text-muted-foreground">
            {query
              ? `Nothing matches "${query}".`
              : "Nothing published in this category yet — see what's next below."}
          </p>
        )}

        {/* One explicit "next report drops" line, replacing three empty grids
            in three tabs. Sparse on purpose reads better than sparse by
            accident. */}
        <div className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-l-2 border-gold bg-secondary/40 px-5 py-4">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
            Next report
          </span>
          <span className="font-display text-lg font-bold">{NEXT_REPORT.title}</span>
          <span className="font-mono text-sm text-muted-foreground">{NEXT_REPORT.due}</span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {NEXT_REPORT.note}{" "}
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noreferrer"
            className="link-underline font-medium text-gold-deep hover:text-gold"
          >
            Interim writeups go out on Substack
          </a>
          .
        </p>
      </section>
    </>
  );
}
