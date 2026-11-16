// Regenerates the text-only social cards in /public from the definitions below.
// Run: node scripts/generate-og-cards.mjs   (needs network for Google Fonts)
//
// Cards carry only claims the site itself makes and that do not go stale: no
// founding year, member counts or team counts. Those live on the pages, where a
// single edit fixes them; baked into a JPEG they drift out of date unseen.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const W = 1536;
const H = 1024;

const CARDS = [
  {
    file: "og-share.jpg",
    kind: "wordmark",
    title: "Purdue SMIF",
    sub: "Student Managed Investment Fund",
    foot: "Daniels School of Business · Purdue University",
  },
  {
    file: "og-about.jpg",
    title: "About Purdue SMIF",
    size: 136,
    sub: "Student-managed. Real capital.",
  },
  {
    file: "og-team.jpg",
    title: "Meet the Team",
    sub: "Analysts. Portfolio managers. Executive board.",
  },
  { file: "og-sectors.jpg", title: "Sectors", sub: "Coverage teams. One portfolio." },
];

const html = (c) => `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@500&display=block" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;background:#0a0a0a;position:relative;overflow:hidden;color:#fff;
    background-image:linear-gradient(rgba(206,184,136,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(206,184,136,.05) 1px,transparent 1px);
    background-size:64px 64px}
  .tag{position:absolute;left:64px;top:56px;font:500 26px 'IBM Plex Mono';letter-spacing:.38em;color:#ceb888}
  .wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 80px}
  .rule{width:640px;height:3px;background:#ceb888;margin-bottom:56px}
  h1{white-space:nowrap;font:600 ${c.size ?? (c.kind === "wordmark" ? 190 : 176)}px/1 'Cormorant Garamond';letter-spacing:-.01em;
    color:${c.kind === "wordmark" ? "#ceb888" : "#fff"}}
  .sub{margin-top:44px;font:500 ${c.kind === "wordmark" ? 34 : 30}px 'IBM Plex ${c.kind === "wordmark" ? "Sans" : "Mono"}';
    letter-spacing:.3em;text-transform:uppercase;color:${c.kind === "wordmark" ? "#f4efe4" : "#ceb888"}}
  .foot{position:absolute;left:64px;right:64px;bottom:56px;display:flex;justify-content:space-between;
    font:400 24px 'IBM Plex Mono';letter-spacing:.2em;text-transform:uppercase;color:#ceb888}
</style>
${c.kind === "wordmark" ? "" : '<div class="tag">SMIF</div>'}
<div class="wrap">${c.kind === "wordmark" ? '<div class="rule"></div>' : ""}<h1>${c.title}</h1><div class="sub">${c.sub}</div></div>
${c.foot ? `<div class="foot"><span>${c.foot}</span><span>purduesmif.org</span></div>` : ""}`;

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const c of CARDS) {
  await page.setContent(html(c), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/${c.file}`, type: "jpeg", quality: 90 });
  console.log("wrote public/" + c.file);
}
await browser.close();
