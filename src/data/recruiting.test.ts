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

// The explicit, order-by-order check: the countdown must walk exactly the
// calendar as published, in the published order, and finish on the deadline.
// Written as literal expected values rather than derived ones, so editing the
// calendar without meaning to fails here loudly.
describe("the countdown follows the published calendar", () => {
  const EXPECTED_ORDER = [
    "B-Involved Fair",
    "SMIF Callout 1",
    "SMIF Coffee Chats 1",
    "Daniels Club Expo",
    "SMIF Callout 2",
    "SMIF Finance Club Consortium",
    "SMIF Coffee Chats 2",
    "SMIF Callout 3",
    "Applications close",
  ];

  it("matches the published calendar exactly, ending at the close", () => {
    expect(milestones().map((m) => m.name)).toEqual(EXPECTED_ORDER);
  });

  it("steps through every one of them as the clock advances", () => {
    const ms = milestones();
    const walked: string[] = [];
    // Start just before the first milestone and jump to just past each end.
    let clock = ms[0].startMs - 1000;
    for (let i = 0; i < ms.length; i++) {
      walked.push(nextMilestone(clock)!.name);
      clock = ms[i].endMs + 1;
    }
    expect(walked).toEqual(EXPECTED_ORDER);
    expect(nextMilestone(clock)).toBeNull();
  });

  it("holds the published dates and times", () => {
    const byName = new Map(milestones().map((m) => [m.name, m]));
    expect(byName.get("B-Involved Fair")?.date).toBe("Sat, Aug 22");
    expect(byName.get("SMIF Callout 1")?.time).toBe("7:30 - 8:30 PM");
    expect(byName.get("SMIF Callout 3")?.date).toBe("Tue, Sep 1");
    expect(byName.get("Applications close")?.date).toBe("Fri, Sep 4");
    expect(byName.get("Applications close")?.time).toBe("11:59 PM");
  });

  it("closes applications after the last callout", () => {
    const lastCallout = milestones().find((m) => m.name === "SMIF Callout 3")!;
    expect(applicationDeadlineMs()).toBeGreaterThan(lastCallout.endMs);
  });

  it("puts the deadline on a Friday, as published", () => {
    // Rendered in Eastern, which is where the cycle runs.
    const weekday = new Date(applicationDeadlineMs()).toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "America/New_York",
    });
    expect(weekday).toBe("Fri");
  });

  it("carries no interview days on the public calendar", () => {
    expect(CALENDAR.some((e) => /interview/i.test(e.name))).toBe(false);
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
