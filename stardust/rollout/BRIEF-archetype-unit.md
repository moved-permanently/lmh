# Unit brief — rollout C-deliver `archetype-<type>`: deploy the GATED archetype of one template and pass
# its gate row on the preview URL. Read stardust/rollout/BRIEF-common.md FIRST and obey it. The
# per-template addendum is in your task message.

You are the template's cluster agent. This unit ships ONE page — the archetype — and the blocks it needs;
its siblings follow in later units (render → cluster) that reuse YOUR encoder, so the block set and the
content document shape you fix here are the template's for good. Siblings never get a per-page fork.

## Inputs
- The gated prototype `stardust/prototypes/<slug>-proposed.html` + `<slug>.css` on top of the canon
  (`canon.css`, `canon-chrome.html`, `chrome.js`), served at http://localhost:8791/<slug>-proposed.html.
  It IS the spec for pixel fidelity; the live page is the spec for content. Never DOM-copy the live page.
- The migrated source `stardust/migrated/<URL-literal path>/index.html` + `_meta.json` (modules[], slots).
- The block plan: `node stardust/scripts/replica/json-query.mjs stardust/rollout/plan.json --path steps
  --match slug=^<slug>$ --width 200` (convert[] = the blocks this archetype converts, representative-first)
  and `stardust/rollout/coverage/blocks.json` (ids, signatures, usedByTemplates). Block names are the
  plan's `edsBlockName`/id — never invent a second name for a planned block.
- The frozen foundation (deployed, do not edit): `styles/styles.css` (tokens, fonts, base type, buttons),
  `blocks/header`, `blocks/footer`, `blocks/breadcrumb` (deployed by C0 — reuse as is), `head.html`,
  `scripts/`. Read `styles/styles.css` by grep for the tokens/classes you reuse (`--color-*`, `.btn`,
  section styles), never whole. `stardust/runtime-contract.json` names the runtime.
- Dynamic surface: `stardust/dynamic-features.md` rows that touch your template (your addendum names
  them) — ship the disposition recorded there (static snapshot / embed-passthrough / rebuild-native).
- Deploy contract — read these sections once each (`section.mjs <doc> "<heading>"`):
  `/home/node/adobe-skills/plugins/stardust/skills/deploy/SKILL.md` § "The ENCODE contract — what
  well-authored content looks like", § "2b. Section schema + decode tier", § "7. Blocks (parallel
  agents)", § "8. Block JS scaffold" (and its "Experience Workspace editability contract (EW1–EW10)"),
  § "9. Content page scaffold", § "Local QA before deploy (no DA)". Skim § "Anti-patterns" headings only.
  Bias: template-slotted decode for fixed compositions (hero, intro bands, contact cards); reconstructive
  for repeat groups (cards, carousels, listings). Images: editorial → authored `<picture>` content;
  decorative → block CSS.

## Procedure
1. Section schema (chain step 1) from the prototype URL. Decide block names + reuse (plan.json), lock them.
2. Author each planned block under `blocks/<name>/<name>.{js,css}` — CSS values lifted from the gated
   prototype's CSS (`css-rules.mjs stardust/prototypes/<slug>.css "<selector-re>"`), scoped to
   `.<name>`; JS obeys EW1–EW10 (node-slotting: move/wrap authored nodes, never read a value and write new
   markup; no manufactured button anchors — EDS button conventions). Motion: implement only what
   `stardust/replica/motion/<slug>.json` recorded as observed AND the prototype implemented (its
   `motion.implemented`); dead classes stay dead.
3. Author `content/<folded path>.html` from the migrated source (verbatim content; the live page's
   paragraph boundaries). Chain steps 3–8 (block-roundtrip --ew, localize-links, delivery-lint,
   media-reconcile + da-media-upload for same-origin images, davids-model-lint, sanitise, harness +
   qa-gate). `npm run lint` exit 0.
4. Commit + push your blocks and the content file (named paths), verify the code sync (sha check).
5. Deploy (chain step 10) with `stardust/rollout/units/archetype-<type>.paths` (the one DA path) and
   ledger `stardust/deploy/ledger-archetype-<type>.json`; `.plain.html` + live-origin checks.
6. Record (chain step 11): coverage row `deployed`, each new block `deployed`.
7. Gate row (chain step 12): gate-state → gate-all `--only <slug>` 1440 then 360, `--origin-headless`.
   Fix rounds (cap 3) touch only your blocks / content document. 360 documented-residual rule applies
   (your addendum gives the Phase 4 numbers). Record the final numbers for both widths.
8. Append a `## Archetype <type> (C-deliver)` section to `stardust/eds-conversion-log.md`: blocks + decode
   tiers, media decisions, request lines, residuals. Stop your processes; `foundation-freeze.mjs check`.

## Report (under 25 lines) — the verdict line first:
`archetype-<type>: <slug> live+published, blocks k (<names>), gate 1440 x% Δh n clip c content m/h VERDICT /
360 y% Δh n clip c content m/h VERDICT[ → override], fix rounds r, requests q`; then the blocks with their
decode tiers, the media decisions (counts), foundation-request lines (count), anything unfinished.
