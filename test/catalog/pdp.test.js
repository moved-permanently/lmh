/* eslint-disable max-len -- test data and expectations read better on one line */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  isCatalogPage,
  splitBullets,
  humanizeKey,
  pdpModel,
  pdpBreadcrumb,
} from '../../blocks/product-detail/pdp-model.js';

const load = (f) => JSON.parse(readFileSync(new URL(`../fixtures/catalog/${f}.json`, import.meta.url)));
const BASE = 'https://catalog-blocks--lmh--moved-permanently.aem.network';
const QUOTE = '/en/forms/global-contact-form';

describe('product pages', () => {
  test('Product Bus product paths only (not the index, folders or media)', () => {
    assert.equal(isCatalogPage('/en/catalog/models/e10'), true);
    assert.equal(isCatalogPage('/en/catalog/shop/ln-t14b-gb'), true);
    assert.equal(isCatalogPage('/en/catalog/index.json'), false);
    assert.equal(isCatalogPage('/en/catalog/models/'), false);
    assert.equal(isCatalogPage('/en/catalog/models/media_ab12.png'), false);
    assert.equal(isCatalogPage('/en/catalog/models/e10.json'), false);
    assert.equal(isCatalogPage('/en/products/pallet-trucks'), false);
  });

  test('bullets: "*"-separated source text becomes a list, the first line of each item only', () => {
    assert.deepEqual(splitBullets('* a *b* c'), ['a', 'b', 'c']);
    assert.deepEqual(splitBullets('* Compact truck.\nIndoor use\n* Rated 1.4 t'), ['Compact truck.', 'Rated 1.4 t']);
    assert.deepEqual(splitBullets('1400'), ['1400']);
    assert.deepEqual(splitBullets(''), []);
    assert.deepEqual(splitBullets(null), []);
  });

  test('spec keys read as labels', () => {
    assert.equal(humanizeKey('serviceWeight'), 'Service weight');
    assert.equal(humanizeKey('width'), 'Width');
    assert.equal(humanizeKey('liftHeightMm'), 'Lift height mm');
  });
});

describe('model PDP (E10)', () => {
  const m = () => pdpModel(load('models-e10'), BASE);

  test('identity, product type, description from the meta description', () => {
    assert.equal(m().kind, 'model');
    assert.equal(m().sku, 'p_e10_8917-01');
    assert.equal(m().name, 'E10');
    assert.equal(m().eyebrow, 'Electric Forklifts');
    assert.match(m().description, /^Linde E10: Electric Forklifts/);
  });

  test('key facts in en-GB units', () => {
    assert.deepEqual(m().facts, [
      { key: 'loadcapacity', label: 'Load capacity', value: '1,000 kg' },
      { key: 'height', label: 'Lift height', value: '5,400 mm' },
      { key: 'drivetype', label: 'Drive', value: 'Battery, Li-Ion' },
      { key: 'application', label: 'Applications', value: 'Narrow Aisle, Double Deck' },
    ]);
  });

  test('features list and one technical data table from the spec object', () => {
    assert.equal(m().highlights.title, 'Features');
    assert.equal(m().highlights.items.length, 8);
    assert.deepEqual(m().specGroups, [{
      title: 'Technical data',
      rows: [
        { label: 'Service weight', value: ['2198 - 2238 kg'] },
        { label: 'Width', value: ['828 (mm)'] },
        { label: 'Length', value: ['2604 (mm)'] },
      ],
    }]);
  });

  test('no price, no variants; Request a quote + Original product page', () => {
    assert.equal(m().price, null);
    assert.deepEqual(m().variants, []);
    assert.deepEqual(m().ctas, [
      {
        label: 'Request a quote', href: QUOTE, primary: true, external: false,
      },
      {
        label: 'Original product page', href: 'https://www.linde-mh.com/en/Products/E-Trucks/E10/', primary: false, external: true,
      },
    ]);
  });

  test('picking height and explosion protection when present', () => {
    const n = pdpModel(load('models-n20-n25'), BASE);
    assert.ok(n.facts.find((f) => f.label === 'Picking height' && f.value === '2,800 mm'));
    assert.equal(n.facts.some((f) => f.key === 'explosionproof'), false);
    const ex = pdpModel({ ...load('models-e10'), custom: { ...load('models-e10').custom, explosionProof: true } }, BASE);
    assert.ok(ex.facts.find((f) => f.key === 'explosionproof' && f.value === 'Yes'));
  });

  test('breadcrumb: Products › Product Finder › model', () => {
    assert.deepEqual(pdpBreadcrumb(m()), [
      { label: 'Products', href: '/en/products' },
      { label: 'Product Finder', href: '/en/products/productfinder' },
      { label: 'E10' },
    ]);
  });
});

