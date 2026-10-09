import { BRAND, FINDER, MODELS_ROOT } from './config.js';
import {
  decodeEntities, first, parseMeasure, prune, slugify,
} from './util.js';

const range = (min, max) => (Number.isFinite(min) || Number.isFinite(max)
  ? { min: Number.isFinite(min) ? min : max, max: Number.isFinite(max) ? max : min }
  : undefined);

export function detailUrl(raw) {
  const rel = first(raw.detailPageUrl_keyword) ?? first(raw.detailPageUrl_facet_string);
  if (!rel) return undefined;
  // finder links are '../Products/…' relative to /en/Productfinder/; resolve under the locale root
  return new URL(rel.replace(/^(\.\.\/)+/, ''), `${FINDER.origin}${FINDER.locale}`).href;
}

export function modelSlug(raw) {
  const url = detailUrl(raw);
  const seg = url ? new URL(url).pathname.split('/').filter(Boolean).pop() : undefined;
  return slugify(seg || first(raw.identifier_keyword));
}

function application(s) {
  const m = String(s).match(/^(\d+)_(.*)$/);
  return m ? { id: m[1], name: decodeEntities(m[2]) } : { id: slugify(s), name: decodeEntities(s) };
}

export function mapModel(raw) {
  const sku = first(raw.identifier_keyword);
  const name = decodeEntities(first(raw.productName_keyword) ?? first(raw.title_facet_string));
  const typeId = first(raw.productTypeId);
  const typeName = decodeEntities(first(raw.productType_keyword) ?? first(raw.productTypeLabel));
  const image = first(raw.productImageName_keyword);
  const capacityKg = range(raw.capacity_min_long, raw.capacity_max_long);
  const liftHeightMm = range(raw.liftHeight_min_long, raw.liftHeight_max_long);
  const path = `${MODELS_ROOT}/${modelSlug(raw)}`;
  const facts = [
    typeName,
    capacityKg && `load capacity ${capacityKg.min === capacityKg.max ? capacityKg.max : `${capacityKg.min}–${capacityKg.max}`} kg`,
    liftHeightMm && `lift height up to ${liftHeightMm.max} mm`,
  ].filter(Boolean);
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    sku,
    name,
    brand: { '@type': 'Brand', name: BRAND },
    category: typeName,
    ...(image ? { image } : {}),
  };
  return prune({
    sku,
    name,
    path,
    locale: 'en',
    brand: BRAND,
    productType: typeName,
    metaDescription: `Linde ${name}: ${facts.join(', ')}.`,
    images: image ? [{ url: image, label: name }] : [],
    jsonld: JSON.stringify(jsonld),
    custom: {
      catalogueKind: 'model',
      productType: { id: typeId, name: typeName },
      categories: [{ id: `model:${typeId}`, name: typeName, kind: 'model-type' }],
      capacityKg,
      liftHeightMm,
      pickingHeightMm: parseMeasure(first(raw.pickingHeight_keyword)),
      driveTypes: (raw.driveType_keyword ?? []).map(decodeEntities),
      applications: (raw.applications_keyword ?? []).map(application),
      features: (raw.feature_keyword ?? []).map(decodeEntities),
      explosionProof: first(raw.explosionProof) === 'true',
      specs: {
        serviceWeight: first(raw.serviceWeight),
        width: first(raw.dimensions_width),
        length: first(raw.dimensions_length),
      },
      sortWeight: raw.customOrderWeight_long,
      source: {
        system: 'linde-mh.com/productfinder',
        id: sku,
        productGroupId: raw.productGroupId_long,
        detailUrl: detailUrl(raw),
        url: detailUrl(raw),
      },
    },
  });
}
