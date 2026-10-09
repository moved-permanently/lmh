/*
 * scripts/catalog.js — Product Bus catalogue runtime.
 *
 * Authored content only stores references (a SKU or a typed category id such as `model:2375` or
 * `shop:low_lift_pallet_trucks`); everything shown — names, images, prices, facts, links and the
 * members of a category — is read at runtime from the Product Bus index
 * ({CATALOG_ORIGIN}/en/catalog/index.json) and, when needed, the product entry ({path}.json).
 *
 * The data functions are pure / injectable (fetch, location) so `npm test` covers them in node;
 * renderProductCard() is the only DOM code. No import of aem.js: the module must load in node.
 */

/* global globalThis */

export const DEFAULT_ORIGIN = 'https://main--lmh--moved-permanently.aem.network';
export const INDEX_PATH = '/en/catalog/index.json';
export const CATALOG_ROOT = '/en/catalog/';
export const FIXTURE_BASE = '/test/fixtures/catalog';
const FETCH_TIMEOUT_MS = 10000;

/* ---------------------------------------------------------------- origin & sources */

/**
 * The catalogue origin: same origin on *.aem.network (where the Product Bus is routed), the main
 * network origin everywhere else (.aem.page / .aem.live / localhost).
 * @param {Location|URL} [loc]
 * @returns {string}
 */
export function catalogOrigin(loc = globalThis.location) {
  if (loc && loc.hostname && loc.hostname.endsWith('.aem.network')) return loc.origin;
  return DEFAULT_ORIGIN;
}

/**
 * Dev-only switch: `?catalog=fixture` on localhost reads the committed test fixtures instead of the
 * Product Bus. No effect on any other host.
 * @param {Location|URL} [loc]
 */
export function isFixtureMode(loc = globalThis.location) {
  if (!loc || !['localhost', '127.0.0.1'].includes(loc.hostname)) return false;
  return new URLSearchParams(loc.search).get('catalog') === 'fixture';
}

/**
 * Fixture file for a catalogue path:
 * /en/catalog/models/e10 becomes /test/fixtures/catalog/models-e10.json
 * @param {string} path
 */
export function fixtureUrl(path) {
  const rel = path.replace(/\.json$/, '').replace(CATALOG_ROOT, '').replace(/^\/+/, '');
  return `${FIXTURE_BASE}/${rel.split('/').filter(Boolean).join('-')}.json`;
}

/**
 * Where the index and product entries are read from for the current page.
 * @param {Location|URL} [loc]
 */
export function catalogSources(loc = globalThis.location) {
  const origin = catalogOrigin(loc);
  const fixture = isFixtureMode(loc);
  return {
    fixture,
    origin,
    imageBase: origin,
    indexUrl: fixture ? fixtureUrl('/en/catalog/index') : `${origin}${INDEX_PATH}`,
    productUrl: (path) => (fixture ? fixtureUrl(path) : `${origin}${path}.json`),
  };
}

/* ---------------------------------------------------------------- index */

async function getJson(url, fetchImpl) {
  const opts = {};
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
    opts.signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  }
  const resp = await fetchImpl(url, opts);
  if (!resp.ok) throw new Error(`catalogue: ${url} answered HTTP ${resp.status}`);
  return resp.json();
}

function withPage(url, offset, limit) {
  const u = new URL(url, 'https://relative.invalid');
  u.searchParams.set('offset', offset);
  u.searchParams.set('limit', limit);
  return u.origin === 'https://relative.invalid' ? `${u.pathname}${u.search}` : u.href;
}

/**
 * Reads the complete index sheet: when the first answer holds fewer rows than `total`, pages with
 * ?offset=&limit= until every row is there. Short, empty or overlapping pages throw — a partial
 * catalogue must never pass for the whole one.
 * @param {string} indexUrl
 * @param {Function} [fetchImpl]
 * @returns {Promise<object[]>} raw rows in sheet order
 */
