#!/usr/bin/env node
// gate-state.mjs — derive the state file gate-all.mjs --stage published selects from:
// coverage rows with delivery.status deployed|verified → { slug, url, title, type, template,
// status: 'deployed', liveUrl }. state.json itself is never edited (its machine has no 'deployed').
// Usage: node stardust/scripts/stardust/gate-state.mjs [--coverage stardust/rollout/coverage/pages.json]
//        [--state stardust/state.json] [--host main--96d6da00--aemcoder.aem.live] [--preview]
//        [--out stardust/rollout/gate-state.json]     --help prints this and exits.
import { readFileSync, writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
if (args.includes('--help')) { console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 7).join('\n')); process.exit(0); }
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const cov = JSON.parse(readFileSync(flag('--coverage', 'stardust/rollout/coverage/pages.json'), 'utf8'));
const st = JSON.parse(readFileSync(flag('--state', 'stardust/state.json'), 'utf8'));
const host = flag('--host', 'main--96d6da00--aemcoder.aem.live');
const out = flag('--out', 'stardust/rollout/gate-state.json');
const bySlug = Object.fromEntries((st.pages || []).map((p) => [p.slug, p]));
const pages = (cov.pages || []).filter((r) => ['deployed', 'verified'].includes(r.delivery?.status)).map((r) => {
  const s = bySlug[r.slug] || {};
  return { slug: r.slug, url: s.url || null, title: r.title, type: r.type || s.type, template: r.templateId, status: 'deployed', liveUrl: `https://${host}${r.path}` };
}).filter((p) => p.url);
writeFileSync(out, `${JSON.stringify({ _provenance: { writtenBy: 'gate-state.mjs', derivedFrom: 'coverage/pages.json', at: new Date().toISOString() }, pages }, null, 2)}\n`);
console.log(`gate-state: ${pages.length} deployed page(s) → ${out}`);
