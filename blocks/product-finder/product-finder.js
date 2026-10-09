/**
 * product-finder — the finder page of the `productfinder` template (source /en/Productfinder.html
 * and /en/Products/Productfinder/; stardust/dynamic-features.md rows 7 + 11: the host-bound finder
 * API is DEAD on the target, so the block ships the captured result set as a STATIC SNAPSHOT —
 * filters rendered as captured in their closed state, no client fetch, compare/watch list inert).
 *
 * Authored rows (the vocabulary stardust/rollout/encoders/productfinder.mjs emits); every
 * keyed row is [key cell | content cell], key cell = <p><code>type</code> <code>flag</code>…</p>:
 *   tab <glyph> [active]   | <p>label</p><p>count</p>            → selector tab (New / Rental)
 *   toolbar                | <p>n</p><p>n</p>                    → mobile compare / filter buttons
 *   results                | <p><strong>n</strong> Products</p>  → mobile rail header
 *   search [hidden]        | (empty)                             → model search input
 *   filter <glyph> <kind> [hidden] | <p><strong>name</strong></p> [<p>question</p>] <ul>…</ul>
 *                            <p>Reset this filter</p> [<p><strong>t</strong></p><p>text</p>]
 *                            kind check: one <li> per checkbox; range / range2:
 *                            <li>Min <em>unit</em></li> [<li>Max <em>unit</em></li>];
 *                            text: <li><em>placeholder</em></li> per input
 *   reset                  | <p>Reset all filters</p>
 *   compare                | <p>n</p><p>title</p><p>drop text</p><ul><li>action</li>…</ul>
 *   more                   | <p>Show all</p>
 *   tile (no key)          | [img] [<p>product type</p><h3><a>name</a></h3>
 *                            <ul><li><code>glyph</code> value</li>…</ul><p><a>Details</a></p>]
 * Decode: template-slotted for selector, toolbar, rail header, reset, compare and load-more;
 * reconstructive for the filter groups and the product tiles (node-slotting EW1–EW3: authored
 * <p>/<h3>/<ul>/<li>/<img> MOVE into generated wrappers; the tile picture is wrapped in a link
 * repeating the title's href, EW6). Nothing is fetched; no control has a handler.
 * @ew-exempt <p> key cell descriptor (code tokens) — text-as-metadata, never displayed
 * @ew-exempt <code> glyph keys inside tab / spec items — text-as-metadata (icon), the value stays
 * @ew-exempt <em> placeholder text of a text filter — mirrored into the input's placeholder
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function icon(key) {
  const i = el('i', `icon pf-icon-${key}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function btn(className, child) {
  const b = el('div', `pf-btn ${className}`.trim());
  b.setAttribute('role', 'button');
  if (child) b.append(child);
  return b;
}

function asButton(node, className) {
  const a = node.querySelector('a[href]');
  if (!a) return btn(className, node);
  a.className = `pf-btn ${className}`.trim();
  return node;
}

/* DA transport unwraps a single-paragraph cell: the key cell arrives as bare <code> children,
   a one-line body as bare text — both shapes are read (the harness keeps the <p>). */
function keyOf(cell) {
  if (!cell || !cell.firstElementChild) return null;
  const host = cell.firstElementChild.tagName === 'P' ? cell.firstElementChild : cell;
  const codes = [...host.children].filter((c) => c.tagName === 'CODE');
  if (!codes.length || host.firstElementChild.tagName !== 'CODE') return null;
  const tokens = codes.map((c) => c.textContent.trim());
  if (host === cell) [...cell.childNodes].forEach((n) => n.remove());
  else host.remove();
  return tokens;
}

function paragraphs(cell) {
  const ps = [...cell.children].filter((c) => c.tagName === 'P');
  if (ps.length || !cell.textContent.trim()) return ps;
  const p = el('p');
  while (cell.firstChild) p.append(cell.firstChild);
  cell.append(p);
  return [p];
}

