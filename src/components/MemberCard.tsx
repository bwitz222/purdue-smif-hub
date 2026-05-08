import { Mail, Linkedin } from "lucide-react";

export interface Member {
  name: string;
  role: string;
  year: string;
  bio: string;
  email?: string;
  linkedin?: string;
  photo?: string;
}

export function MemberCard({ m }: { m: Member }) {
  const initials = m.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const email = m.email ?? `${m.name.toLowerCase().replace(/[^a-z]+/g, "")}@purdue.edu`;
  return (
    <div className="group flex flex-col border border-border bg-card p-6 transition hover:border-gold hover:shadow-elegant">
      <div className="flex items-start gap-4">
        <div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden bg-gradient-gold">
          {m.photo ? (
            <img src={m.photo} alt={`${m.name} headshot`} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-xl font-bold text-ink/40">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
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
