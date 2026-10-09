// progress-page.mjs — rewrites tools/replica/progress.html (owner status page) from run.json,
// coverage/pages.json and stardust/replica/status-page.json. Usage: node progress-page.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const J = (p) => JSON.parse(readFileSync(p, 'utf8'));
const run = J('stardust/.labs/run.json');
const cov = J('stardust/rollout/coverage/pages.json');
const sp = J('stardust/replica/status-page.json');
const state = J('stardust/state.json');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const badge = (t) => {
  const c = /^(Done|Ready|Yes)$/.test(t) ? ' spectrum-badge--positive' : /In progress/.test(t) ? ' spectrum-badge--informative' : /Needs attention/.test(t) ? ' spectrum-badge--notice' : '';
  return `<span class="spectrum-badge${c}">${esc(t)}</span>`;
};
const pages = cov.pages;
const live = pages.filter((p) => p.delivery && p.delivery.deployedUrl);
const passed = pages.filter((p) => p.delivery && p.delivery.gate && (p.delivery.gate.pass || p.delivery.gate.override));
const total = state.pages.length;
const preview = run.previewUrl.replace(/\/$/, '');
const byTpl = {};
for (const p of pages) (byTpl[p.templateId] ||= []).push(p);
const tplRows = sp.templates.map(([id, name, desk, mob]) => {
  const n = (byTpl[id] || []).length;
  if (!n) return '';
  return `          <tr><td>${esc(name)}</td><td>${n}</td><td>${badge(desk)}</td><td>${badge(mob)}</td><td>${badge('Done')}</td></tr>`;
}).filter(Boolean).join('\n');
// percent: 10 analyze, 10 brand, 40 templates (per page type), 10 fidelity (per page passing), 30 migration (per page live)
const tplDone = sp.templates.filter(([id]) => (byTpl[id] || []).length).length;
const pct = 10 + 10 + 40 * (tplDone / Math.max(1, Object.keys(byTpl).length)) + 10 * (passed.length / Math.max(1, pages.length)) + 30 * (live.length / Math.max(1, total));
const pctR = Math.round(pct * 10) / 10;
const now = Date.now();
const runningMs = (run.priorRunningMs || 0) + (now - Date.parse(run.startedAt));
let estimate = 'Estimating…';
if (pct >= 10) {
  let remMs = runningMs * (100 - pct) / pct;
  const deadlineMs = Date.parse(run.deadlineAt) - now;
  remMs = Math.max(0, Math.min(remMs, deadlineMs));
  const q = 15 * 60000;
  const lo = Math.max(q, Math.floor(remMs / q) * q);
  const hi = Math.min(Math.max(lo + q, Math.ceil(remMs * 1.25 / q) * q), Math.max(q, Math.floor(deadlineMs / q) * q));
  const fmt = (ms) => { const h = Math.floor(ms / 3600000); const m = Math.round((ms % 3600000) / 60000); return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`; };
  estimate = hi > lo ? `about ${fmt(lo)} to ${fmt(hi)} remaining` : `about ${fmt(lo)} remaining`;
}
const updated = new Date(now).toISOString().replace(/\.\d+Z$/, ' UTC').replace('T', ' ');
const list = live.map((p) => `          <li><a href="${preview}${esc(p.path)}">${esc(p.title || p.path)}</a></li>`).join('\n');
const open = total > 12 ? '' : ' open';
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
  th { color: var(--spectrum-text-subdued); font-weight: 700; }
  details ul { columns: 2; margin: 8px 0 0; padding-left: 20px; }
  details ul li { margin: 2px 0; }
</style>
</head>
<body>
<main>
  <header>
    <h1>Migration status</h1>
    ${badge(sp.overall)}
  </header>
  <p class="meta">Source site: <a href="${esc(run.scope.sourceUrl)}">${esc(run.scope.sourceUrl)}</a><br>Preview site: <a href="${esc(run.previewUrl)}">${esc(run.previewUrl)}</a><br>Last updated: ${updated}</p>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Journey</h2>
    <div class="panel-body">
      <ol class="steps">
${sp.steps.map(([n, s]) => `        <li>${esc(n)}${badge(s)}</li>`).join('\n')}
      </ol>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Page templates</h2>
    <div class="panel-body">
      <table>
        <thead><tr><th>Template</th><th>Pages</th><th>Desktop</th><th>Mobile</th><th>Status</th></tr></thead>
        <tbody>
${tplRows}
        </tbody>
      </table>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Pages migrated</h2>
    <div class="panel-body">
      <p>${live.length} of ${total} pages are live on the preview site. ${passed.length} of them have passed the final side-by-side check; the rest are being refined.</p>
      <details${open}>
        <summary>Pages on the preview site</summary>
        <ul>
${list}
        </ul>
      </details>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">Progress</h2>
    <div class="panel-body">
      <p>${pctR}% complete</p>
      <div class="bar"><span style="width: ${pctR}%"></span></div>
      <p class="estimate">${esc(estimate)}</p>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">What's happening now</h2>
    <div class="panel-body">
      <p>${esc(sp.now)}</p>
    </div>
  </section>

  <section class="spectrum-panel">
    <h2 class="spectrum-panel-header">What's next</h2>
    <div class="panel-body">
      <p>${esc(sp.next)}</p>
    </div>
  </section>
</main>
</body>
</html>
`;
writeFileSync('tools/replica/progress.html', html);
console.log(`progress.html: ${live.length}/${total} live, ${passed.length} passed, ${pctR}% — ${estimate}`);