export async function fetchCompleteIndex(indexUrl, fetchImpl = globalThis.fetch) {
  const first = await getJson(indexUrl, fetchImpl);
  if (!first || !Array.isArray(first.data)) throw new Error(`catalogue: ${indexUrl} is not a sheet`);
  const total = Number.isFinite(Number(first.total)) ? Number(first.total) : first.data.length;
  const rows = [...first.data];
  const limit = Number(first.limit) || first.data.length;
  while (rows.length < total) {
    if (!limit) throw new Error(`catalogue: short page at offset ${rows.length} of ${total}`);
    const want = Math.min(limit, total - rows.length);
    // eslint-disable-next-line no-await-in-loop -- pages are sequential by definition
    const page = await getJson(withPage(indexUrl, rows.length, limit), fetchImpl);
    const data = page && Array.isArray(page.data) ? page.data : [];
    if (data.length < want) {
      throw new Error(`catalogue: short page at offset ${rows.length}: ${data.length} of ${want} rows (total ${total})`);
    }
    rows.push(...data.slice(0, want));
  }
  const seen = new Set();
  rows.forEach((r) => {
    const key = r.sku || r.path;
    if (seen.has(key)) throw new Error(`catalogue: duplicate row ${key} in the index`);
    seen.add(key);
  });
  return rows;
}

const LIST_COLUMNS = ['categories', 'driveTypes', 'applications'];
const OBJECT_COLUMNS = ['productType', 'capacityKg', 'liftHeightMm', 'pickingHeightMm', 'pricePolicy'];

