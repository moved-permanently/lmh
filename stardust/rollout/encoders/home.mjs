/**
 * home.mjs — ENCODER for the `home` template (the site root /en): migrated main → EDS content
 * document. Walks the source layout rows in order and emits one section per row:
 *   .media-carousel--header (slick, 1 clone + N + N clones) → hero-carousel block, one row per
 *       real slide [img] [p strong eyebrow (.h3), p title (.h2), p strong>a CTA (.btn--primary)]
 *   .layout-cta.layout-25-split--fixed                 → teaser-grid (cta) block, one row per icon
 *       card [code icon-key] [p a label; strong = .teaser--highlighted]
 *   .layout-100-headline--fixed > h1 + .layout-33--fixed → default content h1 + teaser-grid (icons)
 *       block, one row per .teaser--icon-text [h3, p, p a]
 *   .layout-25--fixed                                  → teaser-grid block, one row per card
 *       [img (+ p code video)] [h3 a, p, p a]
 *   .layout-100-headline--fixed > h2 + .layout-teasercarousel__wrapper → default content h2 +
 *       teaser-carousel-light block, one row per .teaser--overflow [h3 a, p, p a]
 * FirstSpirit section anchors (#fsSectionId_*) are zero-height on live and not authored.
 * Usage: node stardust/rollout/encoders/home.mjs <source index.html> <out.html> --url <live URL>
 *        [--title <t>] [--description <d>]
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const positional = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
const [srcFile, outFile] = positional;
const pageUrl = opt('--url');
if (!srcFile || !outFile || !pageUrl) {
  console.error('usage: home.mjs <src index.html> <out.html> --url <live URL> [--title t] [--description d]');
  process.exit(2);
}
const html = fs.readFileSync(srcFile, 'utf8');
const meta = (() => {
  try { return JSON.parse(fs.readFileSync(`${srcFile.replace(/[^/]*$/, '')}_meta.json`, 'utf8')); } catch { return {}; }
})();

// ── minimal DOM ───────────────────────────────────────────────────────────────────────────────
const VOID = new Set(['img', 'br', 'hr', 'source', 'input', 'meta', 'link', 'wbr']);
function parse(src) {
  const root = { tag: '#root', attrs: {}, children: [], start: 0, end: src.length };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>]+(?:="[^"]*"|='[^']*'|=[^\s>]+)?)*)\s*(\/?)>/g;
  let m; let last = 0;
  const text = (from, to) => {
    if (to > from) stack[stack.length - 1].children.push({ tag: '#text', text: src.slice(from, to), start: from, end: to });
  };
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
    if (tag === 'script' || tag === 'style') {
      const e = src.indexOf(`</${tag}>`, last); re.lastIndex = e + tag.length + 3; last = re.lastIndex; node.end = last;
    }
  }
  return root;
}
const cls = (n, c) => !!n.attrs && (` ${n.attrs.class || ''} `).includes(` ${c} `);
const els = (n) => (n.children || []).filter((c) => c.tag !== '#text');
function find(n, pred, out = [], first = false) {
  for (const c of els(n)) {
    if (pred(c)) { out.push(c); if (first) return out; }
    find(c, pred, out, first); if (first && out.length) return out;
  }
  return out;
}
const q = (n, c) => find(n, (x) => cls(x, c), [], true)[0];
const qa = (n, c) => find(n, (x) => cls(x, c));
const qt = (n, t) => find(n, (x) => x.tag === t, [], true)[0];
const textOf = (n) => (n.tag === '#text' ? n.text : (n.children || []).map(textOf).join(''));
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const txt = (n) => esc(decode(clean(textOf(n))));

// ── emit helpers ──────────────────────────────────────────────────────────────────────────────
const abs = (h) => { try { return new URL(h, pageUrl).href; } catch { return h; } };
function largestSrc(img) {
  const ss = img.attrs.srcset || '';
  let best = { u: img.attrs.src, w: 0 };
  ss.split(',').forEach((c) => { const [u, w] = c.trim().split(/\s+/); const n = parseInt(w || '0', 10); if (n > best.w) best = { u, w: n }; });
  return abs(best.u || img.attrs.src);
}
const imgTag = (img) => (img ? `<img src="${esc(largestSrc(img))}" alt="${esc(clean(img.attrs.alt || ''))}">` : '');
const link = (a, label) => `<a href="${esc(abs(a.attrs.href || ''))}">${label ?? txt(a)}</a>`;
const iconKey = (n) => {
  const m = /icon-LMHIcon(\w+?)black\b/.exec(n ? n.attrs.class || '' : '');
  return m ? m[1].toLowerCase() : '';
};
const row = (cells) => `    <div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>\n`;
const block = (name, rows) => `  <div class="${name}">\n${rows.join('')}  </div>\n`;
const section = (inner) => `<div>\n${inner}</div>\n`;

const root = parse(html);
const body = q(root, 'body-container') || root;
const out = [];
const log = [];

// metadata
const title = opt('--title', (meta.metadata && meta.metadata.title) || clean(textOf(qt(root, 'title') || { tag: '#text', text: '' })));
const description = opt('--description', (meta.metadata && meta.metadata.description) || '');
const firstImg = qt(q(body, 'media-carousel--header') || body, 'img');
out.push(section(block('metadata', [
  row(['Title', esc(title)]),
  row(['Description', esc(description.trim())]),
  ...(firstImg ? [row(['og:image', esc(largestSrc(firstImg))])] : []),
  row(['Template', 'home']),
])));

// hero-carousel — real slides only (slick clones carry .slick-cloned)
const hero = q(body, 'media-carousel--header');
if (hero) {
  const slides = qa(hero, 'media-carousel-item').filter((s) => !cls(s, 'slick-cloned') && q(s, 'media-carousel-item-text'));
  const rows = slides.map((s) => {
    const img = qt(s, 'img');
    const eyebrow = q(s, 'h3');
    const h2 = q(s, 'h2');
    const a = q(s, 'btn__link');
    const parts = [];
    if (eyebrow) parts.push(`<p><strong>${txt(eyebrow)}</strong></p>`);
    if (h2) parts.push(`<p>${txt(h2)}</p>`);
    if (a) parts.push(`<p><strong>${link(a)}</strong></p>`);
    return row([imgTag(img), parts.join('')]);
  });
  out.push(section(block('hero-carousel', rows)));
  log.push(`hero-carousel: ${rows.length} slides (of ${qa(hero, 'media-carousel-item').length} slick items)`);
}

// layout rows in document order
const rowsAll = find(body, (n) => n.tag === 'div' && /(^| )layout-(cta|33--fixed|25--fixed|100-headline--fixed|teasercarousel__wrapper)( |$)/.test(n.attrs.class || ''));
let pendingHead = '';
for (const r of rowsAll) {
  if (cls(r, 'layout-cta')) {
    const cards = qa(r, 'teaser--icon');
    const rows = cards.map((a) => {
      const label = q(a, 'h3') || qt(a, 'h3');
      const lab = link(a, txt(label));
      return row([`<code>${iconKey(q(a, 'icon'))}</code>`, cls(a, 'teaser--highlighted') ? `<p><strong>${lab}</strong></p>` : `<p>${lab}</p>`]);
    });
    out.push(section(block('teaser-grid cta', rows)));
    log.push(`teaser-grid cta: ${rows.length} icon cards`);
  } else if (cls(r, 'layout-100-headline--fixed')) {
    const h = qt(r, 'h1') || qt(r, 'h2');
    if (h) pendingHead = `  <${h.tag}>${txt(h)}</${h.tag}>\n`;
  } else if (cls(r, 'layout-33--fixed')) {
    const items = qa(r, 'teaser--icon-text');
    const rows = items.map((t) => {
      const key = iconKey(q(t, 'icon'));
      const h3 = qt(t, 'h3'); const p = qt(t, 'p'); const a = q(t, 'textlink');
      const parts = [];
      if (h3) parts.push(`<h3>${txt(h3)}</h3>`);
      if (p) parts.push(`<p>${txt(p)}</p>`);
      if (a) parts.push(`<p>${link(a)}</p>`);
      return row(key ? [`<code>${key}</code>`, parts.join('')] : [parts.join('')]);
    });
    out.push(section(pendingHead + block('teaser-grid icons', rows)));
    log.push(`teaser-grid icons: ${rows.length} items${pendingHead ? ' + head' : ''}`);
    pendingHead = '';
  } else if (cls(r, 'layout-25--fixed')) {
    const cards = qa(r, 'teaser--card');
    const rows = cards.map((c) => {
      const img = qt(c, 'img');
      const video = !!q(c, 'image-wrapper--video');
      const h3 = qt(c, 'h3'); const ha = h3 ? qt(h3, 'a') : null;
      const tw = q(c, 'teaser__text-wrapper');
      const p = tw ? qt(tw, 'p') : null; const more = tw ? find(tw, (x) => x.tag === 'a' && !h3?.children.includes(x))[0] : null;
      const parts = [];
      if (h3) parts.push(`<h3>${ha ? link(ha) : txt(h3)}</h3>`);
      if (p) parts.push(`<p>${txt(p)}</p>`);
      if (more) parts.push(`<p>${link(more)}</p>`);
      return row([imgTag(img) + (video ? '<p><code>video</code></p>' : ''), parts.join('')]);
    });
    out.push(section(pendingHead + block('teaser-grid', rows)));
    log.push(`teaser-grid: ${rows.length} cards${pendingHead ? ' + head' : ''}`);
    pendingHead = '';
  } else if (cls(r, 'layout-teasercarousel__wrapper')) {
    const cards = qa(r, 'teaser--overflow').filter((c) => !cls(c.parent, 'slick-cloned'));
    const rows = cards.map((c) => {
      const h3 = qt(c, 'h3'); const ha = h3 ? qt(h3, 'a') : null;
      const tw = q(c, 'teaser__text-wrapper');
      const p = tw ? qt(tw, 'p') : null; const more = tw ? qt(tw, 'a') : null;
      const parts = [];
      if (h3) parts.push(`<h3>${ha ? link(ha) : txt(h3)}</h3>`);
      if (p) parts.push(`<p>${txt(p)}</p>`);
      if (more) parts.push(`<p>${link(more)}</p>`);
      return row([parts.join('')]);
    });
    out.push(section(pendingHead + block('teaser-carousel-light', rows)));
    log.push(`teaser-carousel-light: ${rows.length} cards${pendingHead ? ' + head' : ''}`);
    pendingHead = '';
  }
}
if (pendingHead) out.push(section(pendingHead));

const doc = `<body>\n<header></header>\n<main>\n${out.join('')}</main>\n<footer></footer>\n</body>\n`;
fs.mkdirSync(outFile.replace(/[^/]*$/, '') || '.', { recursive: true });
fs.writeFileSync(outFile, doc);
console.log(`${outFile}: ${out.length} sections — ${log.join('; ')}`);
