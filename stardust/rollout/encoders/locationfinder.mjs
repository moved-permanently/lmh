/**
 * locationfinder.mjs — ENCODER for the `locationfinder` template (the dealer finder page):
 * migrated main (prototype vocabulary: lmh-dealer-locator.location-finder, .dealer-card, .map)
 * → EDS content document with a `breadcrumb` block (one empty crumb when the source list is empty —
 * /en/technical/Location-Finder.html paints the 50 px desktop bar with its glyph) and ONE `location-finder`
 * block whose rows are the captured initial state (dynamic-features.md row 9: static snapshot).
 * Source → block rows (blocks/location-finder/location-finder.js decodes exactly this vocabulary):
 *   <title> (the live page paints no heading)   → [title] [<h1>page title</h1>] (delivery-lint P0;
 *                                                 the block renders it off-canvas, opacity 0)
 *   .location-finder__field (label + select)   → [field] [<p>label</p><ul><li>option</li>…</ul>]
 *   .location-finder__toggle button            → [toggle] [<ul><li>list</li><li><strong>map</strong></li></ul>]
 *                                                 (<strong> = the .is-active tab)
 *   .dealer-card                               → [<img src alt>] [<p>name</p><p>address line</p>…]
 *                                                 [<p>Select</p><p>Details</p>] (logo cell empty when none)
 *   .map[aria-label]                           → [map] [<p>label</p>]
 * Usage: node stardust/rollout/encoders/locationfinder.mjs <migrated index.html> <out content.html>
 *        --url <live URL> [--meta <_meta.json>] [--title <t>] [--description <d>]
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
if (args.includes('--help') || args.length < 2) {
  console.log('usage: locationfinder.mjs <migrated index.html> <out content.html> --url <live URL>'
    + ' [--meta _meta.json] [--title t] [--description d]');
  process.exit(args.includes('--help') ? 0 : 2);
}
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
const [srcFile, outFile] = pos;
const pageUrl = opt('--url');
if (!pageUrl) { console.error('locationfinder.mjs: --url <live URL> is required'); process.exit(2); }
const html = fs.readFileSync(srcFile, 'utf8');
const sidecar = opt('--meta') ? JSON.parse(fs.readFileSync(opt('--meta'), 'utf8')) : {};

// ── minimal HTML tree ─────────────────────────────────────────────────────────────────────────
const VOID = new Set(['img', 'br', 'input', 'source', 'meta', 'link', 'hr', 'wbr']);
function parse(src) {
  const root = { tag: '#root', children: [], attrs: {} };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
  let last = 0;
  let m;
  const text = (from, to) => {
    if (to > from) stack[stack.length - 1].children.push({ tag: '#text', text: src.slice(from, to) });
  };
  while ((m = re.exec(src))) {
    text(last, m.index); last = m.index + m[0].length;
    if (m[0].startsWith('<!--')) continue;
    const [, close, tag, attrStr, self] = m;
    if (close) {
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === tag) { stack[i].end = last; stack.length = i; break; }
      }
      continue;
    }
    const attrs = {};
    attrStr.replace(/([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, (a, k, v1, v2, v3) => {
      attrs[k] = v1 ?? v2 ?? v3 ?? ''; return '';
    });
    const node = { tag, attrs, children: [], start: m.index, end: last };
    stack[stack.length - 1].children.push(node);
    if (!VOID.has(tag) && !self && tag !== 'script' && tag !== 'style') stack.push(node);
    if (tag === 'script' || tag === 'style') {
      const e = src.indexOf(`</${tag}>`, last); re.lastIndex = e + tag.length + 3; last = re.lastIndex; node.end = last;
    }
  }
  return root;
}
const root = parse(html);
const cls = (n, c) => !!n.attrs && (` ${n.attrs.class || ''} `).includes(` ${c} `);
const els = (n) => (n.children || []).filter((c) => c.tag !== '#text');
function find(n, pred, out = [], first = false) {
  for (const c of els(n)) {
    if (pred(c)) { out.push(c); if (first) return out; }
    find(c, pred, out, first);
    if (first && out.length) return out;
  }
  return out;
}
const q1 = (n, pred) => find(n, pred, [], true)[0];
const byCls = (c) => (x) => cls(x, c);
const byTag = (t) => (x) => x.tag === t;
const textOf = (n) => (n.tag === '#text' ? n.text : (n.children || []).map(textOf).join(''));
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const abs = (h) => {
  try { return new URL(h, pageUrl).href.replace(/\/index\.html(?=$|[?#])/, '/'); } catch { return h; }
};
const p = (inner) => `<p>${inner}</p>`;
const code = (...t) => p(t.filter(Boolean).map((x) => `<code>${esc(x)}</code>`).join(' '));
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const block = (name, cells) => `  <div class="${name}">\n${cells.map((c) => `    <div>${c.map((x) => `<div>${x}</div>`).join('')}</div>`).join('\n')}\n  </div>`;

const main = q1(root, (x) => x.tag === 'main' && cls(x, 'content')) || q1(root, byTag('main')) || root;
const sections = [];

// ── breadcrumb (an empty block when the source crumb list is empty: the bare desktop bar) ─────
{
  const list = q1(root, byCls('breadcrumb-list_v2'));
  const li = list ? find(list, byTag('li')).filter((item) => clean(textOf(item))).map((item) => {
    const a = q1(item, byTag('a'));
    const label = clean(textOf(item));
    const href = a && a.attrs.href ? abs(a.attrs.href) : null;
    return `<li>${href ? `<a href="${esc(href)}">${esc(label)}</a>` : esc(label)}</li>`;
  }) : [];
  // an empty crumb list still paints the bar with its arrow glyph on live → one empty <li>
  sections.push(`<div>\n${block('breadcrumb', [[`<ul>${li.length ? li.join('') : '<li></li>'}</ul>`]])}\n</div>`);
}

// ── location-finder rows ─────────────────────────────────────────────────────────────────────
const titleTag = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const title = opt('--title', (sidecar.metadata && sidecar.metadata.title) || clean(titleTag));
const rows = [];
if (title) rows.push([code('title'), `<h1>${esc(title)}</h1>`]);
find(main, byCls('location-finder__field')).forEach((f) => {
  const label = clean(textOf(q1(f, byTag('label')) || { children: [] }));
  const options = find(f, byTag('option')).map((o) => esc(clean(textOf(o))));
  rows.push([code('field'), p(esc(label)) + ul(options)]);
});
const toggle = q1(main, byCls('location-finder__toggle'));
if (toggle) {
  const items = find(toggle, byTag('button')).map((b) => {
    const t = esc(clean(textOf(b)));
    return cls(b, 'is-active') ? `<strong>${t}</strong>` : t;
  });
  rows.push([code('toggle'), ul(items)]);
}
find(main, byCls('dealer-card')).forEach((card) => {
  const img = q1(card, byTag('img'));
  const logo = img ? `<img src="${esc(abs(img.attrs.src))}" alt="${esc(img.attrs.alt || '')}">` : '';
  const title = clean(textOf(q1(card, byCls('dealer-card__title')) || { children: [] }));
  const address = q1(card, byTag('address'));
  const lines = address ? find(address, byTag('p')).map((x) => clean(textOf(x))).filter(Boolean) : [];
  if (address && !lines.length && clean(textOf(address))) lines.push(clean(textOf(address)));
  const select = clean(textOf(q1(card, byCls('dealer-card__select')) || { children: [] }));
  const details = clean(textOf(q1(card, byCls('dealer-card__details')) || { children: [] }));
  rows.push([
    logo,
    p(esc(title)) + lines.map((l) => p(esc(l))).join(''),
    [select, details].filter(Boolean).map((t) => p(esc(t))).join(''),
  ]);
});
const map = q1(main, byCls('map'));
if (map) rows.push([code('map'), p(esc(map.attrs['aria-label'] || 'Map'))]);
sections.push(`<div>\n${block('location-finder', rows)}\n</div>`);

// ── metadata ──────────────────────────────────────────────────────────────────────────────────
const descTag = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
const description = opt('--description', (sidecar.metadata && sidecar.metadata.description) || descTag);
const meta = [['Title', title], ['Description', description], ['Template', 'locationfinder']]
  .filter(([, v]) => v).map(([k, v]) => `    <div><div>${k}</div><div>${esc(v)}</div></div>`).join('\n');
sections.push(`<div>\n  <div class="metadata">\n${meta}\n  </div>\n</div>`);

fs.writeFileSync(outFile, `<body>\n<header></header>\n<main>\n${sections.join('\n')}\n</main>\n<footer></footer>\n</body>\n`);
console.log(`locationfinder.mjs → ${outFile}: ${rows.length} location-finder rows, ${sections.length} sections`);
