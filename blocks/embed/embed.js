/**
 * embed — a source page-level <iframe> (Landingpage/Compact-class-with-electric-drive embeds its
 * own media page https://www.linde-mh.com/media/Global-Content/Linde-Warehouse-POV-E16_Xi16/ at
 * width 100 % × height 600 between two content bands). Authored as one cell carrying the frame URL
 * as a link (node-slotting, EW1–EW3); delivered as the same frame, lazy, same size at every width.
 * @param {Element} block
 */
export default function decorate(block) {
  const link = block.querySelector('a[href]');
  const src = link ? link.href : block.textContent.trim();
  if (!src) return;
  const frame = document.createElement('iframe');
  frame.src = src;
  frame.loading = 'lazy';
  frame.setAttribute('allowfullscreen', '');
  frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  frame.title = (link && link.title) || 'Embedded content';
  block.replaceChildren(frame);
}
