/**
 * related-teasers — teaser rows of the landing/program templates (source .layout--teaser rows).
 * Schema: stardust/eds-schema/en-landingpage-e-models.json (teasers 33/50/100 rows, icon rows).
 * Default (source light .teaser): one row per teaser, cells [picture (+ `<code>video</code>` flag)]
 *   [h3 with the card link, p…, "more" link p]. The picture is wrapped in a generated link that
 *   repeats the title's href (card-as-link, EW6). Columns follow the row count — 1 → horizontal
 *   card, 2 → 50 %, 3 → 33 %, 4+ → 25 % (source .layout-25--fixed) — or an explicit `one` / `two` /
 *   `three` / `four` variant.
 * Variant `icons` (source .teaser--icon-text): cells [`<code>key</code>`] [h3, p] → lightgrey box
 *   with the 80px icon-font glyph `icon-<key>`.
 * Reconstructive decode, node-slotting (EW1–EW3).
 * @ew-exempt text-as-metadata: leading `<code>` cells (video flag, icon key) are config, not copy
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function moveBody(body, h, text) {
  const content = el('div', 'teaser-content');
  if (h) content.append(h);
  while (body.firstChild) text.append(body.firstChild);
  content.append(text);
  return content;
}

export default function decorate(block) {
  const icons = block.classList.contains('icons');
  const rows = [...block.children];
  const items = rows.map((row) => {
    const cells = [...row.children];
    const codes = [...row.querySelectorAll('code')];
    const flags = codes.map((c) => c.textContent.trim().toLowerCase());
    codes.forEach((c) => c.closest('p, div').remove());
    const pic = row.querySelector('picture, img');
    // decorate defensively: a leading config cell whose code key was empty arrives as a literal `` text, never the body
    const body = cells.find((c) => c.isConnected && c.textContent.replace(/`/g, '').trim() && !c.contains(pic))
      || cells[cells.length - 1];
    const item = el('div', 'related-teasers-item');
    if (icons) {
      const box = el('div', 'teaser-icon-text');
      const icon = el('span', `icon icon-${flags[0] || 'none'}`);
      icon.setAttribute('aria-hidden', 'true');
      box.append(icon);
      while (body.firstChild) box.append(body.firstChild);
      item.append(box);
      return item;
    }
    const teaser = el('div', 'teaser');
    const h = body.querySelector('h2, h3, h4');
    const link = h ? h.querySelector('a[href]') : null;
    const image = el('div', 'teaser-image');
    if (pic) {
      const a = link ? el('a') : el('div');
      if (link) a.href = link.href;
      a.className = 'teaser-image-link';
      a.append(pic.closest('picture') || pic);
      if (flags.includes('video')) {
        const v = el('span', 'teaser-video-icon');
        v.setAttribute('aria-hidden', 'true');
        a.append(v);
      }
      image.append(a);
    }
    teaser.append(image, moveBody(body, h, el('div', 'teaser-text')));
    item.append(teaser);
    return item;
  });
  if (!['one', 'two', 'three', 'four'].some((v) => block.classList.contains(v))) {
    // source rows: layout-100 → 1, layout-50 → 2, layout-33 → 3, layout-25 → 4+ (25 % tiles wrap 4 per row)
    block.classList.add(['one', 'two', 'three', 'four'][Math.min(items.length, 4) - 1] || 'four');
  }
  block.replaceChildren(...items);
}
