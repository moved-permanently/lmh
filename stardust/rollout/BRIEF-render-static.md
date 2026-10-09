# Unit brief — migrate `render-static` (6 siblings of the static template), then (on a later message) the
# rollout `cluster-static` unit. Read stardust/rollout/BRIEF-common.md FIRST and obey it.

Template: static (archetype `en-legal-notes-privacy-statement`, live
https://www.linde-mh.com/en/Legal-Notes/Privacy-Statement/, prototype
stardust/prototypes/en-legal-notes-privacy-statement-proposed.html + .css, served at
http://localhost:8791/en-legal-notes-privacy-statement-proposed.html; migrated archetype
stardust/migrated/en/Legal-Notes/Privacy-Statement/{index.html,_meta.json}; delivered document
content/en/legal-notes/privacy-statement.html — live and gated: 1440 5.11 % PASS, 360 10.49 % documented
override). Its blocks: `breadcrumb` (deployed) + default content (anchor-nav section with
`section-metadata Style=anchor-nav`, red headline sections `Style=red`, `Style=intro`, richtext).

Siblings (slug → live URL → folded delivery path), all typed `static` in stardust/state.json:
- en-edi → https://www.linde-mh.com/en/EDI/ → /en/edi
- en-landingpage-semi-automated-order-pickers → https://www.linde-mh.com/en/Landingpage/Semi-automated-order-pickers/ → /en/landingpage/semi-automated-order-pickers
- en-legal-notes-cookie-policy → https://www.linde-mh.com/en/Legal-Notes/Cookie-Policy/ → /en/legal-notes/cookie-policy
- en-legal-notes-legal → https://www.linde-mh.com/en/Legal-Notes/Legal/ → /en/legal-notes/legal
- en-legal-notes-ppap → https://www.linde-mh.com/en/Legal-Notes/PPAP/ → /en/legal-notes/ppap
- en-legal-notes-terms-of-use → https://www.linde-mh.com/en/Legal-Notes/Terms-of-use/ → /en/legal-notes/terms-of-use
Captures (the reference, never a fresh live hit for content): stardust/current/pages/<slug>.{html,json}.

## Method — sibling tier (handoff contract § 1; read it once:
`node stardust/scripts/replica/section.mjs /home/node/adobe-skills/plugins/stardust/skills/replica/reference/handoff-contract.md "1. Migrate"`)
1. Variance probe is DONE: stardust/rollout/units/variance-static.json — 0 computed-style deltas on all 6;
   `probesVarying: anchor, headline, text` = presence/count differences only (pages without an anchor
   nav, different section counts). Budget: content-driven sections, no block fork; a page lacking the
   anchor nav simply has no anchor-nav section. Record `variance-probe` on each sidecar with that evidence.
2. Structural clone = the archetype's generator generalised. `stardust/.work/replica/gen-static.mjs`
   (121 lines) re-authors the static page from the capture as clean semantic HTML (never a DOM copy); it is
   hard-coded to the archetype slug and ALSO rewrites canon-chrome.html (do not touch that part). Write
   `stardust/.work/replica/gen-static-sibling.mjs <slug>` (ESM, `--help`): same conversion rules for the
   MAIN content only (anchor nav when present, headline bands, richtext verbatim, links absolutised the
   same way), canon chrome imported exactly as the archetype prototype does (same `<link>`/`<script>`
   lines, same `<main id="pjax-container" class="content">` shell, same page CSS reference
   `en-legal-notes-privacy-statement.css` — a sibling never gets its own CSS file; a real composition the
   template cannot express → declare `modules` on the sidecar and name it in your report). Output:
   `stardust/prototypes/siblings/<slug>.html` (also served by :8791 under /siblings/). Inspect each
   capture first (`html-slice.mjs stardust/current/pages/<slug>.html "#pjax-container" --all` is large —
   prefer `… ".navigation-anchor-navigation" --text`, `… "h1,h2,h3" --all --text`, and json-query on the
   capture's sections) and note anything not richtext (images, teasers, accordions, tables) — render it
   verbatim as default content (`<picture>`/`<img>` with the captured src + alt, tables as tables).
3. Driver: `node stardust/scripts/stardust/state.mjs advance <6 slugs> --to directed` (migrate's A′
   branch needs `directed`), then `node stardust/scripts/migrate/migrate.mjs render <6 slugs>
   --archetype <slug>=en-legal-notes-privacy-statement … --source <slug>=stardust/prototypes/siblings/
   <slug>.html …` (one --archetype and one --source per slug). It writes stardust/migrated/<URL-literal
   path>/index.html + _meta.json (fidelityTier sibling, template = archetype slug). A `refused` line
   names the strict rule — fix the source and re-run. Then per slug: `migrate.mjs modules <slug>
   breadcrumb` (plus any real module), `migrate.mjs variant <slug> <class>` where you used one.
4. Content-count acceptance per page: serve the project root on :8801 (BRIEF-common) and run through
   run-bg `node stardust/scripts/diff/content-diff.mjs http://localhost:8801/stardust/current/pages/
   <slug>.html http://localhost:8801/stardust/migrated/<path>/index.html --profile generic --main
   "#pjax-container"` (the capture is a settled DOM: expect its chrome to differ in technique — only the
   MAIN root findings count here; chrome parity was gated on the archetype). 0 structural 🔴 on main, or
   a logged `migrate.mjs deviation` per justified drop (tracking tags, consent, chat, empty sections).
   Record `migrate.mjs gate <slug> content-count --evidence "<summary line>"` and
   `migrate.mjs gate <slug> content-fidelity --evidence "verbatim from capture; deviations: n"`.
5. Delivery lint early (cheap, catches the folded path and `.html`/trailing-slash rules before the
   cluster): `node stardust/scripts/rollout/delivery-lint.mjs --file stardust/migrated/<path>/index.html
   --path /<folded path>` — note P0/P1 counts in the report (the cluster unit fixes them in the
   delivered document, not in the migrated HTML).
6. Stop your server by PID. Do NOT deploy anything in this unit and do NOT run gate-all: the cluster unit
   follows on a separate message from the main agent.

## Report (under 25 lines)
First line verbatim from the driver: `rendered N, unchanged N, refused N, passthrough N`; then per slug:
`slug | path | sections n | anchor-nav yes/no | content-count 🔴 n / deviations n | lint P0/P1 n/n |
modules`. Then: generator file, anything a sibling needs that the template cannot express.
