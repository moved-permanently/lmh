import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mapModel, modelSlug } from '../src/map-model.js';

const finder = JSON.parse(readFileSync(new URL('./fixtures/finder-sample.json', import.meta.url)));
const e10 = finder.results.find((r) => r.identifier_keyword[0] === 'p_e10_8917-01');
const picker = finder.results.find((r) => r.productType_keyword[0] === 'Order Pickers');

test('model slug comes from the source detail page, lowercased', () => {
  assert.equal(modelSlug(e10), 'e10');
  assert.equal(modelSlug({ detailPageUrl_keyword: ['../Products/E-Trucks/Xi14-Xi20-R/'] }), 'xi14-xi20-r');
});

test('maps a finder model group to a Product Bus entry with required fields', () => {
  const entry = mapModel(e10);
  assert.equal(entry.sku, 'p_e10_8917-01');
  assert.equal(entry.name, 'E10');
  assert.equal(entry.path, '/en/catalog/models/e10');
  assert.equal(entry.locale, 'en');
  assert.equal(entry.brand, 'Linde Material Handling');
  assert.match(entry.images[0].url, /^https:\/\/www\.linde-mh\.com\/media\//);
  assert.equal(entry.images[0].label, 'E10');
});

test('model has no price, no availability and a JSON-LD override without an Offer', () => {
  const entry = mapModel(e10);
  assert.equal(entry.price, undefined);
  assert.equal(entry.availability, undefined);
  const ld = JSON.parse(entry.jsonld);
  assert.equal(ld['@type'], 'Product');
  assert.equal(ld.offers, undefined);
  assert.equal(ld.sku, 'p_e10_8917-01');
});

test('model custom data keeps structured facets with units and source provenance', () => {
  const { custom } = mapModel(e10);
  assert.equal(custom.catalogueKind, 'model');
  assert.deepEqual(custom.categories, [{ id: 'model:2377', name: 'Electric Forklifts', kind: 'model-type' }]);
  assert.deepEqual(custom.capacityKg, { min: 1000, max: 1000 });
  assert.deepEqual(custom.liftHeightMm, { min: 5400, max: 5400 });
  assert.equal(custom.explosionProof, false);
  assert.ok(Array.isArray(custom.driveTypes));
  assert.equal(custom.source.system, 'linde-mh.com/productfinder');
  assert.equal(custom.source.id, 'p_e10_8917-01');
  assert.equal(custom.source.detailUrl, 'https://www.linde-mh.com/en/Products/E-Trucks/E10/');
  assert.equal(typeof custom.sortWeight, 'number');
});

test('picking height is parsed from German-formatted thousands', () => {
  const { custom } = mapModel(picker);
  assert.equal(typeof custom.pickingHeightMm, 'number');
  assert.ok(custom.pickingHeightMm > 1000);
});

test('applications keep id and label separately', () => {
  const { custom } = mapModel(e10);
  assert.ok(custom.applications.length > 0);
  for (const a of custom.applications) {
    assert.match(a.id, /^\d+$/);
    assert.ok(a.name && !/^\d+_/.test(a.name));
  }
});

test('HTML entities in features are decoded', () => {
  const { custom } = mapModel(picker);
  assert.ok(custom.features.every((f) => !f.includes('&#039;')));
});
