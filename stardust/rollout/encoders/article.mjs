/**
 * article.mjs — ENCODER for the `article` (news-detail) template: migrated index.html → EDS content
 * document, the shape of the delivered archetype content/en/technical/news-detail-101184.html.
 *   .carousel-wrapper .media-carousel-item        → media-carousel block (one row per slide: picture)
 *   .layout-article--centered .ld-layout-item__wrapper → default content: h1, date p, h3→h2 sub-headline,
 *     p.intro→p, h4→h3, h5→h4, prose paragraphs verbatim (span wrappers + empty spacer paragraphs
 *     dropped); each .infobox-media → `<p><a href=lightbox><img></a></p>` + caption `<p>`; the box
 *     mode (left | full | right) is carried by section-metadata `Infobox` (press-contact.js tags the
 *     picture paragraphs; `left` = the archetype float and is omitted when every box is left).
 *     A `.media-player` box (Vimeo) ships as its thumbnail picture + anchor only (deviation).
 *   .layout-25--fixed .teaser--card              → press-contact block (picture | h3 dept + h4 name |
 *     one <p><a> per contact); obfuscated mailto (`....`/`@@@@`) resolved (deviation).
 *   metadata: Title = h1, Description = sub-headline, og:image = first slide source URL, Template article.
 * Usage: node stardust/rollout/encoders/article.mjs <migrated index.html> <out content.html> --url <live>
 *        [--media-ledger <json>]   rewrite same-origin <img src> to the ledger's contentUrl (og:image stays)
 *        [--manifest <json>]       append {file, source, name} per same-origin image (deduped by source)
 *        [--media-dir <dir>]       local file dir for manifest entries (default stardust/.work/rollout/
 *                                  cluster-article/media)
 *        [--summary]               print a one-line JSON summary (variants, images, deviations)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
if (args.includes('--help') || args.length < 2) {
  const text = fs.readFileSync(new URL(import.meta.url), 'utf8');
  console.log(text.slice(0, text.indexOf('*/')).replace(/^\/\*\*\n|^ \* ?/gm, ''));
  process.exit(args.includes('--help') ? 0 : 2);
}
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const positional = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')
  || args[i - 1] === '--summary'));
const [srcFile, outFile] = positional;
const pageUrl = opt('--url');
if (!srcFile || !outFile || !pageUrl) { console.error('usage: article.mjs <src> <out> --url <live URL>'); process.exit(2); }
const ledgerFile = opt('--media-ledger');
const manifestFile = opt('--manifest');
const mediaDir = opt('--media-dir', 'stardust/.work/rollout/cluster-article/media');
const SOURCE_HOST = 'https://www.linde-mh.com/';

const src = fs.readFileSync(srcFile, 'utf8');
const main = src.slice(src.indexOf('<main'), src.indexOf('</main>'));
const deviations = [];
const images = new Map(); // source → name

