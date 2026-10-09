import { BRAND, SHOP, SHOP_ROOT } from './config.js';
import { decodeEntities, money, prune, slugify } from './util.js';

const abs = (u) => (u ? new URL(u, SHOP.origin).href : undefined);
const storefront = (u) => (u ? `${SHOP.storefront}${u.startsWith('/') ? '' : '/'}${u}` : undefined);

function images(raw) {
  const seen = new Set();
  return (raw.images ?? [])
    .filter((i) => i.imageType === 'GALLERY' || i.imageType === 'PRIMARY')
    .filter((i) => !/\.gif(\?|$)/i.test(i.url))
    .filter((i) => (seen.has(i.url) ? false : seen.add(i.url)))
    .slice(0, 6)
    .map((i) => ({ url: abs(i.url), label: decodeEntities(i.altText || raw.name) }));
}

function price(priceData, onRequest) {
  if (onRequest || !priceData || priceData.currencyIso !== SHOP.currency) return undefined;
  const final = money(priceData.value);
  if (!final || Number(final) <= 0) return undefined;
  const regular = money(priceData.strikedPrice);
  return prune({ final, currency: priceData.currencyIso, regular: regular && Number(regular) > Number(final) ? regular : undefined });
}

function categories(raw) {
  return (raw.categories ?? [])
    .filter((c) => !c.isVariant && typeof c.url === 'string' && c.url.startsWith('/c/'))
    .map((c) => ({
      id: `shop:${c.code}`,
      name: decodeEntities(c.name),
      kind: 'shop-category',
      url: storefront(c.url),
      position: c.sortOrder,
    }));
}

function specs(raw) {
  return (raw.classifications ?? []).map((g) => ({
    id: g.code,
    name: decodeEntities(g.name),
    features: (g.features ?? []).map((f) => ({
      name: decodeEntities(f.name),
      value: decodeEntities((f.featureValues ?? []).map((v) => v.value).join(', ')),
      unit: f.featureUnit?.symbol || undefined,
    })),
  }));
}

function variants(raw, parentImages, onRequest) {
  return (raw.variantOptions ?? []).map((v) => {
    const options = (v.variantValueCategories ?? []).map((c) => ({
      id: c.parentCategoryCode, value: decodeEntities(c.name),
    }));
    return prune({
      sku: v.code,
      name: [decodeEntities(raw.name), ...options.map((o) => o.value)].join(' – '),
      url: storefront(v.url),
      images: parentImages.slice(0, 1),
      price: price(v.priceData, onRequest),
      options,
      custom: { stockLevelStatus: v.stock?.stockLevelStatus },
    });
  });
}

export function mapShopProduct(raw) {
  const onRequest = raw.priceOnRequest === true;
  const imgs = images(raw);
  return prune({
    sku: raw.code,
    name: decodeEntities(raw.name),
    path: `${SHOP_ROOT}/${slugify(raw.code)}`,
    locale: 'en-GB',
    country: 'gb',
    brand: BRAND,
    description: decodeEntities(raw.description),
    metaDescription: decodeEntities(raw.summary),
    images: imgs,
    price: price(raw.price, onRequest),
    variants: variants(raw, imgs, onRequest),
    custom: {
      catalogueKind: 'shop',
      categories: categories(raw),
      pricePolicy: { type: raw.price?.priceType, net: raw.price?.netto === true, onRequest },
      specs: specs(raw),
      usps: decodeEntities(raw.usps),
      applications: decodeEntities(raw.applications),
      salesCategory: raw.salesCategory,
      source: {
        system: 'linde-mh.shop/occ',
        baseSite: 'baseSite-LMH-GB-NTS',
        id: raw.code,
        url: storefront(raw.url),
      },
    },
  });
}