function decode(value) {
  if (typeof value !== 'string') return value;
  const t = value.trim();
  if (!/^[[{]/.test(t)) return value;
  try { return JSON.parse(t); } catch { return value; }
}

/**
 * One index row in its typed shape. The sheet may carry JSON cells as strings and numbers or
 * booleans as text; empty columns are absent. Shop rows hold `applications` as free text — kept
 * apart (`applicationsText`), never a facet value.
 * @param {object} raw
 */
export function normalizeRow(raw) {
  const row = { ...raw };
  OBJECT_COLUMNS.forEach((c) => {
    if (row[c] !== undefined) row[c] = decode(row[c]);
    if (typeof row[c] !== 'object') delete row[c];
  });
  LIST_COLUMNS.forEach((c) => {
    const v = decode(row[c]);
    if (Array.isArray(v)) row[c] = v;
    else {
      if (c === 'applications' && typeof v === 'string' && v.trim()) row.applicationsText = v.trim();
      row[c] = [];
    }
  });
  const weight = Number(row.sortWeight);
  row.sortWeight = Number.isFinite(weight) ? weight : 0;
  row.explosionProof = row.explosionProof === true || row.explosionProof === 'true';
  return row;
}

function buildIndex(rawRows, sources) {
  const rows = rawRows.map(normalizeRow);
  const bySku = new Map(rows.map((r) => [r.sku, r]));
  return { rows, bySku, sources };
}

const cache = new Map();

/** Clears the memoized index and product entries (tests, or after a failed origin switch). */
export function resetCatalogCache() {
  cache.clear();
}

/**
 * The complete, normalised index — fetched once per page (memoized per index URL). A failed load
 * is not memoized, so a later block can retry.
 * @param {{fetch?: Function, location?: Location|URL}} [opts]
 * @returns {Promise<{rows: object[], bySku: Map<string, object>, sources: object}>}
 */
export function loadIndex(opts = {}) {
  const sources = catalogSources(opts.location || globalThis.location);
  const key = `index:${sources.indexUrl}`;
  if (!cache.has(key)) {
    const p = fetchCompleteIndex(sources.indexUrl, opts.fetch || globalThis.fetch)
      .then((raw) => buildIndex(raw, sources));
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return cache.get(key);
}

/* ---------------------------------------------------------------- lookups */

const isModelOrShop = (r) => r.kind === 'model' || r.kind === 'shop';

/**
 * A row by SKU (exact, then case-insensitive). A variant SKU resolves to the parent product page
 * with the variant's own name, image and shop link.
 * @param {object[]} rows
 * @param {string} sku
 */
export function findBySku(rows, sku) {
  if (!sku) return undefined;
  const want = String(sku).trim();
  const row = rows.find((r) => r.sku === want)
    || rows.find((r) => r.sku && r.sku.toLowerCase() === want.toLowerCase());
  if (!row || !row.parentSku) return row;
  const parent = rows.find((r) => r.sku === row.parentSku);
  if (!parent) return undefined;
  return {
    ...parent,
    sku: row.sku,
    name: row.name || parent.name,
    image: row.image || parent.image,
    imageAlt: row.imageAlt || parent.imageAlt,
    sourceUrl: row.url || parent.sourceUrl,
    parentSku: parent.sku,
  };
}

const byName = (a, b) => String(a.name).localeCompare(String(b.name), 'en', { numeric: true });

/** models: sortWeight desc then name; shop items: name */
export function compareRows(a, b) {
  if (a.kind === 'model' && b.kind === 'model') return (b.sortWeight - a.sortWeight) || byName(a, b);
  if (a.kind !== b.kind) return a.kind === 'model' ? -1 : 1;
  return byName(a, b);
}

/**
 * Members of a typed category id, in display order. Variant rows never carry categories.
 * @param {object[]} rows
 * @param {string} id
 */
export function membersOf(rows, id) {
  return rows
    .filter((r) => isModelOrShop(r) && r.categories.some((c) => c.id === id))
    .sort(compareRows);
}

/**
 * The category as described by its members (name, kind, url) — null when no row carries it.
 * @param {object[]} rows
 * @param {string} id
 */
export function categoryInfo(rows, id) {
  for (let i = 0; i < rows.length; i += 1) {
    const c = (rows[i].categories || []).find((cat) => cat.id === id);
    if (c) {
      return {
        id: c.id, name: c.name, kind: c.kind, url: c.url,
      };
    }
  }
  return null;
}

/** @returns {Promise<object|undefined>} */
export async function getBySku(sku, opts) {
  const { rows } = await loadIndex(opts);
  return findBySku(rows, sku);
}

/** @returns {Promise<{category: object, items: object[]}|null>} */
export async function getByCategory(id, opts) {
  const { rows } = await loadIndex(opts);
  const category = categoryInfo(rows, id);
  if (!category) return null;
  return { category, items: membersOf(rows, id) };
}

/**
 * The full Product Bus entry for a catalogue path (memoized).
 * @param {string} path e.g. /en/catalog/models/e10
 */
export function getProduct(path, opts = {}) {
  const sources = catalogSources(opts.location || globalThis.location);
  const url = sources.productUrl(path);
  const key = `product:${url}`;
  if (!cache.has(key)) {
    const p = getJson(url, opts.fetch || globalThis.fetch);
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return cache.get(key);
}

/* ---------------------------------------------------------------- references */

const CATEGORY_RE = /^(model|shop):([A-Za-z0-9][\w.-]*)$/i;
const SKU_RE = /^[A-Za-z0-9][\w.-]*$/;

/**
 * Reads an authored reference cell.
 * @param {string} text
 * @returns {{type: 'sku'|'category', id: string}|null}
 */
export function parseReference(text) {
  const t = String(text ?? '').trim();
  if (!t) return null;
  const cat = t.match(CATEGORY_RE);
  if (cat) return { type: 'category', id: `${cat[1].toLowerCase()}:${cat[2]}` };
  if (t.includes(':')) return null;
  if (SKU_RE.test(t)) return { type: 'sku', id: t };
  return null;
}

/* ---------------------------------------------------------------- formatting */

const numberFmt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

function money(value, currency) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency || 'GBP' }).format(Number(value));
}

const hasNumber = (v) => v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v));

/**
 * Shop price line. Models never carry a price; `onRequest` wins over any number; availability is
 * never inferred.
 * @param {object} row
 * @returns {null|{onRequest: true, text: string}|{onRequest: false, prefix: string,
 *   amount: string, suffix: string, regular: string|null, text: string}}
 */
