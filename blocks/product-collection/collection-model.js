/*
 * product-collection data model — pure functions (covered by test/catalog/collection.test.js):
 * resolve the authored SKUs in their order, pick the layout, and build the carousel teasers
 * from catalogue data only (name, image, PDP link, description, shop price line).
 */
import {
  cardModel, findBySku, formatPrice, parseReference,
} from '../../scripts/catalog.js';

/** `carousel` variant = the teaser-carousel presentation, otherwise the card grid */
export function collectionLayout(classes) {
  return [...(classes || [])].includes('carousel') ? 'carousel' : 'grid';
}

/**
 * The authored SKUs resolved against the index, in authored order.
 * @param {object[]} rows normalised index rows
 * @param {string[]} texts first-cell text of each authored row
 * @returns {{entries: {id: string, row: object|null}[], found: object[], unknown: string[]}}
 */
export function resolveCollection(rows, texts) {
  const entries = [];
  const seen = new Set();
  (texts || []).forEach((raw) => {
    const id = String(raw ?? '').trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    const ref = parseReference(id);
    const row = ref && ref.type === 'sku' ? findBySku(rows, ref.id) || null : null;
    entries.push({ id, row });
  });
  return {
    entries,
    found: entries.filter((e) => e.row).map((e) => e.row),
    unknown: entries.filter((e) => !e.row).map((e) => e.id),
  };
}

/**
 * Carousel teasers (the teaser-carousel card: picture, linked name, text, "Learn more").
 * @param {object[]} rows resolved rows
 * @param {string} base catalogue origin for images
 */
export function teaserItems(rows, base) {
  return rows.map((row) => {
    const m = cardModel(row, base);
    const price = formatPrice(row);
    return {
      sku: m.sku,
      name: m.name,
      href: m.href,
      image: m.image,
      alt: m.alt,
      text: String(row.description || '').trim(),
      price: price ? price.text : null,
      more: 'Learn more',
    };
  });
}
