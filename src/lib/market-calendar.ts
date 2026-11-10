// US equity-market calendar, just enough to answer one question: which trading
// session should the latest available close belong to, right now? The holdings
// page uses it to say how far behind a data set is, in trading sessions rather
// than clock hours (a Friday close is not "stale" on Saturday afternoon).
//
// NYSE full-day closures. Early 1 p.m. closes are ignored: they do not change
// which date the session belongs to. Extend this list each January.
const NYSE_HOLIDAYS = new Set([
  // 2026
  "2026-01-01", // New Year's Day
  "2026-01-19", // Martin Luther King Jr. Day
  "2026-02-16", // Presidents Day
  "2026-04-03", // Good Friday
  "2026-05-25", // Memorial Day
  "2026-06-19", // Juneteenth
  "2026-07-03", // Independence Day (observed)
  "2026-09-07", // Labor Day
  "2026-11-26", // Thanksgiving
  "2026-12-25", // Christmas
  // 2027
  "2027-01-01",
  "2027-01-18",
  "2027-02-15",
  "2027-03-26", // Good Friday
  "2027-05-31",
  "2027-06-18", // Juneteenth (observed)
  "2027-07-05", // Independence Day (observed)
  "2027-09-06",
  "2027-11-25",
  "2027-12-24", // Christmas (observed)
]);

const CLOSE_MINUTES_ET = 16 * 60;

const addDays = (ymd: string, n: number): string => {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export function isTradingDay(ymd: string): boolean {
  const dow = new Date(`${ymd}T12:00:00Z`).getUTCDay();
  return dow !== 0 && dow !== 6 && !NYSE_HOLIDAYS.has(ymd);
}

/** Wall-clock date and minutes-since-midnight in New York for an instant. */
function easternParts(now: Date): { ymd: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

/** The most recent session whose 4 p.m. ET close has already happened. */
export function lastCompletedSession(now: Date = new Date()): string {
  const { ymd, minutes } = easternParts(now);
  let day = ymd;
  if (!(isTradingDay(day) && minutes >= CLOSE_MINUTES_ET)) day = addDays(day, -1);
  while (!isTradingDay(day)) day = addDays(day, -1);
  return day;
}

/** How many completed sessions have happened after `sessionDate`. 0 means current. */
export function sessionsBehind(sessionDate: string, now: Date = new Date()): number {
  const last = lastCompletedSession(now);
  let n = 0;
  for (let day = addDays(sessionDate, 1); day <= last; day = addDays(day, 1)) {
    if (isTradingDay(day)) n++;
  }
  return n;
}

export type FreshnessLevel = "current" | "latest" | "stale" | "unknown";

export type Freshness = {
  sessionDate: string | null;
  behind: number | null;
  level: FreshnessLevel;
};

/**
 * Classify a data set by its session date.
 *  current  holds the most recent completed close
 *  latest   one or two closes behind: the data provider releases each close
 *           with a delay, so this is the newest the page can honestly show
 *  stale    three or more closes behind: a refresh job has stopped working
 *  unknown  no date yet (nothing loaded)
 */
export function freshnessOf(sessionDate: string | null | undefined, now: Date | null): Freshness {
  if (!sessionDate) return { sessionDate: null, behind: null, level: "unknown" };
  if (!now) return { sessionDate, behind: null, level: "unknown" };
  const behind = sessionsBehind(sessionDate, now);
  return {
    sessionDate,
    behind,
    level: behind === 0 ? "current" : behind <= 2 ? "latest" : "stale",
  };
}

/** "Fri, Nov 6" for a YYYY-MM-DD session date. */
export function formatSessionDate(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "Fri, Nov 6 close", or "n/a" before anything has loaded. */
export function asOfText(f: Freshness): string {
  return f.sessionDate ? `${formatSessionDate(f.sessionDate)} close` : "n/a";
}
