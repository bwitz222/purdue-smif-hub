import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { socialMeta, canonical } from "@/lib/seo";

const APPLICATION_URL = "https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m";

export const Route = createFileRoute("/apply")({
  component: Apply,
  head: () => ({
    meta: [
      { title: "Apply — Purdue SMIF" },
      { name: "description", content: "Apply to join the Purdue Student Managed Investment Fund — application portal and recruiting calendar." },
      ...socialMeta({
        title: "Apply to Join Purdue SMIF",
        description: "Application portal and recruiting calendar for joining the Purdue Student Managed Investment Fund.",
        url: canonical("/apply"),
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/apply") }],
  }),
});

/**
 * /apply is a thin landing — the full recruiting calendar + interview prep
 * lives on /recruiting (single canonical page). This page links straight to
 * the application portal and points visitors to /recruiting for context.
 */
function Apply() {
  return (
    <section className="bg-ink text-background">
      <div className="container-prose py-28 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Apply</span>
        <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl" style={{ lineHeight: "1.02" }}>
          We can't wait<br />to meet you.
        </h1>
        <p className="mt-6 text-lg text-on-dark-secondary">
          Applications are open. Submit through the official portal below, then visit our recruiting page for the full event calendar and interview prep guide.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={APPLICATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gold px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-mid"
          >
            Open Application Portal <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            to="/recruiting"
            className="inline-flex items-center gap-2 border border-background/30 px-7 py-3.5 text-sm font-semibold text-background transition hover:border-gold hover:text-gold"
          >
            Recruiting calendar & prep guide
          </Link>
        </div>
        <p className="mt-12 text-sm text-on-dark-muted">
          Questions? Email{" "}
          <a href="mailto:smif26@purdue.edu" className="text-gold underline underline-offset-4 hover:text-gold-mid">
            smif26@purdue.edu
          </a>
          .
        </p>
      </div>
    </section>
  );
}
