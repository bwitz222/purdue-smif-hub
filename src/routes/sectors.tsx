import { createFileRoute } from "@tanstack/react-router";
import { Cpu, HeartPulse, Banknote, Factory, ShoppingBag, Zap, Building2, Fuel, Truck, Wifi, Home } from "lucide-react";

export const Route = createFileRoute("/sectors")({
  component: Sectors,
  head: () => ({
    meta: [
      { title: "Sectors — Purdue SMIF" },
      { name: "description", content: "SMIF analysts cover all 11 GICS sectors with dedicated sector teams." },
    ],
  }),
});

const sectors = [
  { Icon: Cpu, name: "Information Technology", lead: "Software, semiconductors, IT services." },
  { Icon: HeartPulse, name: "Healthcare", lead: "Pharma, medtech, providers, biotech." },
  { Icon: Banknote, name: "Financials", lead: "Banks, insurance, capital markets." },
  { Icon: ShoppingBag, name: "Consumer Discretionary", lead: "Retail, autos, leisure." },
  { Icon: Home, name: "Consumer Staples", lead: "Food, beverage, household products." },
  { Icon: Factory, name: "Industrials", lead: "Aerospace, machinery, transportation." },
  { Icon: Zap, name: "Energy", lead: "Oil & gas, equipment, services." },
  { Icon: Fuel, name: "Utilities", lead: "Electric, gas, water utilities." },
  { Icon: Building2, name: "Real Estate", lead: "REITs and real estate services." },
  { Icon: Truck, name: "Materials", lead: "Chemicals, metals, packaging." },
  { Icon: Wifi, name: "Communication Services", lead: "Telecom, media, entertainment." },
];

function Sectors() {
  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Coverage</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Sector teams.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Each of the 11 GICS sectors is covered by a dedicated team of analysts led by a sector head. Teams meet weekly to discuss positioning, news flow, and pitch ideas.
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
