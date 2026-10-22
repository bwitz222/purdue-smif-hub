// Capture rig: desktop 1440x900 + mobile 390x844, Chromium headless, axe-core.
const { createRequire } = require('module');
const r = createRequire(require('path').resolve(__dirname, '../../package.json'));
const { chromium, devices } = r('playwright');
const fs = require('fs'), path = require('path');
const AXE = fs.readFileSync(r.resolve('axe-core/axe.min.js'), 'utf8');
const OUT = path.resolve(__dirname, 'data');
fs.mkdirSync(OUT + '/shots', { recursive: true });
const pages = JSON.parse(fs.readFileSync(__dirname + '/' + (process.argv[2] || 'pages.json')));
const only = process.argv[3] ? process.argv[3].split(',') : null;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const MUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const jobs = [];
for (const [site, pp] of Object.entries(pages)) {
  if (only && !only.includes(site)) continue;
  for (const [kind, url] of Object.entries(pp)) jobs.push({ site, kind, url });
}

async function netTracker(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  const st = { bytes: 0, reqs: 0, byType: {} };
  const types = {};
  cdp.on('Network.responseReceived', e => { st.reqs++; types[e.requestId] = e.type; });
  cdp.on('Network.loadingFinished', e => { st.bytes += e.encodedDataLength; const t = types[e.requestId] || 'Other'; st.byType[t] = (st.byType[t] || 0) + e.encodedDataLength; });
  return st;
}

