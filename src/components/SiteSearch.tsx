import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, FileText, User, TrendingUp, ArrowUpRight, CornerDownLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { NAV_LINKS, type NavLink } from "@/lib/nav";
import { memberDirectory } from "@/data/team";
import { holdings } from "@/data/holdings";
import { getPublications } from "@/lib/publications.functions";
import { SERIES_LABEL } from "@/lib/publication-series";

type Result = {
  id: string;
  kind: "Page" | "Person" | "Holding" | "Research";
  title: string;
  detail: string;
  /** Internal route, or an absolute URL that opens in a new tab. */
  href: string;
  external?: boolean;
  /** Lower-cased text the query is matched against. */
  haystack: string;
};

const PAGES: NavLink[] = [
  ...NAV_LINKS,
  { to: "/contact", label: "Contact", description: "Email the fund or send a message" },
  {
    to: "/finance-clubs-at-purdue",
    label: "Finance Clubs at Purdue",
    description: "How SMIF compares with the other finance clubs",
  },
];

const STATIC_RESULTS: Result[] = [
  ...PAGES.map((p) => ({
    id: `page:${p.to}`,
    kind: "Page" as const,
    title: p.label,
    detail: p.description ?? "",
    href: p.to,
    haystack: `${p.label} ${p.description ?? ""}`.toLowerCase(),
  })),
  ...memberDirectory.map((e) => ({
    id: `person:${e.slug}`,
    kind: "Person" as const,
    title: e.member.name,
    detail: [e.member.role, e.team].filter(Boolean).join(" · "),
    href: `/team/${e.slug}`,
    haystack: `${e.member.name} ${e.member.role} ${e.team}`.toLowerCase(),
  })),
  ...holdings.map((h) => ({
    id: `holding:${h.symbol}`,
    kind: "Holding" as const,
    title: `${h.symbol} · ${h.company}`,
    detail: h.industry,
    href: "/holdings",
    haystack: `${h.symbol} ${h.company} ${h.industry}`.toLowerCase(),
  })),
];

const ICON = { Page: ArrowUpRight, Person: User, Holding: TrendingUp, Research: FileText };
const KIND_ORDER: Result["kind"][] = ["Page", "Research", "Holding", "Person"];
const KIND_LABEL = { Page: "Pages", Person: "People", Holding: "Holdings", Research: "Research" };
const PER_KIND = 6;

/** Rank: title prefix, then word prefix, then substring anywhere. */
function score(r: Result, q: string): number {
  const t = r.title.toLowerCase();
  if (t.startsWith(q)) return 0;
  if (t.split(/[\s·&+-]+/).some((w) => w.startsWith(q))) return 1;
  if (t.includes(q)) return 2;
  return r.haystack.includes(q) ? 3 : -1;
}

export function SiteSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();
  const fetchPubs = useServerFn(getPublications);
  // Fetched only once the dialog is opened; cached for the session after that.
  const { data: pubs } = useQuery({
    queryKey: ["publications"],
    queryFn: () => fetchPubs(),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  });
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const research: Result[] = (pubs ?? []).map((p) => ({
      id: `pub:${p.id}`,
      kind: "Research" as const,
      title: p.title,
      detail: [SERIES_LABEL[p.category], p.ticker, (p.authors ?? []).join(", ")]
        .filter(Boolean)
        .join(" · "),
      href: p.url,
      external: true,
      haystack:
        `${p.title} ${p.description ?? ""} ${p.ticker ?? ""} ${p.sector ?? ""} ${(p.authors ?? []).join(" ")}`.toLowerCase(),
    }));
    const all = [...STATIC_RESULTS, ...research];
    if (!q) return STATIC_RESULTS.filter((r) => r.kind === "Page");
    const out: Result[] = [];
    for (const kind of KIND_ORDER) {
      out.push(
        ...all
          .filter((r) => r.kind === kind)
          .map((r) => ({ r, s: score(r, q) }))
          .filter((x) => x.s >= 0)
          .sort((a, b) => a.s - b.s || a.r.title.localeCompare(b.r.title))
          .slice(0, PER_KIND)
          .map((x) => x.r),
      );
    }
    return out;
  }, [query, pubs]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (r: Result) => {
    onOpenChange(false);
    if (r.external) window.open(r.href, "_blank", "noopener,noreferrer");
    else void navigate({ href: r.href });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!top-[12vh] !translate-y-0 max-w-xl gap-0 !rounded-none border-border p-0 [&>button.absolute]:hidden">
        <VisuallyHidden asChild>
          <DialogTitle>Search the site</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden asChild>
          <DialogDescription>Find pages, research, holdings and members.</DialogDescription>
        </VisuallyHidden>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, research, tickers, people"
            aria-label="Search the site"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={results.length > 0 ? listId : undefined}
            aria-activedescendant={results[active] ? optionId(active) : undefined}
            aria-autocomplete="list"
            className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline">
            Esc
          </kbd>
        </div>
        {results.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No matches for "{query.trim()}".
          </p>
        ) : (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Results"
            className="max-h-[60vh] overflow-y-auto py-2"
          >
            {KIND_ORDER.filter((k) => results.some((r) => r.kind === k)).map((kind) => (
              <li key={kind} role="group" aria-label={KIND_LABEL[kind]}>
                <div
                  aria-hidden="true"
                  className="px-4 pb-1 pt-3 text-xs font-semibold text-muted-foreground"
                >
                  {KIND_LABEL[kind]}
                </div>
                {results.map((r, i) => {
                  if (r.kind !== kind) return null;
                  const Icon = ICON[r.kind];
                  return (
                    <div
                      key={r.id}
                      id={optionId(i)}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(r)}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${
                        i === active ? "bg-secondary" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-gold-deep" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {r.title}
                        </span>
                        {r.detail && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {r.detail}
                          </span>
                        )}
                      </span>
                      {i === active && (
                        <CornerDownLeft
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
