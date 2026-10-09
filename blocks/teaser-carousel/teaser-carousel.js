/**
 * teaser-carousel — "This may also interest you" dark band (source .related-content >
 * .layout-teasercarousel__wrapper). Schema: stardust/eds-schema/en-landingpage-e-models.json.
 * The band title is default content in the same section (styled in place via
 * .teaser-carousel-container). Rows: one per card [picture] [h3 with the card link, p, "more" p].
 * Cards are 320px slides in a clipped track; the red next/prev buttons scroll one slide.
 * Reconstructive decode, node-slotting (EW1–EW3, EW6 picture link repeats the title href).
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function iconButton(name, glyph, label) {
  const b = el('button', `teaser-carousel-btn teaser-carousel-btn-${name}`);
  b.type = 'button';
  b.setAttribute('aria-label', label);
  const i = el('span', 'icon');
  i.setAttribute('aria-hidden', 'true');
  i.textContent = glyph;
  b.append(i);
  return b;
}

export default function decorate(block) {
  const track = el('div', 'teaser-carousel-track');
  const slides = el('div', 'teaser-carousel-slides');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const pic = row.querySelector('picture, img');
    const body = cells.find((c) => c.textContent.trim()) || cells[cells.length - 1];
    const h = body.querySelector('h2, h3, h4');
    const link = h ? h.querySelector('a[href]') : null;
    const item = el('div', 'teaser-carousel-item');
    const teaser = el('div', 'teaser');
    const image = el('div', 'teaser-image');
    if (pic) {
      const a = link ? el('a') : el('div');
      if (link) a.href = link.href;
      a.className = 'teaser-image-link';
      a.append(pic.closest('picture') || pic);
      image.append(a);
    }
    const content = el('div', 'teaser-content');
    if (h) content.append(h);
    const text = el('div', 'teaser-text');
    while (body.firstChild) text.append(body.firstChild);
    content.append(text);
    teaser.append(image, content);
    item.append(teaser);
    slides.append(item);
  });
  track.append(slides);
  const controls = el('div', 'teaser-carousel-controls');
  const next = iconButton('next', '\uf153', 'Next');
  const prev = iconButton('prev', '\uf13d', 'Previous');
  controls.append(next, prev);
  let index = 0;
  const update = () => {
    const items = [...slides.children];
    const visible = Math.max(1, Math.floor(track.clientWidth / (items[0]?.offsetWidth || 1)));
    index = Math.max(0, Math.min(index, items.length - visible));
    const step = items[0] ? items[0].offsetWidth : 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    slides.style.transition = reduce ? 'none' : '';
    slides.style.transform = `translateX(${-index * step}px)`;
    prev.disabled = index === 0;
    next.disabled = index >= items.length - visible;
  };
  next.addEventListener('click', () => { index += 1; update(); });
  prev.addEventListener('click', () => { index -= 1; update(); });
  window.addEventListener('resize', update);
  block.replaceChildren(track);
  block.parentElement.append(controls);
  requestAnimationFrame(update);
}
