/* eslint-disable max-len -- test data and expectations read better on one line */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DEFAULT_ORIGIN,
  catalogOrigin,
  isFixtureMode,
  fixtureUrl,
  catalogSources,
  fetchCompleteIndex,
  loadIndex,
  resetCatalogCache,
  normalizeRow,
  getBySku,
  getByCategory,
  getProduct,
  findBySku,
  membersOf,
  categoryInfo,
  parseReference,
  formatPrice,
  imageUrl,
  cardModel,
} from '../../scripts/catalog.js';

const fixture = JSON.parse(readFileSync(new URL('../fixtures/catalog/index.json', import.meta.url)));
let normalized;
const rows = () => { normalized = normalized || fixture.data.map(normalizeRow); return normalized; };
const bySku = (sku) => rows().find((r) => r.sku === sku);

const loc = (href) => new URL(href);
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});

/** a fetch stub serving `sheet` in pages of `limit`, recording the requested URLs */
function pagedFetch(sheet, limit, tamper = (page) => page) {
  const calls = [];
  const impl = async (url) => {
    calls.push(String(url));
    const u = new URL(url, 'https://x.invalid');
    const offset = Number(u.searchParams.get('offset') || 0);
    const lim = Number(u.searchParams.get('limit') || limit);
    const page = {
      ':type': 'sheet', total: sheet.data.length, offset, limit: lim, columns: sheet.columns, data: sheet.data.slice(offset, offset + lim),
    };
    return json(tamper(page, offset));
  };
  return { impl, calls };
}

describe('origin and sources', () => {
  test('same origin on .aem.network, the main network origin everywhere else', () => {
    assert.equal(catalogOrigin(loc('https://catalog-blocks--lmh--moved-permanently.aem.network/en/')), 'https://catalog-blocks--lmh--moved-permanently.aem.network');
    assert.equal(catalogOrigin(loc('https://main--lmh--moved-permanently.aem.page/en/')), DEFAULT_ORIGIN);
    assert.equal(catalogOrigin(loc('http://localhost:3000/en/')), DEFAULT_ORIGIN);
    assert.equal(catalogOrigin(undefined), DEFAULT_ORIGIN);
    assert.equal(DEFAULT_ORIGIN, 'https://main--lmh--moved-permanently.aem.network');
  });

  test('fixture mode only on localhost with ?catalog=fixture', () => {
    assert.equal(isFixtureMode(loc('http://localhost:3000/en/?catalog=fixture')), true);
    assert.equal(isFixtureMode(loc('http://127.0.0.1:3000/en/?catalog=fixture')), true);
    assert.equal(isFixtureMode(loc('http://localhost:3000/en/')), false);
    assert.equal(isFixtureMode(loc('https://main--lmh--moved-permanently.aem.page/en/?catalog=fixture')), false);
    assert.equal(isFixtureMode(loc('https://main--lmh--moved-permanently.aem.network/en/?catalog=fixture')), false);
  });

  test('fixture files are named after the catalogue path', () => {
    assert.equal(fixtureUrl('/en/catalog/index'), '/test/fixtures/catalog/index.json');
    assert.equal(fixtureUrl('/en/catalog/models/e10'), '/test/fixtures/catalog/models-e10.json');
    assert.equal(fixtureUrl('/en/catalog/shop/ln-t14b-gb'), '/test/fixtures/catalog/shop-ln-t14b-gb.json');
  });

  test('sources: live index + product JSON on the catalogue origin, fixtures on localhost', () => {
    const live = catalogSources(loc('https://main--lmh--moved-permanently.aem.page/en/'));
    assert.equal(live.indexUrl, `${DEFAULT_ORIGIN}/en/catalog/index.json`);
    assert.equal(live.productUrl('/en/catalog/models/e10'), `${DEFAULT_ORIGIN}/en/catalog/models/e10.json`);
    assert.equal(live.fixture, false);
    const dev = catalogSources(loc('http://localhost:3000/en/?catalog=fixture'));
    assert.equal(dev.indexUrl, '/test/fixtures/catalog/index.json');
    assert.equal(dev.productUrl('/en/catalog/models/e10'), '/test/fixtures/catalog/models-e10.json');
    assert.equal(dev.fixture, true);
    // images keep resolving against the catalogue origin in fixture mode
    assert.equal(dev.imageBase, DEFAULT_ORIGIN);
  });
});

