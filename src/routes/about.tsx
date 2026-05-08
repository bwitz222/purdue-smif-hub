import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — Purdue SMIF" },
      { name: "description", content: "Learn about the Purdue Student Managed Investment Fund's history, philosophy, and approach to investing." },
    ],
  }),
});

function About() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">About</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">A legacy of disciplined investing at Purdue.</h1>
        </div>
      </section>

      <section className="container-prose py-24 grid gap-16 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="font-display text-2xl font-bold">Our History</h2>
        </div>
        <div className="md:col-span-2 space-y-6 text-lg text-muted-foreground">
          <p>
            Founded at the Daniels School of Business, the Purdue Student Managed Investment Fund began as a small group of finance students with a single conviction: that the best way to learn investing is to invest. From an initial capital allocation, the fund has grown to manage millions in real assets on behalf of the university.
          </p>
          <p>
            Today, SMIF stands as one of the most selective and respected student organizations on campus, with members placing at firms like Morgan Stanley, Barclays, BMO Capital Markets, Wells Fargo, and Big 4 accounting firms.
          </p>
        </div>
      </section>

      <section className="bg-ink text-background py-24">
        <div className="container-prose grid gap-16 md:grid-cols-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-gold">Philosophy</h2>
          </div>
          <div className="md:col-span-2 space-y-6 text-lg text-background/80">
            <p>
              We are long-term, fundamentally-driven investors. Every position must be supported by a rigorous thesis: a differentiated view, a defensible valuation, and a clearly-articulated catalyst path.
            </p>
            <p>
              We invest with patience, manage risk with discipline, and prize intellectual honesty above all else. When the facts change, we change our minds.
            </p>
          </div>
        </div>
      </section>

      <section className="container-prose py-24">
        <h2 className="font-display text-3xl font-bold mb-12">Our Process</h2>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { n: "01", t: "Idea Generation", d: "Analysts screen their sectors for compelling setups." },
            { n: "02", t: "Deep Research", d: "Financial modeling, channel checks, and management review." },
            { n: "03", t: "Pitch & Debate", d: "Theses defended before the full investment committee." },
            { n: "04", t: "Vote & Monitor", d: "Members vote; positions are tracked and reviewed quarterly." },
          ].map((s) => (
            <div key={s.n} className="border-t-2 border-gold pt-6">
              <div className="font-display text-3xl font-bold text-gold-deep">{s.n}</div>
              <h3 className="mt-3 font-display text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
