# Unit brief — migrate `render-program-<n>` (siblings of the program template). Read
# stardust/rollout/BRIEF-common.md FIRST and obey it. Your task message names the unit and its slugs.

Template: program (archetype `en-products-e-trucks`, live https://www.linde-mh.com/en/Products/E-Trucks/, prototype
stardust/prototypes/en-products-e-trucks-proposed.html + .css served at http://localhost:8791/en-products-e-trucks-proposed.html;
migrated archetype stardust/migrated/en/Products/E-Trucks/{index.html,_meta.json}; delivered document
content/en/products/e-trucks.html — live, gate rows in a fix round by another agent right now). Encoder for the cluster
unit (NOT yours to run): stardust/rollout/encoders/program.mjs — read its header comment (lines 1–28): it walks the source
layout rows of the migrated HTML (`.layout-passepartout > .header-image`, `.layout-100-headline--fixed`,
`.layout-article--centered`, `.layout-100--flex > .layout--{white|default|red|dark} > .text-container`, `.layout-50--flex`,
`.layout-40-60-reverse--flex`, `.layout-50(-reverse)--fixed`, `.layout--teaser` rows, `.content-browser`,
`.layout-teasercarousel__wrapper`, `.inline-button-row`) and emits one section per row — so the migrated HTML of every
sibling MUST keep that row vocabulary. Read once: `node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md
"Archetype program"`.

Generator: the landing sibling generator `stardust/.work/replica/gen-landing-sibling.mjs <slug>…` (466 lines, ESM) already
emits clean markup from its own templates for the rows landing and program share (header-image stage, anchor nav, headline
rows, article/intro columns, content-browser, columns rows, teaser rows, teaser carousel, CTA rows) and writes
stardust/prototypes/siblings/<slug>.html with the canon chrome. Generalise it — a `--template program` flag or a thin
`stardust/.work/replica/gen-program-sibling.mjs` that imports it — so program siblings get: the program text bands
(`.layout-100--flex > .layout--<colour> > .text-container` with the leading icon slot + h3 + p, exactly the markup the
e-trucks prototype uses — grep it), the `.layout-50--flex` split, the `.layout-40-60-reverse--flex` feature, the
content-browser `content` variant (5 rows, no pictures), and the archetype's page CSS `en-products-e-trucks.css`
(a sibling never gets its own CSS file). Keep every existing template; add a template only for a composition a sibling
has and the archetype lacks (fact counters, tables, accordions, video embeds, forms) — rendered verbatim as default
content from the capture, declared as `modules` on the sidecar and named in your report. Content verbatim, no DOM copy of
the live page, no inline styles, no slick clones, lazy-loading off. Do NOT break landing output: run the generator once on
`en-landingpage-glasses` after your change and `diff` against the committed stardust/prototypes/siblings/en-landingpage-glasses.html
(must be identical).

Siblings: slug → live URL from stardust/state.json (`json-query.mjs stardust/state.json --path pages --match
slug=^<slug>$ --fields slug,url --tsv`); captures stardust/current/pages/<slug>.{html,json} are the reference, never a
fresh live hit for content. Folded path = lowercase, `_`/spaces → `-`, no trailing slash.

Method — sibling tier (handoff contract § 1):
1. Variance probe ONCE for the whole template, only if stardust/rollout/units/variance-program.json does not exist:
   through run-bg (ONE job, `--timeout 1500`, job prefix `rprog-`) `node stardust/scripts/replica/sibling-variance.mjs
   <archetype live URL> <all 17 sibling live URLs> --main "#pjax-container" --probe stage=".header-image"
   --probe headline=".layout-100-headline--fixed h2" --probe band=".layout-100--flex .text-container"
   --probe split=".layout-50--flex" --probe feature=".layout-40-60-reverse--flex" --probe browser=".content-browser"
   --probe teaser=".teaser" --probe carousel=".teaser-carousel" --probe cta=".inline-button-row" --json >
   stardust/rollout/units/variance-program.json`. Budget every computed-style delta as a VARIANT of an existing block
   (declare with `migrate.mjs variant`); presence/count differences are content-driven. Record `variance-probe` on each
   sidecar with that evidence.
2. Generator for your slugs → stardust/prototypes/siblings/<slug>.html.
3. Driver: `node stardust/scripts/stardust/state.mjs advance <slugs> --to directed`, then
   `node stardust/scripts/migrate/migrate.mjs render <slugs> --archetype <slug>=en-products-e-trucks … --source
   <slug>=stardust/prototypes/siblings/<slug>.html …`; a `refused` line names the strict rule — fix the source and re-run.
   Then per slug `migrate.mjs modules <slug> <the modules the page really has>` and `migrate.mjs variant <slug> <class>`.
4. Content-count acceptance per page: serve the project root on your own port (node stardust/.work/replica/probes/serve.mjs
   . <port>, record the PID) and run through run-bg, ONE job at a time,
   `node stardust/scripts/diff/content-diff.mjs http://localhost:<port>/stardust/current/pages/<slug>.html
   http://localhost:<port>/stardust/migrated/<path>/index.html --profile generic --main "#pjax-container"`. Only MAIN-root
   findings count: 0 structural 🔴, or a logged `migrate.mjs deviation` per justified drop (tracking, consent, hidden
   headline-row icons as on the archetype, AOS opacity states, empty sections, block-rendered icon glyphs). Record
   `migrate.mjs gate <slug> content-count --evidence "…"` and `… content-fidelity --evidence "verbatim from capture;
   deviations: n"`.
5. Delivery lint early per page (`node stardust/scripts/rollout/delivery-lint.mjs --file stardust/migrated/<path>/index.html
   --path /<folded>`; find the script with `ls stardust/scripts/*/delivery-lint.mjs`).
6. Stop your server by PID. No deploy, no gate-all (the cluster unit follows).
7. Commit own paths only: siblings html, stardust/migrated/<your dirs>, the generator (force-add: .work is ignored),
   variance-program.json, stardust/state.json. No push. Do NOT edit stardust/migrate/progress.json (main agent records).

Report (under 25 lines): first line verbatim from the driver `rendered N, unchanged N, refused N, passthrough N`; then
per slug `slug | path | sections n | modules | variants | content-count 🔴 n / deviations n | lint P0/P1`; then generator
file, variance deltas budgeted, compositions the template cannot express.
