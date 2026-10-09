/**
 * infobox — the source `.infobox-text` note box (landing siblings Heavy-Duty-Forklifts,
 * Fleet-Management): ONE row, one cell holding the authored heading/paragraphs verbatim.
 * Variant `right` (source .infobox--right): 320px box aligned right from 640px.
 * Template-slotted decode, node-slotting (EW1): the authored cell is kept in place, only
 * class hooks are added. The icon-font glyph is not re-rendered (icon-dropped).
 * @param {Element} block
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (cell) cell.classList.add('infobox-body');
}
