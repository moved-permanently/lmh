#!/usr/bin/env node
/* eslint-disable no-console */
// Live acceptance check of the delivered catalogue on .aem.network (read-only, anonymous).
import { readFile } from 'node:fs/promises';

const HOST = process.argv[2] || 'https://main--lmh--moved-permanently.aem.network';
const entries = JSON.parse(await readFile(new URL('../out/entries.json', import.meta.url), 'utf8'));
const problems = [];
const get = async (u, init) => {
  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const r = await fetch(u, init).catch(() => null);
    if (r && r.status < 500) return r;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((res) => { setTimeout(res, 1000); });
  }
  return { status: 0, ok: false };
};

const idx = await (await get(`${HOST}/en/catalog/index.json`)).json();
const rows = idx.data;
const expected = entries.length + entries.reduce((n, e) => n + (e.variants?.length ?? 0), 0);
if (idx.total !== rows.length) problems.push(`index total ${idx.total} != rows ${rows.length}`);
if (rows.length !== expected) problems.push(`index rows ${rows.length} != expected ${expected}`);
const skus = new Set(rows.map((r) => r.sku));
if (skus.size !== rows.length) problems.push('duplicate skus in index');
entries.forEach((e) => { if (!skus.has(e.sku)) problems.push(`missing in index: ${e.sku}`); });
rows.filter((r) => !r.parentSku).forEach((r) => {
  if (!Array.isArray(r.categories) || !r.categories.length) problems.push(`${r.sku}: categories not structured`);
});

let checked = 0;
const queue = entries.slice();
async function worker() {
  while (queue.length) {
    const e = queue.shift();
    // eslint-disable-next-line no-await-in-loop
    const [html, json] = await Promise.all([get(`${HOST}${e.path}`), get(`${HOST}${e.path}.json`)]);
    if (html.status !== 200) problems.push(`${e.path} html ${html.status}`);
    if (json.status !== 200) { problems.push(`${e.path}.json ${json.status}`); continue; }
    // eslint-disable-next-line no-await-in-loop
    const d = await json.json();
    for (const img of (d.images ?? []).slice(0, 2)) {
      const u = new URL(img.url, `${HOST}${e.path}`).href;
      // eslint-disable-next-line no-await-in-loop
      const r = await get(u);
      if (r.status !== 200) problems.push(`${e.sku} image ${r.status} ${u}`);
    }
    checked += 1;
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
const relImgs = rows.filter((r) => r.image && !/^https?:/.test(r.image)).length;
console.log(`index rows ${rows.length} (expected ${expected}), products checked ${checked}/${entries.length}, rows with media-bus images ${relImgs}`);
console.log(problems.length ? `PROBLEMS (${problems.length}):\n${problems.join('\n')}` : 'all checks passed');
process.exitCode = problems.length ? 1 : 0;
