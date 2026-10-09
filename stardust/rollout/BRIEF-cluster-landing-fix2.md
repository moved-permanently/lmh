# Addendum — landing fix ROUND 2 (of 3) over BOTH units `cluster-landing-1` (16) + `cluster-landing-2` (15), 31 pages.
# Read stardust/rollout/BRIEF-common.md, BRIEF-cluster.md and BRIEF-cluster-landing-fix.md (round 1) FIRST. Everything in
# round 1 is deployed and live (code sha-verified in sync, all 31 pages re-driven with --force at 00:00Z 2026-10-07).
# Job prefix `lfix2-`, port 8802. The slug list: stardust/rollout/units/cluster-landing-all.slugs (comma-joined, 31).

Round-1 result, gate 1440 (published regime, --origin-headless, --vh 700, job lfix-gate1440b, 00:22Z): **0/31 PASS**.
pixel % / Δh (round 1 → now; first pass in brackets where known):
in-sync 52.92/+522 (62.38/+1653) · r-matic 44.75/−677 (41.19/−470) · logimat 42.13/+355 (40.31/+404) · technical-safety-
services 36.92/+149 · gas-forklifts 36.32/−1339 (≈−1145, MISSING 10) · retrofit-accessories 35.42/−169 · energy-systems
33.96/−399 · gse-expo 33.39/−102 (32.53/+169) · safely-to-the-top 32.44/+50 (31.17/+502) · h-models 31.05/−451 (24.84/+30) ·
tugger-trains 30.58/−649 (MISSING 7) · maintenance-repair 30.57/−192 · company 29.84/−692 (31.47/−481) · happy-driver
29.61/−138 (28.29/+547, MISSING 4) · automation-summit 28.24/−1958 (25.99/−2093) · genuine-spare-parts 26.67/+111 ·
intralogistics-automation 26.09/−436 (origin captured crawl-fullpage ⚠asym → pass `--recapture-origin` for this slug) ·
platform-counterbalanced 25.07/−365 (24.97/−363) · warehouse-safety 23.96/−539 · compact-class 23.68/−830 (26.33/+235,
MISSING 4) · glasses 23.35/+236 (23.21/+236) · next-champ 22.31/+33 · x-range 21.03/−292 · x-models 21.03/−454 · hand-pallet-
trucks 20.92/−114 · fleet-management 20.08/+395 (MISSING 9) · agility-on-point 19.55/−42 (55.89/+1270) · heavy-duty-forklifts
19.42/−713 (MISSING 14) · financing 19.19/+51 · working-at-linde 16.52/−126 (18.41/+364) · pallet-stackers 11.01/−793
(MISSING 9). Clip 0 everywhere. The 360 run (job lfix-gate360b) is finishing as you start: read it with
`node stardust/scripts/replica/run-bg.mjs log lfix-gate360b --grep "pixel|PASS /"` before your own 360 run.
Band breakdown (per 500 px, %): in-sync 0:1 500:24.9 1000:18.4 1500:47.2 2000:76.3 2500:79.2 3000:31.1 3500:70.4 …
8000:93.9; r-matic 0:0.6 500:5.9 1000:32.2 1500:38 2000:55.3 2500:78 3000:79.7 …; logimat 0:25.7 500:26.4 1000:52.7 …;
gas-forklifts 0:1.8 500:6.3 1000:17 1500:21.6 2000:64 2500:60.6 … 5000:77.2 5500:4.2 … 9000:100. Everything below the
first hot band is offset-contaminated: fix the FIRST hot band top-down (in-sync: the hero banner / first columns row at
500–1000; logimat: the stage at 0–500), re-measure, then the next.
Reading: round 1 moved in-sync's Δh from +1653 to +522 but the pixel numbers of the other 30 pages did not move — the
`.columns.flex` geometry change was not the dominant error class. Measure before you touch anything.

