/*
 * category-reference — the members of a typed category as a card grid.
 * Authored: one cell holding the id (`model:2375`, `shop:low_lift_pallet_trucks`). Members and
 * their order come from the Product Bus index (models by sortWeight, shop items by name). The
 * heading is the category name unless the author put a heading right above the block.
 */
import { loadCSS } from '../../scripts/aem.js';
import {
  CARD_STYLES, getByCategory, parseReference, populate, renderNotice, renderProductCard, rowTexts,
} from '../../scripts/catalog.js';

/** true when the default content right before the block wrapper ends in a heading */
function authoredHeading(block) {
  const prev = block.parentElement && block.parentElement.previousElementSibling;
  const last = prev && prev.lastElementChild;
  return Boolean(last && /^H[1-6]$/.test(last.tagName));
}

export default function decorate(block) {
  const [text = ''] = rowTexts(block);
  const ref = parseReference(text);
  block.textContent = '';
  if (!ref || ref.type !== 'category') {
    renderNotice(block, `Unknown category: ${text || '(empty)'}`);
    return;
  }
  loadCSS(`${window.hlx.codeBasePath}${CARD_STYLES}`);
  const ownHeading = !authoredHeading(block);
  populate(block, async () => {
    const result = await getByCategory(ref.id);
    if (!result || !result.items.length) {
      renderNotice(block, `Unknown category: ${ref.id}`);
      return;
    }
    if (ownHeading) {
      const h = document.createElement('h2');
      h.className = 'category-reference-title';
      h.textContent = result.category.name;
      block.append(h);
    }
    const grid = document.createElement('ul');
    grid.className = 'product-grid';
    result.items.forEach((row) => {
      const li = document.createElement('li');
      li.append(renderProductCard(row, { headingLevel: 3 }));
      grid.append(li);
    });
    block.append(grid);
  });
}
