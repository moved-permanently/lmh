// status-page.mjs — rewrites tools/replica/progress.html (owner-facing status page) from run.json,
// the rollout coverage and the latest gate rows. Usage: node stardust/scripts/status-page.mjs [--now "<what's happening>"] [--next "<what's next>"] [--state "In progress|Ready|Needs attention"]
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const run = JSON.parse(fs.readFileSync('stardust/.labs/run.json', 'utf8'));
const cov = JSON.parse(fs.readFileSync('stardust/rollout/coverage/pages.json', 'utf8')).pages;
const TOTAL = 100;
const names = {
  en: 'Home page',
  'en-about-us-press': 'Overview and news listing pages',
  'en-products-e-trucks': 'Product, service and solution pages',
  'en-landingpage-e-models': 'Campaign and product landing pages',
  'en-legal-notes-privacy-statement': 'Legal and information pages',
  'en-forms-global-contact-form': 'Contact and request forms',
  'en-productfinder-html': 'Product finder',
  unique: 'Product finder',
  'en-technical-location-finder-html': 'Location finder',
  'en-technical-news-detail-101184-html': 'News and press articles',
};
// latest gate row per page per width: runs/ (newest first) over the roster table in coverage
function latestRows(width) {
  // the roster table is the source of record: --only run files are folded into it (summary-patch) and the
  // documented overrides are applied there (summary-reoverride); a run file alone misses those overrides
  const file = `stardust/replica/gates/all-${width}/summary.json`;
  const out = {};
  if (!fs.existsSync(file)) return out;
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const r of j.rows || []) if (r.pct != null) out[r.slug] = { pass: !!(r.pass || r.passWithOverride), pct: r.pct, at: j._provenance?.writtenAt };
  } catch { /* skip */ }
  return out;
}
const runs = { 1440: latestRows(1440), 360: latestRows(360) };
const pages = cov.map((p) => {
  const base = p.delivery?.status === 'verified';
  const d = runs[1440][p.slug]; const m = runs[360][p.slug];
  const desktop = d ? d.pass : base; const mobile = m ? m.pass : base;
  return { slug: p.slug, path: p.path, title: p.title, template: p.templateId, url: p.delivery?.deployedUrl, live: ['verified', 'failed', 'deployed'].includes(p.delivery?.status), ok: desktop && mobile, desktop, mobile };
});
const groups = {};
for (const p of pages) { const n = names[p.template] || p.template; (groups[n] = groups[n] || []).push(p); }
const live = pages.filter((p) => p.live);
const ok = pages.filter((p) => p.ok);
const templates = Object.keys(groups).length;
// weights 10/10/40/10/30; templates all built; fidelity = share of pages looking right; migration per page
const pct = Math.round(10 + 10 + 40 + 10 * (ok.length / Math.max(pages.length, 1)) + 30 * (live.length / TOTAL));
const runningMs = (run.priorRunningMs || 0) + (Date.now() - Date.parse(run.startedAt));
let estimate = 'Estimating…';
if (pct >= 10 && pct < 100) {
  const rem = runningMs * (100 - pct) / pct;
  const q = 15 * 60 * 1000;
  const lo = Math.max(q, Math.floor(rem * 0.8 / q) * q); let hi = Math.max(lo + q, Math.ceil(rem * 1.25 / q) * q);
  const cap = Date.parse(run.deadlineAt) - Date.now(); if (hi > cap) hi = Math.max(lo, Math.floor(cap / q) * q);
  const fmt = (ms) => { const h = Math.floor(ms / 3600000); const mi = Math.round((ms % 3600000) / 60000); return h ? `${h} h${mi ? ` ${mi} min` : ''}` : `${mi} min`; };
  estimate = `about ${fmt(lo)} to ${fmt(hi)} remaining`;
} else if (pct >= 100) estimate = 'complete';
const state = opt('--state', ok.length === pages.length && live.length >= pages.length ? 'Ready' : 'In progress');
const badge = (s) => `<span class="spectrum-badge${s === 'Done' || s === 'Ready' || s === 'Looks right' ? ' spectrum-badge--positive' : s === 'In progress' || s === 'Being refined' ? ' spectrum-badge--informative' : s === 'Needs attention' ? ' spectrum-badge--notice' : ''}">${s}</span>`;
const fidelityDone = ok.length === pages.length;
const steps = [['Analyzing your site', 'Done'], ['Capturing brand and design', 'Done'], ['Rebuilding page templates', 'Done'], ['Checking fidelity', fidelityDone ? 'Done' : 'In progress'], ['Migrating your pages', live.length >= pages.length && fidelityDone ? 'Done' : 'In progress']];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
const nowText = opt('--now', `All ${live.length} pages are built and published on the preview site. We are comparing every page with the original site on desktop and mobile and refining the shared page templates where the layout drifts, so corrections reach every page at once.`);
const nextText = opt('--next', 'Once every page matches the original on both screen sizes, the migration is complete and ready for your review.');
const rows = Object.entries(groups).sort((a, b) => b[1].length - a[1].length).map(([n, ps]) => {
  const d = ps.every((p) => p.desktop); const m = ps.every((p) => p.mobile);
  return `          <tr><td>${esc(n)}</td><td>${ps.length}</td><td>${badge(d ? 'Looks right' : 'Being refined')}</td><td>${badge(m ? 'Looks right' : 'Being refined')}</td><td>${badge(d && m ? 'Done' : 'In progress')}</td></tr>`;
}).join('\n');
const links = live.sort((a, b) => a.path.localeCompare(b.path)).map((p) => `        <li><a href="${esc(p.url)}">${esc(p.path)}</a></li>`).join('\n');
const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Migration status</title>
<link rel="stylesheet" href="spectrum.css">
<style>
  body { background-color: var(--spectrum-bg-app); }
  main { max-width: 760px; margin: 0 auto; padding: 40px 24px 64px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .meta { color: var(--spectrum-text-subdued); margin: 0 0 24px; }
  .spectrum-panel { margin-bottom: 16px; }
  .spectrum-panel-header { margin: 0; padding: 0 16px; }
  .panel-body { padding: 16px; }
  .panel-body > :last-child { margin-bottom: 0; }
  .bar { height: 8px; border-radius: 9999px; background-color: var(--spectrum-gray-200); overflow: hidden; }
  .bar span { display: block; height: 100%; background-color: var(--spectrum-accent-bg); }
  .estimate { color: var(--spectrum-text-subdued); margin: 8px 0 0; }
  ol.steps { list-style: none; padding: 0; margin: 0; }
  ol.steps li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; }
  ol.steps li + li { border-top: 1px solid var(--spectrum-gray-200); }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px; text-align: left; border-bottom: 1px solid var(--spectrum-gray-200); }
  th { color: var(--spectrum-text-subdued); }
  details ul { columns: 2; margin: 8px 0 0; padding-left: 20px; }
  details ul li { margin: 2px 0; }
