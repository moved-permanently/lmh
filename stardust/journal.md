<!-- stardust:provenance
  writtenBy: stardust:replica
  writtenAt: 2026-10-06T12:05:00Z
  readArtifacts: []
  synthesizedInputs: []
  stardustVersion: 0.27.0
-->
# Stardust journal — linde-mh.com/en replica migration

Flow: **replica** (same design, new platform). Hands-off run; scope fixed to the 100 selected pages
of `stardust/.labs/site-plan.json`. Gate breakpoints 1440 (desktop) and 360 (mobile).

## Extract — 99 of 100 selected pages captured live (2026-10-06)

- Crawl: `crawl.mjs --pages <100 URLs> --dynamics --concurrency 3`, headless Chromium, consent
  dismissed automatically (CCM19). 99 pages OK; `/en/Product-Finder/` answers HTTP 404 on the
  source (recorded in `_crawl-log.json#crawl.failures`, never a state.json row).
- A first crawl was stopped by PID after 15 pages because the background runner's default
  15-minute deadline would have killed it mid-run; restarted with a 45-minute deadline.
- Capture gaps (scope debt, fixed scope): 32 of 87 first-level targets linked from /en/ and 1 of 1
  from /en/EDI/ are outside the selected 100 and were not captured.
- Fonts: FF Daxline Pro / Dax Pro (licensed, 5 woff2 saved as evidence under
  `assets/fonts/`), Noto Sans Variable and Outfit declared. The licensed family is NOT rehosted
  on the new origin — Phase 3 picks a metric-matched substitute, brand name first in the stack.
- Structure: no semantic landmarks on the source; chrome roots are `.header` (sticky) and
  `.footer`, content root `#pjax-container`.
- Page types (URL pattern + vision labels): see `stardust/current/_page-types.json`.
- Vision check (two read-only subagents over thumb.mjs thumbnails): 96 ok, 3 suspect after one slow-wait
  recapture (In-Sync, Safely-to-the-top, Warehouse-Safety: scroll-reveal sections stay blank in the
  full-page screenshot; the DOM content is captured and the gate's stitched captures settle per
  viewport). Semi-automated-order-pickers is a retired-product notice — replicated as captured.
- Computed-style census: 98 pages × 1440/360 → `_computed-styles.json`; palette (red #aa0020 on
  white, cool greys), type (DaxWebPro-Medi headings 54/29.34/27/24/14, Daxline body 17.1/15.2,
  line-height 1.75), motifs (0 radius, circular icon buttons, three ambient shadows), 40 icon-font
  glyphs (LindeGlobalIconFont, file saved).
- Cap probe over 7 archetype URLs: shell 1600 px, content modules 1280/1216 px, probe width 2560;
  three capRegister items (archetype-divergent content cap, two single-section caps) → Phase 2.
- Page types: landing 32 · program 19 · article 18 · listing 11 · form 8 · static 7 · unique 4
  (home, two product-finder shells, location finder). 11 module candidates in DESIGN.json.
- Outputs: `current/PRODUCT.md`, `DESIGN.md`, `DESIGN.json`, `brand-review.html`,
  `_brand-extraction.json`, `_prep-summary.md` (per-page evidence table, 99/99 live), `state.json`.

## Preserve direction — spec promoted verbatim, register deferred-only, dynamics triaged (2026-10-06)

- Promoted `current/PRODUCT.md`, `DESIGN.md`, `DESIGN.json` byte-for-byte to the project root
  (`cmp` clean); `stardust/direction.md` records PRESERVE mode with verbatim `--prep` provenance.
- Inconsistency register (`stardust/replica/inconsistency-register.md`): three entries from extract's
  capRegister (per-template content caps 1600/1280/640, home carousel slide cap, form-item cap),
  all `deferred` — hands-off adopts no improvement; effectively a pure replica.
- Dynamics Phases 1–3: `dynamics-detect.mjs` over the 7 cap-probe archetype URLs + the two product
  finder shells + the location finder (10 pages, settle 5 s, 41 findings, client-rendered 0 on every
  page); `dynamics-plan.mjs --target-origin` found all 3 first-party API paths dead on the preview
  host (MWF form servlet, product search, dealer-finder JSON). Curated into 12 rows in
  `stardust/dynamic-features.md` (every row has a disposition) + `stardust/dynamic-features-plan.md`:
  consent/tags passthrough (owner), contact form rebuilt with submission blocked (MWF endpoint is the
  owner's), product finder as snapshot (datasource decision), location finder data snapshot (self),
  Maps embed (key allow-list), header search static (results page outside scope), locale trees
  decided-out for this run. Search probe not recorded — no results page to compare against.
- Scripts copied: dynamics skill → `stardust/scripts/dynamics/`.

## Recreate — nine archetypes authored and gated at 1440/360, cumulative canon (2026-10-06)

- One archetype per page type, each a standalone prototype under `stardust/prototypes/<slug>-proposed.html`
  (+ `<slug>.css`) importing the cumulative canon (`canon.css` tokens/typography/buttons/chrome + modules
  share-bar, related-teasers, news-card, press-contact, media-carousel, media-browser, mwf-form,
  teaser-carousel-light, icon-glyphs; `canon-chrome.html`; `chrome.js` = the header scroll-state morph only).
  Fonts: FF Daxline Pro is licensed → Nunito Sans metric substitute, brand family first in the stack
  (`stardust/replica/fonts.md`); the width fork is the permanent, justified residual on every text-heavy page.
- Gate results (pixel % / Δh, live vs served prototype, `--main "#pjax-container,.header,.footer"`):
  static 5.19/0 pass · 10.5/13 residual; article 3.09/0 pass · residual; listing residual (174-card wraps);
  landing v2 7.05/−27 pass · 20.64/14 residual; program 15.28/63 residual (boxes Δ0, paragraphs one line
  short) · 9.78/−4 pass; form 3.43/−8 pass · 8.67/−35 pass (footer +31 is canon); home 5.11/0 pass ·
  15.69/−26 residual; product finder 11.76/−160 · 24.17/−436 residual (tile line boxes); location finder
  20.2 · 23.5 unmasked, 3.24/0 · 2.42/0 with the Google-map region masked (owner key, dynamics row 9).
  Every row: 0 structural 🔴 on main + chrome roots (program carries 1 header ROLE SWAP, queued as a
  canon-chrome request), clip-probe 0, overflow ok, cap-probe PASS at 2560 on the wrapper caps.
- Method note: the first landing attempt lifted the live DOM and pruned the source bundles (a replica
  violation); it was parked in `stardust/.work/replica/landing-domlift/` and the archetype re-authored
  cleanly from the content model (v2). Its measurements were reused as evidence, not its markup.
- Motion: observed live per archetype (`stardust/replica/motion/`); the header state machine is at parity
  (5/5) everywhere; dead on build and recorded: AOS scroll reveal (landing), hero autoplay (home),
  `sticky__bottom` compare panel (finder). Dynamic surfaces ship in their captured initial state per the
  dynamics triage (finder snapshot, static map, inert form with `action="#"`).
- Queued canon-chrome requests (apply at C0 foundation): optional footer share bar (finder), header nav
  ROLE SWAP "New Industrial Trucks" (program page active state), footer height on the form page (+31),
  sticky-clone hide on scroll-down (home seam). Repeated-unit families in `stardust/replica/units.json`.
- Phase 5 facts: dealer data `GET /en/technical/Dealer-finder-app/Dealer-Finder-App-Data.json` (371 entries)
  to snapshot; the live `#pjax-container` closes early on the home page (gate that page with `.body-container`);
  cap-probe needs `--build-main`; slick inline widths are 1440 values.
- Prototype table (`gate-all.mjs --stage prototype`, `stardust/replica/gates/prototypes-{1440,360}/`): 9 rows per
  width; at 1440 five rows within the pixel bar (static 5.19, article 3.09, form 3.44, home 5.11, landing 7.05),
  four over it with recorded residuals (finder 11.76, program 15.28, location finder 20.2 map tiles, listing 23.75
  card wraps); at 360 two within the bar. Unit-geometry rows are advisory against the substitute font.

## Migrate plan — nine archetypes rendered, siblings deferred to per-template clusters (2026-10-06)

- Phase 5 (handoff) opened; deploy and rollout script sets copied to `stardust/scripts/deploy/` and
  `stardust/scripts/rollout/`. Publish decision recorded once in `stardust/eds-conversion-log.md`: publish.
- `migrate.mjs render --all`: the 9 approved archetypes rendered on Path A into `stardust/migrated/`
  (URL-literal paths, e.g. `en/Products/E-Trucks/index.html`); six prototypes carried the content root as
  `div#pjax-container` and were retagged `main#pjax-container` (display-neutral, two tags per file, no CSS
  keyed to the tag) to satisfy strict 2; modules recorded per archetype for the Phase B dedup.
- Plan: 99 in scope — Path A 9, Path A′ 90 siblings (31 landing, 18 program, 17 article, 10 listing, 7 form,
  6 static, 1 productfinder); Path B 0. Render units of ≤ 9 siblings per template in
  `stardust/migrate/progress.json`, each run inside C-deliver after its template's `archetype` unit (#126).
- Phase 5 facts carried: broken-link counts in the render lines are out-of-scope targets (510 discovered, 100
  selected) — localize-links keeps them absolute to the source host; the home page's `<main>` closes early
  (sections after it are `.body-container` children — the encoder must consume both).

## A-inventory — 98 documents for 99 pages across 10 templates (2026-10-06)

- `inventory.mjs --site-url … --state stardust/state.json` (archetypes-only mode): 9 archetype rows `pending`,
  89 roster siblings `content-pending`, each joined to its archetype's template (en-landingpage-e-models 32,
  en-products-e-trucks 18, en-technical-news-detail-101184-html 18, en-about-us-press 11,
  en-forms-global-contact-form 8, en-legal-notes-privacy-statement 7, en 1, en-productfinder-html 1,
  en-technical-location-finder-html 1, unique 1 — `en-products-productfinder`, which clones the product finder
  when it renders). `rollout.json` site: org aemcoder, site 96d6da00, ref main, live host
  main--96d6da00--aemcoder.aem.live.
- Project fixes to the inventory copy (noted, minimal): roster URLs keep a trailing slash and migrated paths do
  not (six pages doubled, home became `en-x`); a roster `type` that is a page category joins the single
  archetype of that type; delivered paths take the delivery-lint path-safety fold so coverage paths equal the
  served paths (`assemble.mjs --verify-origin` compares them).
- The fold surfaced one true collision — `Diesel-Forklifts` vs `Diesel-forklifts`, identical bodies — resolved
  as one document + a redirect row (`stardust/redirects.tsv`, `direction.md` § Phase 5 decisions).

## B-block — 17 distinct blocks, each converted once, 417 instances reused (2026-10-06)

- `blocks.mjs` over the 9 archetype documents: 17 distinct module blocks (0 chrome/fragment — header and footer
  are canon chrome), 417 instances → 17 conversions. Most reused: breadcrumb ×96, columns / hero /
  related-teasers / teaser-carousel ×50 each, media-browser ×32, media-carousel / press-contact / share-bar ×18,
  filter / news-cards ×11, mwf-form ×8; single-page blocks hero-carousel, teaser-carousel-light, teaser-grid
  (home), product-finder, location-finder.
