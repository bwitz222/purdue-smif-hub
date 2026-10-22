import { Link, useRouterState } from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect, useId, useRef } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import smifLogo from "@/assets/smif-logo-mark.png";
import { ApplyCta } from "@/components/ApplyCta";
// Loaded on first open: it bundles the roster and holdings index, which no
// page needs until someone searches.
const SiteSearch = lazy(() =>
  import("@/components/SiteSearch").then((m) => ({ default: m.SiteSearch })),
);
import { NAV, SUBSTACK_URL, isGroup, type NavGroup } from "@/lib/nav";

const linkBase =
  "relative inline-flex min-h-10 items-center px-3 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold";

/** Desktop dropdown: a disclosure button and a panel of links. */
function NavDropdown({
  group,
  open,
  onToggle,
  onClose,
  pathname,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  pathname: string;
}) {
  const id = useId();
  const active = group.children.some((c) => pathname.startsWith(c.to));
  return (
    <div className="relative" data-nav-dropdown>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className={`${linkBase} gap-1 ${active ? "text-gold" : "text-background/75 hover:text-background"}`}
      >
        {group.label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        id={id}
        hidden={!open}
        className="absolute left-0 top-full z-50 mt-2 w-80 border border-white/10 bg-ink p-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]"
      >
        <ul>
          {group.children.map((c) => (
            <li key={c.to}>
              <Link
                to={c.to}
                onClick={onClose}
                className="block px-3 py-2.5 transition-colors duration-150 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
              >
                <span
                  className={`block text-sm font-semibold ${pathname.startsWith(c.to) ? "text-gold" : "text-background"}`}
                >
                  {c.label}
                </span>
                {c.description && (
                  <span className="mt-0.5 block text-xs text-on-dark-secondary">
                    {c.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  // Mount the (lazy) search dialog the first time it is asked for, then keep
  // it mounted so closing and reopening is instant.
  const [searchLoaded, setSearchLoaded] = useState(false);
  useEffect(() => {
    if (searchOpen) setSearchLoaded(true);
  }, [searchOpen]);
  const reduce = useReducedMotion();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navRef = useRef<HTMLElement>(null);

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

  // Close any open dropdown on navigation, outside click, or Escape.
  useEffect(() => setMenu(null), [pathname]);
  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // "/" or Cmd/Ctrl+K opens search, unless the visitor is typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        id="site-header"
        data-scrolled="false"
        className="sticky top-0 z-50 bg-ink border-b border-white/10 transition-shadow duration-300 data-[scrolled=true]:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
      >
        <div className="container-prose flex h-14 items-center gap-6">
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <img
              src={smifLogo}
              alt="Purdue SMIF"
              width={28}
              height={28}
              decoding="async"
              className="h-7 w-7 object-contain select-none icon-pop"
            />
            <span className="font-display text-lg font-bold text-background group-hover:text-gold transition-colors duration-300">
              Purdue SMIF
            </span>
          </Link>
          <nav ref={navRef} aria-label="Primary" className="hidden lg:flex items-center">
            {NAV.map((item) =>
              isGroup(item) ? (
                <NavDropdown
                  key={item.label}
                  group={item}
                  open={menu === item.label}
                  onToggle={() => setMenu((m) => (m === item.label ? null : item.label))}
                  onClose={() => setMenu(null)}
                  pathname={pathname}
                />
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${linkBase} text-background/75 hover:text-background after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none`}
                  activeProps={{ className: "!text-gold after:scale-x-100" }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="ml-auto flex items-center gap-1 lg:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search the site"
              aria-keyshortcuts="/ Control+K Meta+K"
              className="press inline-flex min-h-11 min-w-11 items-center justify-center gap-2 text-background/75 hover:text-background xl:min-w-0 xl:px-2"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="hidden text-sm xl:inline">Search</span>
            </button>
            <a
              href={SUBSTACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex min-h-10 items-center px-2 text-sm text-background/75 hover:text-background"
            >
              Subscribe
            </a>
            <Link
              to="/contact"
              className="hidden xl:inline-flex min-h-10 items-center px-2 text-sm text-background/75 hover:text-background"
              activeProps={{ className: "!text-gold" }}
            >
              Contact
            </Link>
            <ApplyCta
              placement="header-apply"
              openLabel="Apply"
              icon={false}
              className="hidden lg:inline-flex ml-2 min-h-10 items-center px-4 text-sm font-semibold bg-gold text-ink transition-[background-color,transform] duration-150 hover:bg-gold-mid active:scale-95"
            />
            <button
              className="press lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 text-background/75 hover:text-background"
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

      {searchLoaded && (
        <Suspense fallback={null}>
          <SiteSearch open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!fixed !inset-0 !left-0 !top-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-dvh !rounded-none !border-0 !p-0 bg-ink flex flex-col gap-0 [&>button.absolute]:hidden">
          <VisuallyHidden asChild>
            <DialogTitle>Navigation menu</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden asChild>
            <DialogDescription>Site navigation links</DialogDescription>
          </VisuallyHidden>
          <div className="container-prose flex w-full h-14 items-center justify-between border-b border-white/10 shrink-0">
            <span className="font-display text-lg font-bold text-background">Purdue SMIF</span>
            <button
              onClick={() => setOpen(false)}
              className="press inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 text-background/75 hover:text-background"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav
            aria-label="Mobile"
            className="flex w-full flex-col flex-1 container-prose py-6 overflow-y-auto"
          >
            {NAV.map((item, i) => {
              const body = isGroup(item) ? (
                <div className="border-b border-white/10 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                    {item.label}
                  </div>
                  <ul className="mt-2">
                    {item.children.map((c) => (
                      <li key={c.to}>
                        <Link
                          to={c.to}
                          onClick={() => setOpen(false)}
                          className="flex min-h-11 items-center font-display text-2xl font-semibold text-background/75 hover:text-background"
                          activeProps={{ className: "!text-gold" }}
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-16 items-center border-b border-white/10 font-display text-2xl font-semibold text-background/75 hover:text-background"
                  activeProps={{ className: "!text-gold" }}
                >
                  {item.label}
                </Link>
              );
              const key = isGroup(item) ? item.label : item.to;
              return reduce ? (
                <div key={key}>{body}</div>
              ) : (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                >
                  {body}
                </motion.div>
              );
            })}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-on-dark-secondary">
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center hover:text-background"
              >
                Contact
              </Link>
              <a
                href={SUBSTACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center hover:text-background"
              >
                Subscribe to The Macro Brief
              </a>
            </div>
            <ApplyCta
              placement="mobile-menu"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center justify-center gap-2 py-4 text-sm font-semibold bg-gold text-ink hover:bg-gold-mid transition-colors duration-150"
            />
          </nav>
          <div className="container-prose w-full pb-6 shrink-0">
            <span className="text-xs text-on-dark-secondary">
              Daniels School of Business · Est. 1995
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
