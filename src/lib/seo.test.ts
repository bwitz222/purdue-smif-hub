import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  socialMeta,
  canonical,
  SITE_URL,
  OG_IMAGE,
  OG_HOLDINGS,
  OG_TEAM,
  OG_ABOUT,
  OG_RECRUITING,
  OG_PERFORMANCE,
  OG_RESEARCH,
  OG_LEARN,
  OG_SECTORS,
  OG_APPLY,
  OG_CONTACT,
} from "./seo";

const OG_IMAGES = {
  OG_IMAGE,
  OG_HOLDINGS,
  OG_TEAM,
  OG_ABOUT,
  OG_RECRUITING,
  OG_PERFORMANCE,
  OG_RESEARCH,
  OG_LEARN,
  OG_SECTORS,
  OG_APPLY,
  OG_CONTACT,
};

/**
 * Intrinsic size straight from the JPEG's SOF marker. We read the real bytes
 * rather than a hardcoded table so the test fails if someone swaps the artwork
 * without updating the declared og:image dimensions.
 */
function jpegSize(bytes: Buffer): { width: number; height: number } {
  let i = 2; // skip SOI
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    // SOF0-SOF15, excluding the non-frame markers DHT (c4), JPG (c8), DAC (cc)
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    i += 2 + bytes.readUInt16BE(i + 2);
  }
  throw new Error("no SOF marker found");
}

const publicPath = (url: string) => join(process.cwd(), "public", url.replace(`${SITE_URL}/`, ""));

const metaValue = (meta: ReturnType<typeof socialMeta>, key: string) =>
  meta.find((m) => ("property" in m ? m.property : m.name) === key)?.content;

describe("socialMeta og:image dimensions", () => {
  for (const [name, url] of Object.entries(OG_IMAGES)) {
    it(`${name} declares the size the file actually is`, () => {
      const actual = jpegSize(readFileSync(publicPath(url)));
      const meta = socialMeta({
        title: "t",
        description: "d",
        url: canonical("/"),
        image: url,
      });
      expect(metaValue(meta, "og:image:width")).toBe(String(actual.width));
      expect(metaValue(meta, "og:image:height")).toBe(String(actual.height));
    });
  }
});

describe("socialMeta shape", () => {
  const meta = socialMeta({
    title: "Title",
    description: "Description",
    url: canonical("/team"),
    image: OG_TEAM,
  });

  it("emits both Open Graph and Twitter variants", () => {
    for (const key of [
      "og:title",
      "og:description",
      "og:url",
      "og:type",
      "og:image",
      "og:image:alt",
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
    ]) {
      expect(metaValue(meta, key), key).toBeTruthy();
    }
  });

  it("builds absolute canonical URLs on the www host", () => {
    expect(canonical("/team")).toBe("https://www.purduesmif.org/team");
    expect(metaValue(meta, "og:url")).toBe("https://www.purduesmif.org/team");
  });
});
