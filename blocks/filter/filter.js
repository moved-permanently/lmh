/**
 * filter — the static filter/download controls of the `listing` template (source
 * .filter-downloadarea). The listing is server-rendered on the source and ships as a static
 * snapshot (stardust/dynamic-features.md § "Listings contract"): the controls are inert chrome.
 * Authored: row 1 [h4 heading]; one row per form item: [label p] [ul of checkbox labels | one
 * <code>placeholder</code> p per date input].
 * Decode (template-slotted, node-slotting EW1–EW3): the h4 is kept; each item row → .form-item with
 * the label text moved into <label class="label">, each li moved into
 * <label class="checkbox"><input type=checkbox><span>…</span></label>, each <code> → a datepicker
 * text input (the code text becomes the placeholder, as captured) with its calendar trigger.
 * @ew-exempt text-as-metadata: `<code>` cells are form placeholders (config), not copy
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function moveInto(target, source) {
  while (source.firstChild) target.append(source.firstChild);
  return target;
}

export default function decorate(block) {
  const rows = [...block.children];
  const out = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
    if (cells.length === 1 && heading) { out.push(heading); return; }
    const [labelCell, controlCell] = cells;
    const item = el('div', 'form-item');
    const label = el('label', 'label');
    const labelText = labelCell.querySelector('p') || labelCell;
    item.append(moveInto(label, labelText));
    if (!controlCell) { out.push(item); return; }
    controlCell.querySelectorAll('li').forEach((li) => {
      const box = el('label', 'checkbox');
      const input = el('input');
      input.type = 'checkbox';
      box.append(input, moveInto(el('span'), li));
      item.append(box);
    });
    controlCell.querySelectorAll('code').forEach((code) => {
      const outer = el('div', 'input-wrapper');
      const picker = el('div', 'datepicker input-wrapper');
      const input = el('input', 'datepicker-input');
      input.type = 'text';
      input.placeholder = code.textContent.trim();
      const trigger = el('button', 'ui-datepicker-trigger');
      trigger.type = 'button';
      trigger.setAttribute('aria-label', 'Calendar');
      const icon = el('span', 'icon icon-calendar');
      icon.setAttribute('aria-hidden', 'true');
      trigger.append(icon);
      picker.append(input, trigger);
      outer.append(picker);
      item.append(outer);
    });
    out.push(item);
  });
  const area = el('div', 'filter-downloadarea');
  area.append(...out);
  block.replaceChildren(area);
}
