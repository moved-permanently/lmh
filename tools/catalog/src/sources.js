import { FINDER, SHOP } from './config.js';

async function getJson(url, { fetchImpl = fetch, retries = 3 } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const res = await fetchImpl(url, { headers: { accept: 'application/json' } }).catch((e) => ({ ok: false, status: 0, error: e }));
    if (res.ok) return res.json();
    const retryable = res.status === 0 || res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retries) throw new Error(`GET ${url} -> ${res.status} ${res.error?.message ?? ''}`);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => { setTimeout(r, 1000 * 3 ** attempt); });
  }
}

/** All English model groups of the corporate product finder, paged. */
export async function readFinder({ fetchImpl, pageSize = 50 } = {}) {
  const results = [];
  let numRows = Infinity;
  for (let start = 0; start < numRows; start += pageSize) {
    const u = new URL(FINDER.endpoint);
    Object.entries({
      query: '*', sortOrder: 'desc', sortBy: 'customOrderWeight_long', fq: FINDER.fq, start: String(start), rows: String(pageSize), wt: 'json',
    }).forEach(([k, v]) => u.searchParams.set(k, v));
    // eslint-disable-next-line no-await-in-loop
    const page = await getJson(u, { fetchImpl });
    numRows = page.numRows;
    if (!page.results?.length) break;
    results.push(...page.results);
  }
  const ids = new Set(results.map((r) => r.identifier_keyword?.[0]));
  if (ids.size !== results.length || results.length !== numRows) {
    throw new Error(`finder: expected ${numRows} unique model groups, got ${results.length} rows / ${ids.size} ids`);
  }
  return results;
}

/** OCC product details for the bounded shop selection. */
export async function readShop({ fetchImpl, codes = SHOP.codes } = {}) {
  const out = [];
  for (const code of codes) {
    // eslint-disable-next-line no-await-in-loop
    out.push(await getJson(`${SHOP.api}/products/${encodeURIComponent(code)}?fields=FULL&lang=en&curr=GBP`, { fetchImpl }));
  }
  return out;
}
