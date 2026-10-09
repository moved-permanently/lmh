#!/usr/bin/env node
// prep-analyze.mjs — cross-page aggregation for extract --prep: module candidates (signals 1–4 of
// prep-mode.md § Signal-source priority) and the mechanical tension inputs (brand-review detectors).
// Usage: node prep-analyze.mjs [--pages stardust/current/pages] [--out stardust/current/_prep-analysis.json] [--min 3]
import fs from 'node:fs'; import path from 'node:path';
const a = process.argv.slice(2); const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const dir = opt('--pages', 'stardust/current/pages'); const out = opt('--out', 'stardust/current/_prep-analysis.json'); const MIN = Number(opt('--min', 3));
const recs = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const count = (map, key, slug) => { if (!key) return; const k = String(key).trim(); if (!k) return; const e = map.get(k) || { n: 0, slugs: new Set() }; e.n++; e.slugs.add(slug); map.set(k, e); };
const headings = new Map(), ctas = new Map(), bgs = new Map(), forms = new Map(), alts = new Map(), linkTexts = new Map(), imgHosts = new Map();
let imgTotal = 0, imgEmptyAlt = 0;
for (const r of recs) {
  for (const h of r.headings || []) count(headings, `${h.tag || h.level}|${h.text}`, r.slug);
  for (const c of r.ctas || []) count(ctas, c.label || c.text, r.slug);
  for (const b of r.media?.cssBackgrounds || []) count(bgs, typeof b === 'string' ? b : b.url, r.slug);
  for (const f of r.dynamic?.forms || r.forms || []) count(forms, f.action || f.method || 'form', r.slug);
  for (const i of r.media?.imgs || []) { imgTotal++; const alt = (i.alt || '').trim(); if (!alt) imgEmptyAlt++; else count(alts, alt.toLowerCase(), r.slug); try { count(imgHosts, new URL(i.currentSrc || i.src, r.url).host, r.slug); } catch {} }
  for (const l of r.links || []) if (typeof l === 'object') count(linkTexts, (l.text || '').toLowerCase(), r.slug);
}
const table = (map, min = MIN) => [...map].filter(([, e]) => e.slugs.size >= min).sort((x, y) => y[1].slugs.size - x[1].slugs.size).map(([k, e]) => ({ key: k, pages: e.slugs.size, occurrences: e.n, examples: [...e.slugs].slice(0, 6) }));
const result = {
  _provenance: { writtenBy: 'stardust:extract', writtenAt: new Date().toISOString(), readArtifacts: recs.map((r) => `${dir}/${r.slug}.json`), synthesizedInputs: [] },
  pages: recs.length,
  repeatedHeadings: table(headings),
  repeatedCtas: table(ctas),
  repeatedBackgrounds: table(bgs, 2),
  formActions: table(forms, 1),
  genericAlt: table(new Map([...alts].filter(([k]) => ['logo', 'image', 'picture', 'photo', 'img', 'icon'].includes(k))), 1),
  contentFreeLinks: table(new Map([...linkTexts].filter(([k]) => ['here', 'click here', 'read this', 'more', 'this'].includes(k))), 1),
  images: { total: imgTotal, emptyAlt: imgEmptyAlt, emptyAltShare: imgTotal ? +(imgEmptyAlt / imgTotal).toFixed(2) : 0, hosts: table(imgHosts, 1).slice(0, 8) },
};
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(`prep-analyze: ${recs.length} pages · headings≥${MIN}: ${result.repeatedHeadings.length} · ctas≥${MIN}: ${result.repeatedCtas.length} · bgs≥2: ${result.repeatedBackgrounds.length} · forms: ${result.formActions.length} · images ${imgTotal} (empty alt ${result.images.emptyAltShare}) → ${out}`);
