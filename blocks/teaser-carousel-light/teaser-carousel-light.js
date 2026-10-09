/**
 * teaser-carousel-light — the home "Recent Press Releases" carousel (source
 * .layout-teasercarousel__wrapper on white, .teaser--overflow cards). Schema:
 * stardust/eds-schema/en.json § teaser-carousel-light. The band title is default content in the
 * same section, styled in place via .teaser-carousel-light-container. One row per card:
 * [h3 with the card link, p, "Learn more" link p]. Captured state: slide 0 current, prev disabled,
 * no autoplay (motion-observe: 0 animations); the red next/prev buttons step one slide.
 * Reconstructive decode, node-slotting (EW1–EW3).
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function iconButton(name, glyph, label) {
  const b = el('button', `teaser-carousel-light-btn teaser-carousel-light-btn-${name}`);
  b.type = 'button';
  b.setAttribute('aria-label', label);
  const i = el('span', 'icon');
  i.setAttribute('aria-hidden', 'true');
  i.textContent = glyph;
  b.append(i);
  return b;
}

export default function decorate(block) {
  // alias the source class names: units.json family related-teaser measures
  // `.layout-teasercarousel--fixed .slick-slide .teaser`
  const slider = el('div', 'teaser-carousel-light-slider layout-teasercarousel--fixed');
  const track = el('div', 'teaser-carousel-light-track');
  const slides = el('div', 'teaser-carousel-light-slides');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const body = cells.find((c) => c.textContent.trim()) || cells[cells.length - 1];
    const item = el('div', 'teaser-carousel-light-item slick-slide');
    const card = el('div', 'teaser-carousel-light-card teaser');
    const content = el('div', 'teaser-carousel-light-body');
    const h = body.querySelector('h2, h3, h4');
    if (h) content.append(h);
    const text = el('div', 'teaser-carousel-light-text');
    [...body.children].forEach((p) => {
      if (p.tagName === 'P' && p.querySelector('a[href]') && p.children.length === 1) {
        const cta = el('div', 'teaser-carousel-light-link');
        cta.append(p);
        text.append(cta);
      } else {
        text.append(p);
      }
    });
    content.append(text);
    card.append(content);
    item.append(card);
    slides.append(item);
  });
  track.append(slides);
  const controls = el('div', 'teaser-carousel-light-controls');
  const next = iconButton('next', '', 'Next');
  const prev = iconButton('prev', '', 'Previous');
  controls.append(next, prev);
  slider.append(track, controls);
  let index = 0;
  const update = () => {
    const items = [...slides.children];
    const step = items[0] ? items[0].offsetWidth : 0;
    const visible = Math.max(1, Math.floor(track.clientWidth / (step || 1)));
    index = Math.max(0, Math.min(index, items.length - visible));
    slides.style.transform = `translateX(${-index * step}px)`;
    prev.disabled = index === 0;
    next.disabled = index >= items.length - visible;
  };
  next.addEventListener('click', () => { index += 1; update(); });
  prev.addEventListener('click', () => { index -= 1; update(); });
  window.addEventListener('resize', update);
  block.replaceChildren(slider);
  requestAnimationFrame(update);
}
