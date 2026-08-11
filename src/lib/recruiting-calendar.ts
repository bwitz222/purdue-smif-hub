// The recruiting calendar and the date math around it.
//
// This lived inside src/routes/recruiting.tsx until the persistent mobile
// Apply bar needed the same "what's next, and how long until it" answer.
// Two copies of a countdown would drift, so the data and the parsing live
// here and both consumers import them.
//
// Everything is timezone-explicit: the Aug–Sep recruiting window is EDT
// (-04:00), hardcoded, and only valid for that window. Revisit if the
// calendar ever spans a DST boundary.

import { useEffect, useState } from "react";

export type RecruitingEvent = {
  date: string; // display date, e.g. "Tue, Aug 25"
  iso: string; // sort key + date component of the real timestamp
  name: string;
  time: string; // display time range, e.g. "7:30 - 8:30 PM", or "TBD"
  location: string;
};

/** Hand-sorted ascending — nextUpcomingEvent uses .find, not a min-scan. */
export const CALENDAR: RecruitingEvent[] = [
  { iso: "2026-08-22", date: "Sat, Aug 22", name: "B-Involved Fair",          time: "12:00 - 3:00 PM",  location: "Memorial Mall (TBD)" },
  { iso: "2026-08-25", date: "Tue, Aug 25", name: "SMIF Callout 1",            time: "7:30 - 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-08-26", date: "Wed, Aug 26", name: "SMIF Coffee Chats 1",       time: "7:15 - 8:00 PM",   location: "Rawls 1011" },
  { iso: "2026-08-27", date: "Thu, Aug 27", name: "Daniels Club Expo",         time: "12:00 - 4:00 PM",  location: "Rawls Atrium" },
  { iso: "2026-08-27", date: "Thu, Aug 27", name: "SMIF Callout 2",            time: "7:30 - 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-08-31", date: "Mon, Aug 31", name: "SMIF Finance Club Consortium", time: "12:00 - 2:30 PM", location: "Rawls Atrium" },
  { iso: "2026-08-31", date: "Mon, Aug 31", name: "SMIF Coffee Chats 2",       time: "7:00 - 8:00 PM",   location: "Rawls 1086" },
  { iso: "2026-09-01", date: "Tue, Sep 1",  name: "SMIF Callout 3",            time: "7:30 - 8:30 PM",   location: "Rawls 1086" },
  { iso: "2026-09-08", date: "Mon, Sep 8",  name: "SMIF Interviews, Day A",    time: "TBD",              location: "Young Hall 223, 217, 219, 213" },
  { iso: "2026-09-09", date: "Tue, Sep 9",  name: "SMIF Interviews, Day B",    time: "TBD",              location: "Young Hall 223, 217, 219, 213" },
];

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Parse "7:30 PM" / "12:00 PM" into 24h, or null if it isn't a clock. */
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
 * Parse a display range like "7:30 - 8:30 PM". The meridiem on the end token
 * applies to the start when the start omits it. "TBD" defaults to 5–6 PM ET
 * so an interview day still sorts and renders sensibly.
 */
export function parseEventTimes(time: string): {
  start: { h: number; m: number };
  end: { h: number; m: number };
} {
  if (time === "TBD") {
    return { start: { h: 17, m: 0 }, end: { h: 18, m: 0 } };
  }
  // Accept hyphen or en-dash separators, surrounded by spaces so clock values
  // like "7:30" are never split.
  const parts = time.split(/\s+[–-]\s+/).map((s) => s.trim());
  if (parts.length !== 2) return { start: { h: 17, m: 0 }, end: { h: 18, m: 0 } };
  let [startStr] = parts;
  const [, endStr] = parts;
  if (!/AM|PM/i.test(startStr)) {
    const merMatch = endStr.match(/AM|PM/i);
    if (merMatch) startStr = `${startStr} ${merMatch[0]}`;
  }
  const start = parseTimeToken(startStr) ?? { h: 17, m: 0 };
  const end = parseTimeToken(endStr) ?? { h: 18, m: 0 };
  return { start, end };
}

export function parseEventStartMs(event: RecruitingEvent): number {
  const { start } = parseEventTimes(event.time);
  const iso = `${event.iso}T${pad2(start.h)}:${pad2(start.m)}:00-04:00`;
  return new Date(iso).getTime();
}

export function nextUpcomingEvent(nowMs: number): RecruitingEvent | null {
  return CALENDAR.find((e) => parseEventStartMs(e) > nowMs) ?? null;
}

export type CountdownState =
  | { expired: true }
  | {
      expired: false;
      event: RecruitingEvent;
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };

/**
 * Countdown to the next calendar event, or null until the client has mounted.
 *
 * The null-on-first-render is the whole SSR safety story: Date.now() is never
 * read during render, so the server HTML and the first client render are
 * identical and hydration cannot mismatch. The clock only starts in the effect.
 *
 * `tickMs` lets a compact consumer tick once a minute instead of once a second
 * — a bar that only shows days and hours has no reason to re-render 60× more
 * often than it changes.
 */
export function useCountdown(tickMs = 1000): CountdownState | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  if (now === null) return null;
  const next = nextUpcomingEvent(now);
  if (!next) return { expired: true };
  const diff = Math.max(0, parseEventStartMs(next) - now);
  return {
    expired: false,
    event: next,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

/**
 * Server/no-JS label. Names a real upcoming event using the render-time clock
 * so the resting HTML matches what the live ticker will say once it hydrates.
 * Falls back to the last event, marked expired, when the cycle is over.
 */
export function staticNextEventLabel(): {
  name: string;
  date: string;
  time: string;
  expired: boolean;
} {
  const next = nextUpcomingEvent(Date.now());
  if (next) return { name: next.name, date: next.date, time: next.time, expired: false };
  const last = CALENDAR[CALENDAR.length - 1];
  return { name: last?.name ?? "", date: last?.date ?? "", time: last?.time ?? "", expired: true };
}
