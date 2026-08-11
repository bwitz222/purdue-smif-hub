#!/usr/bin/env node
/**
 * Inlines shared assets into each page source so every file in dist/ is
 * self-contained and publishable on its own.
 *
 *   mockups/src/*.html  --[ <!--@include path--> ]-->  mockups/dist/*.html
 *
 * Include paths resolve relative to mockups/. Includes are expanded
 * recursively (a partial may include another), with a depth guard.
 * Any marker left unresolved fails the build loudly rather than shipping a
 * page with a hole in it.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const INCLUDE = /<!--@include\s+([^\s]+?)\s*-->/g;
const IMG = /<!--@img\s+([^\s]+?)\s*-->/g;
const MAX_DEPTH = 5;
const MIME = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml" };

/** Emits a data: URI. Artifacts run under a CSP that blocks every external
 *  host, so each page has to carry its own pixels. */
function inlineImages(text) {
  return text.replace(IMG, (_, rel) => {
    const file = resolve(ROOT, "..", rel);
    if (!existsSync(file)) throw new Error(`Image not found: ${rel}`);
    const ext = rel.split(".").pop().toLowerCase();
    if (!MIME[ext]) throw new Error(`Unsupported image type: ${rel}`);
    return `data:${MIME[ext]};base64,${readFileSync(file).toString("base64")}`;
  });
}

function expand(text, depth = 0) {
  if (depth > MAX_DEPTH) {
    throw new Error(`Include nesting exceeded ${MAX_DEPTH} levels — circular include?`);
  }
  return text.replace(INCLUDE, (_, rel) => {
    const file = resolve(ROOT, rel);
    if (!existsSync(file)) throw new Error(`Include not found: ${rel}`);
    return expand(readFileSync(file, "utf8"), depth + 1);
  });
}

if (!existsSync(SRC)) {
  console.error("No mockups/src directory.");
  process.exit(1);
}
mkdirSync(DIST, { recursive: true });

const pages = readdirSync(SRC).filter((f) => f.endsWith(".html"));
if (!pages.length) {
  console.error("No pages in mockups/src.");
  process.exit(1);
}

let failed = 0;
for (const page of pages) {
  let out;
  try {
    out = inlineImages(expand(readFileSync(join(SRC, page), "utf8")));
  } catch (err) {
    console.error(`  ✕ ${page} — ${err.message}`);
    failed++;
    continue;
  }
  if (INCLUDE.test(out)) {
    INCLUDE.lastIndex = 0;
    console.error(`  ✕ ${page} — unresolved include marker remains`);
    failed++;
    continue;
  }
  writeFileSync(join(DIST, page), out);
  console.log(`  ✓ ${page.padEnd(22)} ${(out.length / 1024).toFixed(0)} KB`);
}

if (failed) {
  console.error(`\n${failed} page(s) failed.`);
  process.exit(1);
}
console.log(`\n${pages.length} page(s) → mockups/dist/`);
