#!/usr/bin/env node
/* eslint-disable no-console */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { INDEX_PROPERTIES } from '../src/config.js';
import { mapModel } from '../src/map-model.js';
import { mapShopProduct } from '../src/map-shop.js';
import { readFinder, readShop } from '../src/sources.js';
import { validateEntries } from '../src/validate.js';
import { toIndexSheet } from '../src/index-sheet.js';
import { upsert } from '../src/client.js';

const { values: opts } = parseArgs({
  options: {
    'from-cache': { type: 'boolean' },
    live: { type: 'boolean' },
    only: { type: 'string' }, // models | shop
    help: { type: 'boolean' },
  },
});
if (opts.help) {
  console.log('node bin/import.js [--from-cache] [--only models|shop] [--live]\nDry run by default: writes cache/ and out/; --live upserts to moved-permanently/lmh (PRODUCTBUS_TOKEN).');
  process.exit(0);
}

const here = new URL('..', import.meta.url);
const file = (p) => new URL(p, here);
await mkdir(file('cache/'), { recursive: true });
await mkdir(file('out/products/'), { recursive: true });

async function cached(name, read) {
  if (opts['from-cache']) return JSON.parse(await readFile(file(`cache/${name}.json`), 'utf8'));
  const data = await read();
  await writeFile(file(`cache/${name}.json`), JSON.stringify(data, null, 1));
  return data;
}

const want = (k) => !opts.only || opts.only === k;
const models = want('models') ? await cached('finder-en', () => readFinder()) : [];
const shop = want('shop') ? await cached('shop-gb', () => readShop()) : [];
const entries = [...models.map(mapModel), ...shop.map(mapShopProduct)];
const { errors } = validateEntries(entries);

await writeFile(file('out/entries.json'), JSON.stringify(entries, null, 1));
await writeFile(file('out/index.json'), JSON.stringify(toIndexSheet(entries, INDEX_PROPERTIES), null, 1));
await Promise.all(entries.map((e) => writeFile(file(`out/products/${e.path.split('/').slice(3).join('-')}.json`), JSON.stringify(e, null, 1))));

const variants = entries.reduce((n, e) => n + (e.variants?.length ?? 0), 0);
console.log(`models ${models.length}, shop ${shop.length}, entries ${entries.length}, variants ${variants}`);
if (errors.length) {
  console.error(`${errors.length} validation errors:\n${errors.join('\n')}`);
  process.exit(1);
}
console.log('valid');

if (opts.live) {
  const results = await upsert(entries, { token: process.env.PRODUCTBUS_TOKEN });
  const changed = results.filter((r) => r.etag).length;
  console.log(`upserted ${results.length}: ${changed} written, ${results.length - changed} unchanged`);
  await writeFile(file('out/upsert-results.json'), JSON.stringify(results, null, 1));
} else {
  console.log('dry run: nothing sent (use --live)');
}
