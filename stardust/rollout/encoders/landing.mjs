/**
 * landing.mjs — ENCODER for the `landing` template (32 campaign landing pages): migrated/prototype
 * main → EDS content document. Walks the source layout rows in order and emits one section per row:
 *   .layout-passepartout > .header-image      → breadcrumb (empty crumb, foundation block) + hero
 *   .navigation-anchor-navigation-wrapper     → default content <ul> + section style anchor-nav
 *   .layout-100-headline--fixed               → default content <h2> + section style headline
 *   .layout-article--centered (dom-content)   → default content, style article[ intro]; a nested
 *                                               .media-browser / button row splits the section
 *   .content-browser                          → media-browser (content) block, one row per item
 *   .parallax-container                       → hero (banner[ right]) block
 *   .layout-50(-reverse)--fixed               → columns block (one row, text|image in source order)
 *   .layout--teaser rows                      → related-teasers block (icons variant for icon-text)
 *   .inline-button-row                        → default content CTA paragraphs, style cta[ horizontal|stretch]
 *   .related-content                          → default content <h2> + teaser-carousel block
 * Sibling modules (cluster-landing-1): generic .layout-N(-M)(-reverse)--flex|fixed rows → columns
 *   (variants text-60|text-40, flex, video, red, carousel — slides as one <p><img></p> per slide),
 *   .text-container band → default content article[, dark|white|red], .testimonial → columns
 *   testimonial, .module-fact-counter → related-teasers facts[ red], .accordion → accordion block,
 *   .carousel-wrapper / .image-clipper band → media-carousel[ top|bottom], standalone
 *   .layout-teasercarousel__wrapper → teaser-carousel (section style standalone), .read-more → the
 *   hidden copy authored expanded, headline rows carry their layout--dark|white|red as a section style.
 * Usage: node stardust/rollout/encoders/landing.mjs <source index.html> <out.html> --url <live URL>
 *        [--title <t>] [--description <d>]
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [srcFile, outFile] = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
const pageUrl = opt('--url');
if (!srcFile || !outFile || !pageUrl) { console.error('usage: landing.mjs <src> <out> --url <live URL>'); process.exit(2); }
const html = fs.readFileSync(srcFile, 'utf8');
// sidecar judgments (migrate.mjs variant <slug> <class…>): tokens the capture does not carry
const sidecarVariants = (() => {
  try {
    const m = JSON.parse(fs.readFileSync(`${srcFile.replace(/[^/]*$/, '')}_meta.json`, 'utf8'));
    return (m.variants || []).join(' ').split(/\s+/).filter(Boolean);
  } catch { return []; }
})();

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
  // a thumbnail rendition re-suffixed by the source (…_tn_16x9w640_16x9w1920.jpg) lists sizes it does not
  // serve (404 → the pipeline ships about:error): only a candidate whose two size tokens agree is eligible
  const phantom = (u) => { const m = (u || '').match(/_(\d+x\d+)w(\d+)_\1w(\d+)\./); return !!m && m[2] !== m[3]; };
  ss.split(',').forEach((c) => { const [u, w] = c.trim().split(/\s+/); const n = parseInt(w || '0', 10); if (n > best.w && !phantom(u)) best = { u, w: n }; });
  return abs(best.u || img.attrs.src);
}
const imgTag = (img) => (img ? `<img src="${esc(largestSrc(img))}" alt="${esc(clean(img.attrs.alt || ''))}">` : '');
// re-emit an authored inline fragment: drop presentational attrs/icon spans, absolutise hrefs
function frag(s) {
  return s.replace(/<span class="icon[^"]*"[^>]*><\/span>/g, '')
    .replace(/\s(class|target|aria-hidden|tabindex|data-[\w-]+|title)="[^"]*"/g, '')
    .replace(/href="([^"]*)"/g, (a, h) => `href="${esc(h.startsWith('#') ? h : abs(h))}"`)
    .replace(/<p>\s*<\/p>/g, '').trim();
}
const slug = (t) => clean(t).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-');
const sections = [];
// section styles are comma-separated (EDS decorateSections splits on ","; a space would fuse them)
const section = (body, style) => sections.push(`<div>\n${body}${style ? `\n  <div class="section-metadata"><div><div>Style</div><div>${style.split(' ').join(', ')}</div></div></div>` : ''}\n</div>`);
const block = (name, rows) => `  <div class="${name}">\n${rows.map((cells) => `    <div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('\n')}\n  </div>`;

// ── module encoders ───────────────────────────────────────────────────────────────────────────
const headingIds = new Map(); // source anchor id → EDS heading slug
function hero(hi) {
  const img = q(hi, 'image-wrapper-16x9') && find(q(hi, 'image-wrapper-16x9'), (x) => x.tag === 'img', [], true)[0];
  const h1 = find(hi, (x) => x.tag === 'h1', [], true)[0];
  const sub = find(hi, (x) => x.tag === 'span' && cls(x, 'h2'), [], true)[0];
  const btns = find(hi, (x) => x.tag === 'a' && cls(x, 'btn__link'));
  let text = `<h1>${frag(inner(h1))}</h1>`;
  if (sub && clean(textOf(sub))) text += `<p>${frag(inner(sub))}</p>`;
  btns.forEach((a) => { text += `<p><strong><a href="${esc(abs(a.attrs.href))}">${clean(textOf(a))}</a></strong></p>`; });
  section(block('breadcrumb', [['']]));
  const alt = cls(hi, 'header-image-alternate') || sidecarVariants.includes('header-image-alternate');
  section(block(`hero${alt ? ' red' : ''}`, [[imgTag(img)], [text]]));
}
function anchorNav(n) {
  const links = find(n, (x) => x.tag === 'a' && x.attrs.href);
  const li = links.map((a) => `<li><a href="#${headingIds.get(a.attrs.href.replace('#', '')) || a.attrs.href.replace('#', '')}">${clean(textOf(a))}</a></li>`);
  section(`  <ul>${li.join('')}</ul>`, 'anchor-nav');
}
function contentBrowser(cb) {
  const panels = qa(cb, 'content_wrapper');
  const rows = panels.map((p) => {
    const img = find(p, (x) => x.tag === 'img', [], true)[0];
    const body = els(p).filter((x) => !cls(x, 'image-wrapper')).map((x) => {
      if (x.tag === 'a') return `<p><a href="${esc(abs(x.attrs.href))}">${frag(inner(x))}</a></p>`;
      return `<${x.tag}>${frag(inner(x))}</${x.tag}>`;
    }).join('');
    return [imgTag(img), body];
  });
  section(block('media-browser content', rows));
}
function mediaBrowser(mb, wide = false) {
  const items = qa(q(mb, 'media-browser__master'), 'media-browser__item');
  // a video slide (.media-player[data-video-url]) carries its player URL as a bare link after the picture
  const rows = items.map((it) => {
    const img = find(it, (x) => x.tag === 'img', [], true)[0];
    const player = find(it, (x) => x.attrs && x.attrs['data-video-url'], [], true)[0];
    const url = player && player.attrs['data-video-url'];
    return [imgTag(img) + (url ? `<p><a href="${esc(url)}">${esc(url)}</a></p>` : '')];
  });
  section(block(`media-browser${wide ? ' wide' : ''}`, rows));
}
function parallax(px) {
  const img = find(q(px, 'parallax__image'), (x) => x.tag === 'img', [], true)[0];
  const tw = q(px, 'parallax__text-wrapper');
  const body = els(tw).map((x) => `<${x.tag}>${frag(inner(x))}</${x.tag}>`).join('');
  section(block(`hero banner${cls(tw, 'text-wrapper--topright') || cls(tw, 'text-wrapper--bottomright') ? ' right' : ''}${cls(tw, 'text-wrapper--bottomleft') || cls(tw, 'text-wrapper--bottomright') ? ' bottom' : ''}`, [[imgTag(img)], [body]]));
}
// source .text-container > span.icon (LindeGlobalIconFont glyph, 3rem red / inherited on dark; measured financing 1440:
// 67.5 px slot + 1rem above the h3) → <p><code>key</code></p>, decorated by columns.js into span.icon.icon-<key>
// (the program encoder's convention; the landing encoder dropped the icon, so the slot was missing)
const iconKey = (ic) => { const cl = ((ic && ic.attrs.class) || '').split(/\s+/);
  return ((cl.find((c) => /^icon-LMHIcon./.test(c)) || '').replace('icon-LMHIcon', '') || (cl.find((c) => /^icon-LMH./.test(c)) || '').replace('icon-LMH', '')).replace(/black$/, ''); };
function textContainer(tc) {
  const ic = els(tc).find((x) => x.tag === 'span' && cls(x, 'icon'));
  const key = iconKey(ic);
  return (key ? `<p><code>${key}</code></p>` : '') + els(tc).filter((x) => x !== ic).map((x) => {
    if (x.tag === 'a' && cls(x, 'btn__link')) return `<p><strong><a href="${esc(abs(x.attrs.href))}">${clean(textOf(x))}</a></strong></p>`;
    if (x.tag === 'a') return `<p><a href="${esc(abs(x.attrs.href))}">${frag(inner(x))}</a></p>`;
    // empty source paragraphs are layout in the flex-column text container (p + p 0.5em each, measured
    // logimat 360/1440): the article markers — <p><br></p> keeps a line, <p></p> a 0 px block (columns.css)
    if (x.tag === 'p' && !clean(textOf(x)) && !find(x, (y) => y.tag === 'img', [], true).length) return find(x, (y) => y.tag === 'br', [], true).length ? '<p>&#8203;</p>' : '<p><sup>&#8203;</sup></p>';
    return `<${x.tag}>${frag(inner(x))}</${x.tag}>`;
  }).join('');
}
// sibling modules (cluster-landing-1): slide images of a .carousel-wrapper (clones already dropped)
const slideImgs = (cw) => qa(cw, 'media-carousel-item').map((it) => find(it, (x) => x.tag === 'img', [], true)[0]).filter(Boolean);
// .layout-100--flex > .text-container (text band) → default content, style article[, bg]
function textBand(item, bg) {
  const tc = q(item, 'text-container');
  section(`  ${textContainer(tc)}`, `article${cls(tc, 'text-container--center') ? ' center' : ''}${bg ? ` ${bg}` : ''}`);
}
// .testimonial → columns testimonial: [1x1 portrait] [quote as <em>, info p]
function testimonial(t, bg) {
  const img = find(t, (x) => x.tag === 'img', [], true)[0];
  const quote = find(t, (x) => x.tag === 'blockquote', [], true)[0];
  const info = find(t, (x) => x.tag === 'p' && cls(x, 'info'), [], true)[0];
  let body = quote ? `<p><em>${frag(inner(quote))}</em></p>` : '';
  if (info) body += `<p>${frag(inner(info))}</p>`;
  section(block('columns testimonial', [[imgTag(img), body]]), bg);
}
// .module-fact-counter → related-teasers facts[ red]: one row per fact [headline p, <strong>value</strong>, sub p]
function factCounter(row) {
  const tone = ['red', 'dark', 'lightgrey'].find((t) => q(row, t));
  const rows = qa(row, 'module-fact-counter--row').map((r) => {
    const h = q(r, 'module-fact-counter--headline'); const c = q(r, 'module-fact-counter--counter'); const s = q(r, 'module-fact-counter--subheadline');
    return [`${h ? `<p>${frag(inner(h))}</p>` : ''}${c ? `<p><strong>${clean(textOf(c))}</strong></p>` : ''}${s ? `<p>${frag(inner(s))}</p>` : ''}`];
  });
  section(block(`related-teasers facts${tone ? ` ${tone}` : ''}`, rows));
}
// .accordion → accordion block: one row per item [h3 title] [body: content-left text, content-right pictures]
function accordion(acc, bg) {
  const rows = qa(acc, 'accordion-item').map((it) => {
    const h = find(q(it, 'accordion-item-headline'), (x) => /^h[1-6]$/.test(x.tag), [], true)[0];
    const bodyEl = q(it, 'accordion-item-body-content') || q(it, 'accordion-item-body');
    let body = '';
    const left = q(bodyEl, 'content-left'); const right = q(bodyEl, 'content-right');
    const texts = left ? els(left) : els(bodyEl).filter((x) => !cls(x, 'content-right'));
    texts.forEach((x) => { if (x.tag === 'p' && !clean(textOf(x))) return; body += x.tag === 'a' ? `<p><a href="${esc(abs(x.attrs.href))}">${frag(inner(x))}</a></p>` : `<${x.tag}>${frag(inner(x))}</${x.tag}>`; });
    (right ? find(right, (x) => x.tag === 'img') : []).forEach((im) => { body += `<p>${imgTag(im)}</p>`; });
    return [`<h3>${frag(inner(h))}</h3>`, body];
  });
  section(block('accordion', rows), bg);
}
// .carousel-wrapper / .image-clipper band → media-carousel[ top|bottom]: one row per slide [picture]
function mediaBand(item, bg) {
  const cw = q(item, 'carousel-wrapper');
  const imgs = cw ? slideImgs(cw) : find(item, (x) => x.tag === 'img');
  const cont = q(item, 'image-clipper__contents');
  const pos = cont && cls(cont, 'image-clipper__contents--top') ? ' top' : cont && cls(cont, 'image-clipper__contents--bottom') ? ' bottom' : '';
  section(block(`media-carousel${pos}`, imgs.map((im) => [imgTag(im)])), bg);
}
// generic layout-N--flex|fixed rows: ≥2 item wrappers → columns (ratio/flex/video/red/carousel variants)
function columnsGeneric(row, items, bg) {
  const m = (row.attrs.class || '').match(/layout-(\d+)(?:-(\d+))?(-reverse)?--(flex|fixed)/) || [];
  // two (or more) TEXT containers on a flex row → columns split <colour> <colour> (one colour token per cell,
  // white/default → white), the program encoder's split(): a single block-level tone painted BOTH cells
  // (technical-safety-services 1440: live dark cell 0–719 px, build dark row 0–1439 px, band 46 % diff)
  if (m[4] === 'flex' && items.length >= 2 && items.every((it) => !!q(it, 'text-container'))) {
    const colour = (w) => (cls(w, 'layout--red') || !!q(w, 'layout--red') ? 'red' : cls(w, 'layout--dark') || !!q(w, 'layout--dark') ? 'dark' : 'white');
    section(block(`columns split ${items.map(colour).join(' ')}`, [items.map((w) => textContainer(q(w, 'text-container')))]), bg);
    return;
  }
  const v = [];
  const firstText = !!q(items[0], 'text-container');
  if (m[2]) v.push((m[1] === '60') === firstText ? 'text-60' : 'text-40');
  if (m[4] === 'flex') v.push('flex');
  if (q(row, 'media-player')) v.push('video');
  // item-wrapper tone (.layout--red|dark|white on the item) → one colour token (columns.js tones)
  const tone = ['red', 'dark', 'white'].find((b) => items.some((it) => cls(it, `layout--${b}`) || !!q(it, `layout--${b}`)));
  if (tone) v.push(tone);
  if (q(row, 'carousel-wrapper')) v.push('carousel');
  // .text-container--large on a flex-row text item → `large` (x-range 1440: source copy 20.25/30.375/1em, build 17.1/29.925/0 without it)
  if (m[4] === 'flex' && items.some((it) => !!q(it, 'text-container--large'))) v.push('large');
  if (m[4] === 'flex' && items.some((it) => !!q(it, 'image-wrapper-1x1'))) v.push('square');
  const cells = items.map((w) => {
    const tc = q(w, 'text-container');
    if (tc) return textContainer(tc);
    const cw = q(w, 'carousel-wrapper');
    if (cw) return slideImgs(cw).map((im) => `<p>${imgTag(im)}</p>`).join('');
    return imgTag(find(w, (x) => x.tag === 'img', [], true)[0]);
  });
  section(block(`columns${v.length ? ` ${v.join(' ')}` : ''}`, [cells]), bg);
}
function columns(row) {
  const cells = els(row).map((w) => {
    const tc = q(w, 'text-container');
    if (tc) return textContainer(tc);
    const img = find(w, (x) => x.tag === 'img', [], true)[0];
    return imgTag(img);
  });
  const video = !!q(row, 'media-player');
  section(block(`columns${video ? ' video' : ''}`, [cells]));
}
function teasers(row) {
  const wrappers = els(row);
  const icons = !!q(row, 'teaser--icon-text');
  // .teaser--card rows carry the card model (16px padding all round, boxed trailing button) → `cards` token;
  // a plain .teaser row (padding 16px 0 24px, in-flow text link) is the block's default
  const cards = !icons && !!q(row, 'teaser--card');
  const rows = wrappers.map((w) => {
    if (icons) {
      const t = q(w, 'teaser--icon-text');
      const ic = find(t, (x) => x.tag === 'span' && cls(x, 'icon'), [], true)[0];
      const icls = ((ic && ic.attrs.class) || '').split(/\s+/);
      // icon-LMHIcon<name>black is the common form; icon-LMH<name>black (price, loadcapacity) the rare
      // one — an empty key collapsed the cell and the row lost its heading (gse-expo, x-models)
      const key = (icls.find((c) => c.startsWith('icon-LMHIcon')) || '').replace('icon-LMHIcon', '')
        || (icls.find((c) => c.startsWith('icon-LMH')) || '').replace('icon-LMH', '') || 'icon';
      const body = els(t).filter((x) => x !== ic).map((x) => `<${x.tag}>${frag(inner(x))}</${x.tag}>`).join('');
      return [`<p><code>${key.replace(/black$/, '') || 'icon'}</code></p>`, body];
    }
    const t = q(w, 'teaser');
    const iw = els(t)[0];
    const img = find(iw, (x) => x.tag === 'img', [], true)[0];
    const flag = cls(iw, 'image-wrapper--video') ? '<p><code>video</code></p>' : '';
    const cw = q(t, 'teaser__content-wrapper');
    const h = els(cw)[0];
    const tw = q(cw, 'teaser__text-wrapper');
    let body = `<h3>${frag(inner(h))}</h3>`;
    els(tw).forEach((x) => { body += x.tag === 'a' ? `<p><a href="${esc(abs(x.attrs.href))}">${frag(inner(x))}</a></p>` : `<${x.tag}>${frag(inner(x))}</${x.tag}>`; });
    return [imgTag(img) + flag, body];
  });
  // .layout-25(-split)--fixed rows are four tiles per row on the source (25 %) → explicit `four` token
  const four = cls(row, 'layout-25--fixed') || cls(row, 'layout-25-split--fixed');
  section(block(`related-teasers${icons ? ' icons' : ''}${cards ? ' cards' : ''}${four ? ' four' : ''}`, rows));
}
function ctaRow(ibr) {
  const links = find(ibr, (x) => x.tag === 'a' && cls(x, 'btn__link'));
  // .btn--action (16px 24px, line-height 21, margin 8px 0 — measured h-models 1440) → the boilerplate's
  // high-impact <em><strong> wrapper (a.button.accent); the plain .btn (48px) stays <strong> (a.button.primary)
  const ps = links.map((a) => {
    const action = !!find(a, (y) => cls(y, 'btn--action'), [], true).length;
    const link = `<strong><a href="${esc(abs(a.attrs.href))}">${clean(textOf(a))}</a></strong>`;
    return `  <p>${action ? `<em>${link}</em>` : link}</p>`;
  }).join('\n');
  const v = cls(ibr, 'inline-button-row--horizontal') ? ' horizontal' : cls(ibr, 'inline-button-row--stretch') ? ' stretch' : '';
  section(ps, `cta${v}`);
}
// cluster-landing-2 modules: .infobox-text → infobox[ right] block (one cell: heading/paragraphs, icon box
// dropped); .wizard (slick slide deck, JS-driven) → wizard block, one row per slide [picture] [headings,
// paragraphs, button labels as <strong> paragraphs] — delivered as captured, static slides (deviation)
function infobox(ib) {
  const body = els(ib).filter((x) => !cls(x, 'icon')).map((x) => (x.tag === 'p' && !clean(textOf(x)) ? '' : `<${x.tag}>${frag(inner(x))}</${x.tag}>`)).join('');
  section(block(`infobox${cls(ib, 'infobox--right') ? ' right' : ''}`, [[body]]));
}
function wizard(w) {
  const rows = els(q(w, 'slick-track') || w).map((sl) => {
    const img = find(sl, (x) => x.tag === 'img', [], true)[0];
    let body = '';
    const walk = (n) => els(n).forEach((x) => {
      if (cls(x, 'wizard-progress') || cls(x, 'icon') || cls(x, 'image-wrapper')) return;
      if (/^(h[1-6]|p|ul|ol)$/.test(x.tag)) { if (clean(textOf(x))) body += `<${x.tag}>${frag(inner(x))}</${x.tag}>`; return; }
      if (x.tag === 'a' && x.attrs.href) { body += `<p><strong><a href="${esc(abs(x.attrs.href))}">${clean(textOf(x))}</a></strong></p>`; return; }
      if (cls(x, 'btn')) { body += `<p><strong>${clean(textOf(x))}</strong></p>`; return; }
      if (cls(x, 'wizard-result')) { body += `<p>${clean(textOf(q(x, 'wizard-result__title') || x))}</p>`; return; }
      walk(x);
    });
    walk(sl);
    return [imgTag(img), body];
  });
  section(block('wizard', rows));
}
function article(wrapper) {
  let buf = ''; let intro = false; let cont = false;
  // a buffer holding only empty-paragraph markers is not a band (the source had nothing visible there)
  const flush = () => { if (buf.replace(/<p>(?:<sup>)?&#8203;(?:<\/sup>)?<\/p>\s*/g, '').trim()) section(buf, `article${intro ? ' intro' : ''}${cont ? ' continued' : ''}`); buf = ''; intro = false; cont = false; };
  els(wrapper).forEach((x) => {
    if (cls(x, 'media-browser')) { flush(); mediaBrowser(x); cont = true; return; } // the column continues around the nested gallery: `article continued` (hero.css: 16 px above, measured; a FRESH band after a gallery band keeps its 50 px — logimat 1440)
    if (q(x, 'inline-button-row') || cls(x, 'inline-button-row')) { flush(); ctaRow(cls(x, 'inline-button-row') ? x : q(x, 'inline-button-row')); return; }
    if (cls(x, 'read-more')) {
      // live: .read-more__content is display:none behind the toggle (measured 1440 gse-expo: intro
      // 376 px live vs 789 expanded). The hidden copy gets its own `article read-more` section
      // (hero.css hides it until the toggle adds .expanded), the toggle its own section after it.
      flush();
      const c = q(x, 'read-more__content');
      const lead = (c.children || []).filter((y) => y.tag === '#text').map((y) => y.text).join('');
      let hid = '';
      if (clean(lead)) hid += `  <p>${frag(clean(lead))}</p>\n`;
      els(c).forEach((y) => { if (y.tag === 'p' && !clean(textOf(y))) return; hid += `  <${y.tag}>${frag(inner(y))}</${y.tag}>\n`; });
      if (hid.trim()) section(hid, 'article read-more');
      const tg = q(x, 'read-more__toggle');
      if (tg) section(`  <p><a href="${esc(tg.attrs.href || '#read_more')}">${clean(textOf(tg))}</a></p>\n`, 'article read-more-toggle');
      return;
    }
    if (cls(x, 'infobox-text')) { flush(); infobox(x); return; }
    if (cls(x, 'infobox-media')) {
      const a = find(x, (y) => y.tag === 'a' && y.attrs.href, [], true)[0];
      const im = imgTag(find(x, (y) => y.tag === 'img', [], true)[0]);
      const cell = a ? `<a href="${esc(a.attrs.href)}">${im}</a>` : im;
      const side = ['right', 'left'].find((d) => cls(x, `infobox--${d}`));
      if (side) { buf += `${block(`infobox media ${side}`, [[cell]])}\n`; return; }
      // a video figure (.image-wrapper-16x9.media-player) is 50vw wide on the source (720 × 405 at 1440),
      // the image figure keeps the 640 column: hero.css sizes the `video` variant
      if (q(x, 'media-player')) { buf += `${block('infobox media video', [[cell]])}\n`; return; }
      buf += `  <p>${cell}</p>\n`;
      return;
    }
    if (x.tag === 'p' && !clean(textOf(x)) && !find(x, (y) => y.tag === 'img', [], true).length) {
      // source empty paragraphs are layout: <p><br></p> is one line (29.9 px at 1440), <p></p> is 0 px but
      // makes the next paragraph a p + p (0.5em). The pipeline drops an empty <p>, so the line keeps a
      // zero-width space and the 0 px one a <sup> marker that hero.css hides (the sibling rule still sees it)
      buf += find(x, (y) => y.tag === 'br', [], true).length ? '  <p>&#8203;</p>\n' : '  <p><sup>&#8203;</sup></p>\n';
      return;
    }
    // source .intro is per PARAGRAPH (p.intro 1.125rem/150 %); the section style `intro` sizes every <p> of
    // the section. A band whose intro paragraph(s) are followed by regular copy is split: the intro section,
    // then the rest as `article continued` — hero.css removes the padding between the two so the band keeps
    // its one-band spacing (measured automation-summit 360: 4 regular paragraphs rendered 18 px, live 15.2 px;
    // 16 landing/program pages carry such a band).
    if (intro && !cls(x, 'intro') && /^(p|ul|ol|h[2-6])$/.test(x.tag)) { flush(); cont = true; }
    if (cls(x, 'intro')) intro = true;
    buf += `  <${x.tag}>${frag(inner(x))}</${x.tag}>\n`;
  });
  flush();
}
function carouselCards(rc) {
  const cards = qa(q(rc, 'layout-teasercarousel--fixed'), 'teaser');
  const rows = cards.map((t) => {
    const img = find(t, (x) => x.tag === 'img', [], true)[0];
    const cw = q(t, 'teaser__content-wrapper');
    const title = els(cw)[0];
    const tw = q(cw, 'teaser__text-wrapper');
    let body = `<h3>${frag(inner(title))}</h3>`;
    els(tw).forEach((x) => { body += x.tag === 'a' ? `<p><a href="${esc(abs(x.attrs.href))}">${frag(inner(x))}</a></p>` : `<${x.tag}>${frag(inner(x))}</${x.tag}>`; });
    return [imgTag(img), body];
  });
  return rows;
}
function related(rc) {
  const h = find(q(rc, 'layout-100-headline--fixed'), (x) => /^h[1-6]$/.test(x.tag), [], true)[0];
  section(`  <h2>${frag(inner(h))}</h2>\n${block('teaser-carousel', carouselCards(rc))}`);
}
// .layout-teasercarousel__wrapper outside .related-content → teaser-carousel, section style standalone
const standaloneCarousel = (row) => section(block('teaser-carousel', carouselCards(row)), 'standalone');