Content MISSING (8 pages, all `MISSING LINK "#" → <page>` in the accordion item bands — gas-forklifts 10, heavy-duty 14,
intralogistics 12, pallet-stackers 9, fleet-management 9, tugger-trains 7, compact-class 4, happy-driver 4): accordion.js
appends an icon-only `<a href="#" aria-label="Toggle">` inside each `<summary>` client-side, yet the probe still reports
the live `#` anchors missing. Find out WHY with the probe itself (the content criterion is `content-presence` inside
gate-all.mjs — read its header for the matching key and the sidecars, `grep -n "presence\|MISSING" stardust/scripts/
replica/gate-all.mjs | head`): candidates — anchors inside a closed `<details>` are skipped as not rendered; the key is
(text, resolved href) and the eds `#` resolves to the folded lowercase path; `<summary>` children are not enumerated. Fix
in accordion.js/content so the served page carries the same link set the live page does (e.g. the toggle anchor as a
sibling of the summary heading, visible, href the page's own path + `#`), or, if the probe is wrong about an item that is
demonstrably rendered, document it in the presence sidecar the way gate-all's header allows — never by weakening the probe.

Order of work (ONE round = measure → fix → redeploy → re-gate; this is round 2; round 3 only if ≤ 75 min have passed):
1. measure.mjs at 1440, live vs the published build, through run-bg (one job): in-sync, logimat, r-matic — the hero/stage
   rows (`.header-image, .layout-passepartout > *:nth-child(-n+4)` live vs `.hero, .hero.banner, main > .section:nth-child
   (-n+4)` build), the headline rows (`.layout-100-headline--fixed` vs the build's h2 sections), the `.layout-100--flex`
   text bands, and the `.layout-50-reverse--flex / .layout-60-40--flex` rows vs `.columns.flex` — rect, padding, font-size,
   line-height per selector; `--all-matches`. Then ONE crop of the diff at the first hot band (`crop-compare.mjs
   stardust/replica/gates/all-1440/<slug>/origin.png …/eds.png --y <band> --height 500`) to name the error class.
2. Fix in your blocks (hero, columns under `.columns.flex|.carousel|.testimonial|.red:not(.band,.split,.feature)`,
   accordion, related-teasers facts, media-carousel, teaser-carousel standalone) and in stardust/rollout/encoders/landing.mjs
   (missing rows, wrong variant tokens, headline rows). Another agent is editing `.columns.band|.split|.feature` for the
   program template right now: never touch those hunks, `git pull --rebase` before every push, never revert a hunk you
   did not write. The working tree may hold changes to content files you did not make (e.g. content/en/about-us/company.html
   from another unit's localize-links): leave them, commit only the paths you changed.
3. Re-encode all 31 pages, sanitise, lint (BRIEF-common chain 3–8 for changed pages), commit + push code, sha-verify the
   code sync, `deploy-batch --force` over BOTH paths files (same ledgers as round 1, `--concurrency 2`, publish,
   `--token-file "$ADOBE_IMS_TOKEN_FILE"`) through run-bg; verify `.plain.html` 200 and no `about:error` (re-drive a
   verify-fail once: the two round-1 cases were transient preview-time image fetches).
4. Gate: `gate-state.mjs --host main--96d6da00--aemcoder.aem.page --preview`, then gate-all `--only $(cat stardust/rollout/
   units/cluster-landing-all.slugs) --state stardust/rollout/gate-state.json --width 1440 --origin-headless --skip-existing
   --recapture-eds --vh 700` (one run-bg job, `--timeout 3000`; add `--recapture-origin` only in a separate `--only
   en-solutions-intralogistics-automation` job), then 360 the same way. Override rule unchanged: a 360 row within 1 pt of
   the archetype's documented residual (18.56 %/+24, clip 0, content 0/0) gets an override entry (`verdict` field, slug named);
   everything else is reported FAIL honestly with its first hot band.
5. Append `### Cluster landing — fix round 2` to stardust/eds-conversion-log.md (measurements, error classes, changes, full
   row tables both widths). `foundation-freeze.mjs check`. Stop your processes by PID. Commit your paths. Do NOT edit
   stardust/rollout/progress.json (the main agent records both units).
Budget: ≈ 75 minutes and ≈ $25. Commit after step 3 and after each gate width. Report at the budget with the last tables.

## Report (under 25 lines) — verdict line first:
`cluster-landing-1: 1440 p/16 PASS (worst x%) / 360 q/16 (worst y%); cluster-landing-2: 1440 p/15 / 360 q/15; fix rounds
used r of 3; requests n`; then the error classes measured, what changed, the worst 5 rows per width, the content MISSING
cause and fix, anything unfinished.
