# Addendum — the ONE landing fix round over BOTH in-flight units `cluster-landing-1` (16 pages) and
# `cluster-landing-2` (15 pages). Read stardust/rollout/BRIEF-common.md and stardust/rollout/BRIEF-cluster.md FIRST.
# Everything up to the first gate pass is DONE: all 31 pages are live + published, blocks exist, coverage rows
# recorded. Do not re-author pages; fix the shared encoder/blocks, re-encode, redeploy, re-gate.

State — read once each: `node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md "Cluster landing 1"`,
`… "Cluster landing 2"`, and `node stardust/scripts/replica/json-query.mjs stardust/rollout/progress.json --path
units.cluster-landing-1.gates.resume`. Archetype: en-landingpage-e-models → content/en/landingpage/e-models.html (the
delivered shape; 1440 7.03 % PASS, 360 18.56 % documented override). Encoder stardust/rollout/encoders/landing.mjs;
blocks columns (variants flex/text-60/text-40/video/red/carousel/testimonial), related-teasers (facts), teaser-carousel
(standalone), accordion, infobox, wizard, media-carousel, hero (dark/white section styles). Paths files
stardust/rollout/units/cluster-landing-{1,2}.paths; ledgers stardust/deploy/ledger-cluster-landing-{1,2}.json.
First-pass gate rows (published regime, --origin-headless): 1440 0/31 PASS (worst 64 %; in-sync +1653, next-champ
+1215, agility-on-point +1270 px share the `columns flex red` rows; automation-summit −2093 gallery/40-60 video rows;
gas-forklifts −1145 / content MISSING 11; fleet-management +1561; x-range and x-models ERROR = stitch scroll stall →
`--vh 700`), 360 0/16 on unit 1, not run on unit 2. Content MISSING on sibling modules: accordion `#` toggle links,
carousel dot buttons (icon-dropped class), gse-expo teaser--card h3s, happy-driver icon-text teaser links, x-models
text-container h3, unit-2 accordion bodies / read-more / card links (gas-forklifts 11, heavy-duty 14, pallet-stackers 12,
tugger-trains 10, fleet-management 9, intralogistics 12).

Your job, instruments first, in this order (ONE round = measure → fix → redeploy → re-gate; cap 2 rounds in this unit):
1. Measure the hot bands on the three worst 1440 pages (in-sync, next-champ, agility-on-point) with measure.mjs
   LIVE vs BUILD at 1440 through run-bg (job prefix `lfix-`): live selectors `.layout-50--flex,.layout--red,
   .layout--overflow,.layout-50--flex img` vs build `.columns.flex,.columns.flex.red,.columns.flex > div > div,
   .columns.flex picture`. Compare height, width, padding, position (the live red text box OVERLAPS the image —
   negative margin / absolute offset; the build stacks them). Also measure one −1000 px page (gas-forklifts or
   automation-summit: the build is SHORTER — missing rows or collapsed media) on `.layout-40-60--flex,
   .carousel-wrapper,.image-clipper` vs `.columns.video,.media-carousel,.columns picture`.
2. Fix in blocks/columns/columns.{js,css} (`flex red` overlap geometry), blocks/media-carousel, blocks/accordion
   (toggle `#` links: render the authored heading as the summary — the live `#` anchors are MISSING because the
   encoder drops them; keep them as the live page keeps them, as a link inside the summary), and in the encoder
   (teaser--card h3 cell, icon-text teaser link cell, text-container h3, accordion bodies, read-more copy, card
   links). Never a frozen file; a foundation rule needed = request line + scoped override in your block CSS.
   Another agent is editing blocks/columns `band|split|feature` variant rules for the program template right now
   — add your rules ONLY under the `.columns.flex` / `.columns.carousel` / `.columns.testimonial` selectors and
   `git pull --rebase` before pushing; never revert someone else's hunk.
3. Re-encode all 31 pages (encoder over stardust/migrated/<URL-literal>/index.html → content/<folded>.html);
   `git diff --stat content/` sanity; the 9 cluster-landing-1 files with the correct Semi-automated-order-pickers href
   rewrite stay as they are in the working tree (commit them). Commit + push block code, sha-verify the code sync,
   deploy-batch BOTH paths files (one run each, same ledgers, `--concurrency 2`, publish, `--token-file
   "$ADOBE_IMS_TOKEN_FILE"`) through run-bg.
4. Gate: `node stardust/scripts/stardust/gate-state.mjs --host main--96d6da00--aemcoder.aem.page --preview`, then
   gate-all `--only <all 31 slugs> --width 1440 --origin-headless --skip-existing --recapture-eds --vh 700` (one run-bg
   job, `--timeout 3000`), read the table; then `--width 360` the same way. Round 2 only if time remains, on the
   worst remaining band class. A 360 row within 1 pt of the archetype's documented residual (18.56 %/+24, Phase 4
   20.64 %/+14; clip 0, content 0/0) gets an override entry (BRIEF-common step 12, `verdict` field); anything else
   is reported FAIL honestly.
5. Append `### Cluster landing — fix round (resume, both units)` to stardust/eds-conversion-log.md with the measured
   deltas, the changes, and the full row tables for both widths. `foundation-freeze.mjs check`. Stop your processes by
   PID. Commit your paths (content/, blocks/<yours>/, encoder, ledgers, overrides.json, the log). Do NOT edit
   stardust/rollout/progress.json (the main agent records both units).
Budget: ≈ 60 minutes and ≈ $18. Commit after step 3 and after each gate width so nothing is lost if stopped. Report at
the budget with the last measured tables.

## Report (under 25 lines) — verdict line first:
`cluster-landing-1: 1440 p/16 PASS (worst x%) / 360 q/16 (worst y%); cluster-landing-2: 1440 p/15 / 360 q/15; fix rounds
used r of 3; requests n`; then what measured, what changed, the worst 5 rows per width, anything unfinished.
