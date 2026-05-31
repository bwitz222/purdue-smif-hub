import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Newspaper } from "lucide-react";
import smifLogo from "@/assets/smif-logo-mark.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ink text-background">
      <div className="container-prose grid gap-12 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center bg-background p-1.5"><img src={smifLogo} alt="Purdue SMIF" className="h-full w-full object-contain" /></span>
            <div>
              <div className="font-display text-lg font-bold">Purdue SMIF</div>
              <div className="text-xs uppercase tracking-[0.14em] text-on-dark-secondary">Student Managed Investment Fund</div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm font-normal text-on-dark-secondary">
            A premier student-run investment fund at the Daniels School of Business, managing real capital and developing the next generation of investment professionals.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gold mb-4 uppercase tracking-[0.14em]">Explore</h4>
          <ul className="space-y-2 text-sm text-on-dark-secondary">
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/team" className="hover:text-gold">Team</Link></li>
            <li><Link to="/sectors" className="hover:text-gold">Sectors</Link></li>
            <li><Link to="/holdings" className="hover:text-gold">Holdings</Link></li>
            <li><Link to="/performance" className="hover:text-gold">Performance</Link></li>
            <li><Link to="/publications" className="hover:text-gold">Research</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gold mb-4 uppercase tracking-[0.14em]">Contact</h4>
          <ul className="space-y-2 text-sm text-on-dark-secondary">
            <li>Daniels School of Business</li>
            <li>403 Mitch Daniels Blvd</li>
            <li>West Lafayette, IN 47907</li>
            <li><Link to="/contact" className="hover:text-gold">Get in touch →</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gold mb-4 uppercase tracking-[0.14em]">Social</h4>
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
        <div className="container-prose flex flex-col md:flex-row items-center justify-between gap-2 py-6 text-xs text-on-dark-dim">
          <span>© {new Date().getFullYear()} Purdue Student Managed Investment Fund. All rights reserved.</span>
          <span>Boiler Up. Hammer Down.</span>
        </div>
      </div>
    </footer>
  );
}
