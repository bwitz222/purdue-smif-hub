import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, HeartPulse, Banknote, Factory, ShoppingBag, Zap, Wifi, Home, LineChart, Briefcase } from "lucide-react";
import { socialMeta, canonical } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

export const Route = createFileRoute("/sectors")({
  component: Sectors,
  head: () => ({
    meta: [
      { title: "Coverage Teams | Purdue SMIF" },
      { name: "description", content: "SMIF coverage spans eight equity sector teams, Fixed Income & Macro, and Portfolio + Risk Management." },
      ...socialMeta({
        title: "Coverage Teams | Purdue SMIF",
        description: "Eight equity sector teams plus Fixed Income & Macro and Portfolio + Risk Management cover the SMIF investment universe.",
        url: canonical("/sectors"),
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/sectors") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Purdue SMIF Coverage Teams",
          description: "Equity sector teams, Fixed Income & Macro, and Portfolio + Risk Management groups at the Purdue Student Managed Investment Fund.",
          numberOfItems: sectors.length,
          itemListElement: sectors.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Thing",
              name: s.name,
              description: s.lead,
            },
          })),
        }),
      },
    ],
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
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Coverage</span>
            <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Our teams.</h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Eight equity sector teams, a Fixed Income & Macro group, and a Portfolio + Risk Management team. Each meets weekly to discuss positioning, news flow, and pitch ideas.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-prose py-24">
        <h2 className="sr-only">Coverage Teams</h2>
        <RevealGroup className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
          {sectors.map(({ Icon, name, lead }) => (
            <RevealItem key={name} className="h-full [&>a]:h-full">
              <Link
                to="/team"
                search={{ sector: name }}
                className="group flex flex-col bg-background p-8 transition hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                aria-label={`View ${name} team members`}
              >
                <Icon className="h-7 w-7 text-gold-deep transition-transform duration-200 group-hover:scale-110" />
                <h3 className="mt-5 font-display text-lg font-bold">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{lead}</p>
                <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  View team
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </>
  );
}
