/*
 * product-finder — the New trucks finder on live Product Bus data.
 *
 * Authored block = config only: an optional first row holding a model category id
 * (`model:2375`) preselects that product type. Every tile, facet, count and range comes from the
 * catalogue index at runtime (scripts/catalog.js); filtering, facets and ordering live in
 * finder-model.js (pure, unit-tested). Tiles link to the Product Bus page (`row.path`).
 * The migrated look is kept (pf-* classes: selector tab, filter rail, tiles, result count);
 * compare / watch list and the Rental tab are gone.
 */
import { loadCSS } from '../../scripts/aem.js';
import {
  CARD_STYLES, cardModel, loadIndex, populate, renderNotice, rowTexts,
} from '../../scripts/catalog.js';
import {
  activeFilterCount, buildFacets, categoryFromSearch, filterRows, finderRows, initialState,
  parseFinderConfig,
} from './finder-model.js';

const PAGE_SIZE = 24;
const numberFmt = new Intl.NumberFormat('en-GB');

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

function icon(key) {
  const i = el('i', `icon pf-icon-${key}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function button(className, label, child) {
  const b = el('button', `pf-btn ${className}`.trim());
  b.type = 'button';
  if (label) b.setAttribute('aria-label', label);
  if (child) b.append(child);
  return b;
}

/* ---------------------------------------------------------------- tiles */

function tile(row, base) {
  const m = cardModel(row, base);
  const t = el('div', 'pf-tile product-tile');
  const wrap = el('div', 'pf-tile-image');
  const link = el('a', 'pf-tile-link');
  link.href = m.href;
  link.tabIndex = -1;
  link.setAttribute('aria-hidden', 'true');
  const ratio = el('div', 'pf-tile-ratio');
  if (m.image) {
    const img = el('img');
    img.src = m.image;
    img.alt = m.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    ratio.append(img);
  }
  link.append(ratio);
  wrap.append(link);
  const details = el('div', 'pf-tile-details');
  if (m.eyebrow) {
    const type = el('div', 'pf-tile-type');
    type.append(el('p', '', m.eyebrow));
    details.append(type);
  }
  const h = el('h3');
  const a = el('a', '', m.name);
  a.href = m.href;
  h.append(a);
  details.append(h);
  if (m.facts.length) {
    const ul = el('ul', 'pf-tile-specs');
    m.facts.forEach((f) => {
      const li = el('li');
      li.append(icon(f.key), el('span', 'pf-sr', `${f.label}: `), el('span', 'pf-tile-spec-value', f.value));
      ul.append(li);
    });
    details.append(ul);
  }
  const buttons = el('div', 'pf-tile-buttons');
  const p = el('p');
  const cta = el('a', 'pf-tile-button');
  cta.href = m.href;
  cta.setAttribute('aria-label', `Details: ${m.name}`);
  const ctaIcon = icon('arrowright');
  ctaIcon.classList.add('pf-tile-button-icon');
  cta.append(ctaIcon, el('span', 'pf-tile-button-label', 'Details'));
  p.append(cta);
  buttons.append(p);
  t.append(wrap, details, buttons);
  return t;
}

/* ---------------------------------------------------------------- filter rail */

function group(key, glyph, title, open) {
  const li = el('li', `pf-group pf-group-${key}${open ? ' pf-group-open' : ''}`);
  const header = el('button', 'pf-group-header');
  header.type = 'button';
  header.setAttribute('aria-expanded', open ? 'true' : 'false');
  const ic = el('span', 'pf-group-icon');
  ic.append(icon(glyph));
  const add = el('span', 'pf-group-add');
  add.append(icon('down'));
  header.append(ic, el('span', 'pf-group-name', title), add);
  const flyout = el('div', 'pf-group-flyout');
  flyout.id = `pf-flyout-${key}`;
  header.setAttribute('aria-controls', flyout.id);
  const back = button('pf-btn-plain pf-group-back', `Back from ${title}`, icon('left'));
  back.append(el('span', '', title));
  const filters = el('div', 'pf-group-filters');
  flyout.append(back, filters);
  const pills = el('div', 'pf-group-pills');
  li.append(header, flyout, pills);
  const toggle = (force) => {
    const next = force ?? !li.classList.contains('pf-group-open');
    li.classList.toggle('pf-group-open', next);
    header.setAttribute('aria-expanded', next ? 'true' : 'false');
  };
  header.addEventListener('click', () => toggle());
  back.addEventListener('click', () => { toggle(false); header.focus(); });
  return { li, filters, pills };
}

function checkList(name, options, selected, onChange) {
  const ul = el('ul', 'pf-check-fields');
  options.forEach((o) => {
    const li = el('li', 'pf-filter');
    const label = el('label', 'pf-checkbox');
    const input = el('input');
    input.type = 'checkbox';
    input.name = name;
    input.value = o.id;
    input.checked = selected.includes(o.id);
    input.disabled = !o.count && !input.checked;
    input.addEventListener('change', () => onChange(o.id, input.checked));
    const span = el('span');
    span.append(o.name, ' ', el('span', 'pf-option-count', `(${o.count})`));
    label.append(input, span);
    li.append(label);
    ul.append(li);
  });
  return ul;
}

function rangeFields(name, unit, boundsRange, value, onChange) {
  const box = el('div', 'pf-range');
  const ul = el('ul', 'pf-range-fields');
  [['min', 'Min'], ['max', 'Max']].forEach(([k, label]) => {
    const li = el('li', 'pf-range-field');
    const id = `pf-${name}-${k}`;
    const lab = el('label', 'pf-range-label', `${label} (${unit})`);
    lab.htmlFor = id;
    const input = el('input');
    input.type = 'number';
    input.id = id;
    input.inputMode = 'numeric';
    input.min = boundsRange.min;
    input.max = boundsRange.max;
    input.step = name === 'capacity' ? 100 : 50;
    input.placeholder = numberFmt.format(k === 'min' ? boundsRange.min : boundsRange.max);
    if (value[k] !== null && value[k] !== undefined) input.value = value[k];
    input.addEventListener('change', () => onChange(k, input.value === '' ? null : Number(input.value)));
    li.append(lab, input, el('span', 'pf-range-unit', unit));
    ul.append(li);
  });
  box.append(ul);
  return box;
}

function pill(text, onRemove) {
  const b = button('pf-pill', `Remove filter ${text}`);
  b.append(el('span', '', text), icon('close'));
  b.addEventListener('click', onRemove);
  return b;
}

/* ---------------------------------------------------------------- finder */

function buildFinder(block, index, config) {
  const all = finderRows(index.rows);
  const base = index.sources.imageBase;
  let state = initialState(config);
  let shown = PAGE_SIZE;
  const open = new Set(config.category ? ['types'] : []);

  // selector band: the New trucks tab (Rental is not part of the catalogue)
  const selector = el('div', 'pf-selector');
  const selectorWrap = el('div', 'pf-selector-wrap');
  const tabs = el('ul', 'pf-tabs');
  const tab = el('li', 'pf-tab pf-tab-active');
  const tabIcon = el('div', 'pf-tab-icon');
  tabIcon.append(icon('forklift'));
  const tabName = el('div', 'pf-tab-name');
  tabName.append(el('div', 'pf-tab-label', 'New trucks'), el('div', 'pf-tab-count', String(all.length)));
  tab.append(tabIcon, tabName);
  tabs.append(tab);
  selectorWrap.append(tabs);
  selector.append(selectorWrap);

  // mobile toolbar: the filter button opens the rail
  const bar = el('div', 'pf-toolbar');
  const barInner = el('div', 'pf-toolbar-inner');
  const filterBtn = button('pf-btn-icon pf-toolbar-btn pf-toolbar-filter', 'Filter', icon('sfilter'));
  const filterCounter = el('span', 'pf-counter');
  filterBtn.append(filterCounter);
  barInner.append(filterBtn);
  bar.append(barInner);

  const finder = el('div', 'pf-finder');
  const rail = el('div', 'pf-rail');
  rail.setAttribute('aria-label', 'Filters');
  const railHeader = el('div', 'pf-rail-header');
  const railBack = button('pf-btn-icon pf-btn-plain pf-rail-back', 'Close filters', icon('left'));
  const railTitle = el('div', 'pf-rail-title');
  railHeader.append(railBack, railTitle);
  const groups = el('ul', 'pf-groups');
  rail.append(railHeader, groups);

  const products = el('div', 'pf-products');
  const sort = el('p', 'pf-sort');
  sort.setAttribute('aria-live', 'polite');
  const grid = el('div', 'pf-grid');
  const moreWrap = el('div', 'pf-more');
  const more = button('pf-btn-primary pf-more-btn', '');
  moreWrap.append(more);
  const empty = el('div', 'pf-empty');
  empty.hidden = true;
  products.append(sort, grid, moreWrap, empty);
  finder.append(rail, products);

  const setRail = (isOpen) => {
    block.classList.toggle('pf-rail-open', isOpen);
    document.body.style.overflowY = isOpen ? 'hidden' : '';
    filterBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };
  filterBtn.addEventListener('click', () => setRail(true));
  railBack.addEventListener('click', () => { setRail(false); filterBtn.focus(); });

  let render;
  const update = (patch) => {
    state = { ...state, ...patch };
    shown = PAGE_SIZE;
    render();
  };
  const toggleIn = (key, id, on) => {
    const list = state[key].filter((v) => v !== id);
    update({ [key]: on ? [...list, id] : list });
  };

  // search stays mounted (typing must not lose focus on re-render)
  const searchLi = el('li', 'pf-search');
  const searchInput = el('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search model';
  searchInput.setAttribute('aria-label', 'Search model');
  searchInput.addEventListener('input', () => update({ q: searchInput.value }));
  searchLi.append(searchInput);

  const resetLi = el('li', 'pf-reset');
  const resetBtn = button('pf-btn-plain', '');
  resetBtn.textContent = 'Reset all filters';
  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    update(initialState({ category: null }));
  });
  resetLi.append(resetBtn);

  const facetDefs = [
    ['types', 'producttype', 'Product Type'],
    ['applications', 'application', 'Applications'],
    ['capacity', 'loadcapacity', 'Load Capacity'],
    ['lift', 'height', 'Lift Height'],
    ['drive', 'drivetype', 'Drive Types'],
    ['explosionProof', 'explosionproof', 'Explosion Protection'],
  ];

  render = () => {
    const results = filterRows(all, state);
    const facets = buildFacets(all, state);
    // rail groups (rebuilt; their open state is kept)
    groups.textContent = '';
    groups.append(searchLi);
    facetDefs.forEach(([key, glyph, title]) => {
      const g = group(key, glyph, title, open.has(key));
      g.li.querySelector('.pf-group-header').addEventListener('click', () => {
        if (open.has(key)) open.delete(key); else open.add(key);
      });
      g.li.querySelector('.pf-group-back').addEventListener('click', () => open.delete(key));
      if (key === 'types' || key === 'applications' || key === 'drive') {
        const onPick = (id, on) => toggleIn(key, id, on);
        g.filters.append(checkList(key, facets[key], state[key], onPick));
        facets[key].filter((o) => state[key].includes(o.id))
          .forEach((o) => g.pills.append(pill(o.name, () => toggleIn(key, o.id, false))));
      } else if (key === 'capacity' || key === 'lift') {
        const unit = key === 'capacity' ? 'kg' : 'mm';
        g.filters.append(rangeFields(key, unit, facets[key], state[key], (k, v) => {
          update({ [key]: { ...state[key], [k]: v } });
        }));
        const r = state[key];
        if (r.min !== null || r.max !== null) {
          const fmt = (v) => (v !== null ? numberFmt.format(v) : '…');
          const text = `${fmt(r.min)} – ${fmt(r.max)} ${unit}`;
          g.pills.append(pill(text, () => update({ [key]: { min: null, max: null } })));
        }
      } else {
        const only = [{ id: 'yes', name: 'Explosion-protected trucks only', count: facets.explosionProof }];
        const picked = state.explosionProof ? ['yes'] : [];
        g.filters.append(checkList(key, only, picked, (id, on) => update({ explosionProof: on })));
        if (state.explosionProof) {
          g.pills.append(pill('Explosion-protected', () => update({ explosionProof: false })));
        }
      }
      groups.append(g.li);
    });
    groups.append(resetLi);
    resetLi.hidden = !activeFilterCount(state) && !state.q;

    // results
    const label = `${results.length} ${results.length === 1 ? 'Product' : 'Products'}`;
    sort.textContent = label;
    railTitle.textContent = label;
    const n = activeFilterCount(state);
    filterCounter.textContent = n ? String(n) : '';
    filterCounter.hidden = !n;
    grid.textContent = '';
    results.slice(0, shown).forEach((row) => grid.append(tile(row, base)));
    more.textContent = `Show all (${results.length})`;
    moreWrap.hidden = results.length <= shown;
    empty.hidden = results.length > 0;
    if (!results.length) {
      empty.textContent = '';
      empty.append(el('p', '', 'No trucks match these filters.'));
      const r = button('pf-btn-primary', '');
      r.textContent = 'Reset all filters';
      r.addEventListener('click', () => resetBtn.click());
      empty.append(r);
    }
  };
  more.addEventListener('click', () => { shown = Infinity; render(); });

  render();
  block.append(selector, bar, finder);
}

export default function decorate(block) {
  const authored = parseFinderConfig(rowTexts(block));
  // a link such as ?productTypes[]=2374 ("Show all pallet stackers") wins over the block config
  const config = { category: categoryFromSearch(window.location.search) || authored.category };
  block.textContent = '';
  loadCSS(`${window.hlx.codeBasePath}${CARD_STYLES}`);
  populate(block, async () => {
    const index = await loadIndex();
    if (!index.rows.some((r) => r.kind === 'model')) {
      renderNotice(block, 'Product finder: the catalogue has no models');
      return;
    }
    buildFinder(block, index, config);
  });
}
