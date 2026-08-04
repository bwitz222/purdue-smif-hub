// The recruiting cycle: the calendar, the application deadline, and the small
// amount of date math both /recruiting and /sectors need.
//
// This used to live inside src/routes/recruiting.tsx. It moved here so the
// Sectors page can name the next event on an open-seat chip without importing
// a route module, and so there is exactly one place to edit when the cycle
// rolls over.

export type RecruitingEvent = {
  /** Display date, e.g. "Tue, Aug 25". */
  date: string;
  /** YYYY-MM-DD, for sorting and for building real timestamps. */
  iso: string;
  name: string;
  /** e.g. "7:30 - 8:30 PM", or "TBD". */
  time: string;
  location: string;
};

export const CYCLE_LABEL = "Fall 2026";

export const CALENDAR: RecruitingEvent[] = [
  { iso: "2026-08-22", date: "Sat, Aug 22", name: "B-Involved Fair",               time: "12:00 - 3:00 PM",  location: "Memorial Mall (TBD)" },
  { iso: "2026-08-25", date: "Tue, Aug 25", name: "SMIF Callout 1",                time: "7:30 - 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-08-26", date: "Wed, Aug 26", name: "SMIF Coffee Chats 1",           time: "7:15 - 8:00 PM",   location: "Rawls 1011" },
  { iso: "2026-08-27", date: "Thu, Aug 27", name: "Daniels Club Expo",             time: "12:00 - 4:00 PM",  location: "Rawls Atrium" },
  { iso: "2026-08-27", date: "Thu, Aug 27", name: "SMIF Callout 2",                time: "7:30 - 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-08-31", date: "Mon, Aug 31", name: "SMIF Finance Club Consortium",  time: "12:00 - 2:30 PM",  location: "Rawls Atrium" },
  { iso: "2026-08-31", date: "Mon, Aug 31", name: "SMIF Coffee Chats 2",           time: "7:00 - 8:00 PM",   location: "Rawls 1086" },
  { iso: "2026-09-01", date: "Tue, Sep 1",  name: "SMIF Callout 3",                time: "7:30 - 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-09-08", date: "Mon, Sep 8",  name: "SMIF Interviews, Day A",        time: "TBD",              location: "Young Hall 223, 217, 219, 213" },
  { iso: "2026-09-09", date: "Tue, Sep 9",  name: "SMIF Interviews, Day B",        time: "TBD",              location: "Young Hall 223, 217, 219, 213" },
];

// ── Time parsing ────────────────────────────────────────────────────────────

/** Parse "7:30 PM" / "12:00 PM" — returns { h, m } in 24h, or null. */
export function parseTimeToken(t: string): { h: number; m: number } | null {
  const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  const [, hh, mm, mer] = match;
  let h = parseInt(hh, 10);
  const m = parseInt(mm, 10);
  if (mer.toUpperCase() === "PM" && h !== 12) h += 12;
  if (mer.toUpperCase() === "AM" && h === 12) h = 0;
  return { h, m };
}

/**
 * Parse an event's time range like "7:30 - 8:30 PM" or "12:00 - 3:00 PM".
 * A start token without a meridiem inherits it from the end token.
 */
export function parseEventTimes(time: string): {
  start: { h: number; m: number };
  end: { h: number; m: number };
} {
  if (time === "TBD") return { start: { h: 17, m: 0 }, end: { h: 18, m: 0 } };
  // Accept hyphen or en-dash separators, surrounded by spaces so clock values
  // like "7:30" are never split.
  const parts = time.split(/\s+[–-]\s+/).map((s) => s.trim());
  if (parts.length !== 2) return { start: { h: 17, m: 0 }, end: { h: 18, m: 0 } };
  const [rawStart, endStr] = parts;
  let startStr = rawStart;
  if (!/AM|PM/i.test(startStr)) {
    const merMatch = endStr.match(/AM|PM/i);
    if (merMatch) startStr = `${startStr} ${merMatch[0]}`;
  }
  return {
    start: parseTimeToken(startStr) ?? { h: 17, m: 0 },
    end: parseTimeToken(endStr) ?? { h: 18, m: 0 },
  };
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Epoch ms for an event's start. The Aug–Sep recruiting window is entirely
 * within EDT (-04:00), so the offset is fixed rather than computed.
 */
export function eventStartMs(event: RecruitingEvent): number {
  const { start } = parseEventTimes(event.time);
  return new Date(`${event.iso}T${pad2(start.h)}:${pad2(start.m)}:00-04:00`).getTime();
}

export function eventEndMs(event: RecruitingEvent): number {
  const { end } = parseEventTimes(event.time);
  return new Date(`${event.iso}T${pad2(end.h)}:${pad2(end.m)}:00-04:00`).getTime();
}

/**
 * The next event that has not yet finished, given a clock reading.
 *
 * Deliberately keyed off the END of an event, not the start: a callout that
 * began ten minutes ago is still the thing a visitor should be looking at, and
 * rolling to the following event mid-session would send them to the wrong room.
 */
export function nextEvent(nowMs: number): RecruitingEvent | null {
  return CALENDAR.find((e) => eventEndMs(e) > nowMs) ?? null;
}

/** Every event still ahead, in order. */
export function upcomingEvents(nowMs: number): RecruitingEvent[] {
  return CALENDAR.filter((e) => eventEndMs(e) > nowMs);
}
