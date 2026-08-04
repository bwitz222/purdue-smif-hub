import { useState } from "react";
import { Mail, Linkedin, UserPlus, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { memberSlug } from "@/data/team";
import { applyUrl } from "@/lib/apply-url";

export interface Member {
  name: string;
  role: string;
  year: string;
  bio: string;
  email?: string;
  linkedin?: string;
  photo?: string;
  photoPosition?: string;
  photoScale?: number;
  placeholder?: boolean;
}

export const memberEmail = (m: Member) => m.email;

/**
 * Remote headshot fallbacks for members with no bundled photo.
 *
 * Only called when `m.photo` is absent. Building these eagerly for every
 * member touched the Supabase client on render, which (a) made /team fail
 * outright when the env vars weren't set, and (b) meant the 7 members
 * without a bundled photo each fired a 404 for the .jpg and then the .png
 * before falling back to initials. Bundled photos never needed either URL.
 */
export const memberPhotoCandidates = (m: Member) => {
  const slug = memberSlug(m.name);
  const jpg = supabase.storage.from("team-headshots").getPublicUrl(`${slug}.jpg`).data.publicUrl;
  const png = supabase.storage.from("team-headshots").getPublicUrl(`${slug}.png`).data.publicUrl;
  return { jpg, png };
};

export function MemberCard({
  m,
  variant = "default",
  onSelect,
}: {
  m: Member;
  variant?: "default" | "board";
  onSelect?: (m: Member) => void;
}) {
  const initials = m.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const email = memberEmail(m);
  // Bundled photo wins outright; only members without one consult storage.
  const remote = m.placeholder || m.photo ? null : memberPhotoCandidates(m);
  const initialSrc = m.placeholder ? null : (m.photo ?? remote?.jpg ?? null);
  const [src, setSrc] = useState<string | null>(initialSrc);
  const [triedPng, setTriedPng] = useState(false);

  if (m.placeholder) {
    // Legacy single-seat placeholder — now points at the Qualtrics
    // application instead of the generic /contact route.
    return <OpenSeatsCard count={1} role={m.role} />;
  }

  const interactive = !!onSelect;
  const handleActivate = () => onSelect?.(m);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  // The card is NOT role="button". It used to be, which nested the email and
  // LinkedIn anchors inside a control — a WCAG "nested-interactive" violation
  // (41 nodes on /team) that leaves screen readers announcing a button whose
  // own children are separately focusable. The name below is the real control;
  // the wrapper keeps a click handler purely as a larger mouse target, which
  // is not exposed to assistive tech.
  return (
    <div
      onClick={interactive ? handleActivate : undefined}
      className={`group flex flex-col border border-border bg-card ${
        interactive
          ? "hover-lift cursor-pointer focus-within:ring-2 focus-within:ring-gold"
          : "transition-[border-color,box-shadow] duration-200 hover:border-gold hover:shadow-elegant"
      }`}
    >
      <div className="aspect-square w-full overflow-hidden bg-gradient-gold">
        {src ? (
          <img
            src={src}
            alt={`${m.name} headshot`}
            width={640}
            height={640}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            style={{
              objectPosition: m.photoPosition ?? "center",
              transform: m.photoScale ? `scale(${m.photoScale})` : undefined,
              transformOrigin: m.photoPosition ?? "center",
            }}
            loading="lazy"
            onError={() => {
              if (!m.photo && !triedPng && remote) {
                setTriedPng(true);
                setSrc(remote.png);
              } else {
                setSrc(null);
              }
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="font-display text-5xl font-bold text-ink/40">{initials}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">{m.role}</div>
        <Link
          to="/team/$slug"
          params={{ slug: memberSlug(m.name) }}
          onClick={stop}
          className="link-underline mt-1 self-start font-display text-lg font-bold leading-tight"
        >
          {m.name}
        </Link>
        <div className="text-xs text-muted-foreground">{m.year}</div>
        {m.bio && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>}
        <div
          className="mt-auto flex items-center gap-4 border-t border-border pt-4 text-xs"
          style={{ marginTop: m.bio ? undefined : "1.25rem" }}
        >
          {email && (
            <a href={`mailto:${email}`} onClick={stop} className="link-underline inline-flex items-center gap-1.5 min-h-11 text-muted-foreground transition-colors hover:text-gold-deep">
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          )}
          {m.linkedin && (
            <a href={m.linkedin} onClick={stop} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1.5 min-h-11 text-muted-foreground transition-colors hover:text-gold-deep">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Collapses all open analyst seats for a team into a single tile that links
 * directly to the Qualtrics application form (F3 + F10 of the audit). Use
 * one of these per team instead of padding the grid with N "Open Position"
 * placeholders.
 */
export function OpenSeatsCard({
  count,
  role = "Analyst",
  placement = "team-open-seats" as const,
}: {
  count: number;
  role?: string;
  placement?: import("@/lib/apply-url").ApplyPlacement;
}) {
  if (count <= 0) return null;
  const label = count === 1 ? "1 seat open" : `${count} seats open`;
  return (
    <a
      href={applyUrl(placement)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — apply (opens application form in new tab)`}
      className="group hover-lift flex flex-col border border-dashed border-border bg-card/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="grid aspect-square w-full place-items-center overflow-hidden border-b border-dashed border-border bg-secondary/40">
        <UserPlus className="h-10 w-10 text-gold-deep icon-pop" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
          {role}
        </div>
        <div className="mt-1 font-display text-2xl font-bold leading-tight">+{label}</div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We're recruiting analysts for this team. Apply through our form — applications open each fall and spring semester.
        </p>
        <div className="mt-auto flex items-center gap-2 border-t border-border pt-4 text-xs font-semibold text-ink group-hover:text-gold-deep transition-colors">
          Apply <ExternalLink className="h-3.5 w-3.5 arrow-slide" />
        </div>
      </div>
    </a>
  );
}
