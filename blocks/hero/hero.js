/**
 * hero — page stage of the landing/program templates.
 * Schema: stardust/eds-schema/en-landingpage-e-models.json (sections hero, banner ×2).
 * Default (source .header-image): rows [picture] [h1, subtitle p, CTA paragraphs] → lightgrey
 *   stage,
 *   text 45 % | 16:9 image 55 % from 1024px, stacked image-first below; 48px bottom bar ≥ 1024.
 * Variant `banner[ right][ bottom]` (source .parallax-container, text-wrapper--top/bottom left/right): full-width picture with a white text card
 *   (h3, p, link paragraphs) overlaid top-left (or top-right) from 768px, stacked below.
 * Template-slotted decode, node-slotting (EW1–EW3): authored nodes MOVE into generated wrappers.
 * @param {Element} block
 */
function el(className) {
  const d = document.createElement('div');
  d.className = className;
  return d;
}

/**
 * read-more (source .read-more__toggle, href #read_more): the collapsed copy is the
 * `article read-more` section right before the toggle's own section; the click shows it.
 * Wired once per page from the stage hero (the sections exist before any block decorates).
 */
function wireReadMore() {
  const main = document.querySelector('main');
  if (!main || main.dataset.readMore) return;
  main.dataset.readMore = 'wired';
  main.querySelectorAll('.section.read-more-toggle a[href$="#read_more"]').forEach((a) => {
    const copy = a.closest('.section').previousElementSibling;
    if (!copy || !copy.classList.contains('read-more')) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      copy.classList.toggle('expanded');
    });
  });
}

export default function decorate(block) {
  const banner = block.classList.contains('banner');
  wireReadMore();
  const pic = block.querySelector('picture, img');
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const textCell = cells.find((c) => !c.querySelector('picture, img') && c.textContent.trim())
    || cells[cells.length - 1];
  const stage = el('hero-stage');
  const text = el('hero-text');
  const media = el('hero-media');
  if (pic) media.append(pic.closest('picture') || pic);
  if (textCell) {
    const ctas = [...textCell.querySelectorAll('p')].filter((p) => p.querySelector('a.button'));
    while (textCell.firstChild) text.append(textCell.firstChild);
    // the source keeps its (possibly empty) .btn-wrapper with a 1rem top margin on the stage
    if (!banner || ctas.length) {
      const actions = el('hero-actions');
      ctas.forEach((p) => actions.append(p));
      text.append(actions);
    }
  }
  // source: a banner whose text wrapper carries no copy (ergonomics 1440:
  // .parallax__text-wrapper 648 × 72, transparent, h3 0 px) paints nothing —
  // the build's padded white card would be a 72 px box
  if (banner && !text.textContent.trim() && !text.querySelector('picture, img, a')) {
    text.classList.add('hero-text-empty');
  }
  if (banner) stage.append(media, text);
  else stage.append(text, media);
  block.replaceChildren(stage);
  if (!banner) block.append(el('hero-bottom'));
}