// ── walk ──────────────────────────────────────────────────────────────────────────────────────
const root = parse(html);
const main = find(root, (x) => x.tag === 'main', [], true)[0];
// pass 1: heading ids for the anchor nav
els(main).forEach((row) => {
  if ((cls(row, 'layout-100-headline--fixed') || cls(row, 'layout-100-headline--flex')) && row.attrs.id) {
    const h = find(row, (x) => /^h[1-6]$/.test(x.tag), [], true)[0];
    if (h) headingIds.set(row.attrs.id, slug(textOf(h)));
  }
});
els(main).forEach((row) => {
  if (cls(row, 'layout-passepartout')) { const hi = q(row, 'header-image'); if (hi) hero(hi); return; }
  if (cls(row, 'navigation-anchor-navigation-wrapper')) { anchorNav(row); return; }
  if (cls(row, 'related-content')) { related(row); return; }
  const bg = ['dark', 'white', 'red'].find((b) => cls(row, `layout--${b}`)) || '';
  if (cls(row, 'layout-100-headline--fixed') || cls(row, 'layout-100-headline--flex')) {
    const h = find(row, (x) => /^h[1-6]$/.test(x.tag), [], true)[0];
    if (!h || !clean(textOf(h))) { section('  <h2>&#8203;</h2>', `headline spacer${bg ? ` ${bg}` : ''}`); return; }
    section(`  <h2>${frag(inner(h))}</h2>`, `headline${bg ? ` ${bg}` : ''}`); return;
  }
  if (cls(row, 'module-fact-counter')) { factCounter(row); return; }
  const wz = q(row, 'wizard'); if (wz) { wizard(wz); return; }
  if (cls(row, 'layout-teasercarousel__wrapper')) { standaloneCarousel(row); return; }
  if (cls(row, 'layout--teaser')) { teasers(row); return; }
  if (cls(row, 'layout-50--fixed') || cls(row, 'layout-50-reverse--fixed')) {
    if (q(row, 'carousel-wrapper')) { columnsGeneric(row, els(row), bg); return; }
    columns(row); return;
  }
  const cb = q(row, 'content-browser'); if (cb) { contentBrowser(cb); return; }
  const px = q(row, 'parallax-container'); if (px) { parallax(px); return; }
  const art = q(row, 'layout-article--centered'); if (art) { article(els(art)[0]); return; }
  const ibr = q(row, 'inline-button-row'); if (ibr) { ctaRow(ibr); return; }
  const mb = q(row, 'media-browser'); if (mb && !q(row, 'text-container')) { mediaBrowser(mb, true); return; }
  // generic layout rows: unwrap a single nested layout container, then dispatch on the item count
  let items = els(row); let ratioRow = row;
  while (items.length === 1 && /(^| )layout-\d/.test(items[0].attrs.class || '')) { [ratioRow] = items; items = els(items[0]); }
  if (items.length >= 2) { columnsGeneric(ratioRow, items, bg); return; }
  const item = items[0];
  if (!item) { console.error(`empty row: ${row.tag}.${row.attrs.class}`); return; }
  // the tone may sit on the single item wrapper (.ld-layout-item__wrapper.layout--dark) instead of the row
  const tone = bg || ['dark', 'white', 'red'].find((b) => cls(item, `layout--${b}`)) || '';
  if (q(item, 'testimonial')) { testimonial(q(item, 'testimonial'), tone); return; }
  if (q(item, 'accordion')) { accordion(q(item, 'accordion'), tone); return; }
  if (q(item, 'carousel-wrapper') || q(item, 'image-clipper')) { mediaBand(item, tone); return; }
  if (q(item, 'text-container')) { textBand(item, tone); return; }
  if (q(item, 'media-player')) { section(block('columns video', [[imgTag(find(item, (x) => x.tag === 'img', [], true)[0])]]), tone); return; }
  console.error(`unhandled row: ${row.tag}.${row.attrs.class}`);
});

