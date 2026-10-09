/**
 * news-cards — the card grid of the `listing` template (source .layout--teaser rows of
 * .news-card, repeated-unit family `news-card`, stardust/replica/units.json).
 * Authored: one row per card, cells [img] [h3 > a title, p subline…, p > a "Read more"].
 * Decode (reconstructive, node-slotting EW1–EW3): row → .news-cards-item > .news-card with the
 * picture wrapped in a generated link that repeats the title's href (card-as-link, EW6), the h3
 * kept, the sublines moved into .news-card-text (flex: 1 → bottom-anchored "Read more"),
 * the last link paragraph kept as the card's more-link. No manufactured copy.
 * Variants (cluster-listing): `download` (Media: [img] [h3, p info, p > strong > a "Download
 * file"], title unlinked → picture unlinked, the button paragraph is the more-link); `calendar`
 * source .calendar-list: [p date range] [h3 title, p place, p > strong > a]) → the first cell
 * becomes .news-card-date, title + place are grouped in .news-card-info beside the button.
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

export default function decorate(block) {
  const rows = [...block.children];
  const calendar = block.classList.contains('calendar');
  const items = rows.map((row) => {
    const cells = [...row.children];
    const pic = row.querySelector('picture, img');
    const dateCell = calendar && cells.length > 1 ? cells[0] : null;
    const body = (dateCell ? cells.slice(1) : cells)
      .find((c) => c.textContent.trim() && !c.contains(pic)) || cells[cells.length - 1];
    const item = el('div', 'news-cards-item');
    const card = el('div', 'news-card');
    if (dateCell) {
      dateCell.className = 'news-card-date';
      card.append(dateCell);
    }
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const titleLink = heading ? heading.querySelector('a[href]') : null;
    if (pic) {
      const wrap = el('div', 'news-card-image');
      const box = el('div', 'news-card-media');
      box.append(pic);
      if (titleLink) {
        const a = el('a');
        a.href = titleLink.href;
        a.setAttribute('aria-hidden', 'true');
        a.tabIndex = -1;
        a.append(box);
        wrap.append(a);
      } else wrap.append(box);
      card.append(wrap);
    }
    const content = el('div', 'news-card-content');
    if (heading) content.append(heading);
    const paras = [...body.children].filter((c) => c !== heading);
    const last = paras[paras.length - 1];
    const more = last && last.querySelector('a[href]') && last.textContent.trim() === last.querySelector('a').textContent.trim()
      ? last : null;
    const textWrap = el('div', 'news-card-text');
    paras.forEach((p) => { if (p !== more) textWrap.append(p); });
    if (calendar) {
      const info = el('div', 'news-card-info');
      if (heading) info.append(heading);
      info.append(textWrap);
      content.append(info);
    } else content.append(textWrap);
    if (more) { more.classList.add('news-cards-more'); content.append(more); }
    card.append(content);
    item.append(card);
    return item;
  });
  block.replaceChildren(...items);
}
