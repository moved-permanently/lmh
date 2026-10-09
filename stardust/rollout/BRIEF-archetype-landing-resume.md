# Addendum — RESUME the rollout unit `archetype-landing` (template landing, 32 pages). Read
# stardust/rollout/BRIEF-common.md and stardust/rollout/BRIEF-archetype-unit.md FIRST. Everything up to the
# gate row is DONE — do not re-author, do not re-deploy blocks that are unchanged.

State (stardust/rollout/progress.json → units.archetype-landing; read `--path units.archetype-landing.gates`):
- Page `/en/landingpage/e-models` (slug en-landingpage-e-models, live https://www.linde-mh.com/en/Landingpage/E-models/)
  is live + published; content document content/en/landingpage/e-models.html; encoder
  stardust/rollout/encoders/landing.mjs; blocks hero, media-browser, columns, related-teasers, teaser-carousel
  (+ breadcrumb reused); coverage row recorded; 1 foundation request appended.
- Gate 1440: 7.03 % Δh 8 clip 0 content 0/0 PASS (prototype 7.05 %). Done — do not re-run 1440 unless a fix touches it.
- Gate 360: 31.59 % Δh −237 clip 0 content 0/0 FAIL. This is NOT the Phase 4 residual (prototype 360: 20.64 % /
  Δh +14, residual = Nunito wrap forks with cancelling ±27 px bands). On the build every long text band is +25…+45 px
  taller than live (intro +36, article +45, banner +26, icon rows +72). Two fix rounds remain (cap 3 in total; round 1
  used: hero empty actions margin, intro wrapper flow-root, gallery wrapper 2.5vw below 1280, list rows 49 px).
- Read `node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md "Archetype landing (C-deliver)"` once.

Your job: the two remaining 360 fix rounds, instruments only.
1. Probe PROTOTYPE vs BUILD at 360 (the prototype is the spec; it measured 20.64 % with Δh +14):
   `node stardust/scripts/replica/measure.mjs http://localhost:8791/en-landingpage-e-models-proposed.html --against
   https://main--96d6da00--aemcoder.aem.page/en/landingpage/e-models --width 360 --selectors ".section.article p,
   .columns-text p,.hero .banner p,.related-teasers li,.teaser-carousel li"` through run-bg — compare width,
   font-size, letter-spacing, line-height, padding of the text containers (a wrapper narrower than the prototype's
   or a missing `letter-spacing` is the usual +1-line-per-paragraph signature). Also `measure.mjs <live> --against
   <eds> --width 360` on the same selectors. Fix ONLY in your block CSS (blocks/hero/hero.css landing section
   overrides, blocks/columns, blocks/related-teasers, blocks/teaser-carousel, blocks/media-browser) or the content
   document; never a frozen file (a needed foundation rule = one request line + a scoped override).
2. Commit + push the block CSS (named paths), verify the code sync (sha check with --compressed), re-drive the page
   (deploy-batch with stardust/rollout/units/archetype-landing.paths, same ledger stardust/deploy/ledger-archetype-landing.json),
   then `gate-all.mjs --only en-landingpage-e-models --state stardust/rollout/gate-state.json --width 360
   --origin-headless --skip-existing --recapture-eds` through run-bg. Read PASS|FAIL + the band table.
3. Round 3 the same way if needed. After the last round, if 360 still fails but reproduces the Phase 4 residual
   signature (≈ 20–21 %, |Δh| ≤ 8 px — NOT a 200-px height miss), write the documented override entry
   (BRIEF-common step 12) and re-run `--compare-only`. A residual that is still a new-defect signature is reported
   as FAIL with the band table and the measured deltas — honestly, no override.
4. If a fix touched a block that also renders at 1440, re-run gate-all `--width 1440 --skip-existing --recapture-eds`
   for the slug and report the number.
5. Append a `### Archetype landing — 360 fix rounds 2–3 (resume)` subsection to stardust/eds-conversion-log.md
   (what measured, what changed, final numbers). `foundation-freeze.mjs check`. Stop your processes. Commit your
   paths (blocks/<yours>/, content/en/landingpage/e-models.html, stardust/eds-conversion-log.md,
   stardust/deploy/ledger-archetype-landing.json, stardust/rollout/foundation-requests.md,
   stardust/replica/gates/all-360/overrides.json if written) — push only the block code.
Budget: ≈ 40 minutes and ≈ $15. Report at 40 minutes with whatever the last round measured.

## Report (under 20 lines) — verdict line first:
`archetype-landing: en-landingpage-e-models 1440 7.03% PASS (unchanged|re-run x%) / 360 y% Δh n clip c content m/h
VERDICT[ → override], fix rounds used r of 3, requests q`; then per round: what measured, what changed, the number.
