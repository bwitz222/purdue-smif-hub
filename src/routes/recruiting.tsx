import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Calendar, MapPin, Clock, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { socialMeta, canonical, OG_RECRUITING } from "@/lib/seo";

const APPLICATION_URL = "https://purdue.ca1.qualtrics.com/jfe/form/SV_1G5FfwJUc1cGJ2m";
const DEADLINE = new Date("2026-09-04T23:59:00-04:00").getTime();

function useCountdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, DEADLINE - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    expired: diff === 0,
  };
}

function CountdownUnit({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center border border-gold/30 bg-ink/40 px-4 py-3 min-w-[72px]">
      <span className="font-display text-3xl font-bold text-gold tabular-nums md:text-4xl">{value}</span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-dark-secondary">{label}</span>
    </div>
  );
}

function Countdown() {
  const c = useCountdown();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="mt-10 border border-gold/30 bg-ink/60 p-6 text-background md:p-8" aria-live="off" aria-atomic="true">
      <div className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
        {c?.expired ? "Applications Closed" : "Deadline Countdown"}
      </div>
      <div className="mt-1 text-sm text-on-dark-secondary">September 4th, 2026 · 11:59pm EST</div>
      <div className="mt-5 flex flex-wrap gap-3">
        <CountdownUnit value={c ? c.days : "—"} label="Days" />
        <CountdownUnit value={c ? pad(c.hours) : "—"} label="Hours" />
        <CountdownUnit value={c ? pad(c.minutes) : "—"} label="Minutes" />
        <CountdownUnit value={c ? pad(c.seconds) : "—"} label="Seconds" />
      </div>
    </div>
  );
}


type Event = {
  date: string; // display date
  iso: string;  // for sorting
  name: string;
  time: string;
  location: string;
};

const CALENDAR: Event[] = [
  { iso: "2026-08-22", date: "Sat, Aug 22", name: "B-Involved Fair",          time: "12:00 – 3:00 PM",  location: "Memorial Mall (TBD)" },
  { iso: "2026-08-25", date: "Tue, Aug 25", name: "SMIF Callout 1",            time: "7:30 – 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-08-26", date: "Wed, Aug 26", name: "SMIF Coffee Chats 1",       time: "7:15 – 8:00 PM",   location: "Rawls 1011" },
  { iso: "2026-08-27", date: "Thu, Aug 27", name: "Daniels Club Expo",         time: "12:00 – 4:00 PM",  location: "Rawls Atrium" },
  { iso: "2026-08-27", date: "Thu, Aug 27", name: "SMIF Callout 2",            time: "7:30 – 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-08-31", date: "Mon, Aug 31", name: "SMIF Finance Club Consortium", time: "12:00 – 2:30 PM", location: "Rawls Atrium" },
  { iso: "2026-08-31", date: "Mon, Aug 31", name: "SMIF Coffee Chats 2",       time: "7:00 – 8:00 PM",   location: "Rawls 1086" },
  { iso: "2026-09-01", date: "Tue, Sep 1",  name: "SMIF Callout 3",            time: "7:30 – 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-09-08", date: "Mon, Sep 8",  name: "SMIF Interviews – A",       time: "TBD",              location: "Young Hall 223, 217, 219, 213" },
  { iso: "2026-09-09", date: "Tue, Sep 9",  name: "SMIF Interviews – B",       time: "TBD",              location: "Young Hall 223, 217, 219, 213" },
];

// Parse "7:30 PM" / "12:00 PM" — returns { h, m } in 24h, or null
function parseTimeToken(t: string): { h: number; m: number } | null {
  const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  const [, hh, mm, mer] = match;
  let h = parseInt(hh, 10);
  const m = parseInt(mm, 10);
  if (mer.toUpperCase() === "PM" && h !== 12) h += 12;
  if (mer.toUpperCase() === "AM" && h === 12) h = 0;
  return { h, m };
}

