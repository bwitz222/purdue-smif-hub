import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Calendar, CalendarPlus, MapPin, Clock, Download, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { socialMeta, canonical, breadcrumbLd, OG_RECRUITING } from "@/lib/seo";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PrepCard } from "@/components/PrepCard";
import { SweepRule } from "@/components/SectionRule";
import {
  CALENDAR,
  CYCLE_LABEL,
  APPLICATION_DEADLINE,
  applicationDeadlineMs,
  parseEventTimes,
  pad2,
  eventEndMs,
  nextMilestone,
  upcomingMilestones,
  isInProgress,
  type RecruitingEvent,
} from "@/data/recruiting";

import { applyUrl } from "@/lib/apply-url";

/**
 * The countdown walks the whole recruiting runway.
 *
 * It targets nextMilestone(), which is every calendar event in order followed
 * by the application close — so it rolls from the B-Involved Fair through the
 * callouts, coffee chats, and interviews, finishes on the deadline, and only
 * then shows the closed notice. Nothing is special-cased per event: editing
 * src/data/recruiting.ts changes the sequence.
 *
 * The digits are real on the server. The route loader stamps a clock, the
 * component seeds its state from it, and the first client render reproduces
 * the same numbers — so the HTML never ships "--Days --Hours --Minutes", the
 * most time-critical element on the site never paints as an error, and there
 * is no hydration mismatch. The 1s interval takes over on mount.
 */
