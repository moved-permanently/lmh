/* eslint-disable max-len -- expectations read better on one line */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeRow } from '../../scripts/catalog.js';
import {
  escapeHtml,
  knownIds,
  productReferenceHTML,
  productCollectionHTML,
  categoryReferenceHTML,
  referenceText,
} from '../../tools/catalog-browser/serialize.js';

const fixture = JSON.parse(readFileSync(new URL('../fixtures/catalog/index.json', import.meta.url)));
let cached;
const rows = () => { cached = cached || fixture.data.map(normalizeRow); return cached; };
const index = () => ({ rows: rows() });
const row = (sku) => rows().find((r) => r.sku === sku);
const tables = (html) => (html.match(/<table>/g) || []).length;

describe('escaping', () => {
  test('escapes the five HTML specials', () => {
    assert.equal(escapeHtml('a&b<c>"d\'e'), 'a&amp;b&lt;c&gt;&quot;d&#39;e');
    assert.equal(escapeHtml(42), '42');
  });

  test('known ids: every SKU (variants included) and every category id', () => {
    const k = knownIds(index());
    assert.ok(k.skus.has('LN-T14B-GB'));
    assert.ok(k.skus.has('LN-M20-001'));
    assert.ok(k.skus.has('p_e10_8917-01'));
    assert.ok(k.categories.has('model:2375'));
    assert.ok(k.categories.has('shop:low_lift_pallet_trucks'));
    assert.equal(k.categories.has('model:9999'), false);
  });
});

describe('product-reference', () => {
  test('exactly the block name and the SKU, from a string', () => {
    assert.equal(productReferenceHTML('p_e10_8917-01', index()), '<table><tr><td>product-reference</td></tr><tr><td>p_e10_8917-01</td></tr></table>');
  });

  test('a full row object contributes only its SKU (no name, price, image, links)', () => {
    const html = productReferenceHTML(row('LN-T14B-GB'), index());
    assert.equal(html, '<table><tr><td>product-reference</td></tr><tr><td>LN-T14B-GB</td></tr></table>');
    ['T14 B', '1950', '£', 'http', 'img', 'linde-mh', 'Electric'].forEach((s) => assert.equal(html.includes(s), false, s));
  });

  test('ids are trimmed; unknown and empty ids are rejected', () => {
    assert.equal(productReferenceHTML('  LN-M20 ', index()), '<table><tr><td>product-reference</td></tr><tr><td>LN-M20</td></tr></table>');
    assert.throws(() => productReferenceHTML('LN-NOPE', index()), /unknown/i);
    assert.throws(() => productReferenceHTML('', index()), /empty/i);
    assert.throws(() => productReferenceHTML({ name: 'no sku' }, index()), /empty/i);
    assert.throws(() => productReferenceHTML(null, index()), /empty/i);
  });

  test('a category id is not a product', () => {
    assert.throws(() => productReferenceHTML('model:2375', index()), /unknown/i);
  });

  test('ids are HTML-escaped', () => {
    const odd = { rows: [{ sku: 'A&B<1>', kind: 'shop', categories: [] }] };
    assert.equal(productReferenceHTML('A&B<1>', odd), '<table><tr><td>product-reference</td></tr><tr><td>A&amp;B&lt;1&gt;</td></tr></table>');
  });

  test('without an index nothing can be validated: refused', () => {
    assert.throws(() => productReferenceHTML('LN-M20'), /index/i);
  });
});

describe('product-collection', () => {
  test('one table, one SKU per row, in selection order', () => {
    const html = productCollectionHTML(['LN-ML10', row('LN-T14B-GB'), 'LN-M20'], index());
    assert.equal(html, '<table><tr><td>product-collection</td></tr><tr><td>LN-ML10</td></tr><tr><td>LN-T14B-GB</td></tr><tr><td>LN-M20</td></tr></table>');
    assert.equal(tables(html), 1);
  });

  test('a repeated SKU is kept once, at its first position', () => {
    assert.equal(productCollectionHTML(['LN-M20', 'LN-ML10', 'LN-M20'], index()), '<table><tr><td>product-collection</td></tr><tr><td>LN-M20</td></tr><tr><td>LN-ML10</td></tr></table>');
  });

  test('empty selections and any unknown member are rejected (nothing partial is inserted)', () => {
    assert.throws(() => productCollectionHTML([], index()), /empty/i);
    assert.throws(() => productCollectionHTML(null, index()), /empty/i);
    assert.throws(() => productCollectionHTML(['LN-M20', 'LN-NOPE'], index()), /unknown.*LN-NOPE/i);
    assert.throws(() => productCollectionHTML(['LN-M20', ''], index()), /empty/i);
  });

  test('cells never carry markup from the rows, so no nested tables', () => {
    const tricky = { rows: [{ sku: '<table>x', kind: 'shop', categories: [] }, { sku: 'B', kind: 'shop', categories: [] }] };
    const html = productCollectionHTML(['<table>x', 'B'], tricky);
    assert.equal(tables(html), 1);
    assert.ok(html.includes('&lt;table&gt;x'));
  });
});

describe('category-reference', () => {
  test('exactly the block name and the typed id', () => {
    assert.equal(categoryReferenceHTML('model:2375', index()), '<table><tr><td>category-reference</td></tr><tr><td>model:2375</td></tr></table>');
    assert.equal(categoryReferenceHTML({
      id: 'shop:stackers', name: 'Stackers', count: 2, url: 'https://x',
    }, index()), '<table><tr><td>category-reference</td></tr><tr><td>shop:stackers</td></tr></table>');
  });

  test('unknown, untyped and empty ids are rejected', () => {
    assert.throws(() => categoryReferenceHTML('model:9999', index()), /unknown/i);
    assert.throws(() => categoryReferenceHTML('2375', index()), /unknown/i);
    assert.throws(() => categoryReferenceHTML('LN-M20', index()), /unknown/i);
    assert.throws(() => categoryReferenceHTML('', index()), /empty/i);
  });
});

describe('plain text ids (Insert SKU / Insert ID)', () => {
  test('the bare id, validated and trimmed — no markup', () => {
    assert.equal(referenceText(row('LN-T14B-GB'), 'sku', index()), 'LN-T14B-GB');
    assert.equal(referenceText(' model:2374 ', 'category', index()), 'model:2374');
    assert.throws(() => referenceText('LN-NOPE', 'sku', index()), /unknown/i);
    assert.throws(() => referenceText('model:2375', 'sku', index()), /unknown/i);
    assert.throws(() => referenceText('', 'category', index()), /empty/i);
  });
});