function tab(body, flags) {
  const li = el('li', `pf-tab${flags.includes('active') ? ' pf-tab-active' : ''}`);
  const ic = el('div', 'pf-tab-icon');
  ic.append(icon(flags[0] || 'forklift'));
  const name = el('div', 'pf-tab-name');
  const [label, count] = paragraphs(body);
  const labelWrap = el('div', 'pf-tab-label');
  if (label) labelWrap.append(label);
  name.append(labelWrap);
  if (count) {
    const countWrap = el('div', 'pf-tab-count');
    countWrap.append(count);
    name.append(countWrap);
  }
  li.append(ic, name);
  return li;
}

function toolbar(body) {
  const bar = el('div', 'pf-toolbar');
  const inner = el('div', 'pf-toolbar-inner');
  const [compareN, filterN] = paragraphs(body);
  [['pf-toolbar-compare', 'needle', compareN], ['pf-toolbar-filter', 'sfilter', filterN]]
    .forEach(([cls, glyph, counter]) => {
      const b = btn(`pf-btn-icon pf-toolbar-btn ${cls}`, icon(glyph));
      if (counter) {
        const c = el('div', 'pf-counter');
        c.append(counter);
        b.append(c);
      }
      inner.append(b);
    });
  bar.append(inner);
  return bar;
}

function railHeader(body) {
  const head = el('div', 'pf-rail-header');
  head.append(btn('pf-btn-icon pf-btn-plain pf-rail-back', icon('left')));
  const title = el('div', 'pf-rail-title');
  paragraphs(body).forEach((p) => title.append(p));
  head.append(title, el('div', 'pf-rail-spinner'));
  return head;
}

function search(flags) {
  const li = el('li', `pf-search${flags.includes('hidden') ? ' pf-hidden' : ''}`);
  const wrap = el('div', 'pf-filter');
  const input = el('input');
  input.type = 'text';
  input.setAttribute('aria-label', 'Model');
  wrap.append(input);
  li.append(wrap);
  return li;
}

function rangeOptions(list, double) {
  const box = el('div', `pf-range${double ? ' pf-range-double' : ''}`);
  const sliders = el('div', 'pf-range-sliders');
  for (let i = 0; i < (double ? 2 : 1); i += 1) {
    const r = el('input', i === 0 && !double ? 'pf-range-fill' : '');
    r.type = 'range';
    r.setAttribute('aria-label', i === 0 ? 'Min' : 'Max');
    sliders.append(r);
  }
  box.append(sliders);
  list.classList.add('pf-range-fields');
  [...list.children].forEach((li) => {
    li.classList.add('pf-range-field');
    const unit = li.querySelector('em');
    const label = el('label', 'pf-range-label');
    [...li.childNodes].forEach((n) => { if (n !== unit) label.append(n); });
    const input = el('input');
    input.type = 'number';
    li.append(label, input);
    if (unit) {
      const u = el('span', 'pf-range-unit');
      u.append(unit);
      li.append(u);
    }
  });
  box.append(list);
  return box;
}

function textOptions(list) {
  list.classList.add('pf-text-fields');
  [...list.children].forEach((li) => {
    li.classList.add('pf-filter');
    const em = li.querySelector('em');
    const input = el('input');
    input.type = 'text';
    if (em) {
      input.placeholder = em.textContent.trim();
      input.setAttribute('aria-label', input.placeholder);
      em.remove();
    }
    li.append(input);
  });
  return list;
}

function checkOptions(list) {
  list.classList.add('pf-check-fields');
  [...list.children].forEach((li) => {
    li.classList.add('pf-filter');
    const label = el('label', 'pf-checkbox');
    const input = el('input');
    input.type = 'checkbox';
    const span = el('span');
    while (li.firstChild) span.append(li.firstChild);
    label.append(input, span);
    li.append(label);
  });
  return list;
}

