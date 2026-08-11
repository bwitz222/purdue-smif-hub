import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Calendar, CalendarPlus, MapPin, Clock, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { socialMeta, canonical, breadcrumbLd, OG_RECRUITING } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PrepCard } from "@/components/PrepCard";

import { applyUrl } from "@/lib/apply-url";
// The calendar and its date math are shared with the mobile Apply bar, which
// counts down to the same next event. Two copies would drift.
import {
  CALENDAR,
  parseEventTimes,
  pad2,
  useCountdown,
  staticNextEventLabel,
  type RecruitingEvent as Event,
} from "@/lib/recruiting-calendar";

function CountdownUnit({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-1 sm:flex-none flex-col items-center border border-gold/30 bg-ink/40 px-4 py-3 min-w-[72px] hover-raise">
      <span className="font-display text-3xl font-bold text-gold tabular-nums md:text-4xl">{value}</span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-dark-secondary">{label}</span>
    </div>
  );
}

function Countdown() {
  const c = useCountdown();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const fallback = staticNextEventLabel();

  // Expired — entire cycle has passed. role="status" so AT announces it.
  if (c?.expired || (c === null && fallback.expired)) {
    return (
      <div
        role="status"
        className="mt-10 border border-gold/30 bg-ink/60 p-6 text-background md:p-8"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Applications Closed
        </div>
        <p className="mt-2 text-sm text-on-dark-secondary">
          Applications for the Fall 2026 cycle are closed. Watch this page or follow us on Instagram for the next application window.
        </p>
      </div>
    );
  }

  const headline = c?.event?.name ?? fallback.name;
  const sub = c?.event
    ? `${c.event.date} · ${c.event.time} ET`
    : `${fallback.date} · ${fallback.time} ET`;
  const srLabel = c
    ? `${c.days} days, ${c.hours} hours, ${c.minutes} minutes until ${headline}.`
    : `Next event: ${headline} on ${sub}.`;

  return (
    <div className="mt-10 border border-gold/30 bg-ink/60 p-6 text-background md:p-8">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
        Next: {headline}
      </div>
      <p className="mt-1 text-sm text-on-dark-secondary">{sub}</p>
      {/* Accessible plain-text countdown, hidden visually. Always present
          so screen readers + no-JS users get a complete sentence. */}
      <span className="sr-only" aria-live="polite">{srLabel}</span>
      <div className="mt-5 flex flex-wrap gap-3" aria-hidden="true">
        <CountdownUnit value={c ? c.days : "--"} label="Days" />
        <CountdownUnit value={c ? pad(c.hours) : "--"} label="Hours" />
        <CountdownUnit value={c ? pad(c.minutes) : "--"} label="Minutes" />
        <CountdownUnit value={c ? pad(c.seconds) : "--"} label="Seconds" />
      </div>
    </div>
  );
}

