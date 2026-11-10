import { describe, expect, it } from "vitest";
import { OG_ABOUT, OG_FINANCE_CLUBS, OG_HOME, PAGE_META, SITE_URL, ogAlt, socialMeta } from "./seo";

const metaValue = (meta: ReturnType<typeof socialMeta>, key: string) =>
  meta.find((m) => ("property" in m ? m.property : m.name) === key)?.content;

describe("PAGE_META", () => {
  for (const [page, { title, description }] of Object.entries(PAGE_META)) {
    it(`${page}: title is 50 to 60 characters and follows "Topic | Purdue SMIF"`, () => {
      expect(title.length).toBeGreaterThanOrEqual(50);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(title.endsWith(" | Purdue SMIF")).toBe(true);
    });
    it(`${page}: description is 140 to 155 characters`, () => {
      expect(description.length).toBeGreaterThanOrEqual(140);
      expect(description.length).toBeLessThanOrEqual(155);
    });
    it(`${page}: no em dashes`, () => {
      expect(title + description).not.toContain("—");
    });
  }
});

describe("per-card og:image:alt", () => {
  it("each known card has its own alt text, not one shared string", () => {
    const alts = [OG_HOME, OG_ABOUT, OG_FINANCE_CLUBS].map(ogAlt);
    expect(new Set(alts).size).toBe(alts.length);
  });
  it("socialMeta uses the card's alt for both Open Graph and Twitter", () => {
    const meta = socialMeta({
      title: "t",
      description: "d",
      url: `${SITE_URL}/x`,
      image: OG_FINANCE_CLUBS,
    });
    expect(metaValue(meta, "og:image:alt")).toBe(ogAlt(OG_FINANCE_CLUBS));
    expect(metaValue(meta, "twitter:image:alt")).toBe(ogAlt(OG_FINANCE_CLUBS));
  });
  it("an explicit imageAlt wins, and unknown images fall back to the generic alt", () => {
    const custom = socialMeta({
      title: "t",
      description: "d",
      url: `${SITE_URL}/x`,
      image: OG_ABOUT,
      imageAlt: "Custom",
    });
    expect(metaValue(custom, "og:image:alt")).toBe("Custom");
    expect(ogAlt(`${SITE_URL}/nope.jpg`)).toMatch(/Purdue SMIF/);
  });
  it("the finance-clubs card declares 1200x630", () => {
    const meta = socialMeta({
      title: "t",
      description: "d",
      url: `${SITE_URL}/x`,
      image: OG_FINANCE_CLUBS,
    });
    expect(metaValue(meta, "og:image:width")).toBe("1200");
    expect(metaValue(meta, "og:image:height")).toBe("630");
  });
});
