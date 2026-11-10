import { describe, expect, it } from "vitest";
import { memberDirectory } from "@/data/team";
import {
  LAST_CONTENT_UPDATE,
  ORG_ID,
  buildSitemapXml,
  holdingsDatasetLd,
  isEmittableEvent,
  memberDescription,
  memberTitle,
  performanceDatasetLd,
} from "./seo";

describe("isEmittableEvent", () => {
  const ok = { iso: "2026-08-25", time: "7:30 - 8:30 PM", location: "Rawls 1086" };
  it("accepts a fully specified event", () => {
    expect(isEmittableEvent(ok)).toBe(true);
  });
  it("rejects a TBD location, including the parenthesized form on the calendar", () => {
    expect(isEmittableEvent({ ...ok, location: "Memorial Mall (TBD)" })).toBe(false);
    expect(isEmittableEvent({ ...ok, location: "TBD" })).toBe(false);
    expect(isEmittableEvent({ ...ok, location: "To be announced" })).toBe(false);
  });
  it("rejects a TBD or empty time", () => {
    expect(isEmittableEvent({ ...ok, time: "TBD" })).toBe(false);
    expect(isEmittableEvent({ ...ok, time: "" })).toBe(false);
    expect(isEmittableEvent({ ...ok, time: undefined })).toBe(false);
  });
  it("rejects a missing or malformed date", () => {
    expect(isEmittableEvent({ ...ok, iso: "" })).toBe(false);
    expect(isEmittableEvent({ ...ok, iso: "Aug 25" })).toBe(false);
    expect(isEmittableEvent({ ...ok, iso: "TBD" })).toBe(false);
  });
  it("is not fooled by words that merely contain the letters", () => {
    expect(isEmittableEvent({ ...ok, location: "Tbdell Hall" })).toBe(true);
  });
});

describe("memberDescription", () => {
  it("is 155 characters or fewer for every member, with no undefined and no em dashes", () => {
    for (const { member, team } of memberDirectory) {
      const d = memberDescription(member, team);
      expect(d.length, `${member.name}: ${d}`).toBeLessThanOrEqual(155);
      expect(d).not.toContain("undefined");
      expect(d).not.toContain("—");
      expect(d.startsWith(member.name)).toBe(true);
      expect(d.endsWith(".")).toBe(true);
    }
  });
  it("never leaks the free-text bio", () => {
    for (const { member, team } of memberDirectory.filter((e) => e.member.bio)) {
      const d = memberDescription(member, team);
      expect(d).not.toContain(member.bio.slice(0, 40));
    }
  });
  it("reads naturally for the three kinds of member", () => {
    expect(
      memberDescription(
        { name: "Ada Lovelace", role: "Co-President", year: "Class of 2027" },
        "Executive Board",
      ),
    ).toBe(
      "Ada Lovelace serves as Co-President on the executive board of the Purdue Student Managed Investment Fund, Class of 2027, at the Daniels School of Business.",
    );
    expect(
      memberDescription(
        { name: "Grace Hopper", role: "Analyst", year: "Class of 2028" },
        "Financials",
      ),
    ).toMatch(
      /^Grace Hopper is an Analyst on the Financials team of the Purdue Student Managed Investment Fund/,
    );
    expect(
      memberDescription(
        { name: "Alan Turing", role: "Faculty Advisor", year: "Daniels School of Business" },
        "Faculty Advisors",
      ),
    ).toBe(
      "Alan Turing is a Faculty Advisor to the Purdue Student Managed Investment Fund at the Daniels School of Business.",
    );
  });
  it("drops detail rather than exceeding 155 characters", () => {
    const d = memberDescription(
      {
        name: "A Very Long Name Indeed Esquire",
        role: "Portfolio Management Associate",
        year: "Class of 2028",
      },
      "Portfolio + Risk Management",
    );
    expect(d.length).toBeLessThanOrEqual(155);
  });
});

describe("memberTitle", () => {
  it("is 60 characters or fewer for every member and ends with the brand", () => {
    for (const { member } of memberDirectory) {
      const t = memberTitle(member);
      expect(t.length, t).toBeLessThanOrEqual(60);
      expect(t.endsWith(" | Purdue SMIF")).toBe(true);
      expect(t.startsWith(member.name)).toBe(true);
    }
  });
  it("falls back to the name alone when the role is too long", () => {
    expect(memberTitle({ name: "Chris Andreou", role: "Director of Talent and Operations" })).toBe(
      "Chris Andreou | Purdue SMIF",
    );
    expect(memberTitle({ name: "Ian Teh", role: "Co-President" })).toBe(
      "Ian Teh: Co-President | Purdue SMIF",
    );
  });
});

describe("Dataset builders", () => {
  it("emit valid, linked Dataset nodes", () => {
    for (const ld of [holdingsDatasetLd("2026-11-09"), performanceDatasetLd("2026-11-09")]) {
      expect(ld["@type"]).toBe("Dataset");
      expect(ld.creator["@id"]).toBe(ORG_ID);
      expect(ld.isAccessibleForFree).toBe(true);
      expect(ld.dateModified).toBe("2026-11-09");
      expect(JSON.stringify(ld)).not.toContain("—");
      expect(() => JSON.parse(JSON.stringify(ld))).not.toThrow();
    }
  });
  it("omit dateModified rather than guess it", () => {
    expect(holdingsDatasetLd()).not.toHaveProperty("dateModified");
    expect(performanceDatasetLd("garbage")).not.toHaveProperty("dateModified");
  });
});

describe("buildSitemapXml", () => {
  const xml = buildSitemapXml([
    { path: "/", lastmod: "2026-11-10" },
    { path: "/team/a&b", lastmod: "2026-11-09" },
  ]);
  it("is a well-formed urlset with a loc and lastmod per URL", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect((xml.match(/<url>/g) ?? []).length).toBe(2);
    expect((xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) ?? []).length).toBe(2);
    expect(xml.endsWith("</urlset>")).toBe(true);
  });
  it("escapes XML special characters in URLs", () => {
    expect(xml).toContain("https://www.purduesmif.org/team/a&amp;b");
    expect(xml).not.toContain("a&b<");
  });
  it("omits changefreq and priority, which Google ignores", () => {
    expect(xml).not.toContain("changefreq");
    expect(xml).not.toContain("priority");
  });
  it("refuses a malformed lastmod instead of shipping a sitemap crawlers would discard", () => {
    expect(() => buildSitemapXml([{ path: "/", lastmod: "yesterday" }])).toThrow(/lastmod/);
  });
  it("LAST_CONTENT_UPDATE is a real date", () => {
    expect(LAST_CONTENT_UPDATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(LAST_CONTENT_UPDATE))).toBe(false);
  });
});
