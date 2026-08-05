/**
 * Browser + accessibility suite.
 *
 * Boots its own dev server on a free port, drives every page with Chromium at
 * desktop and mobile widths, then runs axe-core (WCAG 2.1 A/AA) over each page.
 *
 * Deliberately runs WITHOUT Supabase credentials. Every page must still render:
 * /holdings and /research both returned HTTP 500 on a data outage until the
 * route loaders were taught to degrade, and this is the check that keeps them
 * honest.
 *
 * Usage: npm run test:e2e
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const PAGES = ["/", "/about", "/team", "/sectors", "/holdings", "/performance",
  "/research", "/recruiting", "/learn", "/apply", "/contact"];

const results = [];
const record = (name, ok, note = "") => {
  results.push({ name, ok, note });
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${name}${note ? "  ::  " + note : ""}`);
};

const freePort = () => new Promise((res) => {
  const s = net.createServer();
  s.listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => res(port)); });
});

const waitForServer = async (base, timeoutMs = 90_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(4000) });
      if (r.status) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`dev server never came up at ${base}`);
};

const port = await freePort();
const BASE = `http://127.0.0.1:${port}`;
const server = spawn("npx", ["vite", "dev", "--host", "127.0.0.1", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, BROWSER: "none" },
});
const stop = () => { try { server.kill("SIGTERM"); } catch { /* already gone */ } };
process.on("exit", stop);

