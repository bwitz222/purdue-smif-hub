import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseSsgaSectorBreakdown, isPlausibleWeights } from "./etf-sectors";

// Real excerpt of State Street's SPY page (Fund Sector Breakdown, as of 2026-10-19).
const html = fs.readFileSync(
  path.join(__dirname, "__fixtures__/ssga-spy-sector-breakdown.html"),
  "utf8",
);

describe("parseSsgaSectorBreakdown", () => {
  it("parses the as-of date and maps GICS names to site buckets", () => {
    const snap = parseSsgaSectorBreakdown(html);
    expect(snap.asOf).toBe("2026-10-19");
    expect(snap.weights).toEqual({
      Technology: 38.11,
      Financials: 11.7,
      "Communication Services": 9.7,
      Healthcare: 9.6,
      "Consumer Cyclical": 9.0,
      Industrials: 8.0,
      "Consumer Defensive": 4.8,
      Energy: 3.73,
      Utilities: 1.96,
      "Real Estate": 1.71,
      Materials: 1.68,
    });
    expect(isPlausibleWeights(snap.weights)).toBe(true);
  });

  it("rejects a page without the table", () => {
    expect(() => parseSsgaSectorBreakdown("<html></html>")).toThrow(/not found/);
  });

  it("rejects an unknown sector", () => {
    expect(() => parseSsgaSectorBreakdown(html.replace("Materials", "Crypto"))).toThrow(
      /Unknown sector/,
    );
  });

  it("rejects a missing sector", () => {
    const cut = html.replace(
      /<tr>\s*<td class="label ">Materials<\/td>\s*<td class="data">[\d.]+%<\/td>\s*<\/tr>/,
      "",
    );
    expect(() => parseSsgaSectorBreakdown(cut)).toThrow(/Missing sectors/);
  });

  it("rejects weights that do not sum to ~100", () => {
    expect(() => parseSsgaSectorBreakdown(html.replace("38.11%", "58.11%"))).toThrow(/sum/);
  });
});
