# Unit brief — migrate `render-listing` (the 10 siblings of the listing template). Read
# stardust/rollout/BRIEF-common.md FIRST and obey it. Your task message names the slugs. Job prefix `rlist-`, port 8805.

Template: listing (archetype `en-about-us-press`, live https://www.linde-mh.com/en/About-us/Press/, prototype
stardust/prototypes/en-about-us-press-proposed.html + .css; migrated archetype stardust/migrated/en/About-us/Press/
{index.html,_meta.json}; delivered document content/en/about-us/press.html — live, gate rows documented overrides).
Encoder for the cluster unit (NOT yours to run): stardust/rollout/encoders/listing.mjs — read its header comment
(lines 1–20): it walks `#pjax-container > .layout-passepartout` rows in order — `.header-intro` (h1 + intro p),
`.layout--shadegrey` (`.filter-downloadarea`: h4 + one `.form-item` per control: label + checkbox labels | date
placeholders), `.layout--teaser` (`.teaser--card` ×n: img, h3 > a, p subline, p > a more) — so the migrated HTML of every
sibling MUST keep that row vocabulary. Read once: `node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md
"Archetype listing"`.

Generator: `stardust/.work/replica/gen-landing-sibling.mjs <slug>… --template landing|program` (ESM) already emits clean
markup from its own templates and writes stardust/prototypes/siblings/<slug>.html with the canon chrome. Add
`--template listing` (or a thin `gen-listing-sibling.mjs` that imports it) so listing siblings get: the header-intro row,
the filter row (static snapshot of the server-side controls, placeholders as captured), and the teaser-card grid — exactly
the markup the press prototype uses (grep it), plus the archetype's page CSS `en-about-us-press.css` (a sibling never gets
its own CSS file). Keep every existing template; add a template only for a composition a sibling has and the archetype
lacks (hero/header-image stage, text bands, content-browser, teaser carousel, tables) — several of these slugs
(en-about-us, en-products, en-service, en-solutions-overview-html) are section overview pages and may share landing/program
rows: reuse those existing landing/program templates verbatim rather than inventing new markup, declare the extra rows as
`modules` on the sidecar and name them in your report. Content verbatim from the capture, no DOM copy of the live page,
no inline styles, lazy-loading off. Do NOT break landing/program output: run the generator once on
`en-landingpage-glasses` and once on `en-products-reach-trucks --template program` after your change and `diff` against the
committed stardust/prototypes/siblings/<slug>.html (must be identical).

Siblings: slug → live URL from stardust/state.json (`json-query.mjs stardust/state.json --path pages --match
slug=^<slug>$ --fields slug,url --tsv`); captures stardust/current/pages/<slug>.{html,json} are the reference, never a
fresh live hit for content. Folded path = lowercase, `_`/spaces → `-`, no trailing slash, `.html` suffix dropped.

Method — sibling tier (handoff contract § 1):
1. Variance probe ONCE for the whole template (stardust/rollout/units/variance-listing.json does not exist yet):
   through run-bg (ONE job, `--timeout 1500`) `node stardust/scripts/replica/sibling-variance.mjs
   <archetype live URL> <all 10 sibling live URLs> --main "#pjax-container" --probe intro=".header-intro"
   --probe filter=".filter-downloadarea" --probe cards=".layout--teaser" --probe card=".teaser--card"
   --probe stage=".header-image" --probe band=".layout-100--flex .text-container" --probe browser=".content-browser"
   --probe teaser=".teaser" --json > stardust/rollout/units/variance-listing.json`. Budget every computed-style delta as a
   VARIANT of an existing block (declare with `migrate.mjs variant`); presence/count differences are content-driven.
   Record `variance-probe` on each sidecar with that evidence.
2. Generator for your slugs → stardust/prototypes/siblings/<slug>.html.
3. Driver: `node stardust/scripts/stardust/state.mjs advance <slugs> --to directed`, then
   `node stardust/scripts/migrate/migrate.mjs render <slugs> --archetype <slug>=en-about-us-press … --source
   <slug>=stardust/prototypes/siblings/<slug>.html …`; a `refused` line names the strict rule — fix the source and re-run.
   Then per slug `migrate.mjs modules <slug> <the modules the page really has>` and `migrate.mjs variant <slug> <class>`.
   en-solutions-overview-html: its live URL ends in `.html`; mirror how en-linde-core-linde-ergonomics-html was rendered
   (`ls stardust/migrated/en/Linde-Core/`) — if the driver refuses the `.html` literal, use a derived state file like
   stardust/.work/replica/state-render-d344.json did (`--state`), never a hand edit of stardust/state.json.
4. Content-count acceptance per page: serve the project root on port 8805 (`node stardust/.work/replica/probes/serve.mjs
   . 8805` through nohup setsid, PID into stardust/.work/rollout/render-listing/http.pid) and run through run-bg, ONE job
   at a time, `node stardust/scripts/diff/content-diff.mjs http://localhost:8805/stardust/current/pages/<slug>.html
   http://localhost:8805/stardust/migrated/<path>/index.html --profile generic --main "#pjax-container"`. Only MAIN-root
   findings count: 0 structural 🔴, or a logged `migrate.mjs deviation` per justified drop (tracking, consent, hidden
   icons as on the archetype, AOS opacity states, empty sections, block-rendered icon glyphs, the empty p.info).
   Record `migrate.mjs gate <slug> content-count --evidence "…"` and `… content-fidelity --evidence "verbatim from
   capture; deviations: n"`.
5. Delivery lint early per page (`node stardust/scripts/rollout/delivery-lint.mjs --file stardust/migrated/<path>/index.html
   --path /<folded>`).
6. Stop your server by PID. No deploy, no gate-all (the cluster unit follows).
7. Commit own paths only: siblings html, stardust/migrated/<your dirs>, the generator (force-add: .work is ignored),
   variance-listing.json, stardust/state.json. No push. Do NOT edit stardust/migrate/progress.json (main agent records).
Budget: ≈ 50 minutes. Commit after step 3 and after step 5 so nothing is lost if stopped.

Report (under 25 lines): first line verbatim from the driver `rendered N, unchanged N, refused N, passthrough N`; then
per slug `slug | path | sections n | modules | variants | content-count 🔴 n / deviations n | lint P0/P1`; then generator
file, variance deltas budgeted, compositions the template cannot express.
