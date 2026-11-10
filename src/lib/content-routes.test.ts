import { describe, expect, it } from "vitest";
import { CONTENT_ROUTES, contentRoute, formatLongDate } from "@/lib/content-routes";

describe("CONTENT_ROUTES", () => {
  it("has unique paths", () => {
    const paths = CONTENT_ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("keeps titles within 60 characters so results do not truncate them", () => {
    for (const r of CONTENT_ROUTES) expect(r.title.length, r.path).toBeLessThanOrEqual(60);
  });

  it("keeps descriptions between 140 and 155 characters", () => {
    for (const r of CONTENT_ROUTES) {
      expect(r.description.length, r.path).toBeGreaterThanOrEqual(140);
      expect(r.description.length, r.path).toBeLessThanOrEqual(155);
    }
  });

  it("uses the Purdue SMIF title suffix and no em dashes", () => {
    for (const r of CONTENT_ROUTES) {
      expect(r.title, r.path).toMatch(/\| Purdue SMIF$/);
      expect(`${r.title} ${r.description}`, r.path).not.toContain("—");
    }
  });

  it("never dates a change before the page was published", () => {
    for (const r of CONTENT_ROUTES) expect(r.lastmod >= r.published, r.path).toBe(true);
  });

  it("looks routes up by path and rejects unknown ones", () => {
    expect(contentRoute("/stock-pitches").name).toBe("Stock Pitches");
    expect(() => contentRoute("/nope")).toThrow();
  });

  it("formats dates in house style", () => {
    expect(formatLongDate("2026-11-10")).toBe("November 10, 2026");
  });
});
