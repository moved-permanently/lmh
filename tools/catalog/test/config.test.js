import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INDEX_PROPERTIES, indexerProperties, publicConfig } from '../src/config.js';

test('indexer properties are the exact inverse of the column map (source -> column)', () => {
  const inv = indexerProperties();
  assert.equal(Object.keys(inv).length, Object.keys(INDEX_PROPERTIES).length);
  assert.equal(inv['images[0].url'], 'image');
  assert.equal(inv['custom.categories'], 'categories');
  assert.equal(inv.sku, undefined);
});

test('mixer routes only the /en/catalog roots to the product pipeline of moved-permanently/lmh', () => {
  const { mixerConfig } = publicConfig();
  const routed = Object.entries(mixerConfig.patterns).filter(([, b]) => b === 'productbus').map(([p]) => p);
  assert.ok(routed.every((p) => p.startsWith('/en/catalog/')));
  assert.ok(!routed.some((p) => p.includes('**')));
  assert.equal(mixerConfig.patterns.default, 'edge-delivery');
  assert.equal(mixerConfig.backends.productbus.pathPrefix, '/moved-permanently/lmh/main/');
});
