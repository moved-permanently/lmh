/*
 * product-reference — one product card from a SKU reference.
 * Authored: one row, one cell holding the SKU (e.g. `p_e10_8917-01`, `LN-T14B-GB`); variant
 * `wide` = the horizontal card. Name, image, facts, price and links come from the Product Bus.
 */
import { loadCSS } from '../../scripts/aem.js';
import {
  CARD_STYLES, getBySku, parseReference, populate, renderNotice, renderProductCard, rowTexts,
} from '../../scripts/catalog.js';

export default function decorate(block) {
  const [text = ''] = rowTexts(block);
  const ref = parseReference(text);
  block.textContent = '';
  if (!ref || ref.type !== 'sku') {
    renderNotice(block, `Unknown product: ${text || '(empty)'}`);
    return;
  }
  loadCSS(`${window.hlx.codeBasePath}${CARD_STYLES}`);
  populate(block, async () => {
    const row = await getBySku(ref.id);
    if (!row) {
      renderNotice(block, `Unknown product: ${ref.id}`);
      return;
    }
    block.append(renderProductCard(row, { wide: block.classList.contains('wide'), headingLevel: 2 }));
  });
}
