/**
 * Local mirror of helix-product-indexer extractIndexEntry + helix-product-pipeline toSpreadsheet,
 * used to produce fixtures of /en/catalog/index.json before the live index exists.
 */
export function extract(obj, key) {
  return key.split(/\.|(?=\[)/).reduce((acc, part) => {
    if (acc == null) return undefined;
    const m = part.match(/^\[(\d+)\]$/);
    return m ? acc[Number(m[1])] : acc[part];
  }, obj);
}

function rowFor(record, props) {
  const row = { sku: record.sku, url: record.url };
  Object.entries(props).forEach(([dest, src]) => { row[dest] = extract(record, src); });
  return row;
}

export function toIndexSheet(entries, props) {
  const columns = new Set(['sku']);
  const data = [];
  [...entries].sort((a, b) => a.sku.localeCompare(b.sku)).forEach((e) => {
    const row = rowFor(e, props);
    Object.keys(row).forEach((k) => columns.add(k));
    const rows = [row];
    if (e.variants?.length) {
      columns.add('parentSku');
      columns.add('variantSkus');
      row.variantSkus = e.variants.map((v) => v.sku).join(',');
      e.variants.forEach((v) => {
        const vr = { parentSku: e.sku, ...rowFor(v, props) };
        Object.keys(vr).forEach((k) => columns.add(k));
        rows.push(vr);
      });
    }
    data.push(...rows);
  });
  return {
    ':type': 'sheet', total: data.length, offset: 0, limit: data.length, columns: [...columns], data,
  };
}
