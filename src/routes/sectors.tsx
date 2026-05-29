import { createFileRoute } from "@tanstack/react-router";
import { Cpu, HeartPulse, Banknote, Factory, ShoppingBag, Zap, Wifi, Home, LineChart, Briefcase } from "lucide-react";

export const Route = createFileRoute("/sectors")({
  component: Sectors,
  head: () => ({
    meta: [
      { title: "Teams — Purdue SMIF" },
      { name: "description", content: "SMIF coverage spans equity sector teams, Fixed Income & Macro, and Portfolio + Risk Management." },
      { property: "og:title", content: "Coverage Teams — Purdue SMIF" },
      { property: "og:description", content: "Eight equity sector teams plus Fixed Income & Macro and Portfolio + Risk Management cover the SMIF investment universe." },
      { property: "og:url", content: "https://purduesmif.org/sectors" },
    ],
    links: [{ rel: "canonical", href: "https://purduesmif.org/sectors" }],
  }),
});

const sectors = [
  { Icon: Cpu, name: "Information Technology", lead: "Software, semiconductors, IT services." },
  { Icon: HeartPulse, name: "Healthcare & Utilities", lead: "Pharma, medtech, providers, and regulated utilities." },
  { Icon: Banknote, name: "Financials", lead: "Banks, insurance, capital markets." },
  { Icon: ShoppingBag, name: "Consumer Discretionary", lead: "Retail, autos, leisure." },
  { Icon: Home, name: "Consumer Staples", lead: "Food, beverage, household products." },
  { Icon: Factory, name: "Industrials", lead: "Aerospace, machinery, transportation." },
  { Icon: Zap, name: "Energy & Real Estate", lead: "Oil & gas, midstream, REITs, and real estate." },
  { Icon: Wifi, name: "Communications", lead: "Telecom, media, interactive entertainment." },
  { Icon: LineChart, name: "Fixed Income & Macro", lead: "Rates, credit, FX, and global macro themes." },
  { Icon: Briefcase, name: "Portfolio + Risk Management", lead: "Allocation, risk, trading, and performance." },
];

function Sectors() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Coverage</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Our teams.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Eight equity sector teams, a Fixed Income & Macro group, and a Portfolio + Risk Management team. Each meets weekly to discuss positioning, news flow, and pitch ideas.
          </p>
        </div>
      </section>

      <section className="container-prose py-24">
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {sectors.map(({ Icon, name, lead }) => (
            <div key={name} className="bg-background p-8 transition hover:bg-secondary/50">
              <Icon className="h-7 w-7 text-gold-deep" />
              <h3 className="mt-5 font-display text-lg font-bold">{name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{lead}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