export function formatPrice(row) {
  if (!row || row.kind === 'model') return null;
  const policy = row.pricePolicy || {};
  if (policy.onRequest) return { onRequest: true, text: 'Price on request' };
  if (!hasNumber(row.price)) return null;
  const prefix = policy.type === 'FROM' ? 'from ' : '';
  const suffix = policy.net ? 'excl. VAT' : '';
  const amount = money(row.price, row.currency);
  const regular = hasNumber(row.regularPrice) && Number(row.regularPrice) > Number(row.price)
    ? money(row.regularPrice, row.currency) : null;
  return {
    onRequest: false, prefix, amount, suffix, regular, text: `${prefix}${amount}${suffix ? ` ${suffix}` : ''}`,
  };
}

/**
 * The card image: absolute URLs pass through, relative Product Bus media (./media_<hash>.png)
 * resolve against the catalogue origin + the product path.
 * @param {object} row
 * @param {string} [base] catalogue origin
 */
export function imageUrl(row, base = DEFAULT_ORIGIN) {
  if (!row || !row.image) return null;
  try {
    return new URL(row.image, `${base}${row.path || CATALOG_ROOT}`).href;
  } catch {
    return null;
  }
}

function range(r, unit) {
  if (!r || !hasNumber(r.max) || Number(r.max) <= 0) return null;
  const min = hasNumber(r.min) ? Number(r.min) : Number(r.max);
  const max = Number(r.max);
  const text = min > 0 && min !== max
    ? `${numberFmt.format(min)} – ${numberFmt.format(max)}` : numberFmt.format(max);
  return `${text} ${unit}`;
}

const looksLikeFile = (s) => /\.(jpe?g|png|gif|webp|svg)$/i.test(String(s || '').trim());

/**
 * Everything a product card shows, as data (testable without a DOM).
 * @param {object} row
 * @param {string} [base] catalogue origin for images
 */
export function cardModel(row, base = DEFAULT_ORIGIN) {
  const facts = [];
  if (row.kind === 'model') {
    const cap = range(row.capacityKg, 'kg');
    const lift = range(row.liftHeightMm, 'mm');
    if (cap) facts.push({ key: 'loadcapacity', label: 'Load capacity', value: cap });
    if (lift) facts.push({ key: 'height', label: 'Lift height', value: lift });
  }
  const shopCategory = (row.categories || []).find((c) => c.id && c.id.startsWith('shop:') && c.id !== 'shop:all_products');
  const eyebrow = (row.productType && row.productType.name) || (shopCategory && shopCategory.name) || '';
  const altOk = row.imageAlt && !looksLikeFile(row.imageAlt) && row.imageAlt !== row.sku;
  const alt = altOk ? row.imageAlt : row.name;
  return {
    sku: row.sku,
    kind: row.kind,
    name: row.name,
    href: row.path || null,
    image: imageUrl(row, base),
    alt: alt || '',
    eyebrow,
    facts,
    price: formatPrice(row),
    shopUrl: row.kind === 'shop' && row.sourceUrl ? row.sourceUrl : null,
  };
}

/* ---------------------------------------------------------------- DOM */

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

/**
 * The shared product card (brand styles: styles/product-card.css, from the migrated finder
 * tiles). Primary link: the Product Bus page (relative `row.path`); shop items add the Linde Shop.
 * @param {object} row
 * @param {{base?: string, headingLevel?: number, wide?: boolean}} [opts]
 * @returns {HTMLElement}
 */
