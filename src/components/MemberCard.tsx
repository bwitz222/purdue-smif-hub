import { useState } from "react";
import { Mail, Linkedin, UserPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export interface Member {
  name: string;
  role: string;
  year: string;
  bio: string;
  email?: string;
  linkedin?: string;
  photo?: string;
  placeholder?: boolean;
}

export const memberSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const memberEmail = (m: Member) =>
  m.email ?? `${m.name.toLowerCase().replace(/[^a-z]+/g, "")}@purdue.edu`;

export const memberPhotoCandidates = (m: Member) => {
  const slug = memberSlug(m.name);
  const jpg = supabase.storage.from("team-headshots").getPublicUrl(`${slug}.jpg`).data.publicUrl;
  const png = supabase.storage.from("team-headshots").getPublicUrl(`${slug}.png`).data.publicUrl;
  return { jpg, png, initial: m.photo ?? jpg };
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
  const { jpg, png } = memberPhotoCandidates(m);
  const initialSrc = m.placeholder ? null : (m.photo ?? jpg);
  const [src, setSrc] = useState<string | null>(initialSrc);
  const [triedPng, setTriedPng] = useState(false);

  if (m.placeholder) {
    return (
      <div className="group flex flex-col border border-dashed border-border bg-card/50 transition-[border-color,box-shadow] duration-200 hover:border-gold hover:shadow-elegant">
        <div className="grid aspect-square w-full place-items-center overflow-hidden border-b border-dashed border-border bg-secondary/40">
          <UserPlus className="h-10 w-10 text-gold-deep" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
            {m.role}
          </div>
          <div className="mt-1 font-display text-lg font-bold leading-tight">Open Position</div>
          <div className="text-xs text-muted-foreground">Recruiting</div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            We&rsquo;re recruiting for this seat. Interested in joining SMIF? Reach out &mdash; we&rsquo;d love to hear from you.
          </p>
          <div className="mt-auto flex items-center gap-4 border-t border-border pt-4 text-xs">
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gold-deep">
              <UserPlus className="h-3.5 w-3.5" /> Apply
            </Link>
            <a href="mailto:smif@purdue.edu" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gold-deep">
              <Mail className="h-3.5 w-3.5" /> Contact
            </a>
          </div>
        </div>
      </div>
    );
  }

  const interactive = !!onSelect;
  const handleActivate = () => onSelect?.(m);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? handleActivate : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleActivate();
              }
            }
          : undefined
      }
      className={`group flex flex-col border border-border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:border-gold hover:shadow-elegant ${
        interactive ? "cursor-pointer hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold" : ""
      }`}
    >
      <div className="aspect-square w-full overflow-hidden bg-gradient-gold">
        {src ? (
          <img
            src={src}
            alt={`${m.name} headshot`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => {
              if (!m.photo && !triedPng) {
                setTriedPng(true);
                setSrc(png);
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
        <div className="mt-1 font-display text-lg font-bold leading-tight">{m.name}</div>
        <div className="text-xs text-muted-foreground">{m.year}</div>
        {m.bio && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>}
        <div
          className="mt-auto flex items-center gap-4 border-t border-border pt-4 text-xs"
          style={{ marginTop: m.bio ? undefined : "1.25rem" }}
        >
          <a href={`mailto:${email}`} onClick={stop} className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gold-deep">
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
          <a href={m.linkedin ?? "#"} onClick={stop} target={m.linkedin ? "_blank" : undefined} rel={m.linkedin ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-gold-deep">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