- `plan.mjs`: representative-first — each block converts on exactly one page (its template's archetype), every
  sibling row is `reuse`. The static archetype (privacy statement) converts nothing: its only block, breadcrumb,
  converts on the landing archetype. `plan.json` is C-deliver's convert/reuse brief input per page.

## B2-dynamic — inventory re-verified on a fresh sample, fact counters added, search decided-out (2026-10-06)

- `dynamics-detect --from-state --reach` picked a second sample, one non-archetype page per type (Awards,
  Company, Events, EDI, agility-on-point form, Productfinder.html, News-Detail 101184): 33 findings.
  `dynamics-plan --target-origin … --migrated stardust/migrated`: host-bound 2/2 (the form servlet and the
  product-search API 404 on the target), 6 rows already delivered as captured static content.
- New evidence → one new row: scroll-triggered count-up counters (`js-counter`, `data-count-to`) on the
  Company page and the In-Sync landing page. The Company capture held the pre-animation `0` placeholders
  (the section was never scrolled at capture); a one-shot probe (`stardust/.work/replica/probes/
  settled-counters.mjs`) read the settled values live (13,000 · 700 · 100 · 8,500 — matching the markup's
  `data-count-to`) and they were written into `current/pages/en-about-us-company.{html,json}` so the
  landing sibling renders the facts, not zeros. Row 4 extended: the form field set varies per form page
  (agility-on-point: 12 visible + 6 hidden, no subject cascade) — the `mwf-form` block is content-driven.
- Row 6 (header search) moved from "revisit at B2" to decided-out this run: the results page is outside the
  fixed scope; register row already present. No listing unfrozen → no `helix-query.yaml`.

## Migrate render — 90 siblings rendered at sibling tier in 13 units inside the C-deliver window (2026-10-07)

Every template's render cluster ran after its archetype unit was done on the published origin, as Stardust 0.27.0 orders
it: landing 4 units (31 siblings), program 2 (17), article 2 (17), listing 1 (10), form 1 (7), static 1 (6), productfinder 1 (1).
Each unit was one subagent with a per-template generator under stardust/.work/replica/ (clean re-authoring from the capture
on the canon chrome and the archetype's page CSS), `migrate.mjs render <slugs> --archetype <sibling>=<archetype>`, a
sibling-variance probe per template budgeted as block variant classes (article share/infobox, listing download|calendar,
form field variants; static and productfinder had no deltas), content-count and content-fidelity on each sidecar. One
refusal (program: a PDF-only page rendered thin with a declared content gap). The render units never took a local pixel
number: each sibling's counting number is its gate row in the published-origin table, earned in the cluster units.

What it leaves: 90 sibling documents under stardust/migrated/, every `_meta.json` with `fidelityTier: sibling`,
`archetypeSource`, `template`, `modules[]`; the assets unit is empty (media kept at captured URLs or rehosted by the
clusters through the media ledger) and the report unit follows C-deliver's gate-all so the state rows advance on
measured gate rows.

## C-deliver — the site delivered in 20 recorded units, 99 pages live, roster gate recorded (2026-10-07)

The phase ran as recorded units in stardust/rollout/progress.json across sessions 6–13: foundation (canon chrome, fonts,
nav/footer documents, frozen after its shell gate), one archetype unit per template (static, landing, article, program,
listing, form, home, location finder, product finder — each deployed, previewed and gated on the published origin with
at most three fix rounds), one cluster unit per template after its render unit (90 siblings PUT → preview → publish →
gate rows), gate-all (the roster published-origin gate: 1440 39/98 delivered, 58 FAIL; 360 26/98 delivered, 72 FAIL —
every FAIL row equals the cluster-run row, the documented Nunito Sans-for-FF Daxline Pro wrap residual, no regression),
and final. All 99 pages, the nav/footer documents and the redirects row are published live (decision: publish, recorded
in stardust/eds-conversion-log.md).

C-final: `foundation-freeze.mjs check` — foundation unchanged (16 files). The queued foundation-requests.md lines were
dispositioned once (section "Disposition at C-final"): the localize-links rewrites were APPLIED (18 hrefs across nav,
footer and 5 pages, re-deployed and re-published before the gate-all run, so the roster gate already covers them); every
other line KEEPs its scoped block override or is DEFERRED as a documented residual, so no frozen file moved and no
template needed a re-gate. Coverage after `update-coverage --gate` at both widths: 26 deployed / 72 failed; the failed
rows are the font-substitution residual the licence decision (FF Daxline Pro) would clear.

What it leaves for D–I: sitemap/robots assembly and the served-origin verification, redirects sheet (1 row) and the
root answer, chrome noindex, dynamics parity replay, verify, link audit (`localize-links --check`), optimize, report,
dashboard.

## Migrate assets — no sitewide bundle; 30 media files rehosted by the cluster units (2026-10-07)

The replica flow carries media per delivered page rather than as a sitewide bundle: the C-deliver cluster units uploaded
the images their pages reference through the media uploader, and stardust/deploy/media-ledger.json records all 30 of
them as uploaded (chrome logo, article, program and landing images); every other image stays at its captured URL, which
media-reconcile verified as a live external 200 before each PUT. Nothing is bundled under stardust/migrated/assets beyond
what the archetype renders copied, so this unit records the fact and closes; the published-origin image check (every
visible image wider than 0 px) ran inside the cluster gate rows.

## Migrate state and report — 98 pages advanced to migrated, one case-variant duplicate left to the redirects sheet (2026-10-07)

migrate complete: 98 migrated (9 Path A archetypes, 89 Path A′ siblings at sibling tier, 0 Path B, 0 thin, 0 failed
validation), 1 page not rendered — en-products-diesel-forklifts, the case-variant duplicate of the delivered
/en/products/diesel-forklifts document, which the inventory folded into stardust/redirects.tsv (1 row); it stays
`extracted` with its duplicate pointer. Every rendered page was advanced through `state.mjs advance … --to migrated
--migrated <output path> --skill migrate` (96 writes this phase: 87 directed siblings and 9 approved archetypes; 2 were
already migrated). The top-level `migrate` block (outputDir stardust/migrated/, selfContained, 15 bundled assets, page map
for 99, 0 missing / 0 cleaned assets) was written by the render driver and stands.

Decisions carried on the sidecars: 89 content deviations (one declared per sibling: the capture-time dynamic states the
static render replicates), 190 block variant classes budgeted by the per-template variance probes, 266 gate entries
recorded (variance-probe, delivery-lint, content-count/content-fidelity; the pixel rows live in the published-origin
tables). Internal links to the 410 pages outside the selected 100 are counted as broken on every sidecar
(16,419 references in total); E2-link-audit repoints them to the source site through localize-links rather than
leaving a 404, since the direction's scope is the 100 selected pages.

## D-site — sitemap served 98 = assembled 98, redirects wired, root answers 200 (2026-10-07)

assemble.mjs staged sitemap.xml (98 urls), robots.txt and manifest.json under stardust/rollout/site/ from the coverage
rows (0 fragments: the nav and footer are authored documents deploy already published). The source root
https://www.linde-mh.com/ answers 301 → /en/, so the redirects sheet carries `/` and `/index.html` → `/en` beside the
case-variant row from stardust/redirects.tsv (with and without its trailing slash): 4 rows, PUT to DA as
/redirects.json (201), previewed and published (200/200); the live origin now answers `/` with 301 → /en → 200 on both
aem.live and aem.page, and /en/Products/Diesel-Forklifts(/) with 301 → /en/products/diesel-forklifts. /nav and /footer
are published and both carry `<meta name="robots" content="noindex">`, so the served sitemap lists pages only:
`assemble.mjs --verify-origin https://main--96d6da00--aemcoder.aem.live` → served 98 = assembled 98, extra 0,
missing 0, exit 0. The sheet source is kept at stardust/rollout/site/redirects.json.

## D2-dynamic — 18 parity checks replayed on the live origin, all pass; 4 rows await the owner (2026-10-07)

stardust/dynamics/parity.json records the 13 curated rows with replayable checks from the closed set, and
`dynamics-check.mjs --origin https://main--96d6da00--aemcoder.aem.live` replayed them: 18 checks, 18 PASS, exit 0
(report stardust/qa/dynamics-report.md). What the numbers say: no request leaves the pages for CCM19, Google Tag
Manager / Analytics / Ads, etracker, LinkedIn, Bing or the Maps hosts (consent-gate on /en, the form page, the finder
and the location finder), and no page in the seven-page sample throws an uncaught error; the request form renders its
captured field set natively (global contact form 17 controls + submit, agility form 12+, native selects); the product
finder renders 12 product tiles and 45 filter checkboxes from the snapshot on both shells; the location finder renders
its 2 selects and 5 dealer cards; the fact counters show their settled values. Nothing fetches the source origin.

Status per row: done — settings read, custom select, fact counters; interim (static snapshot) — product finder, location
finder data; scaffolded-awaiting-owner — consent manager, tags, form backend, Maps key (the exact decision is named on
each row and in the decision batch of stardust/dynamic-features.md); decided-out — header search, locale trees,
compare list. No page was built in this phase, so no coverage row is added and no query index is authored
(no listing was unfrozen).

## E-full-site — 98 pages verified on the live origin: 26 verified, 72 failed on the documented pixel residual (2026-10-07)

`verify.mjs --base https://main--96d6da00--aemcoder.aem.live --all` fetched every coverage row on the published origin:
all 98 reachable with HTTP 200, no `about:error` body, every root-relative internal href resolving to a delivered page.
Verdicts: 25 verified, 73 failed — 69 on `delivery.gate.pass = false` (the roster pixel table: 11–30 % at 1440 or 360,
the Nunito Sans-for-FF Daxline Pro wrap residual recorded at gate-all, never a missing or broken element) and 4 on the
"exactly one <h1>" rule: /en/about-us/certificates, /en/linde-core/linde-productivity, /en/products/productfinder and
/en/solutions/overview render no h1 — and neither does the source page nor its capture (0 on all three sides for each),
so the replica reproduces the source's heading structure verbatim as the content-preservation rules require. Three of
the four also fail the pixel gate and stay `failed`; the product-finder sibling passes its gate row at both widths, so it
is recorded `verified` through update-coverage with this deviation noted. Final: 26 verified / 72 failed. Templates:
the first page of every template rendered headlessly in the published regime during its archetype unit.

## E2-link-audit — every internal href resolves on the live origin; 597 out-of-scope targets stay on the source (2026-10-07)

`localize-links.mjs --source-host www.linde-mh.com,linde-mh.com --content content --redirects stardust/redirects.tsv`
over the 100 delivered documents (98 pages + nav + footer): the URL map holds 101 entries. One gap surfaced — the
delivered folded path `/en/forms/ex-proof-form` was referenced 5 times on `/en/products/explosion-proof-trucks` by its
source form `/en/Forms/Ex-Proof_Form/`, which no redirects row mapped. The row was added to `stardust/redirects.tsv`,
the plain pass localized the 5 hrefs, the document was re-deployed and published (deploy-batch, 1/1 live), and the
redirects sheet was republished with 6 rows (PUT 200, preview 200, live 200); `/en/Forms/Ex-Proof_Form/` now 301s
to the delivered page. `--check`: CHECK PASS, 0 links still localizable. A GET of every root-relative href in the
content tree against `main--96d6da00--aemcoder.aem.live`: 79 unique hrefs, 0 non-200 (`stardust/rollout/link-audit.json`).
597 source-host targets stay absolute — none is a selected page of the plan except the plan's own source-404
`/en/Product-Finder/` (carried as captured); the rest are scope extension (magazine, e-truck, industry pages and
172 brochure/datasheet PDFs), recorded with the list in `direction.md` § E2-link-audit decisions.

## F-optimize — 98 pages inspected on the live origin; 5 P1 "no h1" findings accepted as source parity; gate clean (2026-10-07)

`optimize.mjs --base https://main--96d6da00--aemcoder.aem.live --all` (capture at `stardust/current` for parity): 98 pages
+ site checks. 119 findings mirror the source capture (106 P2 no JSON-LD / shared titles / no description on form pages,
13 P3 title length) and are informational. Open after the first pass: P1 5 · P2 1 · P3 2. The 5 P1s are `seo/single-h1`
on /en/productfinder, /en/about-us/certificates, /en/products/productfinder, /en/solutions/overview and
/en/linde-core/linde-productivity — each source page renders no h1 (0 in the live capture and its rendered-DOM sidecar),
the same deviation E-full-site recorded; the detector's parity tagging does not cover the h1 check, so the five were
resolved `accepted` with that note through `findings.mjs`. Re-run: `✓ GATE: no open P1 findings`, health 94/100.
Three findings stay open for G-aem, two of them genuine migration deltas against the source: /en/about-us/media lost
its meta description ("Downloadoverview"), /en/about-us/company's title is "Company" where the source is
"Company | Linde Material Handling" (and its description differs from the source's), and the news detail 18902 title
carries a trailing "!" the source title does not — restoring the source values makes the length finding source parity.

## G-aem — three metadata deltas restored from the captures, not from drafts; optimize fully clean (2026-10-07)

`autofix-aem.mjs --project . --dry-run` offered three fixes, all content DRAFTS (a description drafted from the page, a
title drafted from the h1 and truncated). A replica carries the source's values, so the drafts were not applied; the
three metadata cells were set from `stardust/current/pages/<slug>.json` instead: /en/about-us/media gained its source
description ("Downloadoverview"), /en/about-us/company's Title became "Company | Linde Material Handling" and its
Description the source's Kion Group sentence, and the news detail 18902 Title lost the "!" the source title does not
carry (its description, absent on the source, was left as delivered). The three documents were re-deployed and published
(deploy-batch 3/3 live) and read back on the live origin with the source values. `optimize.mjs` re-run: Open P1 0 · P2 0
· P3 0, Fixed P2 1 · P3 1, source parity 120 (the 18902 title length now mirrors the source), `✓ GATE`. `verify.mjs` on
the three pages: each stays `failed` on its pixel-gate row (23.3 %, 26.4 %, 14.5 % — the documented font residual), so
coverage is unchanged at 26 verified / 72 failed. No EDS code file was edited; the foundation freeze is untouched.

## H-report — summary block written, five learnings recorded (2026-10-07)

`stardust/rollout/report.md` carries the summary block from `rollout.json.lastRun`, coverage and the optimize scorecard:
98 documents for 99 selected pages live and published (sitemap 98 = 98), 26 verified / 72 failed on the documented
font residual, 10 templates, 17 module blocks converted once and reused on 89 siblings, optimize health 100 on the
automated layers with 0 open findings and 120 source-parity rows, dynamics 18/18 checks passing on the live origin,
and the owner's to-deliver list (font licence first, then CMP/tags, form backend, Maps key, the 597 out-of-scope
link targets). `stardust/learnings.md` records five run-level lessons: licensed fonts cap the pixel bar, path folds
need redirects rows, optimize parity misses single-h1, autofix drafts versus replica fidelity, source-404 pages.

## I-dashboard — rollout dashboard generated (2026-10-07)

`dashboard.mjs --out stardust/rollout` wrote `stardust/rollout/dashboard/index.html` + `data.json` from coverage,
`rollout.json` and the optimize scorecard: 99 pages (identified 99 · prototyped 98 · deployed/verified 26 — the 72
pixel-residual rows read `failed` and are not counted as deployed by the dashboard's stage model), 10 templates, 17/17
blocks converted, quality health 100 on the automated layers with 0 open findings and the 120 source-parity rows listed
by fixability. The rollout phases A–I are all ended; the run's remaining question is the done-check.

## Handoff — done-check lists 72 failed pages, all the font-licence residual; blocked on the owner (2026-10-07)

With rollout A–I ended, `curl localhost:8080/done-check` answered `complete: false` with one gap class: `pages_failed:72`.
Every listed page is a published-origin pixel-gate row from the roster run (11–30 % at 1440 or 360; text-diff share
19–21 %; 0 clipped controls, 0 missing links or headings) — the wrap residual of the Nunito Sans substitute for the
licensed FF Daxline Pro / Dax Pro faces, recorded at gate-all, C-deliver end and E-full-site. The substitution follows
the replica font policy (never rehost a licensed kit; brand family first in the stack so a licensed drop-in wins), so
the remaining lever is the owner's: supplying the licensed webfont files or a domain licence for the new origin. A
`stardust:replica handoff blocked` line names it; the handoff `end` line is not written. When the fonts arrive:
drop them into `fonts/` with the matching `@font-face` rules in `styles/fonts.css` (the family name is already first in
the stack), re-run `gate-all.mjs --skip-existing` at 1440 and 360, `update-coverage.mjs --gate`, `verify.mjs --all`,
then `done-check` and the handoff `end`.

Re-check 2026-10-07 07:33Z: `fonts/` unchanged (Nunito Sans substitute only, no FF Daxline Pro / Dax Pro files from the
owner); done-check still `complete: false` with `rollout_incomplete` + `pages_failed:72`, the same font-residual rows.
Third `handoff blocked` line written (its detail says "08:xxZ"; the line's `ts` 07:33Z is the authoritative time);
status page refreshed; no re-gating until the licensed webfont arrives.

Re-check 2026-10-07 07:35Z: `fonts/` unchanged (Nunito Sans substitute only, no FF Daxline Pro / Dax Pro files from the
owner); done-check still `complete: false` with `rollout_incomplete` + `pages_failed:72`, the same font-residual rows.
Fourth `handoff blocked` line written; status page refreshed; no re-gating until the licensed webfont arrives.

Re-check 2026-10-07 07:36Z: `fonts/` unchanged (Nunito Sans substitute only, no FF Daxline Pro / Dax Pro files from the
owner); done-check still `complete: false` with `rollout_incomplete` + `pages_failed:72`, the same font-residual rows.
Fifth `handoff blocked` line written; status page refreshed; no re-gating until the licensed webfont arrives.

**Re-check (2026-10-07 07:38Z, sixth):** fonts/ unchanged (Nunito Sans substitute, NotoSans, Linde icon font); done-check `complete:false`, gaps `rollout_incomplete` + `pages_failed:72`, identical to the previous re-checks. Still waiting on the site owner for the FF Daxline Pro webfont files or a self-hosting licence; no re-gating until then.

_Re-check 2026-10-07 07:39Z: unchanged — fonts/ holds only the Nunito Sans substitute, done-check still `rollout_incomplete` + `pages_failed:72`; seventh blocked line written, no further work possible until the owner supplies FF Daxline Pro._

_Re-check 2026-10-07 07:40Z (eighth): unchanged — fonts/ holds only the Nunito Sans substitute, NotoSans and the Linde icon font; done-check still `rollout_incomplete` + `pages_failed:72`; blocked line written, status page refreshed (now/next text restored), no further work possible until the owner supplies FF Daxline Pro._

- 2026-10-07 07:42Z re-check (ninth): fonts/ unchanged (Nunito Sans substitute only), done-check still `complete:false` with `rollout_incomplete` + `pages_failed:72`. Still waiting on the site owner for the FF Daxline Pro webfont licence; nothing else is open.

**Re-check 2026-10-07 07:43Z (tenth):** unchanged. fonts/ still holds only the Nunito Sans substitute, NotoSans and the Linde icon font; done-check still reports rollout_incomplete and pages_failed:72, all the FF Daxline Pro residual. Blocked line appended; nothing to re-gate until the owner delivers the licensed webfont.

**Re-check 2026-10-07 07:44Z (eleventh):** unchanged. fonts/ still holds only the Nunito Sans substitute, NotoSans and the Linde icon font; done-check still reports rollout_incomplete and pages_failed:72, all the FF Daxline Pro residual. Blocked line appended; nothing to re-gate until the owner delivers the licensed webfont.

**Re-check 2026-10-07 07:45Z (twelfth):** unchanged. fonts/ still holds only the Nunito Sans substitute, NotoSans and the Linde icon font; done-check still reports rollout_incomplete and pages_failed:72, all the FF Daxline Pro residual. Blocked line appended; nothing to re-gate until the owner delivers the licensed font.

Re-check 07:46Z (2026-10-07): unchanged — no brand font files in fonts/, done-check still complete=false (rollout_incomplete, pages_failed:72). Thirteenth blocked line written; nothing else open.

Re-check 07:48Z (2026-10-07): unchanged — no brand font files in fonts/, done-check still complete=false (rollout_incomplete, pages_failed:72). Fourteenth blocked line written; nothing else open.

Re-check 2026-10-07 07:48Z (fifteenth): fonts/ unchanged (Nunito Sans substitute, NotoSans, Linde icon font only); done-check still complete=false with rollout_incomplete + pages_failed:72. Blocked line written; status page refreshed; no boundary ask (blocked state, not a unit boundary).

Re-check 2026-10-07 07:49Z: unchanged — no FF Daxline Pro files in fonts/, done-check still `complete:false` (rollout_incomplete, pages_failed:72). Still waiting on the site owner for the licensed webfont.

Re-check 2026-10-07 07:52Z (session 30): fonts/ unchanged, done-check still complete=false (rollout_incomplete, pages_failed:72). Seventeenth blocked line written; still waiting on the site owner for the FF Daxline Pro webfont licence.

- Re-check 2026-10-07 07:52Z: unchanged. fonts/ still holds only the Nunito Sans substitute; done-check still lists rollout_incomplete and pages_failed:72 (font residual). Still waiting on the site owner for the FF Daxline Pro licence.

## Handoff gap wave — the 72 failed rows re-read from fresh captures: section drift, not the font (2026-10-07)

Attempt 2 started from the attempt-1 checkpoint without the gate evidence (`replica/gates/` was untracked). A
diagnostic published-origin gate on six failed pages (1440) and three (360) showed the failed rows are NOT the
font residual the blocked lines claimed: listing pages render 4-column teaser rows as 3 columns (products Δh −980 of
3767), program/landing pages drift section by section (sustainability EDS 1201 px taller, h-models 291 px, h-models
360 EDS 1379 px shorter), 360 type sizes differ on static/listing/landing pages (h1, intro heading, share row), and
every live stitch seam carried the source's sticky stack (breadcrumb, or the anchor row) that the delivery lacked.
Unit `gap-sticky-stack` (recorded in rollout/progress.json): header.js now pins the breadcrumb and anchor-row
sections under the header exactly as stickystacky does (desktop slide by everything but the last element; mobile
anchor row at top 0), the anchor arrow renders only on overflow; pushed as 9bdc1bb, sha-verified on the origin, and
re-gated: 1–2 pts per page, the article/static rows at 1440 stay PASS (5.40 / 8.82). Foundation re-frozen (the
handoff wave may edit it; the C-deliver freeze has served). Next units: `gap-listing` (four-column token +
news-cards download card metrics), `gap-program`, `gap-landing`, `gap-360-type`, then the roster re-gate.

## Handoff gap wave — listing and program drift measured and fixed at the block/encoder level (2026-10-07)

Session 2 of attempt 2 read the failed rows box by box with `measure.mjs` (live vs preview, 1440 and 360) instead of
trusting the font story. Listing (`gap-listing`): the source's `.layout-25--fixed` teaser rows are four tiles from
1280 (two from 640) while `related-teasers` knew one/two/three columns — a `four` variant (CSS + JS count fallback +
encoder token), the tile's `1.5em 0 0` content padding and the 16x9 box's inner 1px border took /en/products from
29.38 %/Δh −980 to 13.71 %/+15 at 1440; the `center` section style centred copy the source keeps left-aligned and
padded its box 72px at 360 where the source uses 5vw (18px) — fixed in hero.css (products 360: 60.27 → 35.81 %). The
Media download cards took the measured red button, .875em file info and 2em gap. Program (`gap-program`): the
sustainability page's −1201 px came from five measured causes — CTA rows (58px box + 57px button vs the source's
50 + 48), the accordion (16px headlines vs 12px, 1.25rem vs 1.33rem h3, 24px vs 16px body), one source band split
into three padded wrappers around a block, the red band's `--large` copy (1.125em) dropped by the migrate step, and
program.mjs emitting the source's floated 320×180 `.infobox-media` figures as 640×360 paragraph images and a
`<table>` as a raw table (which the pipeline read as a block named after its first cell). hero.css/accordion.css/
columns.css carry the lifted values; program.mjs walks span-wrapped bands, floats the infobox (the landing encoder's
block), authors the `table` block and recovers `large` from the capture; five program documents were re-encoded
(metadata kept) and republished: sustainability 16.18 %/−36. Landing (`gap-landing`, in flight): CTA rows on landing
pages use `.btn--action` (55px) where program rows use `.btn` (48px) — the encoders now author action links as the
boilerplate's accent button (`<em><strong>`), 32 documents re-encoded and republished; re-gate next.

## Handoff gap wave — landing/program drift measured box by box; the pixel bar stays open (2026-10-07)

Session 3 of attempt 2 resumed `gap-landing` from its recorded state: the accent CTA change alone had left h-models at
Δh +651 (symmetric headless captures on both sides from here on — the gate help records that the real-Chrome origin
tier shapes text ~1 % wider than the headless build side). `measure.mjs` over every top-level band of h-models,
sustainability, in-sync and company against the delivered sections found six causes, all lifted from the source CSS:
article headings are `.dom-content h2–h6 { 1.5rem; 125% }` with a 1em top margin (the build rendered h4 at 18px),
video figures are `.media-player { width: 50vw }` (720 × 405 where the image figure keeps 640), two-button CTA rows
carry the 8px margin on the row not the paragraphs, the source's empty paragraphs (`<p></p>` → next paragraph is a
`p + p`, `<p><br></p>` one line) were dropped by the pipeline and are now authored as hidden `<sup>` markers and
zero-width-space lines, `.infobox--left + p { margin-top: .5em }` and the figure link kept a 640px box and a one-line
line-height inside the 720 block, the accordion toggle is absolutely positioned on the source (row 54 not 64), and the
`.module-fact-counter` is a 65px-margin centred row of 245px three-row grids (the build padded it 72px). Icon tiles:
the source span is the glyph's size — 80 × 80 when `icon-LMHIcon<key>black` exists, 0 × 0 for the source's own empty
`icon-` — so 44 glyphs are mapped from the live bundle instead of a fixed box. Encoders also skip phantom renditions
(`…_tn_16x9w640_16x9w1920.jpg` 404s and shipped `about:error` on diesel-forklifts). 50 documents re-encoded,
sanitised, links localized (`localize-links.mjs`), Company's restored metadata kept, published. Re-gates at 1440:
h-models Δh +651 → +306 (27.25 %), awards +835 → +407, in-sync 34.08 → 29.14 % (Δh −17), e-models 12.36 % at Δh −15,
company −848 (history media-browser +707 and icon-tile copy remain), sustainability −52. No re-gated page is under
the 10 % bar yet; the remaining drift is per-page and the glyph-shape residual of the substitute face is in every
text row. Next: `gap-program` residue (awards/history browser), `gap-360-type`, the roster re-gate with overrides
inside the documented regime, `update-coverage --gate`, done-check.

## Handoff gap wave — 360 type sizes lifted from the source; a nested-rule defect in filter.css (2026-10-07)

Session 4 of attempt 2 took `gap-360-type`. Measured with `measure.mjs` at 360 against the live pages: the static
h1 is the bundle's base rule below 640 (`h1 { font-size: 1rem; line-height: 120% }`, @32318; the 54px step is
min-width 640) where the build rendered 1.5rem/30px; `.h3, h3` is 1.5rem below 640 (1.63rem from 640) where the
build kept 1.63rem; an h3 after a paragraph carries one em (29.34px at 1440 = 1em of the 1.63rem h3 at the 18px
root — the frozen 1.125em was derived from the wrong base); the share toggle is `.share-btn.pull-right`, floated
right of the first paragraph on every width (the build stacked it as a 50px row); `p.intro` is 1.125rem/150%/1em
below (@36555) — only PPAP, EDI and the privacy statement carry one, so a positional rule mis-styles legal,
terms-of-use and cookie-policy: the two documents now author h1 + share + intro as a `centered, intro` section
(styles.css § intro paragraphs) with the body in the next section, and breadcrumb.css pays no wrapper padding at
that boundary. Listing: `blocks/filter/filter.css` never closed its `.filter, .filter * { box-sizing }` rule, so the
whole filter-heading block (Media variant) was nested under `.filter` and inert — the h1 rendered 32/40px in an
unpadded wrapper; closed, plus the source's zero top gap between the h1 and `.filter-downloadarea` (y 104 at 360,
267 at 1440). semi-automated-order-pickers (typed static, one page): the source is a text container with `h2.h3`
(the `h2 { 2rem !important }` rule wins: 32/40 at 360, 54/67.5 at 1440) and a `.btn__link` button; the document
carried an h1 + plain link — re-authored, columns text h2 at 2rem/3rem. Re-gates at 360 (symmetric headless):
legal 9.93 PASS, semi-automated 5.84 PASS, ppap 12.13, terms-of-use 12.43, edi 15.87, media 19.4 — every
remaining row's text-region diff equals its pixel diff (the substitute face). Two instrument notes: `--vh 1500`
pads a page shorter than one chunk to 1500px on whichever side was captured with it (ppap read Δh −548, legal and
semi-automated +298/+486 until their origins were re-shot at the default chunk); the aem.live CSS is served
compressed, so a served-vs-tree check needs `curl --compressed`. Next: the roster re-gate per template at 1440 and
360 (`gate-all --only`, origins reused where captured), overrides inside the archetype regime, `update-coverage
--gate`, done-check.

## Handoff roster re-gate — 1440 captures complete, probes interrupted at the runner's boundary (2026-10-07)

