import { createFileRoute } from "@tanstack/react-router";
import { MemberCard } from "@/components/MemberCard";
import { board, sectorTeams, fixedIncomeMacro, portfolioManagers } from "@/data/team";

const allMembers = [
  ...board,
  ...sectorTeams.flatMap((t) => t.members),
  ...fixedIncomeMacro,
  ...portfolioManagers,
].filter((m) => !m.placeholder);

export const Route = createFileRoute("/team")({
  component: Team,
  head: () => ({
    meta: [
      { title: "Team — Purdue SMIF" },
      { name: "description", content: "Meet the executive board, sector teams, fixed income & macro team, and portfolio managers of the Purdue Student Managed Investment Fund." },
      { property: "og:title", content: "Meet the Team — Purdue SMIF" },
      { property: "og:description", content: "The 52 students behind Purdue SMIF — executive board, sector analysts, fixed income & macro, and portfolio managers." },
      { property: "og:url", content: "https://purduesmif.org/team" },
    ],
    links: [{ rel: "canonical", href: "https://purduesmif.org/team" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: allMembers.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Person",
              name: m.name,
              jobTitle: m.role,
              ...(m.email ? { email: m.email } : {}),
              affiliation: {
                "@type": "Organization",
                name: "Purdue Student Managed Investment Fund",
              },
            },
          })),
        }),
      },
    ],
  }),
});

function SectionHeader({ kicker, title, blurb }: { kicker: string; title: string; blurb?: string }) {
  return (
    <div className="mb-12 max-w-3xl">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">{kicker}</span>
      <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{title}</h2>
      {blurb && <p className="mt-4 text-muted-foreground">{blurb}</p>}
    </div>
  );
}

function Team() {
  const totalMembers = 52;

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Team</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">
            The people behind the portfolio.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            {totalMembers} students. Executive board members also serve as sector leads
            or senior analysts across the eight sector teams, the Fixed Income & Macro
            group, and the Portfolio + Risk Management team — all working together to
            manage real capital for Purdue.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 max-w-3xl">
            {[
              ["7", "Executive Board"],
              ["8", "Sector Teams"],
              ["1", "Fixed Income & Macro"],
              ["1", "Portfolio + Risk Mgmt."],
            ].map(([n, l]) => (
              <div key={l} className="border-l-2 border-gold pl-4">
                <div className="font-display text-3xl font-bold">{n}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Board */}
      <section className="container-prose py-24">
        <SectionHeader
          kicker="Leadership"
          title="Executive Board"
          blurb="Seven senior students elected each spring to lead the fund's strategy, research, risk, recruiting, education, and operations. Board members also serve as sector leads or senior analysts on the teams below."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {board.map((m) => <MemberCard key={m.name} m={m} variant="board" />)}
        </div>
      </section>

      {/* Sector Teams */}
      <section className="border-y border-border bg-secondary/30 py-24">
        <div className="container-prose">
          <SectionHeader
            kicker="Equity Research"
            title="Sector Teams"
            blurb="Eight teams cover the equity universe. Each team is led by a Sector Head with senior analysts and rotating junior analysts."
          />
          <div className="space-y-16">
            {sectorTeams.map((team) => (
              <div key={team.name}>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{team.name}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{team.description}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-gold-deep">
                    {team.members.length} members
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {team.members.map((m) => <MemberCard key={m.name} m={m} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fixed Income & Macro */}
      <section className="container-prose py-24">
        <SectionHeader
          kicker="Cross-Asset"
          title="Fixed Income & Macro Team"
          blurb="Covers rates, credit, FX, and global macro themes — informing both the fixed income sleeve and the equity portfolio's macro overlay."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fixedIncomeMacro.map((m) => <MemberCard key={m.name} m={m} />)}
        </div>
      </section>

      {/* Portfolio Managers */}
      <section className="border-t border-border bg-secondary/30 py-24">
        <div className="container-prose">
          <SectionHeader
            kicker="Portfolio + Risk Management"
            title="Portfolio + Risk Management"
            blurb="Implement allocation decisions, monitor portfolio risk, manage trading and rebalancing, and own performance attribution."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioManagers.map((m) => <MemberCard key={m.name} m={m} />)}
          </div>
        </div>
      </section>

      {/* Faculty Advisor */}
      <section className="bg-ink py-24 text-background">
        <div className="container-prose">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold/80">Mentorship</span>
          <h2 className="mt-3 font-display text-3xl font-bold">Faculty Advisor</h2>
          <p className="mt-4 max-w-2xl text-background/70">
            SMIF benefits from the mentorship of finance faculty at the Daniels School of
            Business, who provide guidance on strategy, governance, and professional
            development — and ensure continuity year over year.
          </p>
        </div>
      </section>
    </>
  );
}
