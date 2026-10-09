# Unit brief — rollout C-deliver `cluster-<template>`: deliver the rendered siblings of ONE template to the
# published origin and pass their gate rows. Read stardust/rollout/BRIEF-common.md FIRST and obey it. Your task
# message names the template, the archetype, the slugs and the ports.

Inputs
- The archetype's delivered document `content/<archetype folded path>.html` — THE shape every sibling document
  takes (same blocks, same section-metadata styles, same metadata block). Its blocks are deployed; you add none
  unless a sibling's `_meta.json.modules[]` names a module no block covers (then it is a VARIANT of an existing
  block first, a new block only when the task message allows it).
- The rendered siblings: `stardust/migrated/<URL-literal path>/{index.html,_meta.json}` (fidelityTier sibling,
  verbatim content, `variants[]`, `deviations[]`, `gateEvidence`), produced by the template's render unit.
- The template's encoder: `stardust/rollout/encoders/<template>.mjs` when it exists (landing has one); otherwise
  write it ONCE as `stardust/rollout/encoders/<template>.mjs <migrated index.html> <out content.html> --url <live>`
  (ESM, `--help`), generalised from the archetype's content-generation (article:
  stardust/.work/rollout/archetype-article/gen-content.mjs; static: the shape of
  content/en/legal-notes/privacy-statement.html vs stardust/migrated/en/Legal-Notes/Privacy-Statement/index.html).
  The encoder consumes the migrated HTML and emits the EDS document — never read the live site for content.
- Deviations already recorded on the sidecar (`_meta.json.deviations`) carry over as authored; new ones go through
  `node stardust/scripts/migrate/migrate.mjs deviation <slug> …`.

Procedure — every page through BRIEF-common's chain, steps 1–12, in this order
1. Encode all pages first (`content/<folded path>.html`), then chain steps 3–8 per page (block-roundtrip --ew
   against the migrated index served on your port, localize-links once for the whole content dir, delivery-lint
   per page with the folded `--path`, media-reconcile per page — same-origin images rehosted through
   da-media-upload with `--scope <template>`, one manifest for the unit —, davids-model-lint, sanitise, harness +
   qa-gate on your server). `npm run lint` exit 0 if you touched block code.
2. Write `stardust/rollout/units/cluster-<template>.paths` (one DA path per line, folded, no extension), commit
   your content files + encoder (named paths), push only if block code changed (then the sha check).
3. Deploy through run-bg (chain step 10) with `--ledger stardust/deploy/ledger-cluster-<template>.json --log
   stardust/.work/rollout/cluster-<template>/deploy.log --concurrency 2`, publish included. `.plain.html` checks
   on the preview host + live origin 200 per page.
4. Record coverage rows (chain step 11) per page, `deployed`.
5. Gate rows (chain step 12): `gate-state.mjs --host main--96d6da00--aemcoder.aem.page --preview`, then gate-all
   `--only <all your slugs>` 1440, then 360, `--origin-headless`, one width per run-bg job. A FAIL: fix in the
   content document or your block CSS, redeploy, `--skip-existing --recapture-eds`; cap 3 rounds for the unit. The
   360 documented-residual rule applies per page (the Phase 4 record of the template's archetype; the override
   entry names the slug). Report every row.
6. Stop your processes; `foundation-freeze.mjs check`. Commit your paths (content/, stardust/deploy/ledger-*,
   stardust/replica/gates/all-*/overrides.json, stardust/eds-conversion-log.md section `## Cluster <template>
   (C-deliver)` — encoder, variants, media counts, rows, residuals). Do NOT write stardust/rollout/progress.json,
   stardust/migrate/progress.json or stardust/state.json statuses (the main agent records the unit).

Report (under 25 lines) — verdict line first:
`cluster-<template>: pages n/n live, blocks k, gate 1440 x% / 360 y%, requests r` (x/y = worst page), then per page
`slug | path | 1440 pixel/Δh/clip/content VERDICT | 360 … VERDICT[ → override] | variants`, then encoder file,
media rehosted (count), request lines appended, anything unfinished and why.
