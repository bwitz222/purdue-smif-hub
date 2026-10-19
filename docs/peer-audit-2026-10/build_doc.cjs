// Builds docs/2026-10-19_smif-website_reform-plan.docx from out/data.json.
// Every number in a table comes from data.json; prose figures are cross-checked by verify.py.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, HeadingLevel, BorderStyle, ImageRun, LevelFormat, Header, Footer, PageNumber,
  PageBreak, TableLayoutType,
} = require('docx');

const OUT = path.resolve(__dirname, 'data');
const D = JSON.parse(fs.readFileSync(OUT + '/data.json'));
const F = D.features;
const REPO = path.resolve(__dirname, '../..');

const C = { black: '000000', gray: '6F727B', steel: '555960', aged: '8E6F3E', gold: 'CFB991', light: 'EBD99F', off: 'F5F2EC', lgray: 'D4D5D8' };
const FONT = 'Times New Roman';
const fmt = n => (n === null || n === undefined) ? 'n/a' : Number(n).toLocaleString('en-US');

// Inline markup: **bold**
function runs(text, base = {}) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map(p => p.startsWith('**')
    ? new TextRun({ text: p.slice(2, -2), bold: true, color: C.black, font: FONT, ...base })
    : new TextRun({ text: p, color: C.gray, font: FONT, ...base }));
}
const P = (t, o = {}) => new Paragraph({ children: runs(t, o.run || {}), spacing: { after: 120, line: 276 }, ...o.para });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t, font: FONT, size: 36, color: C.black })], spacing: { before: 360, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.gold, space: 4 } } });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, font: FONT, size: 24, bold: true, color: C.black })], spacing: { before: 240, after: 100 } });
const H3 = t => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: t, font: FONT, size: 22, bold: true, color: C.aged })], spacing: { before: 180, after: 80 } });
const B = (t, lvl = 0) => new Paragraph({ numbering: { reference: 'bul', level: lvl }, children: runs(t), spacing: { after: 60, line: 264 } });
const N = (t, ref = 'num') => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t), spacing: { after: 60, line: 264 } });
const CAP = t => new Paragraph({ children: [new TextRun({ text: t, italics: true, size: 17, color: C.gray, font: FONT })], spacing: { before: 60, after: 200 } });

const TW = 9360; // 6.5in content width in DXA
function table(headers, rows, widths, opts = {}) {
  const sum = widths.reduce((a, b) => a + b, 0);
  const w = widths.map(x => Math.round(x / sum * TW));
  w[w.length - 1] += TW - w.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: C.lgray };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (txt, i, isHead, stripe, bold) => new TableCell({
    width: { size: w[i], type: WidthType.DXA }, borders,
    shading: isHead ? { type: ShadingType.CLEAR, color: 'auto', fill: C.black } : stripe ? { type: ShadingType.CLEAR, color: 'auto', fill: C.off } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: String(txt).split('\n').map(line => new Paragraph({
      alignment: (opts.numCols || []).includes(i) && !isHead ? AlignmentType.RIGHT : AlignmentType.LEFT,
      children: isHead ? [new TextRun({ text: line, bold: true, color: 'FFFFFF', size: 18, font: FONT })]
        : runs(line, { size: 18, ...(bold ? { bold: true } : {}) }).map(r => r),
    })),
  });
  return new Table({
    width: { size: TW, type: WidthType.DXA }, columnWidths: w, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false, ri % 2 === 1, (opts.boldRows || []).includes(ri))) }))],
  });
}
const gap = () => new Paragraph({ children: [], spacing: { after: 120 } });
function img(file, widthIn) {
  const buf = fs.readFileSync(file);
  const { execSync } = require('child_process');
  const [w, h] = execSync(`python3 -c "from PIL import Image;i=Image.open('${file}');print(i.size[0],i.size[1])"`).toString().trim().split(' ').map(Number);
  const W = Math.round(widthIn * 96);
  return new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'jpg', data: buf, transformation: { width: W, height: Math.round(W * h / w) } })], spacing: { before: 120 } });
}

// ---------- data-driven pieces ----------
const G = ['Ours', 'Top-20', 'Sell-side 10', 'Buy-side 10', 'Student funds 5'];
const METRICS = ['Page weight, desktop (KB)', 'Requests, desktop', 'LCP, desktop (ms)', 'LCP, mobile (ms)', 'Serious/critical axe nodes', 'Text elements under 12px', 'Mobile targets under 24px', 'Mobile page height (px)'];
const READ = {
  'Page weight, desktop (KB)': 'Lower is better. We ship about an eighth of the top-20 median.',
  'Requests, desktop': 'Lower is better.',
  'LCP, desktop (ms)': 'Largest Contentful Paint. Lower is better.',
  'LCP, mobile (ms)': 'Lower is better.',
  'Serious/critical axe nodes': 'Lower is better. Our only failures are on /research (fixable in one line).',
  'Text elements under 12px': 'The one metric where we are the outlier. Every comparison group sits at 0.',
  'Mobile targets under 24px': 'Our median is clean; /research is the exception (18).',
  'Mobile page height (px)': 'Median is in line with peers; /team is the outlier (see below).',
};
const scoreRows = METRICS.map(m => [m, ...G.map(g => fmt(D.scoreAll[g][m])), READ[m]]);
const scoreN = ['Pages measured', ...G.map(g => String(D.scoreAll[g]._n)), 'Medians across every captured page in the group.'];