const PAGE_FN = () => {
  const vis = el => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const W = innerWidth, H = innerHeight;
  const inFold = r => r.top < H && r.bottom > 0 && r.left < W && r.right > 0;
  const txt = el => (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
  const header = document.querySelector('header, [role=banner]') || document.querySelector('nav');
  // nav links: visible links/buttons in the header band (top 200px at scroll 0)
  // Header band: every visible link/button whose box sits entirely in the top 200px at scroll 0,
  // excluding consent/cookie overlays. Markup-independent, so it works on sites without <header>.
  const isConsent = el => { let e = el; while (e && e !== document.body) { const s = getComputedStyle(e); if (['fixed','sticky'].includes(s.position) && /cookie|consent/i.test((e.innerText || '').slice(0, 1500)) && !/^(nav|header)$/i.test(e.tagName)) return true; if (/onetrust|cookie|consent|truste|didomi|usercentrics/i.test((e.id || '') + ' ' + (typeof e.className === 'string' ? e.className : ''))) return true; e = e.parentElement; } return false; };
  let navItems = []; const bandEls = new Set();
  { const seen = new Set();
    for (const a of document.querySelectorAll('a[href], button, [role=button]')) {
      if (!vis(a)) continue; const r = a.getBoundingClientRect(); if (r.top < 0 || r.bottom > 200 || r.width < 4) continue;
      if (isConsent(a)) continue;
      bandEls.add(a);
      const t = txt(a) || (a.querySelector('img[alt]') || {}).alt || '';
      if (!t) { navItems.push('(icon)'); continue; }
      if (t.length > 40 || /skip to/i.test(t)) continue;
      const k = t.toLowerCase(); if (seen.has(k)) continue; seen.add(k); navItems.push(t);
    } }
  const all = [...document.querySelectorAll('a[href], button, [role=button], input:not([type=hidden]), select, summary')];
  const isStyled = el => { const s = getComputedStyle(el); const bg = s.backgroundColor; const hasBg = bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg); const bw = parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth); const hasBorder = bw >= 2 && !/rgba\(0, 0, 0, 0\)/.test(s.borderTopColor) && s.borderTopStyle !== 'none' && s.borderLeftStyle !== 'none'; return hasBg || hasBorder; };
  const ctas = [];
  for (const el of all) {
    if (!['A', 'BUTTON'].includes(el.tagName) && el.getAttribute('role') !== 'button') continue;
    if (!vis(el)) continue; const r = el.getBoundingClientRect(); if (!inFold(r)) continue;
    if (bandEls.has(el) || isConsent(el)) continue;
    const t = txt(el).replace(/\s*\((opens|link opens)[^)]*\)/i, ''); if (!t || t.length > 60 || r.height < 28) continue;
    if (isStyled(el)) ctas.push(t);
  }
  // words above fold + small text
  let words = 0, small = 0, totalTextEls = 0; const smallSamples = []; const sizes = {};
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const counted = new Set();
  while (tw.nextNode()) {
    const n = tw.currentNode; const s = n.textContent.trim(); if (!s) continue;
    const el = n.parentElement; if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    if (!vis(el)) continue;
    const range = document.createRange(); range.selectNodeContents(n); const rr = range.getBoundingClientRect();
    if (rr.width === 0 || rr.height === 0) continue;
    if (inFold(rr)) words += s.split(/\s+/).length;
    if (!counted.has(el)) { counted.add(el); totalTextEls++; const fs = parseFloat(getComputedStyle(el).fontSize); const b = Math.round(fs); sizes[b] = (sizes[b] || 0) + s.length; if (fs < 12) { small++; if (smallSamples.length < 8) smallSamples.push(s.slice(0, 30) + ' @' + fs + 'px'); } }
  }
  // targets < 24px (raw and inline-text-link-exempt)
  let tRaw = 0, tAdj = 0; const tSamples = [];
  for (const el of all) {
    if (!vis(el)) continue; const r = el.getBoundingClientRect();
    if (r.width >= 24 && r.height >= 24) continue;
    tRaw++;
    const s = getComputedStyle(el);
    const inlineInText = el.tagName === 'A' && s.display === 'inline' && el.parentElement && (el.parentElement.innerText || '').trim().length > (el.innerText || '').trim().length + 15;
    if (/skip/i.test(txt(el))) continue;
    if (!inlineInText) { tAdj++; if (tSamples.length < 6) tSamples.push(txt(el).slice(0, 24) + ` ${Math.round(r.width)}x${Math.round(r.height)}`); }
  }
  const bodyText = document.body.innerText || '';
  const linkTexts = [...document.querySelectorAll('a[href], button')].map(a => txt(a) + ' ' + (a.getAttribute('href') || ''));
  const hasSearch = !!document.querySelector('input[type=search], [role=search], input[name*=search i], input[placeholder*=search i]') || linkTexts.some(t => /\bsearch\b/i.test(t));
  const hasSubscribe = linkTexts.some(t => /subscribe|newsletter|sign up for|email updates|get updates/i.test(t)) || !!document.querySelector('input[type=email]');
  // cookie / consent overlay
  let cookieCover = 0;
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el); if (!['fixed', 'sticky'].includes(s.position)) continue; if (!vis(el)) continue;
    const t = (el.innerText || '').slice(0, 2000); if (!/cookie|consent|privacy preferences/i.test(t)) continue;
    const r = el.getBoundingClientRect(); const a = Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));
    cookieCover = Math.max(cookieCover, a / (W * H));
  }
  const videos = [...document.querySelectorAll('video')].filter(v => vis(v) && inFold(v.getBoundingClientRect()));
  const h1 = document.querySelector('h1');
  const cv = document.createElement('canvas').getContext('2d');
  const toRgba = c => { cv.clearRect(0,0,1,1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0,0,1,1); const d = cv.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const bgOf = el => { while (el) { const b = getComputedStyle(el).backgroundColor; if (b && b !== 'transparent') { cv.canvas.width = 1; const [R,G,B,A] = toRgba(b); if (A >= 0.5) return `rgb(${R}, ${G}, ${B})`; } if (getComputedStyle(el).backgroundImage !== 'none' && el !== document.body && el !== document.documentElement) { /* image/gradient behind: unknown */ } el = el.parentElement; } return 'rgb(255, 255, 255)'; };
  const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return 1; const [R, G, B] = m.slice(0, 3).map(x => { x = x / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * R + 0.7152 * G + 0.0722 * B; };
  const h1Info = h1 ? { text: txt(h1).slice(0, 120), size: parseFloat(getComputedStyle(h1).fontSize), font: getComputedStyle(h1).fontFamily.split(',')[0].replace(/"/g, ''), color: getComputedStyle(h1).color, weight: getComputedStyle(h1).fontWeight, top: Math.round(h1.getBoundingClientRect().top) } : null;
  const heroBg = h1 ? bgOf(h1) : bgOf(document.body);
  // fonts in use
  const fams = {};
  for (const el of counted) { const f = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim(); fams[f] = (fams[f] || 0) + 1; }
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { const j = JSON.parse(s.textContent); const g = Array.isArray(j) ? j : (j['@graph'] || [j]); return g.map(x => x['@type']).flat(); } catch { return ['(invalid)']; } }).flat();
  const meta = n => (document.querySelector(`meta[name="${n}"], meta[property="${n}"]`) || {}).content || '';
  const footer = document.querySelector('footer, [role=contentinfo]');
  const sticky = header ? ['sticky', 'fixed'].includes(getComputedStyle(header).position) || ['sticky','fixed'].includes(getComputedStyle(header.parentElement||header).position) : false;
  const dateHits = (bodyText.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.? \d{1,2},? \d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}\b/g) || []).length;
  const tabs = document.querySelectorAll('[role=tab]').length;
  const selects = document.querySelectorAll('select').length;
  const filterBtns = linkTexts.filter(t => /filter|sort by|all topics|topic/i.test(t)).length;
  const pdfLinks = [...document.querySelectorAll('a[href]')].filter(a => /\.pdf(\?|$)/i.test(a.href)).length;
  const insightLinks = [...document.querySelectorAll('a[href]')].filter(a => /insight|research|perspective|memo|commentary|thought|outlook|publication/i.test(a.href)).length;
  const hamburger = !!document.querySelector('button[aria-label*=menu i], button[aria-controls*=menu i], button[aria-label*=navigation i], [class*=hamburger i], [class*=burger i], button[aria-expanded][aria-label*=nav i]');
  const disclaimer = /not (an? )?(offer|investment advice|a recommendation)|for informational purposes|disclaimer|past performance/i.test(bodyText);
  const skip = !!document.querySelector('a[href^="#"]') && [...document.querySelectorAll('a[href^="#"]')].some(a => /skip/i.test(a.innerText || a.textContent || ''));
  const imgs = [...document.querySelectorAll('img')]; const imgNoAlt = imgs.filter(i => !i.hasAttribute('alt')).length;
  const headings = { h1: document.querySelectorAll('h1').length, h2: document.querySelectorAll('h2').length, h3: document.querySelectorAll('h3').length };
  const bodyFs = parseFloat(getComputedStyle(document.querySelector('main p, article p, p') || document.body).fontSize);
  const pLine = (() => { const p = [...document.querySelectorAll('main p, p')].find(p => vis(p) && (p.innerText || '').length > 120); if (!p) return null; const s = getComputedStyle(p); return { fs: parseFloat(s.fontSize), lh: s.lineHeight, widthPx: Math.round(p.getBoundingClientRect().width), chars: Math.round(p.getBoundingClientRect().width / (parseFloat(s.fontSize) * 0.5)) }; })();
  return {
    title: document.title, lang: document.documentElement.lang, metaDesc: meta('description'), ogImage: !!meta('og:image'), ogTitle: !!meta('og:title'), twitter: !!meta('twitter:card'), canonical: !!document.querySelector('link[rel=canonical]'), ld,
    navCount: navItems.length, navItems: navItems.slice(0, 20), ctas: ctas.slice(0, 10), ctaCount: ctas.length, words, small, smallSamples, totalTextEls, sizes,
    targetsRaw: tRaw, targetsAdj: tAdj, tSamples, hasSearch, hasSubscribe, cookieCover: +cookieCover.toFixed(3), heroVideo: videos.length, autoplayVideo: videos.filter(v => v.autoplay || !v.paused).length,
    h1: h1Info, heroBg, heroDark: lum(heroBg) < 0.2, fams, footerLinks: footer ? footer.querySelectorAll('a[href]').length : 0, sticky,
    dateHits, tabs, selects, filterBtns, pdfLinks, insightLinks, hamburger, disclaimer, skip, imgs: imgs.length, imgNoAlt, headings, bodyFs, pLine,
    height: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > innerWidth + 1, scrollWidth: document.documentElement.scrollWidth,
    prefersDark: [...document.styleSheets].some(ss => { try { return [...ss.cssRules].some(r => r.media && /prefers-color-scheme/.test(r.media.mediaText)); } catch { return false; } }),
    reducedMotion: [...document.styleSheets].some(ss => { try { return [...ss.cssRules].some(r => r.media && /prefers-reduced-motion/.test(r.media.mediaText)); } catch { return false; } }),
  };
};

