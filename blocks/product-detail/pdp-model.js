/*
 * product-detail data model — the LMH product page built from a Product Bus entry
 * ({path}.json: name, images, description, price, variants, custom.*). Pure functions so the
 * page logic is covered by `npm test` (test/catalog/pdp.test.js).
 */
import { formatPrice } from '../../scripts/catalog.js';

export const QUOTE_URL = '/en/forms/global-contact-form';

const CATALOG_PAGE = /^\/en\/catalog\/(models|shop)\/[^/.]+$/;

/** a Product Bus product page (/en/catalog/models/<slug>, /en/catalog/shop/<code>) */
export function isCatalogPage(pathname) {
  return CATALOG_PAGE.test(String(pathname || '')) && !/\/media_[^/]*$/.test(pathname);
}

/**
 * Source text with "*" markers becomes a list (first line of each item: the shop USPs carry tag
 * lines such as "Indoor use" after a bullet); text without markers is one item.
 */
export function splitBullets(text) {
  const t = String(text ?? '').trim();
  if (!t) return [];
  if (!t.includes('*')) return [t];
  return t.split('*')
    .map((part) => part.split('\n')[0].trim())
    .filter(Boolean);
}

/** serviceWeight -> Service weight */
export function humanizeKey(key) {
  const words = String(key).replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const numberFmt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

function range(r, unit) {
  if (typeof r === 'number') return r > 0 ? `${numberFmt.format(r)} ${unit}` : null;
  if (!r || !Number.isFinite(Number(r.max)) || Number(r.max) <= 0) return null;
  const max = Number(r.max);
  const min = Number.isFinite(Number(r.min)) ? Number(r.min) : max;
  const text = min > 0 && min !== max ? `${numberFmt.format(min)} – ${numberFmt.format(max)}` : numberFmt.format(max);
  return `${text} ${unit}`;
}

function resolve(url, base, path) {
  try {
    return new URL(url, `${base}${path || '/en/catalog/'}`).href;
  } catch {
    return null;
  }
}

/** the index-row shape formatPrice() reads, from a Product Bus price object + policy */
function priceRow(kind, price, policy) {
  return {
    kind,
    price: price && price.final,
    regularPrice: price && price.regular,
    currency: price && price.currency,
    pricePolicy: policy,
  };
}

function specGroups(specs) {
  if (Array.isArray(specs)) {
    return specs
      .filter((g) => g && Array.isArray(g.features) && g.features.length)
      .map((g) => ({
        title: g.name || humanizeKey(g.id || 'Details'),
        rows: g.features.map((f) => ({ label: f.name, value: splitBullets(f.value) })),
      }));
  }
  if (specs && typeof specs === 'object') {
    const rows = Object.entries(specs)
      .filter(([, v]) => v !== null && v !== undefined && String(v).trim())
      .map(([k, v]) => ({ label: humanizeKey(k), value: [String(v).trim()] }));
    return rows.length ? [{ title: 'Technical data', rows }] : [];
  }
  return [];
}

/**
 * Everything the product page shows.
 * @param {object} product Product Bus entry ({path}.json)
 * @param {string} base catalogue origin (relative ./media_* images resolve against base + path)
 */
export function pdpModel(product, base) {
  const c = product.custom || {};
  const kind = c.catalogueKind === 'shop' ? 'shop' : 'model';
  const shopCategory = (c.categories || []).find((x) => x.id && x.id.startsWith('shop:') && x.id !== 'shop:all_products');
  const facts = [];
  if (kind === 'model') {
    const add = (key, label, value) => { if (value) facts.push({ key, label, value }); };
    add('loadcapacity', 'Load capacity', range(c.capacityKg, 'kg'));
    add('height', 'Lift height', range(c.liftHeightMm, 'mm'));
    add('height', 'Picking height', range(c.pickingHeightMm, 'mm'));
    add('drivetype', 'Drive', Array.isArray(c.driveTypes) && c.driveTypes.length ? c.driveTypes.join(', ') : null);
    add('application', 'Applications', Array.isArray(c.applications) && c.applications.length
      ? c.applications.map((a) => a.name).join(', ') : null);
    if (c.explosionProof === true) add('explosionproof', 'Explosion protection', 'Yes');
  }
  let highlights = null;
  if (Array.isArray(c.features) && c.features.length) highlights = { title: 'Features', items: c.features };
  else if (c.usps) {
    const items = splitBullets(c.usps);
    if (items.length) highlights = { title: 'Highlights', items };
  }
  const policy = c.pricePolicy;
  const source = c.source && c.source.url;
  const ctas = [{
    label: 'Request a quote', href: QUOTE_URL, primary: true, external: false,
  }];
  if (source) {
    ctas.push({
      label: kind === 'shop' ? 'Buy in the Linde Shop' : 'Original product page', href: source, primary: false, external: true,
    });
  }
  return {
    sku: product.sku,
    kind,
    name: product.name,
    eyebrow: [c.productType, product.productType, shopCategory].find((t) => t && t.name)?.name || '',
    description: String(product.description || product.metaDescription || '').trim(),
    images: (product.images || [])
      .map((i) => ({ src: resolve(i.url, base, product.path), alt: i.label || product.name }))
      .filter((i) => i.src),
    facts,
    highlights,
    specGroups: specGroups(c.specs),
    price: kind === 'shop' ? formatPrice(priceRow(kind, product.price, policy)) : null,
    variants: kind === 'shop' ? (product.variants || []).map((v) => {
      const p = formatPrice(priceRow(kind, v.price, policy));
      return {
        sku: v.sku,
        name: v.name,
        options: (v.options || []).map((o) => o.value).filter(Boolean).join(' · '),
        price: p ? p.text : null,
      };
    }) : [],
    ctas,
  };
}

/** Products › Product Finder › model, or Products › shop product */
export function pdpBreadcrumb(model) {
  const crumbs = [{ label: 'Products', href: '/en/products' }];
  if (model.kind === 'model') crumbs.push({ label: 'Product Finder', href: '/en/products/productfinder' });
  crumbs.push({ label: model.name });
  return crumbs;
}
