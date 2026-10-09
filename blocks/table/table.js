/*
 * table — the EDS block-collection table: every block row becomes a <tr>; with the `header`
 * variant the first row is a <thead> of <th> cells (source: the CCM19 cookie-declaration tables on
 * /en/legal-notes/cookie-policy: <thead> Name, Lifetime, Description; one <tbody> row per cookie).
 * Authors omit and add cells: a short row is padded, cells keep their rich content.
 */
export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = block.classList.contains('header');
  if (header) table.append(thead);
  table.append(tbody);

  const rows = [...block.children];
  const cols = rows.reduce((n, row) => Math.max(n, row.children.length), 0);
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const isHead = header && i === 0;
    const cells = [...row.children];
    for (let c = 0; c < cols; c += 1) {
      const cell = document.createElement(isHead ? 'th' : 'td');
      if (isHead) cell.setAttribute('scope', 'col');
      const src = cells[c];
      if (src) {
        // a single paragraph unwraps into the cell; anything richer keeps its elements
        if (src.children.length === 1 && src.firstElementChild.tagName === 'P') {
          cell.append(...src.firstElementChild.childNodes);
        } else {
          cell.append(...src.childNodes);
        }
      }
      tr.append(cell);
    }
    (isHead ? thead : tbody).append(tr);
  });
  block.replaceChildren(table);
}
