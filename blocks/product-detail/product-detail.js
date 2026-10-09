/*
 * product-detail — the LMH product page for Product Bus entries (/en/catalog/models/<slug>,
 * /en/catalog/shop/<code>). scripts.js turns the pipeline markup into this block:
 *   row 1: the h1 · row 2: the pipeline's optimised pictures · row 3: the description paragraphs
 * The block paints that at once (LCP: h1 + first picture), then reads {path}.json (same origin)
 * for product type, key facts, price line, CTAs, highlights, spec tables and variants
 * (pdp-model.js). Prices follow the catalogue price rules; stock is never shown.
 */
import { catalogSources, getProduct } from '../../scripts/catalog.js';
import { QUOTE_URL, pdpModel } from './pdp-model.js';

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

function icon(key) {
  const i = el('i', `icon pd-icon-${key}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function link(cta) {
  const a = el('a', `pd-cta${cta.primary ? ' pd-cta-primary' : ''}`, cta.label);
  a.href = cta.href;
  if (cta.external) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  return a;
}

/* ---------------------------------------------------------------- gallery */

function gallery(pictures) {
  const box = el('div', 'pd-gallery');
  const stage = el('div', 'pd-stage');
  box.append(stage);
  if (!pictures.length) return box;
  const show = (i) => {
    stage.textContent = '';
    const pic = pictures[i].cloneNode(true);
    const img = pic.querySelector('img');
    if (img && i === 0) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
    stage.append(pic);
    box.querySelectorAll('.pd-thumb').forEach((t, n) => t.setAttribute('aria-pressed', n === i ? 'true' : 'false'));
  };
  if (pictures.length > 1) {
    const thumbs = el('div', 'pd-thumbs');
    thumbs.setAttribute('role', 'group');
    thumbs.setAttribute('aria-label', 'Product images');
    pictures.forEach((pic, i) => {
      const b = el('button', 'pd-thumb');
      b.type = 'button';
      b.setAttribute('aria-label', `Image ${i + 1} of ${pictures.length}`);
      const t = pic.cloneNode(true);
      t.querySelectorAll('source').forEach((s) => s.remove());
      const img = t.querySelector('img');
      if (img) {
        img.loading = 'lazy';
        img.alt = '';
      }
      b.append(t);
      b.addEventListener('click', () => show(i));
      thumbs.append(b);
    });
    box.append(thumbs);
  }
  show(0);
  return box;
}

/** pictures for JSON-only images (no pipeline markup) */
function imagePictures(images) {
  return images.map((im) => {
    const pic = el('picture');
    const img = el('img');
    img.src = im.src;
    img.alt = im.alt || '';
    pic.append(img);
    return pic;
  });
}

/* ---------------------------------------------------------------- page sections */

function section(id, title, ...content) {
  const s = el('section', 'pd-section');
  s.id = id;
  s.append(el('h2', 'pd-section-title', title), ...content);
  return s;
}

function valueCell(value) {
  const td = el('td');
  if (value.length > 1) {
    const ul = el('ul', 'pd-bullets');
    value.forEach((v) => ul.append(el('li', '', v)));
    td.append(ul);
  } else td.textContent = value[0] || '';
  return td;
}

function specTable(group) {
  const table = el('table', 'pd-specs');
  const body = el('tbody');
  group.rows.forEach((r) => {
    const tr = el('tr');
    tr.append(el('th', '', r.label), valueCell(r.value));
    body.append(tr);
  });
  table.append(body);
  return table;
}

function variantsTable(variants) {
  const table = el('table', 'pd-specs pd-variants');
  const head = el('thead');
  const hr = el('tr');
  ['Variant', 'SKU', 'Price'].forEach((t) => { const th = el('th', '', t); th.scope = 'col'; hr.append(th); });
  head.append(hr);
  const body = el('tbody');
  variants.forEach((v) => {
    const tr = el('tr');
    const name = el('th', '', v.options || v.name);
    name.scope = 'row';
    tr.append(name, el('td', 'pd-sku', v.sku), el('td', '', v.price || ''));
    body.append(tr);
  });
  table.append(head, body);
  return table;
}

function priceLine(price) {
  const p = el('p', `pd-price${price.onRequest ? ' pd-price-on-request' : ''}`);
  if (price.onRequest) {
    p.textContent = price.text;
    return p;
  }
  if (price.prefix) p.append(el('span', 'pd-price-prefix', price.prefix.trim()), ' ');
  p.append(el('strong', 'pd-price-amount', price.amount));
  if (price.suffix) p.append(' ', el('span', 'pd-price-suffix', price.suffix));
  if (price.regular) {
    const s = el('s', 'pd-price-regular', price.regular);
    s.setAttribute('aria-label', `was ${price.regular}`);
    p.append(' ', s);
  }
  return p;
}

/* ---------------------------------------------------------------- decorate */

export default function decorate(block) {
  const cells = [...block.children].map((row) => row.firstElementChild || row);
  const h1 = (cells[0] && cells[0].querySelector('h1')) || el('h1', '', document.title);
  const pictures = cells[1] ? [...cells[1].querySelectorAll('picture')] : [];
  const descNodes = cells[2] ? [...cells[2].children].filter((n) => n.textContent.trim()) : [];
  block.textContent = '';

  // hero band: info (eyebrow, name, price, CTAs) · gallery · key facts
  const hero = el('div', 'pd-hero');
  const info = el('div', 'pd-info');
  const eyebrow = el('p', 'pd-eyebrow');
  const ctas = el('div', 'pd-ctas');
  ctas.append(link({ label: 'Request a quote', href: QUOTE_URL, primary: true }));
  info.append(eyebrow, h1, ctas);
  const facts = el('ul', 'pd-facts');
  hero.append(info, gallery(pictures), facts);

  const anchors = el('nav', 'pd-anchors');
  anchors.setAttribute('aria-label', 'On this page');
  const body = el('div', 'pd-body');
  block.append(hero, anchors, body);

  const render = (m) => {
    if (m.eyebrow) {
      eyebrow.textContent = '';
      eyebrow.append(el('span', 'pd-type', m.eyebrow));
      // models read "Type › Name" like the source hero; shop names are long, the h1 is enough
      if (m.kind === 'model') eyebrow.append(icon('right'), el('span', 'pd-eyebrow-name', m.name));
    }
    hero.classList.toggle('pd-hero-no-facts', !m.facts.length);
    if (m.price) info.insertBefore(priceLine(m.price), ctas);
    ctas.textContent = '';
    m.ctas.forEach((c) => ctas.append(link(c)));
    m.facts.forEach((f) => {
      const li = el('li', `pd-fact pd-fact-${f.key}`);
      li.append(icon(f.key), el('span', 'pd-fact-label', f.label), el('span', 'pd-fact-value', f.value));
      facts.append(li);
    });
    if (!pictures.length && m.images.length) {
      hero.replaceChild(gallery(imagePictures(m.images)), hero.children[1]);
    }

    const sections = [];
    const text = el('div', 'pd-text');
    if (descNodes.length) text.append(...descNodes);
    else if (m.description) text.append(el('p', '', m.description));
    if (text.childElementCount) sections.push(section('overview', 'Overview', text));
    if (m.highlights) {
      const ul = el('ul', 'pd-bullets pd-highlights');
      m.highlights.items.forEach((t) => ul.append(el('li', '', t)));
      sections.push(section('highlights', m.highlights.title, ul));
    }
    if (m.specGroups.length) {
      const wrap = el('div', 'pd-spec-groups');
      m.specGroups.forEach((g) => {
        const box = el('div', 'pd-spec-group');
        if (m.specGroups.length > 1) box.append(el('h3', 'pd-spec-title', g.title));
        box.append(specTable(g));
        wrap.append(box);
      });
      sections.push(section('technical-data', m.specGroups.length > 1 ? 'Details' : m.specGroups[0].title, wrap));
    }
    if (m.variants.length) sections.push(section('variants', `Variants (${m.variants.length})`, variantsTable(m.variants)));
    const closing = el('section', 'pd-closing');
    closing.append(el('p', 'pd-closing-text', `Interested in the ${m.name}?`), link({ label: 'Request a quote', href: QUOTE_URL, primary: true }));
    sections.forEach((s) => {
      body.append(s);
      const a = el('a', '', s.querySelector('h2').textContent);
      a.href = `#${s.id}`;
      anchors.append(a);
    });
    body.append(closing);
  };

  getProduct(window.location.pathname)
    .then((product) => render(pdpModel(product, catalogSources().imageBase)))
    .catch((e) => {
      // the pipeline markup still shows (name, images, description) with the quote CTA
      // eslint-disable-next-line no-console
      console.warn('[catalog] product data unavailable', e.message);
      render({
        name: h1.textContent,
        eyebrow: '',
        facts: [],
        ctas: [{ label: 'Request a quote', href: QUOTE_URL, primary: true }],
        price: null,
        images: [],
        highlights: null,
        specGroups: [],
        variants: [],
        description: '',
      });
    });
}
