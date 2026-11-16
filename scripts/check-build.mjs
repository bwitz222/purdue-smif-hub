// Post-build guard: run after `npm run build`. Fails if the deploy output would
// publish source maps, or still references the framer-motion animation library
// that was removed to keep the entry bundle small.
//
// Usage: npm run check:build
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { brotliCompressSync } from "node:zlib";

const OUT = ".vercel/output";
if (!existsSync(OUT)) {
  console.error(`No build output at ${OUT}. Run "npm run build" first.`);
  process.exit(2);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(OUT);
const problems = [];

for (const f of files.filter((f) => f.endsWith(".map"))) problems.push(`source map shipped: ${f}`);

const clientJs = files.filter((f) => f.startsWith(join(OUT, "static")) && f.endsWith(".js"));
for (const f of clientJs) {
  const src = readFileSync(f, "utf8");
  if (/\/\/# sourceMappingURL=/.test(src)) problems.push(`sourceMappingURL comment in ${f}`);
  if (/framer-motion|motion-dom/.test(src)) problems.push(`framer-motion code in ${f}`);
}

// Report sizes so growth shows up in the CI log.
const sizes = clientJs
  .map((f) => {
    const b = readFileSync(f);
    return { f: f.split("/").pop(), raw: b.length, br: brotliCompressSync(b).length };
  })
  .sort((a, b) => b.raw - a.raw);
console.log("Largest client scripts (raw / brotli):");
for (const s of sizes.slice(0, 5)) {
  console.log(
    `  ${(s.raw / 1024).toFixed(0).padStart(5)} KB / ${(s.br / 1024).toFixed(0).padStart(4)} KB  ${s.f}`,
  );
}

if (problems.length) {
  console.error("\nBuild check FAILED:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log("\nBuild check passed: no source maps, no framer-motion.");
