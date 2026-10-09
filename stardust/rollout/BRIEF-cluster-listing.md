# Addendum — rollout C-deliver `cluster-listing`: the 10 rendered siblings of the listing template. Read
# stardust/rollout/BRIEF-common.md and stardust/rollout/BRIEF-cluster.md FIRST and obey them. Port 8805, job prefix
# `clist-`, ledger stardust/deploy/ledger-cluster-listing.json, paths file stardust/rollout/units/cluster-listing.paths,
# log section `## Cluster listing (C-deliver)`. Every run-bg start with `--slots 3`, one job of yours at a time.

Archetype: en-about-us-press → content/en/about-us/press.html (live + published; gate 1440 24.96 % Δh −108 and 360 49.6 %
Δh −158, both documented overrides = the Phase 4 signatures; clip 0, content 0/0). Encoder EXISTS: stardust/rollout/
encoders/listing.mjs (`--help`; rows `.header-intro`, `.layout--shadegrey .filter-downloadarea` → filter block
(template-slotted static snapshot), `.layout--teaser .teaser--card` → news-cards block (reconstructive, repeated-unit
family news-card)). Blocks you own: news-cards, filter. Read once: `node stardust/scripts/replica/section.mjs
stardust/eds-conversion-log.md "Archetype listing"`; the archetype unit left these gaps for you: harness/qa-gate local
asserts, section-schema from the rendered URL (the prototype has no sections), `update-coverage.mjs --gate` after the rows.

The render unit's finding (stardust/migrate/progress.json units.render-listing.verdict): only en-about-us-media carries the
press row vocabulary (filter row WITHOUT `layout--shadegrey`, an `h1.h3` before the filter, download cards: no link/subline,
`p.info` + download button → extend listing.mjs: key on `.filter-downloadarea` / `.teaser--card`, add the download-card
cell shape as a news-cards VARIANT `download`). The other 9 pages are section OVERVIEW pages rendered with landing/program
rows: hero stage, `.layout-100--flex` text bands, columns rows, related-teasers (`teaser--card` grids, `layout-33/50--fixed`
families → width variants), standalone teaser carousels, media-carousel, parallax banner; events adds `calendar-list` +
`image-clipper` verbatim; automated-trucks a columns-item media-carousel. Encode those rows by REUSING the landing encoder's
row handlers — stardust/rollout/encoders/landing.mjs (and program.mjs for program-only rows) — import or dispatch per row,
never copy the handlers: listing.mjs becomes a dispatcher (press rows → its own handlers, everything else → landing/program).
Their blocks (hero, columns, related-teasers, teaser-carousel, media-carousel, accordion, infobox) are deployed and are
being tuned by two other agents RIGHT NOW (landing fix round 2: `.columns.flex|.carousel|.testimonial|.red:not(...)`,
hero, accordion, related-teasers facts, media-carousel, teaser-carousel, landing.mjs; cluster-program: `.columns.band|
.split|.feature`, program.mjs): do NOT edit those blocks or encoders — a change you need there goes into your report as
a request line and the row is reported FAIL honestly. `git pull --rebase` before every push (landing.mjs may change under
you — re-run your encoder after a pull). A new block is allowed ONLY for `calendar-list` (events) if no block covers it;
`image-clipper` is a columns/hero VARIANT or default content, decide from the capture.

Siblings (slug | folded DA path | migrated dir under stardust/migrated/):
en-about-us | /en/about-us | en/About-us · en-about-us-events | /en/about-us/events | en/About-us/Events ·
en-about-us-innovations-from-linde | /en/about-us/innovations-from-linde | en/About-us/Innovations-from-Linde ·
en-about-us-magazine | /en/about-us/magazine | en/About-us/Magazine · en-about-us-media | /en/about-us/media | en/About-us/Media ·
en-products | /en/products | en/Products · en-products-automated-trucks | /en/products/automated-trucks | en/Products/Automated-Trucks ·
en-service | /en/service | en/Service · en-solutions-consulting | /en/solutions/consulting | en/Solutions/Consulting ·
en-solutions-overview-html | /en/solutions/overview | en/Solutions/Overview.html.
Live URLs: `json-query.mjs stardust/state.json --path pages --match slug=^<slug>$ --fields slug,url --tsv`.

Gate and override rule (per page, by the rows the page uses): en-about-us-media against the listing archetype's signatures
(a row within 1 pt of 24.96 %/−108 at 1440 or 49.6 %/−158 at 360, clip 0, content 0/0 → override entry with `verdict`,
slug named); the 9 overview pages against the landing template's bar (1440: PASS ≤ 10 % only — no override; 360: within 1 pt
of the landing archetype's 18.56 %/+24 residual → override). Everything else is FAIL, reported with its first hot band.
Cap 3 fix rounds for the unit, in YOUR blocks/encoder/content only. Run gate-all with `--origin-headless --vh 700`, one
width per run-bg job (`--timeout 3000`), `--only <your 10 slugs>`, `--state stardust/rollout/gate-state.json` after
`gate-state.mjs --host main--96d6da00--aemcoder.aem.page --preview`.
Media: 159 download cards → media-reconcile per page; same-origin images stay hotlinked as on every delivered template
(`keep`), PDFs/downloads link to the source URL (no rehost) unless media-reconcile says otherwise.
Budget: ≈ 75 minutes and ≈ $22. Commit after the encode, after the deploy, after each gate width. Stop processes by PID.
Do NOT edit stardust/rollout/progress.json, stardust/migrate/progress.json or state statuses.

## Report (under 25 lines) — verdict line first:
`cluster-listing: pages n/10 live+published, blocks k (new: …), gate 1440 p/10 PASS (worst x%) / 360 q/10 (worst y%), fix rounds
r of 3, requests m`; then per page `slug | 1440 pixel/Δh/clip/content VERDICT | 360 … VERDICT[ → override] | variants`, then
encoder changes (dispatcher), media counts, request lines for the other agents' blocks, anything unfinished and why.
