/**
 * location-finder — the dealer finder of the `locationfinder` template (source
 * /en/technical/Location-Finder.html, live <lmh-dealer-locator> rendering into a shadow root;
 * stardust/dynamic-features.md row 9: the finder API is host-bound, so the block ships the captured
 * initial state as a STATIC SNAPSHOT — no Maps script, no client fetch, every control inert).
 *
 * Authored rows (the vocabulary stardust/rollout/encoders/locationfinder.mjs emits); a keyed row
 * is [key cell | content cell], key cell = <p><code>type</code></p>:
 *   title            | <h1>page title</h1>                      → the page heading (live paints
 *                      none: rendered off-canvas at opacity 0, read by assistive tech)
 *   field            | <p>label</p><ul><li>option</li>…</ul>   → select (first option selected)
 *   toggle           | <ul><li>list</li><li><strong>map</strong></li></ul> → mobile list / map
 *                      toggle; <strong> marks the active tab
 *   map              | <p>region label</p>                      → the static map box
 *   dealer (no key)  | [img logo] [<p>name</p><p>address line</p>…] [<p>Select</p><p>Details</p>]
 * Decode: template-slotted for the search panel, toggle and map; reconstructive for the dealer
 * rows (node-slotting EW1–EW3: authored <p>/<ul>/<img> MOVE into generated wrappers; the inert
 * buttons are <div role="button"> around the authored paragraph, EW7).
 * @ew-exempt <ul> of a field row — option texts mirrored into the <select> (a form control cannot
 *   host the editor, EW7)
 * @ew-exempt <p> of the map row — mirrored into the region's aria-label (text-as-metadata)
 * @ew-exempt <p> key cell descriptor (code tokens) — text-as-metadata, never displayed
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function btn(className, child) {
  const b = el('div', className);
  b.setAttribute('role', 'button');
  b.setAttribute('tabindex', '0');
  if (child) b.append(child);
  return b;
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

/* the paragraphs of a cell; a bare-text cell (DA single-paragraph unwrap) is re-wrapped in a <p> */
function paragraphs(cell) {
  if (!cell) return [];
  const ps = [...cell.querySelectorAll(':scope > p')];
  if (ps.length) return ps;
  if (!cell.textContent.trim()) return [];
  const p = el('p');
  while (cell.firstChild) p.append(cell.firstChild);
  return [p];
}

function decodeField(cell, row) {
  const field = el('div', 'lf-field');
  const [label] = paragraphs(cell);
  const list = cell.querySelector('ul, ol');
  const select = el('select');
  if (label) {
    field.append(label);
    select.setAttribute('aria-label', label.textContent.trim());
  }
  if (list) {
    [...list.querySelectorAll('li')].forEach((li) => {
      const option = el('option');
      option.textContent = li.textContent.trim();
      select.append(option);
    });
    list.remove();
  }
  field.append(select);
  row.append(field);
}

function decodeToggle(cell, toggle) {
  const list = cell.querySelector('ul, ol');
  if (!list) return;
  [...list.querySelectorAll('li')].forEach((li) => {
    if (li.querySelector('strong')) li.classList.add('is-active');
  });
  toggle.append(list);
}

function decodeMap(cell, mapCol) {
  const map = el('div', 'lf-map map');
  map.setAttribute('role', 'region');
  const [label] = paragraphs(cell);
  map.setAttribute('aria-label', label ? label.textContent.trim() : 'Map');
  if (label) label.remove();
  mapCol.append(map);
}

function decodeDealer(cells, list) {
  const logoCell = cells.find((c) => c.querySelector('img, picture'));
  // an authored-but-empty logo cell (dealer without a logo) is not a text cell
  const textCells = cells.filter((c) => c !== logoCell && c.textContent.trim());
  const [bodyCell, actionsCell] = textCells;
  const card = el('div', 'dealer-card');
  const inner = el('div', 'dealer-card-inner');
  const head = el('div', 'dealer-card-row');
  if (logoCell) {
    const logo = el('div', 'dealer-card-logo');
    logo.append(logoCell.querySelector('picture') || logoCell.querySelector('img'));
    head.append(logo);
  }
  const [selectLabel, detailsLabel] = paragraphs(actionsCell);
  if (selectLabel) head.append(btn('dealer-card-select', selectLabel));
  inner.append(head);
  const [title, ...lines] = paragraphs(bodyCell);
  if (title) {
    const t = el('div', 'dealer-card-title');
    t.append(title);
    inner.append(t);
  }
  const foot = el('div', 'dealer-card-row');
  const address = el('address');
  lines.forEach((p) => address.append(p));
  foot.append(address);
  if (detailsLabel) foot.append(btn('dealer-card-details', detailsLabel));
  inner.append(foot);
  card.append(inner);
  list.append(card);
}

export default function decorate(block) {
  const heading = el('div', 'lf-title');
  const layout = el('div', 'lf-layout location-finder__layout');
  const panel = el('div', 'lf-panel');
  const controls = el('div', 'lf-controls');
  const controlsRow = el('div', 'lf-controls-row');
  controls.append(controlsRow);
  const toggle = el('div', 'lf-toggle');
  const results = el('div', 'lf-results');
  const list = el('div', 'lf-list location-finder__list');
  results.append(list);
  const mapCol = el('div', 'lf-map-col');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = keyOf(cells[0]);
    const body = key ? cells[1] : null;
    if (key && key[0] === 'title') heading.append(...body.children);
    else if (key && key[0] === 'field') decodeField(body, controlsRow);
    else if (key && key[0] === 'toggle') decodeToggle(body, toggle);
    else if (key && key[0] === 'map') decodeMap(body, mapCol);
    else if (!key) decodeDealer(cells, list);
  });
  panel.append(controls, toggle, results);
  layout.append(panel, mapCol);
  block.textContent = '';
  if (heading.children.length) block.append(heading);
  block.append(layout);
}
