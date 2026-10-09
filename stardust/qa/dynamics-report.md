# Dynamics parity check — https://main--96d6da00--aemcoder.aem.live — 2026-10-07T07:07:58.715Z

Replayed 18 checks over 12 features · pass 18 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| CCM19 consent manager | T/M | scaffolded-awaiting-owner | consent-gate | PASS | no request to 2 gated host pattern(s) before consent |  |
| CCM19 consent manager | T/M | scaffolded-awaiting-owner | dom-count | PASS | 17 × footer a[href*='#'], footer a[href*='ccm'], footer .footer a (min 1) |  |
| Tag manager and analytics (GTM, GA/Ads, etracker, session replay, LinkedIn, Bing) | T | scaffolded-awaiting-owner | consent-gate | PASS | no request to 9 gated host pattern(s) before consent |  |
| Tag manager and analytics (GTM, GA/Ads, etracker, session replay, LinkedIn, Bing) | T | scaffolded-awaiting-owner | no-page-errors | PASS | none on 7 page(s) |  |
| Request / contact form (per-page field sets) posting to /mwf_live/servlet/rest | F/A | scaffolded-awaiting-owner | dom-count | PASS | 21 × .mwf-form form input, .mwf-form form select, .mwf-form form textarea (min 12) |  |
| Request / contact form (per-page field sets) posting to /mwf_live/servlet/rest | F/A | scaffolded-awaiting-owner | dom-count | PASS | 1 × .mwf-form form button[type='submit'] (min 1) |  |
| Request / contact form (per-page field sets) posting to /mwf_live/servlet/rest | F/A | scaffolded-awaiting-owner | dom-count | PASS | 17 × .mwf-form form input, .mwf-form form select, .mwf-form form textarea (min 10) |  |
| Request / contact form (per-page field sets) posting to /mwf_live/servlet/rest | F/A | scaffolded-awaiting-owner | consent-gate | PASS | no request to 1 gated host pattern(s) before consent |  |
| Custom select / listbox on form pages | M | done | dom-count | PASS | 6 × .mwf-form select.mwf-select (min 1) |  |
| Product finder (filters + results via /lmhnewproductsearch_cloud/execute) | S/F | interim | dom-count | PASS | 12 × .product-finder h3 a (min 4) |  |
| Product finder (filters + results via /lmhnewproductsearch_cloud/execute) | S/F | interim | dom-count | PASS | 45 × .product-finder .pf-checkbox (min 5) |  |
| Product finder (filters + results via /lmhnewproductsearch_cloud/execute) | S/F | interim | dom-count | PASS | 12 × .product-finder h3 a (min 4) |  |
| Product finder (filters + results via /lmhnewproductsearch_cloud/execute) | S/F | interim | consent-gate | PASS | no request to 1 gated host pattern(s) before consent |  |
| Location finder dealer data (Dealer-Finder-App-Data.json) | D | interim | dom-count | PASS | 2 × .location-finder .lf-field select (min 1) |  |
| Location finder dealer data (Dealer-Finder-App-Data.json) | D | interim | dom-count | PASS | 5 × .location-finder .dealer-card-title (min 2) |  |
| Embedded Google Map on the location finder | V | scaffolded-awaiting-owner | consent-gate | PASS | no request to 3 gated host pattern(s) before consent |  |
| Scroll-triggered count-up counters (settled values rendered static) | CR | done | dom-count | PASS | 161 × main strong, main h2, main h3, main p (min 4) |  |
| Scroll-triggered count-up counters (settled values rendered static) | CR | done | dom-count | PASS | 85 × main strong, main h2, main h3, main p (min 4) |  |

## Features without checks

- dataLayer settings object (A) — done
- Header search form (F/S) — decided-out · owner: Add the search results page to scope; then index-backed search over /query-index.json.
- Locale alternates and language switcher (I18N) — decided-out · owner: Locale scope for later waves; alternates keep pointing at the source origin.
- Product-finder compare / watch list (X) — decided-out
