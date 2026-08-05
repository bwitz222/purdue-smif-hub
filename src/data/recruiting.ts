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

// ── The application deadline ────────────────────────────────────────────────

/**
 * The application close: the countdown's final target, and the one date on
 * this page that can actually cost a student a seat. Interviews are scheduled
 * from the closed pool by email, which is why they are not on the public
 * calendar above. Edit this and every surface follows — the countdown, the
 * agenda's closing row, and the Sectors open-seat chips.
 */
export const APPLICATION_DEADLINE = {
  iso: "2026-09-04",
  /** Display date, matching the style of the calendar rows. */
  date: "Fri, Sep 4",
  time: "11:59 PM",
  label: "Applications close",
} as const;

export function applicationDeadlineMs(): number {
  return new Date(`${APPLICATION_DEADLINE.iso}T23:59:00-04:00`).getTime();
}

// ── Milestones: the full runway, in order ───────────────────────────────────

/**
 * A milestone is anything the countdown can point at: every calendar event,
 * then the application close.
 *
 * Modelling the deadline as a milestone rather than a calendar row is what
 * keeps the two representations honest. The countdown walks milestones, so it
 * finishes on the deadline instead of falling off the end after the last
 * interview. The .ics export and the schema.org Events walk CALENDAR, so the
 * deadline — which is not an event anyone attends — never becomes a bogus
 * calendar entry with a room and a start time.
 */
export type Milestone = {
  kind: "event" | "deadline";
  name: string;
  date: string;
  time: string;
  location: string | null;
  /** What the countdown counts down TO. */
  startMs: number;
  /** When it stops being the thing a visitor should be looking at. */
  endMs: number;
  /** The underlying calendar row, for Google Calendar links. Null for the deadline. */
  event: RecruitingEvent | null;
};

/**
 * The runway the countdown walks: every event up to the application close,
 * then the close itself. Nothing after it.
 *
 * The filter is deliberate rather than incidental. Today every calendar event
 * precedes the deadline, so it is a no-op — but if an event is ever added
 * after the close (an interview day, an admitted-students session), it belongs
 * on the calendar without becoming something a prospective applicant is
 * counted down to. Once applications shut there is nothing left for them to
 * act on.
 */
export function milestones(): Milestone[] {
  const deadlineMs = applicationDeadlineMs();
  const events: Milestone[] = CALENDAR.filter((event) => eventStartMs(event) < deadlineMs).map(
    (event) => ({
      kind: "event" as const,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      startMs: eventStartMs(event),
      endMs: eventEndMs(event),
      event,
    }),
  );
  const deadline: Milestone = {
    kind: "deadline",
    name: APPLICATION_DEADLINE.label,
    date: APPLICATION_DEADLINE.date,
    time: APPLICATION_DEADLINE.time,
    location: null,
    // A deadline is an instant, not a window: it is its own start and end.
    startMs: deadlineMs,
    endMs: deadlineMs,
    event: null,
  };
  // Sorted rather than concatenated so that moving the deadline earlier — say,
  // to the night of the last callout — reorders the runway correctly instead
  // of stranding it at the end.
  return [...events, deadline].sort((a, b) => a.startMs - b.startMs);
}

/** True while a milestone is underway — started, not yet finished. */
export function isInProgress(m: Milestone, nowMs: number): boolean {
  return nowMs >= m.startMs && nowMs < m.endMs;
}

/**
 * The next milestone that hasn't finished, or null once the cycle is over.
 * This is what the countdown targets, so it rolls automatically:
 * B-Involved Fair → Callout 1 → … → Interviews → Applications close → closed.
 */
export function nextMilestone(nowMs: number): Milestone | null {
  return milestones().find((m) => m.endMs > nowMs) ?? null;
}

/** Everything still ahead, in order — used for the "then:" runway line. */
export function upcomingMilestones(nowMs: number): Milestone[] {
  return milestones().filter((m) => m.endMs > nowMs);
}
