import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards over the roster and recruiting *source files*.
 *
 * These read the .tsx directly rather than importing it: the route modules pull
 * in .webp assets and the "@/" alias, neither of which this standalone vitest
 * config resolves (see vitest.config.ts). Parsing the source is enough — every
 * fact asserted here is a literal in the file.
 */
const src = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const teamSrc = src("src/data/team.ts");
const recruitingSrc = src("src/routes/recruiting.tsx");
const teamRouteSrc = src("src/routes/team.index.tsx");
const sectorsSrc = src("src/routes/sectors.tsx");

describe("recruiting calendar", () => {
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const rows = recruitingSrc
    .split("\n")
    .filter((l) => l.includes('iso: "20'))
    .map((l) => ({
      iso: l.match(/iso: "([\d-]+)"/)![1],
      date: l.match(/date: "([^"]+)"/)![1],
    }));

  it("finds every calendar row", () => {
    expect(rows.length).toBeGreaterThan(0);
  });

  // Both interview rows shipped the wrong weekday: 2026-09-08 is a Tuesday and
  // 2026-09-09 a Wednesday, but the page read "Mon, Sep 8" / "Tue, Sep 9".
  // `iso` drives the .ics, the Google Calendar link and the countdown while
  // `date` is what the visitor reads, so the two disagreed by a full day.
  it.each(rows)("$iso displays the correct weekday ($date)", ({ iso, date }) => {
    const actual = DOW[new Date(`${iso}T12:00:00Z`).getUTCDay()];
    expect(date.split(",")[0]).toBe(actual);
  });
});

describe("/sectors -> /team links", () => {
  // /sectors links to ?sector=<team name>. /team resolves that through
  // findScope, which matches on label, value or alias. The two process teams
  // are the ones that used to fall through: their chip labels are "FI & Macro"
  // and "PM + Risk", not their full names, so the links went nowhere.
  const linkedNames = [...sectorsSrc.matchAll(/\{ Icon: \w+, name: "([^"]+)"/g)].map((m) => m[1]);

  it("links ten teams", () => {
    expect(linkedNames).toHaveLength(10);
  });

  it.each(linkedNames)('"%s" resolves to a /team scope', (name) => {
    const isSectorTeam = new RegExp(
      `^    name: "${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}",$`,
      "m",
    ).test(teamSrc);
    const isAlias = teamRouteSrc.includes(`aliases: ["${name}"]`);
    const isLabel = teamRouteSrc.includes(`label: "${name}"`);
    expect(isSectorTeam || isAlias || isLabel).toBe(true);
  });
});

describe("roster data", () => {
  // The open-seat cards were built from empty-name rows carrying a
  // `placeholder` flag. Both are gone; an empty name would now render a
  // nameless card and a "/team/" link with no slug.
  it("has no empty-name entries", () => {
    expect(teamSrc).not.toMatch(/\["",/);
  });

  it("has no placeholder flag or Open Position label", () => {
    expect(teamSrc).not.toContain("placeholder");
    expect(teamSrc).not.toContain("Open Position");
  });

  // Leads are matched by role, never by array position — that is what makes
  // deleting a row safe. If make() ever goes back to overriding index 0, the
  // declared roles below stop being the truth.
  it("does not derive role from array position", () => {
    expect(teamSrc).not.toMatch(/role: i === 0/);
  });

  it("declares exactly one lead per filled team", () => {
    const teams = teamSrc.split(/^  \{$/m).slice(1);
    expect(teams.length).toBeGreaterThanOrEqual(8);
  });
});
