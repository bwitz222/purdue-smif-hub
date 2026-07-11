import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import smifLogo from "@/assets/smif-logo-mark.png";
import { applyUrl } from "@/lib/apply-url";
import { NAV } from "@/lib/nav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  // Toggle a data attribute on the header for scroll shadow — avoids React re-renders on every scroll event.
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        header.dataset.scrolled = window.scrollY > 20 ? "true" : "false";
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        id="site-header"
        data-scrolled="false"
        className="sticky top-0 z-50 bg-ink border-b border-white/10 transition-shadow duration-300 data-[scrolled=true]:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
      >
        <div className="container-prose flex h-14 items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <img src={smifLogo} alt="Purdue SMIF" width={28} height={28} decoding="async" className="h-7 w-7 object-contain select-none" />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-on-dark-secondary group-hover:text-gold transition-colors duration-300">
              Purdue SMIF
            </span>
          </Link>
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-5 xl:gap-7">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative py-1 text-xs font-semibold uppercase tracking-[0.14em] text-background/65 hover:text-background transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 motion-reduce:after:transition-none"
                activeProps={{ className: "text-gold after:scale-x-100" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a
              href={applyUrl("header-apply")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] bg-gold text-ink transition-[background-color,transform] duration-150 hover:bg-gold-mid active:scale-95"
            >
              Apply
            </a>
            <button
              className="lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 text-background/70 hover:text-background transition-colors duration-150"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-dvh !rounded-none !border-0 !p-0 bg-ink flex flex-col [&>button.absolute]:hidden"
        >
          <VisuallyHidden asChild>
            <DialogTitle>Navigation menu</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <DialogDescription>Site navigation links</DialogDescription>
          </VisuallyHidden>
          <div className="container-prose flex h-14 items-center justify-between border-b border-white/10 shrink-0">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-on-dark-secondary">Purdue SMIF</span>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 text-background/70 hover:text-background transition-colors duration-150"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col justify-center flex-1 container-prose gap-0 pb-8 overflow-y-auto">
            {NAV.map(({ to, label }, i) =>
              reduce ? (
                <div key={to}>
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className="block font-display text-[2.2rem] sm:text-[2.6rem] font-semibold text-background/55 hover:text-background border-b border-white/5 py-4 transition-colors duration-300 leading-none"
                    activeProps={{ className: "text-gold" }}
                  >
                    {label}
                  </Link>
                </div>
              ) : (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.32, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={to}
                    onClick={() => setOpen(false)}
                    className="block font-display text-[2.2rem] sm:text-[2.6rem] font-semibold text-background/55 hover:text-background border-b border-white/5 py-4 transition-colors duration-300 leading-none"
                    activeProps={{ className: "text-gold" }}
                  >
                    {label}
                  </Link>
                </motion.div>
              )
            )}
            {reduce ? (
              <a
                href={applyUrl("mobile-menu")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-10 inline-flex items-center justify-center py-4 text-sm font-semibold uppercase tracking-[0.16em] bg-gold text-ink hover:bg-gold-mid transition-colors duration-150"
              >
                Apply to Join
              </a>
            ) : (
              <motion.a
                href={applyUrl("mobile-menu")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + NAV.length * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 inline-flex items-center justify-center py-4 text-sm font-semibold uppercase tracking-[0.16em] bg-gold text-ink hover:bg-gold-mid transition-colors duration-150"
              >
                Apply to Join
              </motion.a>
            )}
          </nav>
          <div className="container-prose pb-6 shrink-0">
            <span className="text-xs uppercase tracking-[0.18em] text-on-dark-dim font-mono">
              Daniels School of Business · Est. 2009
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