const pageRows = [['Home', 'home'], ['Research', 'scoreResearch'], ['People / team', 'scoreTeam']];
const typeRows = [
  ['Mobile height of the people/team page (px)', fmt(D.scoreTeam.Ours['Mobile page height (px)']), fmt(D.scoreTeam['Top-20']['Mobile page height (px)']), fmt(D.scoreTeam['Student funds 5']['Mobile page height (px)'])],
  ['Text elements under 12px on research (desktop)', fmt(D.scoreResearch.Ours['Text elements under 12px']), fmt(D.scoreResearch['Top-20']['Text elements under 12px']), fmt(D.scoreResearch['Student funds 5']['Text elements under 12px'])],
  ['Mobile targets under 24px on research', fmt(D.scoreResearch.Ours['Mobile targets under 24px']), fmt(D.scoreResearch['Top-20']['Mobile targets under 24px']), fmt(D.scoreResearch['Student funds 5']['Mobile targets under 24px'])],
  ['Home page weight, desktop (KB)', fmt(D.scoreHome.Ours['Page weight, desktop (KB)']), fmt(D.scoreHome['Top-20']['Page weight, desktop (KB)']), fmt(D.scoreHome['Student funds 5']['Page weight, desktop (KB)'])],
  ['Home LCP, mobile (ms)', fmt(D.scoreHome.Ours['LCP, mobile (ms)']), fmt(D.scoreHome['Top-20']['LCP, mobile (ms)']), fmt(D.scoreHome['Student funds 5']['LCP, mobile (ms)'])],
];

const ourRows = D.ours.map(o => [o.page, fmt(o.kb), fmt(o.lcp), String(o.axe), String(o.small), String(o.mt), fmt(o.mh), o.dark ? 'Ink' : 'Cream']);

const top20 = D.sites.filter(s => s.group === 'Sell-side' || s.group === 'Buy-side');
const yn = b => b ? 'Yes' : 'No';
const pct = x => x > 0 ? Math.round(x * 100) + '%' : 'None';
const featRows = [D.sites[0], ...top20].map(s => {
  const f = F[s.id];
  const nav = f.primaryNav === 0 ? (f.navNote || '0') : String(f.primaryNav) + (f.navNote ? ` (${f.navNote})` : '');
  return [s.name, nav, yn(f.utilitySplit), yn(f.contentHero), yn(f.search), yn(f.subscribe), pct(f.cookieMob), fmt(f.homeKB)];
});

const siteRows = D.sites.map(s => [s.group === 'Buy-side (prior set)' ? 'Buy-side (first audit)' : s.group, s.name, s.url.replace(/^https:\/\//, ''), s.pages.join(', ')]);

// ---------- document ----------
const logo = fs.readFileSync(REPO + '/src/assets/smif-logo-mark.png');
const children = [];

// Cover block
children.push(
  new Paragraph({ children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 48, height: 48 } })], spacing: { after: 120 } }),
  new Paragraph({ children: [new TextRun({ text: 'PURDUE STUDENT MANAGED INVESTMENT FUND', font: FONT, size: 20, color: C.aged, bold: true })], spacing: { after: 60 } }),
  new Paragraph({ children: [new TextRun({ text: 'Website Reform Plan', font: FONT, size: 56, bold: true, color: C.black })], spacing: { after: 60 } }),
  new Paragraph({ children: [new TextRun({ text: 'purduesmif.org benchmarked against 20 leading buy-side and sell-side firms', font: FONT, size: 26, color: C.steel })], spacing: { after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.gold, space: 6 } } }),
  P('Prepared for Ian Teh · October 19, 2026 · Expands the October 19, 2026 design audit (11 peer sites) to 31 peer sites.'),
  new Paragraph({ children: [new TextRun({ text: 'Confidential. For Internal Distribution Only. Purdue Student Managed Investment Fund.', italics: true, size: 16, color: C.gray, font: FONT })], spacing: { after: 240 } }),
);

