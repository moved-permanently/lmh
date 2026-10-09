<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-10-06T12:40:00Z
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/_computed-styles.json
    - stardust/current/assets/css/index_style_bundle_lmh.css
    - stardust/current/pages/en.json
  synthesizedInputs: []
  stardustVersion: 0.27.0
-->
---
name: Linde Material Handling
description: Red-on-white industrial B2B site — technical, safety-led, photographic.
colors:
  primary: "#aa0020"
  primary-hover: "#94001d"
  primary-deep: "#700016"
  dark-red: "#990e1f"
  toned-red: "#cc132a"
  carousel-red: "#ba1926"
  text-primary: "#222222"
  text-body: "#444444"
  text-secondary: "#4a595c"
  text-muted: "#6a6b6e"
  surface: "#eeeff3"
  surface-hover: "#f5f6fa"
  shade-grey: "#e6e7eb"
  border: "#cccdd1"
  grey-200: "#dcdcdf"
  form-grey: "#9b9b9e"
  white: "#ffffff"
  accent-green: "#77b340"
typography:
  display:
    fontFamily: "DaxWebPro-Medi, 'Dax Pro', 'Daxline Pro', Arial, sans-serif"
    fontSize: "54px"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "normal"
  headline:
    fontFamily: "DaxWebPro-Medi, 'Dax Pro', 'Daxline Pro', Arial, sans-serif"
    fontSize: "29.34px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "DaxWebPro-Medi, 'Dax Pro', 'Daxline Pro', Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "normal"
  subtitle:
    fontFamily: "DaxWebPro-Medi, 'Dax Pro', 'Daxline Pro', Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "DaxlineWebPro, 'Daxline Pro', Arial, sans-serif"
    fontSize: "17.1px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  body-mobile:
    fontFamily: "DaxlineWebPro, 'Daxline Pro', Arial, sans-serif"
    fontSize: "15.2px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "DaxlineWebPro-Bold, 'Daxline Pro', Arial, sans-serif"
    fontSize: "16.2px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  caption:
    fontFamily: "DaxlineWebPro, 'Daxline Pro', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  none: "0"
  pill: "100%"
  tile: "8.75px"
  lg: "40px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  section: "72px"
  xxl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.primary}"
  icon-button:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    size: "48px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: "24px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 16px"
  select:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    height: "48px"
  nav-link:
    textColor: "{colors.text-primary}"
    typography: "{typography.subtitle}"
  nav-link-hover:
    textColor: "{colors.primary}"
---

# Design System: Linde Material Handling

## Overview

**Creative North Star: "The Red Fleet in a White Hall"**