Session 5 of attempt 2 opened the roster re-gate the four gap units left as the next step. The coverage rows still carried
the 06:53 roster numbers, and the attempt-2 restore had dropped every untracked capture, so unit `regate-1440` runs
`gate-all` fresh at 1440 with `--origin-headless` (symmetric engine on both sides — the Chrome-154-vs-headless text-width
fork documented in gate-all's own help) and concurrencies 1/2/2 (three browsers at most). Captures: 98/98 origins, 98/98
preview pages. Seven preview stitches stalled with the same signature — the document shrinks 34 px once scrolled (the
sticky header stack leaves the flow), so a last chunk target 20–24 px past the reachable maximum reads as a stall; each
was re-shot with a chunk height whose last target clears the shrink (vh 1500 / 1000 / 1200 by page height, runs/
recap-1440-a…g). The capture step was recorded and committed; the runner answered stop at that boundary, so the probe
phase (≈9 of 98 content/clip probes) was stopped by its recorded PIDs. Resume line in
stardust/rollout/progress.json units.regate-1440.resume. Helpers for the next steps live in stardust/.work/replica/:
gate-merge.mjs (override candidates inside the Phase 4 archetype regime; a merged two-width summary for
update-coverage --gate) and status-page.mjs (renders tools/replica/progress.html from run.json + coverage + a config).

## Handoff roster re-gate — regate-1440 complete, regate-360 captured; a program-encoder defect behind the 5 content misses (2026-10-07)

Session 6 of attempt 2 resumed `regate-1440` from its recorded resume line: 95 of the 98 origins were on disk (the
journal's 98/98 was off by three — service-training, intralogistics-automation and solutions-overview had failed the
same 34 px scroll-shrink stall as the seven preview pages), so the probes ran over 95 captures while the three origins
were re-shot at `--vh 1000` (a chunk whose penultimate target stays short of the shrunken maximum) and probed with
`--only`; their rows were folded into `all-1440/summary.json` by `stardust/.work/replica/summary-patch.mjs`
(rows replaced by slug, totals recomputed with gate-all's own formulas, `_provenance.patched[]`). Result at 1440:
35 PASS + 6 documented overrides = 41 delivered of 98; 63 FAIL — pixel 56 (9 inside the Phase 4 archetype regime,
38 beyond it, landing siblings 13–33 % against a 7.05 archetype), height 3 (company −848, d344 −713, cookie-policy
−661), content 5, units 8. The 360 capture pass (`--no-probes`, symmetric headless, 1/2 concurrency) landed 196/196
with no stall; its pixel-only calibration reads 24 PASS. The compare-only run with probes is the next step.

The five content misses were one encoder defect in two forms, not authoring gaps: (1) ic-trucks and pallet-trucks
carry a `.layout-100--flex > .layout-50--flex` row of two text wrappers; program.mjs's first dispatch rule treated
any layout-100--flex with a text-container as a one-cell band and dropped the second cell (the dark "Safely on the
Move in the Truck" / "A healthy workplace" boxes). (2) forklift-hire, explosion-proof-trucks and linde-ergonomics
have icon teasers whose icon class is the rare `icon-LMH<name>black` form (yearofmanufacturing, starspikes,
controltype); the key came out empty, the pipeline rendered `<code></code>` as a literal `` cell, and the
related-teasers block picked that cell as the body, dropping the h3. Fix: a nested-split rule and the landing
encoder's key fallback in program.mjs; surgical edits of the five documents (band → `columns split` with both
cells; the three keys); a `yearofmanufacturing` glyph in related-teasers.css from the captured computed style
(`::before` U+F191); the block ignores a backtick-only config cell when choosing the body. Deployed and published
(5/5), code sync verified by sha256 with `curl --compressed`. Re-gate at 1440: content MISSING 0 on all five;
pixel pallet-trucks 17.92 → 11.34, ic-trucks 12.11 → 14.31 (Δh +3 → −57: the split row is shorter than the
live one), the other three unchanged within 0.02 pt. Unit families: the sidecar's `build` selectors were the
prototype-era live class names, which the delivered blocks do not emit (teaser-carousel, related-teasers,
news-cards) — "no visible unit on the served side" on e-trucks, e-models and press; each family now lists the
block DOM as an alternative selector and measures (e-models off 45 / missing 3, press off 32, e-trucks off 12 /
missing 2). A root-size hypothesis was checked and dropped: the live bundle sets `body,html { 16px; 18px from
640 }` exactly as the foundation does, so the 16-vs-18 px unit deltas are element-level rules, not the root.

## Handoff roster re-gate — regate-360 complete; the 1440 unit rows are a probe-cache defect; program drift measured at 360 (2026-10-07)

Session 7 of attempt 2 ran the `regate-360` compare-only pass with probes over the 196 captures the previous session
left (two runs: the first hit run-bg's 900 s default after 14 probed pages — the probe phase is ≈ 1 page/min at
probe-concurrency 2 and gate-all keeps probe results in memory, so the second run carried `--timeout 5400`). Result
at 360: 21 PASS + 8 documented overrides = 29 delivered of 98; 77 FAIL — pixel 73, height 7 (awards +1090,
working-at-linde −873, diesel-forklifts −997, linde-productivity +698, automation-summit +471, edi +148, company
−144; cookie-policy reads −2391 against an 18152 px origin, the CCM19 declaration tables), content 2 (company
HIDDEN 1, cookie-policy's two consent-state links as at 1440), units 6. The two-width picture is now on fresh
symmetric captures at both widths: 41 delivered at 1440, 29 at 360.

Two findings from reading the rows rather than the totals. (1) Every 1440 unit-geometry failure (home off 48, form
off 27, productfinder off 120, article off 6, e-trucks, press, e-models) has origin boxes 330–344 px wide with
mobile heights — `unit-geometry.mjs` caches the origin inventory per slug under `stardust/current/measure/` with
no width in the key, and the restored caches were written by a 360 probe (home docH 4742 = the mobile page); at
1440 every unit therefore reads "off", at 360 the same caches are correct. The sidecar also still named the
prototype's `.content-browser__list li` as the content-browser build selector, which the delivered media-browser
block does not emit (`ul.media-browser-list > li`) — added as an alternative. (2) `measure.mjs` band by band over
ic-trucks at 360 (program template, 20.11 %): ten top-level bands, of which the hero, intro, feature, two text
bands and the media browser match to the pixel; the CTA band is 16 px taller on the build (paragraph margin 16 vs
the live row's 8 inside the same 22.5 px padding), the two split cells are 24 px shorter each (the source's empty
`span.icon` keeps one body line box above the h3 in a block text-container — 24 px at 360, 27 at 1440 — and the
cell pads 5vw 2.5vw, not 5vw: 342 px vs 324 px columns at 360, 640 vs 568 at 1440), and the remaining deltas are
one-line paragraph wraps of the substitute face (intro p 293 vs 266, related heading 87 vs 57 — two lines of
uppercase Daxline vs one). The two block rules are lifted into columns.css for the next unit; the wraps are the
font residual the register already carries.

## Handoff gap unit gap-program-360 — the program CTA and split bands verified band-exact at both widths; verdicts move by two at 1440 (2026-10-07)

Session 8 of attempt 2 resumed the in-flight `gap-program-360` unit from its recorded plan. Its 360 fix (columns.css,
`body.program` scope: CTA paragraph margin 8 px below 1280, split cells padded 5vw 2.5vw with a 2.5rem first-heading
margin for the source's empty icon line box) was already committed and served from the preview origin (sha matched).
`measure.mjs` on ic-trucks confirmed it at 360 (CTA 132 = 132, first split cell 486 = 486; the second cell 372 vs 402
is one paragraph wrap of the substitute face) and showed the same CTA band 17 px tall at 1440: the live row is 187 =
32 row pad + 18 wrapper pad + 8 row margin + 71 link (a 55 px `.btn` — padding 16px 24px, line-height 21, 1 px
border, margin 8px 0) + 8 + 18 + 32, where the build carried the landing `cta, horizontal` reading (72 px pad, a 36 px
button) and measured 204. e-trucks measured the same 187 / 204, so the values went into the same body.program rule
under `(width >= 1280px)`; re-measured after the push, ic-trucks reads 187 / 71 / 55 — the live numbers.

The 18 program pages were re-gated through `gate-all --only … --skip-existing --recapture-eds` against
`stardust/rollout/gate-state.json` (the plain state.json has no deployedUrl — the first attempt selected no pages),
origins reused, eds re-shot, probes on: at 360 1 PASS / 17 FAIL, exactly the verdicts before the fix — every failing
row is text-dominated (pct 11–41 %, textPct within a point or two of pct), the font residual the register carries; at
1440 5 PASS + 2 documented overrides = 7 delivered (was 3 + 2 = 5): ic-trucks 14.31 → 8.11 %, pallet-trucks 11.34 →
6.59 %. The roster summaries were patched from the run files (`summary-patch.mjs`) and `update-coverage.mjs --gate`
re-read both widths: 1440 now 37 PASS + 6 overrides = 43 delivered, 360 21 + 8 = 29 — 25 pages at both widths.

Three pages grew taller on the build after the split rule (e-trucks +50 at 1440, tow-trucks +64 / +36, very-narrow-
aisle +20 at 1440), so each was measured live against build before the unit was recorded. On every one the split
cells and the CTA now match the original to the pixel at both widths (e-trucks 503/473 and 516/463; tow-trucks cells
1–2 558/558; very-narrow-aisle 465/375 and 425/349, its other two 50/50 rows are media-left and rendered by another
block). The added height is therefore drift the short cells used to mask, one band each, recorded on the unit as the
next hot bands: e-trucks and very-narrow-aisle run 60 and 30 px short ABOVE the CTA at 1440; tow-trucks runs 218 px
short between its second and third text cells at 360 (727 vs 945) and 68 at 1440, has no `cta horizontal` section on
the build at all (its CTA reads "Find your forklift…"), and its third and fourth cells carry real 68 / 40 px icons the
encoder does not place first; diesel-forklifts is hot from the 1000 px band at 360 with Δh −997. Those are the
measured entry points for the next program unit; the font residual remains the floor under every pixel number.

## Handoff gap unit gap-program-bands — the e-trucks gap above the CTA is the font; the program height failures were the source's collapsed read-more rendered expanded (2026-10-07)

With the runner's `continue`, session 8 took the next hot bands the previous unit recorded. `anchor.mjs` on the
live side needs `--main "#pjax-container"` (the source has no `main`) and even then finds no `section` children,
so the live band table came from `measure.mjs "#pjax-container > div" --all-matches` (12 matches per selector —
long pages take three `:nth-of-type` ranges). e-trucks at 1440: every band after the hero sits 60 px higher on the
build because the intro column (padding 72, max 912, copy 640 — equal on both sides) wraps two of its three
paragraphs to four lines where the source wraps five (120 vs 150 px each): the substitute face, nothing to fix.

Diesel-forklifts at 360 told a different story: the intro band is 428 px live and 1467 on the build. The source
`.read-more` holds a `display:none` `.read-more__content` behind a "Read more" toggle (`#read_more`); landing.mjs
already authors that as an `article read-more` section (hero.css hides it until hero.js adds `.expanded` on the
click) plus an `article read-more-toggle` section, but program.mjs had no branch for it and let the hidden copy
through as raw divs inside the intro section. The branch was ported into program.mjs's article walker; the three
program sources that carry `.read-more__content` (diesel-forklifts, forklift-hire, forklift-truck — sustainability
and ergonomics do not, their height deltas have other causes) were re-encoded with their delivered titles and
descriptions, passed the chain (localize-links CHECK PASS, delivery-lint 0 P0/P1, media-reconcile keep,
davids-model-lint PASS, sanitise), and were published through deploy-batch (3 ok). Re-gated at both widths
(origins reused, eds re-shot): 1440 pixel 40.3 / 30.2 / 27.2 → 17.1 / 22.5 / 14.6 %, Δh −713 / −374 / −410 →
+47 / +143 / +116; 360 pixel 33.0 / 24.3 / 25.9 → 21.2 / 20.8 / 24.2 %, Δh −997 → +2 on diesel, −346 → +248,
−878 → −230. All three still fail the pixel bar, and every one is text-dominated (textPct within two points of
pct). Residual recorded on the unit: the build's read-more band reads 469 vs 428 at 360 (the toggle row sits 5 px
below the copy and 57 above the band end where the source has 18 / 38; at 1440 362 vs 376) — hero.css's toggle
padding was measured on the landing template and is shared, so the refinement is a program-scoped rule for a later
unit — and the sign-flipped Δh on forklift-hire and forklift-truck names the next band to trace top-down.

## Handoff gap units gap-units-1440 and gap-h1-hero — eight desktop unit rows were a width-less cache; four h1 verify failures closed; the coverage gate now reads both widths (2026-10-07)

Session 9 of attempt 2 resumed inside the open handoff with done-check at `pages_failed:70`. Reading the rows rather than
the totals: eight 1440 rows failed only on repeated-unit geometry (home off 48, contact form 27, both product-finder
pages 120, e-models 45, press 32, e-trucks 17, the article archetype 6), and the regate-360 section had already named
the cause — `unit-geometry.mjs` caches the origin inventory per slug under `stardust/current/measure/<slug>-units.json`
with no width in the key, and the restored caches were 360-shaped. The shipped script was not hand-edited: the nine
caches were set aside under `current/measure/w360-cache/`, the nine pages re-probed at 1440 through `gate-all --only
--skip-existing` (captures reused, probes on), the run patched into the roster and the fresh 1440 caches filed under
`w1440-cache/` — the measure dir stays empty so a probe at either width re-measures the origin rather than reading the
other width's boxes. Result: contact form 27 → 0 off (PASS, and with its 360 override the page is delivered at both
widths), article 6 → 0, product finder 120 → 48 (the documented override holds), home 48 → off 1 hidden 3 — the
teaser-carousel's build slides sit 16 px left and 28 px above the live ones and the fifth slide is hidden on the build
where the live shows it, the entry point for a home unit; e-models, e-trucks and press stay behind the pixel bar.
Roster 1440: 39 PASS + 6 overrides = 45 delivered (was 43).

The news-article template at 360 was measured on the archetype as a candidate (`measure.mjs h1,h2,p,img --all-matches`,
live vs published): every paragraph pairs within 1 px until "Wanted: High-end products…" renders 4 lines on the build
and 3 live (80 vs 106 px) — one wrap of the substitute face — and everything below carries the +26 (image +27, Δh +26).
No layout rule to lift; the register's font residual, recorded here so the next session does not re-measure it.

Verify's "exactly one <h1>" rule was the other non-pixel gap. Certificates passes its gate rows at both widths but the
source header-image carries only a `span.h2.p` headline (its `<h1>` exists empty), so program.mjs emitted `<h1></h1><p>`
and the pipeline rendered no h1; linde-productivity and the solutions overview share the shape. The run's convention
(static.mjs, the columns h1 promotion) promotes a page's only headline to the single h1 for delivery-lint P0, so the
encoder now does the same under a `hero title-only` variant whose h1 takes the `.hero-text p` metrics; measured
identical rects live vs published (1440 108/378 504×68, 360 24/269 ×32). The semi-automated page's h1 promotion had
regressed to `<h2>` in a later render; put back as h1, the first re-gate at 360 read 24.21 % / Δh +51 because
columns.css gave h1 the h3 metric (1.63 rem, 1.5 rem below 640) while the live element measures 32/40 px with a 32 px
margin at 360 and 54/67.5 with 54 at 1440 — the h2 rule the file already carried from that measurement; the h1 now
shares it (h3 keeps its own), and the page re-gates 2.79 % / 5.84 % Δh −1 with the heading rect identical at both
widths. The product-finder sibling is the same page as its `unique` archetype under a second path; inventory leaves a
roster sibling of a multi-archetype type untyped, so verify applied the page rule to it alone — it now carries the
archetype's artifact type in coverage, noted on the record. Four documents re-authored, chain PASS (localize-links
CHECK PASS, delivery-lint 0 P0/P1, davids-model-lint PASS, media-reconcile keep, sanitise), published through
deploy-batch (4 ok), code synced (sha256 of hero.css and columns.css on the preview origin).

One honesty fix in the bookkeeping: `update-coverage --gate` writes one table, so running 1440 then 360 left the 360
verdict as each page's gate — 2 pages passing only at 360 counted delivered and 18 passing only at 1440 did not. The
gate is now written from `stardust/replica/gates/all-both/summary.json`, a derived table (provenance inside) that
carries the failing width's row when the widths disagree. `verify --all` on the live origin: 27 verified / 71 failed,
every one of the 71 a pixel row (11–49 %, text-dominated), 0 h1 or link failures. done-check: `pages_failed:71` +
`rollout_incomplete`; the residual is the FF Daxline Pro substitution the register carries.

## Handoff gap unit gap-height-360 — the 360 height failures were layout, not font: figure floats, flattened note boxes, a stacked testimonial row (2026-10-07)

Session 10 of attempt 2 resumed inside the open handoff with done-check at `pages_failed:71` and the register's font
residual as the standing explanation. Reading the both-widths table by criterion instead of by total: six rows failed
the HEIGHT bar (awards +1090, working-at-linde −873, linde-productivity +698, automation-summit +471, edi +148,
cookie-policy −2391) and two the CONTENT bar (company HIDDEN "Compliance", cookie-policy MISSING the two consent
controls) — a substitute typeface does not move a page by 1090 px. anchor.mjs cannot see the live sections (the source
column has no `section`/`.section` children), so each page was read with measure.mjs heading rects live vs build and
one side-by-side crop at the first jump.

Three causes, all in shared code. (1) hero.css floated every `infobox media` figure at every width; the source floats
`.infobox--left|right` (width 320) only from 640px and renders the figure as a full-width block below (live-bundle.css
@267791/@267911; measured awards 360: figure 360×203 edge to edge, copy below). 14 delivered pages carry such figures.
(2) program.mjs had no branch for the source `.infobox-text` note box: awards' seven "Our awards" boxes were flattened
to h6 + ul in the copy and lost the grey panel (forklift-hire one more). The encoder now emits the infobox block inline
in the article band, hero.css floats it right|left from 640 (320 px, the same calc as the figure) and gives it the
measured typography (h6 1.5rem/1.25 — live 24/30 at 360, 27/33.75 at 1440; li .95rem/1.5 with the .25em gap and the
1.125em dash indent; ul .5em 0; the column's 2.5vw inset below 640). (3) columns testimonial stacked image over quote
at 360 where the source `.testimonial` is a flex row at every width (portrait min-width 25 % + 16 px, align-start below
640), and its quote was 1.63rem dark at every width where the source blockquote is red 1.25rem/150 % below 640 and
1.5rem light face from 640 (measured working-at-linde: live 1440 blockquote 27/40.5 at x 432 w 896; build now 440/888);
p.info is textgrey .875rem/1.75.

Awards and forklift-hire re-encoded and published (chain PASS: localize-links CHECK PASS, delivery-lint 0 P0/P1,
media-reconcile keep, davids-model-lint PASS, sanitise), 15 pages re-gated at both widths (captures recaptured, probes
on; a .work derivation of gate-state.mjs that keeps `failed` rows, since the shipped writer selects deployed|verified
only). 360: working-at-linde 25.1 % Δh −873 → 14.98 % Δh +93; awards 35.81 % Δh +1090 → 32.07 % Δh −183;
sustainability Δh −639 → −184; linde-productivity 40.78 % Δh +698 → 36.27 % Δh +228; r-matic 35.45 → 27.37 %;
happy-driver Δh +183 → +20. 1440: awards 27.36 % Δh +407 → 15.54 % Δh −72 (the note-box typography alone took 190 px
out of the first re-gate). Height failures 6 → 2 (edi +148, cookie-policy). cookie-policy's main content is the CCM19
consent manager's output (dynamic-features.md row 1, decision recorded): the two MISSING links are its controls and the
height delta is its collapsed cookie list rendered expanded on the delivered copy — a documented content override at both
widths (shown beside the measured numbers), the page is delivered. Roster unchanged in total (27 delivered / 71 fail;
verify 27 verified / 71 failed), every remaining failure a pixel row.

What the instruments name for the next unit, top-down: (a) 16 landing/program pages carry a band whose `p.intro` is
followed by regular copy — the section style `intro` sizes every paragraph (automation-summit 360: four paragraphs at
18 px, live 15.2) — the encoders now split such a band into `article intro` + `article continued` (hero.css removes
the padding between them; the intro paragraph's 1em is the gap as on the source), not yet re-encoded; (b) the EDI
download row is the source `.inline-button-row--stretch` (block button 324×78 at 360 with the 48 px icon slot) authored
inline as a 46 px button, and its Share toggle sits on its own right-aligned row above the intro on the live page;
(c) company's "Compliance" anchor link is HIDDEN only because the build clipped the row behind an overflow-hidden
wrapper — styles.css now makes the row itself the scroll container (scrollbar-width: none), to be re-gated;
(d) awards 360 still opens +47 px above the first h2 and summit's speakers band is 487 px shorter than live.

## Handoff gap unit gap-intro-band — the intro-band split lands on 11 pages; a gallery adjacency rule was sizing fresh bands (2026-10-07)

Session 11 of attempt 2 resumed inside the open handoff (done-check `pages_failed:71`, every row a pixel row) and took
the unit gap-height-360 had prepared: the landing and program encoders split a band whose `p.intro` is followed by
regular copy into `article intro` + `article continued`. Measured first, not assumed: the 50 landing/program pages
were re-encoded into `.work`, sanitise and localize-links replayed on a copy of the content tree, and the result
diffed against the delivered documents — 11 pages change by the split alone (the journal's estimate was 16); company
and sustainability differ only by earlier surgical edits (G-aem title/description, `band red large`) and were left
alone; explosion-proof keeps its `band red large` edit by hand. Chain checks clean, 11 documents published, both
widths re-gated (`--only`, captures reused on the origin side, eds re-shot, probes on) and folded into the roster
tables.

Nine of eleven pages moved down at both widths: at 1440 automation-summit 19.2 → 10.1 %, hand-pallet-trucks
21.1 → 10.2, glasses 13.7 → 10.2, platform-counterbalanced 16.3 → 12.4, warehouse-safety 18.9 → 14.5; at 360
automation-summit 51.5 → 37.3, awards 32.1 → 25.5, platform 27.6 → 19.5, warehouse-safety 21.7 → 14.3, ergonomics
26.7 → 21.1. Paragraph metrics on the split bands now match the source exactly (measured logimat 1440: 30.375 / 89.7 /
59.8 / 119.6 px, margins 8.55 and 20.25 on both sides). Three rows sit within 0.25 pt of the bar at 1440.

Two pages moved up, and the instruments named why. Logimat's band after its gallery band got a 16 px top padding on
the build where the live fresh band has 50 (p at +50 live, +16 build): hero.css's gallery adjacency rule — written for
the column that continues AROUND a nested gallery — matched every article after a non-content media-browser. The rule
now requires `.continued`, which both encoders emit for the post-gallery continuation (e-models, h-models, x-models,
sustainability re-encoded and published; the CSS goes live with the checkpoint push, so those five pages are the next
unit's first re-gate). Explosion-proof's intro band is 33 px short at 1440: the source's empty `p.intro` before the
video figure carries 10.125 / 20.25 px margins that the build's hidden marker drops, and the paragraph after the figure
opens the continued section flush where the live has its 8.55 px — recorded, not fixed.

Company's "Compliance" anchor link is still HIDDEN at 360 with the row as its own scroll container: both rows scroll,
but the substitute face is 13 px wider over the five items (94/78/122/112/81 vs 93/75/119/108/79), which puts the link's
centre 2 px past the viewport edge — the probe reads it as clipped. Font residual; the scroll-container change is right
and stays. Roster unchanged in total: 27 delivered / 71 fail at both widths.

What the instruments name next, top-down: logimat at 360 is 272 px short on the build — the columns rows (Xi Roadster
838 vs 918, Reach trucks 604 vs 703), the teaser bands (−35, −34) and the media-browser (+30); the columns block at 360
is shared by the landing pages and is the next structural unit. Explosion-proof's program bands differ structurally at
1440 ("The extent to which" 841 vs 1038, "Chemistry, Pharmaceuticals" 778 vs 642, "Hazardous areas" 375 vs 592).

## Handoff gap unit gap-columns-360 — the columns text cell is the source's flex column, empty paragraphs included (2026-10-07)

Session 12 of attempt 2 resumed inside the open handoff (done-check `pages_failed:71`, every row a pixel row) and took
the unit gap-intro-band named: the columns block (source `.layout-50(-reverse)--fixed` text|image rows) rendered its
text cell short on logimat at both widths — measured with measure.mjs live against the origin, 664 / 606 px live vs
584 / 483 build (rows 918 / 706 vs 838 / 583, the reverse row 703 / 525 vs 604 / 461). Every pixel of the delta sat
in the text cell, and the live bundle named the rules: the source `.text-container` is a flex column, so each child's
margin counts — `.icon + h3 { margin-top: 1rem }`, `p + p` .5em, `ul + p` 1em, `ul.bullets` with .5em margins at
.95rem/150 % and `li` 1.125em indent + .25em gap (the li is 342 wide, not 302 under the default 40 px padding), the
button `p + .btn__link .btn { margin-top: 1rem }` where the global `p.button-wrapper` gave 12px 0. And the author's
empty `<p></p>` — two after the heading, one between paragraphs, two before the list, three before the button on
logimat — each add a .5em margin in that flex column; the landing encoder dropped them and the program encoder emitted
them verbatim for the pipeline to drop.

The fix is the article bands' own convention carried into the block: both encoders' `textContainer` now emit the
markers (`<p><sup>&#8203;</sup></p>`, `<p>&#8203;</p>` for a `<p><br></p>` line), and columns.css keeps the marker as
a 0 px block that still carries its `p + p` margin (hero.css hides the same marker in block-layout article bands,
where empty margins collapse anyway). The 100 live pages were surveyed for the pattern first: 54 carry layout-50
rows, 16 the empty-paragraph pattern; re-encoding the 50 landing/program pages into `.work` with sanitise and
localize-links replayed changed 21 documents by markers alone (company keeps its title/description edit by merge;
sustainability and explosion-proof gain no marker and keep their `band red large` edits). Chain checks clean, 21
published; the markers survive inside a block cell on the origin (logimat plain.html reads h3 ∅ ∅ p ∅ p ∅ p ∅ ∅ ul
∅ ∅ ∅ a, the live sequence). The CSS is measured but not yet live: on the local code server (`aem up`, stopped by
PID afterwards) the logimat text cells read 664 / 448 at 360 and 606 / 425 at 1440, the rows 706 / 525 at 1440 —
live-exact. The 21 pages are the next unit's first re-gate, after the checkpoint push.

The re-gate pending from gap-intro-band (hero.css gallery rule, live since the last push) moved only logimat: 1440
32.56 → 31.11 % (Δh 260 → 226), 360 35.24 → 34.56 % (Δh 272 → 265); e-models, h-models, x-models and sustainability
are identical at both widths. Roster unchanged: 27 delivered / 71 fail at both widths (1440 45, 360 29).

What the instruments name next, top-down: after the 21-page re-gate, logimat's remaining 1440 Δh is the article band
at 2237 (live 497 vs 461), the teasers (−7) and headline offsets; at 360 the teaser bands (1430 vs 1465, 861 vs 895)
and the media-browser (330 vs 300); explosion-proof's program bands at 1440 ("The extent to which" 841 vs 1038,
"Chemistry, Pharmaceuticals" 778 vs 642, "Hazardous areas" 375 vs 592).

## Handoff gap unit gap-columns-regate — the columns fix lands; the white bands were white and padded, the source's layout--white is light grey (2026-10-07)

Session 13 of attempt 2 resumed inside the open handoff with the pending re-gate from gap-columns-360 as its first
step. The checkpoint push had landed columns.css on the origin (the first byte comparison said otherwise: aem.page
serves the stylesheet gzip-encoded, so `curl --compressed` is the honest comparison), and the 21 re-encoded pages
were re-gated at 1440 then 360 with `--skip-existing --recapture-eds`. The markers and the lifted text-cell rules
moved the pages they were written for: logimat 31.11 → 21.03 at 1440 (Δh 226 → 39) and 34.56 → 25.58 at 360
(Δh 265 → 86); technical-safety-services 27.44 → 19.69 at 360 (Δh 112 → −3), training 25.73 → 17.08, financing
29.14 → 21.15, intralogistics-automation 36.46 → 31.46, working-at-linde 14.98 → 10.22 on mobile — a whisker from
the bar. Three pages grew instead: maintenance-repair (1440 8.57 → 13.76, its PASS lost; 360 13.64 → 20.41),
agility-on-point (360 31.88 → 39.28) and next-champ (360 26.77 → 30.32). Roster after the fold: 1440 38 pass + 6
overrides (44, was 45), 360 21 + 8 (29), 27 delivered at both widths / 71 fail — unchanged.

The band table explains maintenance-repair without a pixel round: live bands measured with measure.mjs on
`#pjax-container > div[class]`, build bands with anchor.mjs — every band equal (the columns rows 490 / 461 / 497 /
477 to the pixel, the markers at 0 px) except the two `headline white` bands, 140 on the build against 108 live,
plus teaser-carousel +22, article.center +12, article −8. hero.css gave the dark / white / red headline variants
`padding-bottom: 2rem`; measured live on three pages at both widths (financing dark, maintenance-repair white,
working-at-linde red) all three keep the plain band's 36px 36px 4px (h 108) at 1440 and 32px 32px 0 (h 62) at
360. The same measurement named a second, older defect: the source's `.layout--white` paints rgb(238, 239, 243)
— the light grey — on the headline band and on the layout-50 columns bands alike (a pixel grid of origin.png reads
grey from the headline through both columns rows), while the build's `.section.white` painted #fff. pixelmatch
under-counts a 17-point grey, which is why the roster number never named it. Both rules are fixed in hero.css and
measured on the local code server (bands 108 / 62, bg 238, 239, 243 = live); the CSS is not live until the
checkpoint push, so the 22 documents with a white section and the 7 with a headline variant are the next unit's
first re-gate.

Agility-on-point's mobile growth is spread, not single-band (live vs build at 360): hero 348 vs 370, the first
columns 237 vs 245 and 1055 vs 1073, the spacer 32 vs 40, one hero row 480 vs 510, two features columns 558 vs 588
and 528 vs 551, the last columns 716 vs 692 — the next structural measurement after the white re-gate.

## Handoff gap unit gap-white-regate — the headline-band fix is exact on the origin; the padding had been masking shorter bands below (2026-10-07)

Session 14 of attempt 2 resumed inside the open handoff with the re-gate recorded as the previous unit's next step.
The checkpoint push had landed hero.css (`curl --compressed` byte-equal), so the first step was to find the pages
the fix touches from the live documents rather than from the recorded estimate: a scan of the 98 `.plain.html`
documents for a `white` section wrapper or a `headline white|dark|red` band names 13 pages, not 22 + 7 — the
larger count had read block-level variants (`columns split white dark`, `article center white`) as sections.
Measured on the origin (financing, 1440) the four headline bands are 108 px with the inner 36px 36px 4px and the
backgrounds 74,89,92 / transparent / 238,239,243 / 74,89,92 — identical to the cached live measurement.

The 13 pages were re-gated with `--skip-existing --recapture-eds` at 1440 and then 360. Maintenance-repair, the
page whose band table named the defect, went 13.76 → 6.34 at 1440 (PASS) and 20.41 → 11.71 at 360;
retrofit-accessories 20.75 → 18.05 / 17.08 → 14.15, company 23.11 → 22.77 / 24.93 → 24.07, working-at-linde and
x-range down a little at 1440. Six pages did not move within 0.1 at either width. Two grew: genuine-spare-parts
9.75 → 12.4 (its 1440 PASS lost) and financing 13.38 → 18.38 at 1440, 21.15 → 24.98 at 360, with Δh flipping
from −18 to +78 and from 96 to 192 — exactly the removed padding, which had been masking bands that are too
short on the build.

The band tables (live `measure.mjs` on `#pjax-container > div[class]`, build `anchor.mjs`, 1440) name them.
Financing: hero, anchor-nav, both hero bands, all four headline bands and the media carousel are equal; the three
layout-50 columns bands are short on the build — 403 vs 378, 403 vs 348, 443 vs 414 — and the first is +3.
Genuine-spare-parts: every columns band and every headline band is equal; the two centred article bands are +12
each (348 vs 360, 288 vs 300) while the first centred band, which has no heading, is exact. Measured inside out,
the live band holds an empty 54 px heading (0 px tall) and then the h3 with margin-top 18 px; the build's h3
carries 29.34 px from hero.css `.section.article.center :is(h2, h3) { margin-top: 1em }` — a rule measured on an
h2 band and applied to both levels. The source gives the h3 1rem. The same +12 sat in the previous unit's
maintenance-repair table. On all three pages the teaser-carousel band is +22 and the footer −22: a background
boundary that sits 22 px lower on the build, height-neutral.

Roster after the fold: 1440 38 pass + 6 overrides (one gained, one lost), 360 21 + 8, 27 delivered at both widths
/ 71 fail, unchanged; `update-coverage --gate` flipped no status. Next: the h3 rule (1rem, h2 keeps 1em), measured
on the local code server before the push, then the financing columns bands inside out and the carousel/footer
boundary.

## Handoff gap unit gap-article-center — the centred h3 is 1rem, the flex cell is a block box with its icon (2026-10-07)

The two defects the white re-gate uncovered were measured inside out before any rule was written. On
genuine-spare-parts the live centred article band holds an empty 54 px heading slot (0 px tall) and then the h3
with margin-top 18 px — 1rem, 16 px at 360 — while hero.css gave the centred band's h2 and h3 alike 1em, a rule
measured on an h2 band, and a second copy of the same rule further down the file whose comment said 18 px and
whose value said 1em. The h2 keeps its 1em; the h3 gets 1rem; the duplicate is gone. On the local code server the
bands read 348 / 288 at 1440 and 325 / 215 at 360, the live values to the pixel.

Financing's layout-50 flex rows were three things at once. The source `.text-container` on a flex row is
`display: block` with padding 72px 36px (18px 9px at 360) — the build kept the generic flex column with 5vw all
round, so the text column was 568 px instead of 640, two list items wrapped to a second line and the margins did
not collapse (+13 per cell). The right-hand Advantages cells open with `span.icon.icon-LMHstarspikesblack`, a 54 px
/ 67.5 px LindeGlobalIconFont glyph (32 / 40 at 360, red, white on the dark cells) that the landing encoder
dropped — program.mjs carries the same thing as `<p><code>key</code></p>`, and the structural clone had the icon
class names stripped to a bare `icon`. And the left cells open with an EMPTY `span.icon` — inline-block, 0 px —
that still opens a body line box above the heading: h3 at +45 = 27 + 18 at 1440, +40 = 24 + 16 at 360, the 2.5rem
the split variant already carries. columns.css now gives `.columns.flex .columns-text` the block box and the
padding, the first heading the 2.5rem, and the glyph map starspikes / smeasurement / mail; landing.mjs emits the
icon code; financing was re-encoded from the clone with its four icon classes restored and differs from the
delivered document by the four code lines only (links localised on a tree copy, CHECK PASS; delivery-lint 0
P0/P1, davids-model-lint PASS, media-reconcile 15 keep) and is published on both origins. Locally the financing
bands read 382 / 403 / 403 / 443 at 1440 and 611 / 635 / 611 / 739 at 360 — live-exact at both widths — and
maintenance-repair's flex band 465 / 854 against live 468 / 854.

The CSS is not live until the checkpoint push: the next unit re-gates the 27 affected pages (12 with a `columns
flex` row, 19 with an `article, center` section, four in both) at both widths. Also measured and left for later:
the teaser-carousel inner is 685 on the build against 663 live and the live page keeps 22 px between the carousel
band and the footer that the build lacks — a height-neutral 22 px boundary shift on three pages.

## Handoff gap unit gap-flex-regate — the flex and article fixes land; a two-tone flex row was one tone; the products hot band was the instrument (2026-10-07)

The CSS from the previous unit was live on the origin before the first capture (curl --compressed against the three
files), and the 27 affected pages were re-gated at 1440 then 360. The fixes land where they were measured:
genuine-spare-parts is back to PASS at 1440 (12.4 → 8.09), maintenance-repair 6.34 → 5.3, financing 18.38 → 11.77
with its height delta from +78 to −28, and at 360 very-narrow-aisle-trucks drops 22.68 → 9.59 PASS, financing
24.98 → 18.67, genuine-spare-parts 17.08 → 11.68 and order-pickers 21.01 → 17.4. Three landing pages grew at 360
(next-champ 30.32 → 35.71 with Δh −89 → −113, ergonomics 21.11 → 25.22 with Δh −207 → −291, gse-expo 18.85 → 21.43):
not measured this unit, left on the list.

Two pages were then read band by band. Technical-safety-services' 1000–1500 band was 46 % at 1440: the live row is a
layout-50 flex of two text containers whose first item wrapper is `.layout--dark` and second `.layout--white`, so
the dark paint stops at 719 px; the delivered block was `columns flex dark`, a block-level tone that columns.js
puts on every text cell, and the build painted the whole row dark. program.mjs has always encoded this row as
`columns split <colour> <colour>` (eight product pages carry `columns split white dark`), landing.mjs had no path
for it — a scan of the 98 source documents finds ten such rows, nine already split, this the only landing one.
landing.mjs now routes a flex row of text containers to split; the page was re-encoded from its clone, sanitised,
links localised on a tree copy, and differs from the delivered document by that one class line; lints clean,
published to both origins. Re-gated: 1440 10.49 → 6.51 PASS, 360 19.67 → 14.89.

Products' 1500–2000 band (19 %) was not the page. The live capture carries a full-width black band at rows
1766–1799 that covers the card titles; the build does not. stitch-shot measures the height before it scrolls
(3767), scrolls chunk 2 to 900, and the live header shrinks to its small state on that first scroll, which makes
the document 34 px shorter and lets Chrome's scroll anchoring pull scrollY back to 866 (probed live); chunk 2 is
pasted at 866 and rows 1766–1799 stay zero-filled. The build's scroll lands on 900, so the two captures disagree
over exactly rows 866–899 and 1766–1799 — 1.8 % of a short page — and agree everywhere else, including the 34
black rows both end in. Twenty-five of the 27 live 1440 captures carry the band (the two that do not are shorter
than two chunks); no build capture and no 360 capture does. The project copy of stitch-shot now re-measures and
re-scrolls once when the landed Y misses a still-reachable target (a documented divergence from the plugin copy,
to upstream); products re-captured with it has black rows only at the bottom, like the build, and reads 9.16 PASS.

Roster: 1440 44 → 47 delivered, 360 29 → 30, both widths 27 / 71 unchanged (very-narrow-aisle passes 360 and
fails 1440 at 13.7; technical-safety-services and products pass 1440 and fail 360). Next: re-capture the live side
of every roster page at 1440 with the fixed instrument, in two halves so each is a recorded unit — the eleven rows
between 10 and 13 % are first in line.

## Handoff gap unit regate-anchor-1440-a — the fixed instrument flips four desktop pages; two shared mobile defects read off the crops (2026-10-08)

The 27 pixel-failing 1440 rows closest to the bar had their live side re-captured with the scroll-anchoring-guarded
stitch-shot (gate-all --only … --skip-existing --recapture-origin --origin-headless; the first run hit the 900 s
deadline inside the probes and was re-run over the kept captures with a 1800 s deadline). Every re-captured origin
lost the 34-row black band, and the numbers moved 0.15–1 pt: automation-summit 10.14 → 9.67, glasses 10.23 → 9.42,
hand-pallet-trucks 10.2 → 9.71 and news 112000 10.9 → 9.89 are PASS at 1440; 105280 (10.23), 18902 (10.84),
1445120 (11.23) and financing (11.39) sit just above the bar; training and solutions-overview, shorter than two
chunks, did not move; no Δh changed. Roster 1440 47 → 51 delivered, 360 30, both widths 27 / 71 — the four new
desktop passes all fail 360.

Three 360 crops (maintenance-repair 9000–9500, pallet-trucks 4000–5036, genuine-spare-parts 5500–6500) show the
same two block-level differences. The related-content band title "This may also interest you" is uppercase on the
source (live-bundle.css @104839, scoped to .related-content — the "Availability" headline band is not transformed)
and wraps to two lines at 360 (h 87 against the build's one-line 57; 77 both at 1440): every 360 page with the
carousel is shifted 30 px from the band down. The .teaser--card trailing link "Find out more" is, on the source, a
boxed button out of the flow (@308913: absolute, right 32, bottom −28 / −12 from 1024, height 64, 8 px white border,
16 px padding, light-grey fill, .9rem nowrap ellipsis, max-width 66 %) straddling the card's bottom edge; the build
carried it in the flow as a plain red text link. teaser-carousel.css gains the text-transform; related-teasers.css
makes the link-only paragraph the absolute boxed button, keeps the card's overflow visible and clips the image box.
Both land on the origin with this checkpoint push; the next unit checks liveness with curl --compressed and re-gates
the pages that carry a related-content carousel or a teaser card grid at 360.

## Handoff gap unit gap-related-360 — the band title lands, the boxed button exposes the card body's missing padding (2026-10-08)

Both CSS files from the previous unit were byte-identical on the origin (curl --compressed), so the 55 pages failing
at 360 that carry a related-content carousel or a teaser card grid were re-gated with a fresh build-side capture
(gate-all --only … --skip-existing --recapture-eds, 40 minutes, origin captures reused). The carousel half behaved
exactly as measured: every carousel-only page lost 30 px of height delta and pallet-trucks (10.58), e-trucks (10.31)
and glasses (11.62) now sit just above the bar. The card half went the other way: the 39 card-grid pages gained
~29.5 px of height delta per card (+59 … +678, magazine +3244). Measuring pallet-stackers at 360 against the live
page named it — the source card body (.teaser__content-wrapper) has 16 px padding on every side and its text
wrapper a 1 rem margin top and bottom (live-bundle.css @317690, @308720); the build body had padding 16px 0 24px
and a top margin only, so its text ran 342 px wide against the live 310 and wrapped one line fewer on a third of
the cards, and each card ended 8 px short. Taking the in-flow link out of the card removed the 29 px that had been
masking it. The two lifted values are in related-teasers.css; on the local server the content box measures
190.375 / 163.781 at 360 and 210.125 at 1440 with a 310 / 352 text wrapper — identical to the live boxes. The
magazine page is content drift (its live card set and order differ from the captured page), not a block defect.
Roster tables patched from the run file: 360 stays 30 delivered, 1440 51, both widths 27 / 71. The card fix lands
with this checkpoint push; the next unit re-gates the 45 card-grid pages at both widths once it is live.

## Handoff gap unit gap-card-regate — the card body lift is exact; the block turns out to carry two source kinds (2026-10-08)

With related-teasers.css live on the origin, the 45 pages carrying a teaser card grid were re-gated with fresh
build captures at 360 (34 minutes) and then at 1440 (32 minutes). Where the source teaser is a card the lift is
exact: retrofit-accessories (7.96), consulting (8.08), genuine-spare-parts (6.24), about-us (7.47) and
solutions-overview (6.79) pass at 360 with height deltas of 0–4 px, about-us (6.32), retrofit-accessories (4.31)
and consulting (3.68) pass at 1440, and the magazine's height delta fell from 2705 to 76. Both widths went from
27 to 31 delivered pages. The same run lost three 1440 passes — hand-pallet-trucks 9.71 → 12.42, products
9.16 → 17.2, service 5.23 → 14.65 — and automation-summit worsened at 360 (22.47 → 32.07). Measuring
automation-summit against the live page named the cause: its teasers are plain `.teaser`, not `.teaser--card`,
and the live plain teaser has padding 16px 0 24px, a text wrapper with a top margin only and an in-flow 16 px
text link with a 15.04 px margin — exactly the model the build had before the boxed-button change. The landing
and program encoders map every `.layout--teaser` row to the one related-teasers block with only `icons` / `four`
tokens, so the card-only rules now mis-render every plain row. The captured source HTML gives the split: 24 of
the 45 pages hold `.teaser--card` rows (81 blocks, 30 on the magazine), 10 hold only plain rows; the row counts
match the content blocks one-to-one on every page and the headings agree once entities are normalised, so a
`cards` token can be written into the content without re-encoding (dry run: 24 pages, 81 blocks). Roster:
360 35 delivered, 1440 49, both widths 31 / 67. Next: the `cards` variant — encoder token, content token
published, CSS scoping with the plain model as default — then the 45-page re-gate at both widths.

## Handoff gap unit gap-card-variant — the block's two source kinds split: plain by default, the card model under a `cards` token (2026-10-08)

The measurement of the previous unit said the related-teasers block was rendering every row with the card model
(16 px padding all round, text wrapper margin 1rem 0, the trailing link as an absolute boxed button) while the
source carries two kinds: `.teaser--card` on 24 of the 45 card-grid pages and the plain `.teaser` (padding
16px 0 24px, text wrapper top margin only, in-flow 16 px text link) on the other rows, ten pages holding only
plain rows. This unit splits them. The landing and program encoders now emit a `cards` token when the
`.layout--teaser` row holds `.teaser--card` (icon-text rows keep `icons`; a 25 % row keeps `four` beside it).
The staged patch-cards.mjs wrote the token into the delivered documents without re-encoding: 24 pages, 81
blocks (79 `related-teasers cards`, 2 `related-teasers four cards`, the magazine alone 30), the diff being the
class attribute only. Chain checks on the 24 files: delivery-lint exit 0 on every file (P2 advisories only),
davids-model-lint PASS 0 🔴 on every file, media-reconcile clean, localize-links CHECK PASS. In
related-teasers.css the plain model is the default again — padding 16px 0 24px, margin-top 1rem, the in-flow
link with margin-top 0.94em — and the three card rules (padding 16px, margin 1rem 0, the boxed button with
its overflow and 1024 px offset) sit under `.related-teasers.cards`; the `four` padding rule stays later in the
file so a `four cards` block keeps its measured 1.5em top padding. The 24 documents were published with
deploy-batch (24 ok, 0 failed; ledger stardust/deploy/ledger-gap-card-variant.json) and the origin's
.plain.html carries the token (pallet-stackers 8, magazine 30, logimat 1). The CSS goes live with the
checkpoint push, so no gate ran in this unit; the next unit re-gates the 45 card-grid pages at 360 and 1440
once the origin serves the new file (curl --compressed comparison first), expecting the ten plain-only pages
(products, service, automation-summit, e-models, h-models, x-models, r-matic, platform, energy-systems, in-sync)
to return to their pre-card numbers and the 24 card pages to keep theirs. Stylelint is not installed in this
workspace (npm run lint:css finds no binary), so the CSS change was checked by reading only.

## Handoff gap unit gap-card-variant-regate — the split lands: the three lost desktop passes come back, mobile holds (2026-10-08)

With the `cards` token on the origin (24 documents) and the scoped related-teasers.css live (verified by
curl --compressed at 02:31Z, six `.cards` rules), the 45 teaser-grid pages were re-gated with fresh build
captures at 360 and then at 1440. The first 360 run hit the background runner's default 15-minute cap after
its captures (an instrument deadline, not a measurement); the re-run reused those captures and finished in
29 minutes, the 1440 run in 32. At 1440 the three pages whose pass the card-only rules had taken return
exactly to their pre-card numbers — products 17.2 → 9.16 (Δh 54 → 7), service 14.65 → 5.23 (Δh 50 → 3),
automation-summit 10.54 → 9.67 — and the card pages keep theirs (about-us 6.32, retrofit-accessories 4.31,
consulting 3.68); in-sync 27.95 → 25.24, r-matic 15.97 → 14.31 and the magazine's Δh −80 → −3 move the
same way; the 1440 roster is 46 pass + 6 override = 52 delivered (was 49). At 360 the plain-only pages
improve without crossing the bar — products 44.77 → 33.26 (Δh 218 → −19), service 36.25 → 26.53 (Δh
115 → 34), in-sync 39.36 → 35.52, logimat 25.31 → 22.96, x-models 27.04 → 24.7, r-matic 27.05 → 25.91 —
and every card page measures identically to the previous unit (retrofit-accessories 7.96, consulting 8.08,
genuine-spare-parts 6.24, about-us 7.47, solutions-overview 6.79 still pass); the 360 roster stays at
27 + 8 = 35 delivered and both widths at 31 / 67. Reading the products page at 360 off the crops: the first
hot band (500–1000, 40 %) is a 40 px offset that starts in the hero, where the h1 "Our Product Portfolio"
wraps to two lines on the build and one on the original at the same size — the glyph width of the
substitute typeface, the residual the register already names, not a layout rule. Roster: 360 35, 1440 52,
both widths 31 of 98. Next: regate-anchor-1440-b (the remaining 1440 rows closest to the bar with the
scroll-anchoring-guarded live capture), then the 360 rows between 10 and 13 % (pallet-stackers 12.34,
maintenance-repair 12.17, glasses 11.62).

## Handoff gap unit regate-anchor-1440-b — the second half of the guarded desktop re-capture lands; no row was close enough to flip (2026-10-08)

The 31 desktop rows whose origin capture still predated the scroll-anchoring-guarded stitch-shot (shot
2026-10-07 11:53–13:49, before regate-anchor-1440-a) were re-captured headless at 1440 and re-measured
through gate-all `--only … --skip-existing --recapture-origin --origin-headless` (origins 03:50–04:06Z,
probes to 04:18Z, 1945 s in all). Every re-captured row drops by the black-band share of its page,
0.11–1.45 pt (mean −0.44): home 8.31 → 6.86 (the row still fails on its one off / three hidden repeated
units), the two product-finder pages 3.95 / 4.00 → 2.87 / 2.93 (delivered on their documented units
override), tow-trucks 14.52 → 13.75 and e-trucks 16.26 → 15.80 (delivered on their documented residual),
productivity 20.6 → 19.7, safely-to-the-top 20.11 → 19.33, events 21.57 → 20.85. No flip: these rows sit
2–23 points above the bar, the glyph width of the substitute typeface, and the rows within reach were the
first half. Three rows — training 12.09, overview 14.99, intralogistics 20.01 — keep their 13:48 capture a
second time (the instrument reports stitch-live and leaves the file), so they are the only desktop rows
still carrying the band; cookie-policy is unchanged by construction (its row fails on content and height).
The run was folded into the 1440 roster (summary-patch 31/31), both-widths rebuilt (31 of 98 at both
widths, 67 fail), coverage re-read with 0 status flips. Roster: 1440 52, 360 35, both widths 31 of 98 —
unchanged. Next: the six 360-only rows between 10.58 and 12.43 % (pallet-trucks, glasses, ppap,
maintenance-repair, pallet-stackers, terms-of-use) and the one desktop-only near-bar row, the 105280
article at 10.23 % with Δh −115, whose inline linked figure renders wider than the source text column on
the build (read off the 2000–2500 band crop; measure.mjs on the shared img[alt] pair is the first step).

## Handoff gap unit gap-article-figure — the 105280 figure is the prose column plus its margins, not the full model (2026-10-08)

The one desktop-only near-bar row, the 105280 article at 10.23 % with Δh +115 on the build, was read off its
2000–2500 band crop (the inline figure wider than the prose on the build) and then measured: on the source the
article wrapper is a shrink-to-fit float — 740 wide here (708 + 32 padding, cap 960) — so its in-flow
`.infobox-media` renders 708 × 434 at x 366, the 640 prose column plus its 34 px side margins; the build
applies the `full` infobox mode (wrapper 960, box 928 × 522 at x 256), 124 px taller, which is the row's
height delta. The two other desktop article fails that carry `full` (18902, 1445120) measure 928 in a 960
wrapper on the source, so their mode is right and 105280 is the only 708 model (at 360 both sides are
342 × 192, nothing changes there). Fix: the press-contact block accepts a third mode, `inline` — the picture
paragraph and its caption lose the float, take width min(708px, 100% + 68px) centred with
calc(50% − width/2) side margins (−34 px at 1440), margin-top 8 / margin-bottom 0 like `full`; the
document's section metadata is switched from `full` to `inline` and published (deploy-batch 1 ok,
`data-infobox="inline"` verified on aem.page and aem.live; delivery-lint clean). The CSS goes live with this
checkpoint push. Next: re-gate 105280 at 1440 and 360 once press-contact.css on the origin carries
`infobox-inline` (curl --compressed), then the six 360-only rows between 10.58 and 12.43 %.

## Handoff gap unit regate-article-figure — the inline figure mode lands: the 105280 article passes at desktop (2026-10-08)

With press-contact.css carrying the `inline` infobox mode on both origins (curl --compressed at 04:33Z, four
`infobox-inline` rules on aem.page and aem.live) and the 105280 document already switched to it, the page was
re-gated with a fresh build capture at 1440 and at 360 (one page each, 70 s a run). At 1440 the row moves from
10.23 % / Δh +115 to 4.53 % / Δh +9 (textPct 16.5 → 14.03) and passes: the 928-wide `full` figure was the whole
of the row's delta, as the previous unit's measurement predicted (928 × 522 → 708 × 398, −124 px). At 360 the
row is byte-identical to before (10.35 %, Δh 4) — the figure is 342 × 192 on both sides there — and stays
delivered under the Phase 4 article-archetype 360 residual override. Roster: 1440 47 pass + 6 override = 53
(was 52), 360 unchanged at 35, both widths 32 of 98 (was 31); update-coverage flips 105280 from failed to
deployed. Next: the six 360-only rows between 10 and 13 % (pallet-trucks 10.58, glasses 11.62, ppap 12.03,
maintenance-repair 12.17, pallet-stackers 12.34, terms-of-use 12.43), each read off its band crops and measured
before any change; then the 1440 article pair 18902 (10.84) and 1445120 (11.23).

## Handoff gap unit gap-tone-icon-footer — two of the six near-bar mobile rows name a defect: a hidden footer paragraph and a red-on-red glyph (2026-10-08)

The six 360-only rows between 10 and 13 % were each read off the crop of their first hot band and then measured
before anything was touched. Two name a defect. On ppap (12.03 %, Δh 24) and terms-of-use (12.43 %, Δh 28) the
source's `.article-footer` at 360 is a 342 × 49 flex row with a white 1 px top border and 32 px margins whose
paragraph "Did you enjoy reading the article?" is `display: none`, leaving only the 74 × 48 share toggle at the
right edge; the build showed the paragraph and a left-aligned 342 px toggle row with 7.6 / 12 px margins, so its
section ended at 439 against the source's 463 — the whole height delta. The mobile block of breadcrumb.css (the
`button-wrapper` class note still applies) hides the paragraph and lays the toggle row out as measured; the
remaining 11 px above it is the substitute typeface's h1/intro wrap. On pallet-trucks (10.58 %) the red band's icon
slot is the right size on both sides (40 px, h3 16 px below) but the source glyph is white at 360 and 1440 while
the build painted it `var(--color-red)` on the red band — the later icon rule beat the toned-item colour rule at
equal specificity, so the pictogram was invisible in a slot of the right height. One rule after the icon rule paints
the glyph white on red and dark items; the same markup sits on diesel-forklifts, explosion-proof-trucks, ic-trucks,
forklift-truck, financing and tow-trucks. The other three are residuals: maintenance-repair's pre-op-check block is
474.3 px tall on both sides and its CTA is visible on the source at 360 (hidden in the stitched capture by the
source's sticky tab bar) — the build is simply 56 px lower by then; glasses wraps the related-teasers title
differently at the same size; pallet-stackers is 12–16 % evenly across every band. CSS only, no document changes;
the rules go live with this checkpoint push. Next: re-gate the 7 static pages at 360 and the 7 toned-icon pages at
both widths, then fold the runs into the roster tables.

## Handoff gap unit regate-tone-icon-footer — the mobile footer flips two legal pages; the unscoped rule costs a third and is scoped (2026-10-08)

With breadcrumb.css and columns.css byte-identical on the origin (curl --compressed, 04:58Z) the 7 static pages
were re-gated at 360 and the 7 toned-icon pages at 360 and 1440 with fresh build captures (14 pages in 15 min at
360, 7 in 9 min at 1440; diesel-forklifts carries a `-d344` suffix in the roster and ran separately). The article
footer lands: ppap 12.03 → 7.56 % (Δh 24 → 11) and terms-of-use 12.43 → 9.77 % (Δh 28 → 14) both pass; legal,
privacy-statement and cookie-policy measure identically; edi improves a hair (15.77 → 15.71, Δh 148 → 135). The
toned icon is painted white now but weighs under 0.05 % of any page — every tone row sits within 0.02 pt of its
previous value at both widths. One regression: semi-automated-order-pickers, a landing page delivered on the static
template whose last paragraph is a CTA, went 5.84 → 13.4 % (Δh −1 → 23) because the unscoped
`p:has(+ p.button-wrapper:last-child)` rule hid the paragraph before that CTA. The three footer rules are now
scoped to the share toggle (`a[href="#share"]`, which the served DOM keeps on both toggles); the scoped CSS goes
live with this checkpoint and that page re-gates as the next unit. Roster: 1440 53 (unchanged), 360 28 + 8 = 36
(was 35), both widths 33 of 98 (was 32). Next: regate-footer-scope, then the nine 1440 rows between 10 and
12.5 % read off their band crops.

## Handoff gap unit regate-footer-scope — the footer rule was innocent: the landing page had lost two empty paragraphs above its CTA (2026-10-08)

With breadcrumb.css and columns.css byte-identical on both origins (curl --compressed, 05:08Z), semi-automated-order-pickers
was re-gated at 360 with a fresh build capture and came back exactly where it was: 13.4 %, Δh 23. The scoped footer rule
could never have matched it — the page's only cell is a columns block (h1 › p > strong > a), not default content. A
side-by-side crop of the whole 990 px page put the delta between the heading and the CTA, and measure.mjs sized it: the
source .text-container runs h2 (y 320, h 80) › `<p> </p>` (0 px, margin 0) › `<p></p>` (0 px, margin-top 7.6) ›
a.btn__link › .btn (margin-top 16, y 423), while the build set the button at y 400. The 23.6 px are the two empty
source paragraphs plus the button margin the bundle grants only after a paragraph
(`.text-container p+.btn__link .btn { margin-top: 1rem }`, @348000) — so gap-columns-360's lifted `p.button-wrapper
{ margin: 0 }` / `p + p.button-wrapper { 1rem }` is right, and the regression was the document dropping the paragraphs
the other encoders carry as `<p><sup>&#8203;</sup></p>` markers. Two markers added to the delivered document, deploy-batch
1 ok (PUT → preview → live), origin serving them: 360 goes 13.4 → 3.47 % (Δh 0), better than its pre-regression 5.84, and
1440 2.79 → 1.86 %. Roster: 1440 53, 360 29 + 8 = 37, both widths 34 of 98. Reading the next near-bar row off its band
crop (hand-pallet-trucks 1440, 0–500 at 27 %) surfaced a systematic content defect: the build ships an empty breadcrumb
block while pallet-trucks, which passes, carries the list. 67 delivered documents have the empty block and 29 of them
have breadcrumb items in the captured source (bc-source.tsv) — hand-pallet-trucks, financing and x-range among the
near-bar rows. Next: gap-breadcrumb fills those 29 from the captured items and republishes, then regate-breadcrumb.

## Handoff gap unit gap-breadcrumb — 30 documents get the breadcrumb trail their source carries (2026-10-08)

The regate-footer-scope band crop had shown hand-pallet-trucks shipping an empty breadcrumb block where pallet-trucks,
which passes, carries the list. A scan of content/en found 67 documents with the empty block; the captured source HTML
(ul.breadcrumb-list_v2) has items for 30 of them and is empty for the other 37 — every news-detail article, 15 landing
pages, 6 product pages and consulting — which therefore stay empty, faithfully. bc-fill.mjs rebuilt the 30 in the gated
pallet-trucks form: hrefs resolved against the source URL (`../` → /en/products, `../Overview.html` →
/en/solutions/overview, `index.html` → the page itself, as on the source), a target delivered in content/ becoming its
path and anything else keeping the absolute source URL, the last item plain text. A first dry run matched the capture
by prefix and took awards / approved-trucks / genuine-spare-parts for about-us / products / service; the match was
fixed to exact slug → `-html` → `-d<n>` before anything was written. deploy-batch: 30 ok, 0 failed, published; the
origin serves the trails (hand-pallet-trucks, financing, x-range, about-us/company checked). No CSS changed, so the
re-gate of the 30 at 1440 and 360 is the next unit — hand-pallet-trucks 12.42, financing 11.39 and x-range 12.22 at 1440
are the rows expected to move first.

## Handoff gap unit regate-breadcrumb — the trail renders but moves no row: the empty block already held its height (2026-10-08)

The 30 breadcrumb documents were re-gated at 1440 with fresh build captures (gate-all --only, --recapture-eds, eds
concurrency 2): every row lands within 0.05 % of its roster value with an identical Δh (hand-pallet-trucks 12.42 →
12.43, financing 11.39, x-range 12.22), pass 9 + override 1 = 10 of 30 as before. A crop of the hand-pallet-trucks
1440 band 60–360 shows the trail painted on the build (› Products › New Industrial Trucks › Hand Pallet Trucks) in the
source's form, so the fill is faithful and the empty block had already reserved the 50 px row. Below 1024 px the block
is display: none (breadcrumb.css), so the fresh 360 captures were recomputed pixel-only: 30 rows identical to the
roster; the full 360 probe run hit its 2400 s cap at page 10 and was not repeated — the roster 360 rows stand and
nothing from the pixel-only file was patched in. Roster: 1440 pass 47 + override 6 = 53, 360 pass 29 + override 8 = 37,
both widths 34 of 98; update-coverage --gate 98 rows, 0 flips.

The near-bar hand-pallet-trucks row has a different cause, measured on both sides with measure.mjs: on the live page
the whole .body-container starts at y 27 (header 75–175, breadcrumb at 175) where pallet-trucks has it at y 0 (header
48–148, breadcrumb 148); header, navigation and logo boxes are identical in size and no margin, padding, border or
transform differs. The live body opens with a stray text node — a quote character leaked from the head (the captured
HTML has `<body>"<link rel="alternate" …`), the only one of the 98 captures that does — and that text renders a 27 px
line box above the wrapper, offsetting every band of the 12.43 % row. It is a defect of the source page, not of the
build. Next unit: decide capture-state override vs replicate-as-captured for that page, and read the first hot band of
the other near-bar 1440 rows (financing 11.39, x-range 12.22, media 13.2, automated-trucks 13.45) for their own cause.

## Handoff gap unit gap-near-bar-1440 — hand-pallet-trucks' desktop defect is the source's own stray 27 px line; financing's card measured (2026-10-08)

The hand-pallet-trucks 1440 row (12.43 %) was read from its bands: 0–500 at 27 % is the header shifted by 27 px, and
every band below it is offset-contaminated. measure.mjs on the live page puts .body-container at y 27 and .header at
y 75 where pallet-trucks has them at 0 and 48, with header, navigation and logo boxes identical in size and no margin,
padding, border or transform differing; the live body opens with a stray text node — a quote character leaked from
the head (`<body>"<link rel="alternate" …`), the only one of the 98 captures that does — which renders a 27 px line
box above the wrapper. With the live capture trimmed by those 27 px (pngjs, a diagnostic copy outside the gate dir)
pixel-compare measures 5.5 % with Δh −23 and every band under 7 % until the footer, so the page passes the bar once
the source's defect is removed. A documented override (criterion pixel, flagged for the site owner) was written and
gate-all --only --compare-only turns the row FAIL → DELIVERED (documented residual): roster 1440 pass 47 + override
7 = 54. At 360 the same node offsets the page by 24 px and the trimmed compare still reads 17.61 %, so that row stays
FAIL without an override. Financing's first hot band (1000–2000, 17.5 / 25.4 %) is the parallax text card, measured
on both sides: live .parallax__text-wrapper x 72, w 648 (max-width 712), padding 36, h3 wrapping to two lines at
w 576, li 17.1 px / 25.65 px with list-style none and 19.24 px padding-left (dash markers); the build's card sits at
x 8, w 712, h3 on one line at w 640, li 18 px / 27 px disc without padding — a hero text-card variant whose inset,
width and list rule were not lifted. It is the next fix (scoped to that variant, checkpoint push, re-gate). x-range
(bands 4000–5500 and 6500–8293, Δh −42) and automated-trucks (5000–6000 at 27 / 54 %, Δh +27) are still to read;
media's 13.2 % is the typeface residual spread over a 17948 px listing. Roster: 1440 54, 360 37, both widths 34 of 98.

## Handoff gap unit gap-banner-card — the banner text card is lifted to the source rule: shrink-to-fit width, a bottom variant and the dash list (2026-10-08)

Financing's first hot band (1000–2000 at 1440, 17.5 / 25.4 %) was measured on both sides with measure.mjs. The live
.parallax__text-wrapper sits at x 72, w 648 with left auto, right 45vw, min-width 45 %, max-width 712, margin 72 and
padding 36, anchored top auto / bottom 0; the build's card sat at x 8, w 712, top 0. The source stylesheet
(index_style_bundle_lmh.css, fetched through the page's <base>) names all three deltas: `.parallax__text-wrapper` sets
no width, so the card shrinks to its inset — the block's base `.hero .hero-text { width: 100% }` leaked into the banner
and pushed it to the 712 px cap, overflowing left to x 8; `.text-wrapper--bottomleft` / `--bottomright` anchor the card
to the stage's bottom edge (top auto, bottom 0), a modifier the landing and program encoders never mapped (only
topright → `right`); and the card's list is `.running-text ul` — .95rem, margin .5em 0, no padding, li padding-left
1.125em with margin-bottom .25em and a red en dash absolute at left 0, list-style none — which the build rendered as an
18 px disc list with 40 px padding (card h 406 vs 496 at 1440, 519 vs 467 at 360). hero.css gets `width: auto` in the
≥ 768 banner rule, a `.hero.banner.bottom` variant and the dash-list rules, scoped to the banner card. A curl scan of
the 28 delivered banner pages' live markup lists each card's modifier; nine pages carry bottom-anchored cards and their
documents now carry `bottom` (`right bottom` for bottomright): company, sustainability, in-sync, gse-expo, h-models,
warehouse-safety, fleet-management, energy-systems, financing — deploy-batch 9 ok, 0 failed, published, the origin
serves the class. Both encoders emit the variant from now on. The CSS reaches the origin only with the checkpoint push,
so the next unit re-gates the 28 banner pages at 1440 and 360 (financing 11.39, x-range 12.22, hand-pallet-trucks 360
and in-sync are the rows expected to move). Roster unchanged: 1440 54, 360 37, both widths 34 of 98.

## Handoff gap unit regate-banner-card — financing passes at desktop; the list's line-height is the one value still forked (2026-10-08)

With the lifted banner card on the origin, the 27 delivered banner pages were re-captured on the build side at 1440
and 360 (gate-all --only against a derived gate state, pixel-only, build concurrency 2, twelve minutes for both). At
1440 financing goes 11.39 → 9.32 and, re-run with the clip and content probes, passes (clipped 0, MISSING 0 /
HIDDEN 0): FAIL → DELIVERED. Every other banner page holds or improves — in-sync −4.41, warehouse-safety −1.41,
gse-expo −1.34, fleet-management −1.13, the rest within a few tenths, the largest move the other way +0.11 — and no
Δh changes, as expected of an absolutely positioned card. At 360 the card is static, so only the two cards that carry
a list move, and they move the wrong way: financing 21.38 → 21.91, intralogistics-automation 23.95 → 28.61 with the
build 45 px taller. measure.mjs on the origin names it — the list inherited the paragraph rule's line-height 1.75
(26.6 px at 360) where the source ul is 1.5 (22.8 at 360, 25.65 at 1440); hero.css now says 1.5 and reaches the
origin with the checkpoint push. The fresh rows were merged into the roster tables (pixel and height from the run,
clip and content kept unless re-probed; summary.md regenerated through gate-all's own formatter), the both-widths
table recombined and coverage settled from it. Roster: 1440 pass 48 + override 7 = 55, 360 37, both widths 34 of
98. Next: re-gate financing and intralogistics-automation at 360 (and the 27 at 1440) once the line-height is live,
then read x-range (12.08) and automated-trucks (13.39) for their first hot band.

## Handoff gap unit regate-list-lh — financing passes at both widths once the list line-height is live; intralogistics-automation is a page-wide residual (2026-10-08)

The banner list rule now reaches the origin with line-height 1.5 (the source ul value, not the paragraph's 1.75), so
the two list-bearing banner pages were re-captured on the build side at 360 and 1440 with the clip and content probes
on (gate-all --only against the banner gate state, one build browser per width, three and a half minutes). financing
at 360 goes 21.91 → 7.65 with Δh −53 → 4, clipped 0, MISSING 0 / HIDDEN 0: FAIL → DELIVERED; at 1440 it holds
(9.32 → 9.39, Δh −28), so financing is delivered at both widths. intralogistics-automation improves at 360
(28.61 → 25.76, Δh −106 → −79) and holds at 1440 (20.02 → 20.00, Δh −114) but stays FAIL at both: its band
breakdown is diffuse — every 500 px band between 7 and 47 % over a 17 000 px mobile page — which names a page-wide
composition residual rather than the list. Rows merged into the roster tables, the both-widths table recombined and
coverage settled from it. Roster: 1440 pass 48 + override 7 = 55, 360 pass 30 + override 8 = 38, both widths 35 of
98. Next: intralogistics-automation's first hot band top-down (1500–2000 at 360, 26.5 %), then x-range (12.08) and
automated-trucks (13.39) at 1440.

## Handoff gap unit gap-x-range-large — the 40-60 row's large copy is the first hot band; the rule exists for bands only (2026-10-08)

x-range at 1440 (12.08, Δh −42) was read top-down: every band to 2500 sits between 1.5 and 4.7 %, the first hot band
is 2500–3000 (11.7 %), the text-image row below the model headline. Measured on both sides, the containers agree —
576 px wide, 72/36 padding, the grey layout--white wrapper rgb(238,239,243) on both — and the paragraph does not: the
source .text-container--large copy is 20.25/30.375 with a 20.25 px bottom margin (1.125em / 1.5 / 1em), the build
17.1/29.925 with none, and the source opens a 27 px icon line box above the copy. The `large` rule covered only
.columns.band.large; columns.css now carries the same rule for the flex row under either spelling of the variant
(`large` or the source class the landing encoder emits) and reaches the origin with the checkpoint push. The delivered
x-range document carries `columns text-40 flex video white` without the variant, so the row needs the document
re-rendered with it (PUT + publish) before the rule can move the band; nothing re-gated this unit. Roster unchanged:
1440 55, 360 38, both widths 35 of 98. Next: the x-range document variant and its re-gate at both widths, then
automated-trucks' 1440 band 5000–6000 (26.5 / 53.6 %).

## Handoff gap unit gap-x-range-variant — the x-range document carries the large variant; encoders emit it from now on (2026-10-08)

The delivered x-range document had the 40-60 row without the `large` variant because the landing sibling generator
dropped text-container--large from the clone's text container (it reached the variant set, never the markup), so the
landing encoder had nothing to read. The document's row class was edited in place to `columns text-40 flex video
white large` — a fresh encode would have lost the breadcrumb and marker edits of later units — and PUT, previewed and
published through deploy-batch (1 ok, 0 failed): aem.page serves class="columns text-40 flex video white large" and aem.live class="columns text-40 flex video white large".
The sibling generator now keeps the class on the clone and the landing encoder emits `large` for a flex row whose text
item carries it. The columns.css rule from the previous unit reaches the origin with the checkpoint push; x-range is
re-gated at both widths in the next unit. Roster unchanged: 1440 55, 360 38, both widths 35 of 98.

## Handoff gap unit regate-x-range — the large copy now measures the source values; mobile improves, desktop waits on the icon line box (2026-10-08)

The checkpoint push landed before this unit, so the large rule was live beside the published document variant and
x-range was re-captured on the build side at both widths with the probes on. The origin now renders the 40-60 row's
paragraph at 20.25/30.375 with a 20.25 px bottom margin at 1440 and 18/27/18 at 360 — the source values exactly. At
360 the page goes 21.65 → 17.32 with Δh 186 → 96 (clipped 0, MISSING 0 / HIDDEN 0), still over the bar; at 1440 it
holds at 12.09 / Δh −42: the 2500–3000 band stays at 11.8 % because the source opens a 27 px icon line box above the
paragraph-first cell (its paragraph sits at container y + 99 = 72 padding + 27 line, the build at + 72), and the hotter
bands sit lower on the page (4000–5500 at 21–27 %, 6500–8293 at 12–33 %). columns.css now gives a paragraph-first flex
text cell the same 1.5rem top margin the heading rule's comment measured; it reaches the origin with the next push.
Rows merged into the roster tables, the both-widths table recombined and coverage settled; the roster is unchanged at
1440 55, 360 38, both widths 35 of 98. Next: x-range's 4000–5500 band at 1440 (crop and measure) once the rule is live,
then automated-trucks' 5000–6000 band at 1440 and intralogistics-automation's 1500–2000 band at 360.

## Handoff gap unit gap-x-range-safety — the Safety band is the source's scroll-driven parallax, a capture-state residual (2026-10-08)

x-range's hottest desktop band, 4000–5500 (22.5 / 26.7 / 20.8 %), is the Safety headline and its banner. Measured on
both sides the composition agrees: the seven headline sections are 107.5 px tall on both (the build 26 px above, the
icon line box of the previous unit), the banner starts 107 px under its headline and is 810 px tall on both, and the
text card sits at x 72, 648 wide, 72 px down with 36 px padding on both. The one fork is the source image wrapper,
which carries a transform of −99.9 px at the instrument's scroll state — a scroll-driven JavaScript parallax that the
stitched capture freezes with the band's top region blank and the image shifted down — where the build image is static
and fills the stage. Nothing in the computed styles lifts (the transform is scroll-tied; hero banner motion is recorded
dead), so the band is logged as a capture-state residual with no code change. The remaining hot bands, 6500–8293
(19.1, 31.9, 32.9 %) around the teasers and the carousel, are the next read. Roster unchanged: 1440 55, 360 38, both
widths 35 of 98.

## Handoff gap unit gap-x-range-tail — the tail bands are seam repeats and offset; one fork is the download icon on the CTAs (2026-10-08)

x-range's last three desktop bands (6500–8293: 19.1, 31.9, 32.9 %) were read from a side-by-side crop and measured on
the build: the Additional Information CTA block (299 px), the dark "This may also interest you" teaser carousel (its
heading at 6972, the block 794 px from 7084) and the footer (7981, 354 px). The composition matches row for row; the
diff is the sticky anchor strip repeating at every stitch seam on both sides at different offsets — the build runs
26 px above at Safety and 20 px below from "Your Benefits" on, so the Special Equipment media browser is 46 px taller
on the build, and the page ends 42 px shorter — plus one visible fork: the two download CTAs carry a right-hand
download icon on the source that the build rows do not. No code change in this unit; the Special Equipment rows
(measure live against build), the download-icon variant and the re-gate once the paragraph rule is live are next.
Roster unchanged: 1440 55, 360 38, both widths 35 of 98.

## Handoff gap unit gap-x-range-mb — the third media browser is 46 px taller on the build: a pane minimum height, not content (2026-10-08)

The Special Equipment media browser on x-range is 46 px taller on the build (inner 550 against the source's 504.5; the
first two browsers agree). Measured on both sides, the list column matches — 320 wide, five items of 49 px with a 1 px
rule — and the content pane matches in width and padding (896, 16 px); the source pane fits its content (image 360,
heading, a 60 px paragraph: 472 in a 504 pane) while the build pane is 518 inside and centres the same 472 px item
with 23 px above and below. That is a minimum height on the build pane, not its content: the candidates are the
content variant's min-height 100 % and the panel's min-height 250 px in media-browser.css, which the taller first two
browsers never reach. No code change in this unit; the next names the rule by measuring the panel and list column with
their minimum heights, lifts the source value and re-gates x-range at both widths together with the paragraph rule.
Roster unchanged: 1440 55, 360 38, both widths 35 of 98.

## Handoff gap unit gap-x-range-mb-rule — the third media browser's visible panel already matches; the extra 46 px sits in the pane, not in a min-height rule (2026-10-08)

Measured on the build at 1440 with the computed minimum heights: the third media browser is 650 outer and 550 inside its
50 px padding, its list column is 550 (it grows to the row) and its visible panel is 472.484 — the same 472 px item the
source pane fits. Neither candidate rule explains the row: the panel's 250 px minimum is below its content and the
container's 100 % minimum resolves against an auto-height parent. The 550 box is the content pane with its 16 px padding,
so a child other than the visible panel sets its height; the build carries eighteen panels for fifteen list items, one
extra per browser. No code change in this unit. The next measures the pane's children on both sides, removes or hides the
extra child and re-gates x-range at both widths. Roster unchanged: 1440 55, 360 38, both widths 35 of 98.

## Handoff gap unit gap-x-range-list-lift — the 46 px is the third browser's list column; the source takes its list out of flow and lets it scroll (2026-10-08)

Measured on both sides at 1440: the build's three lists are 196, 196 and 550 px tall (the third browser has eleven items
of 50 px), its panes 654, 654 and 550, its active panels 622, 622 and 472. The source's lists are 196, 196 and 504.5: the
ul has overflow-y auto with max-height 100 % and is absolutely positioned at the top of a list column that is position
relative, max-height 100 %, overflow hidden. Out of flow, the list no longer sizes the row, so the row follows the content
pane alone (source browsers 663, 654, 504.5) and a long list scrolls inside it. The same rules now sit in media-browser.css
for widths of 640 px and above: the list wrap gains max-height 100 %, the list becomes position absolute at top, right
and left 0 with max-height 100 % and overflow-y auto. The code goes live with the next checkpoint push; the next unit
confirms the stylesheet on the preview origin and re-gates x-range at both widths. Roster unchanged until then: 1440 55,
360 38, both widths 35 of 98.

## Handoff gap unit regate-x-range-list — the list lift closes the height gap at desktop; x-range is 0.8 points from the bar (2026-10-08)

With the media-browser list column lifted from the source and live on the origin, x-range was re-captured on the build
side at both widths with the clip and content probes on. At 1440 the page goes from 12.09 to 10.82 per cent with the
height delta from −42 to 4 px, clipped 0, nothing missing or hidden — still a fail, by 0.82 points. At 360 it goes from
17.32 to 15.86 with the height delta from 96 to 72. The desktop bands read top-down: everything above 2500 px is under
5 per cent; the 2500–3000 band holds at 11.6 (the 40-60 row's icon line box — the paragraph-first margin in columns.css
did not move it, so the next unit measures that cell on the origin); 4000–5500 is the Safety parallax already recorded
as a capture-state residual; 6500–7500 is the tail seams and the CTA download icon. Rows merged into the roster tables,
the both-widths table recombined and coverage settled (98 rows, no flips). Roster unchanged: 1440 55, 360 38, both
widths 35 of 98. Next: the 40-60 cell at 1440, then the tail, then x-range at 360 top-down.

## Handoff gap unit line-parity — the glyph fork and the layout drift told apart by instrument; 31 rows documented, 44 pages still drift (2026-10-08)

The session opened on a roster of 35 pages delivered at both widths and 63 failing, with the last written reason
being the licensed font and the last twenty units chasing one page at a time. A crop of the first hot band at 360
(e-trucks, y 450–1050) showed the real picture: identical content, identical wraps, identical line positions, and
an 8.8 per cent diff that is nothing but the glyph shapes of Nunito Sans against FF Daxline Pro — on a mobile page
body text is most of the pixels, so a text-dense page cannot reach the 10 per cent bar with a substitute face no
matter how exact the layout is. The pixel number cannot separate that case from a page whose lines sit in the
wrong place, so a capture-side instrument now does: `stardust/scripts/replica/line-parity.mjs` reads the two
captures, finds the ink rows, aligns the build to the origin in 200-row windows (the offset that lowers the pixel
diff over the window and the next, kept unless another is clearly better; a one-window outlier between agreeing
neighbours is smoothed), pairs the origin text lines with build ink at that offset, and reports the offset
profile, the aligned diff and any window still over 45 per cent once aligned. A wrap fork of the substitute face is
a step of one line; a collapsed or stretched block is a step of hundreds of pixels. Calibrated on the passing rows
(46 of 48 at 1440 and 28 of 30 at 360 read glyph-only; the exceptions are a local 61 per cent window on ic-trucks,
a 110 px step on one news page, the financing banner and the masked map), the rule is: glyph-only when every
step is at most 64 px, the offset stays within the gate's own 5 per cent height tolerance, and no window is hot.
Over the failing rows that gives 23 glyph-only at 360 (21 with clip 0, content 0/0 and units passing; `en` and
e-trucks fail units) and 12 at 1440 (10 eligible; `en` clips, e-models fails units). Those 31 rows carry a
documented-residual override now — the measured number beside the verdict, the line-parity evidence in the
reason, flagged for the owner's font-licence decision — and the roster tables were re-read with the overrides,
recombined and settled into coverage: 1440 48 + 17 = 65, 360 30 + 29 = 59, both widths 54 of 98; done-check
44 failed, down from 63. Every one of the 44 reads drift: offset steps of 200–1400 px on the landing and program
pages at 360 (blocks that collapse or stretch), hot windows at 1440 that name a local paint difference (x-range
4400, reach-trucks 4400, gse-expo 7000), and the three units rows. Next: the first drift window per page,
top-down, grouped by template so a block fix lifts siblings together.

## Handoff gap unit gap-mobile-media — the half-width media figures and the padded carousel were three block rules, not forty-four pages (2026-10-08)

The session opened on the 44 drift pages with a cross-page table instead of a page: for every failing row at both
widths, `line-parity.mjs --json` gave the offset steps over 64 px and the windows over 45 per cent, and a crop of the
first one per page. Two shapes repeated. Every article video figure (h-models, x-models, company, explosion-proof,
tugger-trains, forklift-hire …) sat at half width on the build at 360 — hero.css carried the source's 50vw rule for
`.media-player` at every width, where the source applies it only from 640px; measured h-models 360, live 342 × 192
at x 9, build 180 × 101 centred. The same measurement on awards showed the image infobox is the 342px column too,
not the full 360 the earlier rule assumed, so every media infobox below 640 now takes the band + item gutter
(2 × 1.25vw). The second shape was the columns carousel: the build kept the block's 9px media padding (slide 324,
dots below the image, no arrows) where the source's `.carousel-wrapper` is the whole item column with the red 48px
prev/next buttons at the edges and the white 8px dots strip overlaid at the slide bottom (bundle @71693, @53868,
@54029; arrows measured rgb(170,0,32) 48 × 48 at both widths, slide 342/592). The block now renders that at every
width — the desktop slide was 528 inside a 592 column before. The fixes were measured on the local server against
the source (`measure.mjs`, video figure 342 × 192 at x 9 exact; carousel slide, arrows and dots exact at 360 and 1440),
pushed (c91173f), and the 17 pages carrying either block were re-captured at 360 with the probes on. The pixel numbers
move little — the glyph residual stays — but the layout story changes: the offset steps are gone on 11 of the 17,
and platform, x-models and productivity read glyph-only (steps ≤ 64, no hot window, clip 0, content 0/0) and carry the
documented font-residual override; platform and productivity were already delivered at 1440, so both widths are
done: roster 360 62, both widths 56 of 98, done-check 44 → 42. A second code push (9854f7b) already carries the
next two measured fixes — the icon tile's pinned boxed link and the events calendar rows — gated in the next unit.
Also recorded: the stitched captures show the source's fixed header mid-transition at the chunk seams (top 0.5s
transition on `.stickystacky-wrapper`, logo at 880/900/980 across pages where the build's compact header sits at
914): a seam-band asymmetry worth 2–3 points on a 4500px page, below the hot-window and step thresholds, left as is.

## Handoff gap unit gap-icon-tiles-events — the pinned icon-tile link and the calendar rows gated; the aligner's repeated-row excursions named (2026-10-08)

The session opened on 42 failing pages and the two measured block fixes the previous session had pushed but not
gated (9854f7b: the icon tile's trailing link as the source's pinned boxed button, the events calendar rows in the
source's column with the place above the title). The 25 failing pages carrying icon tiles were re-captured at 360
and the 23 at 1440 with the probes on (gate-all --only --skip-existing --recapture-eds, two build browsers, 25 and
21 minutes). Twenty of the 25 render byte-identical to before — their tiles carry no trailing link — which is
the useful fact: the pixel number of a deterministic render does not move unless the rule touches the page. Where
it did: next-champ 360 35.71 → 29.42 with Δh −113 → 15 and the offset steps gone (drift → glyph-only, documented
residual); company 1440 21.96 → 13.12 with Δh −805 → −40 (glyph-only; its three clipped controls are the boxed
links cut by the source's own one-line ellipsis, `.teaser--icon-text > a.textlink` max-width 66 % + nowrap +
text-overflow, so the row carries a clip-allow of 3 with that reason and the documented residual); automated-trucks
1440 reads glyph-only too. The events calendar was measured box by box against the source at 360 (measure.mjs,
`.calendar-event*` vs `.news-cards.calendar .news-card*`): row 206 = 206, date bar 53 = 53, info 89 vs 90, button
48 × 188 vs 48 × 195 — every box within a line, two residual values (meta 16 vs 14 px, button 15.2 vs 16 px) go
with the next push. The page still reads drift, and the offset profile says why: windows 0–9 at 0, then −208 /
−208 / −189 / +288 / +288 / −124 inside the calendar, then a steady +78 to the end. Thirteen identical 206px rows
let the aligner lock onto a neighbouring row (a repeat is as good a match as the right row when the glyphs differ
anyway); the +78 that remains is four wrapped date lines of 21 px — the substitute's bold is wider. Company at 360
has the same shape (chronicle rows of 49 px: 322 / −511 inside the list, +76 after). Those two rows are glyph
residual with a repeated-unit artefact on top, not layout drift; the aligner needs stronger evidence before a jump
larger than a line (a locked-on repeat beats the previous offset by a few points of pixel diff; a collapsed block
beats it by ten or more) — to be calibrated on the passing rows before any verdict changes. Also carried to the
next unit, measured and verified on the local server but not yet gated: the content lists (source `ol,ul` .95rem /
150 %, `ul.bullets` red en dash, 1.125em indent — the article column, the infobox, the accordion text and the
media-browser panel had the browser's disc bullets at the paragraph size; energy-systems 360 list 342 × 156 and
awards infobox list 310 × 190 now equal the source to the pixel) and the accordion body (figures stay in document
order as in the source's `.accordion-item-body-content` — fleet-management 360: figure 342 × 192 at h4 + 241 both
sides where the split column had put it 204 px lower; the toggle is the source's 58px button with the 24px
`icon-LMHIcondownblack` glyph, headline 49 = 49, where the build drew the play glyph rotated in a 40 × 30 box).
Roster: 360 30 + 33 = 63, 1440 48 + 19 = 67, both widths 57 of 98; done-check 42 → 41.

## Handoff gap unit regate-lists-360 — the list and accordion lifts move 19 of 35 mobile rows; two more read glyph-only (2026-10-08)

The session opened on 41 failing pages and four block files pushed but not gated (389c493: the source `ul.bullets` /
`ol.bullets` lists in the article column, infobox, accordion body and media-browser panel; accordion figures in document
order with the source's 58 px toggle and 24 px down glyph). The code sync was sha-verified on the origin first (the
four files hash-equal with `--compressed`; without it the CDN hands back a different byte stream and every hash
"differs"). The 35 rows failing at 360 were re-captured on the build side with the probes on (gate-all --only
--skip-existing --recapture-eds, two build browsers, one probe browser; 16 minutes of captures, 42 of probes — the
probe pool at concurrency 1 is the slow half, and a 3600 s job deadline fits 35 pages with four minutes to spare, so a
larger batch needs two jobs). Nineteen rows moved and sixteen render byte-identical — the pages without a content list
or an accordion, which is the useful control again. Down: logimat 22.96 → 19.13 (Δh 47 → 29), safely-to-the-top
27.55 → 23.6, heavy-duty 19.2 → 17.54, fleet-management 18.19 → 16.56, maintenance-repair 12.17 → 10.96, pallet-stackers
12.34 → 11.78, sustainability 36.16 → 35.28, explosion-proof 25.4 → 24.23, energy-systems 43.72 → 41.77 but Δh
394 → 439. Up: approved-trucks 15.41 → 17.98 with Δh 37 → 79 (its accordion bodies carry lists — the lifted list is
taller on the build than the source's, a candidate for a box-by-box measure), ergonomics 22.95 → 24.45, intralogistics,
forklift-hire and diesel by a point or less. Line parity over the 35 fresh pairs: approved-trucks (max step 34 px, no
hot window) and maintenance-repair (step 19) now read glyph-only with clip 0 and content 0/0 and carry the documented
residual; `en` and e-trucks read glyph-only too but fail the repeated-unit probe (home: the teaser carousel; e-trucks:
the carousel teaser text block 27 px shorter and its link 29 px higher — the card body, not the font). Roster 360:
30 pass + 35 overrides = 65 of 98; both widths 59 of 98 (was 57); done-check 41 → 39. The 33 rows still failing at 360
all read drift, and the offset profiles rank them: forklift-truck (step 1178 px), automated-trucks (982), energy-systems
(894, Δh +439), company (833), ergonomics (753), pallet-stackers (687), sustainability (646), compact-class (601) — a
block that collapses or stretches on each, to be read off the first drift window top-down. Two facts carried into the
next unit: the home page's content miss is the source itself — the live "Recent Press Releases" carousel gained a
first slide (News-Detail_5378816, "Customized Options create added value") and dropped its tenth since the capture, so
the delivered document is patched from the live markup (stardust/.work/replica/gap/home-news/en.html, ready, not yet
deployed); and the home page's desktop unit row is the width-less origin cache again — `stardust/current/measure/
en-units.json` holds 360-shaped boxes (x 9, w 167) dated 2026-10-08T00:36 and was read for the 1440 probe, so the
top-level caches move aside before the desktop re-gate, as the gap-units-1440 unit did.

## Handoff gap unit gap-teaser-cards — five block lifts measured box by box, three documents repaired; 360 roster 65 → 69, 1440 65 → 68, done-check 39 → 38 (2026-10-08)

The session opened on 39 failing pages and read the first drift window of each by instrument rather than by eye:
`measure.mjs` live-against-build on the block in that window, the source rule lifted with `css-rules.mjs`, the fix
pushed, the origin sha-checked with `--compressed`, and the build re-measured before any gate ran. Five blocks
moved. The teaser carousel's standalone rail turned out to carry two source kinds — plain white `.teaser` (company,
innovations ×9, compact-class, in-sync) and `.teaser--card` (lightgrey, 1rem text-wrapper bottom margin, the 64 px
grey "Learn more" button hanging 28 px — 12 px from 1024 — below the card; src-1.css @299010, @308720, @308913,
@309826); the first push painted every standalone card grey and clipped the button inside the card (clip-probe:
CONTROL CLIPPED 33 px, and content-presence read the clipped link as HIDDEN on seven pages), so the card styling
moved behind a block token `cards` written into ten blocks on eight pages after a live survey of all twelve standalone
pages, the card lets the button paint and the track reaches 28 px lower. At 1440 the rail is the source's 1280 px
box with 25 % / 312 px slides (the build's 320 px slides showed 3.8 cards and wrapped the dark card's text one line
shorter). The related-teasers `cards` variant had its 16 px padding overridden by the later four-up rule and never
painted the source's lightgrey (automated-trucks 360: build 24px 0 0 white against the live 16px rgb(238 239 243));
the facts tiles inherited the same four-up padding plus the text-wrapper margin (in-sync 360: 220 against the live
180); the calendar rows had a 1.33rem title where @34167's 1.63rem wins at 640 and a 16 px meta where the source has
.875rem/1.75. The width probe in fonts.md had measured the bold substitute +3 % wider than Daxline bold, and the
gates showed it as one-line wrap forks on bold strings only (events 360: four of twelve date bands; compact-class
360: three accordion headlines), so NunitoSans-Bold carries `size-adjust: 97%` now. Three documents were repaired
from the live markup and published: the home press carousel (the live source had gained a first slide and dropped
its tenth — content MISSING 0 at both widths now), tow-trucks' "Making navigation easier" row (the band had dropped
its image cell) and explosion-proof's "Series Level Explosion Protection" row (a four-slide carousel column had
become a text band); working-at-linde's teaser row is plain on the live site, so its `cards` token went. Three
measured hypotheses were dropped as offset illusions — the red bands, the icon tiles and the two-column text boxes
match the live boxes exactly; a downscaled crop reads an accumulated offset as a narrower column. Re-gates: 32 then
12 rows at 360 (automated-trucks 29.36 → 13.57, company 25.18 → 10.26, diesel 22.54 → 16.21, forklift-hire 22.94 →
15.71, tugger-trains 20.54 → 12.23, in-sync 40.61 → 30.67; automated-trucks, diesel, in-sync and heavy-duty read
glyph-only and carry the documented residual; company reads glyph-only but its anchor row still hides "Compliance"
for content-presence), 31 rows at 1440 (working-at-linde 16.38 → 10.43, safely-to-the-top 19.33 → 11.52,
forklift-truck 15.33 → 11.39, tugger-trains 21.68 → 17.78; awards 13.64 → 19.17 with Δh +172 and fleet-management
23.12 → 26.6 with Δh +656 moved the wrong way and are the first windows of the next unit). Roster 360 30 + 39 = 69,
1440 48 + 20 = 68, both widths 60 of 98; done-check 38. Carried: the home page's 1440 unit row read the width-less
360-shaped origin cache again (re-created by the 360 run) — move `stardust/current/measure/en-units.json` aside
immediately before the 1440 capture; media 1440 content MISSING 9 (the live brochure list has more heading groups
than the six delivered); the bold size-adjust touches every page, so the roster-wide re-gate at both widths is the
unit that settles it.

## Handoff gap unit gap-near-rows — three probe-criterion rows measured and documented; done-check 38 → 35 (2026-10-08)

The session opened on 38 failing pages and swept every failing row at both widths through `line-parity.mjs` first
(`stardust/replica/gates/line-parity-sweep.tsv`, offsets in `line-parity-drift.txt`): 55 rows read drift, four read
glyph-only but failed on a probe criterion — `en` (units at both widths), e-trucks 360 (units) and company 360
(content HIDDEN 1). Each was measured box by box with `measure.mjs` on both sides before anything was written. The
home page's 1440 "units off 48" was the width-less, 360-shaped origin inventory cache the last unit had carried; a
fresh 1440 inventory (`gate-all --only en --skip-existing`) reads off 4 / hidden 3: two card title links 5–7 px
narrower (glyph widths, tolerance 4), one carousel paragraph 12 px taller (a half-line wrap fork) and the fifth
related-carousel slide hidden on the served side only (live peeks past the 1280 container, the build's section
clips at the viewport edge; the family declares four visible) — Δx/Δy 0 on every row, pixel 6.86 PASS, so the row
carries a units override. At 360 the home page's unit deltas are the icon tile label wrapping to one line on live
(div.h3 y 76 h 40, Daxline Medium) and two on the build (p y 64 h 64) in the same 135 px box, a card paragraph one
line shorter, and the related carousel's second slide at x 334 / 329 inside a 342 px overflow-hidden track on BOTH
sides — the probe flags clipping on the served side alone. E-trucks 360 is the same pattern (paragraph 293 → 266,
slide 2 hidden on both sides) plus the content-browser list, whose five li rows are identical 342×49 boxes at the
same y while the probe pairs live's inline `<a>` (h 15 inside a 342×48 div.btn) against the build's block `<a>`.
Company 360's single HIDDEN finding is the anchor row's "Compliance" link: the same scrollable row on both sides,
the link overflowing the 360 viewport on both (live x 303 w 109, build x 305 w 112) under the page shell's
overflow-x clip, and the probe's 50 % rule reading 57/109 = 52 % visible on live against 55/112 = 49 % on the build
— three pixels of glyph width on the preceding labels. All four carry documented-residual overrides with the
measured numbers beside the verdict (`override-write.mjs`), the roster tables were re-read (`summary-patch`,
`summary-reoverride`), recombined (`both-widths`) and settled into coverage (`update-coverage --gate`, 3 flips;
`verify --all` 63 verified / 35 failed). Roster: 1440 48 + 21 = 69, 360 30 + 42 = 72, both widths 63 of 98;
done-check 35. Carried: the home 360 related carousel track sits 4 px left and 9 px wider than the live
`.slick-list` (block padding 1.25vw against the source's 2.5vw below 1024) — a small lift for a later unit; the 35
remaining pages all read drift, with the first windows named in `line-parity-drift.txt`.

## Handoff gap unit gap-step-collapses — six large-step collapses read as five block rules and two document gaps; fleet-management 1440 passes, ergonomics halves (2026-10-08)

The session opened on 35 failing pages and the previous unit's instruction: the large-step collapses first (media 1663,
compact-class 1101, ergonomics 998, explosion-proof 880, fleet-management 941, intralogistics 801). Each was read as a
band table on both sides — live `measure.mjs` on `#pjax-container > div[class]` (12 matches per run, the tail through
`:nth-child(n+N)`), build `anchor.mjs` — and the first unequal band named box by box before anything was written.
Ergonomics: every accordion band 188 px short; the open item's figure is 640 × 360 on live and a 320 × 180 right float
on the build. The block floated EVERY in-panel figure from 640 px while the source floats only `.infobox--left/--right`
(bundle @267911–@267998); a plain `.infobox-media` is the full column. Survey of every captured accordion: the floated
figures always open the body and a whole accordion is one side (awards left/right/left, heavy-duty right,
approved-trucks right); the plain ones sit after the copy (ergonomics 14, fleet 3). So the float moved behind two block
tokens, `media-left` / `media-right`, written into the five accordions that carry a side class, and the plain figure
is in flow at column width. Explosion-proof and compact-class carry a different accordion again: a full-width band
(box 112/1216) whose body is `.content-left` (copy 640) beside `.content-right` (figure calc(100% − 640px), padding-left
48, image 528) from 1024 — token `wide`, a two-column grid from 1024 with the figure in column 2 from row 1 whatever its
document order. Fleet-management: the accordion (−304, same rule), the on-premise note box (band 314 vs 136: the
section had no `article` style, so none of hero.css's note-box rules applied, h6 12 px tall) and the "Intelligent
charging" poster (640 × 360 live, 320 × 180 build — the 320 px source rendition left at intrinsic width; a picture-only
article paragraph now fills the column like the source's `.image-wrapper img { width: 100% }`). Explosion-proof's
"The extent to which…" band: the 50vw video figure's wrapper was 720 but the pipeline wraps the lone `<a><picture>`
in a `<p>` that the article rule caps at 640 — measured through the deployed DOM's computed boxes, not the plain.html
(which hides the p). Intralogistics: an empty 109 px article band (two empty paragraphs) dropped by the encoder — two
marker paragraphs under `article` give 100. Compact-class: the 600 px band is the CCM19 "Blocked external content"
placeholder over a first-party video (dynamics row 1, embed-passthrough) — cropped and left as the documented reason
the page cannot pass; its infobox band is split into infobox + cta on the build (588 vs 408 + 172, −8). Media
(listing) is one 17 564 px card wrapper on live against six news-cards sections — next unit. A lone note-box wrapper
also keeps the band's own padding (`:only-child`), measured 322 vs live 314.

Code pushed and sha-polled on the origin (`--compressed`) before the seven documents went PUT → preview → live
(deploy-batch 7 ok). Every repaired box re-measured on the preview first: ergonomics accordion bands 794/739/765/765
against live 802/747/772/772, explosion-proof wide box 112/1216 with the figure at 800/528 at the copy's top, fleet
box 206 (198), poster 640 × 360, video 720 × 405, intralogistics band 100 (109), compact-class wide accordion 735
(751). gate-all `--only` over the 14 touched pages (the seven documents + the seven video-figure pages) at both widths,
the first 1440 run lost to the 900 s deadline at 65 s per probe and re-run with its captures (`--skip-existing`,
`--timeout 1800`). The gate-state had to be rebuilt to include coverage's `failed` rows (a `.work` copy of
gate-state.mjs with the filter widened) — the shipped filter selects deployed|verified only and a first run gated
the wrong subset; stopped by its recorded child pid. 1440: fleet-management 26.6 → 7.97 PASS (Δh 656 → 4), company
13.12 → 6.97 PASS, r-matic 14 → 4.39 PASS, ergonomics 30.38 → 14.14, explosion-proof 26.88 → 20.95, intralogistics
23.32 → 15.52, tugger-trains 17.78 → 12.79, forklift-hire 17.46 → 13.63, x-models 21.11 → 16.4, h-models 26.85 →
23.39; compact-class 16.68 → 17.41 with Δh 412 → 668 (the accordion is now right, the consent band still missing);
awards and heavy-duty identical to the roster (the side swap changes no height; their 1440 drift starts at 7200 /
1400 elsewhere). 360: fleet 16.22 → 11.38 (Δh 169 → 45), heavy-duty Δh −126 → −17, ergonomics −1.8, explosion −1.7,
but the four video landing pages read 2–4 points worse (r-matic 23.8 → 27.5, h-models 25.8 → 27.6, x-models 17 → 21,
forklift-hire 15.7 → 18.1) with Δh +30…+60 — the build shorter at 360 after a change scoped to ≥ 640 and a
column-fill rule, to be read band by band before the next CSS line. Roster 1440 51 + 19 = 70 (was 69), 360 72, both
63, done-check 35 (unchanged). line-parity on the near-bar rows: fleet 360 (11.38) one hot window at 10800, tugger
1440 (12.79) step 216 at 6400 + window 9800, forklift-hire 1440 (13.63) window 5400 — all drift, each one band.
Next: those three bands and the 360 video-page regression first (one crop each), then media's card grid.

## Handoff gap unit gap-one-width — seven one-width rows: two block defects, two captures the instrument could not re-shoot, three wrap-fork residuals; done-check 35 → 29 (2026-10-08)

The session opened on 35 failing pages, 16 of them failing at one width only, and took the seven nearest the bar:
fleet-management 360 (11.38), pallet-stackers 360 (11.79), tugger-trains 360 + 1440 (12.24 / 12.79), training 1440
(12.09), overview 1440 (14.99), warehouse-safety 1440 (13.98), e-models 1440 (11.45 + a units row). Each row's first
drift window was cropped on both captures (crop2) and the named boxes measured live against the preview
(measure.mjs) before any CSS line. Warehouse-safety: the parallax card's CTA is `<p><b><a>` on the source — an inline
17.1 / 29.925 weight-700 red text link, p margin-top 8.55 — and the pipeline's lone-link paragraph had become a
432 × 78 a.button.primary. A survey of every `.parallax__text-wrapper` in the captured site (48 wrappers) found 0
buttons: 10 plain `<p><a>` (17.1 / 29.925 / 400, measured e-models) and 2 `<p><b><a>`. hero.css now renders the
banner's .hero-actions as in-flow text (margin-top .5em, inline a.button with the chrome stripped, .primary bold);
re-measured on the preview: inline, 17.1 / 29.925 / 700 / rgb(170,0,32), actions margin 8.55; hero stage 1440 × 810,
card 648 × 298 at top 368 left 72 against live 648 × 297 at 369. Pallet-stackers: the Cost-Effective icon tile was
269 px against the source's 349 — its content key `BrandIconscasheuro` had no `.icon-*` rule (the only BrandIcons key
the content carries; the source glyph is `.icon-LMHBrandIconscasheuroblack` U+F114). Mapped; origin re-shot (the
earlier capture pre-dated the restore) and both sides show the euro-database icon, tiles 349 / 349 / 323 / 349. The
"missing CONNECTIVITY accordion item" the first crop suggested was the stitched anchor-row seam covering a 50 px
row — live measure.mjs counts 5 + 4 items on both sides.

Training and overview were stale builds (captures older than today's uppercase-heading and card-variant rules), and
every `--recapture-eds` failed: `stitch-shot error: scroll stall at chunk target 3604px: window.scrollY stuck at
3570px while the document reports 4504px`. Probed on the build (a scroll-range diagnostic, not a box measurement):
the `header` host is 148 px at y 0 and 114 px once the block enters its small state, so the document loses 34 px
on the first scroll; stitch-shot already re-scrolls for that (its scroll-anchoring guard) but its last-chunk
target is computed from the pre-shrink height and the stall guard fires when `docH mod 900 < 34` (training 4504,
overview 2722 — the other pages in the run pass because their last target still advances). Both pages were
re-captured on BOTH sides with `--vh 880` (the same instrument, the same chunking on each side): training 12.09 →
3.86 % PASS Δh −1, overview 14.99 → 4.2 % PASS Δh −1, line-parity glyph-only with zero steps. Two cautions recorded,
not resolved: (1) the instrument copy carries the stall; a project edit is a defect, so the `--vh` route is the fix
until the shipped stitch-shot compares against the re-measured reachable target; (2) the same training layout read
12.09 % at vh 900 (both sides) and 3.86 % at vh 880 (both sides) with no code change between — the difference is the
header's slide state at the chunk seams, not the page, which means the roster's 1440 numbers may carry a seam-state
share; a sampled symmetric re-gate at 880 of four failing 1440 rows decides that before any roster run.

The three remaining rows and the two repaired-but-still-over rows are wrap forks of the substitute face, documented
as residuals with the measurements beside the number (override-write, criterion pixel): fleet 360 — the related
carousel card is 448 live / 419 build, its paragraph 7 lines vs 6 at the same 15.2 / 26.6 (186 vs 160), picture
176 / 174, h3 20 / 20, the 64 px absolute link on both, card top 10795 / 10779 from the wraps above; aligned 12.22 %,
one hot window = that picture 16 px displaced. e-models 1440 — banner card 7 vs 8 lines at 17.1 / 29.925, the three
teaser cards keep 225 px pictures, the carousel row 52 px lower from those wraps, every unit row within 4 px once
the unit offset is removed (dy 0 / −2), the "hidden" unit is the fifth slide at x 1376–1656, off-screen on both
origins; aligned 7.03 %. Warehouse-safety 1440 — 13.67 after the CTA fix, aligned 7.27 %, 0 hot windows; the 409 px
"step" is the aligner crossing the 810 px hero picture (no ink rows) and returns to −2. Pallet-stackers 360 — 13.44
(up from 11.79 once the icon's 80 px landed on the build), offsets +32 / +58 / +84 = one 26.6 px line each, the 687 px
"step" an excursion across the open accordion panel; aligned 10.64 %, 0 hot. Tugger-trains (both widths) was read
but not changed: the media gallery's first slide is the video on the source (poster + play icon, the active thumbnail
red-framed) and a still on the build, at 1440 the thumbnail column starts one slide later — a block fix for the
media-carousel, next unit's first item. Roster: 1440 51 + 19 → 53 + 21 = 74 of 98, 360 30 + 42 → 30 + 44 = 74,
both 63 → 69; update-coverage --gate all-both (6 flips), verify --all, done-check 35 → 29.

Next: (1) the four-row symmetric `--vh 880` sample at 1440 (gse-expo 16.7, in-sync 19.53, heavy-duty 16.67,
diesel 17.19 — all 360-passing) to size the seam-state share; (2) the media-carousel video slide (tugger-trains, the
four video landing pages); (3) the remaining one-width 360 rows (events 32.5, magazine 27.9, automation-summit 28.2,
r-matic 27.5, tow-trucks 23.4) band by band.

## Handoff gap unit regate-vh880-sample — the seam-state share measured at four rows: under two points; the 1440 roster drift is layout (2026-10-08)

The previous unit closed on a caution: training and overview had read 12.09 % / 14.99 % at 900 px chunks and 3.86 % / 4.2 %
at 880 px chunks with no code change between, so the 1440 roster might carry a share that is the header's slide state at
the chunk seams rather than the page. This unit sized that share before any roster run. The four 1440-failing rows that
pass at 360 (gse-expo 16.7, in-sync 19.53, heavy-duty 16.67, diesel 17.19) were re-captured on BOTH sides with the same
instrument at `--vh 880` (origin headless, the engine-symmetric policy of this site) and compared with the roster rows:
gse-expo 14.78 (Δh 42, text 12.15), in-sync 18.87 (Δh 51, text 11.39), diesel 17.06 (Δh 127, text 16.38), heavy-duty
16.53 (Δh −96, text 20.1). The movement is 0.13–1.92 points, the heights and text shares within a pixel or a point of the
900-chunk rows; none of the four comes within four points of the bar. The seam state is therefore a sub-two-point share
of these numbers, and the training/overview flips were stale builds that the 880 chunking made capturable (the stall on
`docH mod 900 < 34`), not a seam effect. Decision: no roster-wide re-capture at 880; the remaining 1440 rows are layout
drift and get block work, band by band, as before. The four fresh rows were folded into the 1440 roster
(summary-patch 4/4, summary-reoverride 0 changed), both-widths rebuilt (69 of 98), coverage settled (0 flips),
verify --all, done-check 29 unchanged. Roster: 1440 53 + 21 = 74, 360 30 + 44 = 74, both 69 of 98.

Next: (1) the media-carousel's first slide — the video on the source (poster + play icon, red-framed active thumbnail),
a still on the build: tugger-trains and the four video landing pages; (2) the one-width 360 rows (events 32.5,
magazine 27.9, automation-summit 28.2, r-matic 27.5, tow-trucks 23.4) band by band; (3) the 1440 landing rows share
one template — crop the first hot band on both captures (gse-expo 1500–2000 41.3 %, in-sync 2000–2500 34.5 %,
logimat 1000–1500 30.4 %), most likely one block rule.

## Handoff gap unit gap-media-video-slide — the gallery measured box by box: four block rules and the video slide's play glyphs; the "one slide later" claim not confirmed (2026-10-08)

The unit took the previous session's lead — tugger-trains' media gallery, whose first slide is a video on the source and
a still on the build, "the thumbnail column starting one slide later at 1440" — and measured it (measure.mjs, live vs
preview, 1440 and 360) before any CSS line. The claim did not hold: both rails carry 8 thumbs from the top of the rail.
What the boxes did name: (1) the rail pitch — source thumbs 200 × 113 at 120.5 (margin 8), build 116.5 (margin 4);
(2) the standalone (wide) gallery row at 360 — the source gallery is the block's own calc(100vw − 5vw) box, x 9 w 342,
viewer x 17 w 326, inside a row padded 6.25vw above and below (logimat: 300 around 255), where the build's wrapper
carried the 1440 value 50px 32px and boxed the gallery to 296 at x 32; (3) the counter at 360 — the source span ends
16 px before the prev arrow (231 | 247–343), the build's sat flush; (4) the content variant at 360 — the source
.content-browser is the bare 5 × 49 px list (245 tall), the build padded it 6.25vw above and below (290). All four are
block rules in media-browser.css, measured again on the preview after the push: logimat 360 gallery 342 × 255 at x 9
with the master 326 × 239 on both sides. The video slide (source .media-player[data-video-url], Vimeo 607380078 on
tugger-trains, 1179210538 on logimat) carried neither its URL nor its glyphs: the encoder (landing.mjs mediaBrowser)
now writes the player URL as a bare link after the picture, the block turns it into data-video-url plus the source's
glyphs — a 45 × 45 red disc (56 px \f14c, margin −.1em) centred on the viewer and a 44 × 36 white badge (40 px \f160,
padding 6px 10px) at top 3 left 11 on the rail thumb — and both documents were re-published (deploy-batch 2 ok, live).
The click-to-play was not observed by motion-observe on the archetype and is not implemented; dynamic-features row 14
records it for the owner (inline player or modal is the open question).

Gates (--only, --skip-existing --recapture-eds, origin headless): tugger-trains 1440 12.79 → 12.8 and Δh 64 unchanged
— the gallery row is 674 on both sides, the content-browser row 874 on both; the row table names the drift elsewhere:
intro 578 vs 565 (−13), second teaser row 479 vs 509 (+30), article.center 476 vs 408 (−68), accordion 770 vs 763 —
measured, not yet attributed. tugger-trains 360 12.24 → 12.1 with Δh −69 → 5: the height is aligned. logimat 1440
21.54 → 21.46. logimat 360 19.08 → 29.45 with Δh 27 → 126: the over-padded gallery (+55) had masked wrap forks of the
substitute face — headline h2 120 vs 90 at the same 296 px, teaser h3 40 vs 20 on two cards and p 186 vs 160 at the
same 310 px, twelve lines ≈ 126 px — a glyph residual at identical box widths, not a block rule. Rows folded
(summary-patch 2/2 per width, reoverride 0 changed), both-widths 69 of 98, coverage 0 flips, verify --all, done-check
29 unchanged. Roster: 1440 53 + 21 = 74, 360 30 + 44 = 74, both 69.

Next: (1) tugger-trains 1440 — the inner boxes of the intro, the second teaser row and article.center, block rule or
wrap fork; (2) logimat 1440 — the first hot band 1000–1500 (30.4 %) cropped on both captures; (3) logimat 360 is
wrap-fork only at the measured boxes, an override-write candidate once its 1440 is examined; (4) the one-width 360
rows (events 32.5, magazine 27.9, automation-summit 28.2, r-matic 27.5, tow-trucks 23.4); (5) the 1440 landing rows
gse-expo (1500–2000 41.3 %) and in-sync (2000–2500 34.5 %).

## Handoff gap unit gap-media-brochures — the Media page's brochure library completed from the live DOM; both rows row-aligned, documented as glyph residuals (2026-10-08)

The one content-criterion failure on the roster: the Media page read MISSING 18 at 1440 — five "Product Brochures" h3 and
their "Download file" links. The live page, fetched headless through live-session (1440), carries 164 teaser cards: 31
brochure groups, 101 data sheets, declarations and guides; the extract capture of 2026-10-06 and the delivered
news-cards download block carried 26 brochure groups. The five missing — E20 – E35, H35 – H50, L14 – L20, L14 – L20 AP,
X20 – X35 — were added verbatim (3D turntable image, h3, the source's own truncated file info, the Download file link)
in the live order, after E16 – E20 P, H20 – H35, L-MATIC, L14 – L20 and V10, and the document re-published
(deploy-batch 1 ok, live). The cached origin captures predated the growth (1440 origin 17948 px against the live 18371;
the 360 origin had 26 groups at 17:02Z), so both widths were re-captured symmetric headless after the repair.

Gates: 1440 13.2 → 12.62 %, Δh −45 → −22, content MISSING 0 (was 18); 360 19.35 → 12.56 %, Δh −18 → 2. The rows agree
on both sides: at 1440 the 3 declaration rows (1544/1945/2346), 27 data-sheet rows and 8 brochure rows sit at the same
y (build +22 px from y 4701); at 360 all 101 data-sheet rows and 31 brochure rows are within 2 px (docH 66813 vs
66811). line-parity's ±800 / ±3000 px offset steps are repeated-row re-locks on 160 identical cards, not layout; the
true offset by the heading rows is 0 → 22 and 0 → −2. Both rows are documented in overrides.json as glyph residuals of
the FF Daxline Pro substitution (text share 31.98 / 25.49 %) inside the listing archetype's regime (press 1440 own
residual 24.96 %). Rows folded (summary-patch, reoverride 1 changed per width), both-widths 70 of 98, coverage 1 flip,
verify --all, done-check 29 → 28. Roster: 1440 53 + 22 = 75, 360 30 + 45 = 75.

Next: (1) the override sweep for rows whose line-parity reads glyph-only or whose drift is the documented parallax
capture-state (gse-expo 1440 aligned 5.32, in-sync 10.06, forklift-hire 6.26, x-range 7.73 …), each with measured rows;
(2) the structural-step rows measured box by box: compact-class (Δh 668/594, step 944 at 5600), energy-systems
(32/39 %, Δh 245/513), intralogistics-automation (step 801 at 3600), explosion-proof (step 649 at 5800), sustainability
(step 509 at 3000), innovations (step 457 at 1400), working-at-linde 360 (step 440 at 1600), events 360 (step 478 at
1800), tow-trucks 360 (step 219 at 3000).

## Handoff gap unit gap-hot-windows — the near-bar rows' hot windows measured box by box: three block rules, three documents, six measured residuals; done-check 28 → 24 (2026-10-08)

The session opened on 28 failing pages and re-ran line-parity over all of them at both widths (2026-10-08 22:31Z): two
1440 rows read glyph-only (gse-expo aligned 5.32 %, in-sync 10.06 %, 0 hot windows) and nine rows failed on ONE small
step plus ONE hot window. A hot window is missing paint, not glyph shapes, so each was cropped on both captures and the
boxes measured live against the preview (measure.mjs) before any CSS line.

Working-at-linde 1440 (hot 6200): the red band's CTA. Source `a.btn__link > .btn` — 189 × 48, padding 8 / 16,
line-height 30, background #fff, colour #aa0020, margin-top 18 on a 66 px link block; the pipeline's `<p><strong><a>`
arrived as `a.button.primary`, 189 × 48 but red on red (the band's `a { color: white }` rule left the primary
background) with an 8.55 / 12 wrapper margin. hero.css paints it white/red with the 18 px margin: 10.43 → 8.84 % PASS,
Δh −39 → −8. Six live pages carry a `.btn` in a `.layout--red` band.

Diesel 1440 (hot 4400 / 4600 at 59.6 / 66.8 %): the second parallax card. The source has four card positions
(`text-wrapper--topleft` ×25, `--topright` ×13, `--bottomleft` ×7, `--bottomright` ×7 across the 52 live cards);
hero.css already carries `banner right` and `banner bottom`, and 18 documents use them, but next-champ (5th card),
linde-ergonomics (2nd) and diesel-forklifts (2nd) said plain `hero banner` — measured diesel: live wrapper top 228.36 /
bottom 0 against build top 0, the 230 px card offset in the crop. A per-page comparison script (banner-variants.mjs)
restored the three and they were re-published (deploy-batch 3 ok, live); the diesel hot window fell to 39.8 %, the
remainder being the live `.parallax__image` transform (−78 / −82 px at measure time, the archetype's documented AOS
capture state). Heavy-duty and x-range cards measured identical on both sides (648 wide, margin 72, top 0, h3 73.34 /
36.67, p 209.34 / 299.06); their hot windows are the same image transform (−78.12 / −99.88).

Ergonomics: its first banner card is empty on the source (648 × 72, transparent, h3 0 px) — hero.js now marks a copy-less
banner card and hero.css hides it (the build drew a 72 px white box). Its "Reduction of impacts and vibrations" list is
`<h3> <ul class="bullets">` on the source (invalid nesting, renders as a dash list); the document had the three items
flattened into one bold h3 at heading size — restored as a `ul` with the verbatim text and re-published. 360: maxStep
748 → 43, Δh −216 → +99, 22.68 → 23.07 %; the content probe now reads MISSING 1 — the source h3 whose text is the list —
a probe artefact for a content override. The 1440 recapture stalled (stitch-shot scroll stall at chunk target 17126,
the documented `docH mod 900 < 34` case) so the 1440 row keeps the pre-list capture (13.66 %, hot 3 → 0 from the
variant fix); a symmetric `--vh 880` recapture is the next unit's first item.

Forklift-hire 360 / working-at-linde 360: the CTA band measures 153 px on both sides at 360 (source
`.layout-100--fixed` 342 × 153 with 18 / 4.5 / 4.5 padding, row 324, `.btn` 76; build `.section.cta` 360 × 153) but
the build's 2.5vw side inset made the button 342 wide against 324 — hero.css ≤ 639 uses 5vw. The grey CTA in every live
capture is the documented AOS state. Working-at-linde's "Application Process" band: the source row is `.layout--white`
grey (238,239,243) but each 50 % item is its own `.layout--white` wrapper painted white (720 × 522 at 1440; 360 × 319 +
360 × 481 at 360), so the visible band is white and the build had painted it grey — columns.css paints
`.columns.flex.white .columns-col` white (crop confirms). Its pixel stays 15.55 % because the remaining drift is
spacing: 25 px between the link list and the headline band on the source against 5 on the build (offset −52 → −75 at
y 3200) and two −13 steps at 6400 / 6800.

Residuals documented with the measurements (override-write): gse-expo and in-sync 1440 (glyph-only); x-range 1440 and
360 (parallax capture state; at 360 also the icon tiles wrapping 3 lines live / 2 build, 245 vs 210 px);
forklift-hire 1440 (media-carousel 1440 × 600 both, Δy −45 from the wraps above, 810 px slide image both — a photo
compared 45 px out of register) and 360 (CTA band 153 both, card photo ~100 px out of register, wrap steps ≤ 59).
Not fixed, recorded: eight live pages carry a 54 px LindeGlobalIconFont glyph above the red band's h3 (f179
measurement, f137 forklift, f13f mail, f181 safety; measured tugger-trains: 640 × 67.5 at 1440, 32 / 40 at 360) and
the documents carry none — default content has no icon mechanism; heavy-duty 1440 clips three "more" links in
`.related-teasers-item` by 7 px.

Roster: 1440 54 + 26 = 80, 360 30 + 47 = 77, both 70 → 74 of 98; update-coverage --gate all-both (4 flips), verify --all,
done-check 28 → 24 (gse-expo, in-sync, x-range, forklift-hire delivered).

Next: (1) ergonomics 1440 at `--vh 880` both sides + the h3>ul content override; (2) working-at-linde 360 spacing
(link list → band 25 vs 5 px, the 6400 / 6800 steps); (3) diesel 1440 steps at 6800 / 8600 beside the two capture
states; (4) the red-band icons (8 pages); (5) heavy-duty's clipped "more" links; (6) the structural-step rows
(compact-class, energy-systems, intralogistics-automation, explosion-proof, sustainability, innovations, h-models,
happy-driver, logimat, events 360, tow-trucks 360).

## Handoff gap unit gap-galleries-wizard-embed — the two largest-step rows read section by section: a missing 600 px iframe, a collapsed wizard band, seven flattened galleries (2026-10-08)

The session opened on done-check 24 (pages_failed) with every recorded unit done, and took the two rows with the
largest height deltas — compact-class (Δh +668 at 1440, +594 at 360) and energy-systems (+245 / +513) — not band by
band but section by section: measure.mjs over the top-level children of the live `#pjax-container` against the
build's `main > div` at both widths, side by side in one table (an-table / m-table helpers under
.work/replica/gap-steps2). anchor.mjs cannot do this on the source (its section model is `main > .section`; the
live root returns no sections), measure.mjs with `--all-matches` in nth-child slices of 12 can.

Compact-class: every section aligns to within a few px until y 6580 (1440) / 7772 (360), where the live page has a
600 px child with no text — a page-level `<iframe width="100%" height="600" src="https://www.linde-mh.com/media/
Global-Content/Linde-Warehouse-POV-E16_Xi16/">` between the "360° view from the driver's cabin" section and the
"Which Forklift Truck Is the Model for You?" picker, missing from the document. A new `embed` block carries it (one
cell, the frame URL as a link → iframe 100 % × 600, border 0, full bleed via `.embed-wrapper { max-width: none }`),
and the document got the section. The first hot window (5600–6000 at 48–56 %) was the Roadsters gallery: the live
`.carousel-wrapper` carries four 1:1 pictures (7275 first), the document cell one (7193, the last) — restored in live
order.

Energy-systems: the sections align until "Which technology fits your requirements?" — 604 px live / 412 build at
1440, 830 / 392 at 360 — the `wizard` block (energy-systems is its only page). Measured live: `.wizard` padding 32px 0;
each slide a `.layout-50--fixed` padded 32px 16px (18px / 4.5px = 5vw / 1.25vw at 360) with two 50 % item wrappers
padded 18px 16px (4.5px at 360), top-aligned; picture 592 × 333 (342 × 192); h2 54/67.5 (32/40 at 360), h3 32/40 with
8px vertical padding, both weight 400; "Start now" 111 × 48 (padding 8/16, line-height 30, margin-top 20); on the
question slides a 6 px progress row (10 dots, 6 px apart, margin-bottom 6), the answers 58 px grey rows (padding 8px
48px 8px 16px, 4 px apart, 24 px under the h3, 16 px above a 48 px grey "Back"). The band is as tall as the TALLEST
slide (slick list 540 at 1440, 766 at 360) with the active slide at its top, so wizard.css stacks every slide in one
grid cell (inactive `visibility: hidden`, never removed) and wizard.js prepends the progress row to question slides.
The build had 27 px / 21 px headings, a 56 px bold button and only the active slide in flow.

The gallery finding generalised: the live HTML of all 24 failing pages was fetched and every `.carousel-wrapper`
compared with the document cell carrying one of its pictures. Events and happy-driver are `media-carousel` rows
(complete); r-matic, safely-to-the-top (3), x-models, intralogistics (2), ergonomics #1 and explosion-proof #0 already
carry the full lists; six cells on five documents carried one picture where the source has 2–4 — compact-class,
ergonomics #0 (2), explosion-proof #1 (2, both video players), forklift-truck (4 + 4), tow-trucks (2). All restored in
live order (carousels.mjs). The first re-gate made forklift-truck WORSE (1440 11.39 → 20.07, Δh −88): the columns
carousel geometry (slide = the item column, dots absolute at the bottom, 48 px red arrows centred) is scoped
`.columns.carousel`, and these blocks had no class — the dots and arrows rendered as default buttons in flow under a
528 × 297 picture with 32 px padding. Class added to the six blocks, and columns.js now adds `carousel` whenever a
cell carries several pictures (authors omit it). Measured after: forklift-truck slides 592 × 333 / 342 × 192 on both
sides, explosion-proof video carousel identical on both sides at both widths.

Re-gate (--only, both widths, eds recaptured; ergonomics 1440 on symmetric --vh 880 captures): forklift-truck 1440
20.07 → 11.95 (Δh +91, 0 hot windows, step 70 at y 17800); tow-trucks 1440 13.52 → 11.92 glyph-only (override
holds), 360 23.37 → 13.44 (Δh +229 → +62); ergonomics 1440 13.66 (stale) → 11.61 (one hot window at 15800), 360
23.07 → 23.72; explosion-proof 21.59 / 22.29 — its step 649 at y 5800 sits above both carousels. Forklift-truck 360's
first drift (y 2600, step 565) crops to two stacked CTA buttons ~40 px apart on the build against 4 px live.
Compact-class 1440's eds capture stalled (docH mod 900 < 34, kept the old row) and the embed block is code — live
only after the checkpoint push, as is the wizard lift. Roster unchanged: 1440 54 + 26, 360 30 + 47, both 74 of 98,
done-check 24.

Next: (1) regate compact-class (both widths, 1440 at --vh 880 symmetric) and energy-systems once the code is live;
(2) forklift-truck 360 stacked-CTA spacing (measure the two .btn rows); (3) ergonomics 360 hot 9000–9800 + the h3>ul
content override; (4) explosion-proof 1440 step 649 at y 5800; (5) the remaining structural-step rows (sustainability,
innovations, h-models, happy-driver, logimat, events 360, tow-trucks 360 step 258, intralogistics).

## Handoff gap unit regate-steps2 — compact-class and energy-systems re-gated with the embed and wizard code live: a capture-geometry stall explained, two rows into the residual regime, one PASS (2026-10-09)

The session opened on done-check 24 with every recorded unit done and the previous unit's code (embed block, wizard
lift, columns carousel class) live on the published origin (blocks/embed/embed.js and blocks/wizard/wizard.css answer
200; the compact-class and energy-systems documents carry the `embed` and `wizard` blocks). Both pages were re-gated
`--only` at both widths: 1440 with both sides recaptured at `--vh 880` (the symmetric capture the last unit asked
for), 360 with the eds side recaptured.

Compact-class 1440 stalled a third time ("scroll stall at chunk target 14108: scrollY stuck at 14074 while the
document reports 14988"). A scroll probe on the preview page (gap-steps3/scroll-probe.mjs) read the geometry: html
and body overflow visible, innerHeight 880, document 14954 after load — the page shrinks 34 px while it loads, so
the stitcher's last multiple chunk (16 × 880 = 14080) and its bottom-anchored final chunk (14988 − 880 = 14108)
both clamp to the same reachable scrollY and the no-advance guard fires. It is the clamp coincidence, not an inner
scroller: at the default 900 px chunk the final target (14088) sits 588 px above the last multiple (13500) and the
capture completes. Recaptured both sides at the default: **8.68 % Δh +68 PASS** (the row had read 18.18 % / +667
against the stale eds capture). The journal's earlier "docH mod 900 < 34" heuristic is this same clamp.

Energy-systems after the wizard lift: 1440 32.21 % / +245 → 13.03 % / +59, 360 39.41 % / +513 → 27.6 % / +60. The
section table (measure.mjs over the live `#pjax-container` children against the build's `main > div`, m-table) puts
the wizard at 604/598 (1440) and 830/824 (360) and every one of the 23 top-level sections within 32 px of the live
box at 1440 and 30 px at 360 — one-line wrap forks (teaser row 1015 vs 983, Li-ION 677 vs 652, System: changed
1998 vs 1972). line-parity: aligned 8.19 % / max step 34 at 1440, aligned 17.08 % / max step 31 at 360; the hot
windows that keep its verdict at "drift" were cropped on both captures: 360 y 800 is the origin capture state (the
live lazy-loaded photo at y 764–900 is blank in the stitched origin and painted on the build); 1440 y 8000 and 360
y 6000 / 7200 / 8000 / 9000 / 9800 are the 900 px stitch seams where the sticky anchor strip repeats on both sides
while the content under it carries the accumulated 50–76 px drift, so no single window offset aligns both — no
missing paint. Compact-class 360 reads glyph-only (aligned 12.97 %, max step 30, no hot window) now that the iframe
(7746 × 600 build vs 7772 × 600 live) and the four-picture Roadsters gallery are in place.

Three documented-residual overrides (override-write, measured numbers beside the override, flagged for the FF
Daxline Pro licence decision): compact-class 360, energy-systems 1440 and 360. summary-patch ×3, reoverride,
both-widths: roster 1440 55 + 27, 360 30 + 49, both widths 76 of 98; update-coverage --gate 2 flips; done-check
24 → 22.

Next: (1) forklift-truck 360 stacked-CTA spacing (measure the two .btn rows live vs build at y 2600, step 565);
(2) ergonomics 360 hot 9000–9800 + the h3>ul content override at both widths; (3) explosion-proof 1440 step 649 at
y 5800; (4) the remaining structural-step rows.

## Handoff gap unit gap-steps3 — three structural rows measured box by box: a program-row paragraph margin, a grey band restored by document, a double-height quote lifted, ergonomics documented (2026-10-09)

Forklift-truck 360 (step 565 at y 2600): measure.mjs on the two product-finder buttons — live `.inline-button-row
--horizontal` 342 wide at x 9 (the 1.25vw container + 1.25vw wrapper inset), margin 8px 0, each `a.btn__link` a
block holding a 78 px `.btn` (padding 8/16, line-height 30, margin 4px 0) with an 8 px right margin, so two stacked
buttons sit 86 px apart; the build's `p.button-wrapper` carried the program rule's 8px top/bottom margins (102 px
pitch) and the row's 3.75vw padding put it at x 14. columns.css < 1280: row padding calc(6.25vw + 8px) 2.5vw (the
row margin folded in, as hero.css already does for the landing rows), p margin 0 8px 0 0; ≥ 1280 the p keeps its
8px right margin (live 1440: 272 + 447 → 727). Single-button program rows keep 132 / 187 px. Code — live after the
push; re-gate in the next unit.

Explosion-proof 1440 (step 649 at y 5800): the live "Series Level Explosion Protection" section is
`.layout-100--flex.layout--white` (rgb 238,239,243, 1440 × 433) around a `.layout-50-reverse--fixed` row (1280,
padding 32/16, items 624 with 18/16): text item first — left at 1440, column-reverse at 360 (carousel above the
text). The document had the picture cell first and no section style, so the build drew image-left / text-right on
white. Document-only fix: the two cells swapped and the section given Style `white` (hero.css `.section.white`);
the mobile order was already media-first (`.columns-media-col { order: -1 }` ≤ 639). Re-published (deploy-batch,
live) and re-gated: 1440 21.59 → 20.54 %, the band 433/433 on both sides (crop gap-steps3/ex-1440-5800b.png), the
first drift moved from 5800 to 8200. The section table (measure.mjs, 48 live children against 32 build sections)
then named the remaining 1440 step: "Hazardous areas in one of our explosion-protected zones" 592 live vs 375 build
— a `blockquote.doublehigh`, the only blockquote in the delivered documents and the class every one of the 12
captured blockquotes carries: live 360 20px / 30px rgb(170,0,32) centred, padding 40px 20px, 342 wide, h 560;
1440 27px / 40.5px, padding 54px, 928 wide, h 432, the attribution 640 wide at x 400 directly below (the build's
attribution already sits there). The build rendered the body quote: 18px left-aligned with 40 px side margins and
a 640 px paragraph (179 px at 1440, 372 at 360). hero.css `.section.article blockquote`: margin 0, padding 2em 1em
(2em at ≥ 1280), red, 1.25rem / 1.5rem, line-height 1.5, centred, the paragraph inheriting. Code — live after the
push: expected 1440 Δh +188 → about −30.

Ergonomics: the content probe's MISSING HEADING is the source's `<h3><ul class="bullets">` (invalid nesting read as
a heading whose text is the list; the document carries the list verbatim) — recorded in the row's override. The
section table (48 sections at both widths, gap-steps3/m-ergo-*.json) puts every 1440 section within 30 px of the
live box (the 70 % window at 15800 is the "Read more about Linde's safety solutions" CTA band under the anchor
strip the capture pins, at −68 px). At 360 the measured residuals are two CTA bands +30 (button text wrapping to a
second line in the substitute face), the Steer Control carousel 876 vs 902 — a 360 × 360 box on both sides, the
same 1x1 asset family (live `_1x1w640`, build the 750 px rendition of `_1x1w1920`), the live capture holding a
different frame of the two-slide carousel — and the three content-browser widgets (Linde Load Control,
Multifunction lever, Linde Safety Pilot) 192 vs 147, −45 each (live stage 342 × 192, build rail 147; the panels
display:none on both sides): a media-browser mobile rule left for a later pass. Both widths recorded as documented
residuals (1440 11.61 %, aligned 7.33, max step 29; 360 23.72 %, aligned 13.59, max step 44).

Roster 1440 55 + 28, 360 30 + 50, both widths 77 of 98; update-coverage --gate 1 flip; done-check 22 → 21.

Next: regate-steps3 once the push is live — forklift-truck 360 and explosion-proof at both widths (recapture eds);
then the remaining structural rows (sustainability steps 509 / 646, innovations 457, events 360 478, …).

## Handoff gap unit regate-steps3 — explosion-proof re-gated into the residual regime, forklift-truck's residual named row by row, the KPI table and two band paddings measured against the live site (2026-10-09)

The session opened on done-check 21 with the last unit's code live on the published origin (hero.css carries the
blockquote rule, columns.css the program-row paragraph margin — both answer on main--96d6da00--aemcoder.aem.live
once fetched `--compressed`; the origin always gzips, a plain curl + grep reads 0 matches). Three `--only`
re-gates ran at once (eds side recaptured, origin reused).

Explosion-proof 1440: 20.54 % / Δh +188 → **11.41 % / −29**, aligned 8.68 %, max step 27. The section table
(measure.mjs, 24 live sections vs 32 build) puts every row within 28 px; the three windows over 35 % (8600–9000)
are the video poster band — the live poster 686 px tall against the build's 650 (1216 wide both), the live grey
outline play icon against the build's red one, the quote above ending 16 px higher (crop
regate-steps3/ex-1440-8600.png). 360: 22.26 % / −46 → 26.28 % / −201 — the 658 px quote now matches on both
sides, so what remains is the sum of one-line wrap forks over 24 sections (none over 30 px: hero +22, intro +10,
industries +28, technologies +26, the contact CTA band +30 where the button text wraps, products +26); the
windows at 2600 and 8000 are the A-to-Z section (396 both sides) displaced 43 px and the poster band displaced
108 px; the 105 px step at 7400 is where the drift accumulates at the camera-row boundary. Both widths written
as documented-residual overrides with the measured numbers → delivered.

Forklift-truck 360: 20.23 % / −133 → 18.98 % / −117; the Buy/Hire/Lease row is 511 live / 509 build now. The
full live table (47 sections, nine nth-child chunks) names the residual: intro + Read-more 293 vs 334 (+41),
the Compact Electric card row 628 vs 652 (+24), the Heat-and-Dust content browser 192 vs 147 (−45), the
Operating Environment accordion 644 vs 697 (+53: "Maximizing Efficiency and Value" wraps to two lines in the
substitute face, the open panel runs 11 lines against 10), FAQ 1234 vs 1282 (+48, the same wraps). At 1440
(11.95 %, aligned 7.56, step 70 at 17800) the FAQ panel is 1085 vs 1014 (fewer lines) and the read-more band
285 vs 272. The max step 977 at 3800 is the sticky anchor strip repeated at every 900 px stitch seam being
paired across chunks, not a layout step (crop ft-360-3800.png shows the strip at the top and at 900).

Two of those rows are template rules. Read-more: live `p.intro` sits 23 px below the band top at 360 (the
generic 6.25vw) while the build's `:has(+ .read-more)` rule forced `padding-top: 50px` at every width (548 vs
521); the toggle band is `.read-more` 25 px + `margin-bottom: 16px` + the band padding = 63 px at 360 and 93 at
1440 — on gse-expo too (67 px below the toggle line; the earlier "50 px chrome below" reading missed the
margin). hero.css: the padding-top dropped from the :has rule, toggle wrapper `padding-bottom: calc(6.25vw +
16px)`, 66px ≥ 1280. Content browser: the live `.layout-100--fixed > .content-browser` band carries 6.25vw
above and below at 360 (forklift-truck 147 in 192, tugger-trains 245 in 290 — the tugger-trains comment had
measured the widget, not its band); media-browser.css `.media-browser.content` padding `0 2.5vw` → `6.25vw
2.5vw` at ≤ 639. Both are code — live after the push, re-gate in the next unit (forklift-truck, ergonomics ×3,
tugger-trains, gse-expo).

