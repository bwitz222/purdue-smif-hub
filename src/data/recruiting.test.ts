import { describe, it, expect } from "vitest";
import {
  CALENDAR,
  APPLICATION_DEADLINE,
  applicationDeadlineMs,
  milestones,
  nextMilestone,
  upcomingMilestones,
  isInProgress,
  eventStartMs,
  eventEndMs,
  parseEventTimes,
} from "./recruiting";

describe("event time parsing", () => {
  it("inherits the meridiem from the end token when the start omits it", () => {
    expect(parseEventTimes("7:30 - 8:30 PM")).toEqual({
      start: { h: 19, m: 30 },
      end: { h: 20, m: 30 },
    });
  });

  it("handles a range that spans noon", () => {
    expect(parseEventTimes("12:00 - 3:00 PM")).toEqual({
      start: { h: 12, m: 0 },
      end: { h: 15, m: 0 },
    });
  });

  it("gives TBD events a placeholder window rather than NaN", () => {
    const { start, end } = parseEventTimes("TBD");
    expect(start.h).toBeLessThan(end.h);
  });

  it("orders start before end for every calendar row", () => {
    for (const e of CALENDAR) {
      expect(eventEndMs(e)).toBeGreaterThan(eventStartMs(e));
    }
  });
});

describe("the milestone runway", () => {
  it("covers every event before the deadline, plus the deadline", () => {
    const ms = milestones();
    const beforeDeadline = CALENDAR.filter((e) => eventStartMs(e) < applicationDeadlineMs());
    expect(ms).toHaveLength(beforeDeadline.length + 1);
    expect(ms.filter((m) => m.kind === "deadline")).toHaveLength(1);
  });

  // Events after the close (the interviews) belong on the calendar but not in
  // the countdown — you interview from a closed pool.
  it("excludes events that fall after the application closes", () => {
    const names = milestones().map((m) => m.name);
    for (const e of CALENDAR) {
      if (eventStartMs(e) > applicationDeadlineMs()) {
        expect(names).not.toContain(e.name);
      }
    }
  });

  it("runs in chronological order", () => {
    const starts = milestones().map((m) => m.startMs);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });

  it("starts at the B-Involved Fair and ends at the application close", () => {
    const ms = milestones();
    expect(ms[0].name).toBe("B-Involved Fair");
    expect(ms[ms.length - 1].kind).toBe("deadline");
    expect(ms[ms.length - 1].name).toBe(APPLICATION_DEADLINE.label);
  });

  // The behaviour the countdown depends on: it must walk the entire cycle
  // rather than stopping at the first event.
  it("advances to each milestone in turn as the clock passes the previous one", () => {
    const ms = milestones();
    for (let i = 0; i < ms.length; i++) {
      // One millisecond before this milestone ends, it is still the target.
      expect(nextMilestone(ms[i].endMs - 1)?.name).toBe(ms[i].name);
      // One millisecond after, the target is the following milestone.
      const after = nextMilestone(ms[i].endMs + 1);
      if (i + 1 < ms.length) {
        expect(after?.name).toBe(ms[i + 1].name);
      } else {
        expect(after).toBeNull();
      }
    }
  });

  it("counts down to the close once the last pre-deadline event is over", () => {
    const deadline = applicationDeadlineMs();
    const lastEventEnd = Math.max(
      ...CALENDAR.filter((e) => eventStartMs(e) < deadline).map(eventEndMs),
    );
    expect(nextMilestone(lastEventEnd + 1)?.kind).toBe("deadline");
  });

  it("expires once the application has closed", () => {
    expect(nextMilestone(applicationDeadlineMs() + 1)).toBeNull();
  });

  it("keeps an in-progress event as the target instead of skipping ahead", () => {
    const first = milestones()[0];
    const midway = first.startMs + (first.endMs - first.startMs) / 2;
    expect(nextMilestone(midway)?.name).toBe(first.name);
    expect(isInProgress(first, midway)).toBe(true);
  });

  it("reports what follows the current target", () => {
    const ms = milestones();
    const upcoming = upcomingMilestones(ms[0].endMs - 1);
    expect(upcoming[0].name).toBe(ms[0].name);
    expect(upcoming[1].name).toBe(ms[1].name);
  });
});

describe("the application deadline", () => {
  it("resolves to a real timestamp", () => {
    expect(Number.isFinite(applicationDeadlineMs())).toBe(true);
  });

  // Guards the placeholder: if the real deadline lands after the interviews,
  // that is a deliberate choice, but it should be a visible one.
  it("falls within the recruiting cycle", () => {
    const firstStart = Math.min(...CALENDAR.map(eventStartMs));
    expect(applicationDeadlineMs()).toBeGreaterThan(firstStart);
  });
});
