/** Fixed destination: the importer refuses to write anywhere else. */
export const DESTINATION = Object.freeze({ org: 'moved-permanently', site: 'lmh' });
export const API_BASE = 'https://api.adobecommerce.live';
export const MODELS_ROOT = '/en/catalog/models';
export const SHOP_ROOT = '/en/catalog/shop';
export const CATALOG_ROOTS = [MODELS_ROOT, SHOP_ROOT];
export const BRAND = 'Linde Material Handling';

export const FINDER = Object.freeze({
  endpoint: 'https://www.linde-mh.com/lmhnewproductsearch_cloud/execute',
  origin: 'https://www.linde-mh.com',
  locale: '/en/',
  // English (gb) new-truck model groups, exactly what the /en/ product finder shows
  fq: 'type_keyword_lc:(productgroup) AND (languageCountry_keyword:gb) AND (language:en) AND (projectsToOfferNew:2512) AND NOT(thirdParty:true)',
});

export const SHOP = Object.freeze({
  origin: 'https://www.linde-mh.shop',
  storefront: 'https://www.linde-mh.shop/en-gb',
  api: 'https://www.linde-mh.shop/rest/v2/baseSite-LMH-GB-NTS',
  currency: 'GBP',
  // bounded demo selection (see lmh-demo-plan.md, seed)
  codes: ['LN-T14B-GB', 'LN-MT15-C', 'LN-T16', 'LN-M20', 'LN-M25', 'LN-M303000HDHPT', 'LN-ML10', 'LN-MM10'],
});

/** Index columns: source field -> column (helix-product-indexer productIndexerConfig.properties). */
export const INDEX_PROPERTIES = Object.freeze({
  name: 'name',
  path: 'path',
  image: 'images[0].url',
  imageAlt: 'images[0].label',
  price: 'price.final',
  regularPrice: 'price.regular',
  currency: 'price.currency',
  description: 'metaDescription',
  kind: 'custom.catalogueKind',
  categories: 'custom.categories',
  productType: 'custom.productType',
  capacityKg: 'custom.capacityKg',
  liftHeightMm: 'custom.liftHeightMm',
  pickingHeightMm: 'custom.pickingHeightMm',
  driveTypes: 'custom.driveTypes',
  applications: 'custom.applications',
  explosionProof: 'custom.explosionProof',
  sortWeight: 'custom.sortWeight',
  pricePolicy: 'custom.pricePolicy',
  sourceUrl: 'custom.source.url',
});
