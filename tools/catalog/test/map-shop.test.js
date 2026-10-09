import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mapShopProduct } from '../src/map-shop.js';

const load = (code) => JSON.parse(readFileSync(new URL(`./fixtures/shop-${code}.json`, import.meta.url)));
const t14b = load('LN-T14B-GB');
const m20 = load('LN-M20');

test('maps a shop product to a Product Bus entry under the shop root', () => {
  const e = mapShopProduct(t14b);
  assert.equal(e.sku, 'LN-T14B-GB');
  assert.equal(e.name, 'T14 B Electric Pallet Truck (1400kg)');
  assert.equal(e.path, '/en/catalog/shop/ln-t14b-gb');
  assert.equal(e.locale, 'en-GB');
  assert.equal(e.country, 'gb');
  assert.equal(e.custom.catalogueKind, 'shop');
  assert.equal(e.custom.source.url, 'https://www.linde-mh.shop/en-gb/p/t14b/LN-T14B-GB');
});

test('images are absolute shop URLs, GIFs dropped, alt text kept', () => {
  const e = mapShopProduct(t14b);
  assert.ok(e.images.length >= 1);
  for (const img of e.images) {
    assert.match(img.url, /^https:\/\/www\.linde-mh\.shop\/images\//);
    assert.doesNotMatch(img.url, /\.gif$/i);
    assert.ok(img.label);
  }
});

test('FROM price becomes a GBP decimal string with an explicit FROM policy', () => {
  const e = mapShopProduct(t14b);
  assert.deepEqual(e.price, { final: '1950.00', currency: 'GBP', regular: '2100.00' });
  assert.deepEqual(e.custom.pricePolicy, { type: 'FROM', net: true, onRequest: false });
});

test('priceOnRequest wins over a numeric price', () => {
  const e = mapShopProduct(m20);
  assert.equal(e.price, undefined);
  assert.equal(e.custom.pricePolicy.onRequest, true);
  for (const v of e.variants ?? []) assert.equal(v.price, undefined);
});

test('categories: only real shop categories, typed ids, no variant or classification nodes', () => {
  const e = mapShopProduct(t14b);
  assert.deepEqual(e.custom.categories, [
    { id: 'shop:all_products', name: 'All New Products', kind: 'shop-category', url: 'https://www.linde-mh.shop/en-gb/c/all-products', position: 1 },
    { id: 'shop:low_lift_pallet_trucks', name: 'Electric Pallet Trucks', kind: 'shop-category', url: 'https://www.linde-mh.shop/en-gb/c/electric-pallet-trucks', position: 2 },
  ]);
});

test('variants come from variantOptions with option labels, url and images', () => {
  const e = mapShopProduct(t14b);
  assert.equal(e.variants.length, 4);
  const v = e.variants[0];
  assert.equal(v.sku, 'LN-T14B-GB-001');
  assert.equal(v.url, 'https://www.linde-mh.shop/en-gb/p/t14b/LN-T14B-GB?variant=LN-T14B-GB-001');
  assert.ok(v.images.length >= 1);
  assert.deepEqual(v.options, [{ id: 'Fork_Size', value: '560mm x 1000mm' }]);
  assert.match(v.name, /560mm x 1000mm/);
  assert.deepEqual(v.price, { final: '1950.00', currency: 'GBP', regular: '2100.00' });
});

test('no availability is inferred from conflicting orderability flags', () => {
  const e = mapShopProduct(t14b);
  assert.equal(e.availability, undefined);
});

test('technical specs are structured name/value pairs per group', () => {
  const e = mapShopProduct(t14b);
  const tech = e.custom.specs.find((g) => g.id === 'technicalDetails');
  assert.ok(tech);
  assert.ok(tech.features.some((f) => f.name === 'Load Capacity' && f.value));
});
