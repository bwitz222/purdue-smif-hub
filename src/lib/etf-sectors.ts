// Parser for State Street's published SPY "Fund Sector Breakdown" table. Pure
// and unit-tested so the scheduled hook (api/public/hooks/refresh-etf-weights)
// can reject a changed or broken page instead of writing garbage the site then
// renders as look-through sector allocation.

// GICS sector names as State Street prints them -> this site's industry buckets.
const SECTOR_MAP: Record<string, string> = {
  "Information Technology": "Technology",
  Financials: "Financials",
  "Communication Services": "Communication Services",
  "Health Care": "Healthcare",
  "Consumer Discretionary": "Consumer Cyclical",
  Industrials: "Industrials",
  "Consumer Staples": "Consumer Defensive",
  Energy: "Energy",
  Utilities: "Utilities",
  "Real Estate": "Real Estate",
  Materials: "Materials",
};

export type SectorSnapshot = { asOf: string; weights: Record<string, number> };

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function parseAsOf(text: string): string | null {
  const m = text.match(/as of\s+([A-Za-z]{3})[a-z]*\s+(\d{1,2})\s+(\d{4})/i);
  if (!m) return null;
  const mi = MONTHS.indexOf(m[1].toLowerCase());
  if (mi < 0) return null;
  return `${m[3]}-${String(mi + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

/** Sum bounds: State Street rounds to 0.01-0.1, so a valid table lands within ~0.5 of 100. */
const SUM_MIN = 99;
const SUM_MAX = 101;

/**
 * Returns the fund sector weights keyed by this site's industry names, or throws
 * with a specific reason when the page no longer matches what we expect.
 */
export function parseSsgaSectorBreakdown(html: string): SectorSnapshot {
  const start = html.indexOf("Fund Sector Breakdown <span");
  if (start < 0) throw new Error("Fund Sector Breakdown heading not found");
  const tableEnd = html.indexOf("</table>", start);
  if (tableEnd < 0) throw new Error("Sector table not terminated");
  const block = html.slice(start, tableEnd);

  const asOf = parseAsOf(block);
  if (!asOf) throw new Error("as-of date not found");

  const weights: Record<string, number> = {};
  const rowRe =
    /<td class="label[^"]*">\s*([^<]+?)\s*<\/td>\s*<td class="data">\s*([\d.]+)%\s*<\/td>/g;
  for (const m of block.matchAll(rowRe)) {
    const bucket = SECTOR_MAP[m[1]];
    if (!bucket) throw new Error(`Unknown sector "${m[1]}"`);
    if (bucket in weights) throw new Error(`Duplicate sector "${m[1]}"`);
    const w = Number(m[2]);
    if (!isFinite(w) || w < 0 || w > 100) throw new Error(`Bad weight for ${m[1]}: ${m[2]}`);
    weights[bucket] = w;
  }
  const missing = Object.values(SECTOR_MAP).filter((b) => !(b in weights));
  if (missing.length) throw new Error(`Missing sectors: ${missing.join(", ")}`);

  const sum = Object.values(weights).reduce((s, w) => s + w, 0);
  if (sum < SUM_MIN || sum > SUM_MAX)
    throw new Error(`Weights sum to ${sum.toFixed(2)}, expected ~100`);
  return { asOf, weights };
}

/** Same sanity bounds, for values read back from the database. */
export function isPlausibleWeights(w: unknown): w is Record<string, number> {
  if (!w || typeof w !== "object") return false;
  const vals = Object.values(w as Record<string, unknown>);
  if (vals.length !== Object.keys(SECTOR_MAP).length) return false;
  if (!vals.every((v) => typeof v === "number" && isFinite(v) && v >= 0)) return false;
  const sum = (vals as number[]).reduce((s, v) => s + v, 0);
  return sum >= SUM_MIN && sum <= SUM_MAX;
}
