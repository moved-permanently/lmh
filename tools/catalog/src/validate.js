import { CATALOG_ROOTS } from './config.js';

// helix-commerce-api src/utils/validation.js PATH_PATTERN
const PATH_PATTERN = /^\/([a-z0-9_]+([-_][a-z0-9_]+)*\/)*[a-z0-9]+(-[a-z0-9]+)*$/;
const DECIMAL = /^\d+(\.\d+)?$/;

function checkPrice(where, p, errors) {
  if (p === undefined) return;
  if (typeof p.final !== 'string' || !DECIMAL.test(p.final)) errors.push(`${where}: price.final must be a decimal string`);
  if (typeof p.currency !== 'string' || p.currency.length !== 3) errors.push(`${where}: price.currency missing`);
  if (p.regular !== undefined && (typeof p.regular !== 'string' || !DECIMAL.test(p.regular))) errors.push(`${where}: price.regular must be a decimal string`);
}

export function validateEntries(entries) {
  const errors = [];
  const paths = new Map();
  const skus = new Map();
  const seeSku = (sku, where) => {
    if (skus.has(sku)) errors.push(`${where}: duplicate sku ${sku} (also ${skus.get(sku)})`);
    else skus.set(sku, where);
  };
  entries.forEach((e, i) => {
    const where = e?.sku ?? `#${i}`;
    for (const f of ['sku', 'name', 'path']) {
      if (typeof e?.[f] !== 'string' || !e[f]) errors.push(`${where}: missing ${f}`);
    }
    if (typeof e?.path === 'string') {
      if (!PATH_PATTERN.test(e.path) || e.path.length > 900) errors.push(`${where}: invalid path ${e.path}`);
      if (!CATALOG_ROOTS.some((r) => e.path.startsWith(`${r}/`))) errors.push(`${where}: path ${e.path} outside ${CATALOG_ROOTS.join(', ')}`);
      if (paths.has(e.path)) errors.push(`${where}: duplicate path ${e.path} (also ${paths.get(e.path)})`);
      else paths.set(e.path, where);
    }
    if (e?.sku) seeSku(e.sku, where);
    checkPrice(where, e?.price, errors);
    (e?.images ?? []).forEach((img) => {
      if (!/^https:\/\//.test(img?.url ?? '')) errors.push(`${where}: image url must be absolute https`);
    });
    (e?.variants ?? []).forEach((v) => {
      const vw = `${where}/${v?.sku}`;
      for (const f of ['sku', 'name', 'url']) if (!v?.[f]) errors.push(`${vw}: variant missing ${f}`);
      if (!Array.isArray(v?.images)) errors.push(`${vw}: variant missing images`);
      if (v?.sku) seeSku(v.sku, vw);
      checkPrice(vw, v?.price, errors);
    });
  });
  return { errors, count: entries.length };
}
