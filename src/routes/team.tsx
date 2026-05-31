import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { MemberCard, type Member } from "@/components/MemberCard";
import { MemberDetailSheet } from "@/components/MemberDetailSheet";
import { board, sectorTeams, fixedIncomeMacro, portfolioManagers } from "@/data/team";
import { socialMeta, canonical, OG_TEAM } from "@/lib/seo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const allMembers = [
  ...board,
  ...sectorTeams.flatMap((t) => t.members),
  ...fixedIncomeMacro,
  ...portfolioManagers,
].filter((m) => !m.placeholder);

type TeamSearch = { sector?: string };

export const Route = createFileRoute("/team")({
  component: Team,
  validateSearch: (search: Record<string, unknown>): TeamSearch => ({
    sector: typeof search.sector === "string" ? search.sector : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Team — Purdue SMIF" },
      { name: "description", content: "Meet the executive board, sector teams, fixed income & macro team, and portfolio managers of the Purdue Student Managed Investment Fund." },
      ...socialMeta({
        title: "Meet the Team — Purdue SMIF",
        description: "The 52 students behind Purdue SMIF — executive board, sector analysts, fixed income & macro, and portfolio managers.",
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
              affiliation: { "@id": "https://purduesmif.org/#organization" },
            },
          })),
        }),
      },
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

type Group = "all" | "board" | "sectors" | "fim" | "pm";

const matches = (m: Member, q: string) => {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    m.name.toLowerCase().includes(s) ||
    m.role.toLowerCase().includes(s) ||
    (m.year ?? "").toLowerCase().includes(s) ||
    (m.bio ?? "").toLowerCase().includes(s)
  );
};

// Unified scope options: drives both group and sector state from a single Select.
type ScopeOption = { value: string; label: string; group: Group; sector: string };
const SCOPE_OPTIONS: ScopeOption[] = [
  { value: "all", label: "All Sectors", group: "all", sector: "all" },
  { value: "leadership", label: "Leadership", group: "board", sector: "all" },
  ...sectorTeams.map((t) => ({
    value: t.name,
    label: t.name,
    group: "sectors" as Group,
    sector: t.name,
  })),
  { value: "fim", label: "Fixed Income & Macro", group: "fim", sector: "all" },
  { value: "pm", label: "Portfolio + Risk Management", group: "pm", sector: "all" },
];


