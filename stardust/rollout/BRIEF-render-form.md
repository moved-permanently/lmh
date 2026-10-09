# Unit brief — migrate `render-form` (7 siblings of the form template). Read stardust/rollout/BRIEF-common.md FIRST and
# obey it; then BRIEF-render-static.md for the sibling-tier method (steps 1–6 below are the same method, form facts filled in).
# Job prefix `rform-`, project-root server port 8807 (PID into stardust/.work/rollout/render-form/http.pid). No deploy, no gate-all here.

Template: form (archetype `en-forms-global-contact-form`, live https://www.linde-mh.com/en/Forms/Global-Contact-Form/, prototype
stardust/prototypes/en-forms-global-contact-form-proposed.html + .css on :8791 — `curl -sI localhost:8791/en-forms-global-contact-form-proposed.html
| head -1` first; if nothing answers, start `nohup node stardust/.work/replica/probes/serve.mjs stardust/prototypes 8791 >/dev/null 2>&1 &`, write `$!`
(verify via /proc/$PID/cmdline) to stardust/.work/rollout/shared/proto.pid and stop it by that PID before you report; migrated archetype
stardust/migrated/en/Forms/Global-Contact-Form/{index.html,_meta.json}, modules 2: `mwf-form` (new in the archetype-form unit) + `breadcrumb`).
Read the archetype unit's log section `## Archetype form (C-deliver)` in stardust/eds-conversion-log.md (section.mjs, one heading) and the
header comment of stardust/rollout/encoders/form.mjs: it names the row vocabulary the encoder walks — your rendered siblings must carry
the SAME markup shapes (intro, notice, one field per row: label | control with type/name/required/options/placeholder; hidden inputs with
EMPTY values; custom selects in the captured CLOSED state; submission disabled with the notice) so the cluster unit can encode them unchanged.

Siblings (slug → live URL → folded delivery path), all typed `form` in stardust/state.json (status `extracted` → advance to `directed`):
- en-forms-agility-on-point-form → https://www.linde-mh.com/en/Forms/agility-on-point-form/ → /en/forms/agility-on-point-form (12 visible + 6 hidden fields, no subject cascade)
- en-forms-automation-campaign → https://www.linde-mh.com/en/Forms/Automation-Campaign/ → /en/forms/automation-campaign
- en-forms-ex-proof-form → https://www.linde-mh.com/en/Forms/Ex-Proof_Form/ → /en/forms/ex-proof-form
- en-forms-gc-li-ion-recycling → https://www.linde-mh.com/en/Forms-GC/Li-ION-Recycling/ → /en/forms-gc/li-ion-recycling
- en-forms-gc-next-champ-form → https://www.linde-mh.com/en/Forms-GC/Next-Champ-Form/ → /en/forms-gc/next-champ-form
- en-forms-gse-expo → https://www.linde-mh.com/en/Forms/GSE-Expo/ → /en/forms/gse-expo
- en-forms-rent-a-truck → https://www.linde-mh.com/en/Forms/Rent-A-Truck/ → /en/forms/rent-a-truck
Captures (the reference, never a fresh live hit for content): stardust/current/pages/<slug>.{html,json}. Field sets are CONTENT-DRIVEN
per page: derive every field (label, type, name, required mark, options, placeholder, hidden) from the capture; never copy a session
token, checksum or lead id value — hidden inputs keep EMPTY values.

Method — sibling tier:
1. Variance probe (not yet done for form): `node stardust/scripts/replica/sibling-variance.mjs en-forms-global-contact-form <7 slugs>
   --probe form=<form selector> --probe intro=<intro selector> --probe field=<field row selector> …` through run-bg (ONE job, `export
   RUN_BG_SLOTS=3`, shared with one other agent) → stardust/rollout/units/variance-form.json; budget every delta as a VARIANT token on
   the sibling's content (block variant classes of `mwf-form`), never a block fork; record `variance-probe` evidence on each sidecar.
2. Generator: write `stardust/.work/replica/gen-form-sibling.mjs <slug>` (ESM, `--help`): clean semantic re-authoring of the MAIN
   content from the capture (never a DOM copy), canon chrome exactly as the archetype prototype imports it, page CSS reference
   `en-forms-global-contact-form.css` (a sibling never gets its own CSS file). Output stardust/prototypes/siblings/<slug>.html.
3. Driver: `node stardust/scripts/stardust/state.mjs advance <7 slugs> --to directed`, then `node stardust/scripts/migrate/migrate.mjs
   render <7 slugs> --archetype <slug>=en-forms-global-contact-form … --source <slug>=stardust/prototypes/siblings/<slug>.html …`;
   then per slug `migrate.mjs modules <slug> breadcrumb mwf-form` and `migrate.mjs variant <slug> <class>` where used.
4. Content-count acceptance per page through run-bg: content-diff.mjs capture vs migrated (`--profile generic --main "#pjax-container"`),
   0 structural 🔴 on main or a logged `migrate.mjs deviation`; record `migrate.mjs gate <slug> content-count …` and `content-fidelity …`.
5. Delivery lint per page: `node stardust/scripts/rollout/delivery-lint.mjs --file stardust/migrated/<path>/index.html --path /<folded path>`.
6. Stop your servers by PID. Commit your paths (generator, prototypes/siblings, stardust/migrated/en/Forms*/**, variance-form.json).
   Do NOT deploy, do NOT run gate-all, do NOT edit stardust/rollout/progress.json, stardust/migrate/progress.json or state statuses
   beyond the `advance … --to directed` above.
Budget: ≈ 45 minutes, ≈ $12. Commit after the generator and after the driver.

## Report (under 25 lines)
First line verbatim from the driver: `rendered N, unchanged N, refused N, passthrough N`; then per slug:
`slug | path | fields visible/hidden | variants | content-count 🔴 n / deviations n | lint P0/P1 n/n`. Then: generator file,
anything a sibling needs that `mwf-form` cannot express (the cluster unit will need it).
