# LMH Product Bus importer

Feeds the Edge Commerce Product Bus for **`moved-permanently/lmh` only** (hard-coded, fail-closed in
`src/client.js`). Not served: `tools/catalog/` is in `.hlxignore`.

Sources (English only):

| source | what | Product Bus root |
|---|---|---|
| corporate product finder `www.linde-mh.com/lmhnewproductsearch_cloud/execute` | all 98 English (gb) new-truck model groups | `/en/catalog/models/{slug}` |
| UK webshop OCC `www.linde-mh.shop/rest/v2/baseSite-LMH-GB-NTS` | 8 selected products + their variants | `/en/catalog/shop/{code}` |

```
npm test                         # from tools/catalog, or `npm test` at the repo root
node bin/import.js               # dry run: cache/ (raw), out/entries.json, out/index.json
node bin/import.js --from-cache  # re-map without re-reading the sources
PRODUCTBUS_TOKEN=… node bin/import.js --from-cache --live
```

Rules: references only in authored content; prices only from the shop, `priceOnRequest` wins,
decimal strings in GBP; no availability inferred; model groups get a JSON-LD override without an
`Offer`. Categories are typed ids: `model:{productTypeId}` and `shop:{categoryCode}`.

Index columns (`productIndexerConfig.properties`) are in `src/config.js` (`INDEX_PROPERTIES`);
`out/index.json` mirrors the delivered `/en/catalog/index.json` and is copied to
`test/fixtures/catalog/` for block tests.
