<!-- stardust provenance: skill=stardust:replica (dynamics Phase 3) · 2026-10-06 · from stardust/dynamic-features.md -->
# Dynamic features plan — linde-mh.com/en

Static first, then wire (triage.md rule 7). Phase 0 is the replica itself; Phases 1–3 run inside
rollout (dynamics Phase 4) after each template's archetype is delivered; Phase 4 waits on the owner.

| phase | rows | deliverables | authoring contract | verification | owner decision | effort |
|---|---|---|---|---|---|---|
| 0 static | all | every page renders as captured; forms, finder, map, search as settled DOM | content verbatim, no fabricated copy; register rows for decided-out | replica gates (pixel, content-diff, clip, presence) | none | in the replica |
| 1 client tools | 5, 4 (UI) | custom select / listbox behaviour; form field cascade (subject → detail selects), required marks, inline validation | block JS, no network; node-slotted (EW contract) | motion-observe / motion-compare parity on the form archetype; `dynamics-check` presence | none | S |
| 2 data | 8, 7 (if approved) | `data/location-finder/Dealer-Finder-App-Data.json` + `_provenance.json` via `snapshot-api.mjs`; product-finder snapshot only on approval | data on the code bus, fetched same-origin by the block | finder renders the dealer list from the snapshot; presence check | row 7: datasource ownership | S (row 8) / M (row 7) |
| 3 forms | 4 (submission) | `scripts/site-config.js` endpoint slot for `/mwf_live/servlet/rest` (disabled); "no backend connected" message on submit | endpoint indirection, never hard-coded on the block | submit blocked, message shown; `dynamics-check` | production endpoint / same-origin routing | S |
| 4 owner-gated | 1, 2, 9, 6, 10 | CMP + tags enabled per decision; Maps key allow-list; search results page + `helix-query.yaml`; locale waves | `site-config.js` slots; `helix-query.yaml` only when a listing or search is index-fed | tags fire only after consent; map loads; search count + titles parity (`expectCount` recorded then) | decision batch items 1, 4, 5, 6 | M |

Hands-off resolutions applied: interim tiers ship for every owner decision; decisions are named in
`stardust/dynamic-features.md` § Decision batch and will be echoed in the parity report.
Hard blockers: none (source reachable, no regulated capture, target config not needed yet).

Rollout B2 (2026-10-06): inventory re-verified against a fresh 7-page sample; row 13 (fact counters) added as Phase 0 static (settled values written into the capture); row 6 (header search) decided-out this run; host-bound APIs reconfirmed 2/2 on the target origin. Phases 1–3 unchanged.
