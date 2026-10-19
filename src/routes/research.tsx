import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Download, ExternalLink, Rss, Search } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { socialMeta, canonical, breadcrumbLd, OG_RESEARCH } from "@/lib/seo";
import { getPublications, type PublicationRow } from "@/lib/publications.functions";
import { findMemberBySlug, memberSlug } from "@/data/team";
import { SERIES_LABEL } from "@/lib/publication-series";

import { SUBSTACK_URL } from "@/lib/nav";

type Category = PublicationRow["category"];
type SortKey = "newest" | "oldest" | "title";

/**
 * Each category is presented as a named series with its own byline, the way
 * fund research hubs present a flagship letter or weekly note: readers learn
 * what a series is and how often it publishes before they open an issue.
 * Order here is display order on the page.
 */
const SERIES: {
  value: Category;
  label: string;
  cadence: string;
  byline: string;
  description: string;
}[] = [
  {
    value: "macro",
    label: SERIES_LABEL.macro,
    cadence: "Biweekly",
    byline: "Fixed Income & Macro team",
    description:
      "Rates, inflation, the Fed, and cross-asset moves, with a dated call on each and what would prove us wrong.",
  },
  {
    value: "pitch",
    label: SERIES_LABEL.pitch,
    cadence: "Each research cycle",
    byline: "Sector teams",
    description:
      "Stock pitches the sector teams present to the fund for a vote: thesis, valuation, and risks.",
  },
  {
    value: "equity_research",
    label: SERIES_LABEL.equity_research,
    cadence: "Each research cycle",
    byline: "Sector teams",
    description: "Initiation reports and deep-dive analyst research from the eight sector teams.",
  },
  {
    value: "semester",
    label: SERIES_LABEL.semester,
    cadence: "Twice a year",
    byline: "Fund leadership",
    description: "End-of-term letters on performance, attribution, and positioning.",
  },
  {
    value: "annual",
    label: SERIES_LABEL.annual,
    cadence: "Yearly",
    byline: "Fund leadership",
    description: "Full-year reports to the Daniels School and the fund's stakeholders.",
  },
];

// Literal class names so Tailwind can see them; keyed by visible series count.
const SERIES_COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
};

const SERIES_BY_VALUE = Object.fromEntries(SERIES.map((s) => [s.value, s])) as Record<
  Category,
  (typeof SERIES)[number]
>;

const isCategory = (v: unknown): v is Category =>
  typeof v === "string" && SERIES.some((s) => s.value === v);

type ResearchSearch = { series?: Category; q?: string };

export const Route = createFileRoute("/research")({
  // SSR loader — the publications list is fetched on the server so the
  // page renders fully-formed HTML (no client-side loading spinner, fully
  // indexable by crawlers). Client-side search/sort still operate on the
  // returned array.
  loader: async (): Promise<{ pubs: PublicationRow[] }> => ({ pubs: await getPublications() }),
  validateSearch: (search: Record<string, unknown>): ResearchSearch => ({
    series: isCategory(search.series) ? search.series : undefined,
    q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
  }),
  component: Research,
  head: ({ loaderData }) => {
    const pubs = loaderData?.pubs ?? [];
    const url = canonical("/research");

    // The publication library is the fund's actual research corpus, and it
    // was previously invisible as content — the route emitted only a
    // breadcrumb, so a crawler saw a page of links with no indication that
    // each one is a dated, authored report. CollectionPage + one Report per
    // publication makes the corpus itself addressable.
    //
    // Built from the loader's rows, so it stays empty (and honest) while the
    // publications table is, and grows without another code change.
    const collectionLd = {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url}#library`,
        name: "Purdue SMIF Research Library",
        description:
          "The Macro Brief, stock pitch decks, equity research, semester letters, and annual reports authored by Purdue SMIF analysts.",
        url,
        isPartOf: { "@id": "https://www.purduesmif.org/#website" },
        about: { "@id": "https://www.purduesmif.org/#organization" },
        ...(pubs.length > 0 && {
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: pubs.length,
            itemListElement: pubs.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Report",
                "@id": `${url}#pub-${p.id}`,
                name: p.title,
                ...(p.description && { description: p.description }),
                datePublished: p.created_at,
                url: p.url,
                ...(p.mime_type && { encodingFormat: p.mime_type }),
                genre: SERIES_BY_VALUE[p.category]?.label ?? "Report",
                ...(p.ticker && { about: { "@type": "Corporation", tickerSymbol: p.ticker } }),
                isAccessibleForFree: true,
                // Named analysts are credited only when the row stores them;
                // otherwise the fund is the author. Attributing a Person we
                // don't actually store would be fabricated provenance.
                author:
                  p.authors && p.authors.length > 0
                    ? p.authors.map((name) => ({ "@type": "Person", name }))
                    : { "@id": "https://www.purduesmif.org/#organization" },
                publisher: { "@id": "https://www.purduesmif.org/#organization" },
              },
            })),
          },
        }),
      }),
    };

    return {
      meta: [
        { title: "Research: The Macro Brief, Pitch Decks & Reports | Purdue SMIF" },
        {
          name: "description",
          content:
            "The Macro Brief, stock pitch decks, equity research, semester letters, and annual reports written by Purdue SMIF analysts and curated by fund leadership.",
        },
        ...socialMeta({
          title: "Research | Purdue SMIF",
          description:
            "Read SMIF's biweekly Macro Brief, stock pitch decks, equity research, and reports.",
          url,
          image: OG_RESEARCH,
        }),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [collectionLd, breadcrumbLd("Research", "/research")],
    };
  },
});

