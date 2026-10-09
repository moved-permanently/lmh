# Addendum — rollout C-deliver `cluster-program`: the 17 rendered siblings of the program template. Read
# stardust/rollout/BRIEF-common.md and stardust/rollout/BRIEF-cluster.md FIRST and obey them. Port 8804, job prefix
# `cprog-`, ledger stardust/deploy/ledger-cluster-program.json, paths file stardust/rollout/units/cluster-program.paths,
# log section `## Cluster program (C-deliver)`.

Archetype: en-products-e-trucks → content/en/products/e-trucks.html (live + published; gate 1440 14.22 % Δh +34 → documented
override; 360 13.14 % Δh +25 FAIL, no override — Phase 4 prototype 9.78 PASS). Encoder EXISTS: stardust/rollout/encoders/
program.mjs (`--help`; walks the migrated rows `.layout-passepartout > .header-image`, `.layout-100-headline--fixed`,
`.layout-article--centered`, `.layout-100--flex > .layout--{white|default|red|dark} > .text-container`, `.layout-50--flex`,
`.layout-40-60-reverse--flex`, `.layout-50(-reverse)--fixed`, `.layout--teaser`, `.content-browser`,
`.layout-teasercarousel__wrapper`, `.inline-button-row`). Blocks: columns (variants band/split/feature — yours to tune under
`.columns.band|.split|.feature` ONLY; `.columns.flex|.carousel|.testimonial|.red:not(...)` belong to the landing template and
another agent gated them this hour — never touch those hunks), breadcrumb, hero, media-browser, teaser-carousel (reused).
Read once: `node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md "Archetype program"` and
`… "Archetype program — fix rounds 2–3 (resume)"` (measurements, residuals, what round 3 should do).

Siblings (slug | folded DA path; migrated HTML at stardust/migrated/<URL-literal path>/{index.html,_meta.json}, URL from
`json-query.mjs stardust/state.json --path pages --match slug=^<slug>$ --fields slug,url --tsv`):
en-about-us-awards | /en/about-us/awards · en-about-us-certificates | /en/about-us/certificates ·
en-about-us-sustainability | /en/about-us/sustainability · en-linde-core-linde-ergonomics-html | /en/linde-core/linde-ergonomics ·
en-linde-core-linde-productivity-html | /en/linde-core/linde-productivity · en-products-approved-trucks | /en/products/approved-trucks ·
en-products-diesel-forklifts-d344 | /en/products/diesel-forklifts (rendered via the derived state
stardust/.work/replica/state-render-d344.json; migrated dir stardust/migrated/en/Products/Diesel-Forklifts) ·
en-products-explosion-proof-trucks | /en/products/explosion-proof-trucks · en-products-forklift-hire | /en/products/forklift-hire ·
en-products-forklift-truck | /en/products/forklift-truck · en-products-ic-trucks | /en/products/ic-trucks ·
en-products-order-pickers | /en/products/order-pickers · en-products-pallet-trucks | /en/products/pallet-trucks ·
en-products-reach-trucks | /en/products/reach-trucks · en-products-tow-trucks | /en/products/tow-trucks ·
en-products-very-narrow-aisle-trucks | /en/products/very-narrow-aisle-trucks · en-service-training | /en/service/training.
Sidecar `modules[]`/`variants[]` (fact counters, tables, accordions, video embeds, forms as recorded by the render units)
are VARIANTS of existing blocks first; a new block only for a composition no block covers — name it in the report.

Order of work (ONE fix round = measure → fix → redeploy → re-gate; cap 3 rounds for the whole unit, the archetype's round
3 counts as the first):
1. Archetype round 3 at 360 FIRST, on en-products-e-trucks: measure.mjs live vs published build at 360 on the hot bands
   1000–2000 (CTA row `cta, horizontal` 25 px short at 360 — the frozen styles.css rule: request line already queued, so
   a scoped override in blocks/columns or a section-style class of yours; feature row text centring vs the live
   centred Daxline column). Fix → redeploy the archetype (`deploy-batch --force`, publish) → gate-all `--only
   en-products-e-trucks --width 360 --origin-headless --skip-existing --recapture-eds`. Then 1440 `--compare-only`-safe
   check that the 1440 row did not regress (`--skip-existing --recapture-eds`).
2. Encode the 17 siblings with program.mjs, then the BRIEF-common chain steps 3–8 per page, deploy (publish), coverage rows,
   gate rows 1440 then 360 (`--origin-headless`, `--vh 700`, one width per run-bg job with `--timeout 3000`), rounds 2–3 on
   the worst band class if budget remains.
3. Override rule: a 1440 row within 1 pt of the archetype's documented override (14.22 %/+34, clip 0, content 0/0) or a
   360 row within 1 pt of the archetype's 360 row AFTER your round 3 gets an override entry (BRIEF-common step 12, `verdict`
   field, naming the slug and the archetype signature); anything else is reported FAIL honestly, with its hot bands.
4. Log section with the measurements, changes, full row tables for both widths. `foundation-freeze.mjs check`. Stop your
   processes by PID. `git pull --rebase` before every push; commit your paths only (content/, blocks/columns under your
   selectors, encoder, ledger, paths file, overrides.json, the log). Do NOT edit stardust/rollout/progress.json or
   stardust/migrate/progress.json or state statuses.
Budget: ≈ 80 minutes and ≈ $25. Commit after the archetype round, after the deploy, and after each gate width.

## Report (under 25 lines) — verdict line first:
`cluster-program: pages n/17 live+published, blocks k, gate 1440 p/17 PASS (worst x%) / 360 q/17 (worst y%), fix rounds r of 3,
requests m`; then per page `slug | 1440 pixel/Δh/clip/content VERDICT | 360 … VERDICT[ → override]`, then the archetype's
round-3 result, encoder/block changes, media rehosted, request lines, anything unfinished and why.
