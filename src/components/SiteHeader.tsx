import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import smifLogo from "@/assets/smif-logo-mark.png";
import { applyUrl } from "@/lib/apply-url";
import { NAV_GROUPS, groupForPath } from "@/lib/nav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { pathname } = useLocation();
  const activeGroup = groupForPath(pathname);

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
            <img
              src={smifLogo}
              alt="Purdue SMIF"
              width={28}
              height={28}
              decoding="async"
              className="h-7 w-7 object-contain select-none icon-pop"
            />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-on-dark-secondary group-hover:text-gold transition-colors duration-300">
              Purdue SMIF
            </span>
          </Link>

          {/* Desktop: three grouped triggers. Radix supplies the roving focus,
              Escape handling, and focus return that a hand-rolled dropdown
              reliably gets wrong. */}
          <NavigationMenu.Root
            aria-label="Primary"
            delayDuration={80}
            className="relative hidden lg:block"
          >
            <NavigationMenu.List className="flex items-center gap-7">
              {NAV_GROUPS.map((group) => {
                const isActive = activeGroup === group.label;
                return (
                  <NavigationMenu.Item key={group.label}>
                    <NavigationMenu.Trigger
                      className={`group relative inline-flex items-center gap-1.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-300 cursor-pointer after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:after:transition-none hover:text-background data-[state=open]:text-background data-[state=open]:after:scale-x-100 ${
                        isActive
                          ? "text-gold after:scale-x-100"
                          : "text-background/65 after:scale-x-0"
                      }`}
                    >
                      {group.label}
                      <ChevronDown
                        aria-hidden="true"
                        className="h-3 w-3 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </NavigationMenu.Trigger>
                    <NavigationMenu.Content className="absolute left-0 top-full w-[22rem] data-[state=open]:animate-fade-in">
                      <div className="mt-3 border border-white/12 bg-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]">
                        <div className="border-b border-white/10 px-5 py-3">
                          <span aria-hidden="true" className="block h-0.5 w-8 bg-gradient-gold" />
                          <p className="mt-2.5 text-xs text-on-dark-secondary">{group.summary}</p>
                        </div>
                        <ul className="p-2">
                          {group.items.map((item) => (
                            <li key={item.to}>
                              <NavigationMenu.Link asChild>
                                <Link
                                  to={item.to}
                                  className="row-rail block px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.04]"
                                  activeProps={{ className: "bg-white/[0.06]" }}
                                >
                                  <span className="block text-sm font-semibold text-background/90">
                                    {item.label}
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-snug text-on-dark-muted">
                                    {item.blurb}
                                  </span>
                                </Link>
                              </NavigationMenu.Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenu.Content>
                  </NavigationMenu.Item>
                );
              })}
            </NavigationMenu.List>
          </NavigationMenu.Root>

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
              className="press lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 text-background/70 hover:text-background"
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
        <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-dvh !rounded-none !border-0 !p-0 bg-ink flex flex-col [&>button.absolute]:hidden">
          <VisuallyHidden asChild>
            <DialogTitle>Navigation menu</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <DialogDescription>Site navigation links</DialogDescription>
          </VisuallyHidden>
          <div className="container-prose flex h-14 items-center justify-between border-b border-white/10 shrink-0">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-on-dark-secondary">
              Purdue SMIF
            </span>
            <button
              onClick={() => setOpen(false)}
              className="press inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 text-background/70 hover:text-background"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile: the same three groups as labelled sections. Ten flat links
              on a phone is a scroll; three groups is a glance. */}
          <nav
            aria-label="Primary"
            className="flex flex-col justify-center flex-1 container-prose gap-0 pb-8 overflow-y-auto"
          >
            {NAV_GROUPS.map((group, gi) => (
              <MobileGroup key={group.label} label={group.label} reduce={!!reduce} index={gi}>
                {group.items.map((item, i) => (
                  <MobileLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    reduce={!!reduce}
                    delay={0.05 + (gi * 3 + i) * 0.04}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </MobileGroup>
            ))}
            <a
              href={applyUrl("mobile-menu")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex items-center justify-center py-4 text-sm font-semibold uppercase tracking-[0.16em] bg-gold text-ink hover:bg-gold-mid transition-colors duration-150"
            >
              Apply to Join
            </a>
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

function MobileGroup({
  label,
  index,
  reduce,
  children,
}: {
  label: string;
  index: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  const header = (
    <div className="flex items-center gap-3 pt-6 pb-2 first:pt-0">
      <span aria-hidden="true" className="h-px w-6 bg-gradient-gold" />
      <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
        {label}
      </h2>
    </div>
  );
  if (reduce)
    return (
      <div>
        {header}
        {children}
      </div>
    );
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      {header}
      {children}
    </motion.div>
  );
}

function MobileLink({
  to,
  label,
  reduce,
  delay,
  onNavigate,
}: {
  to: string;
  label: string;
  reduce: boolean;
  delay: number;
  onNavigate: () => void;
}) {
  const link = (
    <Link
      to={to}
      onClick={onNavigate}
      className="block font-display text-[1.75rem] sm:text-[2rem] font-semibold text-background/55 hover:text-background border-b border-white/5 py-3 transition-colors duration-300 leading-none"
      activeProps={{ className: "text-gold" }}
    >
      {label}
    </Link>
  );
  if (reduce) return <div>{link}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {link}
    </motion.div>
  );
}
