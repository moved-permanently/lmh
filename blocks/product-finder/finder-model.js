/*
 * product-finder data model — pure functions over normalised index rows (scripts/catalog.js), so
 * the finder's filtering, facets and ordering are covered by `npm test` without a DOM.
 *
 * State: { types: string[] (model:* ids), drive: string[], applications: string[] (ids),
 *          explosionProof: boolean, capacity: {min, max}, lift: {min, max}, q: string }
 * Within a facet values OR, across facets they AND; a range matches when the model's own
 * min–max range overlaps the requested one; the free-text search reads the model name and SKU.
 */
import { compareRows, parseReference } from '../../scripts/catalog.js';

/** The New trucks tab: model rows only, sortWeight desc then name. */
export function finderRows(rows) {
  return rows.filter((r) => r.kind === 'model').sort(compareRows);
}

export function emptyState() {
  return {
    types: [],
    drive: [],
    applications: [],
    explosionProof: false,
    capacity: { min: null, max: null },
    lift: { min: null, max: null },
    q: '',
  };
}

/**
 * Block config: the optional first row preselects a model category (`model:<productTypeId>`).
 * @param {string[]} texts the first cell text of each authored row
 */
export function parseFinderConfig(texts) {
  const ref = parseReference((texts || [])[0]);
  return { category: ref && ref.type === 'category' && ref.id.startsWith('model:') ? ref.id : null };
}

export function initialState(config) {
  const s = emptyState();
  if (config && config.category) s.types = [config.category];
  return s;
}

const given = (v) => v !== null && v !== undefined && v !== '';
const isSet = (r) => Boolean(r) && (given(r.min) || given(r.max));

export function activeFilterCount(state) {
  return state.types.length + state.drive.length + state.applications.length
    + (state.explosionProof ? 1 : 0)
    + (isSet(state.capacity) ? 1 : 0)
    + (isSet(state.lift) ? 1 : 0);
}

const norm = (s) => String(s || '').toLowerCase().replace(/[\s\-–—_/.]+/g, '');

/** Model search: case, spaces and dashes do not matter. */
export function matchesQuery(row, q) {
  const want = norm(q);
  if (!want) return true;
  return norm(row.name).includes(want) || norm(row.sku).includes(want);
}

function overlaps(r, want) {
  if (!isSet(want)) return true;
  if (!r || r.max === undefined) return false;
  const lo = r.min ?? r.max;
  const min = given(want.min) ? Number(want.min) : null;
  const max = given(want.max) ? Number(want.max) : null;
  return (min === null || r.max >= min) && (max === null || lo <= max);
}

const TESTS = {
  types: (row, s) => !s.types.length || row.categories.some((c) => s.types.includes(c.id)),
  drive: (row, s) => !s.drive.length || row.driveTypes.some((d) => s.drive.includes(d)),
  applications: (row, s) => !s.applications.length
    || row.applications.some((a) => s.applications.includes(String(a.id))),
  explosionProof: (row, s) => !s.explosionProof || row.explosionProof,
  capacity: (row, s) => overlaps(row.capacityKg, s.capacity),
  lift: (row, s) => overlaps(row.liftHeightMm, s.lift),
  q: (row, s) => matchesQuery(row, s.q),
};

function passes(row, state, skip) {
  return Object.entries(TESTS).every(([facet, t]) => facet === skip || t(row, state));
}

/** Rows matching the state, in the given (sortWeight) order. */
export function filterRows(rows, state) {
  return rows.filter((r) => passes(r, state));
}

function bounds(rows, col) {
  let min = Infinity;
  let max = -Infinity;
  rows.forEach((r) => {
    const v = r[col];
    if (!v) return;
    if (Number.isFinite(v.min)) min = Math.min(min, v.min);
    if (Number.isFinite(v.max)) max = Math.max(max, v.max);
  });
  return Number.isFinite(min) ? { min, max } : { min: 0, max: 0 };
}

/**
 * Facet values with counts. Each facet is counted against the rows that pass every OTHER active
 * filter (so a selected value never zeroes its own siblings). Product types come from the
 * model:* categories in finder order (highest sortWeight first); drive types and applications
 * by overall frequency.
 */
export function buildFacets(rows, state) {
  const types = new Map();
  const drive = new Map();
  const apps = new Map();
  rows.forEach((r) => {
    r.categories.filter((c) => c.id && c.id.startsWith('model:')).forEach((c) => {
      const t = types.get(c.id) || { id: c.id, name: c.name, weight: -Infinity };
      t.weight = Math.max(t.weight, r.sortWeight);
      types.set(c.id, t);
    });
    r.driveTypes.forEach((d) => drive.set(d, (drive.get(d) || 0) + 1));
    r.applications.forEach((a) => {
      const id = String(a.id);
      const e = apps.get(id) || { id, name: a.name, total: 0 };
      e.total += 1;
      apps.set(id, e);
    });
  });
  const pool = (facet) => rows.filter((r) => passes(r, state, facet));
  const typePool = pool('types');
  const drivePool = pool('drive');
  const appPool = pool('applications');
  const byTotal = (a, b) => (b.total - a.total) || String(a.name).localeCompare(String(b.name));
  const count = (list, test) => list.filter(test).length;
  const inType = (id) => (r) => r.categories.some((c) => c.id === id);
  const hasApp = (id) => (r) => r.applications.some((x) => String(x.id) === id);
  return {
    types: [...types.values()]
      .sort((a, b) => (b.weight - a.weight) || a.name.localeCompare(b.name))
      .map((t) => ({
        id: t.id, name: t.name, count: count(typePool, inType(t.id)),
      })),
    drive: [...drive.entries()]
      .map(([id, total]) => ({ id, name: id, total }))
      .sort(byTotal)
      .map((d) => ({
        id: d.id, name: d.name, count: count(drivePool, (r) => r.driveTypes.includes(d.id)),
      })),
    applications: [...apps.values()]
      .sort(byTotal)
      .map((a) => ({
        id: a.id, name: a.name, count: count(appPool, hasApp(a.id)),
      })),
    explosionProof: pool('explosionProof').filter((r) => r.explosionProof).length,
    capacity: bounds(rows, 'capacityKg'),
    lift: bounds(rows, 'liftHeightMm'),
  };
}

/**
 * Preselection from the page URL: `?type=model:<id>`, or the legacy finder link
 * `?productTypes[]=<productTypeId>` (authored CTAs such as "Show all pallet stackers").
 * @param {string} search location.search
 * @returns {string|null} a model:* category id
 */
export function categoryFromSearch(search) {
  const params = new URLSearchParams(search || '');
  const type = parseReference(params.get('type'));
  if (type && type.type === 'category' && type.id.startsWith('model:')) return type.id;
  const legacy = params.get('productTypes[]');
  return legacy && /^\d+$/.test(legacy.trim()) ? `model:${legacy.trim()}` : null;
}
