import { describe, expect, it } from "vitest";
import {
  formatSessionDate,
  freshnessOf,
  isTradingDay,
  lastCompletedSession,
  sessionsBehind,
} from "@/lib/market-calendar";

// Instants are UTC; New York is UTC-5 in November (EST) and UTC-4 in July (EDT).
const at = (iso: string) => new Date(iso);

describe("lastCompletedSession", () => {
  it("is the same day once the 4 p.m. ET close has passed", () => {
    // Tue 2026-11-10 22:00 UTC = 5 p.m. EST
    expect(lastCompletedSession(at("2026-11-10T22:00:00Z"))).toBe("2026-11-10");
  });
  it("is the prior day before the close", () => {
    // Tue 2026-11-10 19:05 UTC = 2:05 p.m. EST
    expect(lastCompletedSession(at("2026-11-10T19:05:00Z"))).toBe("2026-11-09");
  });
  it("skips the weekend", () => {
    // Sat 2026-11-07 15:00 UTC, Sun, and Mon pre-open all resolve to Fri
    expect(lastCompletedSession(at("2026-11-07T15:00:00Z"))).toBe("2026-11-06");
    expect(lastCompletedSession(at("2026-11-08T15:00:00Z"))).toBe("2026-11-06");
    expect(lastCompletedSession(at("2026-11-09T13:00:00Z"))).toBe("2026-11-06");
  });
  it("skips an exchange holiday", () => {
    // Fri 2026-11-27 is a normal day; Thu 11-26 is Thanksgiving.
    expect(lastCompletedSession(at("2026-11-27T12:00:00Z"))).toBe("2026-11-25");
  });
  it("handles daylight time", () => {
    // Wed 2026-07-08 20:30 UTC = 4:30 p.m. EDT, after the close
    expect(lastCompletedSession(at("2026-07-08T20:30:00Z"))).toBe("2026-07-08");
    expect(lastCompletedSession(at("2026-07-08T19:30:00Z"))).toBe("2026-07-07");
  });
});

describe("sessionsBehind", () => {
  it("counts only trading days", () => {
    const now = at("2026-11-10T19:05:00Z"); // last completed: Mon 11-09
    expect(sessionsBehind("2026-11-09", now)).toBe(0);
    expect(sessionsBehind("2026-11-06", now)).toBe(1);
    expect(sessionsBehind("2026-11-05", now)).toBe(2);
  });
  it("a Friday close is current all weekend", () => {
    expect(sessionsBehind("2026-11-06", at("2026-11-08T15:00:00Z"))).toBe(0);
  });
  it("never goes negative for a future-dated session", () => {
    expect(sessionsBehind("2026-12-01", at("2026-11-10T19:05:00Z"))).toBe(0);
  });
});

describe("freshnessOf", () => {
  const now = at("2026-11-10T19:05:00Z");
  it("classifies by sessions behind", () => {
    expect(freshnessOf("2026-11-09", now).level).toBe("current");
    expect(freshnessOf("2026-11-06", now).level).toBe("latest");
    expect(freshnessOf("2026-11-03", now).level).toBe("stale");
  });
  it("is unknown without a date or a clock", () => {
    expect(freshnessOf(null, now).level).toBe("unknown");
    expect(freshnessOf("2026-11-06", null).level).toBe("unknown");
  });
});

describe("helpers", () => {
  it("knows holidays and weekends", () => {
    expect(isTradingDay("2026-11-26")).toBe(false);
    expect(isTradingDay("2026-11-28")).toBe(false);
    expect(isTradingDay("2026-11-27")).toBe(true);
  });
  it("formats a session date", () => {
    expect(formatSessionDate("2026-11-06")).toBe("Fri, Nov 6");
  });
});
