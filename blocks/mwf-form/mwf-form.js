/**
 * mwf-form — the request/contact form of the `form` template (source .mwf-form
 * form.form-section; stardust/dynamic-features.md rows 4 + 5: UI rebuilt native from the capture,
 * submission DISABLED — the MWF endpoint belongs to the site owner). The field set is
 * CONTENT-DRIVEN: every sibling form authors its own rows, the block never carries a fixed list.
 *
 * Authored rows (the vocabulary stardust/rollout/encoders/form.mjs emits):
 *   - header row: [heading] [empty]                → form header (h1 of the page)
 *   - two-cell field row: [label] [control]
 *       label cell: <p>Name*</p> (inline label), a heading (own label item, source h5 "Subject:"),
 *                   or empty; a red required mark is <em>*</em>
 *       control cell: <p><code>type</code> <code>name</code> <code>flag</code>…</p> then, per type,
 *                   <ul> options (<em> = placeholder, <strong> = preselected) and/or a text <p>
 *         type: text | textarea | date | select | radio | checkbox | hidden | heading | spacer |
 *               info | submit | notice (radio / checkbox: one group per row, one <li> per option;
 *               heading: a source h5 alone in its row — [<h2>] [<code>heading</code> row-…];
 *               spacer: an empty source fieldset row; info `tight`: no empty fieldset before it)
 *         flags: required | disabled | hidden (captured .mwf-hidden dependent dropdown / group) |
 *                native (visible native <select>, country) | row-50 | row-100-30 | row-30-100
 *                (layout of the row this field STARTS; default row-100) | same-row (joins the
 *                previous row — a hidden input joins the previous hidden item)
 * Decode: template-slotted for header / info / submit / notice, reconstructive for the field rows
 * (node-slotting EW1–EW3: label <p>, heading, option <ul>, radio <li> text and notice <p> MOVE into
 * generated wrappers). Dropdowns render in the captured CLOSED state: native select hidden, red
 * toggle shows the placeholder / preselected text, the menu (the authored <ul>) stays hidden, no
 * flyout script. Submission is blocked (no action, submit → the authored notice is revealed).
 * @ew-exempt <p> control descriptor (code tokens) — text-as-metadata, never displayed
 * @ew-exempt <p> submit label — rendered as the <button> text (a button cannot host the editor)
 * @ew-exempt <ul> select options — mirrored into native <option>s (a form control), the list itself
 *            moves into the hidden menu
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}
function wrapNode(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}
const text = (n) => (n ? n.textContent.trim() : '');
const NO_NAME = new Set(['heading', 'spacer', 'info', 'submit', 'notice']); // types without a name

let uid = 0;
function labelFor(p, control) {
  if (!p) return;
  uid += 1;
  if (!p.id) p.id = `mwf-label-${uid}`;
  control.setAttribute('aria-labelledby', p.id);
}

// native <select> from the authored option list (the list itself moves into the hidden menu)
function buildSelect(name, list, flags) {
  const select = el('select', 'mwf-select');
  select.name = name;
  select.id = `f-${name}`;
  if (flags.has('disabled')) select.disabled = true;
  if (flags.has('required')) select.setAttribute('aria-required', 'true');
  let shown = '';
  let placeholder = false;
  [...(list ? list.children : [])].forEach((li) => {
    const opt = document.createElement('option');
    opt.textContent = text(li);
    if (li.querySelector('em') && !li.querySelector('strong')) {
      opt.value = '';
      opt.disabled = true;
      if (!shown) { shown = opt.textContent; placeholder = true; }
      if (flags.has('native')) opt.selected = true; else opt.hidden = true;
    } else {
      opt.value = opt.textContent;
      if (li.querySelector('strong')) { opt.selected = true; shown = opt.textContent; placeholder = false; }
    }
    select.append(opt);
  });
  return { select, shown, placeholder };
}

function dropdown(item, labelP, name, list, flags, hintP) {
  const dd = el('div', `dropdown${flags.has('hidden') ? ' mwf-hidden' : ''}`);
  const { select, shown, placeholder } = buildSelect(name, list, flags);
  if (labelP) {
    dd.append(wrapNode(labelP, 'form-label mwf-label'));
    labelFor(labelP, select);
  }
  dd.append(select);
  if (flags.has('native')) {
    const sw = el('div', 'select-wrapper');
    const icon = el('span', 'icon icon-down');
    icon.setAttribute('aria-hidden', 'true');
    sw.append(select, icon);
    dd.append(sw);
  } else {
    const wrap = el('div', 'dropdown-wrapper');
    const btn = el('button', `btn dropdown-toggle icon-float-right${placeholder ? ' show-placeholder' : ''}`);
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    if (flags.has('disabled')) btn.disabled = true;
    const icon = el('span', 'icon icon-down');
    icon.setAttribute('aria-hidden', 'true');
    const value = el('span', 'btn-value');
    value.textContent = shown; // the control's current value (runtime), authored in the list
    btn.append(icon, value);
    wrap.append(btn);
    dd.append(wrap);
  }
  if (list) {
    // the captured listbox items (li.option > a > text), hidden at rest, no flyout script
    [...list.children].forEach((li) => {
      if (li.querySelector('em') && !li.querySelector('strong')) return; // placeholder, no item
      li.setAttribute('role', 'option');
      const a = el('a');
      a.setAttribute('tabindex', '-1');
      a.append(...li.childNodes);
      li.append(a);
    });
    list.setAttribute('role', 'listbox');
    dd.append(wrapNode(list, 'dropdown-menu'));
  }
  item.append(dd);
  if (hintP) item.append(wrapNode(hintP, 'mwf-hint')); // live: hint text below the control
}

function radios(item, name, labelP, list, flags) {
  const box = el('div');
  const row = el('div', 'form-row-100 radio-row');
  if (labelP) {
    // a label.label heading above the group (live: 27 px block in the same box)
    box.append(wrapNode(labelP, 'form-label'));
    row.setAttribute('role', 'radiogroup');
    labelFor(labelP, row);
  }
  if (list) {
    [...list.children].forEach((li) => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = text(li);
      if (flags.has('required')) input.setAttribute('aria-required', 'true');
      const span = el('span');
      span.append(...li.childNodes);
      li.append(input, span);
      li.classList.add('radio');
    });
    row.append(list);
  }
  box.append(row);
  item.append(box);
}

// checkbox group (live: .form-item-wrapper > .form-item[.mwf-hidden] > .form-row-100 >
// .form-item > label.checkbox > input + span) — the authored list: one <li> per option
function checkboxes(item, name, list, flags) {
  item.classList.add('form-item-wrapper');
  const group = el('div', `form-item${flags.has('hidden') ? ' mwf-hidden' : ''}`);
  const row = el('div', 'form-row-100 checkbox-row');
  if (list) {
    [...list.children].forEach((li) => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = name;
      input.value = text(li);
      const span = el('span');
      span.append(...li.childNodes);
      const label = el('label', 'checkbox');
      label.append(input, span);
      li.append(label);
      li.classList.add('form-item');
    });
    row.append(list);
  }
  group.append(row);
  item.append(group);
}

function field(item, type, name, labelP, flags, extras) {
  const ctl = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  if (type !== 'textarea') ctl.type = 'text';
  ctl.name = name;
  ctl.id = `f-${name}`;
  if (flags.has('required')) ctl.setAttribute('aria-required', 'true');
  if (flags.has('disabled')) ctl.disabled = true;
  if (extras.placeholder) ctl.placeholder = extras.placeholder;
  if (labelP) {
    item.append(wrapNode(labelP, 'form-label'));
    labelFor(labelP, ctl);
  }
  if (type === 'date') {
    // live: .datepicker (dark wrapper) > input + button.ui-datepicker-trigger > calendar icon;
    // the jQuery UI calendar is not rebuilt (no flyout script) — the button is inert
    const dp = el('div', 'datepicker');
    const btn = el('button', 'ui-datepicker-trigger');
    btn.type = 'button';
    btn.tabIndex = -1;
    const icon = el('span', 'icon icon-calendar');
    icon.setAttribute('aria-hidden', 'true');
    btn.append(icon);
    dp.append(ctl, btn);
    item.append(wrapNode(dp, 'input-wrapper'));
    return;
  }
  item.append(wrapNode(ctl, 'input-wrapper'));
}

export default function decorate(block) {
  const form = el('form', 'form-section');
  form.method = 'post';
  form.setAttribute('novalidate', '');
  let header = null;
  let footer = null;
  let notice = null;
  let current = null; // the open form row
  let lastItem = null;

  const newRow = (cls) => {
    const fs = el('fieldset');
    const row = el('div', `form-row-${cls}`);
    fs.append(row);
    form.append(fs);
    current = row;
    return row;
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const heading = cells[0] ? cells[0].querySelector('h1, h2, h3, h4, h5, h6') : null;
    const [labelCell, ctrlCell] = cells;
    const descriptor = ctrlCell ? ctrlCell.querySelector('p:has(code)') : null;
    if (!descriptor) {
      // header row (a heading, no control descriptor) — one per form
      if (heading && !header) {
        header = el('div', 'form-header');
        header.append(heading);
      }
      return;
    }
    const labelP = labelCell.querySelector('p');
    const tokens = descriptor ? [...descriptor.querySelectorAll('code')].map((c) => text(c)) : [];
    const [type = 'text', name = `field-${uid += 1}`, ...rest] = tokens;
    const flags = new Set(rest);
    const list = ctrlCell.querySelector('ul, ol');
    const textP = [...ctrlCell.querySelectorAll('p')].find((p) => p !== descriptor);

    if (type === 'submit') {
      footer = el('div', 'form-footer');
      const btn = el('button', 'btn btn--primary');
      btn.type = 'submit';
      btn.textContent = text(textP);
      footer.append(btn);
      return;
    }
    if (type === 'notice') {
      notice = el('div', 'form-notice');
      notice.setAttribute('role', 'status');
      notice.hidden = true;
      if (textP) notice.append(textP);
      return;
    }
    if (type === 'info') {
      const info = el('div', 'form-row-50 form-info');
      if (tokens.includes('tight')) info.classList.add('tight'); // no empty fieldset before it
      const span = el('div', 'form-item form-required-info');
      if (textP) span.append(textP);
      info.append(span);
      form.append(info);
      current = null;
      return;
    }
    if (type === 'hidden' && flags.has('same-row') && lastItem) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = ''; // never a captured session value
      lastItem.append(input);
      return;
    }
    if (NO_NAME.has(type)) tokens.slice(1).forEach((f) => flags.add(f)); // every token = a flag
    const rowCls = ([...flags].find((f) => f.startsWith('row-')) || 'row-100').slice(4);
    if (!flags.has('same-row') || !current) newRow(rowCls);
    if (type === 'spacer') return; // an empty source fieldset row (8 px margin, no items)
    if (heading) {
      // a heading item (source h5): alone in its row (`heading`) or before the field of this row;
      // a captured .mwf-hidden h5 hides the heading only — its item stays an empty flex child
      const hi = el('div', 'form-item form-item-heading');
      if (flags.has('hidden')) heading.classList.add('mwf-hidden');
      hi.append(heading);
      current.append(hi);
    }
    if (type === 'heading') return;
    const item = el('div', 'form-item');
    current.append(item);
    lastItem = item;
    if (type === 'hidden') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = '';
      item.append(input);
      // the source's leading classless fieldset of hidden inputs: first-of-type, no top margin
      if (form.querySelectorAll('fieldset').length === 1) {
        current.parentElement.classList.add('form-lead');
      }
    } else if (type === 'select') {
      dropdown(item, labelP, name, list, flags, textP);
    } else if (type === 'radio') {
      radios(item, name, labelP, list, flags);
    } else if (type === 'checkbox') {
      checkboxes(item, name, list, flags);
    } else {
      field(item, type, name, labelP, flags, { placeholder: textP ? text(textP) : '' });
    }
  });

  if (header) form.prepend(header);
  if (notice) form.append(notice);
  if (footer) form.append(footer);
  // submission disabled: no action, no post — the authored notice is revealed instead
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (notice) notice.hidden = false;
  });
  block.replaceChildren(form);
}
