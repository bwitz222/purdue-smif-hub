import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Linkedin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — Purdue SMIF" },
      { name: "description", content: "Get in touch with the Purdue Student Managed Investment Fund." },
    ],
  }),
});

function Contact() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Contact</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Get in touch.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Prospective members, alumni, sponsors, and recruiters — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="container-prose py-24">
        <h2 className="font-display text-3xl font-bold">Reach the Fund</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <div className="flex gap-5">
            <Mail className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</div>
              <a href="mailto:smif26@purdue.edu" className="mt-1 block font-display text-lg font-semibold hover:text-gold-deep">
                smif26@purdue.edu
              </a>
            </div>
          </div>
          <div className="flex gap-5">
            <MapPin className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Address</div>
              <div className="mt-1 font-display text-lg font-semibold">Daniels School of Business</div>
              <div className="text-muted-foreground">403 W State Street<br />West Lafayette, IN 47907</div>
            </div>
          </div>
          <div className="flex gap-5">
            <Linkedin className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">LinkedIn</div>
              <a
                href="https://www.linkedin.com/company/purdue-smif/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-display text-lg font-semibold hover:text-gold-deep"
              >
                Purdue SMIF
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
