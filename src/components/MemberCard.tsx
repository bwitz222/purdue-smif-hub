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

export function MemberCard({ m }: { m: Member }) {
  const initials = m.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const email = m.email ?? `${m.name.toLowerCase().replace(/[^a-z]+/g, "")}@purdue.edu`;

  // Auto-resolve a headshot from the public storage bucket by slug.
  // Tries .jpg first; on error, falls back to .png, then to initials.
  const slug = memberSlug(m.name);
  const jpg = supabase.storage.from("team-headshots").getPublicUrl(`${slug}.jpg`).data.publicUrl;
  const png = supabase.storage.from("team-headshots").getPublicUrl(`${slug}.png`).data.publicUrl;
  const initialSrc = m.placeholder ? null : (m.photo ?? jpg);
  const [src, setSrc] = useState<string | null>(initialSrc);
  const [triedPng, setTriedPng] = useState(false);

  if (m.placeholder) {
    return (
      <div className="group flex flex-col border border-dashed border-border bg-card/50 p-6 transition hover:border-gold hover:shadow-elegant">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden border border-dashed border-gold/40 bg-secondary/40">
            <UserPlus className="h-6 w-6 text-gold-deep" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
              {m.role}
            </div>
            <div className="mt-1 font-display text-lg font-bold leading-tight">Open Position</div>
            <div className="text-xs text-muted-foreground">Recruiting</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We're recruiting for this seat. Interested in joining SMIF? Reach out — we'd love to hear from you.
        </p>
        <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-gold-deep"
          >
            <UserPlus className="h-3.5 w-3.5" /> Apply
          </Link>
          <a
            href="mailto:smif@purdue.edu"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-gold-deep"
          >
            <Mail className="h-3.5 w-3.5" /> Contact
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col border border-border bg-card p-6 transition hover:border-gold hover:shadow-elegant">
      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden bg-gradient-gold">
          {src ? (
            <img
              src={src}
              alt={`${m.name} headshot`}
              className="h-full w-full object-cover"
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
            <span className="font-display text-xl font-bold text-ink/40">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
            {m.role}
          </div>
          <div className="mt-1 font-display text-lg font-bold leading-tight">{m.name}</div>
          <div className="text-xs text-muted-foreground">{m.year}</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
      <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs">
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-gold-deep"
        >
          <Mail className="h-3.5 w-3.5" /> Email
        </a>
        <a
          href={m.linkedin ?? "#"}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-gold-deep"
        >
          <Linkedin className="h-3.5 w-3.5" /> LinkedIn
        </a>
      </div>
    </div>
  );
}