This is the captured current state of linde-mh.com/en, recorded descriptively for a same-design
migration. The site is a white, high-contrast industrial B2B surface: dark grey text on white,
one brand red used for the logo frame, primary buttons, links and the occasional full-bleed red
band, and a light cool grey (#eeeff3) for alternating section backgrounds and secondary buttons.
Photography does the emotional work — large 16:9 key visuals of red trucks in warehouses — while
the typographic voice stays plain and declarative in the Dax family.

Density is medium: generous 72 px section rhythm, 3- and 4-column teaser rows, cards without
borders or radii, and square-cornered controls. Depth is nearly flat; the only shadows are the
three small 1–2 px ambient shadows on raised elements (sticky sub-nav, cards on hover, dropdowns).

**Key Characteristics:**
- One accent (brand red), one neutral family (cool greys), white canvas.
- Square corners everywhere except circular icon buttons (100 %).
- Dax Pro / Daxline Pro throughout; medium face for headings, regular for body.
- Fixed CMS section layouts: 100 % headline rows, 33 % and 25 % teaser rows, teaser carousels.
- Sticky white header (100 px on desktop, 56 px on mobile) with a red "Location Overview" CTA.

## Colors

A single red accent against a white canvas with cool greys for text and surfaces.

### Primary
- **Linde Red** (#aa0020): logo frame, primary buttons, text links, hero kickers, active states,
  red select controls on forms, full-bleed red bands on campaign pages.
- **Linde Red Hover** (#94001d): hover state of every red button and link (`--color-primary-700`).
- **Linde Red Deep** (#700016): pressed / darkest red (`--color-primary-900`); rarely visible.

### Secondary
- **Carousel Red** (#ba1926): teaser-carousel accents and the 40 px-radius carousel controls.
- **Accent Green** (#77b340): declared token (`--color-green`) for success states; not measured on
  the captured pages.

### Neutral
- **Text Dark** (#222222): headings and body copy (`--color-darkgrey`, the `body` color).
- **Text Body** (#444444): secondary body copy (`--color-text-darkgrey`).
- **Text Grey** (#4a595c): captions, meta lines, footer copy; also a dark surface on the a11y strip.
- **Text Muted** (#6a6b6e): disabled / tertiary text.
- **Surface** (#eeeff3): alternating section backgrounds, secondary buttons, form backgrounds.
- **Surface Hover** (#f5f6fa): ghost-button hover fill.
- **Shade Grey** (#e6e7eb) and **Grey 200** (#dcdcdf): dividers and card separators.
- **Border** (#cccdd1): form field borders (`--color-form-lightgrey`).
- **White** (#ffffff): page canvas, header, footer, button text on red.

### Named Rules
**The One Red Rule.** Red is the only chromatic colour on any page; it marks action (buttons,
links) and brand (logo, kicker), never decoration. Large red fills are reserved for campaign bands.

## Typography

**Display Font:** DaxWebPro-Medi — FF Dax Pro Medium (with Arial, sans-serif)
**Body Font:** DaxlineWebPro — FF Daxline Pro Regular (with Arial, sans-serif)
**Label/Mono Font:** DaxlineWebPro-Bold for button labels; LindeGlobalIconFont for 40 UI glyphs.

**Character:** A humanist industrial sans with narrow, even letterforms; headings in the medium
Dax face read as calm and technical rather than loud. All weights are declared as separate
families (Medi, Bold, Italic, Light) rather than weight axes.

**Licensing note for the migration:** FF Daxline Pro / Dax Pro is a commercial web-font kit
served from the source origin. It is not rehosted on the new origin; the replica keeps the brand
family names first in every stack so a licensed drop-in wins, and ships a metric-compatible
substitute behind them (decision recorded in Phase 3).

### Hierarchy
- **Display / H1–H2** (400, 54px, 1.15): page titles and section headlines; 54 px on both h1 and
  h2 (h2 is the dominant section headline, 258 occurrences).
- **Headline / H3** (400, 29.34px, 1.2): teaser and card titles.
- **Title / H4–H5** (400, 27px, 1.25): sub-section titles; 24 px variant on card rows.
- **Subtitle** (400, 18–20px, 1.4): intro paragraphs and nav items.
- **Body** (400, 17.1px, 1.75): copy at 1440; 15.2 px at 360. Lines run to the column width, no
  measure cap beyond the layout columns.
- **Label** (700, 16.2px): button labels; 14.4 px on small buttons; 15.2 px on mobile.
- **Caption / H6** (400, 14px, 1.5): kickers such as "Trade Press", meta lines, footer links.

### Named Rules
**The Medium-Heading Rule.** Headings never use bold; hierarchy comes from size alone.

## Layout

Fluid canvas with capped content: the footer caps at 1600 px (`.footer { max-width: 1600px }`);
the measured content caps are recorded by the cap probe in DESIGN.json `extensions.breakpoints`.
Sections are stacked CMS rows — `layout-100-headline--fixed` (full-width headline + intro),
`layout-33--fixed layout--teaser` (3 cards), `layout-25--fixed layout--teaser` (4 tiles or cards),
`layout-teasercarousel__wrapper` (carousel) — separated by a 72 px rhythm. Campaign pages add a
sticky in-page sub-navigation under the header and alternate white / surface-grey bands. The header
is 100 px tall from 1024 px up and 56 px below, with a burger menu on mobile. At 360 px every
multi-column row stacks to one column and body type drops to 15.2 px.

## Elevation & Depth

Flat by default. Depth is conveyed by the surface-grey bands and by photography, not by shadows.

### Shadow Vocabulary
- **Ambient low** (`box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 6px 0px`): raised cards and dropdowns.
- **Ambient tight** (`box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px`): sticky sub-nav, chips.
- **Ambient dark** (`box-shadow: rgba(34, 34, 34, 0.2) 0px 2px 3px 0px`): icon buttons (share, slider arrows).

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; a shadow only marks a floating control.

## Shapes

Square. Cards, buttons, inputs and images have 0 radius. The only rounded shapes are circular icon
buttons (border-radius 100 %: share, slider arrows, burger), the 40 px carousel controls and a few
8.75 px tiles. Images are hard-cropped 16:9 or 4:3; no masks or clipping paths.

## Components

### Buttons
- **Shape:** square (0 radius), 48 px tall, bold 16.2 px label.
- **Primary:** Linde Red fill, white label, `padding 14px 24px`.
- **Hover / Focus:** fill darkens to #94001d; no motion.
- **Secondary:** surface-grey fill, dark text; hover inverts to red fill with white text.
- **Ghost:** transparent, dark text; hover to surface-hover fill with red text (`.btn:hover`).
- **Icon:** 48 px white circle with a LindeGlobalIconFont glyph and the dark ambient shadow.

### Cards / Containers
- **Corner Style:** 0.
- **Background:** white on grey bands, white on white rows (no border).
- **Shadow Strategy:** none at rest.
- **Border:** none; hairline dividers (#e6e7eb) between list rows.
- **Internal Padding:** 24 px; image 16:9 on top, h3 29.34 px, body, red text link.

### Inputs / Fields
- **Style:** white field, 1 px #cccdd1 border, 0 radius, 48 px tall; selects are red-filled with
  white text and a white chevron glyph.
- **Focus:** border darkens; no glow.
- **Error:** red (`--color-form-validation: red`) message text.

### Navigation
- **Style:** white sticky header; logo (150 px) left; four primary items (Products, Services,
  Solutions, About us) in 18 px dark text with red hover; red "Location Overview" button; a
  utility row with Search and Xtranet; mega-menu panels on hover/click.
- **Mobile:** 56 px bar, burger icon, full-screen menu.

### Teaser carousel (signature)
A full-bleed 16:9 hero carousel with a red kicker, 54 px white headline, red CTA and a dark strip
of tab labels beneath (one per slide), with circular arrow controls.

## Do's and Don'ts

### Do:
- **Do** keep red for action and brand only, white canvas, grey bands for rhythm.
- **Do** keep headings at weight 400 in the medium Dax face; hierarchy by size.
- **Do** keep 0-radius controls and cards; circles only for icon buttons.
- **Do** keep the 72 px section rhythm and the 3/4-column teaser rows.

### Don't:
- **Don't** introduce gradients, large shadows or rounded cards — none exist on the source.
- **Don't** rehost the licensed Dax web fonts on the new origin.
- **Don't** add colours beyond the captured palette; green is a declared token only.