function buildEventBody(event: Event): string {
  const prefix = event.time === "TBD"
    ? "Note: time TBD. Your specific interview slot will be communicated by email. Update this event when you receive your slot.\n\n"
    : "";
  return `${prefix}Purdue SMIF recruiting event.\n\nLocation: ${event.location}\nRecruiting page: https://www.purduesmif.org/recruiting\nQuestions: smif26@purdue.edu`;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function toIcsLocal(iso: string, t: { h: number; m: number }): string {
  // YYYYMMDDTHHMMSS (floating with TZID)
  const ymd = iso.replace(/-/g, "");
  return `${ymd}T${pad2(t.h)}${pad2(t.m)}00`;
}

function nowUtcStamp(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function generateICS(events: Event[] = CALENDAR): string {
  const stamp = nowUtcStamp();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Purdue SMIF//Recruiting Fall 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Purdue SMIF Recruiting - Fall 2026",
    "X-WR-TIMEZONE:America/New_York",
  ];
  for (const e of events) {
    const { start, end } = parseEventTimes(e.time);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.iso}-${slugify(e.name)}@purduesmif.org`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${toIcsLocal(e.iso, start)}`,
      `DTEND;TZID=America/New_York:${toIcsLocal(e.iso, end)}`,
      `SUMMARY:${icsEscape(e.name)}`,
      `LOCATION:${icsEscape(e.location)}`,
      `DESCRIPTION:${icsEscape(buildEventBody(e))}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS() {
  if (typeof window === "undefined") return;
  const blob = new Blob([generateICS()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "purdue-smif-recruiting-fall-2026.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Google Calendar render URL — opens a prefilled event the user just clicks "Save" on.
// Works for any Google account (personal Gmail or Purdue's Google Workspace).
function toGoogleCalendarLink(event: Event): string {
  const { start, end } = parseEventTimes(event.time);
  const ymd = event.iso.replace(/-/g, "");
  // Floating local time + ctz tells Google to interpret it in Eastern.
  const dates = `${ymd}T${pad2(start.h)}${pad2(start.m)}00/${ymd}T${pad2(end.h)}${pad2(end.m)}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates,
    details: buildEventBody(event),
    location: event.location,
    ctz: "America/New_York",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const Route = createFileRoute("/recruiting")({
  component: Recruiting,
  head: () => ({
    meta: [
      { title: "Recruiting Calendar & Interview Prep | Purdue SMIF" },
      { name: "description", content: "How to join Purdue's student investment club: the Fall 2026 calendar of callouts, coffee chats, and interviews, plus a full interview prep guide." },
      ...socialMeta({
        title: "Recruiting Calendar & Interview Prep | Purdue SMIF",
        description: "Callouts, coffee chats, interviews, and a behavioral + technical interview prep guide for joining Purdue SMIF.",
        url: canonical("/recruiting"),
        image: OG_RECRUITING,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/recruiting") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          CALENDAR.map((e) => {
            const { start, end } = parseEventTimes(e.time);
            return {
              "@context": "https://schema.org",
              "@type": "Event",
              name: `Purdue SMIF: ${e.name}`,
              startDate: `${e.iso}T${pad2(start.h)}:${pad2(start.m)}:00-04:00`,
              endDate: `${e.iso}T${pad2(end.h)}:${pad2(end.m)}:00-04:00`,
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              eventStatus: "https://schema.org/EventScheduled",
              location: {
                "@type": "Place",
                name: e.location,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "West Lafayette",
                  addressRegion: "IN",
                  addressCountry: "US",
                },
              },
              organizer: { "@id": "https://www.purduesmif.org/#organization" },
              url: "https://www.purduesmif.org/recruiting",
            };
          }),
        ),
      },
      breadcrumbLd("Recruiting", "/recruiting"),
    ],
  }),
});