export function renderProductCard(row, opts = {}) {
  const m = cardModel(row, opts.base || catalogSources().imageBase);
  const card = el('article', `product-card product-card-${m.kind || 'item'}${opts.wide ? ' product-card-wide' : ''}`);
  card.dataset.sku = m.sku;
  const media = el(m.href ? 'a' : 'div', 'product-card-media');
  if (m.href) {
    media.href = m.href;
    media.tabIndex = -1;
    media.setAttribute('aria-hidden', 'true');
  }
  if (m.image) {
    const img = el('img');
    img.src = m.image;
    img.alt = m.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    media.append(img);
  }
  const body = el('div', 'product-card-body');
  if (m.eyebrow) body.append(el('p', 'product-card-eyebrow', m.eyebrow));
  const heading = el(`h${opts.headingLevel || 3}`, 'product-card-title');
  if (m.href) {
    const a = el('a', '', m.name);
    a.href = m.href;
    heading.append(a);
  } else heading.textContent = m.name;
  body.append(heading);
  if (m.facts.length) {
    const ul = el('ul', 'product-card-facts');
    m.facts.forEach((f) => {
      const li = el('li', `product-card-fact product-card-fact-${f.key}`);
      const icon = el('i', `icon product-card-icon-${f.key}`);
      icon.setAttribute('aria-hidden', 'true');
      li.append(
        icon,
        el('span', 'product-card-fact-label', `${f.label}: `),
        el('span', 'product-card-fact-value', f.value),
      );
      ul.append(li);
    });
    body.append(ul);
  }
  if (m.price) {
    const p = el('p', `product-card-price${m.price.onRequest ? ' product-card-price-on-request' : ''}`);
    if (m.price.onRequest) p.textContent = m.price.text;
    else {
      if (m.price.prefix) p.append(el('span', 'product-card-price-prefix', m.price.prefix.trim()), ' ');
      p.append(el('strong', 'product-card-price-amount', m.price.amount));
      if (m.price.suffix) p.append(' ', el('span', 'product-card-price-suffix', m.price.suffix));
      if (m.price.regular) {
        const s = el('s', 'product-card-price-regular', m.price.regular);
        s.setAttribute('aria-label', `was ${m.price.regular}`);
        p.append(' ', s);
      }
    }
    body.append(p);
  }
  const actions = el('p', 'product-card-actions');
  if (m.href) {
    const a = el('a', 'button primary product-card-link', m.kind === 'shop' ? 'View product' : 'View model');
    a.href = m.href;
    a.setAttribute('aria-label', `${a.textContent}: ${m.name}`);
    actions.append(a);
  }
  if (m.shopUrl) {
    const a = el('a', 'button secondary product-card-shop', 'View in Linde Shop');
    a.href = m.shopUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    actions.append(a);
  }
  if (actions.childElementCount) body.append(actions);
  card.append(media, body);
  return card;
}

/* ---------------------------------------------------------------- block helpers */

/** Preview / local hosts show author placeholders; the published site stays silent. */
export function isAuthorView(loc = globalThis.location) {
  if (!loc) return false;
  return loc.hostname.endsWith('.aem.page') || ['localhost', '127.0.0.1'].includes(loc.hostname);
}

/**
 * Unknown or failed reference: a dashed placeholder on .page / localhost, nothing (plus a console
 * warning) on the published site.
 * @param {HTMLElement} block
 * @param {string} message
 */
export function renderNotice(block, message) {
  // eslint-disable-next-line no-console
  console.warn(`[catalog] ${message}`);
  block.textContent = '';
  block.classList.remove('catalog-loading');
  if (isAuthorView()) {
    block.append(el('p', 'catalog-placeholder', message));
  } else {
    block.closest('.section')?.classList.add('catalog-empty');
    block.hidden = true;
  }
}

/** Reads the text of every authored row's first cell. */
export function rowTexts(block) {
  return [...block.children].map((row) => (row.firstElementChild || row).textContent.trim());
}

/** The shared card stylesheet (blocks pass it to aem.js loadCSS). */
export const CARD_STYLES = '/styles/product-card.css';

/** A dashed author placeholder (or nothing on the published site) for one unknown item. */
export function placeholderItem(message) {
  // eslint-disable-next-line no-console
  console.warn(`[catalog] ${message}`);
  if (!isAuthorView()) return null;
  return el('p', 'catalog-placeholder', message);
}

/**
 * Fills a block from the catalogue without blocking the page: the section renders at once, the
 * cards arrive when the index does; a failed load becomes the explicit notice (placeholder on
 * .page / localhost, hidden + console warning on the published site).
 * @param {HTMLElement} block
 * @param {() => Promise<void>} task
 */
export function populate(block, task) {
  block.classList.add('catalog-loading');
  block.setAttribute('aria-busy', 'true');
  return Promise.resolve()
    .then(task)
    .catch((e) => renderNotice(block, `Catalogue unavailable (${e.message})`))
    .finally(() => {
      block.classList.remove('catalog-loading');
      block.removeAttribute('aria-busy');
    });
}
