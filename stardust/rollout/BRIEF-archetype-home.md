# Addendum — rollout C-deliver `archetype-home`: deploy the gated HOME archetype `en` and pass its gate row on the preview URL.
# Read stardust/rollout/BRIEF-common.md and BRIEF-archetype-unit.md FIRST and obey them. Port 8809, job prefix `ahome-`, ledger
# stardust/deploy/ledger-archetype-home.json, paths file stardust/rollout/units/archetype-home.paths, log section `## Archetype home (C-deliver)`.
# `export RUN_BG_SLOTS=3`, one run-bg job of yours at a time (another agent may share the pool).

Inputs
- Live https://www.linde-mh.com/en/ (content spec). Prototype (pixel spec): stardust/prototypes/en-proposed.html + its page CSS on the canon
  (:8791 — curl first, start serve.mjs on the prototypes dir if nothing answers, PID to stardust/.work/rollout/shared/proto.pid, stop by PID).
- Migrated source stardust/migrated/en/{index.html,_meta.json}. Delivered path /en → the site root document for the `en` folder (check how
  deploy-batch folds `/en`: the sibling `/en/products` lives at content/en/products.html, so `/en` → content/en.html; confirm with
  `delivery-lint.mjs --help` and the coverage row `json-query.mjs stardust/rollout/coverage/pages.json --path pages --match slug=^en$`).
- Plan (coverage row blocks): convert `hero-carousel`, `teaser-carousel-light`, `teaser-grid` (new, yours); header/footer are the foundation.
  The home main root is `.body-container` on live (presence sidecar maps `en` → `.body-container=main`; keep that mapping, `--main` symmetric).
- Phase 4 record (`json-query.mjs stardust/replica/progress.json --path archetypes.home`): 1440 5.11 % Δh 0 PASS, clip 4 (documented — read the
  record's `justified`/`residuals`: hero `.h2` font fork at 0–500, stitch seam ≈ 1 %, carousel arrows dx+16/dy−80); 360 15.69 % Δh −26 clip 4
  residual (icon-text 'Safety' paragraph wraps, hero .h2 80 vs 40 px). Motion: header machine only (canon chrome.js), 2 dead classes.
- Dynamic surface: stardust/dynamic-features.md rows touching the home page (hero carousel autoplay/slides, press teaser carousel) — ship the
  recorded dispositions (Swiper-lock: captured slide state, no autoplay unless motion-observe recorded it as fired; read the Phase 4 `motion`).
- Decode tier: hero-carousel and teaser-carousel-light reconstructive (repeat groups, one row per slide/card: picture | text cell with heading,
  copy, CTA link); teaser-grid reconstructive. EW1–EW10 node-slotting; `block-roundtrip --ew` exit 0. CSS values lifted from the prototype CSS
  (`css-rules.mjs`), scoped to each block. No frozen file edit — request line + scoped override.

Procedure: BRIEF-archetype-unit.md § Procedure, with deploy through run-bg (publish, `--paths … --ledger … --concurrency 2 --token-file
"$ADOBE_IMS_TOKEN_FILE"`), `update-coverage.mjs en --status deployed --url <preview url>`, `gate-state.mjs --host main--96d6da00--aemcoder.aem.page
--preview`, gate-all `--only en --state stardust/rollout/gate-state.json --width 1440 --origin-headless --vh 700 (a tall page that stalls stitching: retry --vh 1500)` then 360, one width
per job; refresh unit-geometry's origin cache `--force` per width (its cache is per slug, not per width). Cap 3 fix rounds. Override rule: 1440 must
PASS (≤ 10 %, |Δh| ≤ 5 %) — a clip count equal to the Phase 4 documented 4 (same elements) goes to clip-allow.json with the Phase 4 justification;
a 360 row within 1 pt of 15.69 %/−26 gets an override entry (`verdict` field) in stardust/replica/gates/all-360/overrides.json.
Stop processes by PID; `foundation-freeze.mjs check`; commit your paths. Do NOT edit stardust/rollout/progress.json / migrate progress / state statuses.
Budget: ≈ 60 minutes and ≈ $20. Commit after the blocks, after the deploy, after each gate width.

## Report (under 25 lines) — verdict line first:
`archetype-home: en live+published, blocks k new (…), gate 1440 x% Δh clip content VERDICT / 360 y% … VERDICT[ → override], fix rounds r of 3,
requests n, media m`; then decode decisions, motion shipped, anything unfinished and why.