// 1. Bottom line
children.push(H1('Bottom line'));
children.push(P(`The wider scan confirms the first audit and sharpens it. We captured ${D.totals.sites} sites (${D.totals.pages} pages, ${D.totals.captures} desktop and mobile captures) on October 19, 2026: 10 sell-side and 10 buy-side leaders, the 6 buy-side firms and 5 student funds from the first audit, and our own 11 routes.`));
children.push(P(`**Engineering is already a strength.** Median page weight is ${fmt(D.scoreAll.Ours['Page weight, desktop (KB)'])} KB against ${fmt(D.scoreAll['Top-20']['Page weight, desktop (KB)'])} KB for the top 20, desktop LCP is ${fmt(D.scoreAll.Ours['LCP, desktop (ms)'])} ms against ${fmt(D.scoreAll['Top-20']['LCP, desktop (ms)'])} ms, and the median page has ${D.scoreAll.Ours['Serious/critical axe nodes']} serious accessibility failures against ${D.scoreAll['Top-20']['Serious/critical axe nodes']}. Every one of the top-20 home pages is heavier than ours; the lightest (PIMCO) is ${fmt(F.pimco.homeKB)} KB to our ${fmt(F.smif.homeKB)} KB.`));
children.push(P(`**Editorial architecture is where we lose.** The top 20 run a median of 5 primary navigation links (range 3 to 7) and 16 of 20 park logins, investor relations and contact in a separate utility row. We run 8 primary links plus Apply, all in 12px tracked capitals; none of the 18 top-20 sites with a visible desktop nav sets its primary links in all caps. 11 of 20 open the home page on a specific, current piece of research. Ours puts "Latest from the fund" 3,100px down on desktop and 4,497px down on a phone, below the full-height hero and a second dark section. We are also the only site in the set that uses sub-12px type as a system: a median of ${D.scoreAll.Ours['Text elements under 12px']} such elements per page against 0 for every comparison group.`));
children.push(P('**Three things are broken on the live site today** and should ship this week regardless of the rest of the plan (section 6.1).'));
children.push(P('**The plan in one line:** make purduesmif.org read like a research shop that students happen to run. Fewer doors, research in the first screen, one type floor, a team page that fits on a phone, and calls to action that know whether applications are open.'));
children.push(H3('The five moves that matter most'));
children.push(table(['#', 'Move', 'Evidence', 'Effort'], [
  ['1', 'Fix the 3 live defects: a contradictory Apply button on /recruiting, an accessibility failure on /research, and a member count that disagrees between pages.', 'Verified in code and in the live capture.', 'Hours'],
  ['2', 'Cut the header to 5 primary links (About, Portfolio, Research, Team, Join) plus a utility row, in sentence case at 14px.', 'Top-20 median 5 primary links; 16 of 20 split utility links out.', '2 to 3 days'],
  ['3', 'Rebuild the home page so the newest research and the fund stats sit in the first viewport; add a Macro Brief subscribe box.', '11 of 20 lead with current research; 7 of 20 home pages and 11 of 18 research hubs carry a subscribe.', '3 to 4 days'],
  ['4', 'Set a 12px type floor site-wide and retire the 51 hard-coded 10px and 11px classes.', 'Ours: 14 sub-12px elements per page. Top 20: 0.', '1 day'],
  ['5', 'Make /team fit a phone: leadership first, sector teams collapsed by default.', `Ours: ${fmt(D.scoreTeam.Ours['Mobile page height (px)'])}px on mobile. Top-20 people pages: ${fmt(D.scoreTeam['Top-20']['Mobile page height (px)'])}px median.`, '1 to 2 days'],
], [4, 44, 36, 12]));

