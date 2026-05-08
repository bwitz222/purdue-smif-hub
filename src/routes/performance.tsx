import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/performance")({
  component: Performance,
  head: () => ({
    meta: [
      { title: "Performance — Purdue SMIF" },
      { name: "description", content: "Track record and historical performance of the Purdue Student Managed Investment Fund." },
    ],
  }),
});

const years = [
  { y: "2024", smif: "+22.4%", bench: "+24.2%" },
  { y: "2023", smif: "+27.1%", bench: "+26.3%" },
  { y: "2022", smif: "−15.8%", bench: "−18.1%" },
  { y: "2021", smif: "+29.6%", bench: "+28.7%" },
  { y: "2020", smif: "+19.2%", bench: "+18.4%" },
  { y: "2019", smif: "+30.1%", bench: "+31.5%" },
];

function Performance() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Performance</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Benchmarked. Transparent. Reviewed quarterly.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Performance is measured against the S&P 500 Total Return Index. Returns shown are illustrative.
          </p>
        </div>
      </section>

      <section className="container-prose py-24">
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {[
            { l: "1Y Return", v: "+22.4%" },
            { l: "5Y Annualized", v: "+15.6%" },
            { l: "Inception Annualized", v: "+12.8%" },
          ].map((k) => (
            <div key={k.l} className="border border-border bg-card p-8">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{k.l}</div>
              <div className="mt-3 font-display text-4xl font-bold text-ink">{k.v}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden border border-border">
          <table className="w-full text-left">
            <thead className="bg-ink text-background">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Year</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">SMIF</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">S&P 500 TR</th>
              </tr>
            </thead>
            <tbody>
              {years.map((r) => (
                <tr key={r.y} className="border-t border-border">
                  <td className="px-6 py-5 font-display font-bold">{r.y}</td>
                  <td className="px-6 py-5 font-mono">{r.smif}</td>
                  <td className="px-6 py-5 font-mono text-muted-foreground">{r.bench}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-xs text-muted-foreground max-w-3xl">
          Past performance does not guarantee future results. Figures shown for illustrative purposes; consult the latest annual report for audited returns.
        </p>
      </section>
    </>
  );
}
