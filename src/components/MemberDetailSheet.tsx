import { useState, useEffect } from "react";
import { Mail, Linkedin } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { memberEmail, memberPhotoCandidates, type Member } from "@/components/MemberCard";

export function MemberDetailSheet({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const open = !!member;
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {member && <MemberDetail m={member} />}
      </SheetContent>
    </Sheet>
  );
}

function MemberDetail({ m }: { m: Member }) {
  const { jpg, png } = memberPhotoCandidates(m);
  const [src, setSrc] = useState<string | null>(m.photo ?? jpg);
  const [triedPng, setTriedPng] = useState(false);
  const email = memberEmail(m);
  const initials = m.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  useEffect(() => {
    setSrc(m.photo ?? jpg);
    setTriedPng(false);
  }, [m.name, m.photo, jpg]);

  return (
    <div className="flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-gold">
        {src ? (
          <img
            src={src}
            alt={`${m.name} headshot`}
            className="h-full w-full object-cover"
            style={{
              objectPosition: m.photoPosition ?? "center",
              transform: m.photoScale ? `scale(${m.photoScale})` : undefined,
              transformOrigin: m.photoPosition ?? "center",
            }}
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
            <span className="font-display text-7xl font-bold text-ink/40">{initials}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-6 text-background">
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">{m.role}</div>
          <SheetHeader className="space-y-1 text-left">
            <SheetTitle className="font-display text-3xl font-bold text-background">{m.name}</SheetTitle>
            <SheetDescription className="text-background/70 font-mono text-xs uppercase tracking-[0.2em]">
              {m.year}
            </SheetDescription>
          </SheetHeader>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {m.bio && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep mb-2">Bio</div>
            <p className="text-sm leading-relaxed text-foreground/80">{m.bio}</p>
          </div>
        )}
        {(email || m.linkedin) && (
          <div className="border-t border-border pt-5 space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">Contact</div>
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-gold-deep transition-colors">
                <Mail className="h-4 w-4" />
                <span className="font-mono">{email}</span>
              </a>
            )}
            {m.linkedin && (
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-foreground hover:text-gold-deep transition-colors">
                <Linkedin className="h-4 w-4" />
                <span className="font-mono truncate">LinkedIn profile</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
