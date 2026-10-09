/* eslint-disable max-len -- expectations read better on one line */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeRow, DEFAULT_ORIGIN } from '../../scripts/catalog.js';
import {
  searchProducts,
  productTypes,
  categoryGroups,
  categoryPreview,
  listItem,
  toggleSelection,
  insertContext,
  dataSummary,
} from '../../tools/catalog-browser/browse-model.js';

const fixture = JSON.parse(readFileSync(new URL('../fixtures/catalog/index.json', import.meta.url)));
let cached;
const rows = () => { cached = cached || fixture.data.map(normalizeRow); return cached; };
const skus = (list) => list.map((r) => r.sku);

describe('product search', () => {
  test('defaults: models and shop products, variants hidden; models first by sortWeight, then shop by name', () => {
    const all = searchProducts(rows(), {});
    assert.equal(all.length, 106);
    assert.equal(all[0].sku, 'p_e10_8917-01');
    assert.deepEqual(skus(all.slice(98, 101)), ['LN-M20', 'LN-M25', 'LN-M303000HDHPT']);
    assert.ok(all.every((r) => !r.parentSku));
  });

  test('show variants lists each variant right after its parent', () => {
    const all = searchProducts(rows(), { variants: true });
    assert.equal(all.length, 198);
    const i = all.findIndex((r) => r.sku === 'LN-M20');
    assert.equal(all[i + 1].sku, 'LN-M20-001');
    assert.equal(all[i + 1].parentSku, 'LN-M20');
  });

  test('kind filter: Truck models / UK Shop (variants count as shop)', () => {
    assert.equal(searchProducts(rows(), { kind: 'model' }).length, 98);
    assert.equal(searchProducts(rows(), { kind: 'shop' }).length, 8);
    assert.equal(searchProducts(rows(), { kind: 'shop', variants: true }).length, 100);
    assert.equal(searchProducts(rows(), { kind: 'model', variants: true }).length, 98);
  });

  test('product type filter (model:* category)', () => {
    const r = searchProducts(rows(), { type: 'model:2375' });
    assert.equal(r.length, 15);
    assert.deepEqual(skus(r).slice(0, 1), [rows().filter((x) => x.kind === 'model' && x.categories.some((c) => c.id === 'model:2375')).sort((a, b) => b.sortWeight - a.sortWeight)[0].sku]);
  });

  test('search reads name or SKU, case-insensitive', () => {
    assert.deepEqual(skus(searchProducts(rows(), { q: 'LN-t14' })), ['LN-T14B-GB']);
    assert.deepEqual(skus(searchProducts(rows(), { q: 'pallet STACKER' })), ['LN-ML10', 'LN-MM10']);
    assert.deepEqual(skus(searchProducts(rows(), { q: ' e10 ' })).sort(), ['p_e100-e180_br1471', 'p_e10_8917-01']);
    assert.deepEqual(searchProducts(rows(), { q: 'zzz' }), []);
  });

  test('a variant SKU is only found with the variants toggle on', () => {
    assert.deepEqual(skus(searchProducts(rows(), { q: 'LN-M20-001' })), []);
    assert.deepEqual(skus(searchProducts(rows(), { q: 'LN-M20-001', variants: true })), ['LN-M20-001']);
  });
});

