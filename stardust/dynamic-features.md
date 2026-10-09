<!-- stardust provenance: skill=stardust:replica (dynamics Phases 1–3) · curated 2026-10-06 from stardust/dynamics/dynamic-features.generated-plan.md (10 probed pages, 41 draft rows → 12 curated rows) · target probe https://main--96d6da00--aemcoder.aem.page (3/3 first-party API paths host-bound) -->
# Dynamic features — linde-mh.com/en (replica, 99 selected pages)

Scope is fixed to the 99 live pages selected in `stardust/.labs/site-plan.json`. Every feature
below degrades to a working static page first (replica Phases 3–5); the dispositions name what
replaces the static behaviour and what that needs. No row is `regulated-pii`; no page was
captured client-rendered-blank (detector: client-rendered 0 on all 10 probed pages).

**Verified at rollout B2 (2026-10-06):** fresh detector run over a second sample — one page per type that is NOT an archetype (Awards, Company, Events, EDI, agility-on-point form, Productfinder.html, News-Detail 101184): 33 findings, all mapping onto rows 1–12 except the fact counter (new row 13) and the per-page form variant (row 4 extended). `dynamics-plan --target-origin main--96d6da00--aemcoder.aem.live --migrated stardust/migrated`: the 2 first-party APIs (`/mwf_live/servlet/rest`, `/lmhnewproductsearch_cloud/execute`) are confirmed host-bound (404 on the target); 6 rows already carry their evidence in the migrated archetypes (etracker/LinkedIn link text, footer Settings trigger, careers link) as captured static content. No regulated-pii row; `helix-query.yaml` is not authored (no listing unfrozen).

## Listings contract

Listing pages (Press, Events, Magazine, Innovations from Linde, About us, Products, Automated
Trucks, Service, Solutions overview — 11 pages) and the related-teaser rails (34 pages) are
**server-rendered on the source** and ship as captured content in this run (`static-snapshot`,
unfreeze: a live news feed is wanted). So the unfreeze is cheap, every article page emits:
`title`, `description`, `og:image`, `publication-date`, `template: article`, `category`
(press / news). Every program and landing page emits `title`, `description`, `og:image`,
`template`. Index: **none authored in this run** (no index-fed block); `helix-query.yaml`
is authored at rollout B2 only if a listing is unfrozen.

## Features

| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | consent-ccm19 | CCM19 consent manager (epcloud.ccm19.de, epcdn.ccm19.de; `data-ccm-modal` triggers incl. footer "Settings") | T/M | 99/99 | embed-passthrough | needs-business-decision | decision recorded (hands-off) | consent-gated-tags | Owner: CCM19 property for the new host. Interim: no CMP loads on the preview origin; footer "Settings" link kept as captured (opens nothing until the CMP is configured). | draft rows 1, 25, 28 |
| 2 | tags-analytics | Tag manager and analytics: Google Tag Manager, Google Analytics/Ads, etracker (static/code/www), session replay, LinkedIn pixel, Bing, `data-nosnippet` mount | T | 99/99 | embed-passthrough | needs-business-decision / needs-credential | decision recorded (hands-off) | consent-gated-tags | Owner: which tags run on the new host; property ids stay the owner's. Interim: none load; `scripts/site-config.js` carries the slots disabled (rollout). | draft rows 3, 4, 29–38 |
| 3 | settings-datalayer | `dataLayer` settings object | A | 99/99 | static-snapshot | self | done (read only) | read-settings | none — keys read to name endpoints and vendors; nothing shipped | draft row 2 |
| 4 | contact-form-mwf | Request/contact form `commandEN220579` (17 fields: subject cascade, title, name, company, address, message; country service) posting to `/mwf_live/servlet/rest` | F/A | 8 form pages (API reach 6/99) | rebuild-native (UI) + data-fed (submission) | needs-backend | interim ships (hands-off) | forms + off-origin-data | Owner: route `/mwf_live/servlet/rest` same-origin on production or name the production endpoint. Interim: form UI rebuilt from capture (selects, cascades, required marks); submission disabled with "no backend connected" message; **dead on target (404)**. Not regulated-pii (business contact data). | draft rows 5, 14, 17, 26; B2 re-probe: `commandEN2749431` on /en/Forms/agility-on-point-form/ (12 fields + 6 hidden, no subject cascade) — the form field set VARIES per form page, so the `mwf-form` block is content-driven per page, never a fixed field list |
| 5 | custom-select | Custom select / listbox (`aria-haspopup="listbox"`, "Select*") | M | 12/99 | rebuild-native | self | pending (Phase 4, forms) | client-compute | none | draft row 26 |
| 6 | global-search | Header search form `global-search__form` (1 text field, submits to the current page; results page not among the selected pages) | F/S | 99/99 | static-snapshot | needs-business-decision | decided-out this run (rollout B2, hands-off): results page not in the fixed scope; register row below | search-index-backed | Owner: add the search results page to scope (then index-backed search over `/query-index.json`). Interim: input rendered as captured, non-functional (rule 4). Source probe not recorded: no results page to compare against. | draft rows 10–13, 15, 16, 18–21 |
| 7 | product-finder | Product finder (two shells: `/en/Productfinder.html`, `/en/Products/Productfinder/`): 30 filter controls (model, 11 truck categories), range controls, results via GET `/lmhnewproductsearch_cloud/execute` | S/F | 2/99 | static-snapshot (interim) → data-fed | needs-business-decision | interim ships (hands-off) | off-origin-data | Owner: datasource ownership — same-origin routing of the product-search API on production, or a catalogue snapshot under `data/product-finder/`. Interim: settled DOM as captured (filters + first result set); **dead on target (404)**. | draft rows 8, 9, 27 |
| 8 | location-finder-data | Location finder data `GET /en/technical/Dealer-finder-app/Dealer-Finder-App-Data.json` | D | 1/99 | data-fed | self | pending (Phase 4, data) | sheet-sync | none — snapshot from the source origin to `data/location-finder/` with `_provenance.json` (`snapshot-api.mjs`); **dead on target (404)** until snapshotted | draft row 7 |
| 9 | location-finder-map | Embedded Google Map on the location finder (maps.googleapis.com, maps.gstatic.com, mapsresources-pa.googleapis.com) | V | 1/99 | embed-passthrough | needs-credential | decision recorded (hands-off) | media-as-url | Owner: the Maps browser key's referrer allow-list must include the new host (the key stays the owner's). Interim: map area as captured (static). | draft rows 6, 39 |
| 10 | locale-trees | Locale alternates: `hreflang` x-default, en, de-DE, fr-FR, es-ES, it-IT, cs-CZ, pt-PT, sv-SE, en-GB, en-IE, de-AT, de-CH, fr-CH, hu-HU, pl-PL, it-CH, sr-RS, et-EE, sl-SI, el-GR, sk-SK, ro-RO, fi-FI, pt-BR; `en-US` variants | I18N | 99/99 | decided-out (this run) | needs-business-decision | decision recorded (hands-off) | locale-tree | Only the `/en/` tree is in scope. Alternates keep pointing at the source origin's locale trees; the language switcher is rendered as captured. Owner: locale scope for later waves. | draft rows 22–24 |
| 11 | compare-list | Product-finder compare / watch list counter (commerce signals: cart-like state, no prices) | X | 2/99 | decided-out | needs-backend | decision recorded | decided-out | Pure client state on the finder; no commerce on the new host. Rendered as captured, inert. | draft row 41 |
| 12 | account-links | "sign-in / account links" | X | — | dropped (noise) | — | — | — | False positive: the evidence is an ordinary in-scope link (`/en/Service/Retrofit-Accessories/`). | draft row 40 |
| 13 | fact-counter | Scroll-triggered count-up counters (`module-fact-counter`, `js-counter` with `data-count-to`): 4 values on /en/About-us/Company/ (13,000 · 700 · 100 · 8,500) and 4 on /en/Landingpage/In-Sync/ (698 · 7,380 · 1,396 · 70) | CR | 2/99 | static-snapshot (settled DOM) | self | done (rollout B2) | settled-dom-snapshot | none — the Company capture held the pre-animation `0` placeholders (section never scrolled into view at capture); the settled values were re-probed live at B2 and written into the capture (`current/pages/en-about-us-company.{html,json}`); the In-Sync capture was already settled. Count-up motion is not implemented on siblings (sibling tier has no motion gate); the final values render static. | B2 fresh probe, generated-plan row 5 |
| 14 | media-browser-video | Gallery video slide (`.media-browser .media-player[data-video-url]`, Vimeo player URL; poster + play glyph on the viewer, play badge on the rail thumb): /en/Products/Tugger-Trains/ (slide 1 of 8), /en/landingpage/logimat/ (slide 1 of 6) | T | 2/99 | static-first | reproducible | deferred | poster + play glyph delivered static; the row carries the player URL as a bare link → `data-video-url` on the slide (media-browser.js), no click handler | click-to-play was not observed by motion-observe on the archetype; implement once observed (inline iframe vs modal is the open question) — site owner to confirm the player behaviour | stardust/.work/replica/gap-media/ (measure.mjs live vs preview, 2026-10-08) |

## Decision batch

One message to the site owner, grouped by what it needs (hands-off: interim tiers ship now;
each decision is recorded here and in `stardust/dynamic-features-plan.md`):

1. **Consent and tags (rows 1–2):** which CCM19 property and which tags (GTM, GA/Ads, etracker,
   session replay, LinkedIn, Bing) run on the new host; property ids remain the owner's.
2. **Forms backend (row 4):** route `/mwf_live/servlet/rest` same-origin on production, or
   name the production endpoint for the request form. Until then the rebuilt form shows
   "no backend connected".
3. **Product search (row 7):** same-origin routing of `/lmhnewproductsearch_cloud/execute`
   on production, or approval to snapshot the catalogue. Until then the finder is a snapshot.
4. **Maps key (row 9):** add the new host to the Maps browser key's referrer allow-list.
5. **Search results (row 6):** whether the search results page joins the scope; without it the
   header search stays non-functional.
6. **Locale scope (row 10):** which locale trees follow `/en/`.

## Register (decided-out)

| feature | reason | production statement |
|---|---|---|
| Locale trees other than `/en/` | fixed run scope (`site-plan.json`) | Alternates and the language switcher link to the source origin's locale trees until those are migrated. |
| Product-finder compare / watch list | client-only state with no consumer on the new host; no commerce | Rendered as captured, inert; no cart, no prices. |
| Header search submission | results page outside scope | Input rendered, submission non-functional; unfreeze when the results page and a query index exist. |
