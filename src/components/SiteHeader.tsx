import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/about",        label: "About"       },
  { to: "/team",         label: "Team"        },
  { to: "/sectors",      label: "Sectors"     },
  { to: "/holdings",     label: "Holdings"    },
  { to: "/performance",  label: "Performance" },
  { to: "/publications", label: "Research"    },
  { to: "/contact",      label: "Contact"     },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-ink border-b border-white/8 transition-shadow duration-300"
        style={{ boxShadow: scrolled ? "0 4px 24px -4px rgba(0,0,0,0.4)" : "none" }}
      >
        <div className="container-prose flex h-14 items-center justify-between">
          <Link to="/" className="group flex items-center gap-3 shrink-0">
            <span className="flex h-7 w-7 items-center justify-center bg-gold text-ink font-display text-sm font-bold leading-none select-none">
              P
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-background/60 group-hover:text-background transition-colors duration-200">
              SMIF
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(({ to, label }) => (
              <Link key={to} to={to} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-background/45 hover:text-background transition-colors duration-200 py-1" activeProps={{ className: "text-gold" }}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a href="https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] bg-gold text-ink hover:bg-gold-mid transition-colors duration-200">Apply</a>
            <button className="md:hidden text-background/60 hover:text-background transition-colors duration-200 p-1" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>
      <div className="fixed inset-0 z-[60] bg-ink flex flex-col transition-opacity duration-300" style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}>
        <div className="container-prose flex h-14 items-center justify-between border-b border-white/8 shrink-0">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-background/60">SMIF</span>
          <button onClick={() => setOpen(false)} className="text-background/60 hover:text-background transition-colors duration-200 p-1" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex flex-col justify-center flex-1 container-prose gap-0 pb-8">
          {NAV.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="font-display text-[2.6rem] font-bold text-background/30 hover:text-background border-b border-white/5 py-4 transition-colors duration-200 leading-none" activeProps={{ className: "text-gold" }}>{label}</Link>
          ))}
          <a href="https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="mt-10 inline-flex items-center justify-center py-4 text-sm font-semibold uppercase tracking-[0.18em] bg-gold text-ink hover:bg-gold-mid transition-colors duration-200">Apply to Join</a>
        </nav>
        <div className="container-prose pb-6 shrink-0"><span className="text-[10px] uppercase tracking-[0.3em] text-background/20 font-mono">Daniels School of Business · Est. 2009</span></div>
      </div>
    </>
  );
}
