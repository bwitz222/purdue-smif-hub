import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/team")({
  component: Team,
  head: () => ({
    meta: [
      { title: "Team — Purdue SMIF" },
      { name: "description", content: "Meet the executive board and analysts of the Purdue Student Managed Investment Fund." },
    ],
  }),
});

const exec = [
  { name: "Aaron Mitchell", role: "President", year: "Senior · Finance" },
  { name: "Priya Shah", role: "Chief Investment Officer", role2: "", year: "Senior · Quantitative Finance" },
  { name: "Marcus Chen", role: "VP, Research", year: "Junior · Economics" },
  { name: "Elena Rodríguez", role: "VP, Risk Management", year: "Senior · Industrial Engineering" },
  { name: "Tyler Brooks", role: "VP, Recruiting", year: "Junior · Finance" },
  { name: "Anjali Patel", role: "Treasurer", year: "Junior · Accounting" },
];

function Team() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Team</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">The people behind the portfolio.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            SMIF is led by an executive board of senior students elected each spring, supported by sector heads and a deep bench of analysts.
          </p>
        </div>
      </section>

      <section className="container-prose py-24">
        <h2 className="font-display text-3xl font-bold mb-12">Executive Board</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {exec.map((m) => (
            <div key={m.name} className="group border border-border bg-card p-8 transition hover:border-gold hover:shadow-elegant">
              <div className="aspect-square w-full bg-gradient-gold mb-6 grid place-items-center">
                <span className="font-display text-5xl font-bold text-ink/30">
                  {m.name.split(" ").map((p) => p[0]).join("")}
                </span>
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">{m.role}</div>
              <div className="mt-2 font-display text-xl font-bold">{m.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{m.year}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-background py-24">
        <div className="container-prose">
          <h2 className="font-display text-3xl font-bold mb-4">Faculty Advisor</h2>
          <p className="max-w-2xl text-background/70">SMIF benefits from the mentorship of finance faculty at the Daniels School of Business, who provide guidance on strategy, governance, and professional development.</p>
        </div>
      </section>
    </>
  );
}
