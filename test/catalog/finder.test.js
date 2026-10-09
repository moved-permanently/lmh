/* eslint-disable max-len -- test data and expectations read better on one line */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeRow } from '../../scripts/catalog.js';
import {
  finderRows,
  emptyState,
  initialState,
  parseFinderConfig,
  filterRows,
  buildFacets,
  matchesQuery,
  activeFilterCount,
} from '../../blocks/product-finder/finder-model.js';

const fixture = JSON.parse(readFileSync(new URL('../fixtures/catalog/index.json', import.meta.url)));
let cached;
const models = () => { cached = cached || finderRows(fixture.data.map(normalizeRow)); return cached; };
const names = (list) => list.map((r) => r.name);
const state = (patch) => ({ ...emptyState(), ...patch });

describe('finder rows', () => {
  test('only model rows (the New trucks tab), sortWeight desc then name', () => {
    assert.equal(models().length, 98);
    assert.ok(models().every((r) => r.kind === 'model'));
    assert.deepEqual(names(models().slice(0, 4)), ['E10', 'Xi10 – Xi20', 'Xi14 – Xi20 R', 'E14 – E20']);
  });
});

describe('config', () => {
  test('the optional first row preselects a model category', () => {
    assert.deepEqual(parseFinderConfig(['model:2375']), { category: 'model:2375' });
    assert.deepEqual(parseFinderConfig([' Model:2374 ']), { category: 'model:2374' });
    assert.deepEqual(parseFinderConfig([]), { category: null });
    assert.deepEqual(parseFinderConfig(['']), { category: null });
  });

  test('anything but a model category is ignored (the finder lists models only)', () => {
    assert.deepEqual(parseFinderConfig(['shop:stackers']), { category: null });
    assert.deepEqual(parseFinderConfig(['LN-T14B-GB']), { category: null });
  });

  test('initial state carries the preselected type', () => {
    assert.deepEqual(initialState({ category: 'model:2375' }).types, ['model:2375']);
    assert.deepEqual(initialState({ category: null }).types, []);
    assert.equal(activeFilterCount(initialState({ category: 'model:2375' })), 1);
    assert.equal(activeFilterCount(emptyState()), 0);
  });
});

describe('filtering', () => {
  test('no filters: everything', () => {
    assert.equal(filterRows(models(), emptyState()).length, 98);
  });

  test('product types OR within the facet', () => {
    assert.equal(filterRows(models(), state({ types: ['model:2375'] })).length, 15);
    assert.equal(filterRows(models(), state({ types: ['model:2375', 'model:2374'] })).length, 33);
  });

  test('facets AND across each other', () => {
    assert.equal(filterRows(models(), state({ types: ['model:2375'], drive: ['Li-Ion'] })).length, 12);
  });

  test('ranges match when the model range overlaps the requested one', () => {
    assert.equal(filterRows(models(), state({ capacity: { min: 1000, max: 2000 } })).length, 77);
    assert.equal(filterRows(models(), state({ lift: { min: 10000, max: null } })).length, 10);
    const open = filterRows(models(), state({ capacity: { min: null, max: null } }));
    assert.equal(open.length, 98);
  });

  test('applications and explosion protection', () => {
    assert.equal(filterRows(models(), state({ applications: ['2434'] })).length, 11);
    assert.equal(filterRows(models(), state({ explosionProof: true })).length, 18);
  });

  test('model search ignores case, spaces and dashes', () => {
    assert.deepEqual(names(filterRows(models(), state({ q: 'e1' }))).sort(), ['E10', 'E100 – E180', 'E14 – E20', 'E16 – E20 P']);
    assert.deepEqual(names(filterRows(models(), state({ q: 'Xi 10' }))), ['Xi10 – Xi20']);
    assert.equal(matchesQuery({ name: 'T20 – T25 SP', sku: 'x' }, 't20-t25sp'), true);
    assert.equal(matchesQuery({ name: 'E10', sku: 'p_e10_8917-01' }, ''), true);
  });

  test('results keep the sortWeight order', () => {
    const r = filterRows(models(), state({ types: ['model:2375'] }));
    assert.deepEqual(names(r.slice(0, 3)), ['M10 X/XE', 'MT15 C', 'M25']);
  });
});

describe('facets', () => {
  const facets = () => buildFacets(models(), emptyState());

  test('product types from model:* categories, in finder order (highest sortWeight first)', () => {
    assert.equal(facets().types.length, 10);
    assert.equal(facets().types.reduce((s, t) => s + t.count, 0), 98);
    assert.deepEqual(facets().types[0], { id: 'model:2377', name: 'Electric Forklifts', count: 15 });
    assert.deepEqual(facets().types.map((t) => t.name).slice(0, 3), ['Electric Forklifts', 'Diesel / Gas Forklifts', 'Pallet Trucks']);
    assert.ok(facets().types.find((t) => t.id === 'model:2375' && t.count === 15));
  });

  test('drive types and applications with counts, most common first', () => {
    assert.deepEqual(facets().drive.slice(0, 2), [{ id: 'Li-Ion', name: 'Li-Ion', count: 85 }, { id: 'Battery', name: 'Battery', count: 72 }]);
    assert.deepEqual(facets().applications[0], { id: '2438', name: 'Moving', count: 79 });
    assert.equal(facets().explosionProof, 18);
  });

  test('range bounds over all models', () => {
    assert.deepEqual(facets().capacity, { min: 100, max: 18000 });
    assert.deepEqual(facets().lift, { min: 0, max: 18110 });
  });

  test('counts follow the other active filters, not their own facet', () => {
    const g = buildFacets(models(), state({ drive: ['Li-Ion'] }));
    assert.equal(g.types.length, 10);
    assert.equal(g.types.find((t) => t.id === 'model:2375').count, 12);
    assert.equal(g.types.find((t) => t.id === 'model:2376').count, 0);
    // the drive facet itself is counted without its own selection
    assert.equal(g.drive.find((d) => d.id === 'Li-Ion').count, 85);
    assert.equal(g.drive.find((d) => d.id === 'Diesel').count, 6);
  });
});