// ── helpers ────────────────────────────────────────────────────────────────────────────────────
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : '';
};
const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
/** slice of `html` from `open` (index of a `<div`) to its balanced `</div>` (inclusive). */
function balanced(html, open) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = open + 1;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return html.slice(open, m.index + 6);
  }
  return html.slice(open);
}
function mediaName(source) {
  const base = decodeURIComponent(source.split('/').pop().split('?')[0]);
  const ext = path.extname(base).toLowerCase();
  const stem = base.slice(0, -ext.length).toLowerCase()
    .replace(/w\d{3,4}$/, '').replace(/16zu9/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${stem}${ext}`;
}
function registerImage(source) {
  if (!source.startsWith(SOURCE_HOST) || images.has(source)) return;
  let name = mediaName(source);
  if ([...images.values()].includes(name)) {
    name = name.replace(/(\.[a-z]+)$/, `-${createHash('sha1').update(source).digest('hex').slice(0, 6)}$1`);
  }
  images.set(source, name);
}
/** the migrated copy keeps the smallest srcset candidate (…16x9w320.jpg); rehost the 1920 rendition */
const fullSize = (s) => (s.startsWith(SOURCE_HOST) ? s.replace(/(_16x9|_16-9|_\d+x\d+)w\d{3,4}\.(jpe?g|png|webp)$/i, '$1w1920.$2') : s);
function imgTag(tag) {
  const source = fullSize(attr(tag, 'src'));
  registerImage(source);
  return `<img src="${source}" alt="${attr(tag, 'alt')}">`;
}

// ── media-carousel ─────────────────────────────────────────────────────────────────────────────
const slides = [];
const itemRe = /<div class="media-carousel-item(?:\s(?!slick-cloned)[^"]*)?"[^>]*>/g;
let im;
while ((im = itemRe.exec(main))) {
  const item = balanced(main, im.index);
  const img = item.match(/<img[^>]*>/);
  if (!img) continue;
  const cap = item.match(/<p class="caption">([\s\S]*?)<\/p>/);
  slides.push(`<div><div>${imgTag(img[0])}${cap ? `<p>${cap[1].trim()}</p>` : ''}</div></div>`);
}
// clipper alignment (source .image-clipper__contents--top|middle|bottom) → block variant
const clipAlign = (main.match(/image-clipper__contents--(top|bottom)/) || [])[1] || '';
const carouselClass = `media-carousel${clipAlign ? ` ${clipAlign}` : ''}`;
const ogImage = fullSize((main.match(/media-carousel-item[\s\S]*?<img[^>]*src="([^"]*)"/) || [])[1] || '');

// ── article prose ──────────────────────────────────────────────────────────────────────────────
const artStart = main.indexOf('<div class="layout-article--centered"');
const wrapOpen = '<div class="ld-layout-item__wrapper">';
const bodyStart = main.indexOf(wrapOpen, artStart) + wrapOpen.length;
let bodyEnd = main.indexOf('<div class="inline-button-row">', bodyStart);
if (bodyEnd < 0) bodyEnd = main.indexOf('<div class="layout-25--fixed"', bodyStart);
let body = main.slice(bodyStart, bodyEnd);

const modes = [];
let boxAt;
while ((boxAt = body.indexOf('<div class="infobox-media')) >= 0) {
  const box = balanced(body, boxAt);
  const mode = (box.match(/infobox--(\w+)/) || [, 'left'])[1];
  const href = attr(box.match(/<a[^>]*>/)[0], 'href');
  const img = box.match(/<img[^>]*>/)[0];
  const cap = box.match(/<p class="caption">([\s\S]*?)<\/p>/);
  if (/media-player/.test(box)) {
    deviations.push({
      kind: 'media-player-thumbnail',
      source: href,
      target: attr(img, 'src'),
      reason: 'source infobox is a Vimeo media-player (play icon + lightbox embed) the article template '
        + 'cannot express; the thumbnail picture and its anchor are authored as default content, no embed',
    });
  }
  modes.push(mode);
  const rep = `<p><a href="${href}">${imgTag(img)}</a></p>\n${cap ? `<p>${cap[1].trim()}</p>\n` : ''}`;
  body = body.slice(0, boxAt) + rep + body.slice(boxAt + box.length);
}
// a bare .media-player (Vimeo thumbnail outside an infobox): thumbnail picture only, in flow
let mpAt;
while ((mpAt = body.search(/<div class="image-wrapper[^"]*media-player[^"]*">/)) >= 0) {
  const box = balanced(body, mpAt);
  const img = box.match(/<img[^>]*>/)[0];
  deviations.push({
    kind: 'media-player-thumbnail',
    source: 'media-player (no lightbox anchor)',
    target: fullSize(attr(img, 'src')),
    reason: 'source embeds a Vimeo media-player (play icon + lightbox embed) the article template cannot '
      + 'express; the thumbnail picture is authored as default content, no embed',
  });
  body = `${body.slice(0, mpAt)}<p>${imgTag(img)}</p>\n${body.slice(mpAt + box.length)}`;
}
// a spacer paragraph of line breaks only (source <p><br><br></p> = 60 px on live) survives the
// EDS pipeline only with text: one nbsp line per <br> (the pipeline drops a <br>-only paragraph)
body = body.replace(/<p>((?:\s*<br\s*\/?>)+)\s*<\/p>/g, (m, brs) => `<p>${new Array(brs.match(/<br/g).length).fill('&nbsp;').join('<br>')}</p>`);
body = body.replace(/<\/?span[^>]*>/g, '').replace(/<p>\s*<\/p>/g, '');
body = body.replace(/<h1[^>]*>/, '<h1>').replace(/<p class="intro">/, '<p>');
body = body.replace(/<h3>/g, '<h2>').replace(/<\/h3>/g, '</h2>');
body = body.replace(/<h4>/g, '<h3>').replace(/<\/h4>/g, '</h3>');
body = body.replace(/<h5>/g, '<h4>').replace(/<\/h5>/g, '</h4>');
body = body.replace(/<a class="[^"]*" /g, '<a ').replace(/<a([^>]*) class="[^"]*"/g, '<a$1');
body = body.replace(/>\s*<(p|h[1-6]|div|ul|ol)\b/g, '>\n<$1');
body = body.replace(/<(p|h[1-6])>\s+/g, '<$1>').replace(/\s+<\/(p|h[1-6])>/g, '</$1>');
body = body.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `  ${l}`).join('\n');

const h1 = stripTags((body.match(/<h1>([\s\S]*?)<\/h1>/) || [, ''])[1]);
const sub = stripTags((body.match(/<h2>([\s\S]*?)<\/h2>/) || [, ''])[1]);
const metaDesc = attr(src.match(/<meta name="description"[^>]*>/)?.[0] || '', 'content');
const description = sub || metaDesc;

// ── press-contact ──────────────────────────────────────────────────────────────────────────────
const pcAt = main.indexOf('<div class="layout-25--fixed"');
const pc = pcAt >= 0 ? balanced(main, pcAt) : '';
const pcImg = pc.match(/<img[^>]*>/);
const pcHeads = [...pc.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => stripTags(m[2]));
const pcLinks = [...pc.matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => {
  let href = m[1];
  if (/^mailto:/.test(href) && /\.\.\.\.|@@@@/.test(href)) {
    const target = href.replace(/\.\.\.\./g, '.').replace(/@@@@/g, '@');
    deviations.push({
      kind: 'href-deobfuscated',
      source: href,
      target,
      reason: 'source ships the press-contact e-mail obfuscated for a client-side rewrite (.... -> . and '
        + '@@@@ -> @) that does not run on EDS; the resolved address is authored',
    });
    href = target;
  }
  return `<p><a href="${href}">${stripTags(m[2])}</a></p>`;
});
const pressContact = pc ? `  <div class="press-contact">
    <div><div>${pcImg ? imgTag(pcImg[0]) : ''}</div></div>
    <div><div><h3>${pcHeads[0] || ''}</h3><h4>${pcHeads[1] || ''}</h4></div></div>
    <div><div>${pcLinks.join('')}</div></div>
  </div>\n` : '';

// ── section-metadata: infobox modes ────────────────────────────────────────────────────────────
const uniform = modes.every((m) => m === modes[0]);
let sectionMeta = '';
if (modes.length && !(uniform && modes[0] === 'left')) {
  const value = uniform ? modes[0] : modes.join(', ');
  sectionMeta = `  <div class="section-metadata">
    <div><div>Infobox</div><div>${value}</div></div>
  </div>\n`;
}

// ── media ledger rewrite ───────────────────────────────────────────────────────────────────────
let out = `<body>
<header></header>
<main>
<div>
  <div class="breadcrumb">
    <div><div></div></div>
  </div>
</div>
<div>
  <div class="${carouselClass}">
    ${slides.join('\n    ')}
  </div>
</div>
<div>
${body}
${pressContact}${sectionMeta}</div>
<div>
  <div class="metadata">
    <div><div>Title</div><div>${h1}</div></div>
    <div><div>Description</div><div>${description}</div></div>
    <div><div>og:image</div><div>${ogImage}</div></div>
    <div><div>Template</div><div>article</div></div>
  </div>
</div>
</main>
<footer></footer>
</body>
`;
let rehosted = 0;
if (ledgerFile && fs.existsSync(ledgerFile)) {
  const ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
  const bySource = new Map(Object.values(ledger)
    .filter((e) => e && e.source && e.contentUrl && /^(uploaded|ok|skipped|exists)$/.test(e.status || 'uploaded'))
    .map((e) => [e.source, e.contentUrl]));
  out = out.replace(/<img src="([^"]*)"/g, (m, s) => {
    if (!bySource.has(s)) return m;
    rehosted += 1;
    return `<img src="${bySource.get(s)}"`;
  });
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);

if (manifestFile) {
  const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : [];
  const known = new Set(manifest.map((e) => e.source));
  for (const [source, name] of images) {
    if (!known.has(source)) manifest.push({ file: `${mediaDir}/${name}`, source, name });
  }
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 1)}\n`);
}
if (args.includes('--summary')) {
  console.log(JSON.stringify({
    out: outFile, url: pageUrl, slides: slides.length, infobox: modes, images: images.size, rehosted, deviations,
  }));
}