async function lcp(page) {
  return page.evaluate(() => new Promise(res => { let v = 0; try { new PerformanceObserver(l => { for (const e of l.getEntries()) v = Math.max(v, e.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {} setTimeout(() => res(Math.round(v)), 300); }));
}
async function navTiming(page) { return page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return n ? { ttfb: Math.round(n.responseStart), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) } : null; }); }

async function capture(browser, job, mode) {
  const opts = mode === 'desktop' ? { viewport: { width: 1440, height: 900 }, userAgent: UA, locale: 'en-US', timezoneId: 'America/Indiana/Indianapolis', bypassCSP: true }
    : { viewport: { width: 390, height: 844 }, userAgent: MUA, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'en-US', timezoneId: 'America/Indiana/Indianapolis' };
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const net = await netTracker(page);
  const res = { site: job.site, kind: job.kind, url: job.url, mode };
  try {
    const resp = await page.goto(job.url, { waitUntil: 'load', timeout: 60000 });
    res.status = resp ? resp.status() : null; res.finalUrl = page.url();
    try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch {}
    await page.waitForTimeout(2500);
    res.lcp = await lcp(page); res.timing = await navTiming(page);
    res.bytes = net.bytes; res.reqs = net.reqs; res.byType = { ...net.byType };
    Object.assign(res, await page.evaluate(PAGE_FN));
    const tag = `${job.site}_${job.kind}_${mode}`;
    await page.screenshot({ path: `${OUT}/shots/${tag}_fold.jpg`, type: 'jpeg', quality: 70 });
    if (mode === 'desktop') {
      await page.addScriptTag({ content: AXE });
      const ax = await page.evaluate(async () => { const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] }); return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length })); });
      res.axe = ax; res.axeSerious = ax.filter(v => ['serious', 'critical'].includes(v.impact)).reduce((a, v) => a + v.n, 0);
      // scroll to trigger lazy content, then full-page shot (capped)
      await page.evaluate(async () => { for (let y = 0; y < Math.min(document.body.scrollHeight, 12000); y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
      await page.waitForTimeout(800);
      const h = await page.evaluate(() => Math.min(document.documentElement.scrollHeight, 9000));
      await page.screenshot({ path: `${OUT}/shots/${tag}_full.jpg`, type: 'jpeg', quality: 55, clip: { x: 0, y: 0, width: 1440, height: h }, fullPage: true });
    }
  } catch (e) { res.error = String(e).slice(0, 300); }
  await ctx.close();
  return res;
}

(async () => {
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}), args: ['--disable-blink-features=AutomationControlled'] });
  const outFile = `${OUT}/${process.argv[4] || 'merged'}.jsonl`;
  const q = [...jobs];
  async function worker() {
    while (q.length) {
      const j = q.shift();
      for (const m of ['desktop', 'mobile']) {
        const r = await capture(browser, j, m);
        fs.appendFileSync(outFile, JSON.stringify(r) + '\n');
        console.log(new Date().toISOString().slice(11, 19), j.site, j.kind, m, r.status, r.error ? 'ERR ' + r.error.slice(0, 80) : `${Math.round(r.bytes / 1024)}KB nav=${r.navCount} axe=${r.axeSerious ?? '-'}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 5 }, worker));
  await browser.close();
})();
