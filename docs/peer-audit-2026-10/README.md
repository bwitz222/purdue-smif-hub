# Peer audit, October 2026

Source data and scripts behind `docs/2026-10-19_smif-website_reform-plan.docx`.
The site list lives in `sites.json` and the page URLs in `pages.json`.

| File | What it does |
| --- | --- |
| `measure.cjs` | Loads every page in `pages.json` at desktop (1440×900) and mobile (390×844), records weight, LCP, axe-core results, small text, tap targets, header contents and consent-banner coverage, and saves fold and full-page screenshots. Writes `data/merged.jsonl` and `data/shots/`. |
| `structure.cjs` | Records the H1–H3 outline, footer headings and stat-style numbers for each page. Writes `data/structure_merged.jsonl`. |
| `facts.py` | Builds per-site home-page features. The primary-nav counts and research-led-hero calls are hand-classified from the fold screenshots and coded at the top of the file. |
| `build_data.py` | Computes the group medians and writes `data/data.json`. |
| `sheet.py` | Builds the contact-sheet images from `data/shots/`. |
| `build_doc.cjs` | Builds the report from `data/data.json` and the contact sheets. |

## Re-running

From the repository root, after `npm install`:

```bash
cd docs/peer-audit-2026-10
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium node measure.cjs     # ~25 minutes
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium node structure.cjs
python3 facts.py && python3 build_data.py && python3 sheet.py
npm install -g docx   # the report builder's only extra dependency
node build_doc.cjs ../YYYY-MM-DD_smif-website_reform-plan.docx
```

Re-check the hand-coded tables in `facts.py` against the new screenshots before
building: navigation and hero designs change. Sites that block automated
browsers (Carlyle, Citadel and Blackstone in October 2026) were replaced, not
worked around.
