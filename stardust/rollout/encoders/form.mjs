/**
 * form.mjs — ENCODER for the `form` template (the MWF request/contact forms, 8 pages):
 * migrated main → EDS content document with ONE `mwf-form` block whose rows are derived from the
 * source form markup — the field set differs per page, nothing here is a fixed list.
 * Source rows (in order) → block rows (blocks/mwf-form/mwf-form.js decodes exactly this vocabulary):
 *   .breadcrumb-list_v2 (outside main)          → breadcrumb block (crumb text verbatim)
 *   form.form-section header h3                 → header row [<h1> | empty] (the page's heading)
 *   fieldset > .form-row-{100|50|100-30|30-100} → one two-cell row PER FIELD [label | control];
 *     the first field of a row carries the row class as a flag (row-50 … ; row-100 is the default),
 *     the following fields of the same row carry `same-row`
 *     .form-item h5 (label-only item)           → the heading goes into the LABEL cell of the next
 *                                                 field of the row (<h2>Subject:</h2>)
 *     label.label / label.mwf-label             → label cell <p> (…<span class="mwf-required">*
 *                                                 → <em>*</em>); ends with * → flag `required`
 *     input[type=text] / textarea               → <p><code>text|textarea</code> <code>name</code>
 *                                                 <code>flags…</code></p> (+ <p>placeholder</p>)
 *     .dropdown select.mwf-select               → <p><code>select</code> <code>name</code> flags</p>
 *                                                 + <ul>: <li><em>placeholder</em></li> (the
 *                                                 .btn-value of a show-placeholder toggle, or a
 *                                                 disabled empty-value option), <li><strong>…
 *                                                 </strong></li> for the preselected option, one
 *                                                 <li> per option; flags: required, disabled,
 *                                                 hidden (.mwf-hidden), native (.select-wrapper);
 *                                                 + <p>hint</p> when a hint text follows the control
 *     label.radio input[type=radio]             → <p><code>radio</code> <code>name</code></p>
 *                                                 + <ul><li>label html (links kept)</li>…</ul>
 *                                                 ONE row per group, one li per option; a
 *                                                 label.label above the group → the label cell
 *     label.checkbox input[type=checkbox]       → <p><code>checkbox</code> <code>name</code>
 *                                                 [hidden]</p> + <ul><li>…</li></ul> (one row per
 *                                                 group) + the `_name` hidden companion (EMPTY)
 *     .datepicker input + .ui-datepicker-trigger → <p><code>date</code> <code>name</code></p>
 *                                                 (+ <p>placeholder</p>; calendar icon button)
 *     .form-item h5 alone in its row            → [<h2>…</h2> | <p><code>heading</code> [row-…]</p>]
 *     empty .form-row-* fieldset                → <p><code>spacer</code> [row-…]</p> (not the one
 *                                                 before .form-required-info — modelled; when that
 *                                                 one is absent the info row carries `tight`)
 *     input[type=hidden]                        → <p><code>hidden</code> <code>name</code></p>
 *                                                 (value ALWAYS empty — session tokens never copied;
 *                                                 also inside the leading classless fieldset)
 *   .form-required-info                         → <p><code>info</code></p> + <p>*Mandatory field</p>
 *   .form-section__footer button[type=submit]   → <p><code>submit</code></p> + <p>Send</p>
 *   (appended)                                  → <p><code>notice</code></p> + <p>no-backend text</p>
 *                                                 (dynamic-features.md row 4: submission disabled)
 * Usage: node stardust/rollout/encoders/form.mjs <migrated index.html> <out content.html> --url <live>
 *        [--meta <_meta.json>] [--title <t>] [--description <d>] [--notice <text>]
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--help') || args.length < 2) {
  console.log('usage: form.mjs <migrated index.html> <out content.html> --url <live URL>'
    + ' [--meta _meta.json] [--title t] [--description d] [--notice text]');
  process.exit(args.includes('--help') ? 0 : 2);
}
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const pos = args.filter((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
const [srcFile, outFile] = pos;
const pageUrl = opt('--url');
if (!srcFile || !outFile || !pageUrl) { console.error('usage: form.mjs <src> <out> --url <live URL>'); process.exit(2); }
const html = fs.readFileSync(srcFile, 'utf8');
let sidecar = {};
try {
  sidecar = JSON.parse(fs.readFileSync(opt('--meta', path.join(path.dirname(srcFile), '_meta.json')), 'utf8'));
} catch { /* none */ }
const NOTICE = opt('--notice', 'No backend connected: this form cannot be submitted yet.');

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
    find(c, pred, out, first);
    if (first && out.length) return out;
  }
  return out;
}
const q1 = (n, pred) => find(n, pred, [], true)[0];
const byCls = (c) => (x) => cls(x, c);
const byTag = (t) => (x) => x.tag === t;
const inner = (n) => { const o = html.indexOf('>', n.start) + 1; return html.slice(o, n.end - (`</${n.tag}>`).length); };
const textOf = (n) => (n.tag === '#text' ? n.text : (n.children || []).map(textOf).join(''));
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const abs = (h) => { try { return new URL(h, pageUrl).href.replace(/\/index\.html(?=$|[?#])/, '/'); } catch { return h; } };
// re-emit an authored inline fragment: drop presentational attrs/icons, b→strong, absolutise hrefs
function frag(s) {
  return s.replace(/<span class="icon[^"]*"[^>]*><\/span>/g, '')
    .replace(/<i class="icon[^"]*"[^>]*><\/i>/g, '')
    .replace(/<span class="mwf-required">([^<]*)<\/span>/g, '<em>$1</em>')
    .replace(/<\/?span[^>]*>/g, '')
    .replace(/<(\/?)b>/g, '<$1strong>')
    .replace(/<(\/?)i>/g, '<$1em>')
    .replace(/<[a-z][^>]*>/g, (tag) => tag
      .replace(/\s(class|target|aria-hidden|tabindex|data-[\w-]+|title|download|id|style|for)(="[^"]*")?(?=[\s>/])/g, '')
      .replace(/href="([^"]*)"/g, (a, h) => `href="${esc(h.startsWith('#') ? h : abs(h))}"`))
    .replace(/^\s+|\s+$/g, '');
}
const code = (...t) => `<p>${t.filter(Boolean).map((x) => `<code>${esc(x)}</code>`).join(' ')}</p>`;

// ── output ────────────────────────────────────────────────────────────────────────────────────
const sections = [];
const block = (name, rows) => `  <div class="${name}">\n${rows.map((cells) => `    <div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('\n')}\n  </div>`;
const deviations = [];
const root = parse(html);

function breadcrumb() {
  const list = q1(root, byCls('breadcrumb-list_v2'));
  if (!list) return;
  const li = find(list, byTag('li')).map((it) => {
    const a = q1(it, byTag('a'));
    const t = clean(textOf(it));
    return a && a.attrs.href && !cls(a, 'active') ? `<li><a href="${esc(abs(a.attrs.href))}">${esc(t)}</a></li>` : `<li>${esc(t)}</li>`;
  });
  sections.push(`<div>\n${block('breadcrumb', [[`<ul>${li.join('')}</ul>`]])}\n</div>`);
}

// ── the form ──────────────────────────────────────────────────────────────────────────────────
const rows = [];
const form = q1(root, (x) => x.tag === 'form' && cls(x, 'form-section'));
if (!form) { console.error('no form.form-section in the source'); process.exit(1); }

const header = q1(form, byCls('form-section__header'));
const h = header && q1(header, (x) => /^h[1-6]$/.test(x.tag));
if (h) rows.push([`<h1>${frag(inner(h))}</h1>`, '']);

const labelOf = (item) => {
  const l = q1(item, (x) => x.tag === 'label' && (cls(x, 'label') || cls(x, 'mwf-label')));
  if (!l) return { label: '', required: false };
  const t = frag(inner(l));
  if (!t) return { label: '', required: false }; // the empty label.label above a checkbox group
  return { label: `<p>${t}</p>`, required: /\*\s*(<\/em>)?\s*$/.test(t) || 'required' in l.attrs };
};
const optionsOf = (select, placeholder) => {
  const li = [];
  if (placeholder) li.push(`<li><em>${esc(placeholder)}</em></li>`);
  find(select, byTag('option')).forEach((o) => {
    const t = clean(textOf(o));
    if (!t) return; // the hidden empty placeholder option (its text is the toggle's placeholder)
    if ('disabled' in o.attrs && !(o.attrs.value || '')) li.push(`<li><em>${esc(t)}</em></li>`);
    else if ('selected' in o.attrs) li.push(`<li><strong>${esc(t)}</strong></li>`);
    else li.push(`<li>${esc(t)}</li>`);
  });
  return `<ul>${li.join('')}</ul>`;
};

let pendingHeading = '';
function encodeItem(item, layout) {
  const flags = [...layout];
  const heading = q1(item, (x) => /^h[1-6]$/.test(x.tag));
  const control = q1(item, (x) => ['input', 'select', 'textarea'].includes(x.tag));
  if (heading && !control) { pendingHeading = `<h2>${frag(inner(heading))}</h2>`; return []; }
  if (!control) { deviations.push(`form-item without a control skipped: ${clean(textOf(item)).slice(0, 40)}`); return []; }
  const out = [];
  const { label, required } = labelOf(item);
  const labelCell = pendingHeading + label; // a heading item in the same row + the field's own label
  pendingHeading = '';
  if (control.tag === 'select') {
    const dd = q1(item, byCls('dropdown'));
    if (required || 'required' in control.attrs) flags.push('required');
    if ('disabled' in control.attrs) flags.push('disabled');
    if (dd && cls(dd, 'mwf-hidden')) flags.push('hidden');
    const native = !!q1(item, byCls('select-wrapper'));
    if (native) flags.push('native');
    const toggle = q1(item, byCls('dropdown-toggle'));
    const value = toggle && q1(toggle, byCls('btn-value'));
    const placeholder = toggle && cls(toggle, 'show-placeholder') && value ? clean(textOf(value)) : '';
    // a hint below the control (.mwf-hint > p on live; migrated: a sibling <div><p>…</p></div>)
    const hintDiv = els(item).find((x) => x.tag === 'div' && !cls(x, 'dropdown')
      && els(x).length === 1 && els(x)[0].tag === 'p');
    const hint = hintDiv ? `<p>${frag(inner(els(hintDiv)[0]))}</p>` : '';
    out.push([labelCell, code('select', control.attrs.name, ...flags) + optionsOf(control, placeholder) + hint]);
    return out;
  }
  const inputs = find(item, (x) => ['input', 'textarea'].includes(x.tag));
  // the option text of a label.radio / label.checkbox (its <span><p>…</p></span>)
  const optionText = (c) => {
    const lab = c.parent && c.parent.tag === 'label' ? c.parent : item;
    const span = q1(lab, byTag('span')) || lab;
    return frag(inner(span)).replace(/^<p>|<\/p>$/g, '');
  };
  // checkbox group(s): .form-item-wrapper > .form-item[.mwf-hidden] > .form-row-100 > .form-item >
  // label.checkbox > input[type=checkbox] + input[type=hidden name=_<name>] (companion, EMPTY) + span
  const boxes = inputs.filter((c) => c.attrs.type === 'checkbox');
  if (boxes.length) {
    const wrapped = q1(item, byCls('form-item'));
    const hidden = cls(item, 'mwf-hidden') || (wrapped && cls(wrapped, 'mwf-hidden'));
    const groups = new Map();
    boxes.forEach((c) => { const n = c.attrs.name || ''; if (!groups.has(n)) groups.set(n, []); groups.get(n).push(c); });
    let firstGroup = true;
    groups.forEach((list, name) => {
      const f = firstGroup ? [...flags] : ['same-row'];
      if (hidden) f.push('hidden');
      const li = list.map((c) => `<li>${optionText(c)}</li>`).join('');
      out.push([firstGroup ? labelCell : '', code('checkbox', name, ...f) + `<ul>${li}</ul>`]);
      const companion = inputs.find((c) => c.attrs.type === 'hidden' && c.attrs.name === `_${name}`);
      if (companion) out.push(['', code('hidden', companion.attrs.name, 'same-row')]);
      firstGroup = false;
    });
    return out;
  }
  // radio group: ONE row, one <li> per option (label.label heading → the label cell, h5 → heading)
  const radioInputs = inputs.filter((c) => c.attrs.type === 'radio');
  if (radioInputs.length) {
    const f = [...flags];
    if (required) f.push('required');
    const li = radioInputs.map((c) => `<li>${optionText(c)}</li>`).join('');
    out.push([labelCell, code('radio', radioInputs[0].attrs.name, ...f) + `<ul>${li}</ul>`]);
    return out;
  }
  inputs.forEach((c, i) => {
    const f = i === 0 ? flags : ['same-row'];
    let type = c.attrs.type || (c.tag === 'textarea' ? 'textarea' : 'text');
    if (type === 'hidden') { out.push(['', code('hidden', c.attrs.name, ...f)]); return; }
    if (required || 'required' in c.attrs) f.push('required');
    if ('disabled' in c.attrs) f.push('disabled');
    // .datepicker > input + button.ui-datepicker-trigger (calendar icon) → type `date`
    if (c.parent && cls(c.parent, 'datepicker')) type = 'date';
    else type = type === 'textarea' ? 'textarea' : 'text';
    const ph = c.attrs.placeholder ? `<p>${esc(c.attrs.placeholder)}</p>` : '';
    out.push([i === 0 ? labelCell : '', code(type, c.attrs.name, ...f) + ph]);
  });
  return out;
}

const emptyRow = (n) => n && n.tag === 'fieldset'
  && !!q1(n, (x) => /(^| )form-row-[\d-]+( |$)/.test(x.attrs.class || '')) && !find(n, byCls('form-item')).length;
const kids = els(form);
kids.forEach((node, i) => {
  if (cls(node, 'form-section__header')) return;
  if (cls(node, 'form-section__footer')) {
    const btn = q1(node, (x) => x.tag === 'button' && x.attrs.type === 'submit');
    if (btn) rows.push(['', `${code('submit')}<p>${frag(inner(btn))}</p>`]);
    return;
  }
  const info = q1(node, byCls('form-required-info')) || (cls(node, 'form-required-info') ? node : null);
  if (info) {
    // the block models the empty fieldset that precedes the info row on most forms; `tight` = none
    const f = emptyRow(kids[i - 1]) ? [] : ['tight'];
    rows.push(['', `${code('info', ...f)}<p>${frag(inner(info))}</p>`]);
    return;
  }
  if (node.tag !== 'fieldset') { deviations.push(`unhandled form child: ${node.tag}.${node.attrs.class || ''}`); return; }
  const row = q1(node, (x) => /(^| )form-row-[\d-]+( |$)/.test(x.attrs.class || ''));
  if (!row) {
    // the leading classless fieldset: empty (8 px margin — modelled in the block CSS) or hidden inputs
    find(node, (x) => x.tag === 'input' && x.attrs.type === 'hidden')
      .forEach((c, i) => rows.push(['', code('hidden', c.attrs.name, ...(i ? ['same-row'] : []))]));
    return;
  }
  const rowCls = (row.attrs.class.match(/form-row-([\d-]+)/) || [])[1] || '100';
  const items = els(row).filter(byCls('form-item'));
  if (!items.length) {
    // an empty row (8 px fieldset margin on live) — except the one before the info row (modelled)
    const next = kids[i + 1];
    const beforeInfo = next && (cls(next, 'form-required-info') || !!q1(next, byCls('form-required-info')));
    if (!beforeInfo) rows.push(['', code('spacer', ...(rowCls === '100' ? [] : [`row-${rowCls}`]))]);
    return;
  }
  let first = true;
  items.forEach((item) => {
    const layout = first ? (rowCls === '100' ? [] : [`row-${rowCls}`]) : ['same-row'];
    const encoded = encodeItem(item, layout);
    if (encoded.length) { rows.push(...encoded); first = false; }
  });
  // a heading item with no field after it in ITS row → its own `heading` row (live: own fieldset)
  if (pendingHeading) {
    rows.push([pendingHeading, code('heading', ...(rowCls === '100' ? [] : [`row-${rowCls}`]))]);
    pendingHeading = '';
  }
});
if (!h) {
  // no form header on the source (ex-proof): the first question heading is promoted to the page's
  // <h1> (text verbatim, level only — the delivery contract wants exactly one h1)
  const i = rows.findIndex((r) => /^<h2>/.test(r[0]));
  if (i >= 0) {
    rows[i][0] = rows[i][0].replace(/^<h2>([\s\S]*?)<\/h2>/, '<h1>$1</h1>');
    deviations.push('no form header on the source: the first question heading (h5) is promoted to h1, text verbatim');
  }
}
rows.push(['', `${code('notice')}<p>${esc(NOTICE)}</p>`]);
deviations.push('submission disabled (dynamic-features.md row 4): no action, the notice row is revealed on submit');

breadcrumb();
sections.push(`<div>\n${block('mwf-form', rows)}\n</div>`);

// ── metadata ──────────────────────────────────────────────────────────────────────────────────
const titleTag = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const title = opt('--title', (sidecar.metadata && sidecar.metadata.title) || clean(titleTag));
const descTag = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
const description = opt('--description', (sidecar.metadata && sidecar.metadata.description) || descTag);
const meta = [['Title', esc(title)], ['Description', esc(description)], ['Template', 'form']]
  .filter(([, v]) => v).map(([k, v]) => `    <div><div>${k}</div><div>${v}</div></div>`).join('\n');
sections.push(`<div>\n  <div class="metadata">\n${meta}\n  </div>\n</div>`);

fs.writeFileSync(outFile, `<body>\n<header></header>\n<main>\n${sections.join('\n')}\n</main>\n<footer></footer>\n</body>\n`);
console.log(`${outFile}: ${sections.length} sections, ${rows.length} mwf-form rows`);
[...new Set(deviations)].forEach((d) => console.log(`deviation: ${d}`));
