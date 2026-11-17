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
  TEAM_BLURB,
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

describe("member profiles are open to search", () => {
  // Eight profiles with no personal bio used to be marked noindex and left out
  // of the sitemap, so a search for those members' names could not reach the
  // site. Nothing may gate a profile again.
  it("the profile route never emits noindex", () => {
    expect(src("src/routes/team.$slug.tsx")).not.toMatch(/noindex/);
  });

  it("the sitemap lists members without filtering", () => {
    const sitemap = src("src/routes/sitemap[.]xml.ts");
    expect(sitemap).toMatch(/for \(const \{ slug \} of memberDirectory\)/);
    expect(sitemap).not.toMatch(/hasIndexableProfile|continue;/);
  });

  it("records every seat a member holds", () => {
    const ian = memberDirectory.find((e) => e.slug === "ian-teh")!;
    expect(ian.roles).toEqual([
      { team: "Executive Board", role: "Co-President" },
      { team: "Industrials", role: "Portfolio Manager" },
    ]);
    for (const e of memberDirectory) {
      expect(e.roles.length, e.slug).toBeGreaterThanOrEqual(1);
      expect(e.roles[0].team).toBe(e.team);
    }
  });

  // The blurb is what gives a bio-less profile something to say.
  it("has a description for every team a member can sit on", () => {
    const teams = new Set(memberDirectory.flatMap((e) => e.roles.map((r) => r.team)));
    for (const t of teams) expect(TEAM_BLURB[t], t).toBeTruthy();
  });

  // Hidden members must not ship in the bundle: a headshot and bio for someone
  // taken off the roster were still being served from a public URL.
  it("ships no bio, photo or link for anyone off the roster", () => {
    const names = new Set(everyone.map((m) => m.name));
    const data = src("src/data/team.ts");
    const keyed = [...data.matchAll(/^ {2}"([A-Z][^"]+)":/gm)].map((m) => m[1]);
    // TEAM_BLURB is keyed by team name, not by person.
    expect(keyed.filter((n) => !names.has(n) && !(n in TEAM_BLURB))).toEqual([]);
  });
});

describe("Apply buttons", () => {
  // Every Apply CTA once built its own Qualtrics link, so when the survey
  // expired all of them pointed at a dead form. Only ApplyLink may build it.
  it("only ApplyLink builds the application URL", () => {
    const files = [
      "src/components/SiteHeader.tsx",
      "src/routes/index.tsx",
      "src/routes/about.tsx",
      "src/routes/apply.tsx",
      "src/routes/learn.tsx",
      "src/routes/recruiting.tsx",
      "src/routes/finance-clubs-at-purdue.tsx",
    ];
    for (const f of files) expect(src(f), f).not.toMatch(/applyUrl\(|qualtrics/);
  });
});
