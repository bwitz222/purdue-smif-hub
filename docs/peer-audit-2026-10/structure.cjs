const { createRequire } = require('module');
const r = createRequire(require('path').resolve(__dirname, '../../package.json'));
const { chromium } = r('playwright');
const fs = require('fs');
const pages = JSON.parse(fs.readFileSync(__dirname + '/' + (process.argv[2]||'pages.json')));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const jobs = []; for (const [site, pp] of Object.entries(pages)) for (const [kind, url] of Object.entries(pp)) if (['home','research','team','careers','about'].includes(kind)) jobs.push({ site, kind, url });
(async () => {
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}), args:['--disable-blink-features=AutomationControlled'] });
  const out = fs.createWriteStream(__dirname + '/data/' + (process.argv[3]||'structure_merged') + '.jsonl');
  const q = [...jobs];
  async function w() { while (q.length) { const j = q.shift(); const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: UA, locale: 'en-US' }); const p = await ctx.newPage();
    try { await p.goto(j.url, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(3000);
      await p.evaluate(async () => { for (let y = 0; y < Math.min(document.body.scrollHeight, 15000); y += 800) { scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } scrollTo(0,0); });
      const d = await p.evaluate(() => {
        const vis = el => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
        const T = el => (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 90);
        const hs = [...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h => h.tagName + ':' + T(h)).filter(x => x.length > 3).slice(0, 45);
        const body = document.body.innerText;
        const footer = document.querySelector('footer, [role=contentinfo]');
        const fh = footer ? [...footer.querySelectorAll('h2,h3,h4,h5,h6,strong,[class*=title i],[class*=heading i]')].map(T).filter(Boolean).slice(0, 20) : [];
        const numbers = (body.match(/\$\s?\d[\d.,]*\s?(billion|trillion|million|bn|tn|B|T|M|K)\b|\b\d[\d.,]*\+?\s?(employees|professionals|countries|offices|clients|years|investment professionals|companies)\b/gi) || []).slice(0, 12);
        const audience = /I am an?|I'm an?|select your role|choose your role|individual investor|financial professional|institutional investor/i.test(body);
        const cards = [...document.querySelectorAll('article, [class*=card i]')].filter(vis).length;
        return { title: document.title, hs, fh, numbers, audience, cards, words: body.split(/\s+/).length };
      });
      out.write(JSON.stringify({ ...j, ...d }) + '\n'); console.log(j.site, j.kind, d.hs.length);
    } catch (e) { out.write(JSON.stringify({ ...j, error: String(e).slice(0, 200) }) + '\n'); console.log(j.site, j.kind, 'ERR'); }
    await ctx.close(); } }
  await Promise.all([w(), w()]); out.end(); await browser.close();
})();
