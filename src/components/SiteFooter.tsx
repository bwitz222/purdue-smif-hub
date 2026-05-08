import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-ink text-background">
      <div className="container-prose grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-gold text-ink font-display text-lg font-bold">P</span>
            <div>
              <div className="font-display text-lg font-bold">Purdue SMIF</div>
              <div className="text-xs uppercase tracking-[0.18em] text-background/60">Student Managed Investment Fund</div>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm text-background/70">
            A premier student-run investment fund at the Daniels School of Business, managing real capital and developing the next generation of investment professionals.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold mb-4 uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
            <li><Link to="/team" className="hover:text-gold">Team</Link></li>
            <li><Link to="/sectors" className="hover:text-gold">Sectors</Link></li>
            <li><Link to="/performance" className="hover:text-gold">Performance</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold mb-4 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-2 text-sm text-background/70">
            <li>Daniels School of Business</li>
            <li>403 W State Street</li>
            <li>West Lafayette, IN 47907</li>
            <li><Link to="/contact" className="hover:text-gold">Get in touch →</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container-prose flex flex-col md:flex-row items-center justify-between gap-2 py-6 text-xs text-background/50">
          <span>© {new Date().getFullYear()} Purdue Student Managed Investment Fund. All rights reserved.</span>
          <span>Boiler Up. Hammer Down.</span>
        </div>
      </div>
    </footer>
  );
}
