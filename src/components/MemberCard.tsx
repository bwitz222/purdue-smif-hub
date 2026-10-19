import { useState } from "react";
import { Mail, Linkedin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { memberSlug } from "@/data/team";

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
}

export const memberEmail = (m: Member) => m.email;

export function MemberCard({
  m,
  variant = "default",
  onSelect,
}: {
  m: Member;
  variant?: "default" | "board";
  onSelect?: (m: Member) => void;
}) {
  const initials = m.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  const email = memberEmail(m);
  // Falls back to initials if the bundled photo is missing or fails to load.
  const [src, setSrc] = useState<string | null>(m.photo ?? null);

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
            onError={() => setSrc(null)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span className="font-display text-5xl font-bold text-ink/40">{initials}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
          {m.role}
        </div>
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
            <a
              href={`mailto:${email}`}
              onClick={stop}
              className="link-underline inline-flex items-center gap-1.5 min-h-11 text-muted-foreground transition-colors hover:text-gold-deep"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          )}
          {m.linkedin && (
            <a
              href={m.linkedin}
              onClick={stop}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1.5 min-h-11 text-muted-foreground transition-colors hover:text-gold-deep"
            >
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
