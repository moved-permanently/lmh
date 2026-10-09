/**
 * productfinder.mjs — ENCODER for the `productfinder` template (the two finder shells):
 * migrated main (prototype vocabulary: .productfinder-selector / .productfinder / .product-tile)
 * → EDS content document with a `breadcrumb` block and ONE `product-finder` block whose rows are
 * derived from the captured, settled DOM (dynamic-features.md rows 7 + 11: static snapshot).
 * Source → block rows (blocks/product-finder/product-finder.js decodes exactly this vocabulary):
 *   .breadcrumb-list_v2 li                        → breadcrumb block (crumb text, link kept)
 *   .productfinder-selector__type                 → [tab <glyph> [active]] [<p>label</p><p>count</p>]
 *   .productfinder-toolbar .counter               → [toolbar] [<p>n</p><p>n</p>]
 *   .productfinder__filterheader__title           → [results] [<p><strong>n</strong> Products</p>]
 *   .productfinder__modelsearch                   → [search [hidden]] []
 *   .productfinder__filtergroup                   → [filter <glyph> <check|range|range2|text> [hidden]]
 *       [<p><strong>name</strong></p> [<p>question</p>] <ul>options</ul> <p>reset label</p>
 *        [<p><strong>additional title</strong></p><p>additional text</p>]]
 *       check: label.checkbox span → <li>; range: form_control_input label + unit →
 *       <li>Min <em>kg</em></li> (range2: Min + Max); text: input placeholder → <li><em>…</em></li>
 *   .productfinder__reset button                  → [reset] [<p>Reset all filters</p>]
 *   .productfinder__compare                       → [compare] [<p>count</p><p>title</p><p>drop text</p>
 *                                                    <ul><li><a href="#">Get a quote</a></li>…</ul>] (inert anchors as live)
 *   .product-tile                                 → [<img src alt>] [<p>type</p><h3><a>name</a></h3>
 *                                                    <ul><li><code>glyph</code> value</li>…</ul><p><a>Details</a></p>]
 *   .productfinder__loadmore__btn .btn            → [more] [<p><a href="#">Show all</a></p>] (dead on live too)
 * Hidden = class pf-hidden or an inline display:none (the capture's closed state).
 * Usage: node stardust/rollout/encoders/productfinder.mjs <migrated index.html> <out content.html>
 *        --url <live URL> [--meta <_meta.json>] [--title <t>] [--description <d>]
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
if (args.includes('--help') || args.length < 2) {
  console.log('usage: productfinder.mjs <migrated index.html> <out content.html> --url <live URL>'
    + ' [--meta _meta.json] [--title t] [--description d]');
  process.exit(args.includes('--help') ? 0 : 2);
}
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
const [srcFile, outFile] = pos;
const pageUrl = opt('--url');
if (!pageUrl) { console.error('productfinder.mjs: --url <live URL> is required'); process.exit(2); }
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
const hidden = (n) => cls(n, 'pf-hidden') || /display:\s*none/.test(n.attrs.style || '');
const iconKey = (n) => {
  const ic = q1(n, (x) => x.tag === 'span' && /\bicon-LMH/.test(x.attrs.class || ''));
  const name = ic ? (ic.attrs.class.match(/icon-LMH(\w+)/) || [])[1] : '';
  return name.replace(/^Icon/, '').replace(/black$/, '').replace(/^saddpin$/, 'addpin').toLowerCase();
};
const p = (inner) => `<p>${inner}</p>`;
const code = (...t) => p(t.filter(Boolean).map((x) => `<code>${esc(x)}</code>`).join(' '));
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const main = q1(root, (x) => x.tag === 'main') || root;
const rows = [];
const row = (key, body) => rows.push([key, body]);

// ── breadcrumb ────────────────────────────────────────────────────────────────────────────────
const sections = [];
const block = (name, cells) => `  <div class="${name}">\n${cells.map((c) => `    <div>${c.map((x) => `<div>${x}</div>`).join('')}</div>`).join('\n')}\n  </div>`;
{
  const list = q1(root, byCls('breadcrumb-list_v2'));
  const li = list ? find(list, byTag('li')).map((item) => {
    const a = q1(item, byTag('a'));
    const label = clean(textOf(item));
    const href = a && a.attrs.href ? abs(a.attrs.href) : null;
    return `<li>${href ? `<a href="${esc(href)}">${esc(label)}</a>` : esc(label)}</li>`;
  }) : ['<li></li>'];
  sections.push(`<div>\n${block('breadcrumb', [[`<ul>${li.join('')}</ul>`]])}\n</div>`);
}

// ── selector tabs ─────────────────────────────────────────────────────────────────────────────
find(main, byCls('productfinder-selector__type')).forEach((t) => {
  const label = q1(t, byCls('productfinder-selector__label'));
  const count = q1(t, byCls('productfinder-selector__count'));
  const flags = [iconKey(t)];
  if (cls(t, 'productfinder-selector__type--active')) flags.push('active');
  row(code('tab', ...flags), p(esc(clean(textOf(label || t)))) + (count ? p(esc(clean(textOf(count)))) : ''));
});

// ── toolbar counters ──────────────────────────────────────────────────────────────────────────
{
  const bar = q1(main, byCls('productfinder-toolbar'));
  const counters = bar ? find(bar, byCls('counter')).map((c) => p(esc(clean(textOf(c))))) : [];
  if (counters.length) row(code('toolbar'), counters.join(''));
}

// ── rail header (results count) ───────────────────────────────────────────────────────────────
{
  const title = q1(main, byCls('productfinder__filterheader__title'));
  if (title) {
    const strong = q1(title, byTag('strong'));
    const n = strong ? clean(textOf(strong)) : '';
    const rest = clean(textOf(title).replace(n, ''));
    row(code('results'), p(`${strong ? `<strong>${esc(n)}</strong> ` : ''}${esc(rest)}`));
  }
}

// ── filter rail ───────────────────────────────────────────────────────────────────────────────
const wrapper = q1(main, byCls('productfinder__filtergroup-wrapper'));
(wrapper ? els(wrapper) : []).forEach((li) => {
  if (cls(li, 'productfinder__modelsearch')) {
    row(code('search', hidden(li) ? 'hidden' : ''), '');
    return;
  }
  if (cls(li, 'productfinder__reset')) {
    const b = q1(li, byTag('button'));
    row(code('reset'), p(esc(clean(textOf(b || li)))));
    return;
  }
  if (!cls(li, 'productfinder__filtergroup')) return;
  const name = clean(textOf(q1(li, byCls('productfinder__filtergroup__name'))));
  const flyout = q1(li, byCls('productfinder__filtergroup__flyout'));
  const question = flyout ? q1(flyout, byTag('p')) : null;
  const qText = question ? clean(textOf(question)) : '';
  const filters = find(li, byCls('productfinder__filtergroup__filter'));
  const checks = find(li, (x) => x.tag === 'label' && cls(x, 'checkbox'));
  let kind = 'check';
  let items = [];
  const range = q1(li, byCls('range_container'));
  if (checks.length) {
    items = checks.map((c) => esc(clean(textOf(q1(c, byTag('span')) || c))));
  } else if (range) {
    kind = cls(range, 'single-range_container') ? 'range' : 'range2';
    items = find(range, byCls('form_control_input')).map((f) => {
      const label = q1(f, (x) => x.tag === 'label');
      const unit = q1(f, byCls('form_control_input_unit'));
      const u = unit ? clean(textOf(unit)) : '';
      return `${esc(clean(textOf(label || f)) || 'Min')}${u ? ` <em>${esc(u)}</em>` : ''}`;
    });
  } else {
    kind = 'text';
    items = filters.map((f) => q1(f, (x) => x.tag === 'input' && x.attrs.type === 'text'))
      .filter(Boolean).map((i) => `<em>${esc(i.attrs.placeholder || '')}</em>`);
  }
  const reset = q1(li, byCls('productfinder__filtergroup__reset'));
  const resetLabel = reset ? clean(textOf(q1(reset, byTag('button')) || reset)) : 'Reset this filter';
  const extra = q1(li, byCls('productfinder__filtergroup__additional'));
  let body = p(`<strong>${esc(name)}</strong>`);
  if (qText) body += p(esc(qText));
  body += ul(items) + p(esc(resetLabel));
  if (extra) {
    const t = q1(extra, byCls('productfinder__filtergroup__additional__title'));
    const x = q1(extra, byCls('productfinder__filtergroup__additional__text'));
    if (t) body += p(`<strong>${esc(clean(textOf(t)))}</strong>`);
    if (x) body += p(esc(clean(textOf(x))));
  }
  row(code('filter', iconKey(li), kind, hidden(li) ? 'hidden' : ''), body);
});

// ── compare panel ─────────────────────────────────────────────────────────────────────────────
{
  const panel = q1(main, byCls('productfinder__compare'));
  if (panel) {
    const count = q1(panel, byCls('productfinder__compare__count'));
    const title = q1(panel, byCls('productfinder__compare__title'));
    const drop = q1(panel, byCls('productfinder__compare__dropzone'));
    const dropText = drop ? els(drop).filter((x) => x.tag === 'span' && !/\bicon\b/.test(x.attrs.class || '')) : [];
    const actions = [
      q1(panel, byCls('productfinder__getaquote__btn')),
      q1(panel, byCls('productfinder__share__btn')),
      q1(panel, byCls('productfinder__compare__btn')),
    ].filter(Boolean).map((a) => `<a href="#">${esc(clean(textOf(q1(a, byCls('btn')) || a)))}</a>`);
    row(code('compare'), [count, title, dropText[0]].filter(Boolean).map((n) => p(esc(clean(textOf(n))))).join('')
      + (actions.length ? ul(actions) : ''));
  }
}

// ── product tiles ─────────────────────────────────────────────────────────────────────────────
const specGlyph = (spec) => iconKey(spec) || 'loadcapacity';
find(main, byCls('product-tile')).forEach((t) => {
  const img = q1(t, byTag('img'));
  const type = q1(t, byCls('product-tile__details-productType'));
  const h3 = q1(t, byTag('h3'));
  const titleA = h3 ? q1(h3, byTag('a')) : null;
  const details = q1(t, byCls('product-tile__details-wrapper'));
  const specRows = details ? els(details).filter((x) => x.tag === 'div' && !x.attrs.class).flatMap(els) : [];
  const specs = specRows.map((s) => {
    const spans = els(s).filter((x) => x.tag === 'span' && !/\bicon\b/.test(x.attrs.class || ''));
    return `<code>${specGlyph(s)}</code> ${esc(clean(textOf(spans[0] || s)))}`;
  });
  const cta = q1(t, byCls('product-tile__button'));
  const ctaLabel = cta ? clean(textOf(q1(cta, byCls('product-tile__button-label')) || cta)) : '';
  const href = titleA && titleA.attrs.href ? abs(titleA.attrs.href) : (cta && cta.attrs.href ? abs(cta.attrs.href) : '');
  let body = type ? p(esc(clean(textOf(type)))) : '';
  if (h3) body += `<h3>${href ? `<a href="${esc(href)}">` : ''}${esc(clean(textOf(h3)))}${href ? '</a>' : ''}</h3>`;
  if (specs.length) body += ul(specs);
  if (cta) body += p(`<a href="${esc(cta.attrs.href ? abs(cta.attrs.href) : href)}">${esc(ctaLabel)}</a>`);
  const pic = img ? `<img src="${esc(abs(img.attrs.src || ''))}" alt="${esc(img.attrs.alt || '')}">` : '';
  rows.push([pic, body]);
});

// ── load more ─────────────────────────────────────────────────────────────────────────────────
{
  const more = q1(main, byCls('productfinder__loadmore__btn'));
  if (more) row(code('more'), p(`<a href="#">${esc(clean(textOf(q1(more, byCls('btn')) || more)))}</a>`));
}

sections.push(`<div>\n${block('product-finder', rows)}\n</div>`);

// ── metadata ──────────────────────────────────────────────────────────────────────────────────
const titleTag = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const title = opt('--title', (sidecar.metadata && sidecar.metadata.title) || clean(titleTag));
const descTag = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
const description = opt('--description', (sidecar.metadata && sidecar.metadata.description) || descTag);
const meta = [['Title', title], ['Description', description], ['Template', 'productfinder']]
  .filter(([, v]) => v).map(([k, v]) => `    <div><div>${k}</div><div>${esc(v)}</div></div>`).join('\n');
sections.push(`<div>\n  <div class="metadata">\n${meta}\n  </div>\n</div>`);

fs.writeFileSync(outFile, `<body>\n<header></header>\n<main>\n${sections.join('\n')}\n</main>\n<footer></footer>\n</body>\n`);
console.log(`productfinder.mjs: ${outFile} — ${rows.length} rows (${find(main, byCls('product-tile')).length} tiles)`);
