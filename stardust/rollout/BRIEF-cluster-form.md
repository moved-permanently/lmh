# Addendum — rollout C-deliver `cluster-form`: the 7 rendered siblings of the form template. Read stardust/rollout/BRIEF-common.md
# and stardust/rollout/BRIEF-cluster.md FIRST and obey them. Port 8808, job prefix `cform-`, ledger stardust/deploy/ledger-cluster-form.json,
# paths file stardust/rollout/units/cluster-form.paths (write it: one folded path per line), log section `## Cluster form (C-deliver)`.
# `export RUN_BG_SLOTS=3`, one run-bg job of yours at a time.

Archetype: en-forms-global-contact-form → content/en/forms/global-contact-form.html (live + published; gate 1440 3.91 % Δh −13 PASS,
360 7.38 % Δh −40 clip 0 content 0/0, units off 2 → documented override: the live country <select> 361 px intrinsic width spills the
360 viewport, Phase 4 residual #1, not replicated). Encoder EXISTS: stardust/rollout/encoders/form.mjs (`--help`; header comment =
the row vocabulary: two-cell rows [label p | heading | empty] × [p code type / name / flags + ul options or text p]; types
text|textarea|select|radio|hidden|info|submit|notice; flags required|disabled|hidden|native|row-50|row-100-30|row-30-100|same-row;
em li = placeholder, strong li = preselected, label em * = red mark; hidden inputs ALWAYS empty). Block you own: blocks/mwf-form
(template-slotted header/info/submit/notice, reconstructive field rows). Read once: `node stardust/scripts/replica/section.mjs
stardust/eds-conversion-log.md "Archetype form"`. Instrument note from the archetype unit: `unit-geometry.mjs` caches the origin
inventory per slug WITHOUT width (stardust/current/measure/<slug>-units.json) — refresh with `--force` at each width before its gate.
The render unit's report (stardust/migrate/progress.json units.render-form.verdict) names the control types / variants the siblings
need that the archetype did not have: add a type token + decode branch in mwf-form / form.mjs for each (multi-radio groups = one li per
option) — never a block fork, never a fixed field list. Submission stays DISABLED on every page (no action, no post; the authored
notice). Dispositions as stardust/dynamic-features.md rows 4–5.

Siblings (slug | folded DA path | migrated dir under stardust/migrated/):
en-forms-agility-on-point-form | /en/forms/agility-on-point-form | en/Forms/agility-on-point-form ·
en-forms-automation-campaign | /en/forms/automation-campaign | en/Forms/Automation-Campaign ·
en-forms-ex-proof-form | /en/forms/ex-proof-form | en/Forms/Ex-Proof_Form ·
en-forms-gc-li-ion-recycling | /en/forms-gc/li-ion-recycling | en/Forms-GC/Li-ION-Recycling ·
en-forms-gc-next-champ-form | /en/forms-gc/next-champ-form | en/Forms-GC/Next-Champ-Form ·
en-forms-gse-expo | /en/forms/gse-expo | en/Forms/GSE-Expo · en-forms-rent-a-truck | /en/forms/rent-a-truck | en/Forms/Rent-A-Truck.
(Verify each migrated dir with `ls stardust/migrated/en/Forms*/`.) Live URLs: `json-query.mjs stardust/state.json --path pages
--match slug=^<slug>$ --fields slug,url --tsv`.

Chain per page (BRIEF-common 3–8): encode with form.mjs → sanitise → delivery-lint → localize-links → deploy-batch (publish,
`--concurrency 2`, `--token-file "$ADOBE_IMS_TOKEN_FILE"`) through run-bg → verify `.plain.html` 200, no `about:error` (re-drive once)
→ `update-coverage.mjs <slug> --status deployed --url <preview url>` → `node stardust/scripts/stardust/gate-state.mjs --host
main--96d6da00--aemcoder.aem.page --preview` → presence sidecar: every slug mapped `#pjax-container=main` in
stardust/replica/gates/all-{1440,360}/presence.json → gate-all `--only <7 slugs> --state stardust/rollout/gate-state.json --width 1440
--origin-headless --vh 700 --timeout 3000` (ONE run-bg job), then 360.
Gate and override rule: 1440 PASS ≤ 10 % and |Δh| ≤ 5 % only — no override; 360 a row within 1 pt of the archetype's 7.38 %/−40 with
clip 0 content 0/0, or a `units` fail whose only off units are a native <select> spilling as on live, gets an override entry
(`verdict` field, slug named) in stardust/replica/gates/all-360/overrides.json. Everything else FAIL, reported with its first hot band.
Cap 3 fix rounds, in mwf-form / form.mjs / your content only. After the rows: `update-coverage.mjs --gate` is NOT run here (it flips
failing rows to `failed`, which gate-state drops; the gate-all unit handles coverage).
Budget: ≈ 60 minutes and ≈ $18. Commit after the encode, after the deploy, after each gate width. Stop processes by PID.
`foundation-freeze.mjs check` before you report. Do NOT edit stardust/rollout/progress.json, stardust/migrate/progress.json or state statuses.

## Report (under 25 lines) — verdict line first:
`cluster-form: pages n/7 live+published, blocks k edited (mwf-form …), gate 1440 p/7 PASS (worst x%) / 360 q/7 (worst y%), fix rounds
r of 3, requests m`; then per page `slug | 1440 pixel/Δh/clip/content VERDICT | 360 … VERDICT[ → override] | new types/variants`,
then encoder changes, anything unfinished and why.