describe('complete index', () => {
  test('a single complete page is returned as is', async () => {
    const { impl, calls } = pagedFetch(fixture, 1000);
    const data = await fetchCompleteIndex('https://o.example/en/catalog/index.json', impl);
    assert.equal(data.length, 198);
    assert.equal(calls.length, 1);
  });

  test('pages with offset/limit until total is reached, in order', async () => {
    const { impl, calls } = pagedFetch(fixture, 50);
    const data = await fetchCompleteIndex('https://o.example/en/catalog/index.json', impl);
    assert.equal(data.length, 198);
    assert.deepEqual(data.map((r) => r.sku), fixture.data.map((r) => r.sku));
    assert.equal(calls.length, 4);
    assert.match(calls[1], /offset=50/);
    assert.match(calls[1], /limit=50/);
    assert.match(calls[3], /offset=150/);
  });

  test('a short page before total fails visibly', async () => {
    const { impl } = pagedFetch(fixture, 50, (page, offset) => (offset === 50 ? { ...page, data: page.data.slice(0, 10) } : page));
    await assert.rejects(fetchCompleteIndex('https://o.example/en/catalog/index.json', impl), /short page/i);
  });

  test('an empty page before total fails visibly (no endless loop)', async () => {
    const { impl } = pagedFetch(fixture, 50, (page, offset) => (offset >= 100 ? { ...page, data: [] } : page));
    await assert.rejects(fetchCompleteIndex('https://o.example/en/catalog/index.json', impl), /short page/i);
  });

  test('a duplicate row across pages fails visibly', async () => {
    const { impl } = pagedFetch(fixture, 50, (page, offset) => (offset === 50 ? { ...page, data: [fixture.data[0], ...page.data.slice(1)] } : page));
    await assert.rejects(fetchCompleteIndex('https://o.example/en/catalog/index.json', impl), /duplicate/i);
  });

  test('HTTP errors and non-sheet bodies fail visibly', async () => {
    await assert.rejects(fetchCompleteIndex('https://o.example/x.json', async () => json({}, 404)), /404/);
    await assert.rejects(fetchCompleteIndex('https://o.example/x.json', async () => json({ hello: 1 })), /sheet/i);
  });

  test('loadIndex is memoized per index URL and exposes lookups', async () => {
    resetCatalogCache();
    const { impl, calls } = pagedFetch(fixture, 1000);
    const opts = { fetch: impl, location: loc('https://main--lmh--moved-permanently.aem.page/en/') };
    const [a, b] = await Promise.all([loadIndex(opts), loadIndex(opts)]);
    assert.equal(a, b);
    assert.equal(calls.length, 1);
    assert.equal(a.rows.length, 198);
    assert.equal(a.bySku.get('LN-T14B-GB').name, 'T14 B Electric Pallet Truck (1400kg)');
  });

  test('a failed load is not cached (the next call retries)', async () => {
    resetCatalogCache();
    let n = 0;
    const flaky = async (url) => { n += 1; return n === 1 ? json({}, 503) : pagedFetch(fixture, 1000).impl(url); };
    const opts = { fetch: flaky, location: loc('https://main--lmh--moved-permanently.aem.page/en/') };
    await assert.rejects(loadIndex(opts), /503/);
    const idx = await loadIndex(opts);
    assert.equal(idx.rows.length, 198);
  });
});

describe('row normalisation', () => {
  test('JSON-encoded cells, numeric and boolean strings are decoded', () => {
    const r = normalizeRow({
      sku: 'X', categories: '[{"id":"model:2375","name":"Pallet Trucks"}]', productType: '{"id":"2375","name":"Pallet Trucks"}', capacityKg: '{"min":1000,"max":2000}', driveTypes: '["Li-Ion"]', sortWeight: '402', explosionProof: 'true', applications: 'Areas of application: production',
    });
    assert.deepEqual(r.categories, [{ id: 'model:2375', name: 'Pallet Trucks' }]);
    assert.equal(r.productType.name, 'Pallet Trucks');
    assert.deepEqual(r.capacityKg, { min: 1000, max: 2000 });
    assert.deepEqual(r.driveTypes, ['Li-Ion']);
    assert.equal(r.sortWeight, 402);
    assert.equal(r.explosionProof, true);
    // shop rows carry free text instead of the {id,name} list: kept apart, never a facet value
    assert.deepEqual(r.applications, []);
    assert.equal(r.applicationsText, 'Areas of application: production');
  });

  test('missing list cells become empty lists', () => {
    const r = normalizeRow({ sku: 'Y' });
    assert.deepEqual(r.categories, []);
    assert.deepEqual(r.driveTypes, []);
    assert.deepEqual(r.applications, []);
    assert.equal(r.explosionProof, false);
    assert.equal(r.sortWeight, 0);
  });
});

