import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, Linkedin, MapPin, ArrowRight, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { CountUp } from "@/components/CountUp";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  alumni,
  placementFirms,
  placementCategories,
  type Alumnus,
  type AlumniIndustry,
} from "@/data/alumni";
import { socialMeta, canonical } from "@/lib/seo";

export const Route = createFileRoute("/alumni")({
  component: Alumni,
  head: () => ({
    meta: [
      { title: "Alumni — Purdue SMIF" },
      { name: "description", content: "Where Purdue SMIF alumni go: investment banking, private equity, hedge funds, asset management, consulting, and corporate roles across the country." },
      ...socialMeta({
        title: "Alumni Network — Purdue SMIF",
        description: "Meet the SMIF alumni now working at Morgan Stanley, Goldman Sachs, Blackstone, Citadel, McKinsey, and more — and learn how to plug into the mentorship network.",
        url: canonical("/alumni"),
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/alumni") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: alumni.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Person",
              name: a.name,
              jobTitle: a.currentTitle,
              worksFor: { "@type": "Organization", name: a.currentCompany },
              alumniOf: { "@id": "https://purduesmif.org/#organization" },
            },
          })),
        }),
      },
    ],
  }),
});

type Filter = "all" | AlumniIndustry;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",                         label: "All" },
  { id: "Investment Banking",          label: "Investment Banking" },
  { id: "Private Equity / Credit",     label: "Private Equity" },
  { id: "Hedge Funds",                 label: "Hedge Funds" },
  { id: "Asset & Wealth Management",   label: "Asset & Wealth" },
  { id: "Consulting",                  label: "Consulting" },
  { id: "Corporate / Tech",            label: "Corporate / Tech" },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

