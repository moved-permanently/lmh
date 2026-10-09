/*
 * Catalogue Browser serializers — what the plugin hands to the DA editor.
 *
 * Content stores REFERENCES ONLY: the HTML is a one-column block table holding the block name and
 * the ids, nothing else — never a name, price, image or link, even when a full index row is given.
 * Every id is checked against the loaded index first (unknown or empty ids throw, so nothing
 * partial is ever inserted) and HTML-escaped.
 */

const ESC = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ESC[c]);
}

const known = new WeakMap();

/**
 * Every SKU (variants included) and every category id present in the index.
 * @param {{rows: object[]}} index
 */
export function knownIds(index) {
  if (!index || !Array.isArray(index.rows)) throw new Error('catalogue index required to validate ids');
  if (!known.has(index.rows)) {
    const skus = new Set();
    const categories = new Set();
    index.rows.forEach((r) => {
      if (r.sku) skus.add(r.sku);
      (r.categories || []).forEach((c) => { if (c && c.id) categories.add(c.id); });
    });
    known.set(index.rows, { skus, categories });
  }
  return known.get(index.rows);
}

/** the bare id of a string or an object ({sku} / {id}) */
function idOf(item, field) {
  const raw = typeof item === 'string' ? item : item && item[field];
  const id = typeof raw === 'string' ? raw.trim() : '';
  if (!id) throw new Error(`empty ${field === 'sku' ? 'SKU' : 'category id'}`);
  return id;
}

function checkSku(item, index) {
  const ids = knownIds(index);
  const sku = idOf(item, 'sku');
  if (!ids.skus.has(sku)) throw new Error(`unknown SKU: ${sku}`);
  return sku;
}

function checkCategory(item, index) {
  const ids = knownIds(index);
  const id = idOf(item, 'id');
  if (!ids.categories.has(id)) throw new Error(`unknown category id: ${id}`);
  return id;
}

function blockTable(name, ids) {
  const rows = ids.map((id) => `<tr><td>${escapeHtml(id)}</td></tr>`).join('');
  return `<table><tr><td>${name}</td></tr>${rows}</table>`;
}

/** `product-reference` with one SKU */
export function productReferenceHTML(item, index) {
  return blockTable('product-reference', [checkSku(item, index)]);
}

/** `product-collection` with one SKU per row, in the given order (repeats kept once) */
export function productCollectionHTML(items, index) {
  if (!Array.isArray(items) || !items.length) throw new Error('empty selection');
  const skus = [];
  items.forEach((item) => {
    const sku = checkSku(item, index);
    if (!skus.includes(sku)) skus.push(sku);
  });
  return blockTable('product-collection', skus);
}

/** `category-reference` with one typed category id */
export function categoryReferenceHTML(item, index) {
  return blockTable('category-reference', [checkCategory(item, index)]);
}

/**
 * The bare, validated id for Insert SKU / Insert ID (plain text, no markup).
 * @param {string|object} item
 * @param {'sku'|'category'} type
 * @param {{rows: object[]}} index
 */
export function referenceText(item, type, index) {
  return type === 'category' ? checkCategory(item, index) : checkSku(item, index);
}