function Recruiting() {
  // SSR-safe "now" — null on server, set on client mount
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => { setNowMs(Date.now()); }, []);

  return (
    <>
      <section className="border-b border-border bg-ink text-background">
        <div className="container-prose py-24">
          <span className="animate-fade-in text-xs font-semibold uppercase tracking-[0.3em] text-gold">Recruiting</span>
          <h1 className="animate-fade-up mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">
            Join the Fund.
          </h1>
          <p className="animate-fade-up delay-100 mt-6 max-w-2xl text-lg text-background/70">
            Our recruiting calendar, plus a complete guide to preparing for both behavioral and technical interviews with SMIF.
          </p>
          <div className="animate-fade-up delay-200 mt-8 flex flex-wrap gap-3">
            <a
              href={applyUrl("recruiting-hero")}
              target="_blank"
              rel="noopener noreferrer"
              className="press group inline-flex items-center gap-2 bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-mid"
            >
              Apply Now <ArrowRight className="h-4 w-4 arrow-slide" />
            </a>
            <a
              href="#prep"
              className="press inline-flex items-center gap-2 border border-background/30 px-6 py-3 text-sm font-semibold text-background hover:border-gold hover:text-gold"
            >
              Jump to Prep Guide
            </a>
          </div>
          <Countdown />
        </div>

      </section>

      {/* Calendar */}
      <section className="container-prose py-20">
        <Reveal className="flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Fall 2026</span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Recruiting Calendar</h2>
          </div>
          <span className="hidden md:inline font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            All times Eastern
          </span>
        </Reveal>

        <p className="mt-4 text-sm text-muted-foreground">
          Select any event to open it prefilled in Google Calendar, or download the full schedule below.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={downloadICS}
            aria-label="Download all 10 events as iCal file"
            className="press group inline-flex items-center gap-2 border border-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-ink hover:text-background cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 icon-pop" />
            Download all events (.ics)
          </button>
        </div>

        <RevealGroup className="mt-8 divide-y divide-border border-b border-border">
          {CALENDAR.map((e) => {
            const isPast = nowMs !== null && new Date(e.iso + "T23:59:59-04:00").getTime() < nowMs;
            return (
              <RevealItem key={e.iso + e.name}>
                <a
                  href={toGoogleCalendarLink(e)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Add ${e.name} on ${e.date} at ${e.time} to Google Calendar (opens in new tab)`}
                  className={`group row-rail block w-full text-left transition hover:bg-secondary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 px-2 -mx-2 cursor-pointer ${isPast ? "opacity-50" : ""}`}
                >
                  {/* Mobile: single ≥44px stacked tap block with right-aligned add-to-cal affordance. */}
                  <div className="md:hidden flex items-start gap-3 py-4 min-h-[64px]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-gold-deep">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{e.date}</span>
                        {isPast && (
                          <span className="ml-1 inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                            Past
                          </span>
                        )}
                      </div>
                      <div className="mt-1 font-display text-base font-bold leading-tight">{e.name}</div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{e.time}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border text-gold-deep group-hover:border-gold-deep group-active:bg-secondary/60"
                    >
                      <CalendarPlus className="h-4 w-4 icon-pop" />
                    </span>
                  </div>

                  {/* Desktop: existing 12-col grid. */}
                  <div className="hidden md:grid grid-cols-12 gap-4 py-5">
                    <div className="col-span-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-gold-deep" />
                      {e.date}
                    </div>
                    <div className="col-span-5 font-display text-lg font-bold">
                      <span className="inline-flex items-center gap-2">
                        {e.name}
                        <CalendarPlus
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors duration-200 group-hover:text-gold-deep"
                        />
                      </span>
                      {isPast && (
                        <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                          Past
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {e.time}
                    </div>
                    <div className="col-span-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {e.location}
                    </div>
                  </div>
                </a>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <p className="mt-6 text-sm text-muted-foreground">
          Locations and times subject to change. Email{" "}
          <a href="mailto:smif26@purdue.edu" className="link-underline text-gold-deep font-medium hover:text-gold">
            smif26@purdue.edu
          </a>{" "}
          to be added to our mailing list for updates.
        </p>
      </section>

      {/* Prep Guide */}
      <section id="prep" className="border-t border-border bg-secondary/40">
        <div className="container-prose py-20">
          <Reveal>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Tips &amp; Tricks to Prep</h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-4 max-w-3xl text-muted-foreground">
              We recruit for curiosity, work ethic, and intellectual honesty, not pedigree. A finance background helps, but we've taken students from every major. Use the guide below to walk in confident and prepared.
            </p>
          </Reveal>

          {/* Behavioral */}
          <div className="mt-14">
            <Reveal className="flex items-center gap-3">
              <span className="animate-expand-x h-px w-10 bg-gold" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold-deep">Round 1</span>
            </Reveal>
            <Reveal>
              <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">Behavioral Interview</h3>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                We want to understand who you are, why you're interested in markets, and how you work with others. Be specific, be honest, and have stories ready.
              </p>
            </Reveal>

            <RevealGroup className="mt-8 grid gap-6 md:grid-cols-2">
              <RevealItem>
                <PrepCard
                  headingLevel="h4"
                  title="Know Your 'Why'"
                  items={[
                    "Why finance? Why investing? Why SMIF specifically?",
                    "Tie answers to specific experiences (a class, a book, a market event), not buzzwords.",
                    "Have a thoughtful answer for 'why this sector' if asked.",
                  ]}
                />
              </RevealItem>
              <RevealItem>
                <PrepCard
                  headingLevel="h4"
                  title="STAR Stories"
                  items={[
                    "Prepare 3-4 stories: leadership, teamwork, conflict, failure.",
                    "Situation → Task → Action → Result. Keep each story to ~90 seconds.",
                    "Reuse stories across questions; depth beats breadth.",
                  ]}
                />
              </RevealItem>
              <RevealItem>
                <PrepCard
                  headingLevel="h4"
                  title="Know SMIF"
                  items={[
                    "Read our About, Sectors, and Holdings pages before you walk in.",
                    "Understand the structure: analyst → senior analyst → sector head → executive board.",
                    "Reference a recent publication or holding that genuinely caught your interest.",
                  ]}
                />
              </RevealItem>
              <RevealItem>
                <PrepCard
                  headingLevel="h4"
                  title="Ask Sharp Questions"
                  items={[
                    "Always have 2-3 questions ready for your interviewers.",
                    "Avoid questions answered on the website. Ask about their experience, not logistics.",
                    "Good prompt: 'What's a position you pushed back on in committee and why?'",
                  ]}
                />
              </RevealItem>
            </RevealGroup>
          </div>

          {/* Technical */}
          <div className="mt-16">
            <Reveal className="flex items-center gap-3">
              <span className="animate-expand-x h-px w-10 bg-gold" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold-deep">Round 2</span>
            </Reveal>
            <Reveal>
              <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">Technical Interview</h3>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                You don't need to be an investment banking analyst already. We test fundamentals, market awareness, and your ability to defend an investment thesis.
              </p>
            </Reveal>

            <RevealGroup className="mt-8 grid gap-6 md:grid-cols-2">
              <RevealItem>
                <PrepCard
                  headingLevel="h4"
                  title="Accounting Foundations"
                  items={[
                    "Walk through the three financial statements and how they link.",
                    "Depreciation +$10: walk through the impact on IS, CF, and BS (after taxes).",
                    "Know the difference between EBITDA, operating income, and net income.",
                  ]}
                />
              </RevealItem>
              <RevealItem>
                <PrepCard
                  headingLevel="h4"
                  title="Valuation Basics"
                  items={[
                    "Understand the big picture: a company is worth the present value of its future cash flows.",
                    "Learn the three main approaches: DCF (intrinsic), comparables (relative), and precedent transactions.",
                    "Start with P/E and EV/EBITDA: know what they measure and when each is useful.",
                  ]}
                />
              </RevealItem>
              <RevealItem>
                <PrepCard
                  headingLevel="h4"
                  title="Market Awareness"
                  items={[
                    "Know where the S&P 500, Nasdaq, 10Y Treasury, and Fed Funds rate sit directionally.",
                    "Be ready to discuss one recent market headline and its implications.",
                    "Daily reads: WSJ, Bloomberg, FT, Axios Markets, Matt Levine's Money Stuff.",
                  ]}
                />
              </RevealItem>
              <RevealItem>
                <PrepCard
                  headingLevel="h4"
                  title="Stock Pitch"
                  items={[
                    "Prepare one long idea: thesis, 2-3 catalysts, valuation, and key risks.",
                    "Pick a name you genuinely understand, not the most complex one you can find.",
                    "Structure: 'I'd buy X at $Y because… Catalysts are… Valuation supports… Risks are…'",
                  ]}
                />
              </RevealItem>
            </RevealGroup>
          </div>

          {/* Day-of */}
          <Reveal className="mt-14 border border-gold/30 bg-background p-6 md:p-8 hover-lift-sm">
            <h3 className="font-display text-xl font-bold">Day-Of Checklist</h3>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2 list-disc pl-5 marker:text-gold-deep">
              <li>Business professional dress: suit and tie or equivalent.</li>
              <li>Arrive 10 minutes early. Silence your phone.</li>
              <li>Bring printed copies of your resume and a notepad.</li>
              <li>Know your resume cold; anything on it is fair game.</li>
              <li>Firm handshake, eye contact, and smile.</li>
              <li>Be yourself. We evaluate fit as much as skill.</li>
            </ul>
          </Reveal>

          {/* Reading list */}
          <Reveal className="mt-10 border border-border bg-background p-6 md:p-8 hover-lift-sm">
            <h3 className="font-display text-xl font-bold">Recommended Reading</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground list-disc pl-5 marker:text-gold-deep">
              <li><span className="font-medium text-foreground">The Intelligent Investor</span>, Benjamin Graham: foundational value investing.</li>
              <li><span className="font-medium text-foreground">One Up On Wall Street</span>, Peter Lynch: intuitive intro to stock picking.</li>
              <li><span className="font-medium text-foreground">Investment Banking</span>, Rosenbaum &amp; Pearl: valuation reference.</li>
              <li><span className="font-medium text-foreground">Damodaran Online</span>: free valuation resources from NYU Stern.</li>
              <li><span className="font-medium text-foreground">Money Stuff</span>: Matt Levine's daily Bloomberg newsletter.</li>
            </ul>
          </Reveal>

          <p className="mt-10 text-sm text-muted-foreground">
            Questions? Reach out at{" "}
            <a href="mailto:smif26@purdue.edu" className="link-underline text-gold-deep font-medium hover:text-gold">
              smif26@purdue.edu
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
