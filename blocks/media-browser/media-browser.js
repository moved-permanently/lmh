/**
 * media-browser — the source's two "browser" modules.
 * Schema: stardust/eds-schema/en-landingpage-e-models.json (media-browser ×1, content ×3).
 * Default (source .media-browser): one picture per row → large 16:9 viewer + 200px thumbnail rail
 *   (≥ 1024; counter + arrows below). A video slide's row adds the player link (<p><a href>) after
 *   the picture: it becomes data-video-url + the play glyphs, never a rendered link. The authored
 *   pictures live in the viewer; the rail holds presentational clones (EW4, alt "").
 * Variant `content` (source .content-browser): one row per item [picture?] [h3, p…, link p] →
 *   list of titles (left) + the active item's panel (right, ≥ 640). The list labels are
 *   presentational copies of the authored titles (EW4; the editable h3 stays in the panel).
 * Reconstructive decode, node-slotting (EW1–EW3).
 * @param {Element} block
 */
function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function iconButton(name, label) {
  const b = el('button', `media-browser-btn media-browser-btn-${name}`);
  b.type = 'button';
  b.setAttribute('aria-label', label);
  const i = el('span', `icon media-browser-glyph-${name}`);
  i.setAttribute('aria-hidden', 'true');
  b.append(i);
  return b;
}

function stripInstrumentation(node) {
  node.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  node.removeAttribute('data-prose-index');
  return node;
}

function decorateContent(block) {
  const list = el('ul', 'media-browser-list');
  const panels = el('div', 'media-browser-panels');
  const entries = [];
  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const pic = row.querySelector('picture, img');
    const body = cells.find((c) => c.textContent.trim()) || cells[cells.length - 1];
    const heading = body ? body.querySelector('h1, h2, h3, h4') : null;
    const li = el('li');
    // live: a[href="#itemlink"] per item — a link, so the content inventory sees the same links
    const btn = el('a', 'media-browser-tab');
    btn.href = '#itemlink';
    btn.textContent = heading ? heading.textContent : '';
    const arrow = el('span', 'icon media-browser-tab-icon');
    arrow.setAttribute('aria-hidden', 'true');
    btn.append(arrow);
    li.append(btn);
    const panel = el('div', 'media-browser-panel');
    if (pic) {
      const fig = el('div', 'media-browser-figure');
      fig.append(pic.closest('picture') || pic);
      panel.append(fig);
    }
    if (body) while (body.firstChild) panel.append(body.firstChild);
    if (i === 0) {
      li.classList.add('active');
      panel.classList.add('active');
    }
    entries.push({ li, panel });
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      entries.forEach((e) => {
        e.li.classList.toggle('active', e.li === li);
        e.panel.classList.toggle('active', e.panel === panel);
      });
    });
    list.append(li);
    panels.append(panel);
  });
  const listWrap = el('div', 'media-browser-list-wrap');
  listWrap.append(list);
  block.replaceChildren(listWrap, panels);
}

function decorateGallery(block) {
  const master = el('div', 'media-browser-master');
  const nav = el('div', 'media-browser-nav');
  const items = [];
  [...block.children].forEach((row) => {
    const pic = row.querySelector('picture, img');
    if (!pic) return;
    const item = el('div', 'media-browser-item');
    const fig = el('div', 'media-browser-figure');
    fig.append(pic.closest('picture') || pic);
    // a video slide is authored as the picture plus the player link (source
    // .media-player[data-video-url]); the link is carried as data and the slide shows the
    // source's play glyph on the viewer and on the rail thumb
    const link = row.querySelector('a[href]');
    if (link) {
      item.classList.add('video');
      item.dataset.videoUrl = link.href;
      const play = el('span', 'icon media-browser-play');
      play.setAttribute('aria-hidden', 'true');
      fig.append(play);
    }
    item.append(fig);
    const thumb = stripInstrumentation(item.cloneNode(true));
    thumb.querySelectorAll('img').forEach((img) => { img.alt = ''; img.loading = 'lazy'; });
    items.push({ item, thumb });
    master.append(item);
    nav.append(thumb);
  });
  const controls = el('div', 'media-browser-controls');
  const counter = el('span', 'media-browser-counter');
  const next = iconButton('right', 'Next image');
  const prev = iconButton('left', 'Previous image');
  controls.append(counter, next, prev);
  let current = 0;
  const show = (n) => {
    current = (n + items.length) % items.length;
    items.forEach((it, i) => {
      it.item.classList.toggle('active', i === current);
      it.thumb.classList.toggle('active', i === current);
    });
    counter.textContent = `${current + 1} / ${items.length}`;
    prev.disabled = current === 0;
    next.disabled = current === items.length - 1;
  };
  items.forEach((it, i) => it.thumb.addEventListener('click', () => show(i)));
  next.addEventListener('click', () => show(current + 1));
  prev.addEventListener('click', () => show(current - 1));
  const masterWrap = el('div', 'media-browser-master-wrap');
  masterWrap.append(master, controls);
  block.replaceChildren(masterWrap, nav);
  if (items.length) show(0);
}

export default function decorate(block) {
  if (block.classList.contains('content')) decorateContent(block);
  else decorateGallery(block);
}
