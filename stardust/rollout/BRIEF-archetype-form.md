# Addendum — rollout C-deliver `archetype-form`: deploy the gated FORM archetype `en-forms-global-contact-form` and pass
# its gate row on the preview URL. Read stardust/rollout/BRIEF-common.md and BRIEF-archetype-unit.md FIRST and obey them.
# Port 8806 (your harness server), job prefix `aform-`, ledger stardust/deploy/ledger-archetype-form.json, paths file
# stardust/rollout/units/archetype-form.paths, log section `## Archetype form (C-deliver)`. run-bg starts with `--slots 3`.

Inputs
- Live https://www.linde-mh.com/en/Forms/Global-Contact-Form/ (content spec). Prototype (pixel spec):
  stardust/prototypes/en-forms-global-contact-form-proposed.html + en-forms-global-contact-form.css on the canon. The
  prototype server on :8791 is NOT running — `curl -sI localhost:8791/en-forms-global-contact-form-proposed.html | head -1`
  first; if nothing answers, start `nohup node stardust/.work/replica/probes/serve.mjs stardust/prototypes 8791 >/dev/null
  2>&1 &` and write `$!` (the node PID itself, verify `tr '\0' ' ' </proc/$PID/cmdline`) to stardust/.work/rollout/shared/
  proto.pid; stop it by that PID before you report.
- Migrated source stardust/migrated/en/Forms/Global-Contact-Form/{index.html,_meta.json} (modules 2). Delivered path
  /en/forms/global-contact-form → content/en/forms/global-contact-form.html.
- Plan: convert `mwf-form` (new block, yours); reuse `breadcrumb` (deployed). Phase 4 record (`json-query.mjs
  stardust/replica/progress.json --path archetypes.form …`): 1440 3.43 % Δh −8 PASS; 360 8.67 % Δh −35 pass-with-residuals
  (canon footer +31 px at 360 — chrome, not yours; live country <select> spills 14 px — live bug, not replicated; Subject
  row 14 px font fork); content cap wrapper 640 / form items 342 (register R-01 deferred = replicate as live); motion: nothing
  page-specific; clip 0.
- Dynamic surface, ship exactly these dispositions (stardust/dynamic-features.md § Features rows 4 and 5, § Decision batch
  item 2): the form UI is REBUILT NATIVE from the capture — the field set is CONTENT-DRIVEN per page (the 7 sibling forms
  have different fields: agility-on-point 12 visible + 6 hidden, no subject cascade), so `mwf-form` decodes authored rows
  (one row per field: label cell | control cell — type, name, required mark, options list for selects/radios, placeholder),
  never a fixed field list; submission DISABLED: no action, no JS post, a visible "no backend connected" notice exactly as
  the Phase 4 prototype renders it (grep the prototype for it) — the MWF endpoint is dead on the target (404) and belongs to
  the site owner; custom select widgets in the captured CLOSED state (native select hidden, red `.dropdown-toggle` showing
  "Select*" / "Mr.", menu hidden, no flyout script); the 3 dependent dropdowns hidden + disabled as captured; country list
  239 options verbatim + disabled placeholder; Title preselected "Mr."; consent radio unchecked; no validation messages.
  Hidden inputs (statistics / chksmlf / mwf_leadid / mwf_leadid_inmail) keep EMPTY values — never copy a session token or
  any credential into content or code.
- Blocks are decoded per the deploy contract's EW1–EW10 (node-slotting). Decode tier: template-slotted for the fixed
  intro/notice parts, reconstructive for the field rows (repeat group). Block CSS values lifted from the prototype CSS
  (`css-rules.mjs stardust/prototypes/en-forms-global-contact-form.css "<re>"`), scoped to `.mwf-form`. No frozen file edit;
  a foundation rule you need = a request line in stardust/rollout/foundation-requests.md + scoped override in your CSS.

Procedure: BRIEF-archetype-unit.md § Procedure (section schema → block → encoder → chain 3–8 → deploy → gate), with:
- Write the ENCODER once as stardust/rollout/encoders/form.mjs `<migrated index.html> <out content.html> --url <live>
  [--meta <_meta.json>]` (ESM, `--help`, header comment naming the row vocabulary it walks) — the render-form/cluster-form
  units reuse it on 7 siblings with different field sets, so it must derive every field from the source markup.
- Deploy through run-bg with publish (`deploy-batch.mjs … --paths stardust/rollout/units/archetype-form.paths --ledger
  stardust/deploy/ledger-archetype-form.json --concurrency 2 --token-file "$ADOBE_IMS_TOKEN_FILE"`), `update-coverage.mjs
  en-forms-global-contact-form --status deployed --url <preview url>`, `gate-state.mjs --host main--96d6da00--aemcoder.aem.page
  --preview`, then gate-all `--only en-forms-global-contact-form --state stardust/rollout/gate-state.json --width 1440
  --origin-headless --vh 700` and 360, one width per job. Cap 3 fix rounds. Override rule: a 360 row within 1 pt of the
  Phase 4 residual (8.67 %/−35, clip 0, content 0/0) gets an override entry (`verdict` field) in
  stardust/replica/gates/all-360/overrides.json; the 1440 row must PASS (≤ 10 %, |Δh| ≤ 5 %) — no override.
- Three other agents are editing blocks right now (landing: hero, columns flex/carousel/testimonial/red, accordion,
  related-teasers, media-carousel, teaser-carousel; program: columns band/split/feature; listing: news-cards, filter). You
  touch only blocks/mwf-form and your encoder/content. `git pull --rebase` before every push; never revert another hunk.
- Stop processes by PID; `foundation-freeze.mjs check`; commit your paths (blocks/mwf-form, encoder, content, ledger,
  paths file, overrides.json, the log section). Do NOT edit stardust/rollout/progress.json / migrate progress / state statuses.
Budget: ≈ 60 minutes and ≈ $20. Commit after the block, after the deploy, after each gate width.

## Report (under 25 lines) — verdict line first:
`archetype-form: en-forms-global-contact-form live+published, blocks k new (mwf-form …), encoder form.mjs, gate 1440 x% Δh clip
content VERDICT / 360 y% … VERDICT[ → override], fix rounds r of 3, requests n, media m`; then the decode decisions, the
row vocabulary form.mjs walks, what the siblings will need, anything unfinished and why.