// ── metadata ──────────────────────────────────────────────────────────────────────────────────
const titleTag = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const title = opt('--title', clean(titleTag).replace(/\s*\|\s*Linde Material Handling\s*$/, ''));
const introP = find(main, (x) => x.tag === 'p' && cls(x, 'intro') && clean(textOf(x)), [], true)[0];
const firstP = introP || find(main, (x) => x.tag === 'p' && !cls(x, 'module-fact-counter--headline') && clean(textOf(x)).length > 40, [], true)[0];
const firstSentence = firstP ? clean(textOf(firstP)).split(/(?<=\.)\s/)[0] : '';
const description = opt('--description', firstSentence);
const heroImg = find(q(main, 'header-image') || main, (x) => x.tag === 'img', [], true)[0];
const meta = [['Title', esc(title)], ['Description', esc(description)], ['og:image', heroImg ? esc(largestSrc(heroImg)) : ''], ['Template', 'landing']]
  .filter(([, v]) => v).map(([k, v]) => `    <div><div>${k}</div><div>${v}</div></div>`).join('\n');
sections.push(`<div>\n  <div class="metadata">\n${meta}\n  </div>\n</div>`);

fs.writeFileSync(outFile, `<body>\n<header></header>\n<main>\n${sections.join('\n')}\n</main>\n<footer></footer>\n</body>\n`);
console.log(`${outFile}: ${sections.length} sections, ${(fs.readFileSync(outFile, 'utf8').match(/<img /g) || []).length} images`);
