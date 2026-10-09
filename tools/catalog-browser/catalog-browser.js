/*
 * Catalogue Browser — DA / Experience Workspace inline plugin (right rail).
 *
 * Browses the Product Bus index (scripts/catalog.js loader: same origin on .aem.network,
 * `?catalog=fixture` on localhost) and inserts REFERENCES ONLY into the edited document:
 * product-reference / product-collection / category-reference tables and bare ids, through
 * actions.sendHTML / actions.sendText. The IMS token the SDK carries is never read, logged,
 * stored or forwarded. Opened standalone (no SDK), the browser is read-only.
 */
/* eslint-disable no-use-before-define -- render() and the panels call each other by design */
import {
  catalogSources, deliveryUrl, loadIndex, resetCatalogCache,
} from '../../scripts/catalog.js';
import {
  categoryGroups, categoryPreview, dataSummary, insertContext, listItem, productTypes,
  searchProducts, toggleSelection,
} from './browse-model.js';
import {
  categoryReferenceHTML, productCollectionHTML, productReferenceHTML, referenceText,
} from './serialize.js';

const SDK_URL = 'https://da.live/nx/utils/sdk.js';
const SDK_TIMEOUT_MS = 3000;

const ui = {
  tab: 'products',
  q: '',
  kind: 'all',
  type: '',
  variants: false,
  selected: [],
  preview: null,
};
let index = null;
let loadedAt = null;
let loadError = null;
let sdk = { context: null, actions: null };
let guard = insertContext(null);

const root = document.getElementById('catalog-browser');

/* ---------------------------------------------------------------- helpers */

function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k in n && typeof v !== 'string') n[k] = v;
    else n.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => {
    if (c !== null && c !== undefined && c !== false) n.append(c);
  });
  return n;
}

let toastTimer;
function toast(message, kind = 'ok') {
  const t = root.querySelector('.cb-toast');
  if (!t) return;
  t.textContent = message;
  t.className = `cb-toast cb-toast-${kind}`;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3000);
}

/** serializes first (throws on anything unknown), then hands the string to the editor */
function insert(label, make, send) {
  if (!guard.canInsert || !sdk.actions) {
    toast(guard.reason || 'Inserting is not available.', 'error');
    return;
  }
  try {
    const payload = make();
    if (send === 'text') sdk.actions.sendText(payload);
    else sdk.actions.sendHTML(payload);
    toast(`Inserted ${label}`);
  } catch (e) {
    toast(e.message, 'error');
  }
}

function actionButton(text, title, onclick, primary = false) {
  return el('button', {
    type: 'button',
    class: `cb-btn${primary ? ' cb-btn-primary' : ''}`,
    title,
    disabled: !guard.canInsert,
    onclick,
  }, text);
}

/* ---------------------------------------------------------------- products */

function productRow(row) {
  const item = listItem(row, index.rows, catalogSources().imageBase);
  const checked = ui.selected.includes(item.sku);
  const pos = ui.selected.indexOf(item.sku) + 1;
  return el(
    'li',
    { class: `cb-item${item.isVariant ? ' cb-item-variant' : ''}${checked ? ' cb-item-selected' : ''}` },
    el(
      'label',
      { class: 'cb-check', title: 'Select for a collection' },
      el('input', {
        type: 'checkbox',
        checked,
        'aria-label': `Select ${item.sku} for a collection`,
        onchange: () => { ui.selected = toggleSelection(ui.selected, item.sku); render(); },
      }),
      pos ? el('span', { class: 'cb-pos', 'aria-hidden': 'true' }, String(pos)) : null,
    ),
    el('div', { class: 'cb-thumb' }, item.image ? el('img', {
      src: item.image, alt: '', loading: 'lazy', decoding: 'async',
    }) : null),
    el(
      'div',
      { class: 'cb-meta' },
      el('div', { class: 'cb-name', title: item.name }, item.name),
      el(
        'div',
        { class: 'cb-line' },
        el('code', { class: 'cb-sku' }, item.sku),
        el('span', { class: `cb-badge cb-badge-${item.isVariant ? 'variant' : item.kind}` }, item.kindLabel),
      ),
      item.price ? el('div', { class: 'cb-price' }, item.price) : null,
      el(
        'div',
        { class: 'cb-actions' },
        actionButton('Insert card', `Insert a product-reference block for ${item.sku}`, () => insert(
          `product card ${item.sku}`,
          () => productReferenceHTML(item.sku, index),
        )),
        actionButton('Insert SKU', `Insert the SKU ${item.sku} as text`, () => insert(
          `SKU ${item.sku}`,
          () => referenceText(item.sku, 'sku', index),
          'text',
        )),
      ),
    ),
  );
}

