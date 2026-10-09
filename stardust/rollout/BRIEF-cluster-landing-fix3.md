# Addendum — landing fix ROUND 3 (the LAST of 3) over BOTH units `cluster-landing-1` (16) + `cluster-landing-2` (15), 31 pages.
# Read stardust/rollout/BRIEF-common.md, BRIEF-cluster.md, BRIEF-cluster-landing-fix.md (round 1) and
# BRIEF-cluster-landing-fix2.md (round 2) FIRST — the procedure below is round 2's with the round-3 facts; obey the hard rules.
# Job prefix `lfix3-`, port 8803. Slug list: stardust/rollout/units/cluster-landing-all.slugs (comma-joined, 31).
# run-bg: `export RUN_BG_SLOTS=3`, ONE job at a time from you; another agent (archetype-form, prefix aform-) shares the pool.

Round-2 result (encode redeployed --force, published regime, --origin-headless, --vh 700): 1440 **0/31 PASS**, 360 **0/31 PASS**,
content MISSING 0 on all 31 (round-2 accordion toggle title=# fixed the MISSING class). Movements 1440 r1→r2: logimat 42→26,
r-matic 45→25, in-sync 53→40; REGRESSIONS on pages with article/center/red bands and headline spacer rows (gse-expo 33→48.5,
gas-forklifts 36→40.6/−1383, tugger-trains 31→33.8/−933, energy-systems 34/−399). 360 worst: in-sync 48.5, retrofit 43.7/−504;
maintenance-repair 19.39/−8 (hot bands 67/37/36 %). Full row tables both widths: stardust/eds-conversion-log.md
`### Cluster landing — fix round 2` (read it by section: `node stardust/scripts/replica/section.mjs stardust/eds-conversion-log.md --list`,
then that one heading). Band breakdowns live in the gate dirs: stardust/replica/gates/all-1440/<slug>/pixel.json (`json-query.mjs … --path bands`).

Recorded first step of round 3 (from stardust/rollout/progress.json units.cluster-landing-1.gates.resume — do exactly this first):
1. measure.mjs at 1440, live vs the published build, ONE run-bg job per page set, `--all-matches`:
   - gse-expo, gas-forklifts, tugger-trains: live `.layout--red .text-container--center` (row, h3, p, .btn__link) vs build
     `.section.article.center.red > div` (div, h3, p, a.button) — rect, padding, margin, font-size, line-height;
   - h-models: live `.infobox-media` ×6 vs build `.infobox-wrapper:has(> .infobox.media)`; live `.media-browser` ×2 (wide) vs build.
   Then ONE crop of the diff at the first hot band per error class (`crop-compare.mjs stardust/replica/gates/all-1440/<slug>/origin.png
   …/eds.png --y <band> --height 500`) to name it. Expected: the centre-band box is ≈72 px too tall + ≈105 px of row margin; float
   and wide geometry wrong in hero.css / media-browser.css. Measure before you touch anything; fix the FIRST hot band top-down.
2. Fix in your blocks only (hero, columns under `.columns.flex|.carousel|.testimonial|.red:not(.band,.split,.feature)` and the
   article/center/red band, accordion, related-teasers facts, media-carousel, teaser-carousel, media-browser, infobox) and in
   stardust/rollout/encoders/landing.mjs (variant tokens, spacer/headline rows). `.columns.band|.split|.feature` and the program
   CTA override belong to the program template: never touch those hunks. The other agent running now edits only blocks/mwf-form,
   stardust/rollout/encoders/form.mjs and content/en/forms/*: `git pull --rebase` before every push, never revert a hunk you did not write.
3. Re-encode all 31 pages, sanitise, lint (BRIEF-common chain 3–8), commit + push code, sha-verify the code sync (`curl -s --compressed`),
   `deploy-batch --force` over BOTH paths files (stardust/rollout/units/cluster-landing-1.paths and -2.paths, same ledgers as rounds 1–2,
   `--concurrency 2`, publish, `--token-file "$ADOBE_IMS_TOKEN_FILE"`) through run-bg; verify `.plain.html` 200 and no `about:error`
   (re-drive a verify-fail once — a transient preview-time image fetch).
4. Gate: `node stardust/scripts/stardust/gate-state.mjs --host main--96d6da00--aemcoder.aem.page --preview` (NOTE: gate-state keeps only
   coverage rows whose delivery.status is deployed|verified; the 31 landing rows are `deployed` — check with json-query before the run;
   if any landing row reads `failed`, set it back with `node stardust/scripts/rollout/update-coverage.mjs <slug> --status deployed --url <preview url>`),
   then gate-all `--only $(cat stardust/rollout/units/cluster-landing-all.slugs) --state stardust/rollout/gate-state.json --width 1440
   --origin-headless --skip-existing --recapture-eds --vh 700 --timeout 3000` (ONE run-bg job), then 360 the same way. Override rule
   unchanged: a 360 row within 1 pt of the archetype's documented residual (18.56 %/+24, clip 0, content 0/0) gets an override entry
   (`verdict` field, slug named) in stardust/replica/gates/all-360/overrides.json; a 1440 row ≤ 10 % and |Δh| ≤ 5 % passes on its own;
   everything else is reported FAIL honestly with its first hot band. This is the LAST round: after it there is no further fix — the
   remaining residuals are recorded as the documented outcome of both units.
5. Append `### Cluster landing — fix round 3 (last)` to stardust/eds-conversion-log.md (measurements, error classes, changes, full row
   tables both widths, and a "Residuals after 3 rounds" paragraph naming the dominant error class per worst page). `node
   stardust/scripts/replica/foundation-freeze.mjs check` must print "foundation unchanged". Stop your processes by PID. Commit your paths
   (blocks you changed, encoder, content/en/**, ledgers, overrides.json, the log section). Do NOT edit stardust/rollout/progress.json,
   stardust/migrate/progress.json or state.json (the main agent records both units).
Budget: ≈ 75 minutes and ≈ $22. Commit after step 3 and after each gate width. At the budget, stop where you are, make sure what is
deployed is consistent (code pushed + pages re-driven), and report with the last tables you have.

## Report (under 25 lines) — verdict line first:
`cluster-landing-1: 1440 p/16 PASS (worst x%) / 360 q/16 (worst y%); cluster-landing-2: 1440 p/15 / 360 q/15; fix rounds used 3 of 3;
requests n`; then the error classes measured, what changed, the worst 5 rows per width, the residual classes, anything unfinished.