// Dates are formatted in UTC so the server render and the browser agree on
// the day; a local-time format flips a midnight-UTC date back a day for any
// US visitor and trips a hydration mismatch.
const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
const longDate = (iso: string) => fmtDate(iso, { month: "long", day: "numeric", year: "numeric" });
const shortDate = (iso: string) => fmtDate(iso, { month: "short", day: "numeric" });
const yearOf = (iso: string) => new Date(iso).getUTCFullYear();

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatLabel(pub: PublicationRow) {
  const ext = pub.file_name.split(".").pop()?.toUpperCase();
  const size = formatBytes(pub.file_size);
  return [ext, size].filter(Boolean).join(" · ");
}

const byNewest = (a: PublicationRow, b: PublicationRow) =>
  +new Date(b.created_at) - +new Date(a.created_at);

function Research() {
  const { pubs } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(search.q ?? "");
  const [sort, setSort] = useState<SortKey>("newest");
  const active = search.series ?? "all";

  const latest = useMemo(() => [...pubs].sort(byNewest)[0], [pubs]);

  const filtered = useMemo<PublicationRow[]>(() => {
    const q = query.trim().toLowerCase();
    const base = pubs.filter((p: PublicationRow) => {
      if (active !== "all" && p.category !== active) return false;
      if (!q) return true;
      return [
        p.title,
        p.description ?? "",
        p.ticker ?? "",
        p.sector ?? "",
        ...(p.authors ?? []),
      ].some((s) => s.toLowerCase().includes(q));
    });
    const sorted = [...base];
    if (sort === "newest") sorted.sort(byNewest);
    else if (sort === "oldest") sorted.sort((a, b) => -byNewest(a, b));
    else sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [pubs, query, sort, active]);

  // Year headings only make sense for a chronological sort.
  const groups = useMemo(() => {
    if (sort === "title") return [{ year: null as number | null, items: filtered }];
    const out: { year: number | null; items: PublicationRow[] }[] = [];
    for (const p of filtered) {
      const y = yearOf(p.created_at);
      const last = out[out.length - 1];
      if (last && last.year === y) last.items.push(p);
      else out.push({ year: y, items: [p] });
    }
    return out;
  }, [filtered, sort]);

  const selectSeries = (value: Category | "all") =>
    navigate({
      search: (prev) => ({ ...prev, series: value === "all" ? undefined : value }),
      replace: true,
      resetScroll: false,
    });

  const countFor = (c: Category) => pubs.filter((p) => p.category === c).length;
  // Only series with at least one publication get a card and a chip; an empty
  // shelf of "Coming soon" cards made the library look abandoned. If nothing
  // has loaded at all (data outage), every series shows so the page still
  // explains what it publishes. A series selected by URL stays visible.
  const liveSeries = SERIES.filter((s) => countFor(s.value) > 0 || s.value === active);
  const shownSeries = liveSeries.length > 0 ? liveSeries : SERIES;
  const activeSeries = active === "all" ? null : SERIES_BY_VALUE[active];

  return (
    <>
      {/* ── Masthead ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-20 md:py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
            Research
          </span>
          <div className="mt-4 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="font-display text-5xl font-bold md:text-6xl max-w-3xl">
                What the fund is thinking.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Macro views, single-name research, and our letters to stakeholders, written by SMIF
                analysts and reviewed by fund leadership.
              </p>
            </div>
            <a
              href={SUBSTACK_URL}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex items-center gap-2 self-start border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-background hover:bg-ink/90 md:self-end"
            >
              <Rss className="h-4 w-4" aria-hidden="true" /> Subscribe on Substack
              <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Latest issue ─────────────────────────────────────────── */}
      {latest && (
        <section className="container-prose pt-16" aria-labelledby="latest-heading">
          <h2
            id="latest-heading"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Latest
          </h2>
          <Reveal>
            <FeaturedPublication pub={latest} />
          </Reveal>
          <div className="mt-4 flex flex-col gap-3 border border-border bg-secondary/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              New issues of The Macro Brief arrive every two weeks. Get them by email.
            </p>
            <a
              href={SUBSTACK_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep"
            >
              Subscribe free on Substack
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>
      )}

      {/* ── Series ───────────────────────────────────────────────── */}
      <section className="container-prose pt-16" aria-labelledby="series-heading">
        <h2
          id="series-heading"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Series
        </h2>
        <ul
          className={`mt-5 grid gap-px border border-border bg-border sm:grid-cols-2 ${SERIES_COLS[shownSeries.length] ?? "lg:grid-cols-5"}`}
        >
          {shownSeries.map((s) => {
            const n = countFor(s.value);
            const isActive = active === s.value;
            return (
              <li
                key={s.value}
                // An odd count leaves the last card alone on its row at two
                // columns, so it spans the row there.
                className={`bg-background ${shownSeries.length % 2 === 1 ? "sm:last:col-span-2 lg:last:col-span-1" : ""}`}
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    selectSeries(isActive ? "all" : s.value);
                    document
                      .getElementById("library")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`group flex h-full w-full flex-col p-6 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold ${
                    isActive ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
                    {s.cadence}
                  </span>
                  <span className="mt-2 font-display text-xl font-bold leading-tight">
                    {s.label}
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </span>
                  <span className="mt-auto flex items-center justify-between pt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {n === 0 ? "Coming soon" : `${n} ${n === 1 ? "issue" : "issues"}`}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Library ──────────────────────────────────────────────── */}
      <section
        id="library"
        className="container-prose scroll-mt-20 py-16"
        aria-labelledby="library-heading"
      >
        <div className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="library-heading" className="font-display text-3xl font-bold">
              {activeSeries ? activeSeries.label : "Library"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeSeries
                ? `${activeSeries.byline} · ${activeSeries.cadence}`
                : "Every publication, newest first."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, topics, authors…"
                aria-label="Search publications"
                className="w-full border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort publications"
                className="border border-input bg-background px-2 py-1.5 text-xs font-medium tracking-normal text-foreground outline-none focus:border-gold"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </label>
          </div>
        </div>

        {/* role="group" + aria-pressed, matching the /team scope chips: these
            filter one list in place, so they are toggles, not tabs. */}
        <div
          role="group"
          aria-label="Filter publications by series"
          className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        >
          {[{ value: "all" as const, label: "All" }, ...shownSeries].map((o) => {
            const isActive = active === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectSeries(o.value)}
                className={`press shrink-0 min-h-9 rounded-full border px-3.5 text-xs font-semibold uppercase tracking-[0.14em] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 ${
                  isActive
                    ? "border-ink bg-ink text-background"
                    : "border-border bg-background text-muted-foreground hover:border-ink hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {filtered.length === 0 ? (
            <EmptyState series={activeSeries} query={query} />
          ) : (
            groups.map((g) => (
              <div key={g.year ?? "all"} className="mb-10 last:mb-0">
                {g.year !== null && (
                  <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {g.year}
                  </h3>
                )}
                <ol className="border-t border-border">
                  {g.items.map((p) => (
                    <PublicationRowItem key={p.id} pub={p} showSeries={active === "all"} />
                  ))}
                </ol>
              </div>
            ))
          )}
        </div>

        <p className="mt-16 max-w-3xl border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          Student research produced as part of the Purdue Student Managed Investment Fund for
          educational purposes. It is not investment advice or a recommendation to buy or sell any
          security. Views are the authors' as of the publication date and may change without notice.
        </p>
      </section>
    </>
  );
}

function Authors({ names }: { names: string[] }) {
  return (
    <>
      {names.map((name, i) => {
        const slug = memberSlug(name);
        const linked = Boolean(findMemberBySlug(slug));
        return (
          <span key={name}>
            {i > 0 && (i === names.length - 1 ? " & " : ", ")}
            {linked ? (
              <Link
                to="/team/$slug"
                params={{ slug }}
                // inline-block + py-1 gives each name a 24px target (WCAG 2.5.8)
                // without changing the line's visual rhythm.
                className="link-underline inline-block py-1 text-foreground hover:text-gold-deep"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </span>
        );
      })}
    </>
  );
}

function FeaturedPublication({ pub }: { pub: PublicationRow }) {
  const series = SERIES_BY_VALUE[pub.category];
  return (
    <article className="mt-5 grid border border-border bg-card md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="relative flex flex-col justify-between gap-10 bg-ink p-8 text-background md:p-10">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-gradient-gold" />
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
            {series?.label ?? "Report"}
          </span>
          {pub.ticker ? (
            <>
              <div className="mt-3 font-display text-7xl font-bold leading-none text-background md:text-8xl">
                {pub.ticker}
              </div>
              {(pub.position || pub.sector) && (
                <div className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-gold">
                  {[pub.position, pub.sector].filter(Boolean).join(" · ")}
                </div>
              )}
            </>
          ) : (
            pub.issue_number != null && (
              <div className="mt-3 font-display text-7xl font-bold leading-none text-background md:text-8xl">
                #{String(pub.issue_number).padStart(3, "0")}
              </div>
            )
          )}
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-on-dark-secondary">
          <time dateTime={pub.created_at}>{longDate(pub.created_at)}</time>
          {series && <div className="mt-1">{series.byline}</div>}
        </div>
      </div>
      <div className="flex flex-col p-8 md:p-10">
        <h3 className="font-display text-3xl font-bold leading-tight md:text-4xl">{pub.title}</h3>
        {pub.description && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{pub.description}</p>
        )}
        {pub.authors && pub.authors.length > 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            By <Authors names={pub.authors} />
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
          <a
            href={pub.url}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex items-center gap-2 bg-gold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-mid"
          >
            {series?.value === "macro"
              ? "Read the brief"
              : series?.value === "pitch"
                ? "View the deck"
                : "Read the report"}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {formatLabel(pub)}
          </span>
        </div>
      </div>
    </article>
  );
}

function PublicationRowItem({ pub, showSeries }: { pub: PublicationRow; showSeries: boolean }) {
  const series = SERIES_BY_VALUE[pub.category];
  const eyebrow = [
    showSeries ? (series?.label ?? "Report") : null,
    pub.issue_number != null ? `No. ${pub.issue_number}` : null,
    pub.ticker,
    pub.sector,
    pub.position,
  ].filter(Boolean);
  return (
    <li
      id={`pub-${pub.id}`}
      className="group grid gap-x-8 gap-y-2 border-b border-border py-6 md:grid-cols-[7rem_minmax(0,1fr)_auto]"
    >
      <div className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground md:pt-1.5">
        <time dateTime={pub.created_at}>{shortDate(pub.created_at)}</time>
      </div>
      <div className="min-w-0">
        {eyebrow.length > 0 && (
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
            {eyebrow.join(" · ")}
          </div>
        )}
        <h4 className="mt-1 font-display text-xl font-bold leading-snug">
          <a
            href={pub.url}
            target="_blank"
            rel="noreferrer"
            className="link-underline hover:text-gold-deep"
          >
            {pub.title}
          </a>
        </h4>
        {pub.description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {pub.description}
          </p>
        )}
        {pub.authors && pub.authors.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            By <Authors names={pub.authors} />
          </p>
        )}
      </div>
      <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2 md:pt-1.5">
        <a
          href={pub.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${pub.title}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-foreground hover:text-gold-deep"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> Open
        </a>
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {formatLabel(pub)}
        </span>
      </div>
    </li>
  );
}

function EmptyState({ series, query }: { series: (typeof SERIES)[number] | null; query: string }) {
  if (query) {
    return (
      <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No {series ? series.label : "publications"} match "{query}".
      </div>
    );
  }
  const copy: Record<Category, { headline: string; support: string }> = {
    pitch: {
      headline: "Pitch decks publish here after each research cycle.",
      support: "Each deck is posted once the fund has voted on the idea.",
    },
    macro: {
      headline: "The next Macro Brief publishes here every other week.",
      support: "Follow along on Substack between issues.",
    },
    equity_research: {
      headline: "Analyst reports publish here after each research cycle.",
      support: "Follow interim writeups on Substack while the next cycle wraps.",
    },
    semester: {
      headline: "The next semester letter publishes December 2026.",
      support:
        "End-of-term performance and attribution reviews will land here after each semester closes.",
    },
    annual: {
      headline: "The next annual report will be published here after the fiscal-year audit.",
      support:
        "Full reports to the Daniels School and stakeholders are posted once audited each year.",
    },
  };
  const c = series
    ? copy[series.value]
    : { headline: "Publications will appear here.", support: "Check back soon." };
  return (
    <div className="relative border border-border bg-secondary/30 p-12 text-center md:p-16">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-gradient-gold" />
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
        {series ? `${series.label} · Coming soon` : "Coming soon"}
      </span>
      <h3 className="mx-auto mt-4 max-w-xl font-display text-2xl font-bold leading-tight text-ink md:text-3xl">
        {c.headline}
      </h3>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
        {c.support}
      </p>
    </div>
  );
}
