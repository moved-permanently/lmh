/* eslint-disable max-len -- test data and expectations read better on one line */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeRow, DEFAULT_ORIGIN } from '../../scripts/catalog.js';
import { collectionLayout, resolveCollection, teaserItems } from '../../blocks/product-collection/collection-model.js';

const fixture = JSON.parse(readFileSync(new URL('../fixtures/catalog/index.json', import.meta.url)));
let cached;
const rows = () => { cached = cached || fixture.data.map(normalizeRow); return cached; };

describe('layout', () => {
  test('`carousel` variant, grid otherwise', () => {
    assert.equal(collectionLayout(['product-collection', 'carousel', 'block']), 'carousel');
    assert.equal(collectionLayout(new Set(['product-collection', 'block'])), 'grid');
    assert.equal(collectionLayout([]), 'grid');
  });
});

describe('resolving the authored SKUs', () => {
  test('authored order kept, unknown ids reported, nothing reordered', () => {
    const r = resolveCollection(rows(), ['p_t16l_br1155', 'LN-NOPE', 'p_t14b-br1132']);
    assert.deepEqual(r.found.map((x) => x.sku), ['p_t16l_br1155', 'p_t14b-br1132']);
    assert.deepEqual(r.unknown, ['LN-NOPE']);
    assert.deepEqual(r.entries.map((e) => (e.row ? e.row.sku : `?${e.id}`)), ['p_t16l_br1155', '?LN-NOPE', 'p_t14b-br1132']);
  });

  test('empty cells and repeats are dropped (first position wins); category ids are not products', () => {
    const r = resolveCollection(rows(), ['', 'p_t14b-br1132', ' p_t14b-br1132 ', 'model:2375']);
    assert.deepEqual(r.found.map((x) => x.sku), ['p_t14b-br1132']);
    assert.deepEqual(r.unknown, ['model:2375']);
  });
});

describe('carousel teasers', () => {
  test('one teaser per product from catalogue data only: image, name, PDP link, description, "Learn more"', () => {
    const [t14] = teaserItems(resolveCollection(rows(), ['p_t14b-br1132']).found, DEFAULT_ORIGIN);
    assert.deepEqual(Object.keys(t14).sort(), ['alt', 'href', 'image', 'more', 'name', 'price', 'sku', 'text']);
    assert.equal(t14.name, 'T14 B');
    assert.equal(t14.href, '/en/catalog/models/t14-b');
    assert.equal(t14.text, 'Linde T14 B: Pallet Trucks, load capacity 1400 kg, lift height up to 115 mm.');
    assert.equal(t14.more, 'Learn more');
    assert.match(t14.image, /^https:\/\//);
    assert.equal(t14.price, null);
  });

  test('shop teasers carry the price line; order follows the input', () => {
    const items = teaserItems(resolveCollection(rows(), ['LN-T14B-GB', 'p_t16l_br1155']).found, DEFAULT_ORIGIN);
    assert.deepEqual(items.map((i) => i.sku), ['LN-T14B-GB', 'p_t16l_br1155']);
    assert.equal(items[0].price, 'from £1,950.00 excl. VAT');
    assert.equal(items[0].href, '/en/catalog/shop/ln-t14b-gb');
  });
});
