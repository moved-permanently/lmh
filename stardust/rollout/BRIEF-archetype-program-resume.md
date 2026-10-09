# Addendum — RESUME the rollout unit `archetype-program` (template program, 18 pages). Read
# stardust/rollout/BRIEF-common.md and stardust/rollout/BRIEF-archetype-unit.md FIRST. Everything up to the
# gate row is DONE — do not re-author, do not re-deploy blocks that are unchanged.

State (stardust/rollout/progress.json → `--path units.archetype-program.gates`, and the log section
`node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md "Archetype program"` — read both once):
- Page `/en/products/e-trucks` (slug en-products-e-trucks, live https://www.linde-mh.com/en/Products/E-Trucks/)
  is live + published; content document content/en/products/e-trucks.html; encoder
  stardust/rollout/encoders/program.mjs; blocks reused (breadcrumb, hero, media-browser `content`, teaser-carousel)
  + columns variants `band[ red|dark]`, `split`, `feature[ red][ video]` in blocks/columns/columns.{js,css}.
  Paths file stardust/rollout/units/archetype-program.paths, ledger stardust/deploy/ledger-archetype-program.json.
- Gate (published regime, `--origin-headless`): 1440 17.4 % Δh +106 clip 0 content 0/0 FAIL; 360 16.26 % Δh +61 FAIL.
  Phase 4 prototype record: 1440 15.28 % Δh +63 (residual, Nunito wrap fork); 360 9.78 % Δh −4 PASS.
  Fix round 1 used (columns.js picture dedupe, band heading margin-top 1rem). Two rounds remain (cap 3).
- Recorded residuals to attack, in this order: (1) band 1 −61 px @1440 / −16 @360 — the first full-bleed text band
  (`.layout-100--flex > .text-container`) is shorter than live and every band below it is offset; (2) feature media:
  live paints a tighter crop and no play glyph → drop the `video` token in program.mjs feature() (re-encode the
  content document, redeploy the one page); (3) content-browser +36 px at 1440 (delivered media-browser block).
- The prototype is served at http://localhost:8791/en-products-e-trucks-proposed.html (spec for pixel fidelity).

Your job: fix rounds 2–3, instruments only, both widths.
1. Probe PROTOTYPE vs BUILD and LIVE vs BUILD at 1440 and 360 with measure.mjs through run-bg (one job at a time;
   job prefix `prog-`): `node stardust/scripts/replica/measure.mjs http://localhost:8791/en-products-e-trucks-proposed.html
   --against https://main--96d6da00--aemcoder.aem.page/en/products/e-trucks --width 1440 --selectors
   ".layout-100--flex .text-container,.text-container p,.text-container h3,.layout-50--flex,.layout-40-60-reverse--flex,.content-browser"`
   — on the build the selectors are the block's (`.columns.band`, `.columns.band p`, `.columns.band h3`, `.columns.split`,
   `.columns.feature`, `.columns.feature picture`, `.media-browser`); run measure once per side with matching selector
   pairs (prototype-vs-build is the useful one: compare width, padding, font-size, line-height, letter-spacing, margin of
   the band wrapper and of its h3/p). A text wrapper narrower than the prototype's 912 px or a missing margin is the
   usual signature. Fix ONLY in blocks/columns/columns.{js,css}, blocks/media-browser, or the encoder + content document;
   never a frozen file (a needed foundation rule = one request line in stardust/rollout/foundation-requests.md + a scoped
   override in your block CSS).
2. Commit + push the block CSS/JS (named paths), verify the code sync (`curl -s --compressed … | sha256sum` against the
   local file), re-drive the page if the content document changed (deploy-batch with the paths file + the same ledger,
   `--token-file "$ADOBE_IMS_TOKEN_FILE"`), then through run-bg
   `node stardust/scripts/replica/gate-all.mjs --only en-products-e-trucks --state stardust/rollout/gate-state.json
   --width 1440 --origin-headless --skip-existing --recapture-eds`, then the same `--width 360`. Read PASS|FAIL + band table.
3. Round 3 the same way if needed. After the last round: 1440 ≤ 10 % Δh ≤ 5 % = PASS. If 1440 still fails but reproduces
   the Phase 4 residual signature (≈ 15 %, Δh ≈ +63 — wrap forks, not a block geometry miss) write the documented override
   entry (BRIEF-common step 12; overrides.json entries need a `verdict` field) and re-run `--compare-only`. 360 has NO
   residual to inherit (Phase 4 PASS at 9.78 %): it either passes or is reported FAIL with the band table — no override.
4. Append a `### Archetype program — fix rounds 2–3 (resume)` subsection to stardust/eds-conversion-log.md (what measured,
   what changed, final numbers). `node stardust/scripts/replica/foundation-freeze.mjs check` (find the script with
   `ls stardust/scripts/*/foundation-freeze.mjs`). Stop your processes by PID. Commit your paths (blocks/columns/,
   blocks/media-browser/, content/en/products/e-trucks.html, stardust/rollout/encoders/program.mjs,
   stardust/eds-conversion-log.md, stardust/deploy/ledger-archetype-program.json, stardust/rollout/foundation-requests.md,
   stardust/replica/gates/all-*/overrides.json if written) — push only the block code. Do NOT edit
   stardust/rollout/progress.json (the main agent records the unit).
Budget: ≈ 40 minutes and ≈ $12. Report at 40 minutes with whatever the last round measured.

## Report (under 20 lines) — verdict line first:
`archetype-program: en-products-e-trucks 1440 x% Δh n clip c content m/h VERDICT[ → override] / 360 y% Δh n clip c
content m/h VERDICT, fix rounds used r of 3, requests q`; then per round: what measured, what changed, the number;
last line: whether program.mjs changed (the render/cluster units depend on it).
