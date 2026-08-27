#!/usr/bin/env node
/**
 * Fails when any holding has had a stock split that the static share counts in
 * src/data/holdings.ts have not been reconciled against.
 *
 * Why this exists: prices come from Polygon with adjusted=true, so on the
 * morning a split takes effect the live price drops by the split factor while
 * `shares` in holdings.ts stays where it was. Everything downstream computes
 * value = price x shares, so the position silently understates by that factor
 * and drags weights, sector allocation, weighted beta, AUM and the risk series
 * with it. Monster's 2-for-1 on 2026-08-11 published MNST as a 31% loser when
 * it was up 38%, and nothing in the test suite noticed, because every row was
 * still internally consistent with itself.
 *
 * Usage:  npm run check:splits
 *
 * Needs POLYGON_API_KEY. Without one it skips rather than fails, so it is safe
 * to leave wired into CI on forks and preview builds that have no secrets.
 */
import fs from "node:fs";
import path from "node:path";

const HOLDINGS = path.join(process.cwd(), "src/data/holdings.ts");

function loadDotEnv() {
  try {
    for (const line of fs.readFileSync(path.join(process.cwd(), ".env"), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env — rely on the ambient environment */
  }
}

/**
 * holdings.ts is TypeScript, and pulling in a TS loader just to read two fields
 * is not worth the dependency. The shape is plain data and stable, so parse it.
 */
function readHoldings() {
  const src = fs.readFileSync(HOLDINGS, "utf8");
  const reconciled = src.match(/LAST_RECONCILED = "(\d{4}-\d{2}-\d{2})"/)?.[1];
  if (!reconciled) throw new Error("LAST_RECONCILED not found in src/data/holdings.ts");
  const symbols = [...src.matchAll(/symbol: "([^"]+)"/g)].map((m) => m[1]);
  if (symbols.length === 0) throw new Error("no symbols found in src/data/holdings.ts");
  return { reconciled, symbols };
}

async function fetchSplitsSince(date, apiKey) {
  // One reference call covers every ticker, so this stays well inside the free
  // tier rather than burning one request per holding.
  let url =
    `https://api.polygon.io/v3/reference/splits` +
    `?execution_date.gt=${date}&limit=1000&apiKey=${encodeURIComponent(apiKey)}`;
  const out = [];
  for (let page = 0; page < 10 && url; page++) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Polygon returned ${res.status} ${res.statusText}`);
    const json = await res.json();
    out.push(...(json.results ?? []));
    url = json.next_url ? `${json.next_url}&apiKey=${encodeURIComponent(apiKey)}` : null;
  }
  return out;
}

const { reconciled, symbols } = readHoldings();
loadDotEnv();
const apiKey = process.env.POLYGON_API_KEY;

if (!apiKey) {
  console.warn("check:splits — POLYGON_API_KEY not set, skipping.");
  console.warn(`  Share counts claim to be reconciled as of ${reconciled}; unverified.`);
  process.exit(0);
}

let splits;
try {
  splits = await fetchSplitsSince(reconciled, apiKey);
} catch (err) {
  // A provider outage should not turn every build red.
  console.warn(`check:splits — could not reach Polygon (${err.message}), skipping.`);
  process.exit(0);
}

const held = new Set(symbols);
const hits = splits
  .filter((s) => held.has(s.ticker))
  .sort((a, b) => a.execution_date.localeCompare(b.execution_date));

if (hits.length === 0) {
  console.log(
    `check:splits — OK. No splits across ${symbols.length} holdings since ${reconciled}.`,
  );
  process.exit(0);
}

console.error(`\ncheck:splits — ${hits.length} unreconciled split(s) since ${reconciled}:\n`);
for (const s of hits) {
  const factor = `${s.split_to}-for-${s.split_from}`;
  const mult = Number(s.split_to) / Number(s.split_from);
  console.error(`  ${s.ticker.padEnd(6)} ${factor.padEnd(10)} effective ${s.execution_date}`);
  console.error(`         shares in holdings.ts must be multiplied by ${mult}`);
}
console.error(`
Cost basis is a dollar total and does NOT change. After updating the share
counts, bump LAST_RECONCILED in src/data/holdings.ts, and run the backfill hook
so price_history stops carrying a phantom split-day return:

  POST /api/public/hooks/compute-risk?mode=backfill
  header: x-refresh-secret: <REFRESH_HOOK_SECRET>
`);
process.exit(1);
