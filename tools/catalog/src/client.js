import { API_BASE, DESTINATION } from './config.js';

export function assertDestination({ org, site }) {
  if (org !== DESTINATION.org || site !== DESTINATION.site) {
    throw new Error(`refusing destination ${org}/${site}; only ${DESTINATION.org}/${DESTINATION.site} is allowed`);
  }
}

export function catalogUrl(path = '') {
  assertDestination(DESTINATION);
  return `${API_BASE}/${DESTINATION.org}/sites/${DESTINATION.site}/catalog${path}`;
}

/** Bulk upsert, 50 per request (all-or-nothing per request). */
export async function upsert(entries, { token, fetchImpl = fetch, log = console.log } = {}) {
  if (!token) throw new Error('PRODUCTBUS_TOKEN is required for --live');
  const results = [];
  for (let i = 0; i < entries.length; i += 50) {
    const batch = entries.slice(i, i + 50);
    // eslint-disable-next-line no-await-in-loop
    const res = await fetchImpl(catalogUrl(), {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ items: batch }),
    });
    // eslint-disable-next-line no-await-in-loop
    const text = await res.text();
    if (!res.ok) throw new Error(`bulk ${i}: ${res.status} ${res.headers.get('x-error') ?? ''} ${text.slice(0, 500)}`);
    const body = JSON.parse(text);
    results.push(...(body.items ?? body.results ?? []));
    log(`bulk ${i / 50 + 1}: ${res.status}, ${batch.length} items`);
  }
  return results;
}
