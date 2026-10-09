/**
 * media-carousel — the source `.media-carousel` (slick) image band: one authored row per slide,
 * the cell holds the slide's <picture> (an optional caption paragraph follows it).
 * Decode tier: reconstructive (repeat group). Schema: stardust/eds-schema/
 * en-technical-news-detail-101184-html.json § media-carousel (1 img, 1 editable).
 * Motion: the archetype's capture state is one slide (arrows hidden, one dot); for several slides
 * the dots and arrows switch the active slide without animation — nothing else is implemented.
 * @param {Element} block The media-carousel block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const items = [];
  rows.forEach((row) => {
    const media = row.querySelector('picture, img');
    if (!media) return;
    const item = document.createElement('div');
    item.className = 'media-carousel-item';
    const clipper = document.createElement('div');
    clipper.className = 'media-carousel-clipper';
    const contents = document.createElement('div');
    contents.className = 'media-carousel-contents';
    const frame = document.createElement('div');
    frame.className = 'media-carousel-image';
    frame.append(media); // the authored picture moves (EW1)
    contents.append(frame);
    clipper.append(contents);
    item.append(clipper);
    const captions = [...row.querySelectorAll('p')].filter((p) => p.textContent.trim());
    if (captions.length) {
      const cap = document.createElement('div');
      cap.className = 'media-carousel-caption';
      captions.forEach((p) => cap.append(p));
      item.append(cap);
    }
    items.push(item);
  });
  if (!items.length) return;

  const list = document.createElement('div');
  list.className = 'media-carousel-list';
  const track = document.createElement('div');
  track.className = 'media-carousel-track';
  items.forEach((item) => track.append(item));
  list.append(track);

  const dots = document.createElement('ul');
  dots.className = 'media-carousel-dots';
  dots.setAttribute('role', 'tablist');
  const buttons = items.map((item, i) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.textContent = String(i + 1); // the source dot reads "1", "2", … (0×0 box)
    b.setAttribute('aria-label', `${i + 1} of ${items.length}`);
    li.append(b);
    dots.append(li);
    return b;
  });

  let current = 0;
  const show = (n) => {
    current = (n + items.length) % items.length;
    items.forEach((item, i) => {
      item.classList.toggle('active', i === current);
      buttons[i].setAttribute('aria-selected', i === current ? 'true' : 'false');
      buttons[i].parentElement.classList.toggle('active', i === current);
    });
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => show(i)));

  block.replaceChildren(list, dots);
  if (items.length > 1) {
    const arrow = (dir, label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `media-carousel-arrow media-carousel-${dir}`;
      b.setAttribute('aria-label', label);
      const icon = document.createElement('i');
      icon.className = `icon icon-${dir === 'next' ? 'right' : 'left'}`;
      icon.setAttribute('aria-hidden', 'true');
      b.append(icon);
      b.addEventListener('click', () => show(current + (dir === 'next' ? 1 : -1)));
      return b;
    };
    block.append(arrow('next', 'Next slide'), arrow('prev', 'Previous slide'));
  }
  show(0);
}