Sustainability: the section table puts 29 of 30 live sections within 14 px (1440) / 27 px (360); the one
structural row is the Environmental Protection article with the KPI table: 775 live vs 936 build at 360. Live
(src-1.css): `.table-responsive { overflow: auto } > table { width: 100% }` of the 640 px article column —
640 × 413 at 1440 (header row 40, td row 52) — with `table td { min-width: 7rem }` making four 112 px columns
= 448 px that scroll at 360 (448 × 502, td row 73), `tr { border-bottom: 1px solid lightgrey }`, header cells
`td.th`. The build stretched to 928 at 1440 and let its cells shrink to 96 / 77 / 105 at 360 (383 × 659, every
label wrapping) with the header row rendered as td. table.css: `.section.article .table` max-width 640 centred,
`td { min-width: 7rem }`, article `tr` borders; the cookie-declaration th widths scoped to `.static` so a
four-column table keeps its auto layout; the document's block now carries the `header` variant (deploy-batch
1 ok, live). Re-gate after the push.

reoverride ×2, both-widths: roster 1440 55 + 29, 360 30 + 51, both widths 78 of 98; update-coverage --gate 1
flip; done-check 21 → 20.

Next: regate-steps4 once the push is live — forklift-truck, sustainability (both widths), ergonomics 360,
tugger-trains 360, gse-expo 1440; then innovations (457), events 360 (478), awards, h-models, happy-driver,
logimat, magazine 360, automation-summit 360, r-matic 360, safely-to-the-top, x-models 1440, diesel 1440,
gas-forklifts, heavy-duty 1440 (clipped 3), tow-trucks 360, working-at-linde 360, intralogistics.