// Parse event.time like "7:30 – 8:30 PM" or "12:00 – 3:00 PM" — meridiem from end token applies to start if missing
function parseEventTimes(time: string): { start: { h: number; m: number }; end: { h: number; m: number } } {
  if (time === "TBD") {
    return { start: { h: 17, m: 0 }, end: { h: 18, m: 0 } };
  }
  const parts = time.split("–").map((s) => s.trim());
  if (parts.length !== 2) return { start: { h: 17, m: 0 }, end: { h: 18, m: 0 } };
  let [startStr, endStr] = parts;
  // If start lacks meridiem, inherit from end
  if (!/AM|PM/i.test(startStr)) {
    const merMatch = endStr.match(/AM|PM/i);
    if (merMatch) startStr = `${startStr} ${merMatch[0]}`;
  }
  const start = parseTimeToken(startStr) ?? { h: 17, m: 0 };
  const end = parseTimeToken(endStr) ?? { h: 18, m: 0 };
  return { start, end };
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

// Returns "2026-08-25T19:30:00-04:00" (EDT for Aug/Sep 2026)
function buildEventBody(event: Event): string {
  const prefix = event.time === "TBD"
    ? "⚠ Time TBD — your specific interview slot will be communicated by email. Update this event when you receive your slot.\n\n"
    : "";
  return `${prefix}Purdue SMIF recruiting event.\n\nLocation: ${event.location}\nRecruiting page: https://purduesmif.org/recruiting\nQuestions: smif26@purdue.edu`;
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
    "X-WR-CALNAME:Purdue SMIF Recruiting — Fall 2026",
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
      { title: "Recruiting — Purdue SMIF" },
      { name: "description", content: "Recruiting calendar and interview prep guide for the Purdue Student Managed Investment Fund — callouts, coffee chats, and interviews." },
      ...socialMeta({
        title: "Recruiting Calendar & Interview Prep — Purdue SMIF",
        description: "Callouts, coffee chats, interviews, and a behavioral + technical interview prep guide for joining Purdue SMIF.",
        url: canonical("/recruiting"),
        image: OG_RECRUITING,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/recruiting") }],
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
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Recruiting</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">
            Join the Fund.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-background/70">
            Our recruiting calendar, plus a complete guide to preparing for both behavioral and technical interviews with SMIF.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={APPLICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-mid"
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#prep"
              className="inline-flex items-center gap-2 border border-background/30 px-6 py-3 text-sm font-semibold text-background transition hover:border-gold hover:text-gold"
            >
              Jump to Prep Guide
            </a>
          </div>
          <Countdown />
        </div>

      </section>

      {/* Calendar */}
      <section className="container-prose py-20">
        <div className="flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Fall 2026</span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Recruiting Calendar</h2>
          </div>
          <span className="hidden md:inline font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            All times Eastern
          </span>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={downloadICS}
            aria-label="Download all 10 events as iCal file"
            className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-ink hover:text-background transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download all events (.ics)
          </button>
        </div>

        <div className="mt-8 divide-y divide-border border-b border-border">
          {CALENDAR.map((e) => {
            const isPast = nowMs !== null && new Date(e.iso + "T23:59:59-04:00").getTime() < nowMs;
            return (
              <button
                key={e.iso + e.name}
                type="button"
                onClick={() => downloadSingleEventICS(e)}
                title={isPast ? "Add to calendar (.ics) (past event)" : "Add to calendar (.ics)"}
                className={`w-full text-left grid grid-cols-12 gap-4 py-5 transition hover:bg-secondary/40 px-2 -mx-2 cursor-pointer ${isPast ? "opacity-50" : ""}`}
              >
                <div className="col-span-12 md:col-span-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-gold-deep" />
                  {e.date}
                </div>
                <div className="col-span-12 md:col-span-5 font-display text-lg font-bold">
                  {e.name}
                  {isPast && (
                    <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                      Past
                    </span>
                  )}
                </div>
                <div className="col-span-6 md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {e.time}
                </div>
                <div className="col-span-6 md:col-span-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {e.location}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Locations and times subject to change. Email{" "}
          <a href="mailto:smif26@purdue.edu" className="text-gold-deep underline underline-offset-4 hover:text-gold">
            smif26@purdue.edu
          </a>{" "}
          to be added to our mailing list for updates.
        </p>
      </section>

      {/* Prep Guide */}
      <section id="prep" className="border-t border-border bg-secondary/40">
        <div className="container-prose py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Interview Guide</span>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Tips & Tricks to Prep</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            We recruit for curiosity, work ethic, and intellectual honesty — not pedigree. A finance background helps, but we've taken students from every major. Use the guide below to walk in confident and prepared.
          </p>

          {/* Behavioral */}
          <div className="mt-14">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold-deep">Round 1</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">Behavioral Interview</h3>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              We want to understand who you are, why you're interested in markets, and how you work with others. Be specific, be honest, and have stories ready.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <PrepCard
                title="Know Your 'Why'"
                items={[
                  "Why finance? Why investing? Why SMIF specifically?",
                  "Tie answers to specific experiences — a class, a book, a market event — not buzzwords.",
                  "Have a thoughtful answer for 'why this sector' if asked.",
                ]}
              />
              <PrepCard
                title="STAR Stories"
                items={[
                  "Prepare 3–4 stories: leadership, teamwork, conflict, failure.",
                  "Situation → Task → Action → Result. Keep each story to ~90 seconds.",
                  "Reuse stories across questions — depth beats breadth.",
                ]}
              />
              <PrepCard
                title="Know SMIF"
                items={[
                  "Read our About, Sectors, and Holdings pages before you walk in.",
                  "Understand the structure: analyst → senior analyst → sector head → executive board.",
                  "Reference a recent publication or holding that genuinely caught your interest.",
                ]}
              />
              <PrepCard
                title="Ask Sharp Questions"
                items={[
                  "Always have 2–3 questions ready for your interviewers.",
                  "Avoid questions answered on the website. Ask about their experience, not logistics.",
                  "Good prompt: 'What's a position you pushed back on in committee and why?'",
                ]}
              />
            </div>
          </div>

          {/* Technical */}
          <div className="mt-16">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gold" />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold-deep">Round 2</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">Technical Interview</h3>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              You don't need to be an investment banking analyst already. We test fundamentals, market awareness, and your ability to defend an investment thesis.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <PrepCard
                title="Accounting Foundations"
                items={[
                  "Walk through the three financial statements and how they link.",
                  "Depreciation +$10 — walk through impact on IS, CF, and BS (after taxes).",
                  "Know the difference between EBITDA, operating income, and net income.",
                ]}
              />
              <PrepCard
                title="Valuation Basics"
                items={[
                  "Understand the big picture: a company is worth the present value of its future cash flows.",
                  "Learn the three main approaches: DCF (intrinsic), comparables (relative), and precedent transactions.",
                  "Start with P/E and EV/EBITDA — know what they measure and when each is useful.",
                ]}
              />
              <PrepCard
                title="Market Awareness"
                items={[
                  "Know where the S&P 500, Nasdaq, 10Y Treasury, and Fed Funds rate sit directionally.",
                  "Be ready to discuss one recent market headline and its implications.",
                  "Daily reads: WSJ, Bloomberg, FT, Axios Markets, Matt Levine's Money Stuff.",
                ]}
              />
              <PrepCard
                title="Stock Pitch"
                items={[
                  "Prepare one long idea: thesis, 2–3 catalysts, valuation, and key risks.",
                  "Pick a name you genuinely understand — not the most complex one you can find.",
                  "Structure: 'I'd buy X at $Y because… Catalysts are… Valuation supports… Risks are…'",
                ]}
              />
            </div>
          </div>

          {/* Day-of */}
          <div className="mt-14 border border-gold/30 bg-background p-6 md:p-8">
            <h3 className="font-display text-xl font-bold">Day-Of Checklist</h3>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <li>• Business professional dress — suit and tie / equivalent.</li>
              <li>• Arrive 10 minutes early. Silence your phone.</li>
              <li>• Bring printed copies of your resume and a notepad.</li>
              <li>• Know your resume cold — anything on it is fair game.</li>
              <li>• Firm handshake, eye contact, and smile.</li>
              <li>• Be yourself — we evaluate fit as much as skill.</li>
            </ul>
          </div>

          {/* Reading list */}
          <div className="mt-10 border border-border bg-background p-6 md:p-8">
            <h3 className="font-display text-xl font-bold">Recommended Reading</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• <span className="font-medium text-foreground">The Intelligent Investor</span> — Benjamin Graham · foundational value investing</li>
              <li>• <span className="font-medium text-foreground">One Up On Wall Street</span> — Peter Lynch · intuitive intro to stock picking</li>
              <li>• <span className="font-medium text-foreground">Investment Banking</span> — Rosenbaum &amp; Pearl · valuation reference</li>
              <li>• <span className="font-medium text-foreground">Damodaran Online</span> — free valuation resources from NYU Stern</li>
              <li>• <span className="font-medium text-foreground">Money Stuff</span> — Matt Levine's daily Bloomberg newsletter</li>
            </ul>
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            Questions? Reach out at{" "}
            <a href="mailto:smif26@purdue.edu" className="text-gold-deep underline underline-offset-4 hover:text-gold">
              smif26@purdue.edu
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}

function PrepCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-border bg-background p-6 transition hover:border-gold/40">
      <h4 className="font-display text-lg font-bold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold-deep" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
