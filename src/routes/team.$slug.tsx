import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Linkedin } from "lucide-react";
import { TEAM_INDUSTRIES, teamSlug } from "@/lib/portfolio";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { findMemberBySlug, memberDirectory, TEAM_BLURB, type DirectoryEntry } from "@/data/team";
import { holdings } from "@/data/holdings";
import {
  socialMeta,
  canonical,
  memberDescription,
  memberTitle,
  ORG_ID,
  SITE_URL,
  OG_TEAM,
  LAST_CONTENT_UPDATE,
} from "@/lib/seo";

/**
 * Per-member profile.
 *
 * The roster used to live at a single URL, which meant a search for an
 * analyst's name could never surface this domain. Each member now has a
 * canonical, indexable page carrying Person structured data, so the roster
 * works as a recruiting asset rather than a staff list.
 *
 * Every profile is indexable and listed in the sitemap. The page is rendered on
 * the server, so a crawler that runs no JavaScript still gets the name, every
 * seat the person holds, what each team covers and the positions it holds.
 */

/** Positions a coverage team is responsible for, from the static book. */
function teamHoldings(team: string) {
  const industries = TEAM_INDUSTRIES[team];
  if (!industries) return [];
  return holdings.filter((h) => industries.includes(h.industry));
}
export const Route = createFileRoute("/team/$slug")({
  loader: ({ params }) => {
    const entry = findMemberBySlug(params.slug);
    if (!entry) throw notFound();
    return { entry };
  },
  component: MemberProfile,
  head: ({ loaderData }) => {
    const entry = loaderData?.entry;
    if (!entry) return {};
    const { member: m, team, slug } = entry;
    const url = canonical(`/team/${slug}`);
    const title = memberTitle(m);
    // Built from name, role, team and class year, never from the free-text bio:
    // bios run past 280 characters and carry personal detail that does not
    // belong in a search snippet. Capped at 155 characters.
    const description = memberDescription(m, team);
    // The headshot is a bundled asset served from this host. It goes in the
    // Person markup; the social card stays the shared 1536x1024 team card
    // because og:image dimensions must match the file.
    const image = m.photo ? new URL(m.photo, SITE_URL).toString() : undefined;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...socialMeta({ title, description, url, type: "profile", image: OG_TEAM }),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "@id": `${url}#profile`,
            url,
            name: title,
            description,
            inLanguage: "en",
            dateModified: LAST_CONTENT_UPDATE,
            isPartOf: { "@id": `${SITE_URL}/#website` },
            mainEntity: {
              "@type": "Person",
              "@id": `${url}#person`,
              name: m.name,
              url,
              // Every seat, so "Co-President" and "Portfolio Manager, Industrials"
              // are both attached to the same person.
              jobTitle:
                entry.roles.length > 1
                  ? entry.roles.map((r) =>
                      r.team === "Executive Board" ? r.role : `${r.role}, ${r.team}`,
                    )
                  : m.role,
              // The bio when there is one; otherwise the same factual sentence
              // the meta description uses, so the field is never empty.
              description: m.bio || description,
              image,
              affiliation: { "@id": ORG_ID },
              // The fund itself, by @id. The sector team is named in jobTitle and the
              // description; a made-up Organization node per team would be a second,
              // unverifiable entity. No email: a student's address does not belong
              // in structured data that scrapers read in bulk.
              memberOf: { "@id": ORG_ID },
              sameAs: m.linkedin ? [m.linkedin] : undefined,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Team", item: `${SITE_URL}/team` },
              { "@type": "ListItem", position: 3, name: m.name, item: url },
            ],
          }),
        },
      ],
    };
  },
});

