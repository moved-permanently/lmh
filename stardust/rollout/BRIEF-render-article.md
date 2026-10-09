# Unit brief — migrate `render-article-<n>` (siblings of the article/news template). Read
# stardust/rollout/BRIEF-common.md FIRST and obey it. Your task message names the unit and its slugs.

Template: article (archetype `en-technical-news-detail-101184-html`, live
https://www.linde-mh.com/en/technical/News-Detail_101184.html, prototype
stardust/prototypes/en-technical-news-detail-101184-html-proposed.html + .css, served at
http://localhost:8791/en-technical-news-detail-101184-html-proposed.html; migrated archetype
stardust/migrated/en/technical/News-Detail_101184.html/{index.html,_meta.json}; delivered document
content/en/technical/news-detail-101184.html — live and gated: 1440 3.1 % PASS, 360 13.94 % documented
override). Its blocks: `breadcrumb` (empty crumb), `media-carousel` (reconstructive, one row per slide),
`press-contact` (template-slotted), `share-bar` (ships in the footer); the article prose is default content
(h1, h2 intro + p, infobox `p:has(picture)` + caption p, lightbox anchors kept verbatim). Read
`node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md "Archetype article (C-deliver)"` once.
The archetype prototype's MAIN mirrors the source layout classes (`layout-passepartout` > `image-clipper--2_1_max`
stage, `layout-article--centered` prose with `infobox-media`, `carousel-wrapper` > `media-carousel`,
`layout-25--fixed` > `teaser--card` press contact, `inline-button-row` share bar) on the canon chrome.

Siblings: slug `en-technical-news-detail-<id>-html` → live https://www.linde-mh.com/en/technical/News-Detail_<id>.html
→ folded delivery path /en/technical/news-detail-<id>; all typed `article` in stardust/state.json.
Captures (the reference, never a fresh live hit for content): stardust/current/pages/<slug>.{html,json}.

## Method — sibling tier (handoff contract § 1; read it once:
`node stardust/scripts/replica/section.mjs /home/node/adobe-skills/plugins/stardust/skills/replica/reference/handoff-contract.md "1. Migrate"`)
1. Variance probe ONCE for the whole template (all 17 siblings, both render units) if
   stardust/rollout/units/variance-article.json does not exist yet: through run-bg (ONE job, RUN_BG_SLOTS=1)
   `node stardust/scripts/replica/sibling-variance.mjs <archetype live URL> <17 sibling live URLs> --main "#pjax-container"
   --probe stage=".image-clipper" --probe h1=".layout-article--centered h1" --probe prose=".layout-article--centered p"
   --probe infobox=".infobox-media" --probe carousel=".media-carousel" --probe contact=".teaser--card" --probe share=".inline-button-row"
   --json > stardust/rollout/units/variance-article.json` (one browser; add `--headed` only if the run reports a
   challenge). Budget every computed-style delta as a VARIANT of an existing block on the sibling's content
   (declare with `migrate.mjs variant`), presence/count differences are content-driven (a page without a carousel
   simply has no carousel section). Record `variance-probe` on each sidecar with that evidence.
2. Structural clone = a generator generalised from the archetype's shape. Model:
   `stardust/.work/replica/gen-static-sibling.mjs` (173 lines, ESM, `--help`) is the static template's sibling
   generator — same canon chrome import (identical `<link>`/`<script>` lines, `<main id="pjax-container"
   class="content">` shell, page CSS reference `en-technical-news-detail-101184-html.css`; a sibling never gets its own
   CSS file). Write `stardust/.work/replica/gen-article-sibling.mjs <slug>` producing
   `stardust/prototypes/siblings/<slug>.html` (served by :8791 under /siblings/): the MAIN content re-authored from the
   capture into the archetype prototype's shape — stage image (captured src/srcset/alt), the centred prose verbatim
   (headings, paragraphs, lists, links absolutised the same way, infobox picture + caption, lightbox anchors as
   authored), the media carousel when present (one item per slide, picture + caption), press-contact card(s), share
   row; attributes reduced to the archetype's set (class/href/src/srcset/sizes/alt/title/role/aria-label), no
   tracking/data-* attributes, no scripts, no inline styles, no slick clones (dedupe `slick-cloned` slides). Anything
   the template cannot express (video embed, table, accordion, gallery grid, second contact) → render verbatim as
   default content and name it in your report; a real composition → `modules` on the sidecar. Inspect captures with
   `html-slice.mjs stardust/current/pages/<slug>.html ".layout-article--centered" --text`, `… "h1,h2,h3" --all --text`,
   `… ".media-carousel-item:not(.slick-cloned)" --all`, never the whole #pjax-container.
3. Driver: `node stardust/scripts/stardust/state.mjs advance <slugs> --to directed`, then
   `node stardust/scripts/migrate/migrate.mjs render <slugs> --archetype <slug>=en-technical-news-detail-101184-html …
   --source <slug>=stardust/prototypes/siblings/<slug>.html …` (one --archetype and one --source per slug). It writes
   stardust/migrated/<URL-literal path>/index.html + _meta.json. A `refused` line names the strict rule — fix the
   source and re-run. Then per slug: `migrate.mjs modules <slug> breadcrumb media-carousel press-contact` (only the
   modules the page really has), `migrate.mjs variant <slug> <class>` where you used one.
4. Content-count acceptance per page: serve the project root on :8803 (BRIEF-common; article port) and run through
   run-bg, ONE job at a time, `node stardust/scripts/diff/content-diff.mjs http://localhost:8803/stardust/current/pages/
   <slug>.html http://localhost:8803/stardust/migrated/<path>/index.html --profile generic --main "#pjax-container"`.
   Only MAIN-root findings count. 0 structural 🔴 on main, or a logged `migrate.mjs deviation` per justified drop
   (tracking, consent, chat, empty sections, e-mail de-obfuscation as on the archetype). Record
   `migrate.mjs gate <slug> content-count --evidence "<summary line>"` and `migrate.mjs gate <slug> content-fidelity
   --evidence "verbatim from capture; deviations: n"`.
5. Delivery lint early: `node stardust/scripts/rollout/delivery-lint.mjs --file stardust/migrated/<path>/index.html
   --path /<folded path>` — note P0/P1 counts (the cluster unit fixes them in the delivered document).
6. Stop your server by PID. Do NOT deploy anything and do NOT run gate-all: the cluster unit follows later.
7. Commit your own paths only: `git add stardust/prototypes/siblings/<slugs>.html stardust/migrated/en/technical/
   News-Detail_<ids>.html stardust/.work/replica/gen-article-sibling.mjs stardust/rollout/units/variance-article.json
   stardust/state.json` + `git commit -m "render-article-<n>: <n> news siblings rendered (sibling tier)"` — no push.

## Report (under 25 lines)
First line verbatim from the driver: `rendered N, unchanged N, refused N, passthrough N`; then per slug:
`slug | path | sections n | carousel yes/no | infobox yes/no | content-count 🔴 n / deviations n | lint P0/P1 n/n |
modules | variants`. Then: generator file, variance deltas budgeted, anything a sibling needs that the template cannot express.
