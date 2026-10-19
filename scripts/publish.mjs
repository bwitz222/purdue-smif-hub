#!/usr/bin/env node
/**
 * Posts a file to the /research library: uploads it to the `publications`
 * storage bucket and inserts the matching `publications` row, so it appears on
 * the site on the next page load. No redeploy needed.
 *
 * Usage:
 *   npm run publish:research -- --category pitch --file ./NVDA-pitch.pdf \
 *     --title "NVIDIA (NVDA): The Inference Build-Out" --date 2026-11-04 \
 *     --ticker NVDA --sector "Information Technology" --position Long \
 *     --authors "Chris Andreou, Parth Dama" --description "One-sentence summary."
 *
 *   npm run publish:research -- --category macro --issue 3 --file ./Macro_Brief_003.pdf \
 *     --title "The Macro Brief #003: ..." --date 2026-10-19 --authors "..."
 *
 * Categories: macro | pitch | equity_research | semester | annual
 * Add --dry-run to print what would be posted without touching anything.
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (from the environment or
 * .env). The service-role key bypasses row-level security, so keep it local:
 * never commit it, and never run this from a shared machine.
 */
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";

const CATEGORIES = ["macro", "pitch", "equity_research", "semester", "annual"];
const MIME = {
  ".pdf": "application/pdf",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
const BUCKET = "publications";

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

function fail(msg) {
  console.error(`publish: ${msg}`);
  process.exit(1);
}

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const { values: a } = parseArgs({
  options: {
    category: { type: "string" },
    file: { type: "string" },
    title: { type: "string" },
    date: { type: "string" },
    authors: { type: "string" },
    description: { type: "string" },
    issue: { type: "string" },
    ticker: { type: "string" },
    sector: { type: "string" },
    position: { type: "string" },
    "dry-run": { type: "boolean", default: false },
  },
  strict: true,
});

// ── Validate everything before any network call ─────────────────────────────
if (!CATEGORIES.includes(a.category ?? ""))
  fail(`--category must be one of: ${CATEGORIES.join(", ")}`);
if (!a.title?.trim()) fail("--title is required");
if (!a.file) fail("--file is required");
if (!fs.existsSync(a.file) || !fs.statSync(a.file).isFile()) fail(`file not found: ${a.file}`);
const ext = path.extname(a.file).toLowerCase();
if (!MIME[ext]) fail(`unsupported file type ${ext}; use ${Object.keys(MIME).join(", ")}`);
const isRealDate = (d) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const t = new Date(`${d}T00:00:00Z`);
  // Rejects month 13 (invalid) and Feb 30 (which would roll into March).
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
};
if (!isRealDate(a.date ?? ""))
  fail("--date must be a real date as YYYY-MM-DD (the publication date shown on the site)");
if (a.issue !== undefined && !/^\d+$/.test(a.issue)) fail("--issue must be a whole number");
if (a.category === "pitch" && !a.ticker) fail("--ticker is required for pitch decks");
if (a.position && !["Long", "Short"].includes(a.position))
  fail('--position must be "Long" or "Short"');

const authors = a.authors
  ? a.authors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : null;
const ticker = a.ticker ? a.ticker.trim().toUpperCase() : null;
// Lead with the ticker unless the title already names it ("NVIDIA (NVDA): ...").
const slugSource =
  ticker && !a.title.toUpperCase().includes(ticker) ? `${ticker} ${a.title}` : a.title;
const objectPath = `${a.category}/${slugify(slugSource)}${ext}`;
const size = fs.statSync(a.file).size;

const row = {
  category: a.category,
  title: a.title.trim(),
  description: a.description?.trim() || null,
  file_path: objectPath,
  file_name: path.basename(a.file),
  file_size: size,
  mime_type: MIME[ext],
  // Noon UTC, so the date renders as the same calendar day in every US timezone.
  created_at: `${a.date}T12:00:00Z`,
  authors,
  issue_number: a.issue !== undefined ? Number(a.issue) : null,
  ticker,
  sector: a.sector?.trim() || null,
  position: a.position || null,
};

console.log(`Storage path: ${BUCKET}/${objectPath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
console.log("Row:", JSON.stringify(row, null, 2));
if (size > 25 * 1024 * 1024)
  console.warn("Warning: over 25 MB. Consider compressing it; readers on phones will wait.");
if (a["dry-run"]) {
  console.log("Dry run: nothing uploaded.");
  process.exit(0);
}

// ── Upload, then insert; undo the upload if the insert fails ────────────────
loadDotEnv();
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) fail("set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (env or .env)");
const sb = createClient(url, key, { auth: { persistSession: false } });

const { data: existing, error: listErr } = await sb.storage
  .from(BUCKET)
  .list(a.category, { search: path.basename(objectPath) });
if (listErr) fail(`could not check storage: ${listErr.message}`);
if (existing?.some((o) => `${a.category}/${o.name}` === objectPath))
  fail(`${objectPath} already exists; change the title or delete the old file first`);

const { error: upErr } = await sb.storage.from(BUCKET).upload(objectPath, fs.readFileSync(a.file), {
  contentType: MIME[ext],
  upsert: false,
  cacheControl: "3600",
});
if (upErr) fail(`upload failed: ${upErr.message}`);

const { data: inserted, error: insErr } = await sb.from("publications").insert(row).select("id");
if (insErr) {
  await sb.storage.from(BUCKET).remove([objectPath]);
  fail(`insert failed (upload rolled back): ${insErr.message}`);
}

const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
console.log(`Published ${inserted?.[0]?.id}`);
console.log(`File: ${publicUrl}`);
console.log("Live on https://www.purduesmif.org/research");
