/*
 * product-collection — an ordered card grid from SKU references (one SKU per row, authored order
 * kept). Unknown SKUs are skipped on the published site (console warning) and shown as a dashed
 * placeholder on .page / localhost.
 */
import { loadCSS } from '../../scripts/aem.js';
import {
  CARD_STYLES, loadIndex, findBySku, parseReference, placeholderItem, populate, renderNotice,
  renderProductCard, rowTexts,
} from '../../scripts/catalog.js';

export default function decorate(block) {
  const refs = rowTexts(block).filter(Boolean).map((text) => ({ text, ref: parseReference(text) }));
  block.textContent = '';
  if (!refs.length) {
    renderNotice(block, 'Unknown product: (empty collection)');
    return;
  }
  loadCSS(`${window.hlx.codeBasePath}${CARD_STYLES}`);
  populate(block, async () => {
    const { rows } = await loadIndex();
    const grid = document.createElement('ul');
    grid.className = 'product-grid';
    let found = 0;
    refs.forEach(({ text, ref }) => {
      const row = ref && ref.type === 'sku' ? findBySku(rows, ref.id) : undefined;
      const item = row ? renderProductCard(row) : placeholderItem(`Unknown product: ${text}`);
      if (row) found += 1;
      if (!item) return;
      const li = document.createElement('li');
      li.append(item);
      grid.append(li);
    });
    if (!found && !grid.childElementCount) {
      renderNotice(block, `Unknown product: ${refs.map((r) => r.text).join(', ')}`);
      return;
    }
    block.append(grid);
  });
}
