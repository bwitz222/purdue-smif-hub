import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import smifLogo from "@/assets/smif-logo-mark.png";
import { applyUrl } from "@/lib/apply-url";
import { NAV } from "@/lib/nav";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header id="site-header" className="sticky top-0 z-50 bg-ink">
        <div className="container-prose flex h-14 items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <img
              src={smifLogo}
              alt="Purdue SMIF"
              width={28}
              height={28}
              decoding="async"
              className="h-7 w-7 object-contain select-none"
            />
            <span className="text-base font-bold text-background group-hover:text-gold">
              Purdue SMIF
            </span>
          </Link>
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-5 xl:gap-7">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="relative py-1 text-sm text-on-dark-secondary hover:text-background after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-200 hover:after:scale-x-100 motion-reduce:after:transition-none"
                activeProps={{ className: "text-background after:scale-x-100" }}
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
              className="press hidden lg:inline-flex items-center rounded-sm px-4 py-1.5 text-sm font-bold bg-gold text-ink hover:bg-gold-mid"
            >
              Apply
            </a>
            <button
              className="press lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 text-on-dark-secondary hover:text-background"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Report-cover strip from the SMIF deck chrome. The one signature. */}
        <div className="report-strip" aria-hidden="true" />
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
            <span className="text-base font-bold text-background">Purdue SMIF</span>
            <button
              onClick={() => setOpen(false)}
              className="press inline-flex items-center justify-center min-h-11 min-w-11 -mr-2 text-on-dark-secondary hover:text-background"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col flex-1 container-prose pt-4 pb-8 overflow-y-auto">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="block text-2xl text-on-dark-secondary hover:text-background border-b border-white/10 py-4"
                activeProps={{ className: "text-gold" }}
              >
                {label}
              </Link>
            ))}
            <a
              href={applyUrl("mobile-menu")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="press mt-8 inline-flex items-center justify-center rounded-sm py-4 text-base font-bold bg-gold text-ink hover:bg-gold-mid"
            >
              Apply to Join
            </a>
          </nav>
          <div className="container-prose pb-6 shrink-0">
            <span className="text-sm text-on-dark-muted">
              Daniels School of Business, est. 1995
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
