// The recruiting calendar, and the one place that decides whether applications
// are open. /recruiting renders the calendar; every Apply button on the site
// reads applicationsOpen() so a closed cycle can't still say "Apply Now".

export const RECRUITING_EMAIL = "smif26@purdue.edu";

export type RecruitingEvent = {
  date: string; // display date
  iso: string; // for sorting
  name: string;
  time: string;
  location: string;
};

export const CALENDAR: RecruitingEvent[] = [
  {
    iso: "2026-08-22",
    date: "Sat, Aug 22",
    name: "B-Involved Fair",
    time: "12:00 - 3:00 PM",
    location: "Memorial Mall (TBD)",
  },
  {
    iso: "2026-08-25",
    date: "Tue, Aug 25",
    name: "SMIF Callout 1",
    time: "7:30 - 8:30 PM",
    location: "Rawls 1086",
  },
  {
    iso: "2026-08-26",
    date: "Wed, Aug 26",
    name: "SMIF Coffee Chats 1",
    time: "7:15 - 8:00 PM",
    location: "Rawls 1011",
  },
  {
    iso: "2026-08-27",
    date: "Thu, Aug 27",
    name: "Daniels Club Expo",
    time: "12:00 - 4:00 PM",
    location: "Rawls Atrium",
  },
  {
    iso: "2026-08-27",
    date: "Thu, Aug 27",
    name: "SMIF Callout 2",
    time: "7:30 - 8:30 PM",
    location: "Rawls 1086",
  },
  {
    iso: "2026-08-31",
    date: "Mon, Aug 31",
    name: "SMIF Finance Club Consortium",
    time: "12:00 - 2:30 PM",
    location: "Rawls Atrium",
  },
  {
    iso: "2026-08-31",
    date: "Mon, Aug 31",
    name: "SMIF Coffee Chats 2",
    time: "7:00 - 8:00 PM",
    location: "Rawls 1086",
  },
  {
    iso: "2026-09-01",
    date: "Tue, Sep 1",
    name: "SMIF Callout 3",
    time: "7:30 - 8:30 PM",
    location: "Rawls 1086",
  },
  {
    iso: "2026-09-08",
    date: "Tue, Sep 8",
    name: "SMIF Interviews, Day A",
    time: "TBD",
    location: "Young Hall 223, 217, 219, 213",
  },
  {
    iso: "2026-09-09",
    date: "Wed, Sep 9",
    name: "SMIF Interviews, Day B",
    time: "TBD",
    location: "Young Hall 223, 217, 219, 213",
  },
];

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

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

// Parse event.time like "7:30 - 8:30 PM" or "12:00 - 3:00 PM" — meridiem from end token applies to start if missing
export function parseEventTimes(time: string): {
  start: { h: number; m: number };
  end: { h: number; m: number };
} | null {
  // A TBD slot has no time. It used to return 17:00-18:00, and that invented
  // hour was published as a real 5 PM event in the .ics, the Google Calendar
  // link and the Event structured data — so a student who clicked "add to
  // Google Calendar" got a fabricated interview time on their calendar.
  // Callers render these as all-day events instead.
  if (time === "TBD") return null;
  // Accept hyphen or en-dash range separators (surrounded by spaces so
  // clock values like "7:30" are never split).
  const parts = time.split(/\s+[–-]\s+/).map((s) => s.trim());
  if (parts.length !== 2) return { start: { h: 17, m: 0 }, end: { h: 18, m: 0 } };
  const [rawStart, endStr] = parts;
  let startStr = rawStart;
  // If start lacks meridiem, inherit from end
  if (!/AM|PM/i.test(startStr)) {
    const merMatch = endStr.match(/AM|PM/i);
    if (merMatch) startStr = `${startStr} ${merMatch[0]}`;
  }
  const start = parseTimeToken(startStr) ?? { h: 17, m: 0 };
  const end = parseTimeToken(endStr) ?? { h: 18, m: 0 };
  return { start, end };
}

export function parseEventStartMs(event: RecruitingEvent): number {
  const times = parseEventTimes(event.time);
  // Eastern offset for the Aug–Sep recruiting window is EDT (-04:00). A TBD
  // slot has no hour, so it sorts from the start of its day.
  const start = times ? times.start : { h: 0, m: 0 };
  const iso = `${event.iso}T${pad2(start.h)}:${pad2(start.m)}:00-04:00`;
  return new Date(iso).getTime();
}

export function nextUpcomingEvent(nowMs: number): RecruitingEvent | null {
  return CALENDAR.find((e) => parseEventStartMs(e) > nowMs) ?? null;
}

/**
 * The application window runs from the start of the cycle's first event to
 * the start of the first interview (the Apply timeline puts the application
 * before interviews). Outside it, Apply buttons route to /recruiting instead
 * of the closed Qualtrics form.
 */
export function applicationsOpen(nowMs: number): boolean {
  if (CALENDAR.length === 0) return false;
  const opens = new Date(`${CALENDAR[0].iso}T00:00:00-04:00`).getTime();
  const firstInterview = CALENDAR.find((e) => /interview/i.test(e.name));
  const closes = parseEventStartMs(firstInterview ?? CALENDAR[CALENDAR.length - 1]);
  return nowMs >= opens && nowMs < closes;
}
