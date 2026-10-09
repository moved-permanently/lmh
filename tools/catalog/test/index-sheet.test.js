import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toIndexSheet, extract } from '../src/index-sheet.js';

const props = {
  name: 'name', path: 'path', image: 'images[0].url', kind: 'custom.catalogueKind', categories: 'custom.categories',
};

test('extract follows dot paths and array indices like the indexer', () => {
  assert.equal(extract({ a: { b: [{ c: 1 }] } }, 'a.b[0].c'), 1);
  assert.deepEqual(extract({ custom: { categories: [{ id: 'x' }] } }, 'custom.categories'), [{ id: 'x' }]);
});

test('sheet has sku+url+configured columns, variant rows with parentSku, sorted', () => {
  const sheet = toIndexSheet([
    { sku: 'B', name: 'B', path: '/en/catalog/shop/b', images: [{ url: 'u' }], custom: { catalogueKind: 'shop', categories: [{ id: 'shop:x' }] }, variants: [{ sku: 'B-1', name: 'B1', url: 'v', images: [] }] },
    { sku: 'A', name: 'A', path: '/en/catalog/models/a', custom: { catalogueKind: 'model', categories: [] } },
  ], props);
  assert.equal(sheet[':type'], 'sheet');
  assert.equal(sheet.total, 3);
  assert.deepEqual(sheet.data.map((r) => r.sku), ['A', 'B', 'B-1']);
  assert.equal(sheet.data[2].parentSku, 'B');
  assert.equal(sheet.data[1].variantSkus, 'B-1');
  assert.deepEqual(sheet.data[1].categories, [{ id: 'shop:x' }]);
  assert.ok(sheet.columns.includes('path'));
});