function useCountdown(serverNowMs: number) {
  const [now, setNow] = useState(serverNowMs);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = nextMilestone(now);
  if (!target) return { expired: true as const };

  const inProgress = isInProgress(target, now);
  const diff = Math.max(0, target.startMs - now);
  return {
    expired: false as const,
    milestone: target,
    inProgress,
    upNext: upcomingMilestones(now).slice(1, 3),
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

/**
 * Digit tick — only the digits that actually changed re-animate, over 180ms.
 * Flipping the whole four-digit block every second is noise; flipping the ones
 * column is information. Transform and opacity only, and disabled outright
 * under reduced motion.
 */
function TickingDigits({ value }: { value: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="inline-flex tabular-nums">
      {value.split("").map((d, i) =>
        reduce ? (
          <span key={i}>{d}</span>
        ) : (
          <span key={i} className="relative inline-block overflow-hidden">
            <motion.span
              // Keying on the digit remounts only when that column changes, so
              // a static tens column sits perfectly still while the ones ticks.
              key={d}
              initial={{ y: "-45%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              {d}
            </motion.span>
          </span>
        ),
      )}
    </span>
  );
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[72px] flex-1 flex-col items-center border border-gold/30 bg-ink/40 px-4 py-3 sm:flex-none">
      <span className="font-display text-3xl font-bold text-gold md:text-4xl">
        <TickingDigits value={value} />
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-dark-secondary">
        {label}
      </span>
    </div>
  );
}

function Countdown({ serverNowMs }: { serverNowMs: number }) {
  const c = useCountdown(serverNowMs);
  const pad = (n: number) => n.toString().padStart(2, "0");

  // The whole cycle, deadline included, has passed.
  if (c.expired) {
    return (
      <div role="status" className="border border-gold/30 bg-ink/60 p-6 text-background md:p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Applications Closed
        </div>
        <p className="mt-2 text-sm text-on-dark-secondary">
          Applications for the {CYCLE_LABEL} cycle closed on {APPLICATION_DEADLINE.date}. Watch this
          page or follow us on Instagram for the next application window.
        </p>
      </div>
    );
  }

  const { milestone, inProgress, upNext } = c;
  const isDeadline = milestone.kind === "deadline";
  const sub = isDeadline
    ? `${milestone.date} · ${milestone.time} ET`
    : `${milestone.date} · ${milestone.time} ET${milestone.location ? ` · ${milestone.location}` : ""}`;

  const srLabel = inProgress
    ? `${milestone.name} is happening now.`
    : `${c.days} days, ${c.hours} hours, ${c.minutes} minutes until ${milestone.name} on ${milestone.date}.`;

  return (
    <div
      className={`border bg-ink/60 p-6 text-background md:p-8 ${isDeadline ? "border-gold" : "border-gold/30"}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          {inProgress ? "Happening now" : isDeadline ? "Final deadline" : "Next"}
        </span>
        <span className="font-display text-xl font-bold md:text-2xl">{milestone.name}</span>
      </div>
      <p className="mt-1 text-sm text-on-dark-secondary">{sub}</p>

      {/* Plain-text countdown for assistive tech. Always present, so screen
          reader and no-JS users get a complete sentence rather than digits. */}
      <span className="sr-only" aria-live="polite">
        {srLabel}
      </span>

      {inProgress ? (
        <p className="mt-5 font-mono text-sm text-gold">Underway — come find us.</p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3" aria-hidden="true">
          <CountdownUnit value={String(c.days)} label="Days" />
          <CountdownUnit value={pad(c.hours)} label="Hours" />
          <CountdownUnit value={pad(c.minutes)} label="Minutes" />
          <CountdownUnit value={pad(c.seconds)} label="Seconds" />
        </div>
      )}

      {/* The runway. One date in isolation doesn't tell an applicant that this
          is a sequence with an end; naming what follows does. */}
      {upNext.length > 0 && (
        <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-on-dark-muted">
          Then:{" "}
          {upNext.map((m, i) => (
            <span key={m.name + m.date}>
              {i > 0 && <span className="mx-1.5 text-white/25">/</span>}
              <span className={m.kind === "deadline" ? "text-gold" : undefined}>
                {m.name}, {m.date}
              </span>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}




// Returns "2026-08-25T19:30:00-04:00" (EDT for Aug/Sep 2026)
function buildEventBody(event: RecruitingEvent): string {
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

function generateICS(events: RecruitingEvent[] = CALENDAR): string {
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
function toGoogleCalendarLink(event: RecruitingEvent): string {
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
  // Stamp the server's clock so the countdown renders real digits in the SSR
  // HTML instead of "--Days --Hours --Minutes", and so the first client render
  // reproduces them exactly (no hydration mismatch). Reading a clock cannot
  // throw, so this satisfies the "loaders must not throw" rule in the README.
  loader: () => ({ serverNowMs: Date.now() }),
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
  const { serverNowMs } = Route.useLoaderData();
  // Client clock for the "past" marks on the agenda. Seeded from the server so
  // the first render matches the SSR HTML, then corrected on mount.
  const [nowMs, setNowMs] = useState(serverNowMs);
  useEffect(() => {
    setNowMs(Date.now());
  }, []);

  return (
    <>
      {/* Masthead. The countdown is the page's headline — it is the most
          time-critical thing on the site — so it sits alongside the title
          rather than below two CTAs. */}
      <section className="border-b border-border bg-ink text-background">
        <div className="container-prose grid gap-10 py-20 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start lg:gap-16">
          <div>
            <span className="animate-fade-in text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              Recruiting · {CYCLE_LABEL}
            </span>
            <h1 className="animate-fade-up mt-4 max-w-3xl font-display text-5xl font-bold md:text-6xl">
              Join the Fund.
            </h1>
            <p className="animate-fade-up mt-6 max-w-2xl text-lg text-background/70">
              Our recruiting calendar, plus a complete guide to preparing for both behavioral and
              technical interviews with SMIF.
            </p>
            <div className="animate-fade-up mt-8 flex flex-wrap gap-3">
              <a
                href={applyUrl("recruiting-hero")}
                target="_blank"
                rel="noopener noreferrer"
                className="press group inline-flex items-center gap-2 bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-mid"
              >
                Apply Now <ArrowRight className="h-4 w-4 arrow-slide" aria-hidden="true" />
              </a>
              <a
                href="#prep"
                className="press inline-flex items-center gap-2 border border-background/30 px-6 py-3 text-sm font-semibold text-background hover:border-gold hover:text-gold"
              >
                Jump to Prep Guide
              </a>
            </div>
          </div>
          <div className="lg:pt-2">
            <Countdown serverNowMs={serverNowMs} />
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="container-prose py-20">
        <Reveal className="flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Fall 2026</span>
            <SweepRule index={0} className="mt-3" />
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
            aria-label={`Download all ${CALENDAR.length} events as iCal file`}
            className="press group inline-flex items-center gap-2 border border-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-ink hover:text-background cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 icon-pop" />
            Download all events (.ics)
          </button>
        </div>

        <RevealGroup className="mt-8 divide-y divide-border border-b border-border">
          {CALENDAR.map((e) => {
            // Keyed to the event's actual end, not midnight: a callout that
            // finished at 8:30pm is past, and the agenda should agree with the
            // countdown about that rather than waiting for the date to roll.
            const isPast = eventEndMs(e) < nowMs;
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

        {/* The application close, as the end of the runway. It is not a
            calendar event — nobody attends it, there is no room, and it gets
            no Google Calendar link or .ics entry — but it is the date that
            actually decides whether someone gets a seat, so it terminates the
            agenda rather than being left implicit. */}
        <div
          className={`mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-2 px-4 py-5 ${
            applicationDeadlineMs() < nowMs
              ? "border-border bg-muted/40"
              : "border-gold bg-secondary/50"
          }`}
        >
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-gold-deep">
            {applicationDeadlineMs() < nowMs ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            {APPLICATION_DEADLINE.date}
          </span>
          <span className="font-display text-lg font-bold">
            {APPLICATION_DEADLINE.label}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {APPLICATION_DEADLINE.time} ET
          </span>
          {applicationDeadlineMs() < nowMs && (
            <span className="inline-block border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Closed
            </span>
          )}
        </div>

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
            <SweepRule index={0} className="mb-4" />
            <h2 className="font-display text-3xl font-bold md:text-4xl">Tips &amp; Tricks to Prep</h2>
            {/* The prep guide is the longest scroll on the site. A sub-nav
                makes it navigable instead of something you page through. */}
            <nav aria-label="Prep guide sections" className="mt-6 flex flex-wrap gap-2">
              {[
                { href: "#behavioral", label: "Behavioral" },
                { href: "#technical", label: "Technical" },
                { href: "#day-of", label: "Day-of" },
                { href: "#reading", label: "Reading" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="press inline-flex min-h-11 items-center border border-border bg-background px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-ink hover:bg-secondary"
                >
                  {label}
                </a>
              ))}
            </nav>
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
              <h3 id="behavioral" className="mt-3 scroll-mt-20 font-display text-2xl font-bold md:text-3xl">Behavioral Interview</h3>
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
              <h3 id="technical" className="mt-3 scroll-mt-20 font-display text-2xl font-bold md:text-3xl">Technical Interview</h3>
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
            <h3 id="day-of" className="scroll-mt-20 font-display text-xl font-bold">Day-Of Checklist</h3>
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
            <h3 id="reading" className="scroll-mt-20 font-display text-xl font-bold">Recommended Reading</h3>
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