describe('lookups', () => {
  test('SKU lookup is exact first, then case-insensitive', () => {
    assert.equal(findBySku(rows(), 'p_e10_8917-01').name, 'E10');
    assert.equal(findBySku(rows(), 'ln-t14b-gb').sku, 'LN-T14B-GB');
    assert.equal(findBySku(rows(), 'nope'), undefined);
  });

  test('a variant SKU resolves to its own name/link on the parent product page', () => {
    const v = findBySku(rows(), 'LN-M20-001');
    assert.equal(v.sku, 'LN-M20-001');
    assert.equal(v.path, '/en/catalog/shop/ln-m20');
    assert.equal(v.kind, 'shop');
    assert.match(v.name, /540mm x 1000mm/);
    assert.equal(v.sourceUrl, 'https://www.linde-mh.shop/en-gb/p/linde-pallet-trucks/LN-M20?variant=LN-M20-001');
  });

  test('model category members: sortWeight desc then name, models only', () => {
    const m = membersOf(rows(), 'model:2375');
    assert.equal(m.length, 15);
    assert.deepEqual(m.slice(0, 3).map((r) => r.name), ['M10 X/XE', 'MT15 C', 'M25']);
    assert.ok(m.every((r) => r.kind === 'model'));
    assert.equal(membersOf(rows(), 'model:2374').length, 18);
  });

  test('shop category members: by name, variant rows excluded', () => {
    assert.deepEqual(membersOf(rows(), 'shop:low_lift_pallet_trucks').map((r) => r.sku), ['LN-MT15-C', 'LN-T14B-GB', 'LN-T16']);
  });

  test('ties in sortWeight fall back to name', () => {
    const tie = [
      {
        sku: 'b', name: 'B', kind: 'model', sortWeight: 5, categories: [{ id: 'model:1' }],
      },
      {
        sku: 'a', name: 'A', kind: 'model', sortWeight: 5, categories: [{ id: 'model:1' }],
      },
      {
        sku: 'c', name: 'C', kind: 'model', sortWeight: 9, categories: [{ id: 'model:1' }],
      },
    ];
    assert.deepEqual(membersOf(tie, 'model:1').map((r) => r.sku), ['c', 'a', 'b']);
  });

  test('unknown category: no members, no info', () => {
    assert.deepEqual(membersOf(rows(), 'model:9999'), []);
    assert.equal(categoryInfo(rows(), 'model:9999'), null);
  });

  test('category info comes from the rows (name, kind, url)', () => {
    assert.deepEqual(categoryInfo(rows(), 'model:2375'), {
      id: 'model:2375', name: 'Pallet Trucks', kind: 'model-type', url: undefined,
    });
    assert.equal(categoryInfo(rows(), 'shop:stackers').url, 'https://www.linde-mh.shop/en-gb/c/stackers');
  });

  test('getBySku / getByCategory work on the loaded index', async () => {
    resetCatalogCache();
    const opts = { fetch: pagedFetch(fixture, 1000).impl, location: loc('https://main--lmh--moved-permanently.aem.page/en/') };
    assert.equal((await getBySku('LN-ML10', opts)).name, 'ML10 Electric Pallet Stacker (1000Kg)');
    assert.equal(await getBySku('nope', opts), undefined);
    const cat = await getByCategory('model:2374', opts);
    assert.equal(cat.category.name, 'Pallet Stackers');
    assert.equal(cat.items.length, 18);
    assert.equal(await getByCategory('model:9999', opts), null);
  });

  test('getProduct fetches {path}.json from the catalogue origin', async () => {
    resetCatalogCache();
    const detail = JSON.parse(readFileSync(new URL('../fixtures/catalog/models-e10.json', import.meta.url)));
    const seen = [];
    const impl = async (url) => { seen.push(String(url)); return json(detail); };
    const p = await getProduct('/en/catalog/models/e10', { fetch: impl, location: loc('https://main--lmh--moved-permanently.aem.page/en/') });
    assert.equal(p.sku, 'p_e10_8917-01');
    assert.deepEqual(seen, [`${DEFAULT_ORIGIN}/en/catalog/models/e10.json`]);
  });
});

describe('references', () => {
  test('SKUs and typed category ids', () => {
    assert.deepEqual(parseReference(' p_e10_8917-01 '), { type: 'sku', id: 'p_e10_8917-01' });
    assert.deepEqual(parseReference('LN-T14B-GB'), { type: 'sku', id: 'LN-T14B-GB' });
    assert.deepEqual(parseReference('model:2375'), { type: 'category', id: 'model:2375' });
    assert.deepEqual(parseReference('Model:2375'), { type: 'category', id: 'model:2375' });
    assert.deepEqual(parseReference('shop:low_lift_pallet_trucks'), { type: 'category', id: 'shop:low_lift_pallet_trucks' });
  });

  test('anything else is not a reference', () => {
    assert.equal(parseReference(''), null);
    assert.equal(parseReference(null), null);
    assert.equal(parseReference('two words'), null);
    assert.equal(parseReference('model:'), null);
    assert.equal(parseReference('color:red'), null);
  });
});

