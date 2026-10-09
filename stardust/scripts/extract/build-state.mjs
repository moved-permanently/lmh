#!/usr/bin/env node
// build-state.mjs — create/refresh stardust/state.json from the captured page records (extract --prep).
// Usage: node build-state.mjs --origin <url> --plan stardust/.labs/site-plan.pages --types stardust/current/_page-types.json [--total-discovered N]
import fs from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const origin = opt('--origin'); const planFile = opt('--plan'); const typesFile = opt('--types');
const totalDiscovered = Number(opt('--total-discovered', 0));
if (!origin || !planFile || !typesFile) { console.error('usage: --origin <url> --plan <file> --types <json> [--total-discovered N]'); process.exit(2); }
const plan = fs.readFileSync(planFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const rules = JSON.parse(fs.readFileSync(typesFile, 'utf8')); // [{ "match": "<regex on path>", "type": "..." }], first wins; "overrides": { slug: type }
const dir = 'stardust/current/pages';
const now = new Date().toISOString();
const version = '0.27.0';
const existing = fs.existsSync('stardust/state.json') ? JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')) : null;
const prevPages = new Map((existing?.pages || []).map((p) => [p.slug, p]));
const typeFor = (slug, url) => {
  if (rules.overrides?.[slug]) return rules.overrides[slug];
  const p = new URL(url).pathname;
  for (const r of rules.rules) if (new RegExp(r.match, 'i').test(p)) return r.type;
  return 'unique';
};
const pages = [];
const skipped = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const rec = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const inPlan = plan.some((u) => u.replace(/\/$/, '') === rec.url.replace(/\/$/, ''));
  if (!inPlan) { skipped.push(rec.slug); continue; }
  const pv = rec._provenance || {};
  const ok = pv.renderedBy === 'playwright' && pv.fetchedAt && pv.waitMs > 0 && pv.waitMode && pv.httpStatus >= 200 && pv.httpStatus < 400;
  if (!ok) { skipped.push(`${rec.slug} (provenance)`); continue; }
  const prev = prevPages.get(rec.slug);
  pages.push(prev ? { ...prev, type: typeFor(rec.slug, rec.url), title: rec.title } : {
    slug: rec.slug, url: rec.url, title: rec.title, type: typeFor(rec.slug, rec.url), status: 'extracted',
    history: [{ status: 'extracted', at: pv.fetchedAt }], stale: false, staleReason: null,
    currentStatePath: `stardust/current/pages/${rec.slug}.json`, prototypePath: null, migratedPath: null,
  });
}
const crawlLog = fs.existsSync('stardust/current/_crawl-log.json') ? JSON.parse(fs.readFileSync('stardust/current/_crawl-log.json', 'utf8')) : {};
const state = {
  _provenance: { writtenBy: 'stardust:extract', writtenAt: now, stardustVersion: version },
  site: { originUrl: origin, deployUrl: existing?.site?.deployUrl ?? null, extractedAt: now, pageCap: plan.length, totalDiscovered, crawled: pages.length,
    ...(crawlLog.captureGaps?.roots ? { captureGaps: crawlLog.captureGaps.roots } : {}) },
  direction: existing?.direction ?? null,
  handsOff: true,
  flow: existing?.flow ?? 'replica', flowChosenAt: existing?.flowChosenAt ?? now, flowSource: existing?.flowSource ?? 'user-phrase',
  pages,
};
fs.writeFileSync('stardust/state.json', JSON.stringify(state, null, 2) + '\n');
const byType = {}; for (const p of pages) byType[p.type] = (byType[p.type] || 0) + 1;
console.log(`state.json: ${pages.length} pages · types ${JSON.stringify(byType)}${skipped.length ? ` · skipped ${skipped.join(', ')}` : ''}`);
