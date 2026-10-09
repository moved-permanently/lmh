# Rollout report — linde-mh.com/en replica on AEM Edge Delivery (2026-10-07)

Source: https://www.linde-mh.com/en/ · Live origin: https://main--96d6da00--aemcoder.aem.live · Preview: https://main--96d6da00--aemcoder.aem.page

## Pages
- Scope: 100 selected pages of 510 discovered (stardust/.labs/site-plan.json); 1 is a source 404 (/en/Product-Finder/), 99 captured.
- Delivered: 98 documents for 99 pages (one case-variant duplicate folds to the same path and is a redirects row); 98/98 live and published, sitemap served 98 = assembled 98.
- Verify (published origin): 98 reachable 200, no about:error, every internal href resolves (79 unique root-relative hrefs, 0 non-200). Verdicts 26 verified / 72 failed — the 72 are pixel-gate rows (11–30 % at 1440 or 360), never a missing or broken element; see Quality.
- Redirects sheet: 6 rows (/ and /index.html → /en; case variant; /en/Forms/Ex-Proof_Form/ → /en/forms/ex-proof-form), live. /nav and /footer published with noindex.
- Links: 597 source-host targets outside the selected scope stay absolute to the source site (425 /en/ pages, 172 brochure/datasheet PDFs) — stardust/rollout/link-audit-kept.txt.

## Templates (10)
| Template | Pages | Verified | Pixel residual |
|---|---|---|---|
| Home | 1 | 0 | 1 |
| Landing (campaign + product landing) | 32 | 1 | 31 |
| Program (product families) | 18 | 0 | 18 |
| Article (news detail) | 18 | 11 | 7 |
| Listing (press, media, events…) | 11 | 1 | 10 |
| Form | 8 | 8 | 0 |
| Static (legal notes) | 7 | 2 | 5 |
| Product finder | 1 | 1 | 0 |
| Product finder (products subtree) | 1 | 1 | 0 |
| Location finder | 1 | 1 | 0 |

## Blocks
17 distinct module blocks converted once each on their representative archetype and reused on 89 sibling pages (417 instances): accordion, breadcrumb, cards, columns, filter, hero, hero-carousel, infobox, location-finder, media-browser, media-carousel, mwf-form, news-cards, press-contact, product-finder, related-teasers, table, teaser-carousel (+ light variant), teaser-grid, widget, wizard; chrome: header, footer, fragment. Foundation frozen after C0 (16 files, sha256 manifest unchanged at C-final).

## Quality
- Source-fidelity gate (published origin, gate-all): 1440 → 39/98 delivered, 360 → 26/98 delivered. Every FAIL row is the documented font residual: FF Daxline Pro / Dax Pro are licensed and are not rehosted; the metric-matched substitute (Nunito Sans, brand family first in the stack) wraps text differently on text-heavy pages. 0 clipped controls, 0 MISSING links/headings on the delivered rows; residual overrides documented in the gate sidecars.
- Four pages render no h1 because their sources render none (/en/about-us/certificates, /en/linde-core/linde-productivity, /en/products/productfinder, /en/solutions/overview, plus /en/productfinder) — reproduced verbatim, recorded as a deviation.
- Optimize (seo / ai-search / cross-page): health 100 on the automated layers, 0 open P1 · P2 · P3; 120 findings mirror the source (no JSON-LD, shared form titles, title lengths) and are informational. Two migration deltas fixed at G-aem from the captures (about-us/media description, about-us/company title + description) and one title normalised (news 18902).
- Dynamic features: 13 rows, 18 replayable checks on the live origin, 18 PASS (consent gate, forms native, product finder 12 tiles / 45 filters, dealer finder, counters); 3 rows decided out.

## To deliver (site owner)
1. **Font licence** — a licensed FF Daxline Pro / Dax Pro drop-in (the stack already names the family first) is the single lever that closes the 72 pixel-residual rows.
2. **Consent management (CMP) and tag container** — scaffolded; vendor IDs and container to be supplied.
3. **Form backend** — the 8 form pages render natively; the submission endpoint is the owner's.
4. **Google Maps key** for the location finder's map tile.
5. **Out-of-scope link targets** (597) — a follow-up wave would migrate them; until then they resolve on the current site.
