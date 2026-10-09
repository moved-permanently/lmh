import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertDestination, catalogUrl } from '../src/client.js';

test('only moved-permanently/lmh is an allowed destination', () => {
  assert.doesNotThrow(() => assertDestination({ org: 'moved-permanently', site: 'lmh' }));
  assert.throws(() => assertDestination({ org: 'moved-permanently', site: 'bmw' }), /destination/);
  assert.throws(() => assertDestination({ org: 'cloudadoption', site: 'lmh' }), /destination/);
});

test('catalog url is built for the fixed destination only', () => {
  assert.equal(catalogUrl(), 'https://api.adobecommerce.live/moved-permanently/sites/lmh/catalog');
});