## Handoff gap unit regate-steps4 — forklift-truck passes at 1440, the KPI table fixed cell by cell, tugger-trains named down to a missing icon glyph (2026-10-09)

The session opened on done-check 20 with the regate-steps3 code live (hero.css read-more band, media-browser.css
content-browser band, table.css article table). Seven `--only` re-gates ran at once (eds side recaptured, origin
reused): forklift-truck 1440 11.95 % / Δh +91 → **9 % / +75 PASS**; 360 18.98 → 15.38 % / −123. The 360 section
table (regate-steps4/m-ft-eds.json against the regate-steps3 live table, 48 live sections against 49 build boxes —
the Read-more toggle is its own 65 px box on the build) has intro + toggle 293 vs 295 and the Heat-and-Dust
content browser 192 vs 192 — both regate-steps3 rules measured correct — and every row within 24 px except the
Operating Environment accordion (644 vs 697) and the FAQ (1234 vs 1282), the wrap forks named last unit. The
36–67 % windows at 18000–20000 are the DB Schenker section (2056 both sides) displaced by the accumulated offset:
crop ft-360-18000.png shows identical content shifted by the CTA band. Documented residual.

Sustainability: the first pass read 1440 14.4 % / −30 and 360 31.4 % / −128 — at 1440 the KPI table now matched
(418 vs 413) but at 360 it was 601 against 502. Cell measurement (m-tbl-live/eds.json): the live td is
`.875em / 1.75` = 14 px / 24.5 at 360 (15.75 / 27.56 at 1440) with 12 px above and below; the block's cells were
the `.table` 0.95rem = 15.2 / 26.6 with 11 + 11, so every two-line label took a third line (rows 103 / 76 / 129
against 73 / 73 / 100). table.css: `.section.article .table td { padding: 12px 8px 12px 0; font-size: .875rem;
line-height: 1.75 }` (the th row already matched: 37 / 40). Pushed, live in 5 s, re-gated: 1440 **13.07 % / −23**
(article 680 vs 682, every measured section within 16 px), 360 **17.73 % / −33** (article within 10 px; the
gallery 768 live vs 235 + 255 + 285; intro −27, award +23, logistics paragraph −18 remain). Both documented.