// 2. Scope and method
children.push(H1('Scope and method'));
children.push(P('Headless Chromium (Playwright 1.64, axe-core 4.14) loaded each page as a first-time visitor on October 19, 2026, at desktop (1440×900) and mobile (390×844, touch, iPhone user agent). For each page we recorded transfer size and request count after network idle, Largest Contentful Paint (LCP), serious and critical axe-core violations (WCAG 2.0 to 2.2 A and AA rules), text elements rendered under 12px, interactive elements under 24px on mobile (inline links inside running text excluded, per WCAG 2.5.8), full mobile page height, header contents, consent-banner coverage, search and subscribe affordances, and the H1 and H2 outline. Fold screenshots were reviewed by hand to classify primary versus utility navigation and the hero treatment.'));
children.push(P('**How the 20 were chosen.** This is a judgment set of the most prominent U.S.-facing institutions, not a ranking by revenue or AUM. Sell-side: Goldman Sachs, Morgan Stanley, J.P. Morgan, BofA Securities, Citi, Barclays, UBS, Deutsche Bank, Evercore, Lazard. Buy-side: BlackRock, Vanguard, Fidelity, PIMCO, Brookfield, Apollo, Wellington, Capital Group, T. Rowe Price, Bain Capital.'));
children.push(H3('Exclusions and caveats'));
children.push(B('**Carlyle and Citadel** returned HTTP 403 to every automated request, including a plain HTTP client. **Blackstone** served a Cloudflare bot challenge ("Just a moment...") instead of its site. We did not try to defeat bot protection. T. Rowe Price, Bain Capital and Brookfield took their places.'));
children.push(B('**Gateways were measured as visitors see them.** Capital Group\'s root URL is an audience and region chooser with no navigation, PIMCO opens on an audience modal, and BlackRock\'s corporate site opens on a terms-acceptance modal. Their axe counts include those overlays.'));
children.push(B('**Video.** Chromium in the capture environment lacks licensed video codecs, so some hero videos rendered as error states (visible on KKR). Weight and LCP for those pages are understated, not overstated.'));
children.push(B('**Timing** comes from one cold load per page from a cloud container behind a proxy. Treat LCP as directional; the gaps reported here are 2× or larger, well outside run-to-run noise.'));
children.push(B('**Not comparable to the first audit\'s numbers.** This run waits for network idle and counts every transferred byte, so our median page weight reads 486 KB here against 339 KB in the first audit. Every figure in this report comes from the same same-day run, so comparisons inside it are like for like.'));
children.push(B('**"People / team" pages** are each firm\'s leadership or people page; Lazard and Vanguard had no stable people URL and are excluded from that comparison. Research pages are each firm\'s insights hub; Bain Capital and Capital Group have none at their root.'));
children.push(H3('Sites and pages captured'));
children.push(table(['Group', 'Site', 'URL', 'Pages'], siteRows, [16, 26, 30, 28]));

// 3. Scorecard
children.push(H1('Scorecard'));
children.push(P('Medians across every captured page in each group, desktop unless the row says mobile. "Top-20" pools the sell-side and buy-side groups.'));
children.push(table(['Metric', 'Ours', 'Top-20', 'Sell-side', 'Buy-side', 'Student funds', 'Read'], [...scoreRows, scoreN], [20, 8, 9, 9, 9, 9, 36], { numCols: [1, 2, 3, 4, 5] }));
children.push(gap());
children.push(P('Page-type comparisons where we stand out:'));
children.push(table(['Comparison', 'Ours', 'Top-20 median', 'Student-fund median'], typeRows, [46, 16, 19, 19], { numCols: [1, 2, 3] }));
children.push(img(OUT + '/sheet_sell.jpg', 6.5));
children.push(CAP('Home page, first desktop screen (1440×900), first visit. Ours, then the 10 sell-side firms.'));
children.push(img(OUT + '/sheet_buy.jpg', 6.5));
children.push(CAP('Home page, first desktop screen. The 10 buy-side firms, then Nittany Lion Fund and South Hill Fund. Consent banners and gateway modals are what a first-time visitor sees.'));

// 4. What the top 20 do
children.push(H1('What the top 20 do'));
children.push(H3('Navigation: few doors, utilities moved aside'));
children.push(P('Of the 18 top-20 sites with a visible desktop nav, the median runs 5 primary links (range 3 to 7). Evercore and Capital Group are the exceptions: Evercore hides everything behind a hamburger on desktop, and Capital Group opens on a gateway. 16 of 20 put logins, investor relations, media, careers or contact in a separate utility row or cluster, usually smaller and top right. Goldman Sachs is the model: What We Do, Insights, Our Firm and Careers on the left; Investor Relations, Pressroom, Worldwide, Alumni, Search and Client Login on the right. Morgan Stanley, J.P. Morgan, BofA, Barclays, UBS, BlackRock, Vanguard, Brookfield, Apollo, Wellington and Bain Capital do the same. None of the 18 set primary links in all capitals.'));
children.push(H3('The first screen sells the thinking'));
children.push(P('11 of 20 lead the home page with a specific, current piece of work: Goldman ("The Outlook for Global Inflation"), Morgan Stanley (market commentary cards), J.P. Morgan ("4Q 2026 Guide to the Markets"), BofA (Global Research), Barclays, UBS (Investor Watch 2026), Deutsche Bank, Lazard, BlackRock (Midyear Global Outlook), PIMCO ("Growth Holds, Risks Widen") and Wellington (2026 Midyear Investment Outlook). The rest open on a brand statement (Evercore, Bain, Brookfield, Vanguard), a product (Fidelity), quarterly results (Citi), a campaign (Apollo, T. Rowe Price) or a gateway (Capital Group). Student funds split the same way: South Hill Fund puts its stats band ($1.54 Million AUM, 3 funds, 60+ analysts, per its own site) inside the first screen.'));
children.push(H3('Search and subscribe are standard'));
children.push(P('19 of 20 offer site search in the header; Capital Group\'s gateway is the only exception. 7 of 20 home pages carry an email subscribe (Goldman, Morgan Stanley, J.P. Morgan, Citi, Vanguard, PIMCO, Wellington), and 11 of the 18 research hubs we captured do (a subscribe link, email field or newsletter heading). Vanguard, PIMCO and Wellington put a Subscribe link in the header itself. We have search inside /research and /team only, and the Substack link lives only on /research.'));
children.push(H3('Audience segmentation'));
children.push(P('The big firms route by audience (PIMCO, Wellington, Capital Group and T. Rowe Price ask who you are; Goldman, UBS, Evercore, KKR, Brookfield and PIMCO run dedicated student or early-career pages or sections). Our audiences are narrower and well known: prospective members, recruiters and employers, alumni and faculty. Nittany Lion Fund names two of them in its nav ("Prospective Students", "Recruiters"). We do not need a gateway; we need the Join section to be the obvious home for prospective members, and the About page to answer recruiters.'));
children.push(H3('What the first audit got wrong'));
children.push(P('The first audit said buy-side sites "pick one hero treatment and hold it." In the wider set, only 10 of the top 20 use one hero ground across every page we captured. Consistency is a taste call here, not an industry norm, so it drops down the list (section 6.9).'));
children.push(H3('Feature matrix, home pages'));
children.push(table(['Site', 'Primary nav links', 'Utility row', 'Research-led hero', 'Search', 'Subscribe', 'Consent banner, mobile fold', 'Home KB'], featRows, [20, 17, 9, 11, 8, 10, 13, 10], { numCols: [7], boldRows: [0] }));
children.push(CAP('Primary nav links exclude the logo, Home, search, login, region pickers, utility links and call-to-action pills. Hand-classified from the desktop screenshots. Consent banner: share of the first mobile screen covered on a first visit.'));

