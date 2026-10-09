const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .trim();
}

export function slugify(s) {
  return String(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Parse "1.000 kg" / " 2.800 mm" (German thousands separator) to a number. */
export function parseMeasure(s) {
  if (s == null) return undefined;
  const m = String(s).replace(/\s/g, '').match(/^([\d.]+)(?:,(\d+))?/);
  if (!m) return undefined;
  const n = Number(m[1].replace(/\./g, '') + (m[2] ? `.${m[2]}` : ''));
  return Number.isFinite(n) ? n : undefined;
}

export const first = (v) => (Array.isArray(v) ? v[0] : v);

export function money(n) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(2) : undefined;
}

export function prune(obj) {
  if (Array.isArray(obj)) return obj.map(prune);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj)
      .filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))
      .map(([k, v]) => [k, prune(v)]));
  }
  return obj;
}
