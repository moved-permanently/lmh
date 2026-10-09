# Addendum — rollout C-deliver `archetype-location-finder`: deploy the gated LOCATION FINDER archetype `en-technical-location-finder-html` and
# pass its gate row on the preview URL. Read stardust/rollout/BRIEF-common.md and BRIEF-archetype-unit.md FIRST and obey them. Port 8811, job
# prefix `aloc-`, ledger stardust/deploy/ledger-archetype-location-finder.json, paths file stardust/rollout/units/archetype-location-finder.paths,
# log section `## Archetype location finder (C-deliver)`. `export RUN_BG_SLOTS=3`, one run-bg job of yours at a time.

Inputs
- Live https://www.linde-mh.com/en/technical/Location-Finder.html. Prototype stardust/prototypes/en-technical-location-finder-html-proposed.html
  (+ page CSS, canon, :8791 as in the other addenda). Migrated source stardust/migrated/en/technical/Location-Finder.{html,_meta.json}. Delivered
  path /en/technical/location-finder → content/en/technical/location-finder.html. Plan blocks: `location-finder` (new, yours) + `breadcrumb`.
- Phase 4 record (`json-query.mjs stardust/replica/progress.json --path archetypes.locationfinder`): 1440 20.2 % raw / 3.24 % with the map region
  masked (left column 3.77 %), Δh 0, clip 0, cap-probe PASS; 360 23.52 % raw / 2.42 % masked. The whole residual is Google Maps tiles vs the
  static map box — dynamic-features.md row 9 disposition (dealer finder host-bound API → static snapshot: captured dealer list + static map box,
  no Maps script, no client fetch). Motion: header morph only, nothing page-specific.
- Decode: location-finder template-slotted for the search/filter panel in its captured state, reconstructive for the dealer result rows (one
  authored row per dealer: name, address lines, contact links as captured). The map box is a styled placeholder of the live map's exact rect
  (measure.mjs live vs build), never an iframe to a third-party service. EW1–EW10; `block-roundtrip --ew` exit 0.
- Gate: gate-all reads a per-slug mask sidecar — read the header of stardust/scripts/replica/gate-all.mjs (`grep -n "masks" … | head`) for the
  masks.json shape and write stardust/replica/gates/all-{1440,360}/masks.json entries for this slug covering ONLY the map rect (the Phase 4 gate
  masked the same region; cite its masked numbers in the log). Pass bar on the masked row: 1440 ≤ 10 %, |Δh| ≤ 5 %, clip 0, content 0/0 — no
  override at 1440; 360 within 1 pt of 2.42 % masked passes, otherwise fix (cap 3 rounds) or report FAIL honestly with the first hot band.

Procedure: BRIEF-archetype-unit.md § Procedure (block → encoder stardust/rollout/encoders/locationfinder.mjs → chain → deploy with publish →
`update-coverage.mjs <slug> --status deployed --url …` → `gate-state.mjs --host main--96d6da00--aemcoder.aem.page --preview` → gate-all `--only
en-technical-location-finder-html --state stardust/rollout/gate-state.json --width 1440 --origin-headless --vh 700 (a tall page that stalls stitching: retry --vh 1500)`, then 360; unit-geometry
origin cache `--force` per width). Stop processes by PID; `foundation-freeze.mjs check`; commit your paths. Do NOT edit stardust/rollout/progress.json,
stardust/migrate/progress.json or state statuses. Budget: ≈ 50 minutes and ≈ $15. Commit after the block, after the deploy, after each gate width.

## Report (under 25 lines) — verdict line first:
`archetype-location-finder: en-technical-location-finder-html live+published, blocks k new (location-finder), encoder locationfinder.mjs, gate 1440 x%
(masked) Δh clip content VERDICT / 360 y% … VERDICT, fix rounds r of 3, requests n`; then the mask rect, decode decisions, anything unfinished and why.