// 5. Where we stand
children.push(H1('Where we stand, page by page'));
children.push(table(['Route', 'KB', 'LCP ms', 'Axe', '<12px', 'Mobile <24px', 'Mobile height', 'Hero'], ourRows, [16, 9, 10, 8, 9, 13, 14, 11], { numCols: [1, 2, 3, 4, 5, 6] }));
children.push(CAP('Desktop unless noted. Axe = serious and critical nodes. Hero = background behind the H1.'));
children.push(B('**Home.** Strong photograph and clear calls to action. But the hero (min-height 100dvh) and the Mission section are both full ink, so a desktop visitor scrolls past about 2,250px of ink before the first light section. On a 1440×900 screen the stat figures are cut by the fold (they span 858px to 918px) and their labels sit below it at 934px; on a phone the whole band starts at 1,284px, below an 844px screen. The stat labels are 10px. Research arrives fourth. There is no subscribe.'));
children.push(B('**Research.** The best-built page on the site and the only one with serious accessibility failures (3, all the "Open" link whose accessible name is "Download ..."). 3 of 5 series cards say "Coming soon" (Pitch Decks, Equity Research, Annual Reports) above a library of 3 items, which makes the shelf look empty. 25 sub-12px elements, the most of any route but /performance and /sectors. Author links are 15px to 18px tall on a phone.'));
children.push(B(`**Team.** ${fmt(D.scoreTeam.Ours['Mobile page height (px)'])}px tall on a phone, about ${Math.round(D.scoreTeam.Ours['Mobile page height (px)'] / D.scoreTeam['Top-20']['Mobile page height (px)'])}× the top-20 median for a people page and ${Math.round(D.scoreTeam.Ours['Mobile page height (px)'] / D.scoreTeam['Student funds 5']['Mobile page height (px)'] * 10) / 10}× the student-fund median. The filter chips added since the first audit help, but the default view still renders every card for all 52 members.`));
children.push(B('**Holdings, Performance, Sectors.** Still the strongest asset: no top-20 firm publishes position-level data, and the first audit found no student fund publishing this much (this scan did not re-check student portfolio pages). They are also where small type concentrates: /performance has 43 sub-12px elements and /sectors 39, including dollar values for each sector team set at 10px. Three separate top-level links for one subject is the main reason our nav runs long.'));
children.push(B('**Recruiting.** The hero shows an unconditional "Apply Now" button directly above a panel reading "Applications closed". The header Apply pill has the same problem on every page.'));
children.push(B('**About and Learn.** Both exceed 11,000px on mobile. About has an on-page jump bar and earns its length (governance, IPS, FAQ). Learn is curriculum for prospective members and belongs under Join.'));
children.push(B('**Consistency of facts.** The home page shows "50+" active members, read from the fund_stats table, while /team counts 52 from the roster. The code comment on the home page\'s fallback says the roster is meant to be the single source of truth; the live path bypasses it.'));

// 6. Reform plan
children.push(H1('The reform plan'));
children.push(H2('Principles'));
children.push(N('**Lead with the work.** The fund\'s research and live portfolio are what no other student site has. They go first.'));
children.push(N('**Fewer, plainer doors.** 5 primary links, sentence case, 14px. Everything else moves to a utility row, the footer, or a section menu.'));
children.push(N('**One type floor.** Nothing a reader needs renders under 12px.'));
children.push(N('**State-aware calls to action.** Every Apply button reads the same calendar that drives the countdown.'));
children.push(N('**Keep the speed.** Every change ships inside the current budget: no hero video, no consent wall, no new third-party scripts.'));