function Team() {
  const totalMembers = 52;
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/team" });
  const reduce = useReducedMotion();
  const gridRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Member | null>(null);

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
      gridRef.current?.scrollIntoView({
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

  const filteredBoard = useMemo(() => board.filter((m) => matches(m, query)), [query]);
  const filteredSectors = useMemo(() => {
    const teams = sectorTeams
      .filter((t) => sectorFilter === "all" || t.name === sectorFilter)
      .map((t) => ({ ...t, members: t.members.filter((m) => matches(m, query)) }))
      .filter((t) => t.members.length > 0);
    return teams;
  }, [query, sectorFilter]);
  const filteredFim = useMemo(() => fixedIncomeMacro.filter((m) => matches(m, query)), [query]);
  const filteredPm = useMemo(() => portfolioManagers.filter((m) => matches(m, query)), [query]);

  const totalResults =
    (showBoard ? filteredBoard.length : 0) +
    (showSectors ? filteredSectors.reduce((s, t) => s + t.members.length, 0) : 0) +
    (showFim ? filteredFim.length : 0) +
    (showPm ? filteredPm.length : 0);

  const hasFilter = query.length > 0 || group !== "all" || sectorFilter !== "all";

  const currentScopeValue = useMemo(() => {
    if (group === "board") return "leadership";
    if (group === "fim") return "fim";
    if (group === "pm") return "pm";
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
            {totalMembers} students. Executive board members also serve as sector leads or senior analysts across the eight sector teams, the Fixed Income &amp; Macro group, and the Portfolio + Risk Management team &mdash; all working together to manage real capital for Purdue.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 max-w-3xl">
            {[
              ["7", "Executive Board"],
              ["8", "Sector Teams"],
              ["1", "Fixed Income & Macro"],
              ["1", "Portfolio + Risk Mgmt."],
            ].map(([n, l]) => (
              <div key={l} className="border-l-2 border-gold pl-4">
                <div className="font-display text-3xl font-bold">{n}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container-prose py-3 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role, year…"
              className="w-full border border-border bg-background pl-10 pr-9 py-2 text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:border-ink transition-colors"
              aria-label="Search team members"
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
          <Select value={currentScopeValue} onValueChange={handleScopeChange}>
            <SelectTrigger
              aria-label="Filter team by scope"
              className="h-9 w-full md:w-56 rounded-none border-border bg-background text-[11px] font-semibold uppercase tracking-[0.14em] focus:ring-0 focus:ring-offset-0 focus:border-ink"
            >
              <span className="truncate text-left">
                {SCOPE_OPTIONS.find((o) => o.value === currentScopeValue)?.label ?? "All Sectors"}
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-none border-border bg-background">
              {SCOPE_OPTIONS.map((o) => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] focus:bg-secondary focus:text-foreground"
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap md:ml-auto text-right">
            {hasFilter
              ? `${totalResults} ${totalResults === 1 ? "match" : "matches"}`
              : `${totalMembers} members`}
          </div>
        </div>
      </div>

      <div ref={gridRef}>
      {totalResults === 0 && (
        <section className="container-prose py-24 text-center">
          <p className="font-display text-2xl text-muted-foreground">No members match your search.</p>
          <button
            onClick={() => { setQuery(""); setGroup("all"); setSectorFilter("all"); navigate({ search: () => ({}), replace: true }); }}
            className="mt-6 inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] border border-ink hover:bg-ink hover:text-background transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        </section>
      )}


      {showBoard && filteredBoard.length > 0 && (
        <section className="container-prose py-20">
          <SectionHeader
            kicker="Leadership"
            title="Executive Board"
            blurb="Seven senior students elected each spring to lead the fund's strategy, research, risk, recruiting, education, and operations."
            count={hasFilter ? filteredBoard.length : undefined}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBoard.map((m) => <MemberCard key={m.name} m={m} variant="board" onSelect={setSelected} />)}
          </div>
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
                <div key={team.name}>
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
                    <div>
                      <h3 className="font-display text-2xl font-bold">{team.name}</h3>
                      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{team.description}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.18em] text-gold-deep">
                      {team.members.length} {team.members.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {team.members.map((m) => <MemberCard key={m.name} m={m} onSelect={setSelected} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showFim && filteredFim.length > 0 && (
        <section className="container-prose py-20">
          <SectionHeader
            kicker="Cross-Asset"
            title="Fixed Income & Macro Team"
            blurb="Covers rates, credit, FX, and global macro themes — informing both the fixed income sleeve and the equity portfolio's macro overlay."
            count={hasFilter ? filteredFim.length : undefined}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFim.map((m) => <MemberCard key={m.name} m={m} onSelect={setSelected} />)}
          </div>
        </section>
      )}

      {showPm && filteredPm.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-20">
          <div className="container-prose">
            <SectionHeader
              kicker="Portfolio + Risk Management"
              title="Portfolio + Risk Management"
              blurb="Implement allocation decisions, monitor portfolio risk, manage trading and rebalancing, and own performance attribution."
              count={hasFilter ? filteredPm.length : undefined}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPm.map((m) => <MemberCard key={m.name} m={m} onSelect={setSelected} />)}
            </div>
          </div>
        </section>
      )}
      </div>



      <section className="bg-ink py-24 text-background">
        <div className="container-prose">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold/80">Mentorship</span>
          <h2 className="mt-3 font-display text-3xl font-bold">Faculty Advisor</h2>
          <p className="mt-4 max-w-2xl text-background/70">
            SMIF benefits from the mentorship of finance faculty at the Daniels School of Business, who provide guidance on strategy, governance, and professional development &mdash; and ensure continuity year over year.
          </p>
        </div>
      </section>

      <MemberDetailSheet member={selected} onClose={() => setSelected(null)} />
    </>
  );
}
