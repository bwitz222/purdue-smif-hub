import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Linkedin } from "lucide-react";
import { useState } from "react";
import { memberPhotoCandidates } from "@/components/MemberCard";
import { Reveal } from "@/components/Reveal";
import { findMemberBySlug, memberDirectory, type DirectoryEntry } from "@/data/team";
import { socialMeta, canonical, SITE_URL, OG_TEAM } from "@/lib/seo";

/**
 * Per-member profile.
 *
 * The roster used to live at a single URL, which meant a search for an
 * analyst's name could never surface this domain. Each member now has a
 * canonical, indexable page carrying Person structured data, so the roster
 * works as a recruiting asset rather than a staff list.
 */
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
    const title = `${m.name} — ${m.role}, Purdue SMIF`;
    // Prefer the member's own bio; fall back to a factual sentence so the
    // description is never empty for the members who have no bio written yet.
    const description = m.bio
      ? m.bio.slice(0, 300)
      : `${m.name} is ${/^[aeiou]/i.test(m.role) ? "an" : "a"} ${m.role} on the ${team} team at the Purdue Student Managed Investment Fund.`;

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
            mainEntity: {
              "@type": "Person",
              "@id": `${url}#person`,
              name: m.name,
              jobTitle: m.role,
              description: m.bio || undefined,
              affiliation: { "@id": `${SITE_URL}/#organization` },
              memberOf: { "@type": "Organization", name: `${team}, Purdue SMIF` },
              email: m.email ? `mailto:${m.email}` : undefined,
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
  // Same rule as the roster cards: a bundled photo never needs the storage lookup.
  const remote = m.photo ? null : memberPhotoCandidates(m);
  const [src, setSrc] = useState<string | null>(m.photo ?? remote?.jpg ?? null);
  const [triedPng, setTriedPng] = useState(false);
  const initials = m.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

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
      className="aspect-square w-full object-cover"
      style={{
        objectPosition: m.photoPosition ?? "center",
        transform: m.photoScale ? `scale(${m.photoScale})` : undefined,
        transformOrigin: m.photoPosition ?? "center",
      }}
      onError={() => {
        if (!m.photo && !triedPng && remote) {
          setTriedPng(true);
          setSrc(remote.png);
        } else {
          setSrc(null);
        }
      }}
    />
  );
}

function MemberProfile() {
  const { entry } = Route.useLoaderData();
  const { member: m, team, slug } = entry;

  // Teammates from the same group, for lateral navigation and internal linking.
  const teammates = memberDirectory
    .filter((e) => e.team === team && e.slug !== slug)
    .slice(0, 6);

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-10">
          <Link
            to="/team"
            className="group link-underline inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep hover:text-ink"
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
              <ProfilePhoto entry={entry} />
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
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{m.bio}</p>
            )}

            {(m.email || m.linkedin) && (
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-border pt-6 text-sm">
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    className="group link-underline inline-flex items-center gap-2 text-foreground hover:text-gold-deep"
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
                    className="group link-underline inline-flex items-center gap-2 text-foreground hover:text-gold-deep"
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
            <ul className="mt-8 grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
              {teammates.map((t) => (
                <li key={t.slug} className="bg-background">
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
