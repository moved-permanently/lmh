/**
 * static.mjs — ENCODER for the `static` template (legal notes, EDI, retired-product landings):
 * migrated main → EDS content document, the shape of content/en/legal-notes/privacy-statement.html.
 * Source rows (in order) → sections:
 *   .breadcrumb-list_v2 (outside main)        → breadcrumb block (crumb text verbatim, empty stays empty)
 *   .navigation-anchor-navigation-wrapper     → default content <ul> + style anchor-nav (heading slugs)
 *   .layout-100-headline--flex (layout--red)  → <h1> for the first headline when the page has none,
 *                                               else <h2>; style red
 *   .layout-100--flex (richtext)              → default content; style intro when every <p> is .intro
 *   .layout-article--centered (dom-content)   → ONE section styled `centered`: <h1>, "Share" toggle
 *                                               (plain #share anchor), richtext with source spacer lines
 *                                               kept as <p>&#8203;</p>, .inline-button-row inline as a
 *                                               button paragraph, article-footer p + "Share" toggle;
 *                                               CCM19 tables → `table header` blocks in the section;
 *                                               CCM19 declaration: h3/h4/p verbatim, each table → `table`
 *                                               block (header row first); share widget + article-footer
 *                                               dropped (javascript:/mailto share hrefs — deviation)
 *   .layout-50(-reverse)--fixed               → columns block (one row, text|image in source order)
 * Usage: node stardust/rollout/encoders/static.mjs <migrated index.html> <out.html> --url <live URL>
 *        [--title <t>] [--description <d>] [--og-image <url>] [--h1-from-title]  (defaults: _meta.json)
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--help') || args.length < 2) {
  console.log('usage: static.mjs <migrated index.html> <out content.html> --url <live URL>'
    + ' [--title t] [--description d] [--og-image u]');
  process.exit(args.includes('--help') ? 0 : 2);
}
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
const [srcFile, outFile] = pos;
const pageUrl = opt('--url');
if (!srcFile || !outFile || !pageUrl) { console.error('usage: static.mjs <src> <out> --url <live URL>'); process.exit(2); }
const html = fs.readFileSync(srcFile, 'utf8');
let sidecar = {};
try { sidecar = JSON.parse(fs.readFileSync(path.join(path.dirname(srcFile), '_meta.json'), 'utf8')); } catch { /* none */ }