function ProfilePhoto({ entry }: { entry: DirectoryEntry }) {
  const m = entry.member;
  // Same rule as the roster cards: initials when there is no usable photo.
  const [src, setSrc] = useState<string | null>(m.photo ?? null);
  const initials = m.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  if (!src) {
    return (
      <div className="grid aspect-square w-full place-items-center bg-gradient-gold">
        <span className="font-display text-6xl font-bold text-ink/40">{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`${m.name} headshot`}
      width={640}
      height={640}
      decoding="async"
      fetchPriority="high"
      className="aspect-square w-full object-cover"
      style={{
        objectPosition: m.photoPosition ?? "center",
        transform: m.photoScale ? `scale(${m.photoScale})` : undefined,
        transformOrigin: m.photoPosition ?? "center",
      }}
      onError={() => setSrc(null)}
    />
  );
}

function MemberProfile() {
  const { entry } = Route.useLoaderData();
  const { member: m, team, slug } = entry;
  const isFaculty = team === "Faculty Advisors";
  const firstName = m.name.split(" ")[0];

  // Teammates from the same group, for lateral navigation and internal linking.
  const teammates = memberDirectory.filter((e) => e.team === team && e.slug !== slug).slice(0, 6);

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-10">
          <Link
            to="/team"
            className="group link-underline inline-flex min-h-6 items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5 arrow-slide" />
            All of the team
          </Link>
        </div>
      </section>

      <section className="container-prose py-16">
        <div className="grid gap-12 md:grid-cols-5">
          <Reveal className="md:col-span-2">
            <div className="border border-border bg-card overflow-hidden">
              {/* Keyed on the slug so navigating between two profiles remounts
                  the photo. ProfilePhoto seeds `src` from useState and never
                  syncs on prop change; the route crossfade normally remounts
                  it, but that whole block is skipped under
                  prefers-reduced-motion (see RouteTransition in __root), which
                  left the previous member's headshot beside the new name. */}
              <ProfilePhoto key={entry.slug} entry={entry} />
            </div>
          </Reveal>

          <Reveal className="md:col-span-3" delay={0.08}>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">
              {m.role}
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{m.name}</h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {team}
              {m.year ? ` · ${m.year}` : ""}
            </p>

            {m.bio && (
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {m.bio}
              </p>
            )}

            <h2 className="mt-10 font-display text-xl font-bold">
              {isFaculty ? "Role at the fund" : `What ${firstName} does at the fund`}
            </h2>
            <ul className="mt-4 max-w-2xl divide-y divide-border border-y border-border">
              {entry.roles.map((r) => {
                const covered = teamHoldings(r.team);
                return (
                  <li key={r.team} className="py-5">
                    <p className="font-bold text-foreground">
                      {r.role}
                      <span className="font-normal text-muted-foreground"> · {r.team}</span>
                    </p>
                    {TEAM_BLURB[r.team] && (
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {TEAM_BLURB[r.team]}
                      </p>
                    )}
                    {covered.length > 0 && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Positions the team covers:{" "}
                        {covered.map((h) => `${h.company} (${h.symbol})`).join(", ")}.{" "}
                        <Link
                          to="/sectors"
                          hash={teamSlug(r.team)}
                          className="link-underline inline-flex min-h-6 items-center font-bold text-gold-deep hover:text-ink"
                        >
                          {r.team} team
                        </Link>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The Purdue Student Managed Investment Fund is a student-run fund at the Daniels School
              of Business that has managed real university capital since 1995. See{" "}
              <Link
                to="/holdings"
                className="link-underline inline-flex min-h-6 items-center font-bold text-gold-deep hover:text-ink"
              >
                what the fund holds
              </Link>{" "}
              or{" "}
              <Link
                to="/about"
                className="link-underline inline-flex min-h-6 items-center font-bold text-gold-deep hover:text-ink"
              >
                how it is run
              </Link>
              .
            </p>

            {(m.email || m.linkedin) && (
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-border pt-6 text-sm">
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    className="group link-underline inline-flex min-h-6 items-center gap-2 text-foreground hover:text-gold-deep"
                  >
                    <Mail className="h-4 w-4 icon-pop" />
                    <span className="font-mono">{m.email}</span>
                  </a>
                )}
                {m.linkedin && (
                  <a
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group link-underline inline-flex min-h-6 items-center gap-2 text-foreground hover:text-gold-deep"
                  >
                    <Linkedin className="h-4 w-4 icon-pop" />
                    <span className="font-mono">LinkedIn</span>
                  </a>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {teammates.length > 0 && (
        <section className="border-t border-border bg-secondary/30">
          <div className="container-prose py-16">
            <h2 className="font-display text-2xl font-bold">Also on {team}</h2>
            {team in TEAM_INDUSTRIES && (
              <p className="mt-3">
                <Link
                  to="/sectors"
                  hash={teamSlug(team)}
                  className="link-underline inline-flex min-h-6 items-center font-bold text-gold-deep hover:text-ink"
                >
                  See what the {team} team holds
                </Link>
              </p>
            )}
            {/* Per-cell borders rather than a gap-px bg-border grid, so a short
                last row leaves blank page instead of a gray filler cell. */}
            <ul className="mt-8 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
              {teammates.map((t) => (
                <li key={t.slug} className="border-b border-r border-border bg-background">
                  <Link
                    to="/team/$slug"
                    params={{ slug: t.slug }}
                    className="group flex flex-col gap-1 p-5 transition-colors duration-200 hover:bg-secondary/50"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
                      {t.member.role}
                    </span>
                    <span className="font-display text-lg font-bold leading-tight">
                      {t.member.name}
                    </span>
                    {t.member.year && (
                      <span className="text-xs text-muted-foreground">{t.member.year}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
