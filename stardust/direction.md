---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-06T12:05:39Z
  againstInput: https://www.linde-mh.com/en/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.linde-mh.com/en/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-10-06T12:05:39Z). Provenance: verbatim `--prep` promotion
(byte-for-byte copies; `cmp` clean).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(3 entries, all `deferred` — no design delta is applied in this run; effectively a pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Scope: the 99 live pages of the 100 selected in stardust/.labs/site-plan.json (one source 404);
page types per stardust/current/_page-types.json — one archetype per type in Phase 3.
Fonts: FF Daxline Pro / Dax Pro are licensed and are not rehosted; Phase 3 picks a metric-matched
substitute with the brand family name first in the stack (replica SKILL § Fonts).

## Phase 5 decisions (2026-10-06)
- **Delivered paths are delivery-safe folds** of the source paths (lowercase, `_` → `-`, no trailing
  slash, extensionless): `/en/About-us/Press/` → `/en/about-us/press`, `/en/technical/News-Detail_101184.html`
  → `/en/technical/news-detail-101184`. The source-path → delivered-path pairs are the redirects sheet (D-site).
- **Case-variant duplicate:** `en-products-diesel-forklifts-d344` (`/en/Products/Diesel-Forklifts/`) has a
  body identical to `en-products-diesel-forklifts` (`/en/Products/Diesel-forklifts/`); both fold to the same
  path. One document is delivered; the variant is a row in `stardust/redirects.tsv`. 98 documents for 99 pages.

## E2-link-audit decisions (2026-10-07)
- **Out-of-scope link targets stay repointed to the source site (SCOPE EXTENSION).** The page scope of this run is
  the 100 `selected` pages of `stardust/.labs/site-plan.json`; 597 distinct source-host targets referenced by the
  delivered documents are not selected (425 under `/en/` such as the magazine articles, e-truck product pages and
  industry pages; 172 `/media/...` brochure and datasheet PDFs). They are outside the declared scope, so every one
  of them keeps its absolute `https://www.linde-mh.com/...` href regardless of count. The list, with reference
  counts, is `stardust/rollout/link-audit-kept.txt`.
- **Folded path referenced by delivered documents:** `/en/Forms/Ex-Proof_Form/` is delivered at
  `/en/forms/ex-proof-form` (underscore fold). The pair is a row of `stardust/redirects.tsv`, the 5 hrefs on
  `/en/products/explosion-proof-trucks` are now root-relative, and the redirects sheet carries the row (6 rows).
- **Selected page that the source serves as 404:** `/en/Product-Finder/` (the plan's one source 404) is linked
  with product-type queries from `/en/landingpage/glasses` and `/en/products/hand-pallet-trucks`. The links are
  carried as captured (absolute to the source) — redirecting them to `/en/productfinder` would be an unregistered
  change of behaviour. Not a capture gap: there is nothing to crawl.