function filterGroup(body, flags) {
  const [glyph, kind] = flags;
  const li = el('li', `pf-group${flags.includes('hidden') ? ' pf-hidden' : ''}`);
  const header = el('div', 'pf-group-header');
  const ic = el('div', 'pf-group-icon');
  ic.append(icon(glyph || 'producttype'));
  const name = el('div', 'pf-group-name');
  const add = el('div', 'pf-group-add');
  add.append(icon('down'));
  const list = body.querySelector('ul');
  const before = [];
  const after = [];
  paragraphs(body).forEach((p) => {
    const rel = list ? list.compareDocumentPosition(p) : 0;
    // eslint-disable-next-line no-bitwise
    if (!list || rel & Node.DOCUMENT_POSITION_PRECEDING) before.push(p); else after.push(p);
  });
  if (before.length) name.append(before.shift());
  header.append(ic, name, add);
  const flyout = el('div', 'pf-group-flyout');
  const question = el('div', 'pf-group-question');
  before.forEach((p) => question.append(p));
  flyout.append(question);
  const wrap = el('div', 'pf-group-filters');
  if (list) {
    if (kind === 'range' || kind === 'range2') wrap.append(rangeOptions(list, kind === 'range2'));
    else if (kind === 'text') wrap.append(textOptions(list));
    else wrap.append(checkOptions(list));
  }
  flyout.append(wrap);
  if (after.length) {
    const reset = el('div', 'pf-group-reset');
    reset.append(btn('pf-btn-plain', after.shift()));
    flyout.append(reset);
  }
  if (after.length) {
    const extra = el('div', 'pf-group-extra');
    after.forEach((p, i) => {
      const w = el('div', i === 0 ? 'pf-group-extra-title' : 'pf-group-extra-text');
      w.append(p);
      extra.append(w);
    });
    flyout.append(extra);
  }
  li.append(header, flyout, el('div', 'pf-group-pills'));
  return li;
}

function resetAll(body) {
  const li = el('li', 'pf-reset');
  const p = paragraphs(body)[0];
  li.append(btn('pf-btn-plain', p));
  return li;
}

function compare(body) {
  const wrap = el('div', 'pf-compare-wrap');
  const panel = el('div', 'pf-compare');
  const [count, title, drop] = paragraphs(body);
  const header = el('div', 'pf-compare-header');
  const countWrap = el('div', 'pf-compare-count');
  if (count) countWrap.append(count);
  const titleWrap = el('div', 'pf-compare-title');
  if (title) titleWrap.append(title);
  header.append(countWrap, titleWrap, icon('down'));
  const dropzone = el('div', 'pf-compare-dropzone');
  const dropText = el('div', 'pf-compare-drop-text');
  if (drop) dropText.append(drop);
  dropzone.append(icon('addpin'), dropText);
  const content = el('div', 'pf-compare-content');
  content.append(el('div', 'pf-compare-added'));
  panel.append(header, dropzone, content);
  const actions = body.querySelector('ul');
  if (actions) {
    actions.classList.add('pf-compare-actions');
    [...actions.children].forEach((li, i) => {
      const cls = i === 0 ? 'pf-btn-primary' : 'pf-btn-grey';
      if (li.querySelector('a[href]')) asButton(li, cls);
      else {
        const b = btn(cls);
        while (li.firstChild) b.append(li.firstChild);
        li.append(b);
      }
    });
    panel.append(actions);
  }
  wrap.append(panel);
  return wrap;
}

function more(body) {
  const link = el('div', 'pf-more');
  link.append(asButton(paragraphs(body)[0], ''));
  return link;
}

