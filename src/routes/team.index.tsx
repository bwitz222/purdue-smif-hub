import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { MemberCard, OpenSeatsCard, type Member } from "@/components/MemberCard";
import { MemberDetailSheet } from "@/components/MemberDetailSheet";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { board, sectorTeams, fixedIncomeMacro, portfolioManagers, facultyAdvisors, memberDirectory } from "@/data/team";
import { socialMeta, canonical, breadcrumbLd, OG_TEAM } from "@/lib/seo";

const allMembers = [
  ...board,
  ...sectorTeams.flatMap((t) => t.members),
  ...fixedIncomeMacro,
  ...portfolioManagers,
  ...facultyAdvisors,
].filter((m) => !m.placeholder);


type TeamSearch = { sector?: string; q?: string };

export const Route = createFileRoute("/team/")({
  component: Team,
  // `q` is in the URL so a filtered roster is shareable and survives a
  // reload — it used to live only in component state.
  validateSearch: (search: Record<string, unknown>): TeamSearch => ({
    sector: typeof search.sector === "string" ? search.sector : undefined,
    q: typeof search.q === "string" && search.q.trim() !== "" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Meet the Team — Purdue Student Managed Investment Fund" },
      { name: "description", content: "Meet the executive board, sector teams, fixed income & macro team, and portfolio managers of the Purdue Student Managed Investment Fund." },
      ...socialMeta({
        title: "Meet the Team | Purdue SMIF",
        description: "The 52 students behind Purdue SMIF: executive board, sector analysts, fixed income & macro, and portfolio managers.",
        url: canonical("/team"),
        image: OG_TEAM,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/team") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: allMembers.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Person",
              name: m.name,
              jobTitle: m.role,
              affiliation: { "@id": "https://www.purduesmif.org/#organization" },
            },
          })),
        }),
      },
      breadcrumbLd("Team", "/team"),
    ],
  }),
});

function SectionHeader({ kicker, title, blurb, count }: { kicker: string; title: string; blurb?: string; count?: number }) {
  return (
    <div className="mb-12 max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">{kicker}</span>
        {typeof count === "number" && (
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{count} {count === 1 ? "result" : "results"}</span>
        )}
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{title}</h2>
      {blurb && <p className="mt-4 text-muted-foreground">{blurb}</p>}
    </div>
  );
}

type Group = "all" | "board" | "sectors" | "fim" | "pm" | "faculty";

/**
 * Substring match across everything a reader might type. `team` is passed in
 * because it is positional — a Member does not carry its own group — and
 * searching "Industrials" or "Financials" is one of the likeliest queries on
 * a roster organised by coverage team.
 */
const matches = (m: Member, q: string, team?: string) => {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    m.name.toLowerCase().includes(s) ||
    m.role.toLowerCase().includes(s) ||
    (m.year ?? "").toLowerCase().includes(s) ||
    (m.bio ?? "").toLowerCase().includes(s) ||
    (m.email ?? "").toLowerCase().includes(s) ||
    (team ?? "").toLowerCase().includes(s)
  );
};

// Unified scope options: drives both group + sector state and anchor jumps
// from a single chip row. `anchor` is the DOM id of the section heading.
type ScopeOption = { value: string; label: string; group: Group; sector: string; anchor: string };
const sectorSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const SCOPE_OPTIONS: ScopeOption[] = [
  { value: "all", label: "All", group: "all", sector: "all", anchor: "leadership" },
  { value: "leadership", label: "Leadership", group: "board", sector: "all", anchor: "leadership" },
  ...sectorTeams.map((t) => ({
    value: t.name,
    label: t.name,
    group: "sectors" as Group,
    sector: t.name,
    anchor: `sector-${sectorSlug(t.name)}`,
  })),
  { value: "fim", label: "FI & Macro", group: "fim", sector: "all", anchor: "fim" },
  { value: "pm", label: "PM + Risk", group: "pm", sector: "all", anchor: "pm" },
  { value: "faculty", label: "Faculty", group: "faculty", sector: "all", anchor: "faculty" },
];