describe('types and categories', () => {
  test('product types from model:* categories with counts, by name', () => {
    const t = productTypes(rows());
    assert.equal(t.length, 10);
    assert.deepEqual(t[0], { id: 'model:2368', name: 'Automated Trucks', count: 13 });
    assert.ok(t.find((x) => x.id === 'model:2375' && x.count === 15));
  });

  test('category groups: truck models and UK shop, every id with name and member count', () => {
    const g = categoryGroups(rows());
    assert.deepEqual(g.map((x) => x.label), ['Truck models (model:*)', 'UK Shop (shop:*)']);
    assert.equal(g[0].items.length, 10);
    assert.deepEqual(g[1].items, [
      { id: 'shop:all_products', name: 'All New Products', count: 8 },
      { id: 'shop:low_lift_pallet_trucks', name: 'Electric Pallet Trucks', count: 3 },
      { id: 'shop:hand_pallet_trucks', name: 'Manual Pallet Trucks', count: 3 },
      { id: 'shop:stackers', name: 'Stackers', count: 2 },
      { id: 'shop:trucks', name: 'Trucks', count: 1 },
    ]);
  });

  test('a category preview lists its members in display order', () => {
    assert.deepEqual(categoryPreview(rows(), 'shop:low_lift_pallet_trucks').map((r) => r.sku), ['LN-MT15-C', 'LN-T14B-GB', 'LN-T16']);
    assert.equal(categoryPreview(rows(), 'model:2374').length, 18);
    assert.deepEqual(categoryPreview(rows(), 'model:9999'), []);
  });
});

describe('list items', () => {
  test('model: name, SKU, kind badge, no price', () => {
    const it = listItem(rows().find((r) => r.sku === 'p_e10_8917-01'), rows(), DEFAULT_ORIGIN);
    assert.deepEqual({ ...it, image: Boolean(it.image) }, {
      sku: 'p_e10_8917-01', name: 'E10', kind: 'model', kindLabel: 'Truck model', price: null, image: true, isVariant: false,
    });
  });

  test('shop item: price line from formatPrice', () => {
    assert.equal(listItem(rows().find((r) => r.sku === 'LN-T14B-GB'), rows(), DEFAULT_ORIGIN).price, 'from £1,950.00 excl. VAT');
    assert.equal(listItem(rows().find((r) => r.sku === 'LN-M20'), rows(), DEFAULT_ORIGIN).price, 'Price on request');
  });

  test('variant: own name and SKU, shop kind from the parent, variant badge', () => {
    const it = listItem(rows().find((r) => r.sku === 'LN-M20-001'), rows(), DEFAULT_ORIGIN);
    assert.equal(it.isVariant, true);
    assert.equal(it.kindLabel, 'Variant');
    assert.equal(it.kind, 'shop');
    assert.equal(it.price, 'Price on request');
  });
});

describe('selection', () => {
  test('toggling keeps click order and never duplicates', () => {
    let s = [];
    s = toggleSelection(s, 'B');
    s = toggleSelection(s, 'A');
    s = toggleSelection(s, 'C');
    assert.deepEqual(s, ['B', 'A', 'C']);
    s = toggleSelection(s, 'A');
    assert.deepEqual(s, ['B', 'C']);
    s = toggleSelection(s, 'A');
    assert.deepEqual(s, ['B', 'C', 'A']);
  });
});

describe('insert context', () => {
  test('inserting is allowed for moved-permanently/lmh documents under /en/', () => {
    assert.deepEqual(insertContext({ org: 'moved-permanently', repo: 'lmh', path: '/en/products/pallet-trucks' }), { canInsert: true, reason: '' });
    assert.equal(insertContext({ org: 'moved-permanently', repo: 'lmh', path: '/moved-permanently/lmh/en/index.html' }).canInsert, true);
  });

  test('another site, a page outside /en/, or no context disables insertion with a reason', () => {
    assert.match(insertContext({ org: 'adobe', repo: 'other', path: '/en/x' }).reason, /moved-permanently\/lmh/);
    assert.match(insertContext({ org: 'moved-permanently', repo: 'lmh', path: '/de/x' }).reason, /\/en\//);
    assert.match(insertContext({ org: 'moved-permanently', repo: 'lmh', path: '/english' }).reason, /\/en\//);
    assert.match(insertContext({ org: 'moved-permanently', repo: 'lmh' }).reason, /\/en\//);
    assert.match(insertContext(null).reason, /read-only/i);
    assert.equal(insertContext(null).canInsert, false);
  });
});

describe('data summary', () => {
  test('footer text with record count and load time', () => {
    assert.equal(dataSummary(198, new Date(Date.UTC(2026, 9, 9, 13, 5, 0)), 'UTC'), 'Data: Product Bus, 198 records, loaded 13:05');
  });
});
