import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

type NavLink = {
  to: "/" | "/about" | "/team" | "/sectors" | "/holdings" | "/performance" | "/publications" | "/contact";
  label: string;
};

const links: { primary: NavLink; children?: NavLink[] }[] = [
  { primary: { to: "/", label: "Home" } },
  { primary: { to: "/about", label: "About" } },
  { primary: { to: "/team", label: "Team" } },
  { primary: { to: "/sectors", label: "Sectors" } },
  {
    primary: { to: "/holdings", label: "Holdings" },
    children: [{ to: "/performance", label: "Performance" }],
  },
  { primary: { to: "/publications", label: "Publications" } },
  { primary: { to: "/contact", label: "Contact" } },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-prose flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center bg-ink text-gold font-display text-lg font-bold">P</span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold tracking-tight">Purdue SMIF</span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Student Managed Investment Fund</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <div key={l.primary.to} className="relative group">
              <Link
                to={l.primary.to}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: "text-foreground" }}
                activeOptions={{ exact: l.primary.to === "/" }}
              >
                {l.primary.label}
                {l.children && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>
              {l.children && (
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="min-w-[12rem] border border-border bg-background shadow-elegant">
                    {l.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                        activeProps={{ className: "text-foreground bg-secondary" }}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-prose flex flex-col py-4 gap-3">
            {links.map((l) => (
              <div key={l.primary.to} className="flex flex-col">
                <Link to={l.primary.to} onClick={() => setOpen(false)} className="text-sm font-medium py-2">
                  {l.primary.label}
                </Link>
                {l.children?.map((c) => (
                  <Link key={c.to} to={c.to} onClick={() => setOpen(false)} className="pl-4 text-sm text-muted-foreground py-1.5">
                    {c.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