function Alumni() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [year, setYear] = useState<"all" | string>("all");
  const [selected, setSelected] = useState<Alumnus | null>(null);

  const years = useMemo(
    () => Array.from(new Set(alumni.map((a) => a.gradYear))).sort((a, b) => b - a),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alumni.filter((a) => {
      if (filter !== "all" && a.industry !== filter) return false;
      if (year !== "all" && String(a.gradYear) !== year) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.currentCompany.toLowerCase().includes(q) ||
        a.currentTitle.toLowerCase().includes(q) ||
        a.roleAtSMIF.toLowerCase().includes(q) ||
        String(a.gradYear).includes(q)
      );
    });
  }, [query, filter, year]);

  const featured = useMemo(() => alumni.filter((a) => a.featured).slice(0, 3), []);
  const totalAlumni = alumni.length;
  const totalFirms = new Set(alumni.map((a) => a.currentCompany)).size;
  const yearsRunning = new Date().getFullYear() - 2009;

  const byCategory = useMemo(() => {
    const map = new Map<AlumniIndustry, typeof placementFirms>();
    for (const c of placementCategories) map.set(c, []);
    for (const f of placementFirms) map.get(f.category)?.push(f);
    return Array.from(map.entries());
  }, []);

  const hasFilter = query.length > 0 || filter !== "all" || year !== "all";
  const earliestYear = Math.min(...alumni.map((a) => a.gradYear));
  const currentYear = new Date().getFullYear();
  const timelineYears = Array.from(
    { length: currentYear - 2009 + 1 },
    (_, i) => 2009 + i,
  );

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative bg-ink text-background overflow-hidden">
        <div className="container-prose py-28">
          <div className="flex items-center gap-3 mb-8">
            <span className="rule-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/70">
              Alumni Network
            </span>
          </div>
          <h1
            className="font-display font-bold text-background max-w-4xl"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)", lineHeight: "0.96" }}
          >
            Where Boilermakers<br />
            <span className="text-gold/80">go next.</span>
          </h1>
          <p className="mt-8 max-w-xl text-background/55 leading-relaxed text-lg">
            Two decades of SMIF analysts now run sector coverage, manage capital, and
            advise boards at the firms our current students aspire to join.
          </p>

          <div className="mt-14 grid grid-cols-3 gap-6 md:gap-12 max-w-3xl">
            {[
              { n: totalAlumni, suffix: "+", l: "Alumni Tracked" },
              { n: totalFirms,  suffix: "+", l: "Firms Placed" },
              { n: yearsRunning, suffix: "",  l: "Years Running" },
            ].map(({ n, suffix, l }) => (
              <div key={l} className="border-l-2 border-gold pl-4">
                <div className="font-display text-4xl md:text-5xl font-bold text-background">
                  <CountUp to={n} suffix={suffix} />
                </div>
                <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.22em] text-background/55">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </section>

      {/* ── Placement showcase ────────────────────────────────── */}
      <section className="container-prose py-24">
        <Reveal>
          <div className="max-w-3xl mb-12">
            <span className="rule-gold block mb-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-4">
              Selected Placements
            </span>
            <h2
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              The firms that hire our analysts.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              A non-exhaustive list, grouped by where SMIF members have landed full-time
              roles. Counts reflect alumni currently in seat.
            </p>
          </div>
        </Reveal>

        <div className="space-y-12">
          {byCategory.map(([category, firms]) => (
            <Reveal key={category}>
              <div className="flex items-baseline justify-between mb-5 border-b border-border pb-3">
                <h3 className="font-display text-lg font-bold text-ink">{category}</h3>
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  {firms.reduce((s, f) => s + f.count, 0)} alumni
                </span>
              </div>
              <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border border border-border">
                {firms.map((f) => (
                  <RevealItem key={f.name}>
                    <div className="group relative bg-background flex flex-col justify-between px-5 py-7 h-full hover:bg-secondary/50 transition-colors duration-200">
                      <span className="font-display text-base font-semibold text-ink/85 tracking-tight leading-tight">
                        {f.name}
                      </span>
                      <span className="mt-3 text-[10px] font-mono uppercase tracking-[0.22em] text-gold-deep">
                        {f.count} {f.count === 1 ? "alum" : "alumni"}
                      </span>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Notable spotlights ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-ink text-background py-24">
          <div className="container-prose">
            <Reveal>
              <div className="max-w-3xl mb-12">
                <span className="rule-gold block mb-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/70 block mb-4">
                  Notable Alumni
                </span>
                <h2 className="font-display text-3xl md:text-5xl font-bold">
                  In their own words.
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="grid gap-px bg-white/10 md:grid-cols-3">
              {featured.map((a) => (
                <RevealItem key={a.name}>
                  <button
                    onClick={() => setSelected(a)}
                    className="group relative w-full text-left bg-ink p-8 lg:p-10 h-full flex flex-col hover:bg-white/[0.03] transition-colors duration-200"
                  >
                    <Quote className="h-7 w-7 text-gold/60 mb-6" />
                    {a.quote && (
                      <p className="font-display text-xl leading-snug text-background/95">
                        &ldquo;{a.quote}&rdquo;
                      </p>
                    )}
                    <div className="mt-auto pt-8 border-t border-white/10">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                        Class of {a.gradYear} · {a.roleAtSMIF}
                      </div>
                      <div className="mt-2 font-display text-lg font-bold text-background group-hover:text-gold transition-colors duration-200">
                        {a.name}
                      </div>
                      <div className="text-sm text-background/55">
                        {a.currentTitle} · {a.currentCompany}
                      </div>
                    </div>
                  </button>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ── Directory ─────────────────────────────────────────── */}
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-20">
          <Reveal>
            <span className="rule-gold block mb-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-4">
              Directory
            </span>
            <h2
              className="font-display font-bold text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              Find an alum.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Filter by industry or graduating class. Reach out on LinkedIn — most SMIF
              alumni are happy to take a coffee chat with a current Boilermaker.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container-prose py-3 md:py-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, firm, role…"
                className="w-full border border-border bg-background pl-10 pr-9 py-2 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:border-ink transition-colors"
                aria-label="Search alumni"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-ink transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-9 w-full md:w-48 border border-border bg-background px-3 text-[11px] font-semibold uppercase tracking-[0.14em] focus:outline-none focus:border-ink"
              aria-label="Filter by graduating class"
            >
              <option value="all">All Classes</option>
              {years.map((y) => (
                <option key={y} value={y}>Class of {y}</option>
              ))}
            </select>
          </div>
          <div className="-mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 w-max md:w-auto md:flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] border transition-colors whitespace-nowrap ${
                    filter === f.id
                      ? "bg-ink text-background border-ink"
                      : "bg-background text-foreground border-border hover:border-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {hasFilter && (
          <div className="container-prose pb-3 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"}
            {query && <> for &ldquo;{query}&rdquo;</>}
          </div>
        )}
      </div>

      {/* Directory grid */}
      <section className="container-prose py-16">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl text-muted-foreground">
              No alumni match your search.
            </p>
            <button
              onClick={() => { setQuery(""); setFilter("all"); setYear("all"); }}
              className="mt-6 inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] border border-ink hover:bg-ink hover:text-background transition-colors"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <RevealItem key={`${a.name}-${a.gradYear}`}>
                <AlumniCard a={a} onSelect={setSelected} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>

      {/* ── Network & mentorship CTA ──────────────────────────── */}
      <section className="border-t border-border bg-background">
        <div className="container-prose py-20 grid gap-px bg-border md:grid-cols-2">
          <div className="bg-background p-10 lg:p-12">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-4">
              For Alumni
            </span>
            <h3 className="font-display text-3xl font-bold text-ink">Are you a SMIF alum?</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Help us keep the roster accurate. Send your latest role, grad year, and
              LinkedIn — we'll add you to the directory and our private alumni list.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="mailto:smif26@purdue.edu?subject=Alumni%20Network%20Update"
                className="group inline-flex items-center gap-2 bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-background hover:bg-ink/85 transition-colors"
              >
                Update Your Info
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="https://www.linkedin.com/company/purdue-smif/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:border-ink transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5" />
                Join the Network
              </a>
            </div>
          </div>
          <div className="bg-background p-10 lg:p-12">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-4">
              Give Back
            </span>
            <h3 className="font-display text-3xl font-bold text-ink">Mentor a current analyst.</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The next generation of SMIF analysts learns fastest from people who've sat
              in their seat. Speak at a meeting, take a coffee chat, or sponsor a sector
              team's research trip.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-gold-mid transition-colors"
              >
                Get Involved
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <a
                href="mailto:smif26@purdue.edu?subject=SMIF%20Mentorship"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:border-ink transition-colors"
              >
                Email the Board
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline strip ────────────────────────────────────── */}
      <section className="bg-ink text-background py-16">
        <div className="container-prose">
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold/70">
              Legacy
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-background/40">
              Class of {earliestYear} → present
            </span>
          </div>
          <div className="relative h-px bg-background/15">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ originX: 0 }}
              className="absolute inset-0 h-px bg-gold/70"
            />
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-background/40">
            {timelineYears
              .filter((_, i, arr) => i === 0 || i === arr.length - 1 || (arr[i] % 4 === 0))
              .map((y) => (
                <span key={y}>&apos;{String(y).slice(-2)}</span>
              ))}
          </div>
          <p className="mt-10 max-w-2xl text-background/55 text-sm leading-relaxed">
            Sixteen years of analysts, pitches, models, votes, and capital deployed. Every
            alum on this page started with the same first cold pitch in front of the
            committee.
          </p>
        </div>
      </section>

      <AlumniDetailSheet member={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function AlumniCard({ a, onSelect }: { a: Alumnus; onSelect: (a: Alumnus) => void }) {
  const initials = initialsOf(a.name);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(a)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(a);
        }
      }}
      className="group flex flex-col h-full cursor-pointer border border-border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-gold hover:shadow-elegant focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="flex items-center gap-4 border-b border-border p-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center bg-gradient-gold">
          <span className="font-display text-lg font-bold text-ink/60">{initials}</span>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-deep truncate">
            Class of {a.gradYear}
          </div>
          <div className="font-display text-base font-bold leading-tight truncate">
            {a.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">{a.roleAtSMIF}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
          Now
        </div>
        <div className="mt-1 font-display text-sm font-semibold text-ink leading-snug">
          {a.currentTitle}
        </div>
        <div className="text-sm text-foreground/75">{a.currentCompany}</div>
        <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {a.industry}
        </div>
        <div className="mt-auto pt-5 border-t border-border flex items-center justify-between gap-3 text-xs">
          {a.location ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{a.location}</span>
            </span>
          ) : <span />}
          {a.linkedin && (
            <a
              href={a.linkedin}
              onClick={stop}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-11 text-muted-foreground transition-colors hover:text-gold-deep"
              aria-label={`${a.name} on LinkedIn`}
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AlumniDetailSheet({
  member,
  onClose,
}: {
  member: Alumnus | null;
  onClose: () => void;
}) {
  const open = !!member;
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {member && <AlumniDetail a={member} />}
      </SheetContent>
    </Sheet>
  );
}

function AlumniDetail({ a }: { a: Alumnus }) {
  const initials = initialsOf(a.name);
  return (
    <div className="flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-gold">
        <div className="grid h-full w-full place-items-center">
          <span className="font-display text-7xl font-bold text-ink/40">{initials}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-6 text-background">
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            Class of {a.gradYear} · {a.roleAtSMIF}
          </div>
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle className="font-display text-3xl font-bold text-background">{a.name}</SheetTitle>
            <SheetDescription className="text-background/70 font-mono text-xs uppercase tracking-[0.2em]">
              {a.currentTitle} · {a.currentCompany}
            </SheetDescription>
          </SheetHeader>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {a.quote && (
          <div className="border-l-2 border-gold pl-4">
            <Quote className="h-4 w-4 text-gold-deep mb-2" />
            <p className="font-display text-lg leading-snug text-foreground">
              &ldquo;{a.quote}&rdquo;
            </p>
          </div>
        )}
        {a.bio && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep mb-2">Bio</div>
            <p className="text-sm leading-relaxed text-foreground/80">{a.bio}</p>
          </div>
        )}
        <div className="border-t border-border pt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-1">Industry</div>
            <div className="text-foreground">{a.industry}</div>
          </div>
          {a.location && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-1">Based In</div>
              <div className="text-foreground">{a.location}</div>
            </div>
          )}
        </div>
        {a.linkedin && (
          <div className="border-t border-border pt-5">
            <a
              href={a.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-gold-deep transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              <span className="font-mono">LinkedIn profile</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