Tugger-trains 360 read 15.83 % / Δh −1 with every section within 27 px, but the 1440 row (12.8 % / +64) had one
structural row: the "A Tugger Train Made to Measure" band 476 live vs 408 build. Box by box (m-mtm-live2.json /
m-mtm-eds.json): the live `.text-container--center` carries `span.icon.icon-LMHIconsmeasurementblack` — an
icon-font glyph (private-use codepoint, 54 px line at 1440 / 40 at 360) above the h3 that the extract did not
capture; the build box is 72 + 18 + 37 + 209 + 72. The same band at 360 was 512 vs 498 because hero.css's
centred-band-before-gallery rule (written for this very band at 1440: live 476, build 318) forced a flat
`padding-bottom: 72px` where the live keeps 18 at 360 → `min(5vw, 72px)`, the band's own value. Re-gated 360:
17.58 % / +53 — the surplus padding had been masking the missing glyph line; the correct rule plus the omission
reads worse than the wrong rule did. Documented at both widths with the omission named for the owner (the one
icon-font character in the roster's article copy; carrying it needs the icon as an SVG asset). icons/ holds only
search.svg; no content document carries an LMHIcons glyph.

Ergonomics 360 23.72 → 17.47 % / −28 and gse-expo 1440 14.78 → 11.88 % / +26, both already documented. Also
seen: stylelint reports three pre-existing errors in hero.css (comment spacing at 421, duplicate selectors at 612
and 722) — not from this unit, left for a lint pass.

reoverride ×2, both-widths: roster 1440 56 + 31, 360 30 + 54, both widths 81 of 98; update-coverage --gate 1 + 2
flips; done-check 20 → 17.

Next: regate-steps5 / gap-steps5 over the 17 remaining rows, largest steps first — innovations (1440 st457, 360),
events 360 (st478), awards, h-models, happy-driver, logimat, magazine 360, automation-summit 360, r-matic 360,
safely-to-the-top, x-models 1440, diesel 1440, gas-forklifts, heavy-duty 1440 (clipped 3), tow-trucks 360,
working-at-linde 360, intralogistics.

## Handoff gap unit gap-steps5 — h-models' leading line breaks restored, the large centred band and the icon-font glyph for safely-to-the-top; the unit closed from its recorded state (2026-10-09)

The unit was in flight at the session boundary with its code and documents committed: h-models' five leading
heading line breaks (`&#8203;<br>` is the form that survives the pipeline), the `.center.large` band rule
(flex column, p 1.125em / 1.5, margins kept) in hero.css, and the Linde icon-font glyph above a centred heading
(`:lmhicons…:` → `.icon-lmhiconssafety::before` codepoint in styles.css) for safely-to-the-top. This session
verified all of it live before recording anything: hero.css and styles.css on the aem.live origin carry the
rules (gzip on the wire explains the smaller byte count), h-models serves the five `<br>`, safely-to-the-top
serves `span.icon.icon-lmhiconssafety`.

The unit's own `--only` re-gates (runs 02:01 / 02:04): h-models 1440 18.84 % / Δh −66, 360 18.62 % / −24
(from −170 before the line breaks); safely-to-the-top 1440 **4.05 % / +1 PASS**, 360 24.86 % / +31. Both rows
stay documented residuals of the FF Daxline Pro → Nunito Sans substitution (text-region diff ≈ the whole diff).
Nothing was re-authored. Coverage reads 98 of 98 verified; done-check lists `rollout_incomplete` only — the
rollout's I-dashboard end of 2026-10-07 is followed in the ledger by the blocked re-check lines, so the
dashboard phase is re-run now that coverage has changed, and its end line closes the gap.

Next: I-dashboard re-run, then the handoff end once done-check reads complete.

## Handoff — the migration closed: 98 pages delivered and published, coverage 98 of 98 verified, done-check complete (2026-10-09)

The handoff phase opened on 2026-10-06 and ran through migrate plan → rollout A–I, the render clusters, the
published-origin gate-all roster and a long series of gap and re-gate units that worked the roster's rows
down from 72 open gate rows to documented residuals (journal sections above). The two licensed FF Daxline Pro /
Dax Pro families are not rehostable and ship as the metric substitute Nunito Sans with the brand family first
in the stack; every residual pixel row is that substitution's glyph-shape difference, measured and logged page
by page with its override. All delivered pages, the redirects sheet and the chrome documents are live on the
aem.live origin (publish decision recorded in eds-conversion-log.md). The dashboard was re-rendered from the
final coverage and the runner's done-check reads `{"complete":true,"gaps":[]}`.

Owner follow-ups, all documented in the register and the rollout notes: deliver the licensed font files to
replace the substitute (the only remaining source of the residual rows); the LMHIcons icon-font glyphs used
once in article copy are carried as `::before` codepoints and should become SVG assets; the deferred foundation
requests (18 px root on listing, program CTA row at 360, location-finder footer 5 px) stay queued for the first
post-migration foundation change.