function Team() {
  const totalMembers = 54;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/team/" });
  const reduce = useReducedMotion();
  const gridRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState(search.q ?? "");
  const [group, setGroup] = useState<Group>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Member | null>(null);

  // Push the query into the URL, debounced, without stacking history entries.
  // replace:true matches how ?sector= already behaves here.
  // The no-op guard keeps this from firing a pointless navigation on mount,
  // when the state was seeded from the URL and already agrees with it.
  useEffect(() => {
    const desired = query.trim() === "" ? undefined : query;
    if (desired === search.q) return;
    const id = setTimeout(() => {
      navigate({
        search: (prev) => ({ ...prev, q: desired }),
        replace: true,
      });
    }, 300);
    return () => clearTimeout(id);
    // navigate identity is stable per route; re-running on query alone is the
    // intent, and including it would re-fire the timer on every URL write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, search.q]);

  // Sync URL ?sector=… → state and scroll to grid on change.
  useEffect(() => {
    const s = search.sector;
    if (!s) return;
    const opt = SCOPE_OPTIONS.find((o) => o.label === s);
    if (!opt) return;
    setGroup(opt.group);
    setSectorFilter(opt.sector);
    // Defer scroll until layout settles after state update.
    const id = requestAnimationFrame(() => {
      const target = document.getElementById(opt.anchor) ?? gridRef.current;
      target?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [search.sector, reduce]);

  const showBoard = group === "all" || group === "board";
  const showSectors = group === "all" || group === "sectors";
  const showFim = group === "all" || group === "fim";
  const showPm = group === "all" || group === "pm";
  const showFaculty = group === "all" || group === "faculty";

  const filteredBoard = useMemo(() => board.filter((m) => matches(m, query)), [query]);
  const filteredSectors = useMemo(() => {
    const teams = sectorTeams
      .filter((t) => sectorFilter === "all" || t.name === sectorFilter)
      .map((t) => {
        const real = t.members.filter((m) => !m.placeholder && matches(m, query));
        const openSeats = t.members.filter((m) => m.placeholder).length;
        return { ...t, members: real, openSeats };
      })
      .filter((t) => t.members.length > 0 || t.openSeats > 0);
    return teams;
  }, [query, sectorFilter]);
  const filteredFim = useMemo(() => fixedIncomeMacro.filter((m) => !m.placeholder && matches(m, query)), [query]);
  const filteredPm = useMemo(() => portfolioManagers.filter((m) => !m.placeholder && matches(m, query)), [query]);
  const filteredFaculty = useMemo(() => facultyAdvisors.filter((m) => matches(m, query)), [query]);


  const hasFilter = query.length > 0 || group !== "all" || sectorFilter !== "all";

  /**
   * Flat, deduplicated results — what the page shows the moment a filter or a
   * query is active.
   *
   * The grouped sections are the right default: they say who works with whom.
   * They are the wrong answer to "where is Sid Voona", because a board member
   * appears twice (once under Leadership, once under their sector team), a
   * query that matches nobody in a section makes the section vanish, and a
   * sector with open seats but no matching members leaves an empty block
   * behind. memberDirectory already flattens all five groups, drops
   * placeholders, dedupes by slug and attaches the team label, so it is the
   * right backing array for a directory view.
   */
  const directoryResults = useMemo(() => {
    if (!hasFilter) return [];
    return memberDirectory.filter(({ member, team }) => {
      if (!matches(member, query, team)) return false;
      if (sectorFilter !== "all") return team === sectorFilter;
      switch (group) {
        case "board":
          return board.some((b) => b.name === member.name);
        case "fim":
          return fixedIncomeMacro.some((m) => m.name === member.name);
        case "pm":
          return portfolioManagers.some((m) => m.name === member.name);
        case "faculty":
          return facultyAdvisors.some((m) => m.name === member.name);
        case "sectors":
          return sectorTeams.some((t) => t.members.some((m) => !m.placeholder && m.name === member.name));
        default:
          return true;
      }
    });
  }, [hasFilter, query, group, sectorFilter]);

  /** Open seats for the active scope — kept visible, they are a recruiting asset. */
  const totalResults = directoryResults.length;

  const scopeOpenSeats = useMemo(() => {
    if (!hasFilter || query.length > 0) return 0;
    const teams = sectorFilter === "all" ? sectorTeams : sectorTeams.filter((t) => t.name === sectorFilter);
    if (group === "sectors" || sectorFilter !== "all") {
      return teams.reduce((n, t) => n + t.members.filter((m) => m.placeholder).length, 0);
    }
    if (group === "pm") return portfolioManagers.filter((m) => m.placeholder).length;
    if (group === "fim") return fixedIncomeMacro.filter((m) => m.placeholder).length;
    return 0;
  }, [hasFilter, query, group, sectorFilter]);

  const currentScopeValue = useMemo(() => {
    if (group === "board") return "leadership";
    if (group === "fim") return "fim";
    if (group === "pm") return "pm";
    if (group === "faculty") return "faculty";
    if (group === "sectors" && sectorFilter !== "all") return sectorFilter;
    return "all";
  }, [group, sectorFilter]);

  const handleScopeChange = (val: string) => {
    const opt = SCOPE_OPTIONS.find((o) => o.value === val);
    if (!opt) return;
    setGroup(opt.group);
    setSectorFilter(opt.sector);
    navigate({
      search: () => (val === "all" ? {} : { sector: opt.label }),
      replace: true,
    });
    // Anchor-jump filtering: scroll to the matching section after render.
    requestAnimationFrame(() => {
      const target = document.getElementById(opt.anchor) ?? gridRef.current;
      target?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  };




  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Team</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">
            The people behind the portfolio.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            52 students and 2 faculty advisors working together to manage real capital for Purdue. Executive board members also serve as sector leads or senior analysts across the eight sector teams, the Fixed Income &amp; Macro group, and the Portfolio + Risk Management team.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 max-w-3xl">
            {[
              ["7", "Executive Board"],
              ["8", "Sector Teams"],
              ["1", "Fixed Income & Macro"],
              ["1", "Portfolio + Risk Mgmt."],
            ].map(([n, l]) => (
              <div key={l} className="border-t-2 border-gold pt-3">
                <div className="font-display text-3xl font-bold">{n}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky filter bar — chip row works on mobile and desktop. */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container-prose py-3 md:py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, role, year…"
                className="w-full border border-border bg-background pl-10 pr-9 py-2 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:border-ink transition-colors min-h-11"
                aria-label="Search team members"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-ink transition-colors min-h-11 min-w-11"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap md:ml-auto md:text-right">
              {hasFilter
                ? `${totalResults} ${totalResults === 1 ? "match" : "matches"}`
                : `${totalMembers} members`}
            </div>
          </div>
          {/* Chip row: horizontal scroll on mobile, wraps on desktop. */}
          <div
            role="tablist"
            aria-label="Filter team by group"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 snap-x scrollbar-hide md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
          >
            {/* Completed tab semantics: every tab points at the one panel it
                controls, and focus roves with the arrow keys so a keyboard
                user moves through 13 chips with 13 keypresses rather than 13
                tab stops. Previously these were role="tab" with no panel and
                no roving tabindex, which promises a pattern to a screen reader
                that the markup did not implement. */}
            {SCOPE_OPTIONS.map((o, i) => {
              const active = currentScopeValue === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="tab"
                  id={`team-tab-${o.value}`}
                  aria-selected={active}
                  aria-controls="team-results"
                  tabIndex={active ? 0 : -1}
                  onKeyDown={(e) => {
                    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                    if (delta === 0) return;
                    e.preventDefault();
                    const next = SCOPE_OPTIONS[(i + delta + SCOPE_OPTIONS.length) % SCOPE_OPTIONS.length];
                    handleScopeChange(next.value);
                    requestAnimationFrame(() =>
                      document.getElementById(`team-tab-${next.value}`)?.focus(),
                    );
                  }}
                  onClick={() => handleScopeChange(o.value)}
                  className={`press shrink-0 snap-start min-h-9 rounded-full border px-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 ${
                    active
                      ? "border-ink bg-ink text-background"
                      : "border-border bg-background text-muted-foreground hover:border-ink hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      <div ref={gridRef} id="team-results" role="tabpanel" aria-label="Team members">
{hasFilter ? (
        /* ── Filtered: one flat, deduplicated result set ──────────────────
           Sections are the right default but the wrong answer to "find this
           person": under them a board member appears twice, an unmatched
           section disappears, and a sector with open seats but no matching
           members leaves an empty block behind. */
        <section className="container-prose py-16 scroll-mt-40">
          {totalResults === 0 && scopeOpenSeats === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-2xl text-muted-foreground">No members match your search.</p>
              <button
                onClick={() => { setQuery(""); setGroup("all"); setSectorFilter("all"); navigate({ search: () => ({}), replace: true }); }}
                className="press mt-6 inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] border border-ink hover:bg-ink hover:text-background cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <SectionHeader
                kicker="Results"
                title={sectorFilter !== "all" ? sectorFilter : query ? `"${query}"` : "Directory"}
                blurb="Each person appears once, with the team they sit on."
                count={totalResults}
              />
              <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.04}>
                {directoryResults.map(({ slug, member, team }) => (
                  <RevealItem key={slug} className="h-full [&>div]:h-full">
                    <div className="flex h-full flex-col">
                      <MemberCard m={member} onSelect={setSelected} />
                      <span className="mt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        {team}
                      </span>
                    </div>
                  </RevealItem>
                ))}
                {/* Open seats stay visible while browsing a scope — a named
                    gap tells an applicant exactly where they would land. They
                    are suppressed during a text query, where they would be
                    noise rather than a result. */}
                {scopeOpenSeats > 0 && (
                  <RevealItem className="h-full [&>div]:h-full">
                    <OpenSeatsCard count={scopeOpenSeats} />
                  </RevealItem>
                )}
              </RevealGroup>
            </>
          )}
        </section>
      ) : (
        <>


        {showBoard && filteredBoard.length > 0 && (
          <section id="leadership" className="container-prose py-20 scroll-mt-40">
            <SectionHeader
              kicker="Leadership"
              title="Executive Board"
              blurb="Seven students elected each spring to lead the fund's strategy, research, risk, recruiting, education, and operations."
              count={hasFilter ? filteredBoard.length : undefined}
            />
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {filteredBoard.map((m) => <RevealItem key={m.name} className="h-full [&>div]:h-full"><MemberCard m={m} variant="board" onSelect={setSelected} /></RevealItem>)}
            </RevealGroup>
          </section>
        )}

        {showSectors && filteredSectors.length > 0 && (
          <section className="border-y border-border bg-secondary/30 py-20">
            <div className="container-prose">
              <SectionHeader
                kicker="Equity Research"
                title="Sector Teams"
                blurb="Eight teams cover the equity universe. Each team is led by a Sector Head with senior analysts and rotating junior analysts."
                count={hasFilter ? filteredSectors.reduce((s, t) => s + t.members.length, 0) : undefined}
              />
              <div className="space-y-16">
                {filteredSectors.map((team) => (
                  <div key={team.name} id={`sector-${sectorSlug(team.name)}`} className="scroll-mt-40">
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold">{team.name}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{team.description}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.18em] text-gold-deep">
                        {team.members.length} {team.members.length === 1 ? "member" : "members"}
                        {team.openSeats > 0 && (
                          <> · {team.openSeats} open</>
                        )}
                      </span>
                    </div>
                    <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
                      {team.members.map((m) => <RevealItem key={m.name} className="h-full [&>div]:h-full"><MemberCard m={m} onSelect={setSelected} /></RevealItem>)}
                      {team.openSeats > 0 && !query && (
                        <RevealItem className="h-full [&>a]:h-full"><OpenSeatsCard count={team.openSeats} role="Analyst" /></RevealItem>
                      )}
                    </RevealGroup>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {showFim && filteredFim.length > 0 && (
          <section id="fim" className="container-prose py-20 scroll-mt-40">
            <SectionHeader
              kicker="Cross-Asset"
              title="Fixed Income & Macro Team"
              blurb="Covers rates, credit, FX, and global macro themes, informing both the fixed income sleeve and the equity portfolio's macro overlay."
              count={hasFilter ? filteredFim.length : undefined}
            />
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {filteredFim.map((m) => <RevealItem key={m.name} className="h-full [&>div]:h-full"><MemberCard m={m} onSelect={setSelected} /></RevealItem>)}
            </RevealGroup>
          </section>
        )}

        {showPm && filteredPm.length > 0 && (
          <section id="pm" className="border-t border-border bg-secondary/30 py-20 scroll-mt-40">
            <div className="container-prose">
              <SectionHeader
                kicker="Portfolio + Risk Management"
                title="Portfolio + Risk Management"
                blurb="Implement allocation decisions, monitor portfolio risk, manage trading and rebalancing, and own performance attribution."
                count={hasFilter ? filteredPm.length : undefined}
              />
              <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
                {filteredPm.map((m) => <RevealItem key={m.name} className="h-full [&>div]:h-full"><MemberCard m={m} onSelect={setSelected} /></RevealItem>)}
              </RevealGroup>
            </div>
          </section>
        )}

        {showFaculty && filteredFaculty.length > 0 && (
          <section id="faculty" className="border-t border-border py-20 scroll-mt-40">
            <div className="container-prose">
              <SectionHeader
                kicker="Faculty"
                title="Faculty Advisors"
                blurb="Daniels School of Business faculty who advise SMIF on curriculum, risk, and investment process."
                count={hasFilter ? filteredFaculty.length : undefined}
              />
              <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
                {filteredFaculty.map((m) => <RevealItem key={m.name} className="h-full [&>div]:h-full"><MemberCard m={m} onSelect={setSelected} /></RevealItem>)}
              </RevealGroup>
            </div>
          </section>
        )}
        </>
      )}
      </div>

      <MemberDetailSheet member={selected} onClose={() => setSelected(null)} />
    </>
  );
}