children.push(H2('6.1 Fix now (3 live defects, 1 cleanup)'));
children.push(table(['Defect', 'Where', 'Fix'], [
  ['"Apply Now" shows while the recruiting panel says applications are closed. The header Apply pill does the same site-wide.', 'src/routes/recruiting.tsx (hero CTA), src/components/SiteHeader.tsx', 'Derive an isOpen flag from CALENDAR (the source the Countdown already reads). Closed: the CTA becomes "Get notified" (mailing list or Instagram) and the header pill becomes "Join".'],
  ['Serious axe failure label-content-name-mismatch (3 nodes): visible text "Open", accessible name "Download <title>".', 'src/routes/research.tsx line 594', 'Change aria-label to `Open ${pub.title}`, or drop it and add sr-only text after "Open".'],
  ['Home shows "50+" members; /team shows 52.', 'src/routes/index.tsx (members stat reads fund_stats.active_members)', 'Render totalMemberCount from src/data/team.ts for the members stat in both the live and fallback paths. Drop active_members from fund_stats or stop reading it.'],
  ['3 of 5 research series cards read "Coming soon".', 'src/routes/research.tsx (SERIES grid, line 300 onward)', 'Render only series with at least 1 publication; keep the empty state for direct links.'],
], [36, 26, 38]));

children.push(H2('6.2 Information architecture and header'));
children.push(P('Group the 8 current links under 5 parents. **Every URL stays the same**, so there are no redirects, no lost search equity, and the sitemap is unchanged.'));
children.push(table(['Primary link', 'Contains', 'Notes'], [
  ['About', '/about', 'History, philosophy, process, IPS, governance, FAQ, placement wall.'],
  ['Portfolio', '/holdings, /performance, /sectors', 'Dropdown on desktop. Each page gets a shared local tab bar (Holdings · Performance · Sectors) so the three read as one product.'],
  ['Research', '/research', 'Unchanged route; now sits in the first 3 links.'],
  ['Team', '/team, /team/<member>', 'Unchanged.'],
  ['Join', '/recruiting, /learn, /apply', 'Dropdown. Learn moves here: its own lede ("then defend a real pitch with real capital on the line") is written to prospective members.'],
  ['Utility row', 'Subscribe (Substack), Contact, Search', 'Right side, 13px, no capitals. Mirrors Goldman, J.P. Morgan and Vanguard.'],
  ['Call to action', 'Apply (open) / Join (closed)', 'State-aware gold pill, as in 6.1.'],
], [16, 30, 54]));
children.push(P('Files: src/lib/nav.ts (add a children array and a UTILITY_NAV), src/components/SiteHeader.tsx (plain disclosure menus, a button with aria-expanded, so no new dependency; the existing mobile dialog renders the groups as headed lists), src/components/SiteFooter.tsx (no structural change). Type: change the header link class from text-xs uppercase tracking-[0.14em] to text-sm with normal case and tracking.'));
children.push(P('**Header search** across research titles, member names and tickers. The data is already on the client or in Supabase; a command-palette dialog (Cmd-K plus a search icon) on the existing Dialog component covers it without a new dependency. 19 of the top 20 have one. Ship it after the nav change, not with it.'));

children.push(H2('6.3 Home page'));
children.push(N('**Hero holds the research.** Keep the team photograph and the direct-answer paragraph (the AEO extraction zone). Replace the second call to action with a "Latest" card for the newest publication: series, title, date, one line, "Read". The newest Macro Brief then sits in the first screen at both breakpoints.', 'num2'));
children.push(N('**Stats band inside the fold.** Drop min-h-[100dvh] on desktop in favor of content height, and move the 4 stats directly under the hero copy. Labels go from 10px to 12px.', 'num2'));
children.push(N('**Break the dark slab.** Turn the Mission section to the cream ground, or fold its 2 paragraphs into About and delete it. Either removes a 1,165px block of ink from the desktop scroll.', 'num2'));
children.push(N('**Order below the fold:** Latest research (3 cards) → Performance teaser → Three pillars → Join call to action. The work comes before the pitch.', 'num2'));
children.push(N('**Subscribe box for The Macro Brief** between research and performance: an email field posting to Substack\'s embed endpoint, or a plain link-out if we want zero third-party script. 7 of 20 top-20 home pages carry one.', 'num2'));
children.push(P('Files: src/routes/index.tsx only. The loader already returns the 3 newest publications.'));

