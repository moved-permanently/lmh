/*
 * product-collection — an ordered set of products from SKU references (one SKU per row, authored
 * order kept). Default: the card grid (styles/product-card.css). Variant `carousel`: the
 * teaser-carousel presentation ("This may also interest you" band) — the teasers are built from
 * catalogue data and handed to the teaser-carousel block, so its look and slider behaviour are
 * reused as is. Unknown SKUs are skipped on the published site (console warning) and shown as a
 * dashed placeholder on localhost.
 */
import {
  buildBlock, decorateBlock, loadBlock, loadCSS,
} from '../../scripts/aem.js';
import {
  CARD_STYLES, catalogSources, loadIndex, placeholderItem, populate, renderNotice,
  renderProductCard, rowTexts,
} from '../../scripts/catalog.js';
import { collectionLayout, resolveCollection, teaserItems } from './collection-model.js';

function teaserRow(t) {
  const picture = document.createElement('picture');
  if (t.image) {
    const img = document.createElement('img');
    img.src = t.image;
    img.alt = t.alt;
    img.loading = 'lazy';
    picture.append(img);
  }
  const body = document.createElement('div');
  const h3 = document.createElement('h3');
  const a = document.createElement('a');
  a.href = t.href;
  a.textContent = t.name;
  h3.append(a);
  body.append(h3);
  [t.text, t.price].filter(Boolean).forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    body.append(p);
  });
  const more = document.createElement('p');
  const ma = document.createElement('a');
  ma.href = t.href;
  ma.textContent = t.more;
  more.append(ma);
  body.append(more);
  return [picture, body];
}

async function renderCarousel(block, found) {
  const teasers = teaserItems(found, catalogSources().imageBase);
  const carousel = buildBlock('teaser-carousel', teasers.map(teaserRow));
  const wrapper = document.createElement('div');
  wrapper.append(carousel);
  block.append(wrapper);
  decorateBlock(carousel);
  await loadBlock(carousel);
}

function renderGrid(block, entries) {
  const grid = document.createElement('ul');
  grid.className = 'product-grid';
  entries.forEach(({ id, row }) => {
    const item = row ? renderProductCard(row) : placeholderItem(`Unknown product: ${id}`);
    if (!item) return;
    const li = document.createElement('li');
    li.append(item);
    grid.append(li);
  });
  block.append(grid);
}

export default function decorate(block) {
  const texts = rowTexts(block).filter(Boolean);
  const layout = collectionLayout(block.classList);
  block.textContent = '';
  if (!texts.length) {
    renderNotice(block, 'Unknown product: (empty collection)');
    return;
  }
  loadCSS(`${window.hlx.codeBasePath}${CARD_STYLES}`);
  populate(block, async () => {
    const { rows } = await loadIndex();
    const { entries, found, unknown } = resolveCollection(rows, texts);
    if (!found.length) {
      renderNotice(block, `Unknown product: ${unknown.join(', ')}`);
      return;
    }
    if (layout === 'carousel') {
      // eslint-disable-next-line no-console
      unknown.forEach((id) => console.warn(`[catalog] Unknown product: ${id}`));
      await renderCarousel(block, found);
    } else renderGrid(block, entries);
  });
}
