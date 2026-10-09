import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEntries } from '../src/validate.js';

const ok = { sku: 'A', name: 'A', path: '/en/catalog/models/a' };

test('accepts valid entries', () => {
  assert.deepEqual(validateEntries([ok]).errors, []);
});

test('rejects missing required fields and bad paths', () => {
  const { errors } = validateEntries([{ sku: 'B', path: '/en/catalog/models/B_x' }]);
  assert.ok(errors.some((e) => e.includes('name')));
  assert.ok(errors.some((e) => e.includes('path')));
});

test('detects path and sku collisions, including variant skus', () => {
  const { errors } = validateEntries([
    ok,
    { ...ok, sku: 'C' },
    { sku: 'D', name: 'D', path: '/en/catalog/shop/d', variants: [{ sku: 'A', name: 'x', url: 'https://x', images: [{ url: 'https://x/i.png' }] }] },
  ]);
  assert.ok(errors.some((e) => e.includes('duplicate path')));
  assert.ok(errors.some((e) => e.includes('duplicate sku')));
});

test('rejects entries outside the /en/catalog roots', () => {
  const { errors } = validateEntries([{ ...ok, path: '/de/catalog/models/a' }]);
  assert.ok(errors.some((e) => e.includes('outside')));
});

test('rejects numeric prices and missing currency', () => {
  const { errors } = validateEntries([{ ...ok, price: { final: 10 } }]);
  assert.ok(errors.some((e) => e.includes('price')));
});