describe('prices', () => {
  test('models never carry a price', () => {
    assert.equal(formatPrice(bySku('p_e10_8917-01')), null);
    assert.equal(formatPrice({ kind: 'model', price: '10.00', pricePolicy: { type: 'FROM', net: true, onRequest: false } }), null);
  });

  test('from-price, net, struck regular price (LN-T14B-GB)', () => {
    assert.deepEqual(formatPrice(bySku('LN-T14B-GB')), {
      onRequest: false, prefix: 'from ', amount: '£1,950.00', suffix: 'excl. VAT', regular: '£2,100.00', text: 'from £1,950.00 excl. VAT',
    });
  });

  test('on request wins over any number', () => {
    assert.deepEqual(formatPrice(bySku('LN-M20')), { onRequest: true, text: 'Price on request' });
    const withNumber = {
      kind: 'shop', price: '999.00', currency: 'GBP', pricePolicy: { type: 'FROM', net: true, onRequest: true },
    };
    assert.deepEqual(formatPrice(withNumber), { onRequest: true, text: 'Price on request' });
  });

  test('regular price only when greater; no prefix/suffix unless the policy says so', () => {
    const p = formatPrice({
      kind: 'shop', price: '100', regularPrice: '100', currency: 'GBP', pricePolicy: { net: false, onRequest: false },
    });
    assert.deepEqual(p, {
      onRequest: false, prefix: '', amount: '£100.00', suffix: '', regular: null, text: '£100.00',
    });
    assert.equal(formatPrice({
      kind: 'shop', price: '100', regularPrice: '90', pricePolicy: { onRequest: false },
    }).regular, null);
  });

  test('no price and not on request: nothing to show', () => {
    assert.equal(formatPrice({ kind: 'shop', pricePolicy: { onRequest: false } }), null);
    assert.equal(formatPrice({ kind: 'shop' }), null);
  });
});

describe('images', () => {
  test('absolute URLs pass through, relative ones resolve against origin + path', () => {
    assert.equal(imageUrl(bySku('LN-T14B-GB'), DEFAULT_ORIGIN), 'https://www.linde-mh.shop/images/LMH-GB-NTS/products/BR1132_T14B-Facelift_0001.png');
    assert.equal(
      imageUrl({ path: '/en/catalog/models/a', image: './media_5e86d1.png' }, DEFAULT_ORIGIN),
      `${DEFAULT_ORIGIN}/en/catalog/models/media_5e86d1.png`,
    );
    assert.equal(imageUrl({ path: '/en/catalog/models/a' }, DEFAULT_ORIGIN), null);
  });
});

describe('card model', () => {
  test('model card: type eyebrow, capacity and lift height facts, product page link, no price', () => {
    const c = cardModel(bySku('p_e10_8917-01'), DEFAULT_ORIGIN);
    assert.equal(c.href, '/en/catalog/models/e10');
    assert.equal(c.name, 'E10');
    assert.equal(c.eyebrow, 'Electric Forklifts');
    assert.deepEqual(c.facts, [
      { key: 'loadcapacity', label: 'Load capacity', value: '1,000 kg' },
      { key: 'height', label: 'Lift height', value: '5,400 mm' },
    ]);
    assert.equal(c.price, null);
    assert.equal(c.shopUrl, null);
    assert.equal(c.kind, 'model');
  });

  test('ranges read min – max', () => {
    const c = cardModel({ ...bySku('p_e10_8917-01'), capacityKg: { min: 1400, max: 2000 }, liftHeightMm: { min: 0, max: 0 } }, DEFAULT_ORIGIN);
    assert.deepEqual(c.facts.map((f) => f.value), ['1,400 – 2,000 kg']);
  });

  test('shop card: category eyebrow, price line, shop link', () => {
    const c = cardModel(bySku('LN-T14B-GB'), DEFAULT_ORIGIN);
    assert.equal(c.href, '/en/catalog/shop/ln-t14b-gb');
    assert.equal(c.eyebrow, 'Electric Pallet Trucks');
    assert.equal(c.price.text, 'from £1,950.00 excl. VAT');
    assert.equal(c.shopUrl, 'https://www.linde-mh.shop/en-gb/p/linde-pallet-trucks/LN-T14B-GB');
    assert.deepEqual(c.facts, []);
    assert.equal(c.image, 'https://www.linde-mh.shop/images/LMH-GB-NTS/products/BR1132_T14B-Facelift_0001.png');
  });

  test('alt text falls back to the name when the index alt is a file name', () => {
    assert.equal(cardModel(bySku('LN-M20'), DEFAULT_ORIGIN).alt, 'Linde M20 Hand Pallet Truck (2000Kg)');
    assert.equal(cardModel(bySku('LN-ML10'), DEFAULT_ORIGIN).alt, 'ML10 Electric Pallet Stacker (1000Kg)');
  });
});
