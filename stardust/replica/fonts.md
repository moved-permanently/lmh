# Fonts — linde-mh.com/en replica

## Captured faces (evidence only — never shipped)
`stardust/current/assets/fonts/_font-faces.txt`: the site maps weights to *family names*, not `font-weight` —
`DaxlineWebPro` (400, daxlinewebpro_1.woff2), `DaxlineWebPro-Bold` (700, _bold_1), `DaxWebPro-Medi` (600 declared, same bold file; computed weight on headings is 400), `DaxWebPro-Light` (200, regular file), italics.
FF Daxline Pro is a licensed commercial kit (FontFont/Monotype) → the woff2 files are not rehosted. `<b>` and article `<a>` render as synthetic bold (computed 700 on a 400-only family) — mirrored, not "fixed".
Self-hostable as captured (copied to `stardust/prototypes/fonts/`): `NotoSans-Variable.woff2` (SIL OFL), `LindeGlobalIconFont.woff2` (site icon font, glyph codepoints lifted from the computed-style census).

## Width probe (Playwright, local files; `stardust/.work/replica/font-probe.mjs` → `font-probe.json`)
Sample heading "General Privacy Statement" at 54px bold, the page's intro paragraph at 17.1px regular, a nav/footer label string at 17.1px. Δ% = candidate ÷ captured Daxline − 1.

| family | h54 bold w (Δ%) | p17.1 w (Δ%) | nav17.1 w (Δ%) | x-height@100 | cap-height@100 | normal line box 54/17 |
|---|---|---|---|---|---|---|
| **DaxlineWebPro (captured)** | 650 | 2049 | 913 | 54 | 73 | 54/17 |
| **Nunito Sans** | 671 (+3.2%) | 2055 (+0.3%) | 939 (+2.8%) | 49 | 71 | 74/23 |
| Hind | 648 (−0.3%) | 1942 (−5.2%) | 881 (−3.5%) | 51 | 67 | 86/27 |
| PT Sans | 607 (−6.6%) | 1972 (−3.8%) | 884 (−3.2%) | 50 | 70 | 70/22 |
| Fira Sans Condensed | 591 (−9.1%) | 1861 (−9.2%) | 835 (−8.5%) | 53 | 69 | 64/21 |
| Encode Sans Semi Condensed | 642 (−1.2%) | 1889 (−7.8%) | 848 (−7.1%) | 54 | 74 | 68/22 |
| Catamaran | 629 (−3.2%) | 1874 (−8.5%) | 860 (−5.8%) | 50 | 69 | 88/28 |

## Decision
**Nunito Sans** (Google Fonts, SIL OFL; `NunitoSans-400.woff2` / `NunitoSans-700.woff2` — the API served the same variable file for both weights). Body copy — the dominant text on every template — matches within 0.3%; bold headings run +3.2% wide, nav labels +2.8%. Every other candidate is 3–9% narrow on body copy, which re-wraps long legal paragraphs by whole lines.
Daxline's `normal` line box is exactly 1.0em (54/54); Nunito's is 1.37em, so the `@font-face` carries `ascent-override: 80%; descent-override: 20%; line-gap-override: 0%` to keep `line-height: normal` boxes (nav items, buttons) at the lifted heights.

Stacks (brand family first so a licensed drop-in wins without a code change):
- regular: `font-family: "DaxlineWebPro", "NunitoSans", Arial, sans-serif`
- bold/medium families: `"DaxlineWebPro-Bold"|"DaxWebPro-Medi", "NunitoSans-Bold", Arial, sans-serif` — `NunitoSans-Bold` is an alias face pointing at the 700 file, so the live pattern (bold family at computed weight 400) is reproduced.

## Permanent residual
The content-diff width probe forks on every heading (+3.2%) and on nav/footer labels (+2.8%); body wraps may differ by one line per few paragraphs. Recorded per archetype in progress.json as a justified 🟠 font fork (cause: licensed kit substituted).

## Table 2 — per-size width ratio (local probe `stardust/.work/replica/font-ratio.mjs`, 335-char sentence, captured .woff == .woff2 metrics)
Daxline's advances snap narrower at some sizes in Chromium, so the excess is size-dependent. Δ% = Nunito ÷ Daxline − 1; `ls` = letter-spacing that equalises the average advance.

| size | regular Δ% | ls (em) | bold Δ% | ls bold (em) | where it renders |
|---|---|---|---|---|---|
| 14px | −0.09% | 0 | +3.94% | −0.0181 | footer links, copyright, "Follow us on" |
| 15.2px | +4.22% | −0.0187 | +1.04% | −0.0049 | body p / li at 360 |
| 17.1px | +0.53% | −0.0024 | +3.35% | −0.0155 | body p / li / nav at 1440 |
| 18px | +2.96% | −0.0134 | +5.89% | −0.0270 | intro p at 360, a11y note |
| 20.25px | +3.94% | −0.0175 | +6.92% | −0.0310 | intro p at 1440 |
| 24px | +1.45% | −0.0066 | +1.59% | −0.0075 | h2 at 360 |
| 54px | +1.52% | −0.0069 | +3.51% | −0.0163 | h2 at 1440 |

## Calibration applied (richtext + headline text only; chrome text stays `letter-spacing: normal` for chrome-parity, except the fixed label "Follow us on" at −0.02em which otherwise wraps the 5-icon row at 360)
- ≥640px: `.dom-content` −0.003em (empirical: the table value −0.0024em left 2 paragraphs a line long; −0.003em converged to Δy 0 at 1440), `.dom-content a` −0.016em, `.layout-100-headline--flex h2` −0.016em.
- <640px: `.dom-content` −0.017em (table −0.0187em over-corrected 4 paragraphs; −0.017em nets −13px), `p.intro` −0.0134em, `a` −0.0049em, `h2` −0.0075em.
- `@font-face` `ascent-override: 74%; descent-override: 26%` on both Nunito faces: keeps `line-height: normal` boxes at Daxline's 1.0em and makes link-bearing paragraphs (icon-font `::after` glyph) match live line boxes (80/20 left them 1px short).

## Residual floor (recorded in progress.json per breakpoint)
1440: Δh 0 — 1 body paragraph a line short, 1 intro a line long; headline 2 re-breaks (same 3 lines). 360: Δh +13 — 3 link-bearing paragraphs a line long, 4 body + 1 intro a line short; right-aligned footer rows shift 1–4px. A licensed Daxline drop-in (first family in every stack) removes all of it without a code change.

## Bold width match (2026-10-08, handoff gap unit gap-teaser-cards)
`styles/fonts.css` NunitoSans-Bold carries `size-adjust: 97%`: the probe above measured the bold/medium substitute +3.2 % / +2.8 % wider than the captured Daxline faces, and the published-origin gates showed the consequence as one-line wrap forks on bold strings only (events 360: 4 of 12 date bands wrapped on the build, none on the source; compact-class 360: three accordion headlines). The regular face (+0.3 %) is left as is. The brand family stays first in every stack; a licensed drop-in still wins.