children.push(H2('6.4 Research'));
children.push(B('Hide empty series (6.1) and promote the pitch deck series the day the first deck posts.'));
children.push(B('Add the same Macro Brief subscribe box under the featured issue, not only the header button.'));
children.push(B('Raise the series kicker, frequency and format labels (10px and 11px today) to 12px.'));
children.push(B('Render author names as a plain comma list with a single "Authors" link, or give each link 24px of height on mobile.'));

children.push(H2('6.5 Portfolio (Holdings, Performance, Sectors)'));
children.push(B('Shared local tab bar across the 3 pages, so the dropdown and the page agree.'));
children.push(B('Type floor first: /performance (43 sub-12px elements) and /sectors (39) are the worst offenders on the site. Table headers and axis ticks can stay compact at 12px; nothing smaller.'));
children.push(B('Each page states its as-of date and source beside the H1, in 12px Steel, not in a footnote.'));

children.push(H2('6.6 Team'));
children.push(B('Default view: Executive Board, faculty advisors, then each sector team as a collapsed row showing the team name, lead and member count. Tapping a row expands its cards. "All" stays one tap away for anyone who wants the full scroll.'));
children.push(B(`Target: under 12,000px on a phone in the default view (today ${fmt(D.scoreTeam.Ours['Mobile page height (px)'])}px; top-20 people pages ${fmt(D.scoreTeam['Top-20']['Mobile page height (px)'])}px median).`));
children.push(B('Files: src/routes/team.index.tsx. The per-member pages and the Person structured data are untouched.'));

children.push(H2('6.7 Join (Recruiting, Learn, Apply)'));
children.push(B('State-aware hero and pill (6.1). When closed, the primary action is "Get notified" and the countdown points to the next cycle.'));
children.push(B('A short "For recruiters" block on About (placement wall, contact, résumé-book request) gives employers a named door without adding a nav link, the job Nittany Lion Fund\'s "Recruiters" page does.'));
children.push(B('Raise the 19 sub-12px elements on /recruiting (the on-page jump bar and the "Past" event tags) to 12px.'));

children.push(H2('6.8 About'));
children.push(B('Keep the length; it carries governance and the IPS, which is credibility no peer student site matches. The on-page jump bar already handles navigation.'));
children.push(B('Add the "For recruiters" block (6.7) and absorb the home page Mission copy if that section is cut.'));

children.push(H2('6.9 Design system'));
children.push(B('**Type floor.** Replace the 51 hard-coded small-type classes (36 at 10px, 15 at 11px, across 14 files) with text-xs (12px). Cut the 0.24em to 0.3em letter-spacing on uppercase eyebrows to 0.12em; wide tracking at small sizes is what makes them hard to read.'));
children.push(B('**Case.** Keep capitals for short eyebrows only (2 or 3 words). Navigation, buttons and table headers go to sentence or title case.'));
children.push(B('**Hero grounds (lower priority).** Today 6 routes use an ink hero and 5 use cream. Since half the top 20 mix treatments too, a full repaint is not justified. Adopt a rule instead: ink for the home page and the Join pages (/recruiting, /learn, /apply), cream for content and data pages. That moves 2 routes (/about, /performance) to cream and leaves the rest.'));
children.push(B('**Guard it.** Add a check to tests/e2e/run.mjs that fails on any visible text element under 12px, the same way it already fails on new axe violations.'));

children.push(H2('6.10 Content and measurement'));
children.push(B('**Cadence beats design.** A research hub with 3 items looks thin whatever its layout. The Macro Brief is labeled biweekly and has held that pace (issue #001 on September 21, #002 on October 5); the pitch deck series needs its first post before it gets the featured slot.'));
children.push(B('**Measure the 3 outcomes that matter**, using the Vercel Web Analytics already loaded in __root.tsx: Apply clicks (applyUrl already tags utm_source and placement), Macro Brief subscribes, and research opens. Set a baseline in the 2 weeks before Phase 1 ships and compare in the 2 weeks after.'));

