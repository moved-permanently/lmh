# Unit brief — migrate `render-landing-<n>` (siblings of the landing template). Read
# stardust/rollout/BRIEF-common.md FIRST and obey it. Your task message names the unit and its slugs.

Template: landing (archetype `en-landingpage-e-models`, live https://www.linde-mh.com/en/Landingpage/E-models/,
prototype stardust/prototypes/en-landingpage-e-models-proposed.html + .css served at
http://localhost:8791/en-landingpage-e-models-proposed.html; migrated archetype
stardust/migrated/en/Landingpage/E-models/{index.html,_meta.json} (modules breadcrumb, hero, media-browser,
related-teasers, teaser-carousel, columns); delivered document content/en/landingpage/e-models.html — live and
gated: 1440 7.03 % PASS, 360 18.56 % documented override). Encoder for the cluster unit (NOT yours to run):
stardust/rollout/encoders/landing.mjs walks the source layout rows of the migrated HTML and emits one section per
row — so the migrated HTML of every sibling MUST keep the archetype's row vocabulary. Read once:
`node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md "Archetype landing (C-deliver)"`.

The archetype prototype was generated from a CONTENT MODEL by stardust/.work/replica/landing-v2/build.mjs
(137 lines; reads the captured #pjax-container, emits clean markup from its own templates: header-image stage /
parallax banner, anchor nav, headline rows, article/intro columns, content-browser (gallery + list), columns rows,
teaser rows incl. icon teasers, teaser carousel, CTA rows). It is hard-coded to one input file: generalise it into
`stardust/.work/replica/gen-landing-sibling.mjs <slug>` (ESM, `--help`) that reads
stardust/current/pages/<slug>.html, emits the SAME templates with the canon chrome imported exactly as the
archetype prototype does (same `<link>`/`<script>` lines, the archetype's page CSS
`en-landingpage-e-models.css` — a sibling never gets its own CSS file) to
stardust/prototypes/siblings/<slug>.html. Keep every existing template; add a template only for a composition a
sibling has and the archetype lacks (fact counters, tables, accordions, video embeds, forms) — rendered verbatim as
default content from the capture, declared as `modules` on the sidecar and named in your report. Fact counters
(stardust/dynamic-features.md row 13: /en/About-us/Company/ has 4 count-up values) ship their SETTLED values, which
the Company capture already carries (B2 re-probed them). Content verbatim, no DOM copy of the live page, no
inline styles, no slick clones, lazy-loading off.

Siblings: slug → live URL from stardust/state.json (`json-query.mjs stardust/state.json --path pages --match
slug=^<slug>$ --fields slug,url --tsv`); captures stardust/current/pages/<slug>.{html,json} are the reference,
never a fresh live hit for content. Folded path = lowercase, `_`/spaces → `-`, no trailing slash.

Method — sibling tier (handoff contract § 1):
1. Variance probe ONCE for the whole template, only if stardust/rollout/units/variance-landing.json does not
   exist: through run-bg (ONE job, RUN_BG_SLOTS=1, `--timeout 1500`) `sibling-variance.mjs <archetype live URL>
   <all 31 sibling live URLs> --main "#pjax-container" --probe stage=".header-image,.parallax-container"
   --probe anchor=".navigation-anchor-navigation" --probe headline=".layout--headline h2,.headline h2"
   --probe article=".layout-article--centered p" --probe browser=".content-browser" --probe columns=".layout-50--fixed"
   --probe teaser=".teaser" --probe carousel=".teaser-carousel" --probe cta=".inline-button-row" --json >
   stardust/rollout/units/variance-landing.json`. Budget every computed-style delta as a VARIANT of an existing block
   (declare with `migrate.mjs variant`); presence/count differences are content-driven. Record `variance-probe`
   on each sidecar with that evidence.
2. Generator (above) for your slugs → stardust/prototypes/siblings/<slug>.html.
3. Driver: `state.mjs advance <slugs> --to directed`, then `migrate.mjs render <slugs> --archetype <slug>=
   en-landingpage-e-models … --source <slug>=stardust/prototypes/siblings/<slug>.html …`; a `refused` line names
   the strict rule — fix the source and re-run. Then per slug `migrate.mjs modules <slug> <the modules the page
   really has>` and `migrate.mjs variant <slug> <class>` where used.
4. Content-count acceptance per page: serve the project root on your port and run through run-bg, ONE job at a
   time, `content-diff.mjs http://localhost:<port>/stardust/current/pages/<slug>.html
   http://localhost:<port>/stardust/migrated/<path>/index.html --profile generic --main "#pjax-container"`. Only
   MAIN-root findings count: 0 structural 🔴, or a logged `migrate.mjs deviation` per justified drop (tracking,
   consent, hidden headline-row icons as on the archetype, AOS opacity states, empty sections). Record
   `migrate.mjs gate <slug> content-count --evidence "…"` and `… content-fidelity --evidence "verbatim from
   capture; deviations: n"`.
5. Delivery lint early per page (`delivery-lint.mjs --file stardust/migrated/<path>/index.html --path /<folded>`).
6. Stop your server by PID. No deploy, no gate-all (the cluster unit follows).
7. Commit own paths only: siblings html, stardust/migrated/<your dirs>, the generator (force-add: .work is
   ignored), variance-landing.json, stardust/state.json. No push.

Report (under 25 lines): first line verbatim from the driver `rendered N, unchanged N, refused N, passthrough N`;
then per slug `slug | path | sections n | modules | variants | content-count 🔴 n / deviations n | lint P0/P1`;
then generator file, variance deltas budgeted, compositions the template cannot express.