// ── minimal DOM ───────────────────────────────────────────────────────────────────────────────
const VOID = new Set(['img', 'br', 'hr', 'source', 'input', 'meta', 'link', 'wbr']);
function parse(src) {
  const root = { tag: '#root', attrs: {}, children: [], start: 0, end: src.length };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>]+(?:="[^"]*"|='[^']*'|=[^\s>]+)?)*)\s*(\/?)>/g;
  let m; let last = 0;
  const text = (from, to) => { if (to > from) stack[stack.length - 1].children.push({ tag: '#text', text: src.slice(from, to), start: from, end: to }); };
  while ((m = re.exec(src))) {
    text(last, m.index); last = m.index + m[0].length;
    if (m[0].startsWith('<!--')) continue;
    const [, close, tag, attrStr, self] = m;
    if (close) {
      for (let i = stack.length - 1; i > 0; i -= 1) if (stack[i].tag === tag) { stack[i].end = last; stack.length = i; break; }
      continue;
    }
    const attrs = {};
    attrStr.replace(/([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, (a, k, v1, v2, v3) => { attrs[k] = v1 ?? v2 ?? v3 ?? ''; return ''; });
    const node = { tag, attrs, children: [], start: m.index, end: last, parent: stack[stack.length - 1] };
    stack[stack.length - 1].children.push(node);
    if (!VOID.has(tag) && !self && tag !== 'script' && tag !== 'style') stack.push(node);
    if (tag === 'script' || tag === 'style') { const e = src.indexOf(`</${tag}>`, last); re.lastIndex = e + tag.length + 3; last = re.lastIndex; node.end = last; }
  }
  return root;
}
const cls = (n, c) => !!n.attrs && (` ${n.attrs.class || ''} `).includes(` ${c} `);
const els = (n) => (n.children || []).filter((c) => c.tag !== '#text');
function find(n, pred, out = [], first = false) {
  for (const c of els(n)) { if (pred(c)) { out.push(c); if (first) return out; } find(c, pred, out, first); if (first && out.length) return out; }
  return out;
}
const q = (n, c) => find(n, (x) => cls(x, c), [], true)[0];
const qa = (n, c) => find(n, (x) => cls(x, c));
const inner = (n) => { const o = html.indexOf('>', n.start) + 1; return html.slice(o, n.end - (`</${n.tag}>`).length); };
const textOf = (n) => (n.tag === '#text' ? n.text : (n.children || []).map(textOf).join(''));
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// ── emit helpers ──────────────────────────────────────────────────────────────────────────────
const abs = (h) => { try { return new URL(h, pageUrl).href.replace(/\/index\.html(?=$|[?#])/, "/"); } catch { return h; } };
function largestSrc(img) {
  const ss = img.attrs.srcset || '';
  let best = { u: img.attrs.src, w: 0 };
  ss.split(',').forEach((c) => { const [u, w] = c.trim().split(/\s+/); const n = parseInt(w || '0', 10); if (n > best.w) best = { u, w: n }; });
  return abs(best.u || img.attrs.src);
}
const imgTag = (img) => (img ? `<img src="${esc(largestSrc(img))}" alt="${esc(clean(img.attrs.alt || ''))}">` : '');
// re-emit an authored inline fragment: drop presentational attrs/icons, b→strong, absolutise hrefs
function frag(s) {
  return s.replace(/<span class="icon[^"]*"[^>]*><\/span>/g, '')
    .replace(/<i class="icon[^"]*"[^>]*><\/i>/g, '')
    .replace(/<\/?span[^>]*>/g, '')
    .replace(/<(\/?)b>/g, '<$1strong>')
    .replace(/<(\/?)i>/g, '<$1em>')
    .replace(/<[a-z][^>]*>/g, (tag) => tag
      .replace(/\s(class|target|aria-hidden|tabindex|data-[\w-]+|title|download|id|style)(="[^"]*")?(?=[\s>\/])/g, '')
      .replace(/href="([^"]*)"/g, (a, h) => `href="${esc(h.startsWith('#') ? h : abs(h))}"`))
    .replace(/<p>\s*(<br>)?\s*<\/p>/g, '')
    .replace(/<time>([^<]*)<\/time>/g, '$1')
    .replace(/^\s+|\s+$/g, '');
}
const slug = (t) => clean(t).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-');
const sections = [];
const section = (body, style) => sections.push(`<div>\n${body}${style
  ? `\n  <div class="section-metadata"><div><div>Style</div><div>${style.split(' ').join(', ')}</div></div></div>` : ''}\n</div>`);
const block = (name, rows) => `  <div class="${name}">\n${rows.map((cells) => `    <div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('\n')}\n  </div>`;
const isH = (x) => /^h[1-6]$/.test(x.tag);
const deviations = [];

// ── module encoders ───────────────────────────────────────────────────────────
const headingIds = new Map(); // source anchor id → EDS heading slug
let h1Done = false;
function breadcrumb(root) {
  const list = q(root, 'breadcrumb-list_v2');
  const items = list ? find(list, (x) => x.tag === 'li') : [];
  const li = items.map((it) => {
    const a = find(it, (x) => x.tag === 'a', [], true)[0];
    const t = clean(textOf(it));
    return a && a.attrs.href && !cls(a, 'active') ? `<li><a href="${esc(abs(a.attrs.href))}">${esc(t)}</a></li>` : `<li>${esc(t)}</li>`;
  });
  section(block('breadcrumb', [[`<ul>${li.join('')}</ul>`]]));
}
function anchorNav(n) {
  const links = find(n, (x) => x.tag === 'a' && x.attrs.href);
  const li = links.map((a) => `<li><a href="#${headingIds.get(a.attrs.href.replace('#', '')) || a.attrs.href.replace('#', '')}">${clean(textOf(a))}</a></li>`);
  section(`  <ul>${li.join('')}</ul>`, 'anchor-nav');
}
function headline(row) {
  const h = find(row, isH, [], true)[0];
  const tag = h1Done ? 'h2' : 'h1'; h1Done = true;
  section(`  <${tag}>${frag(inner(h))}</${tag}>`, cls(row, 'layout--red') ? 'red' : undefined);
}
// richtext: every element child of the wrapper (a <span> is unwrapped); returns [html, allIntro]
function richtext(wrapper, spacers = false) {
  let out = ''; let ps = 0; let intros = 0;
  const walk = (x) => {
    if (x.tag === '#text') { if (clean(x.text)) out += clean(x.text); return; }
    if (x.tag === 'span' && !cls(x, 'icon')) { x.children.forEach(walk); return; }
    if (x.tag === 'i' && cls(x, 'icon')) return;
    if ((x.tag === 'p' || isH(x)) && !clean(textOf(x)) && !find(x, (y) => y.tag === 'img', [], true).length) {
      // source spacer (<p><br></p>, <h3><br></h3>): the centered article keeps the empty line (live
      // height) — U+200B, not &nbsp; (the md conversion drops a paragraph that is only &nbsp;/<br>)
      if (spacers && find(x, (y) => y.tag === 'br', [], true).length) out += '<p>&#8203;</p>';
      return;
    }
    if (x.tag === 'p') { ps += 1; if (cls(x, 'intro')) intros += 1; }
    if (x.tag === 'a' && cls(x, 'btn__link')) { out += `<p><a href="${esc(abs(x.attrs.href))}">${clean(textOf(x))}</a></p>`; return; }
    if (x.tag === 'div') { x.children.forEach(walk); return; }
    out += `<${x.tag}>${frag(inner(x))}</${x.tag}>`;
  };
  (wrapper.children || []).forEach(walk);
  // a paragraph-leading <br> (live: empty first line) is trimmed by the md conversion — anchor it
  out = out.replace(/<p><br>/g, '<p>&#8203;<br>');
  return [out, ps > 0 && intros === ps];
}
function flex100(row) {
  const dom = q(row, 'dom-content') || row;
  const [body, allIntro] = richtext(els(dom)[0] || dom);
  if (body) section(body, allIntro ? 'intro' : undefined);
}
function ctaRow(ibr, inline = false) {
  const links = find(ibr, (x) => x.tag === 'a' && cls(x, 'btn__link'));
  const ps = links.map((a) => `  <p><strong><a href="${esc(abs(a.attrs.href))}">${clean(textOf(a))}</a></strong></p>`).join('\n');
  if (find(ibr, (x) => cls(x, 'icon'), [], true).length) deviations.push('download-glyph: button glyph (icon-LMHIcondownloadblack) dropped, no default-content icon convention');
  if (inline) return ps.trim(); // centered article: the button row stays in the prose column (styled by the `centered` section)
  const v = cls(ibr, 'inline-button-row--horizontal') ? ' horizontal' : cls(ibr, 'inline-button-row--stretch') ? ' stretch' : '';
  section(ps, `cta${v}`);
  return '';
}
// the share toggle: a plain anchor to #share (the live widget's mail/LinkedIn/Facebook/print links carry
// javascript:/$url hrefs and are collapsed on the source; only the visible "Share" toggle is content)
const SHARE = '<p><strong><a href="#share">Share</a></strong></p>';
function table(t, style) {
  const rows = find(t, (x) => x.tag === 'tr').map((tr) => els(tr).map((c) => frag(inner(c))));
  const header = find(t, (x) => x.tag === 'thead' || x.tag === 'th', [], true).length ? ' header' : '';
  section(block(`table${header}`, rows), style);
}
// CCM19 cookie declaration: prose + one `table header` block per declaration table, all in the same section
function cookieDeclaration(cd) {
  let buf = '';
  const walk = (x) => {
    if (x.tag === '#text') return;
    if (cls(x, 'ccm-cookie-declaration--table-wrapper')) {
      const rows = find(x, (y) => y.tag === 'tr').map((tr) => els(tr).map((c) => frag(inner(c))));
      buf += `\n${block('table header', rows)}\n`; return;
    }
    if (x.tag === 'p' || isH(x)) {
      if (x.tag === 'p' && !clean(textOf(x))) return;
      buf += `<${x.tag}>${frag(inner(x)).replace(/\s+/g, ' ').trim()}</${x.tag}>`; return;
    }
    (x.children || []).forEach(walk);
  };
  walk(cd);
  return buf;
}
// .layout-article--centered → ONE section styled `centered`: h1, share toggle, prose, inline CTA row,
// article footer ("Did you enjoy…" + share toggle) — the live column has no inter-block gaps
function article(dom) {
  const wrapper = els(dom)[0] || dom;
  let buf = '';
  const handle = (x) => {
    if (x.tag === '#text') return;
    if (isH(x) && x.tag === 'h1') { h1Done = true; buf += `<h1>${frag(inner(x))}</h1>`; return; }
    if (cls(x, 'share-btn')) {
      buf += SHARE;
      deviations.push('share-widget: the visible "Share" toggle is authored as a plain anchor (#share); the collapsed mail/LinkedIn/Facebook/print share links (javascript:/$url hrefs) are not delivered');
      return;
    }
    if (cls(x, 'article-footer')) {
      const p = find(x, (y) => y.tag === 'p', [], true)[0];
      if (p) buf += `<p>${frag(inner(p))}</p>`;
      buf += SHARE;
      return;
    }
    if (cls(x, 'ccm-cookie-declaration')) { buf += cookieDeclaration(x); return; }
    if (cls(x, 'inline-button-row')) { buf += ctaRow(x, true); return; }
    if ((x.tag === 'span' || x.tag === 'div') && !cls(x, 'icon')) { x.children.forEach(handle); return; }
    const [body] = richtext({ children: [x] }, true);
    buf += body;
  };
  els(wrapper).forEach(handle);
  if (buf.trim()) section(`  ${buf.trim()}`, 'centered');
}
function textContainer(tc) {
  return els(tc).filter((x) => !(cls(x, 'icon'))).map((x) => {
    if (x.tag === 'a') return `<p><a href="${esc(abs(x.attrs.href))}">${clean(textOf(x))}</a></p>`;
    if (x.tag === 'p' && !clean(textOf(x))) return '';
    // the page's only heading (source <h2 class="h3">) carries the document outline → <h1>
    if (isH(x) && !h1Done && !find(main, (y) => y.tag === 'h1', [], true).length) {
      h1Done = true; return `<h1>${frag(inner(x))}</h1>`;
    }
    return `<${x.tag}>${frag(inner(x))}</${x.tag}>`;
  }).join('');
}
function columns(row) {
  const cells = els(row).map((w) => {
    const tc = q(w, 'text-container');
    if (tc) return textContainer(tc);
    return imgTag(find(w, (x) => x.tag === 'img', [], true)[0]);
  });
  if (find(row, (x) => x.tag === 'i' && cls(x, 'icon'), [], true).length) deviations.push('columns: empty decorative <i class="icon"> glyph dropped');
  section(block(`columns${q(row, 'media-player') ? ' video' : ''}`, [cells]));
}

// ── walk ──────────────────────────────────────────────────────────────────────
const root = parse(html);
const main = find(root, (x) => x.tag === 'main', [], true)[0];
breadcrumb(root);
const h1Slot = sections.length; // --h1-from-title inserts here when the source main has no heading
els(main).forEach((row) => {
  if (cls(row, 'layout-100-headline--flex') && row.attrs.id) {
    const h = find(row, isH, [], true)[0];
    if (h) headingIds.set(row.attrs.id, slug(textOf(h)));
  }
});
els(main).forEach((row) => {
  if (cls(row, 'layout-passepartout') || (row.attrs.id || '').startsWith('fsSectionId_')) return;
  if (cls(row, 'navigation-anchor-navigation-wrapper')) { anchorNav(row); return; }
  if (cls(row, 'layout-100-headline--flex')) { headline(row); return; }
  if (cls(row, 'layout-50--fixed') || cls(row, 'layout-50-reverse--fixed')) { columns(row); return; }
  if (cls(row, 'layout-article--centered')) { article(row); return; }
  if (cls(row, 'layout-100--flex')) { flex100(row); return; }
  console.error(`unhandled row: ${row.tag}.${row.attrs.class}`);
});

if (!h1Done && args.includes('--h1-from-title')) {
  const t = opt('--title', (sidecar.metadata && sidecar.metadata.title) || '');
  const h1 = `<h1>${esc(t)}</h1>`;
  // the centered section exists → the surfaced h1 heads its prose column; otherwise its own section
  if (sections[h1Slot] && sections[h1Slot].includes('<div>centered</div>')) sections[h1Slot] = sections[h1Slot].replace('<div>\n  ', `<div>\n  ${h1}`);
  else sections.splice(h1Slot, 0, `<div>\n  ${h1}\n</div>`);
  deviations.push(`h1-from-title: the source main has no heading; the document title "${t}" is surfaced as <h1> (delivery-lint P0 h1)`);
}

// ── metadata ──────────────────────────────────────────────────────────────────
const titleTag = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const title = opt('--title', (sidecar.metadata && sidecar.metadata.title) || clean(titleTag).replace(/\s*\|\s*Linde Material Handling\s*$/, ''));
const descTag = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
const description = opt('--description', (sidecar.metadata && sidecar.metadata.description) || descTag);
const ogTag = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || '';
const og = opt('--og-image', ogTag);
const meta = [['Title', esc(title)], ['Description', esc(description)], ['og:image', og ? esc(og) : ''], ['Template', 'static']]
  .filter(([, v]) => v).map(([k, v]) => `    <div><div>${k}</div><div>${v}</div></div>`).join('\n');
sections.push(`<div>\n  <div class="metadata">\n${meta}\n  </div>\n</div>`);

fs.writeFileSync(outFile, `<body>\n<header></header>\n<main>\n${sections.join('\n')}\n</main>\n<footer></footer>\n</body>\n`);
const out = fs.readFileSync(outFile, 'utf8');
console.log(`${outFile}: ${sections.length} sections, ${(out.match(/<img /g) || []).length} images, ${(out.match(/class="table"/g) || []).length} tables`);
[...new Set(deviations)].forEach((d) => console.log(`deviation: ${d}`));
