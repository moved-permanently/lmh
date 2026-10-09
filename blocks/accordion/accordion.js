/**
 * accordion — the source `.accordion` (landing siblings Compact-class, Happy-Driver): one authored
 * row per item, cells [h3 title] [body: paragraphs and figures as <p><img></p>, in source order].
 * Decode tier: reconstructive (repeat group), node-slotting (EW1–EW3): the title heading moves into
 * the <summary>, the body cell becomes the panel. Capture state: the first item open (.is-open).
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const items = rows.map((row, i) => {
    const cells = [...row.children];
    const titleCell = cells[0];
    const bodyCell = cells[1] || document.createElement('div');
    const details = document.createElement('details');
    details.className = 'accordion-item';
    if (i === 0) details.open = true;
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-headline';
    const h = titleCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (h) summary.append(h);
    else while (titleCell.firstChild) summary.append(titleCell.firstChild);
    // the source keeps the toggle as an icon-only `<a href="#" title="#">` inside the headline —
    // kept as a link with the same attributes (content parity: the presence probe labels a
    // text-less anchor by its title), the click toggles the panel instead of navigating
    const toggle = document.createElement('a');
    toggle.href = '#';
    toggle.title = '#';
    toggle.className = 'accordion-item-toggle';
    const glyph = document.createElement('span');
    glyph.className = 'accordion-item-glyph icon';
    glyph.setAttribute('aria-hidden', 'true');
    toggle.append(glyph);
    toggle.addEventListener('click', (e) => { e.preventDefault(); details.open = !details.open; });
    summary.append(toggle);
    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    const text = document.createElement('div');
    text.className = 'accordion-item-text';
    // the source body is one rich-text flow (.accordion-item-body-content): headings, paragraphs and
    // .infobox-media figures in DOCUMENT ORDER — below 640 every figure is a full-column block where
    // it stands (measured fleet-management 360: figure 342 × 192 after the first h4 + p, the build's
    // split put it after all the text, 204 px lower); from 640 the figure floats (source .infobox--right:
    // width 320, float right, margin-left 16 — bundle @267911–@267998). Each media paragraph stays in
    // place as .accordion-item-figure.
    [...bodyCell.children].forEach((child) => {
      if (child.querySelector('picture, img') && !child.textContent.trim()) child.classList.add('accordion-item-figure');
      text.append(child);
    });
    body.append(text);
    details.append(summary, body);
    return details;
  });
  block.replaceChildren(...items);
}
