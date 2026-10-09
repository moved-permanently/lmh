/**
 * columns — two-column text | media row (source .layout-50--fixed / .layout-50-reverse--fixed).
 * Schema: stardust/eds-schema/en-landingpage-e-models.json (sections columns ×3).
 * Authoring: ONE row, cells in the desktop order (text | image or image | text); the image cell
 * holds a picture only. Below 640px the image always comes first (source column-reverse).
 * Variant `video`: the media carries the play glyph (source .media-player). Node-slotting (EW1).
 * Program-template bands (source .layout-100--flex / .layout-50--flex / .layout-40-60-reverse--flex
 * > .text-container): variant `band` (one centred text cell, full-bleed), `split` (two 50 % cells),
 * `feature` (text 40 % | 3:2 clipped media 60 %). Colour tokens `white` / `red` / `dark` colour the
 * cells in order (one token per cell) or, with a single token, every text cell. A leading
 * `<p><code>key</code></p>` in a text cell is the source's icon glyph (`.text-container > .icon`).
 * @ew-exempt text-as-metadata: the leading `<code>` paragraph (icon key) is config, not copy
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const cols = rows.flatMap((row) => [...row.children]);
  const COLOURS = ['white', 'red', 'dark'];
  const tones = [...block.classList].filter((c) => COLOURS.includes(c));
  cols.forEach((col, i) => {
    const isMedia = !!col.querySelector('picture, img') && !col.textContent.trim();
    const tone = tones.length === cols.length ? tones[i] : (!isMedia && tones[0]) || '';
    if (tone) col.classList.add(`columns-col-${tone}`);
    const code = col.querySelector(':scope > p:first-child > code:only-child, :scope > code:first-child');
    if (code) {
      const icon = document.createElement('span');
      icon.className = `icon icon-${code.textContent.trim().toLowerCase()}`;
      icon.setAttribute('aria-hidden', 'true');
      (code.closest('p') || code).replaceWith(icon);
    }
    col.classList.add('columns-col');
    const pic = col.querySelector('picture, img');
    if (pic && !col.textContent.trim()) {
      col.classList.add('columns-media-col');
      const figure = document.createElement('div');
      figure.className = 'columns-media';
      // one entry per picture: a <picture><img> pair matches twice, never two slides (EW4)
      const pics = [...new Set([...col.querySelectorAll('picture, img')].map((p) => p.closest('picture') || p))];
      if (pics.length > 1) {
        // a cell with several pictures IS the source .carousel-wrapper: the variant class follows
        // the content (authors omit it — a recorded document carried four pictures and no class)
        block.classList.add('carousel');
        // variant `carousel` (source .carousel-wrapper inside the item): one slide per picture,
        // dots switch the active slide — no motion beyond the state toggle
        figure.classList.add('columns-slides');
        const dots = document.createElement('ul');
        dots.className = 'columns-dots';
        const slides = pics.map((p, n) => {
          const slide = document.createElement('div');
          slide.className = `columns-slide${n === 0 ? ' active' : ''}`;
          slide.append(p);
          const li = document.createElement('li');
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = String(n + 1); // the source dot reads "1", "2", … (font-size 0)
          b.setAttribute('aria-label', `${n + 1} of ${pics.length}`);
          if (n === 0) li.classList.add('active');
          b.addEventListener('click', () => {
            figure.querySelectorAll('.columns-slide').forEach((s, j) => s.classList.toggle('active', j === n));
            dots.querySelectorAll('li').forEach((l, j) => l.classList.toggle('active', j === n));
          });
          li.append(b);
          dots.append(li);
          return slide;
        });
        // the source .carousel-wrapper carries the red 48px prev/next buttons (slick arrows) at
        // every width; they step the same active state as the dots (wrapping, as slick's
        // infinite default does)
        const show = (n) => {
          figure.querySelectorAll('.columns-slide').forEach((s, j) => s.classList.toggle('active', j === n));
          dots.querySelectorAll('li').forEach((l, j) => l.classList.toggle('active', j === n));
        };
        const current = () => [...figure.querySelectorAll('.columns-slide')].findIndex((s) => s.classList.contains('active'));
        const arrow = (name, glyph, label) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = `columns-carousel-btn columns-carousel-btn-${name}`;
          b.setAttribute('aria-label', label);
          const glyphEl = document.createElement('span');
          glyphEl.className = 'icon';
          glyphEl.setAttribute('aria-hidden', 'true');
          glyphEl.textContent = glyph;
          b.append(glyphEl);
          return b;
        };
        const prev = arrow('prev', '\uf13d', 'Previous');
        const next = arrow('next', '\uf153', 'Next');
        prev.addEventListener('click', () => show((current() - 1 + pics.length) % pics.length));
        next.addEventListener('click', () => show((current() + 1) % pics.length));
        figure.append(...slides, prev, next, dots);
      } else figure.append(pics[0]);
      if (block.classList.contains('video')) {
        const play = document.createElement('span');
        play.className = 'columns-play icon';
        play.setAttribute('aria-hidden', 'true');
        figure.append(play);
      }
      col.replaceChildren(figure);
    } else {
      col.classList.add('columns-text-col');
      const text = document.createElement('div');
      text.className = 'columns-text';
      while (col.firstChild) text.append(col.firstChild);
      col.append(text);
    }
  });
  block.replaceChildren(...cols);
}
