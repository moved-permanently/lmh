/*
 * Catalogue Browser model — pure functions over normalised index rows (scripts/catalog.js) for the
 * EW right-rail plugin: product search, type / category listings, list items, selection and the
 * insert guard. Covered by `npm test` (test/catalog-browser).
 */
import {
  compareRows, findBySku, formatPrice, imageUrl, membersOf,
} from '../../scripts/catalog.js';

export const SITE = Object.freeze({ org: 'moved-permanently', repo: 'lmh' });

const isProduct = (r) => r.kind === 'model' || r.kind === 'shop';
const lower = (s) => String(s || '').toLowerCase();

/**
 * Products for the list: models (sortWeight desc, then name) before shop items (by name); with
 * `variants` each variant follows its parent.
 * @param {object[]} rows
 * @param {{q?: string, kind?: 'all'|'model'|'shop', type?: string, variants?: boolean}} filters
 */
export function searchProducts(rows, filters = {}) {
  const q = lower(filters.q).trim();
  const kind = filters.kind || 'all';
  const matches = (r) => !q || lower(r.name).includes(q) || lower(r.sku).includes(q);
  const variantsOf = new Map();
  if (filters.variants) {
    rows.filter((r) => r.parentSku).forEach((v) => {
      if (!variantsOf.has(v.parentSku)) variantsOf.set(v.parentSku, []);
      variantsOf.get(v.parentSku).push(v);
    });
  }
  const out = [];
  rows.filter(isProduct).sort(compareRows).forEach((p) => {
    if (kind !== 'all' && p.kind !== kind) return;
    if (filters.type && !p.categories.some((c) => c.id === filters.type)) return;
    if (matches(p)) out.push(p);
    (variantsOf.get(p.sku) || []).forEach((v) => { if (matches(v)) out.push(v); });
  });
  return out;
}

const byName = (a, b) => a.name.localeCompare(b.name, 'en');

/** Product types from the model:* categories, by name, with model counts. */
export function productTypes(rows) {
  const types = new Map();
  rows.filter((r) => r.kind === 'model').forEach((r) => {
    r.categories.filter((c) => c.id && c.id.startsWith('model:')).forEach((c) => {
      const t = types.get(c.id) || { id: c.id, name: c.name, count: 0 };
      t.count += 1;
      types.set(c.id, t);
    });
  });
  return [...types.values()].sort(byName);
}

/** Every category id in the index, grouped by type, with names and member counts. */
export function categoryGroups(rows) {
  const ids = new Map();
  rows.forEach((r) => (r.categories || []).forEach((c) => {
    if (c && c.id && !ids.has(c.id)) ids.set(c.id, c.name || c.id);
  }));
  const group = (prefix, label) => ({
    key: prefix,
    label,
    items: [...ids.entries()]
      .filter(([id]) => id.startsWith(`${prefix}:`))
      .map(([id, name]) => ({ id, name, count: membersOf(rows, id).length }))
      .sort(byName),
  });
  return [group('model', 'Truck models (model:*)'), group('shop', 'UK Shop (shop:*)')];
}

/** Members of a category for the transient preview (never inserted). */
export function categoryPreview(rows, id) {
  return membersOf(rows, id);
}

/**
 * What one result row shows: name, SKU, kind badge, price line for shop items, thumbnail.
 * Variants show their own name / SKU with the parent's kind and price policy.
 */
export function listItem(row, rows, base) {
  const isVariant = Boolean(row.parentSku);
  const resolved = isVariant ? (findBySku(rows, row.sku) || row) : row;
  const price = formatPrice(resolved);
  let kindLabel = resolved.kind === 'model' ? 'Truck model' : 'UK Shop';
  if (isVariant) kindLabel = 'Variant';
  return {
    sku: row.sku,
    name: row.name || resolved.name,
    kind: resolved.kind,
    kindLabel,
    price: price ? price.text : null,
    image: imageUrl(resolved, base),
    isVariant,
  };
}

/** Multi-select in click order; a second click removes. */
export function toggleSelection(list, sku) {
  return list.includes(sku) ? list.filter((s) => s !== sku) : [...list, sku];
}

/**
 * May the plugin insert into the document being edited?
 * @param {{org?: string, repo?: string, path?: string}|null} context the DA SDK context
 * @returns {{canInsert: boolean, reason: string}}
 */
export function insertContext(context) {
  if (!context) {
    return { canInsert: false, reason: 'Opened outside the editor: read-only browse mode.' };
  }
  if (context.org !== SITE.org || context.repo !== SITE.repo) {
    const site = `${SITE.org}/${SITE.repo}`;
    return { canInsert: false, reason: `Inserting is only available for ${site} documents.` };
  }
  const prefix = `/${SITE.org}/${SITE.repo}`;
  let path = String(context.path || '');
  if (path.startsWith(`${prefix}/`)) path = path.slice(prefix.length);
  if (!path.startsWith('/en/')) {
    return { canInsert: false, reason: 'Inserting is only available for pages under /en/.' };
  }
  return { canInsert: true, reason: '' };
}

/** Footer line: "Data: Product Bus, 198 records, loaded 13:05" */
export function dataSummary(total, date, timeZone) {
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone,
  }).format(date);
  return `Data: Product Bus, ${total} records, loaded ${time}`;
}
