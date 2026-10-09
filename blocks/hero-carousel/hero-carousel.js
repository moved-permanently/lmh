/**
 * hero-carousel — the home stage (source .media-carousel--header, slick infinite carousel).
 * Schema: stardust/eds-schema/en.json § hero-carousel. One row per slide: [picture]
 * [p strong eyebrow, p title, p strong>a CTA]. Captured state: slide 1 of N current, no
 * autoplay (motion-observe: 0 animations); dots are tabs labelled with the slide eyebrow
 * (live: slick dots carry the slide title), arrows step one slide.
 * Reconstructive decode, node-slotting (EW1–EW3; EW4 the dot labels are presentational clones).
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function arrow(name, glyph, label) {
  const b = el('button', `hero-carousel-arrow hero-carousel-arrow-${name}`);
  b.type = 'button';
  b.setAttribute('aria-label', label);
  const i = el('span', 'icon');
  i.setAttribute('aria-hidden', 'true');
  i.textContent = glyph;
  b.append(i);
  return b;
}

export default function decorate(block) {
  const track = el('div', 'hero-carousel-track');
  const slides = el('div', 'hero-carousel-slides');
  const dots = el('ul', 'hero-carousel-dots');
  dots.setAttribute('role', 'tablist');
  const id = `hero-carousel-${Math.random().toString(36).slice(2, 8)}`;
  const rows = [...block.children];
  rows.forEach((row, n) => {
    const cells = [...row.children];
    const pic = row.querySelector('picture, img');
    const body = cells.find((c) => c.textContent.trim() && !c.contains(pic))
      || cells[cells.length - 1];
    const slide = el('div', 'hero-carousel-slide');
    slide.id = `${id}-slide-${n}`;
    slide.setAttribute('role', 'tabpanel');
    const content = el('div', 'hero-carousel-content');
    const text = el('div', 'hero-carousel-text');
    const inner = el('div', 'hero-carousel-text-inner');
    const eyebrow = el('div', 'hero-carousel-eyebrow');
    const title = el('div', 'hero-carousel-title');
    const actions = el('div', 'hero-carousel-actions');
    [...body.children].forEach((p) => {
      if (p.querySelector('a[href]')) actions.append(p);
      else if (p.querySelector('strong') && !eyebrow.childElementCount) eyebrow.append(p);
      else title.append(p);
    });
    inner.append(eyebrow, title, actions);
    text.append(inner);
    const media = el('div', 'hero-carousel-media');
    if (pic) {
      const image = el('div', 'hero-carousel-image');
      image.append(pic.closest('picture') || pic);
      media.append(image);
    }
    content.append(text, media);
    slide.append(content);
    slides.append(slide);
    const li = el('li');
    li.setAttribute('role', 'presentation');
    const tab = el('button');
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-label', `${n + 1} of ${rows.length}`);
    tab.setAttribute('aria-controls', slide.id);
    tab.textContent = eyebrow.textContent;
    li.append(tab);
    dots.append(li);
  });
  track.append(slides);
  const controls = el('div', 'hero-carousel-controls');
  const dotsWrap = el('div', 'hero-carousel-dots-wrapper');
  dotsWrap.append(dots);
  const arrows = el('div', 'hero-carousel-arrows');
  const prev = arrow('prev', '', 'Previous');
  const next = arrow('next', '', 'Next');
  arrows.append(prev, next);
  controls.append(dotsWrap, arrows);
  let index = 0;
  const update = () => {
    const items = [...slides.children];
    index = (index + items.length) % items.length;
    slides.style.transform = `translateX(${-index * 100}%)`;
    items.forEach((s, i) => {
      s.classList.toggle('active', i === index);
      s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });
    [...dots.children].forEach((li, i) => {
      li.classList.toggle('active', i === index);
      const tab = li.firstElementChild;
      tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
      tab.tabIndex = i === index ? 0 : -1;
    });
  };
  dots.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    index = [...dots.children].indexOf(li);
    update();
  });
  prev.addEventListener('click', () => { index -= 1; update(); });
  next.addEventListener('click', () => { index += 1; update(); });
  block.replaceChildren(track, controls);
  update();
}
