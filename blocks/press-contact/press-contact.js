/**
 * press-contact — the source `.teaser.teaser--card` press-contact card (image, department
 * heading, contact name, phone + e-mail links). Decode tier: template-slotted (node-slotting):
 * the authored picture, the two headings and each link paragraph move into the card's slots.
 * Rows (any shape, flatten-tolerant): picture | h3 department + h4 name | one <p><a> per contact.
 * Schema: stardust/eds-schema/en-technical-news-detail-101184-html.json § press-contact
 * (2 headings, 2 CTAs, 1 img). The section also carries the article prose (default content),
 * styled by press-contact.css under `.press-contact-container`.
 * @param {Element} block The press-contact block element
 */
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

/**
 * Infobox modes from section-metadata `Infobox` (left | full | right, one value or a comma list,
 * one per picture paragraph in order; the last value repeats). `left` is the archetype float
 * and needs no class; `full` renders in flow at column width, `right` floats right, `inline`
 * renders in flow at the prose column plus its 34px side margins (a shrink-to-fit source column).
 * @param {Element} block The press-contact block element
 */
function tagInfoboxes(block) {
  const section = block.closest('.section');
  const modes = (section?.dataset.infobox || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
  if (!modes.length) return;
  const boxes = [...section.querySelectorAll('.default-content-wrapper p')]
    .filter((p) => p.querySelector('picture, img'));
  boxes.forEach((p, i) => {
    const mode = modes[Math.min(i, modes.length - 1)];
    if (mode === 'full' || mode === 'right' || mode === 'inline') {
      p.classList.add(`infobox-${mode}`);
      const caption = p.nextElementSibling;
      if (caption?.tagName === 'P' && !caption.querySelector('picture, img')) {
        caption.classList.add(`infobox-${mode}`);
      }
    }
  });
}

export default function decorate(block) {
  tagInfoboxes(block);
  const media = block.querySelector('picture, img');
  const headings = [...block.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  const paragraphs = [...block.querySelectorAll('p')]
    .filter((p) => !p.querySelector('picture, img'));
  const links = paragraphs.filter((p) => p.querySelector('a'));
  const label = headings.length > 1 ? headings[0] : paragraphs.find((p) => !p.querySelector('a'));
  const name = headings.length > 1 ? headings[1] : headings[0];

  const card = document.createElement('div');
  card.className = 'press-contact-card';
  if (media) card.append(wrapNode(media, 'press-contact-image'));
  const content = document.createElement('div');
  content.className = 'press-contact-content';
  if (label) content.append(wrapNode(label, 'press-contact-label'));
  if (name) content.append(wrapNode(name, 'press-contact-name'));
  if (links.length) {
    const text = document.createElement('div');
    text.className = 'press-contact-text';
    links.forEach((p) => {
      const a = p.querySelector('a');
      const href = a.getAttribute('href') || '';
      const row = document.createElement('div');
      row.className = 'press-contact-row';
      const icon = document.createElement('i');
      let glyph = 'right';
      if (href.startsWith('tel:')) glyph = 'phone';
      else if (href.startsWith('mailto:')) glyph = 'mail';
      icon.className = `icon icon-${glyph}`;
      icon.setAttribute('aria-hidden', 'true');
      row.append(icon, p); // the authored paragraph moves (EW3)
      text.append(row);
    });
    content.append(text);
  }
  card.append(content);
  block.replaceChildren(card);
}
