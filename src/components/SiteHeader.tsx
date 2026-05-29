import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import smifLogo from "@/assets/smif-logo-mark.png";

const NAV = [
  { to: "/about",        label: "About"      },
  { to: "/team",         label: "Team"       },
  { to: "/holdings",     label: "Portfolio"  },
  { to: "/publications", label: "Research"   },
  { to: "/recruiting",   label: "Recruiting" },
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

  // Close mobile menu on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-ink border-b border-white/8 transition-shadow duration-300"
        style={{ boxShadow: scrolled ? "0 4px 24px -4px rgba(0,0,0,0.4)" : "none" }}
      >
        <div className="container-prose flex h-14 items-center justify-between">
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <img src={smifLogo} alt="Purdue SMIF" className="h-7 w-7 object-contain select-none" />
            <span className="font-mono text-xs uppercase tracking-[0.28em] text-background/70 group-hover:text-gold transition-colors duration-300">
              SMIF
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-background/45 hover:text-background transition-colors duration-300 py-1"
                activeProps={{ className: "text-gold" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] bg-gold text-ink transition-[background-color,transform] duration-150 hover:bg-gold-mid active:scale-95"
            >
              Apply
            </a>
            <button
              className="md:hidden text-background/70 hover:text-background transition-colors duration-150 p-1"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-ink flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="container-prose flex h-14 items-center justify-between border-b border-white/8 shrink-0">
              <span className="font-mono text-xs uppercase tracking-[0.28em] text-background/70">SMIF</span>
              <button
                onClick={() => setOpen(false)}
                className="text-background/70 hover:text-background transition-colors duration-150 p-1"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col justify-center flex-1 container-prose gap-0 pb-8">
              {NAV.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className="block font-display text-[2.6rem] font-bold text-background/30 hover:text-background border-b border-white/5 py-4 transition-colors duration-300 leading-none"
                    activeProps={{ className: "text-gold" }}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
              <motion.a
                href="https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + NAV.length * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 inline-flex items-center justify-center py-4 text-sm font-semibold uppercase tracking-[0.18em] bg-gold text-ink hover:bg-gold-mid transition-colors duration-150"
              >
                Apply to Join
              </motion.a>
            </nav>
            <div className="container-prose pb-6 shrink-0">
              <span className="text-xs uppercase tracking-[0.3em] text-background/20 font-mono">
                Daniels School of Business · Est. 2009
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