function productsPanel() {
  const types = productTypes(index.rows);
  const filters = el(
    'div',
    { class: 'cb-filters' },
    el('input', {
      type: 'search',
      class: 'cb-search',
      placeholder: 'Search name or SKU',
      'aria-label': 'Search name or SKU',
      value: ui.q,
      oninput: (e) => { ui.q = e.target.value; renderList(); },
    }),
    el(
      'div',
      { class: 'cb-row' },
      el(
        'select',
        { class: 'cb-select', 'aria-label': 'Kind', onchange: (e) => { ui.kind = e.target.value; render(); } },
        [['all', 'All'], ['model', 'Truck models'], ['shop', 'UK Shop']]
          .map(([v, t]) => el('option', { value: v, selected: ui.kind === v }, t)),
      ),
      el(
        'select',
        { class: 'cb-select', 'aria-label': 'Product type', onchange: (e) => { ui.type = e.target.value; render(); } },
        el('option', { value: '', selected: !ui.type }, 'All product types'),
        types.map((t) => el('option', { value: t.id, selected: ui.type === t.id }, `${t.name} (${t.count})`)),
      ),
    ),
    el(
      'label',
      { class: 'cb-toggle' },
      el('input', { type: 'checkbox', checked: ui.variants, onchange: (e) => { ui.variants = e.target.checked; render(); } }),
      ' Show variants',
    ),
  );
  const count = el('p', { class: 'cb-count', 'aria-live': 'polite' });
  const list = el('ul', { class: 'cb-list' });
  const fill = () => {
    const r = searchProducts(index.rows, ui);
    count.textContent = `${r.length} ${r.length === 1 ? 'result' : 'results'}`;
    list.textContent = '';
    if (!r.length) list.append(el('li', { class: 'cb-empty' }, 'No products match.'));
    r.forEach((row) => list.append(productRow(row)));
  };
  fill();
  renderList = () => fill();
  const selection = ui.selected.length ? el(
    'div',
    { class: 'cb-selection' },
    el('div', { class: 'cb-selection-text' }, `${ui.selected.length} selected: `, el('code', {}, ui.selected.join(', '))),
    el(
      'div',
      { class: 'cb-actions' },
      el('button', { type: 'button', class: 'cb-btn', onclick: () => { ui.selected = []; render(); } }, 'Clear'),
      actionButton('Insert collection', 'Insert one product-collection block, one SKU per row in selection order', () => insert(
        `collection of ${ui.selected.length}`,
        () => productCollectionHTML(ui.selected, index),
      ), true),
    ),
  ) : null;
  return el('section', { class: 'cb-panel', 'aria-label': 'Products' }, filters, count, list, selection);
}

// replaced per render so typing in the search box keeps focus
let renderList = () => {};

/* ---------------------------------------------------------------- categories */

function categoriesPanel() {
  const groups = categoryGroups(index.rows);
  return el(
    'section',
    { class: 'cb-panel', 'aria-label': 'Categories' },
    groups.map((g) => el(
      'div',
      { class: 'cb-group' },
      el('h2', { class: 'cb-group-title' }, g.label),
      el('ul', { class: 'cb-list' }, g.items.map((c) => {
        const open = ui.preview === c.id;
        return el(
          'li',
          { class: `cb-item cb-cat${open ? ' cb-cat-open' : ''}` },
          el(
            'div',
            { class: 'cb-meta' },
            el('button', {
              type: 'button',
              class: 'cb-cat-name',
              'aria-expanded': open ? 'true' : 'false',
              title: 'Preview the members (not inserted)',
              onclick: () => { ui.preview = open ? null : c.id; render(); },
            }, c.name),
            el('div', { class: 'cb-line' }, el('code', { class: 'cb-sku' }, c.id), el('span', { class: 'cb-badge' }, `${c.count} ${c.count === 1 ? 'member' : 'members'}`)),
            el(
              'div',
              { class: 'cb-actions' },
              actionButton('Insert category list', `Insert a category-reference block for ${c.id}`, () => insert(
                `category list ${c.id}`,
                () => categoryReferenceHTML(c.id, index),
              )),
              actionButton('Insert ID', `Insert the id ${c.id} as text`, () => insert(
                `id ${c.id}`,
                () => referenceText(c.id, 'category', index),
                'text',
              )),
            ),
            open ? el(
              'ol',
              { class: 'cb-preview', 'aria-label': `Members of ${c.name} (preview only)` },
              categoryPreview(index.rows, c.id).map((r) => el('li', {}, r.name, ' ', el('code', {}, r.sku))),
            ) : null,
          ),
        );
      })),
    )),
  );
}