describe('shop PDP (LN-T14B-GB)', () => {
  const s = () => pdpModel(load('shop-ln-t14b-gb'), BASE);

  test('identity, shop category eyebrow, description', () => {
    assert.equal(s().kind, 'shop');
    assert.equal(s().eyebrow, 'Electric Pallet Trucks');
    assert.match(s().description, /^The T14B electric low lift pallet truck/);
    assert.equal(s().images.length, 6);
  });

  test('price line per the price rules (GBP, from, excl. VAT, struck regular)', () => {
    assert.equal(s().price.text, 'from £1,950.00 excl. VAT');
    assert.equal(s().price.regular, '£2,100.00');
  });

  test('highlights from the USPs (tag lines dropped), spec groups as tables', () => {
    assert.equal(s().highlights.title, 'Highlights');
    assert.equal(s().highlights.items[0], 'Compact electric pallet truck for light to medium-duty indoor applications.');
    assert.equal(s().highlights.items.includes('Indoor use'), false);
    assert.deepEqual(s().specGroups.map((g) => g.title), ['Advantages', 'Technical Details']);
    const handling = s().specGroups[0].rows.find((r) => r.label === 'Handling');
    assert.equal(handling.value[0], 'Powerful power delivery thanks to energy-efficient electric motor');
    assert.equal(handling.value[1], 'Travelling speed up to 5 km/h');
    assert.deepEqual(s().specGroups[1].rows.find((r) => r.label === 'Load Capacity').value, ['1400']);
  });

  test('variants: option values and price, never stock', () => {
    assert.equal(s().variants.length, 4);
    assert.deepEqual(s().variants[0], {
      sku: 'LN-T14B-GB-001', name: 'T14 B Electric Pallet Truck (1400kg) – 560mm x 1000mm', options: '560mm x 1000mm', price: 'from £1,950.00 excl. VAT',
    });
    assert.equal(/stock/i.test(JSON.stringify(s())), false);
  });

  test('Request a quote + Buy in the Linde Shop', () => {
    assert.deepEqual(s().ctas, [
      {
        label: 'Request a quote', href: QUOTE, primary: true, external: false,
      },
      {
        label: 'Buy in the Linde Shop', href: 'https://www.linde-mh.shop/en-gb/p/t14b/LN-T14B-GB', primary: false, external: true,
      },
    ]);
  });

  test('breadcrumb: Products › product', () => {
    assert.deepEqual(pdpBreadcrumb(s()), [{ label: 'Products', href: '/en/products' }, { label: 'T14 B Electric Pallet Truck (1400kg)' }]);
  });
});

describe('price on request and images', () => {
  test('LN-M20: Price on request for the product and its variants', () => {
    const p = pdpModel(load('shop-ln-m20'), BASE);
    assert.deepEqual(p.price, { onRequest: true, text: 'Price on request' });
    assert.equal(p.variants[0].price, 'Price on request');
    assert.equal(p.variants[0].options, '540mm x 1000mm · Single Nylon · Nylon');
  });

  test('relative Product Bus media resolve against origin + product path', () => {
    const p = pdpModel({
      sku: 'x', name: 'X', path: '/en/catalog/models/a', images: [{ url: './media_ab.png', label: 'A' }], custom: { catalogueKind: 'model' },
    }, BASE);
    assert.deepEqual(p.images, [{ src: `${BASE}/en/catalog/models/media_ab.png`, alt: 'A' }]);
  });
});