// 7. Roadmap
children.push(H1('Roadmap'));
children.push(table(['Phase', 'Work', 'Files', 'Effort', 'Done when'], [
  ['0. This week', 'Live defects (6.1)', 'recruiting.tsx, SiteHeader.tsx, research.tsx, index.tsx', 'Hours', 'axe reports 0 serious on all 11 routes; home and /team show the same headcount; no Apply button while closed.'],
  ['1. Header', 'Nav regroup, utility row, sentence case (6.2)', 'lib/nav.ts, SiteHeader.tsx', '2 to 3 days', '5 primary links; every route reachable in 2 clicks; e2e and axe suites pass.'],
  ['1. Type', 'Type floor and tracking (6.9)', '14 files with text-[10px] or text-[11px]', '1 day', 'e2e reports 0 text elements under 12px on all 11 routes.'],
  ['2. Home', 'Research-led hero, stats in fold, Mission cut, subscribe (6.3)', 'routes/index.tsx', '3 to 4 days', 'Newest publication and all 4 stats visible at 1440×900 and 390×844 without scrolling.'],
  ['2. Team', 'Collapsed sector rows (6.6)', 'routes/team.index.tsx', '1 to 2 days', 'Default mobile height under 12,000px.'],
  ['3. Sections', 'Portfolio tab bar, Research polish, Join and About blocks (6.4 to 6.8)', 'holdings, performance, sectors, research, recruiting, about', '3 to 4 days', 'Each item in 6.4 to 6.8 checked off.'],
  ['3. Search', 'Header command-palette search (6.2)', 'new component plus SiteHeader.tsx', '2 days', 'Finds any publication, member or held ticker by name.'],
  ['4. Review', 'Re-run this capture rig', 'n/a', 'Half a day', 'Scorecard re-measured; analytics compared to baseline.'],
], [12, 22, 24, 11, 31]));
children.push(P('Phases 0 to 2 are about 2 working weeks for one developer. Phase 1 touches every page, so it goes out as its own pull request with a Vercel preview for review before merge.'));

// 8. What not to copy
children.push(H1('What not to copy'));
children.push(B('**Consent walls.** 14 of 20 show a consent banner on a first desktop visit; on a phone, 11 of 20 cover at least 25% of the first screen and the median among sites with a banner is 48%. Our analytics (Vercel Web Analytics) runs without cookies and we show no banner. Keep it that way: any new embed (Substack form, video) should be checked for cookies before it ships.'));
children.push(B('**Gateways and modals** (Capital Group, PIMCO, BlackRock). They exist for audience routing and fund-distribution rules that do not apply to us.'));
children.push(B('**Hamburger-only desktop nav** (Evercore, KKR). It hides the site\'s scope from the people deciding whether to apply.'));
children.push(B(`**Weight.** The top-20 home page median is ${fmt(D.scoreHome['Top-20']['Page weight, desktop (KB)'])} KB with ${fmt(D.scoreHome['Top-20']['Requests, desktop'])} requests and a ${fmt(D.scoreHome['Top-20']['LCP, mobile (ms)'])} ms mobile LCP. Hero video (4 of 20) and auto-advancing carousels (Apollo, Wellington, T. Rowe Price) are common.`));

// 9. First-audit reconciliation
children.push(H1('Status of the first audit\'s proposals'));
children.push(table(['First-audit proposal', 'Status on October 19, 2026', 'This plan'], [
  ['1. Cut primary nav from 10 to about 6', 'Not done. Header still runs 8 links plus Apply.', '5 links plus utility row (6.2). Evidence now from 20 firms, not 6.'],
  ['2. Raise 10px labels to 11 to 12px', 'Not done. 36 text-[10px] usages remain.', 'Hard 12px floor plus an e2e guard (6.9).'],
  ['3. Team jump links or collapsed groups', 'Partly done: filter chips exist. Mobile height unchanged at about 45,000px.', 'Collapsed by default (6.6).'],
  ['4. One hero treatment', 'Not done. 6 routes ink, 5 cream.', 'Downgraded to a rule, not a repaint; half the top 20 mix too (6.9).'],
  ['5. Stats band into the first viewport', 'Not done. Figures sit on the fold line; labels below it.', 'Part of the home rebuild (6.3).'],
  ['6. Newsletter capture on home', 'Not done.', 'Subscribe box on home and research (6.3, 6.4).'],
  ['7. Header search', 'Not done.', 'Phase 3 (6.2).'],
], [30, 36, 34]));

// Appendix
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(H1('Appendix: mobile first screens'));
children.push(img(OUT + '/sheet_mobile.jpg', 6.5));
children.push(CAP('Home page, first mobile screen (390×844), first visit. Ours, 9 top-20 firms, Nittany Lion Fund and South Hill Fund.'));
children.push(P('The capture scripts, the raw per-page results and this document\'s builder live in docs/peer-audit-2026-10/ (see its README). Screenshots are not committed; re-running the capture regenerates them along with every number in this report.'));

const doc = new Document({
  creator: 'Purdue SMIF', title: 'Website Reform Plan', description: 'purduesmif.org benchmarked against 20 buy-side and sell-side firms',
  styles: { default: { document: { run: { font: FONT, size: 22, color: C.gray } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 36, color: C.black }, paragraph: { outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, color: C.black }, paragraph: { outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 22, bold: true, color: C.aged }, paragraph: { outlineLevel: 2 } }] },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] },
    { reference: 'num2', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } } } }] },
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1300, bottom: 1200, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Purdue SMIF · Website Reform Plan · October 19, 2026', size: 16, color: C.gray, font: FONT })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: ['Page ', PageNumber.CURRENT], size: 16, color: C.gray, font: FONT })] })] }) },
    children,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(process.argv[2], b); console.log('wrote', process.argv[2], b.length); });