/* ---------------------------------------------------------------- shell */

function errorPanel() {
  if (loadError.code === 'unavailable') {
    // the Product Bus has no CORS: the browser only reads the catalogue on *.aem.network
    return el(
      'section',
      { class: 'cb-panel cb-error', role: 'status' },
      el('h2', {}, 'Product data is shown on the delivery host'),
      el('p', {}, 'This page is not on *.aem.network, so the catalogue is not loaded here.'),
      el('p', {}, el('a', { href: deliveryUrl(), target: '_blank', rel: 'noopener' }, 'Open the Catalogue Browser on the delivery host')),
    );
  }
  const offline = loadError instanceof TypeError || /fetch|network|abort|timed? ?out/i.test(loadError.message);
  const title = offline ? 'Cannot reach the Product Bus' : 'The catalogue index could not be read';
  const detail = offline
    ? 'Network error (offline, blocked or not routed). Nothing was loaded.'
    : loadError.message;
  return el(
    'section',
    { class: 'cb-panel cb-error', role: 'alert' },
    el('h2', {}, title),
    el('p', {}, detail),
    el('p', { class: 'cb-hint' }, `Source: ${catalogSources().indexUrl}`),
  );
}

function render() {
  const notice = guard.canInsert ? null : el('p', { class: 'cb-notice', role: 'status' }, guard.reason);
  const tabs = el(
    'div',
    { class: 'cb-tabs', role: 'tablist' },
    [['products', 'Products'], ['categories', 'Categories']].map(([key, label]) => el('button', {
      type: 'button',
      role: 'tab',
      class: 'cb-tab',
      'aria-selected': ui.tab === key ? 'true' : 'false',
      onclick: () => { ui.tab = key; render(); window.scrollTo(0, 0); },
    }, label)),
  );
  let body;
  if (loadError) body = errorPanel();
  else if (!index) body = el('p', { class: 'cb-loading' }, 'Loading the catalogue…');
  else if (!index.rows.length) {
    body = el('section', { class: 'cb-panel cb-error', role: 'status' }, el('h2', {}, 'The catalogue is empty'), el('p', {}, 'The index loaded but holds 0 records.'));
  } else body = ui.tab === 'products' ? productsPanel() : categoriesPanel();
  const summary = index && !loadError ? dataSummary(index.rows.length, loadedAt) : 'Data: Product Bus, not loaded';
  const footer = el(
    'footer',
    { class: 'cb-footer' },
    el('span', {}, summary),
    el('button', { type: 'button', class: 'cb-btn', onclick: () => refresh() }, 'Refresh'),
  );
  const toastEl = el('div', {
    class: 'cb-toast', role: 'status', 'aria-live': 'polite', hidden: true,
  });
  // keep the search box focused across re-renders
  const active = document.activeElement && document.activeElement.classList.contains('cb-search');
  root.textContent = '';
  root.append(tabs, notice || '', body, footer, toastEl);
  root.removeAttribute('aria-busy');
  if (active) {
    const s = root.querySelector('.cb-search');
    if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
  }
}

async function refresh() {
  resetCatalogCache();
  index = null;
  loadError = null;
  render();
  try {
    index = await loadIndex();
    loadedAt = new Date();
  } catch (e) {
    loadError = e;
  }
  render();
}

async function initSdk() {
  if (window.parent === window) return null; // opened standalone: no editor to talk to
  try {
    const mod = await import(SDK_URL);
    const timeout = new Promise((resolve) => { setTimeout(() => resolve(null), SDK_TIMEOUT_MS); });
    const ready = await Promise.race([mod.default, timeout]);
    if (!ready) return null;
    // keep only what the plugin needs; the token in `ready` is never read or kept
    return { context: ready.context || null, actions: ready.actions || null };
  } catch {
    return null;
  }
}

(async () => {
  render();
  const [connected] = await Promise.all([initSdk(), refresh()]);
  if (connected && connected.actions) sdk = connected;
  guard = insertContext(sdk.actions ? sdk.context : null);
  render();
})();
