/**
 * listing.mjs — ENCODER / DISPATCHER for the `listing` template (11 pages, archetype
 * /en/about-us/press): migrated index.html → EDS content document. Walks the source rows of
 * `main#pjax-container` in order and decides PER ROW who encodes it:
 *   press rows (own handlers — the children of `.layout-passepartout.layout--download`, and any
 *   row with download cards or a `.calendar-list`):
 *     .header-intro                 → default content: h1 (span wrapper dropped), intro <p>s verbatim
 *     .filter-downloadarea          → filter block (template-slotted static snapshot — dynamic-features
 *       § "Listings contract"): row 1 [h4]; one row per .form-item: [label p] [ul checkbox labels |
 *       one <code>placeholder</code> p per date input]. A preceding `h1.h3` (Media: no .header-intro)
 *       is authored as default content INSIDE the filter section (variant `filter-heading`).
 *     .layout--teaser (.teaser--card ×n) → news-cards block, one section per source teaser group
 *       (reconstructive, repeated-unit family `news-card`): press cards [img] [h3 > a, p subline,
 *       p > a more]; download cards (`.btn--download`) → `news-cards download`: [img] [h3, p info,
 *       p > strong > a "Download file" → the source PDF, no rehost]
 *     .calendar-list                → `news-cards calendar`: one row per .calendar-event
 *       [p date range] [h3 title, p place, p > strong > a button]
 *   every other row → stardust/rollout/encoders/landing.mjs (and its program-shared handlers): the
 *   own rows are swapped for marker headline rows, landing.mjs runs ONCE over the whole page (its
 *   heading-id pass for anchor navs stays intact), and the marker sections are replaced by the own
 *   sections. landing.mjs is never copied — a row it reports `unhandled` is reported here as well.
 *   metadata: Title / Description from _meta.json (--meta) or --title/--description, falling back to
 *     landing.mjs's derivation; og:image = hero image, else the first card image; Template listing.
 *   Relative hrefs are resolved against --url (localize-links folds them afterwards); same-origin
 *   images stay hotlinked like every delivered template (media-reconcile decides `keep`).
 * Usage: node stardust/rollout/encoders/listing.mjs <migrated index.html> <out content.html> --url <live>
 *        [--meta <_meta.json>] [--title <t>] [--description <d>] [--summary]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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
if (!srcFile || !outFile || !pageUrl) { console.error('usage: listing.mjs <src> <out> --url <live URL>'); process.exit(2); }
const meta = opt('--meta') ? JSON.parse(fs.readFileSync(opt('--meta'), 'utf8')) : {};
const metaTitle = opt('--title', meta.metadata?.title || '');
const metaDescription = opt('--description', meta.metadata?.description || '').trim();
const LANDING = path.join(path.dirname(new URL(import.meta.url).pathname), 'landing.mjs');

const src = fs.readFileSync(srcFile, 'utf8');
const mainStart = src.indexOf('<main');
const mainOpen = src.indexOf('>', mainStart) + 1;
const mainEnd = src.indexOf('</main>', mainStart);
const main = src.slice(mainOpen, mainEnd);

// ── helpers ────────────────────────────────────────────────────────────────────────────────────
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : '';
};
const esc = (s) => s.replace(/&(?!(amp|lt|gt|quot|#\d+|[a-z]+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const abs = (href) => { try { return new URL(href, pageUrl).href; } catch { return href; } };
/** slice of `html` from `open` (index of a `<div`) to its balanced `</div>` (inclusive). */
function balanced(html, open) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = open + 1;
  let depth = 1;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return html.slice(open, m.index + 6);
  }
  return html.slice(open);
}
/** every balanced <div class~="cls"> slice inside `html` (non-nested matches). */
function divs(html, cls) {
  const out = [];
  const re = new RegExp(`<div\\b[^>]*\\bclass="[^"]*\\b${cls}\\b[^"]*"[^>]*>`, 'g');
  let m;
  let from = 0;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(html))) {
    if (m.index < from) continue; // eslint-disable-line no-continue
    const slice = balanced(html, m.index);
    out.push(slice);
    from = m.index + slice.length;
  }
  return out;
}
const inner = (slice) => slice.slice(slice.indexOf('>') + 1, slice.lastIndexOf('</div>'));
/** direct child element slices (div/section/article/nav) of an inner-HTML string. */
function topRows(html) {
  const re = /<(\/?)(div|section|article|nav)\b[^>]*>/g;
  const rows = [];
  let depth = 0;
  let start = -1;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(html))) {
    if (m[1]) {
      depth -= 1;
      if (depth === 0 && start >= 0) { rows.push(html.slice(start, m.index + m[0].length)); start = -1; }
    } else {
      if (depth === 0) start = m.index;
      depth += 1;
    }
  }
  return rows;
}
const rowClass = (r) => attr(r.slice(0, r.indexOf('>') + 1), 'class');
const hasCls = (r, c) => (` ${rowClass(r)} `).includes(` ${c} `);
/** inline prose: keep a/strong/em/b/i/br, resolve hrefs, drop other tags and data-* attributes. */
function prose(html) {
  return html
    .replace(/<a\b([^>]*)>/g, (t, a) => `<a href="${esc(abs(attr(t, 'href')))}">${a ? '' : ''}`)
    .replace(/<\/?(span|div)\b[^>]*>/g, '')
    .replace(/<(?!\/?(a|strong|em|b|i|br)\b)[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
const sectionOf = (body) => `<div>\n${body}\n</div>`;
const blockOf = (name, rows) => `  <div class="${name}">\n${rows.join('\n')}\n  </div>`;

// ── own (press-row) handlers ───────────────────────────────────────────────────────────────────
let ogCard = '';
let cardCount = 0;
let downloadCount = 0;
let eventCount = 0;
let filterHeading = false;

function introSection(introRow) {
  const h1 = introRow.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
  const ps = [...introRow.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => prose(m[1])).filter(Boolean);
  const lines = [];
  if (h1) lines.push(`  <h1>${prose(h1[1])}</h1>`);
  ps.forEach((p) => lines.push(`  <p>${p}</p>`));
  return sectionOf(lines.join('\n'));
}
function filterSection(filterRow, heading) {
  const h4 = filterRow.match(/<h4\b[^>]*>([\s\S]*?)<\/h4>/);
  const rows = [];
  if (h4) rows.push(`    <div><div><h4>${prose(h4[1])}</h4></div></div>`);
  divs(filterRow, 'form-item').forEach((item) => {
    const label = item.match(/<label\b[^>]*class="label"[^>]*>([\s\S]*?)<\/label>/);
    const checks = [...item.matchAll(/<label\b[^>]*class="checkbox"[^>]*>([\s\S]*?)<\/label>/g)]
      .map((m) => text(m[1])).filter(Boolean);
    const dates = [...item.matchAll(/<input\b[^>]*hasDatepicker[^>]*>/g)]
      .map((m) => attr(m[0], 'placeholder'));
    let cell = '';
    if (checks.length) cell = `<ul>${checks.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
    else if (dates.length) cell = dates.map((d) => `<p><code>${esc(d)}</code></p>`).join('');
    rows.push(`    <div><div><p>${label ? prose(label[1]) : ''}</p></div><div>${cell}</div></div>`);
  });
  const lead = heading ? `  <h1>${prose(heading)}</h1>\n` : '';
  if (heading) filterHeading = true;
  return sectionOf(`${lead}${blockOf('filter', rows)}`);
}
function cardRow(card) {
  const img = card.match(/<img\b[^>]*>/);
  const imgSrc = img ? abs(attr(img[0], 'src')) : '';
  const alt = img ? attr(img[0], 'alt') : '';
  if (!ogCard && imgSrc) ogCard = imgSrc;
  const h3 = card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/);
  const picture = imgSrc ? `<img src="${esc(imgSrc)}" alt="${esc(alt)}">` : '';
  const download = /\bbtn--download\b/.test(card);
  let body;
  if (download) {
    downloadCount += 1;
    const info = card.match(/<p\b[^>]*class="info"[^>]*>([\s\S]*?)<\/p>/);
    const btn = card.match(/<a\b[^>]*class="btn__link"[^>]*>([\s\S]*?)<\/a>/);
    body = [h3 ? `<h3>${prose(h3[1])}</h3>` : '', info && text(info[1]) ? `<p>${esc(text(info[1]))}</p>` : '',
      btn ? `<p><strong><a href="${esc(abs(attr(btn[0], 'href')))}">${esc(text(btn[1]))}</a></strong></p>` : '']
      .filter(Boolean).join('');
  } else {
    const [textWrap] = divs(card, 'teaser__text-wrapper');
    const sub = textWrap ? prose(inner(textWrap)) : '';
    const more = [...inner(divs(card, 'teaser__content-wrapper')[0] || '').matchAll(/<p\b(?![^>]*class="info")[^>]*>([\s\S]*?)<\/p>/g)]
      .map((m) => prose(m[1])).filter(Boolean);
    body = [h3 ? `<h3>${prose(h3[1])}</h3>` : '', sub ? `<p>${sub}</p>` : '', ...more.map((m) => `<p>${m}</p>`)]
      .filter(Boolean).join('');
  }
  cardCount += 1;
  return { row: `    <div><div>${picture}</div><div>${body}</div></div>`, download };
}
function cardsSection(group) {
  const cards = divs(group, 'teaser--card').map(cardRow);
  const download = cards.length && cards.every((c) => c.download);
  return sectionOf(blockOf(`news-cards${download ? ' download' : ''}`, cards.map((c) => c.row)));
}
function calendarSection(row) {
  const rows = divs(row, 'calendar-event').map((ev) => {
    const [date] = divs(ev, 'calendar-event__date-time__date');
    const dateText = date ? text(inner(date)) : '';
    const sep = (s) => s.replace(/<\/span>\s*<span>/g, '</span> ∙ <span>');
    const place = ev.match(/<p\b[^>]*calendar-event__event-info__meta[^>]*>([\s\S]*?)<\/p>/);
    const title = ev.match(/<p\b[^>]*calendar-event__event-info__title[^>]*>([\s\S]*?)<\/p>/);
    const btn = ev.match(/<a\b[^>]*class="btn__link"[^>]*>([\s\S]*?)<\/a>/);
    const body = [title ? `<h3>${esc(text(sep(title[1])))}</h3>` : '', place && text(place[1]) ? `<p>${esc(text(sep(place[1])))}</p>` : '',
      btn ? `<p><strong><a href="${esc(abs(attr(btn[0], 'href')))}">${esc(text(btn[1]))}</a></strong></p>` : '']
      .filter(Boolean).join('');
    eventCount += 1;
    return `    <div><div><p>${esc(dateText)}</p></div><div>${body}</div></div>`;
  });
  return sectionOf(blockOf('news-cards calendar', rows));
}
/** a press-shaped row → its sections, in source order (intro, filter, one per card group). */
function pressRow(row) {
  const out = [];
  const [introRow] = divs(row, 'header-intro');
  if (introRow) out.push(introSection(introRow));
  const [filterRow] = divs(row, 'filter-downloadarea');
  if (filterRow) {
    const h1 = introRow ? null : row.match(/<h1\b[^>]*class="h3"[^>]*>([\s\S]*?)<\/h1>/);
    out.push(filterSection(filterRow, h1 ? h1[1] : null));
  }
  const groups = divs(row, 'layout--teaser');
  (groups.length ? groups : (divs(row, 'teaser--card').length ? [row] : [])).forEach((g) => out.push(cardsSection(g)));
  if (divs(row, 'calendar-list').length) out.push(calendarSection(row));
  return out;
}

// ── row classification ─────────────────────────────────────────────────────────────────────────
const rows = [];
topRows(main).forEach((r) => {
  if (hasCls(r, 'layout-passepartout') && hasCls(r, 'layout--download')) {
    topRows(inner(r)).forEach((c) => rows.push({ html: c, own: true }));
  } else {
    const own = /class="[^"]*\bcalendar-list\b/.test(r) || (/\bbtn--download\b/.test(r) && /teaser--card/.test(r));
    rows.push({ html: r, own });
  }
});
const ownIdx = rows.map((r, i) => (r.own ? i : -1)).filter((i) => i >= 0);
const landingIdx = rows.map((r, i) => (r.own ? -1 : i)).filter((i) => i >= 0);

// ── landing dispatch ───────────────────────────────────────────────────────────────────────────
const sections = [];
let landingMeta = new Map();
let unhandled = [];
if (landingIdx.length) {
  const marker = (i) => `<div class="layout-100-headline--fixed"><h2>CLISTROW${i}</h2></div>`;
  const synthetic = src.slice(0, mainOpen) + rows.map((r, i) => (r.own ? marker(i) : r.html)).join('\n') + src.slice(mainEnd);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'clist-'));
  const tmpIn = path.join(tmp, 'index.html');
  const tmpOut = path.join(tmp, 'out.html');
  fs.writeFileSync(tmpIn, synthetic);
  // landing.mjs reads sidecar judgments from `_meta.json` beside its input — carry the sidecar over
  const sidecar = opt('--meta') || path.join(path.dirname(srcFile), '_meta.json');
  if (fs.existsSync(sidecar)) fs.copyFileSync(sidecar, path.join(tmp, '_meta.json'));
  const extra = [];
  if (opt('--title')) extra.push('--title', opt('--title'));
  if (opt('--description')) extra.push('--description', opt('--description'));
  const res = spawnSync(process.execPath, [LANDING, tmpIn, tmpOut, '--url', pageUrl, ...extra], { encoding: 'utf8' });
  if (res.status !== 0) { console.error(`landing.mjs failed (${res.status}): ${res.stderr}`); process.exit(1); }
  unhandled = res.stderr.split('\n').filter((l) => /unhandled row|empty row/.test(l));
  unhandled.forEach((l) => console.error(`landing.mjs: ${l}`));
  const out = fs.readFileSync(tmpOut, 'utf8');
  fs.rmSync(tmp, { recursive: true, force: true });
  const body = out.slice(out.indexOf('<main>\n') + 7, out.lastIndexOf('\n</main>'));
  const parts = body.match(/^<div>\n[\s\S]*?\n<\/div>$/gm) || [];
  parts.forEach((sec) => {
    const mk = sec.match(/<h2>CLISTROW(\d+)<\/h2>/);
    if (mk) { pressRow(rows[+mk[1]].html).forEach((s) => sections.push(s)); return; }
    if (/<div class="metadata">/.test(sec)) {
      landingMeta = new Map([...sec.matchAll(/<div><div>([^<]+)<\/div><div>([^<]*)<\/div><\/div>/g)].map((m) => [m[1], m[2]]));
      return;
    }
    sections.push(sec);
  });
} else {
  ownIdx.forEach((i) => pressRow(rows[i].html).forEach((s) => sections.push(s)));
}
if (!sections.some((s) => /<div class="breadcrumb">/.test(s))) {
  sections.unshift('<div>\n  <div class="breadcrumb">\n    <div><div></div></div>\n  </div>\n</div>');
}

// ── metadata ───────────────────────────────────────────────────────────────────────────────────
const metaRows = [
  ['Title', metaTitle || landingMeta.get('Title') || ''],
  ['Description', metaDescription || landingMeta.get('Description') || ''],
  ['og:image', landingMeta.get('og:image') || (ogCard ? esc(ogCard) : '')],
  ['Template', 'listing'],
].filter(([, v]) => v).map(([k, v]) => `    <div><div>${k}</div><div>${k === 'og:image' ? v : esc(v)}</div></div>`);
sections.push(`<div>\n  <div class="metadata">\n${metaRows.join('\n')}\n  </div>\n</div>`);

const doc = `<body>\n<header></header>\n<main>\n${sections.join('\n')}\n</main>\n<footer></footer>\n</body>\n`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, doc);
if (args.includes('--summary')) {
  console.log(JSON.stringify({
    out: outFile,
    sections: sections.length,
    rows: rows.length,
    ownRows: ownIdx.length,
    landingRows: landingIdx.length,
    cards: cardCount,
    downloads: downloadCount,
    events: eventCount,
    filterHeading,
    unhandled: unhandled.length,
    images: (doc.match(/<img /g) || []).length,
  }));
}
