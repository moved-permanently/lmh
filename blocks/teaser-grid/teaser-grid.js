/**
 * teaser-grid — the home page's teaser rows (source .layout-25--fixed / .layout-33--fixed /
 * .layout-cta.layout-25-split--fixed, all `.layout--teaser`). Schema: stardust/eds-schema/en.json
 * § teaser-grid, teaser-grid-icons, teaser-grid-cta.
 * Default (source light .teaser--card, 4 per row): one row per card, cells [picture
 *   (+ `<code>video</code>` flag)] [h3 with the card link, p, "Learn more" link p]. The picture is
 *   wrapped in a generated link repeating the title href (card-as-link, EW6).
 * Variant `icons` (source .teaser--icon-text, 3 per row): cells [h3, p, link p] → lightgrey box
 *   with the (empty on live) icon glyph slot.
 * Variant `cta` (source .teaser--icon.teaser--card, 4 per row): cells [`<code>key</code>`]
 *   [p with the card link; `<strong>` = highlighted red card] → icon card as link (EW6: the
 *   authored anchor is unwrapped, its paragraph survives inside the card). Source
 *   `.mobile-order-primary`: below 768px the row precedes the hero section.
 * Reconstructive decode, node-slotting (EW1–EW3).
 * @ew-exempt text-as-metadata: leading `<code>` cells (video flag, icon key) are config, not copy
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function icon(key) {
  const i = el('span', `icon icon-${key || 'none'}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function decorateCta(block, rows) {
  const items = rows.map((row) => {
    const codes = [...row.querySelectorAll('code')];
    const key = codes.length ? codes[0].textContent.trim().toLowerCase() : '';
    codes.forEach((c) => c.closest('p, div').remove());
    const body = [...row.children].find((c) => c.isConnected && c.textContent.trim())
      || row.lastElementChild;
    const link = body.querySelector('a[href]');
    const item = el('div', 'teaser-grid-item ld-layout-teaser__wrapper');
    const card = el(link ? 'a' : 'div', 'teaser-grid-cta-card teaser teaser--icon teaser--card');
    if (link) {
      card.href = link.href;
      if (link.classList.contains('primary') || link.closest('strong')) card.classList.add('highlighted');
      link.replaceWith(...link.childNodes);
    }
    const label = el('div', 'teaser-grid-cta-label');
    while (body.firstChild) label.append(body.firstChild);
    card.append(icon(key), label);
    item.append(card);
    return item;
  });
  block.replaceChildren(...items);
  const section = block.closest('.section');
  const hero = section && section.previousElementSibling;
  if (hero && hero.classList.contains('hero-carousel-container')) {
    const mq = window.matchMedia('(max-width: 767px)');
    const place = () => { if (mq.matches) hero.before(section); else hero.after(section); };
    mq.addEventListener('change', place);
    place();
  }
}

function decorateIcons(block, rows) {
  const items = rows.map((row) => {
    const codes = [...row.querySelectorAll('code')];
    const key = codes.length ? codes[0].textContent.trim().toLowerCase() : '';
    codes.forEach((c) => c.closest('p, div').remove());
    const body = [...row.children].find((c) => c.isConnected && c.textContent.trim())
      || row.lastElementChild;
    const item = el('div', 'teaser-grid-item');
    const box = el('div', 'teaser-grid-icon-text');
    box.append(icon(key));
    [...body.children].forEach((p) => {
      if (p.tagName === 'P' && p.querySelector('a[href]') && p.children.length === 1) {
        const link = el('div', 'teaser-grid-link');
        link.append(p);
        box.append(link);
      } else {
        box.append(p);
      }
    });
    item.append(box);
    return item;
  });
  block.replaceChildren(...items);
}

function decorateCards(block, rows) {
  const items = rows.map((row) => {
    const cells = [...row.children];
    const codes = [...row.querySelectorAll('code')];
    const flags = codes.map((c) => c.textContent.trim().toLowerCase());
    codes.forEach((c) => c.closest('p, div').remove());
    const pic = row.querySelector('picture, img');
    const body = cells.find((c) => c.isConnected && c.textContent.trim() && !c.contains(pic))
      || cells[cells.length - 1];
    const item = el('div', 'teaser-grid-item ld-layout-teaser__wrapper');
    const card = el('div', 'teaser-grid-card teaser teaser--card');
    const h = body.querySelector('h2, h3, h4');
    const link = h ? h.querySelector('a[href]') : null;
    if (pic) {
      const image = el('div', 'teaser-grid-image');
      if (flags.includes('video')) image.classList.add('video');
      const a = link ? el('a') : el('div');
      if (link) a.href = link.href;
      a.className = 'teaser-grid-image-link';
      const ratio = el('div', 'teaser-grid-ratio');
      ratio.append(pic.closest('picture') || pic);
      a.append(ratio);
      if (flags.includes('video')) {
        const v = el('span', 'teaser-grid-video-icon');
        v.setAttribute('aria-hidden', 'true');
        a.append(v);
      }
      image.append(a);
      card.append(image);
    }
    const content = el('div', 'teaser-grid-body');
    if (h) content.append(h);
    const text = el('div', 'teaser-grid-text');
    [...body.children].forEach((p) => {
      if (p.tagName === 'P' && p.querySelector('a[href]') && p.children.length === 1) {
        const cta = el('div', 'teaser-grid-link');
        cta.append(p);
        text.append(cta);
      } else {
        text.append(p);
      }
    });
    content.append(text);
    card.append(content);
    item.append(card);
    return item;
  });
  block.replaceChildren(...items);
}

export default function decorate(block) {
  const rows = [...block.children];
  // alias the source layout class names: the repeated-unit families (stardust/replica/units.json)
  // measure `.layout--teaser .ld-layout-teaser__wrapper .teaser--card` and
  // `.layout-cta … a.teaser--icon`
  block.classList.add('layout--teaser');
  if (block.classList.contains('cta')) block.classList.add('layout-cta');
  if (block.classList.contains('cta')) decorateCta(block, rows);
  else if (block.classList.contains('icons')) decorateIcons(block, rows);
  else decorateCards(block, rows);
}
