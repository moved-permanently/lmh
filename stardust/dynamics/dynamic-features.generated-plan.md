<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-06T16:11:34.017Z · input stardust/current/_dynamics.json (7 pages, 33 findings) · target probe https://main--96d6da00--aemcoder.aem.live · reconciled against stardust/migrated -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-epcloud-ccm19-de | A | unknown third-party host epcloud.ccm19.de | 7/7 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-unknown-third-party-host-px-ads-linkedin-com | A | unknown third-party host px.ads.linkedin.com | 7/7 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 7/7 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | a-unknown-third-party-host-www-etracker-de | A | unknown third-party host www.etracker.de | 5/7 | static-snapshot | needs-human-capture | delivered-by-capture | inspect | inspect the XHR, add a vendor row | output already carries "www.etracker.de" |
| 5 | a-first-party-api-post-mwf-live-servlet-rest | A | first-party API POST /mwf_live/servlet/rest | 1/7 (reach 6/99) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 6 | cr-client-rendered-slot-module-fact-counter-content-js-fact- | CR | client-rendered slot module-fact-counter--content js-fact-counter red | 1/7 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 7 | f-form-global-search-form-origin-en-about-us-awards-1-fields | F | form "global-search__form" → origin /en/About-us/Awards/ (1 fields) | 1/7 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 8 | f-form-global-search-form-origin-en-about-us-company-1-field | F | form "global-search__form" → origin /en/About-us/Company/ (1 fields) | 1/7 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 9 | f-form-global-search-form-origin-en-about-us-events-1-fields | F | form "global-search__form" → origin /en/About-us/Events/ (1 fields) | 1/7 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 10 | f-form-global-search-form-origin-en-edi-1-fields | F | form "global-search__form" → origin /en/EDI/ (1 fields) | 1/7 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 11 | f-form-global-search-form-origin-en-forms-agility-on-point-f | F | form "global-search__form" → origin /en/Forms/agility-on-point-form/ (1 fields) | 1/7 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 12 | f-form-commanden2749431-no-action-js-wired-13-fields | F | form "commandEN2749431" → no action (JS-wired) (13 fields) | 1/7 | client-only | self | pending | client-compute | none |  |
| 13 | f-form-global-search-form-origin-en-productfinder-html-1-fie | F | form "global-search__form" → origin /en/Productfinder.html (1 fields) | 1/7 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 14 | f-form-less-control-group-in-body-30-controls | F | form-less control group in body (30 controls) | 1/7 | client-only | self | pending | client-compute | none |  |
| 15 | f-form-less-control-group-in-div-form-control-input-2-contro | F | form-less control group in div.form_control_input (2 controls) | 1/7 | client-only | self | pending | client-compute | none |  |
| 16 | f-form-global-search-form-origin-en-technical-news-detail-10 | F | form "global-search__form" → origin /en/technical/News-Detail_101184.html (1 fields) | 1/7 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 17 | i18n-locale-variants-en-us-en-us-en-us-en-us-en-us | I18N | locale variants en-US,en-US,en-US,en-US,en-US | 7/7 | rebuild-native | needs-business-decision | delivered-by-capture | locale-tree | scope of the locale trees | output already carries "https://kiongroup.wd3.myworkdayjobs.com/" |
| 18 | m-modal-trigger-data-ccm-modal-dialog-form | M | modal trigger data-ccm-modal → dialog:form | 7/7 (reach 495/99) | rebuild-native | self | delivered-by-capture | modal-loader | none | output already carries "Settings" |
| 19 | m-modal-trigger-aria-haspopup-listbox-content | M | modal trigger aria-haspopup → listbox:content | 1/7 (reach 12/99) | rebuild-native | self | pending | modal-loader | none |  |
| 20 | s-first-party-api-get-lmhnewproductsearch-cloud-execute | S | first-party API GET /lmhnewproductsearch_cloud/execute | 1/7 (reach 2/99) | data-fed | needs-business-decision | pending | off-origin-data | datasource ownership / same-origin routing on production | **dead on target (404)** |
| 21 | t-unknown-third-party-host-epcdn-ccm19-de | T | unknown third-party host epcdn.ccm19.de | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 22 | t-unknown-third-party-host-static-etracker-com | T | unknown third-party host static.etracker.com | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 23 | t-unknown-third-party-host-code-etracker-com | T | unknown third-party host code.etracker.com | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 24 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 25 | t-analytics-session-replay | T | analytics: session replay | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 26 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 28 | t-unknown-third-party-host-c-bing-com | T | unknown third-party host c.bing.com | 7/7 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 29 | t-unknown-third-party-host-www-linkedin-com | T | unknown third-party host www.linkedin.com | 7/7 | embed-passthrough | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.linkedin.com" |
| 30 | t-third-party-mount-div-data-nosnippet-tag-manager-injected- | T | third-party mount <div data-nosnippet> (tag-manager-injected widget) | 7/7 | embed-passthrough | needs-credential | pending | embed-passthrough | vendor account ids stay the owner's |  |
| 31 | t-unknown-third-party-host-www-etracker-de | T | unknown third-party host www.etracker.de | 2/7 | embed-passthrough | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.etracker.de" |
| 32 | x-sign-in-account-links | X | sign-in / account links | 7/7 | decided-out | needs-backend | delivered-by-capture | decided-out | auth / commerce on the new host? | output already carries "https://www.linde-mh.com/en/Service/Retr" |
| 33 | x-commerce-signals-cart-true-prices-0 | X | commerce signals (cart: true, prices: 0) | 1/7 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 6 row(s) — read-settings, settled-dom-snapshot, client-compute, modal-loader.
- **One owner decision batch:** 20 row(s) — inspect the XHR, add a vendor row · which tier for the target host; consumer on the migrated pages? · production endpoint; interim capture ships now · datasource ownership / same-origin routing on production · which tags run on the new host; property ids · vendor account ids stay the owner's.
- **Already delivered by the capture pipeline:** 6 row(s) — no work.
- **Host-bound on the target:** 2 of 2 probed API paths — the off-origin data work.

## Phases

- **tags** — 10
- **forms** — 7
- **detect** — 4
- **client tools** — 3
- **off-origin data** — 2
- **interactive** — 2
- **register** — 2
- **capture** — 1
- **locale wave** — 1
- **embeds** — 1