function tile(cells) {
  const img = cells.find((c) => c.querySelector('img, picture'));
  const body = cells.find((c) => c !== img) || img;
  const t = el('div', 'pf-tile product-tile product-tile--new');
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  const titleLink = heading ? heading.querySelector('a[href]') : null;
  if (img) {
    const wrap = el('div', 'pf-tile-image');
    const link = el(titleLink ? 'a' : 'div', 'pf-tile-link');
    if (titleLink) {
      link.href = titleLink.href;
      link.setAttribute('aria-hidden', 'true');
      link.tabIndex = -1;
    }
    const ratio = el('div', 'pf-tile-ratio');
    ratio.append(img.querySelector('picture') || img.querySelector('img'));
    link.append(ratio);
    wrap.append(link);
    t.append(wrap);
  }
  const details = el('div', 'pf-tile-details');
  const pin = el('div', 'pf-tile-pin');
  const pinLink = el('a', 'pf-tile-pin-link');
  pinLink.href = '#';
  pinLink.setAttribute('role', 'button');
  pinLink.setAttribute('aria-label', 'Compare');
  const pinBtn = el('div', 'pf-btn pf-btn-icon pf-btn-plain');
  pinBtn.append(icon('addpin'));
  pinLink.append(pinBtn);
  pin.append(pinLink);
  details.append(pin);
  const paras = paragraphs(body);
  const ctaP = paras.find((p) => p.querySelector('a[href]'));
  const typeP = paras.find((p) => p !== ctaP);
  if (typeP) {
    const type = el('div', 'pf-tile-type');
    type.append(typeP);
    details.append(type);
  }
  if (heading) details.append(heading);
  const specs = body.querySelector('ul');
  if (specs) {
    specs.classList.add('pf-tile-specs');
    [...specs.querySelectorAll('li')].forEach((li) => {
      const code = li.querySelector('code');
      const value = el('span', 'pf-tile-spec-value');
      [...li.childNodes].forEach((n) => { if (n !== code) value.append(n); });
      if (code) {
        li.prepend(icon(code.textContent.trim()));
        code.remove();
      }
      li.append(value);
    });
    details.append(specs);
  }
  t.append(details);
  if (ctaP) {
    const buttons = el('div', 'pf-tile-buttons');
    const a = ctaP.querySelector('a[href]');
    a.classList.add('pf-tile-button');
    const label = el('span', 'pf-tile-button-label');
    while (a.firstChild) label.append(a.firstChild);
    a.append(icon('arrowright'), label);
    a.querySelector('i').classList.add('pf-tile-button-icon');
    buttons.append(ctaP);
    t.append(buttons);
  }
  return t;
}

export default function decorate(block) {
  const rows = [...block.children];
  const selector = el('div', 'pf-selector');
  const selectorWrap = el('div', 'pf-selector-wrap');
  const tabs = el('ul', 'pf-tabs');
  selectorWrap.append(tabs);
  selector.append(selectorWrap);
  const finder = el('div', 'pf-finder');
  const rail = el('div', 'pf-rail');
  const groups = el('ul', 'pf-groups');
  const products = el('div', 'pf-products');
  const grid = el('div', 'pf-grid productfinder__products-container');
  let bar = null;
  let header = null;
  let comparePanel = null;
  let loadMore = null;
  rows.forEach((row) => {
    const cells = [...row.children];
    const key = keyOf(cells[0]);
    const body = cells[1] || cells[0];
    if (!key) {
      if (row.querySelector('img, picture')) grid.append(tile(cells));
      return;
    }
    const [type, ...flags] = key;
    if (type === 'tab') tabs.append(tab(body, flags));
    else if (type === 'toolbar') bar = toolbar(body);
    else if (type === 'results') header = railHeader(body);
    else if (type === 'search') groups.append(search(flags));
    else if (type === 'filter') groups.append(filterGroup(body, flags));
    else if (type === 'reset') groups.append(resetAll(body));
    else if (type === 'compare') comparePanel = compare(body);
    else if (type === 'more') loadMore = more(body);
  });
  if (header) rail.append(header);
  rail.append(groups);
  if (comparePanel) rail.append(comparePanel);
  products.append(el('div', 'pf-sort'), grid);
  if (loadMore) products.append(loadMore);
  products.append(el('div', 'pf-closing'));
  finder.append(rail, products);
  block.textContent = '';
  block.append(selector);
  if (bar) block.append(bar);
  block.append(finder);
}