try {
  await waitForServer(BASE);
  // CI installs its own browser via `npx playwright install chromium`. Sandboxes
  // and dev machines that already ship one can point at it instead.
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});

  // ── Every page renders without Supabase ──────────────────────────────────
  for (const path of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const resp = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(600);
    const status = resp?.status() ?? 0;
    const info = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      text: document.body.innerText.length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    record(`${path} renders without Supabase`, status === 200 && info.text > 400,
      `HTTP ${status}, ${info.text} chars`);
    record(`${path} has exactly one h1`, info.h1 === 1, `${info.h1} found`);
    record(`${path} no horizontal overflow`, !info.overflow);
    await ctx.close();
  }

  // ── Accessibility ────────────────────────────────────────────────────────
  for (const path of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(500);
    await page.addScriptTag({ content: axeSource });
    const out = await page.evaluate(async () =>
      await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } }));
    const ids = out.violations.map((v) => `${v.id}(${v.nodes.length})`);
    record(`${path} axe WCAG 2.1 A/AA`, out.violations.length === 0, ids.join(" ") || "clean");
    await ctx.close();
  }

  // ── Interactions ─────────────────────────────────────────────────────────
  const open = async (path, width = 1440) => {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(900);
    return { page, ctx, errors };
  };

  {
    const { page, ctx, errors } = await open("/team");
    const cards = await page.locator('a[href^="/team/"]').count();
    record("/team member cards render", cards > 10, `${cards} cards`);

    const search = page.locator('input[type="search"]');
    await search.fill("Voona");
    await page.waitForTimeout(900);
    const names = await page.$$eval("main", (els) => els[0].innerText);
    record("/team search filters the roster", names.includes("Voona") && !names.includes("Gautham"));
    await search.fill("");
    await page.waitForTimeout(600);

    const tab = page.locator('[role="tab"]').nth(2);
    const label = (await tab.textContent()).trim();
    await tab.click();
    await page.waitForTimeout(900);
    record("/team scope tab selects and deep-links",
      (await page.locator('[role="tab"][aria-selected="true"]').textContent()).trim() === label
      && page.url().includes("sector="), label);

    // Clicking the card body (not the name link) opens the quick-preview sheet.
    await page.locator("main img").first().click();
    await page.waitForTimeout(1000);
    record("/team card opens the detail sheet", (await page.locator('[role="dialog"]').count()) > 0);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    record("/team no uncaught page errors", errors.length === 0, errors[0] ?? "");
    await ctx.close();
  }

  {
    const { page, ctx } = await open("/team/sid-voona");
    const info = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim(),
      ld: Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
        .map((s) => { try { return JSON.parse(s.textContent)["@type"]; } catch { return null; } }),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    }));
    record("/team/<slug> renders the member", info.h1 === "Sid Voona", info.h1 ?? "");
    record("/team/<slug> has a canonical URL",
      info.canonical === "https://www.purduesmif.org/team/sid-voona", info.canonical ?? "");
    await ctx.close();
  }

  {
    const { page, ctx, errors } = await open("/performance");
    const toggles = page.locator('[role="group"] button');
    record("/performance chart toggles render", (await toggles.count()) >= 4);
    await toggles.nth(1).click();
    await page.waitForTimeout(1200);
    record("/performance charts draw", (await page.locator("svg.recharts-surface").count()) > 0);
    record("/performance no uncaught page errors", errors.length === 0, errors[0] ?? "");
    await ctx.close();
  }

  {
    const { page, ctx } = await open("/apply");
    const trigger = page.locator("[data-radix-collection-item]").first();
    await trigger.click();
    await page.waitForTimeout(600);
    record("/apply FAQ accordion expands", (await trigger.getAttribute("aria-expanded")) === "true");
    await ctx.close();
  }

  {
    const { page, ctx } = await open("/contact");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(800);
    record("/contact blocks an empty submit",
      (await page.locator('[role="alert"]').filter({ hasText: /.+/ }).count()) > 0);
    await page.locator("#name").fill("Test");
    await page.locator("#email").fill("not-an-email");
    await page.locator("#message").fill("too short");
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(800);
    const body = await page.locator("body").innerText();
    record("/contact rejects a malformed email", /valid email/i.test(body));
    record("/contact rejects a short message", /at least 20/i.test(body));
    await ctx.close();
  }

  {
    const { page, ctx } = await open("/recruiting");
    const gcalLinks = await page.locator('a[href*="calendar.google.com"]').count();
    record("/recruiting rows link to Google Calendar", gcalLinks > 0, `${gcalLinks} links`);

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10_000 }).catch(() => null),
      page.locator('button:has-text("Download all events")').click(),
    ]);
    record("/recruiting .ics downloads", !!download, download ? await download.suggestedFilename() : "no download");

    // Deliberately not a hardcoded count: that drifts silently the moment the
    // calendar is edited. The invariant that actually matters is that the two
    // independent renderings of CALENDAR agree — one Google Calendar link per
    // row, one VEVENT per row — so editing the calendar keeps this honest
    // while a bug in either path still fails.
    if (download) {
      const icsPath = await download.path();
      const ics = icsPath ? readFileSync(icsPath, "utf8") : "";
      const vevents = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
      record("/recruiting .ics has one VEVENT per calendar row",
        vevents === gcalLinks && vevents > 0, `${vevents} VEVENTs vs ${gcalLinks} rows`);
    }

    // The application close is not an event — it must never acquire a Google
    // Calendar link or an .ics entry, but it must appear on the page.
    const bodyText = await page.locator("body").innerText();
    record("/recruiting states the application deadline", /Applications close/i.test(bodyText));
    await ctx.close();
  }

  {
    const { page, ctx } = await open("/", 390);
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(700);
    record("mobile menu opens", (await page.locator('[role="dialog"]').count()) > 0);
    await page.locator('button[aria-label="Close menu"]').click();
    await page.waitForTimeout(600);
    record("mobile menu closes", (await page.locator('[role="dialog"]:visible').count()) === 0);
    await ctx.close();
  }

  {
    const { page, ctx } = await open("/");
    await page.keyboard.press("Tab");
    await page.waitForTimeout(250);
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
    record("skip link is the first tab stop", focused === "Skip to main content", focused ?? "");
    await ctx.close();
  }

  await browser.close();
} finally {
  stop();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("\nFailures:");
  for (const f of failed) console.log(`  - ${f.name}${f.note ? "  ::  " + f.note : ""}`);
  process.exit(1);
}