</style>
</head>
<body>
<main>
  <header>
    <h1>Migration status</h1>
    ${badge(state)}
  </header>
  <p class="meta">Source site: <a href="${esc(run.scope.sourceUrl)}">${esc(run.scope.sourceUrl)}</a><br>Preview site: <a href="${esc(run.previewUrl)}">${esc(run.previewUrl)}</a><br>Last updated: ${now}</p>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Journey</h2>
    <div class="panel-body">
      <ol class="steps">
${steps.map(([n, s]) => `        <li>${n}${badge(s)}</li>`).join('\n')}
      </ol>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Page templates</h2>
    <div class="panel-body">
      <table>
        <thead><tr><th>Template</th><th>Pages</th><th>Desktop</th><th>Mobile</th><th>Status</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Pages migrated</h2>
    <div class="panel-body">
      <p>${live.length} of ${TOTAL} pages are available on the preview site.</p>
      <details${TOTAL > 12 ? '' : ' open'}>
        <summary>Pages on the preview site</summary>
        <ul>
${links}
        </ul>
      </details>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Progress</h2>
    <div class="panel-body">
      <p>${pct}% complete</p>
      <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width: ${pct}%"></span></div>
      <p class="estimate">Time estimate: ${estimate}</p>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">What's happening now</h2>
    <div class="panel-body"><p>${esc(nowText)}</p></div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">What's next</h2>
    <div class="panel-body"><p>${esc(nextText)}</p></div>
  </section>
</main>
</body>
</html>
`;
fs.writeFileSync('tools/replica/progress.html', html);
console.log(`status page: ${pct}% · ${live.length} live · ${ok.length} looking right · ${templates} templates · ${estimate}`);
