import { describe, expect, it } from "vitest";
import { isConfirmedEvent } from "@/lib/event-confirmed";

describe("isConfirmedEvent", () => {
  it("accepts an event with a time and a venue", () => {
    expect(isConfirmedEvent({ time: "7:30 - 8:30 PM", location: "Rawls 1086" })).toBe(true);
  });

  it("rejects a placeholder time", () => {
    expect(isConfirmedEvent({ time: "TBD", location: "Young Hall 223" })).toBe(false);
    expect(isConfirmedEvent({ time: "tba", location: "Young Hall 223" })).toBe(false);
  });

  it("rejects a placeholder venue, even inside a longer string", () => {
    expect(isConfirmedEvent({ time: "12:00 - 3:00 PM", location: "Memorial Mall (TBD)" })).toBe(
      false,
    );
    expect(isConfirmedEvent({ time: "12:00 PM", location: "To be announced" })).toBe(false);
  });

  it("rejects empty values", () => {
    expect(isConfirmedEvent({ time: "", location: "Rawls 1086" })).toBe(false);
    expect(isConfirmedEvent({ time: "7:00 PM", location: "  " })).toBe(false);
  });

  it("does not mistake a word that merely contains the letters", () => {
    expect(isConfirmedEvent({ time: "7:00 PM", location: "TBDesign Studio" })).toBe(true);
  });
});
