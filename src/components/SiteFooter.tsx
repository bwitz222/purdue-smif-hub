import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Newspaper } from "lucide-react";
import smifLogo from "@/assets/smif-logo-mark.png";
import { NAV } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ink text-background">
      <div className="container-prose grid gap-12 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center bg-background p-1.5"><img src={smifLogo} alt="Purdue SMIF" width={44} height={44} loading="lazy" decoding="async" className="h-full w-full object-contain" /></span>
            <div>
              <div className="font-display text-lg font-bold">Purdue SMIF</div>
              <div className="text-xs uppercase tracking-[0.14em] text-on-dark-secondary">Student Managed Investment Fund</div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm font-normal text-on-dark-secondary">
            A student-run investment fund at the Daniels School of Business, managing real capital with a disciplined, thesis-driven process since 2009.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-medium text-gold mb-4 uppercase tracking-[0.14em]">Explore</h2>
          <ul className="space-y-2 text-sm text-on-dark-secondary">
            {NAV.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-gold transition-colors duration-200">{label}</Link>
              </li>
            ))}
            <li>
              <Link to="/alumni" className="hover:text-gold transition-colors duration-200">Alumni</Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-medium text-gold mb-4 uppercase tracking-[0.14em]">Contact</h2>
          <ul className="space-y-2 text-sm text-on-dark-secondary">
            <li>Daniels School of Business</li>
            <li>403 Mitch Daniels Blvd</li>
            <li>West Lafayette, IN 47907</li>
            <li><Link to="/contact" className="hover:text-gold transition-colors duration-200">Get in touch →</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gold mb-4 uppercase tracking-[0.14em]">Social</h2>
          <ul className="space-y-2 text-sm text-on-dark-secondary">
            <li>
              <a href="https://www.instagram.com/smif_purdue/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-gold transition-colors duration-200">
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/purdue-smif/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-gold transition-colors duration-200">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </li>
            <li>
              <a href="https://purduesmif.substack.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-gold transition-colors duration-200">
                <Newspaper className="h-4 w-4" />
                Substack
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container-prose py-5 flex items-center gap-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.32em] text-on-dark-muted whitespace-nowrap">Est. 2009</span>
          <span className="flex-1 h-px bg-gradient-gold opacity-50" aria-hidden="true" />
          <span className="text-[10px] font-mono uppercase tracking-[0.32em] text-on-dark-muted whitespace-nowrap">Present</span>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container-prose flex flex-col md:flex-row items-center justify-between gap-2 py-6 text-xs text-on-dark-dim">
          <span>© {new Date().getFullYear()} Purdue Student Managed Investment Fund. All rights reserved.</span>
          <span>Boiler Up. Hammer Down.</span>
        </div>
      </div>
    </footer>
  );
}
