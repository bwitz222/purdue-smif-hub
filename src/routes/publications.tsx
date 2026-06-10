import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Download, ExternalLink, Rss, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { socialMeta, canonical } from "@/lib/seo";
import { getPublications, type PublicationRow } from "@/lib/publications.functions";

const SUBSTACK_URL = "https://purduesmif.substack.com";

export const Route = createFileRoute("/publications")({
  // SSR loader — the publications list is fetched on the server so the
  // page renders fully-formed HTML (no client-side loading spinner, fully
  // indexable by crawlers). Client-side search/sort still operate on the
  // returned array.
  loader: async () => ({ pubs: await getPublications() }),
  component: Publications,
  head: () => ({
    meta: [
      { title: "Publications & Reports — Purdue SMIF" },
      { name: "description", content: "Equity research reports, semester reports, and annual reports from the Purdue Student Managed Investment Fund." },
      ...socialMeta({
        title: "Equity Research & Reports — Purdue SMIF",
        description: "Read SMIF's equity research pitches, semester performance reviews, and annual reports.",
        url: canonical("/publications"),
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/publications") }],
  }),
});

type Category = "equity_research" | "semester" | "annual";
type SortKey = "newest" | "oldest" | "title";

const CATEGORIES: { value: Category; label: string; description: string }[] = [
  { value: "equity_research", label: "Equity Research", description: "Single-name pitches and deep-dive analyst reports." },
  { value: "semester", label: "Semester Reports", description: "End-of-semester performance and attribution reviews." },
  { value: "annual", label: "Annual Reports", description: "Comprehensive yearly reports to the Daniels School and stakeholders." },
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

function Publications() {
  const { pubs } = useLoaderData({ from: "/publications" });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? pubs.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.description ?? "").toLowerCase().includes(q),
        )
      : pubs;
    const sorted = [...base];
    if (sort === "newest") sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    else if (sort === "oldest") sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    else sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [pubs, query, sort]);

  const jsonLd = useMemo(() => {
    if (pubs.length === 0) return null;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: pubs.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Article",
          headline: p.title,
          description: p.description ?? "",
          datePublished: p.created_at,
          publisher: { "@id": "https://purduesmif.org/#organization" },
        },
      })),
    });
  }, [pubs]);

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Publications</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Reports & research from the fund.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Browse equity research, semester performance reviews, and annual reports authored by SMIF members. This library is view-only and curated by fund leadership.
          </p>
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-ink/90"
          >
            <Rss className="h-4 w-4" /> Read us on Substack
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>
      </section>

      <section className="container-prose py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports…"
              aria-label="Search reports"
              className="w-full border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort reports"
              className="border border-input bg-background px-2 py-1.5 text-xs font-medium tracking-normal text-foreground outline-none focus:border-gold"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </label>
        </div>

        <Tabs defaultValue="equity_research" className="w-full">
          <TabsList className="h-auto flex-wrap gap-1 bg-secondary/60 p-1">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value} className="px-4 py-2 text-sm">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((c) => {
            const items = filtered.filter((p) => p.category === c.value);
            return (
              <TabsContent key={c.value} value={c.value} className="mt-8">
                <div className="mb-6 flex items-baseline justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">{c.label}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {items.length} {items.length === 1 ? "report" : "reports"}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {items.length === 0 ? (
                    <div className="col-span-full border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                      {query
                        ? `No ${c.label.toLowerCase()} match "${query}".`
                        : `No ${c.label.toLowerCase()} available yet.`}
                    </div>
                  ) : (
                    items.map((p) => <PublicationCard key={p.id} pub={p} />)
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </section>
    </>
  );
}

function PublicationCard({ pub }: { pub: PublicationRow }) {
  return (
    <div className="group flex flex-col border border-border bg-card transition hover:border-gold hover:shadow-elegant">
      {/* Lightweight thumbnail — never load PDFs in the card.
          Category label + FileText icon + gold accent rule. */}
      <div className="relative aspect-[3/4] overflow-hidden border-b border-border bg-secondary/40">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-gold" aria-hidden="true" />
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <FileText className="h-12 w-12 text-gold-deep/70" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {CATEGORY_LABEL[pub.category]}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-tight">{pub.title}</h3>
        {pub.description && (
          <p className="mt-2 text-sm text-muted-foreground">{pub.description}</p>
        )}
        <div className="mt-2 text-xs text-muted-foreground">
          {new Date(pub.created_at).toLocaleDateString()} · {formatBytes(pub.file_size)}
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs">
          <a href={pub.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-gold-deep">
            <Download className="h-3.5 w-3.5" /> View / Download
          </a>
        </div>
      </div>
    </div>
  );
}
