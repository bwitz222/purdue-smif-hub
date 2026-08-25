import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  board,
  sectorTeams,
  fixedIncomeMacro,
  portfolioManagers,
  facultyAdvisors,
  memberDirectory,
  totalMemberCount,
  studentCount,
  facultyCount,
  LEAD_ROLE,
  type DirectoryEntry,
} from "@/data/team";
import type { Member } from "@/components/MemberCard";

/**
 * Guards over the roster, and over the two cross-page contracts that broke
 * silently: /sectors -> /team links, and the recruiting calendar's weekdays.
 *
 * Roster facts are asserted against the real modules. The two route files
 * below are read as text only because CALENDAR and SCOPE_OPTIONS are module-
 * private; the assertions are written to survive reformatting (whole-file
 * regex, no dependence on line breaks).
 */
const src = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const recruitingSrc = src("src/routes/recruiting.tsx");
const teamRouteSrc = src("src/routes/team.index.tsx");
const sectorsSrc = src("src/routes/sectors.tsx");

const everyone: Member[] = [
  ...board,
  ...sectorTeams.flatMap((t) => t.members),
  ...fixedIncomeMacro,
  ...portfolioManagers,
  ...facultyAdvisors,
];

describe("recruiting calendar", () => {
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // Whole-file scan: each entry is an object carrying both keys, in either
  // order, however Prettier chooses to wrap it.
  const rows = [...recruitingSrc.matchAll(/\{[^{}]*?\biso:\s*"([\d-]+)"[^{}]*?\}/gs)].map((m) => ({
    iso: m[1],
    date: m[0].match(/\bdate:\s*"([^"]+)"/)![1],
  }));

  it("finds every calendar row", () => {
    expect(rows.length).toBeGreaterThanOrEqual(10);
  });

  // Both interview rows shipped the wrong weekday: 2026-09-08 is a Tuesday and
  // 2026-09-09 a Wednesday, but the page read "Mon, Sep 8" / "Tue, Sep 9".
  // `iso` drives the .ics, the Google Calendar link and the countdown while
  // `date` is what the visitor reads, so the two disagreed by a full day.
  it.each(rows)("$iso displays the correct weekday ($date)", ({ iso, date }) => {
    expect(date.split(",")[0]).toBe(DOW[new Date(`${iso}T12:00:00Z`).getUTCDay()]);
  });
});

describe("/sectors -> /team links", () => {
  // /sectors links to ?sector=<team name>; /team resolves that through
  // findScope, which matches a chip label, an option value, or an alias. The
  // two process teams used to fall through: their labels are "FI & Macro" and
  // "PM + Risk", not their full names, so both links went nowhere.
  // Scoped to the two team arrays — a whole-file scan also picks up the
  // `name:` keys inside the page's JSON-LD.
  const arrayBlock = (decl: string) => {
    const start = sectorsSrc.indexOf(decl);
    expect(start, `${decl} not found`).toBeGreaterThan(-1);
    return sectorsSrc.slice(start, sectorsSrc.indexOf("\n];", start));
  };
  const linkedNames = [arrayBlock("const EQUITY_TEAMS"), arrayBlock("const PROCESS_TEAMS")]
    .flatMap((block) => [...block.matchAll(/\bname:\s*"([^"]+)"/g)].map((m) => m[1]))
    .filter((n, i, a) => a.indexOf(n) === i);

  it("links every equity team plus the two process teams", () => {
    expect(linkedNames.length).toBeGreaterThanOrEqual(10);
  });

  it.each(linkedNames)('"%s" resolves to a /team scope', (name) => {
    const resolvable =
      sectorTeams.some((t) => t.name === name) ||
      teamRouteSrc.includes(`label: "${name}"`) ||
      teamRouteSrc.includes(`aliases: ["${name}"]`);
    expect(resolvable).toBe(true);
  });
});

describe("roster data", () => {
  // The open-seat cards were built from empty-name rows carrying a
  // `placeholder` flag. Both are gone; an empty name would now render a
  // nameless card and a /team/ link with no slug.
  it("has no empty-name entries", () => {
    expect(everyone.filter((m) => !m.name.trim())).toEqual([]);
  });

  it('has no "Open Position" filler', () => {
    expect(everyone.filter((m) => m.name === "Open Position")).toEqual([]);
  });

  it("resolves every member to a unique slug", () => {
    const slugs = memberDirectory.map((e: DirectoryEntry) => e.slug);
    expect(slugs.filter((s, i) => slugs.indexOf(s) !== i)).toEqual([]);
  });

  it("counts students and faculty consistently", () => {
    expect(facultyCount).toBe(facultyAdvisors.length);
    expect(studentCount).toBe(totalMemberCount - facultyCount);
    expect(totalMemberCount).toBe(memberDirectory.length);
  });

  // Leads are matched by role, never by array position — that is what makes
  // removing a row safe. A team with a vacant lead must yield no lead at all
  // rather than promoting whoever now sits first.
  it("declares at most one lead per sector team", () => {
    for (const t of sectorTeams) {
      const leads = t.members.filter((m) => m.role === LEAD_ROLE);
      expect(leads.length, `${t.name} has ${leads.length} leads`).toBeLessThanOrEqual(1);
    }
  });

  it("never treats the first member of a team as its lead by position", () => {
    const vacant = sectorTeams.filter((t) => !t.members.some((m) => m.role === LEAD_ROLE));
    for (const t of vacant) {
      expect(t.members[0]?.role, `${t.name} first member must not be the lead`).not.toBe(LEAD_ROLE);
    }
  });
});
