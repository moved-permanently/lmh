<!-- stardust:provenance
  writtenBy: stardust:extract
  writtenAt: 2026-10-06T11:52:00Z
  readArtifacts:
    - https://www.linde-mh.com/en/
    - stardust/current/pages/en.json
    - stardust/current/pages/en-about-us-company.json
    - stardust/current/_prep-analysis.json
    - stardust/current/_crawl-log.json
  synthesizedInputs: []
  stardustVersion: 0.27.0
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Business buyers and operators of intralogistics equipment: fleet managers, warehouse and logistics
managers, purchasing departments and plant operators who evaluate, buy, hire or service forklift
trucks and warehouse equipment. Secondary audiences visible in the captured navigation: suppliers
(Suppliers, EDI, PPAP pages), the trade press (Press, Media, press-contact block on every news
article) and job candidates (Working at Linde). The footer states the site "is intended exclusively
for business customers."

## Product Purpose

The corporate web presence of Linde Material Handling (part of the KION Group): it presents the
product portfolio (counterbalanced trucks, warehouse trucks, automated trucks, approved used trucks,
hire), services (spare parts, maintenance, retrofit, safety services, training), solutions
(intralogistics automation, fleet management, energy systems, financing, consulting, warehouse
safety), campaign landing pages for new truck series, company and sustainability information,
press releases and a magazine, and the funnels around them: product finder, location finder,
rental enquiry and contact forms. Success means a qualified enquiry — a contact or rental form
submission, a product-finder session or a dealer-location lookup.

## Positioning

Captured claim set (verbatim from the home page): "Efficient forklift trucks are the backbone of
efficient intra-company logistics. Together with intelligent software and comprehensive service
packages, operators achieve lasting competitive advantages." The three pillars repeated across the
site are Productivity, Safety ("the central idea of Linde Material Handling's Zero Accident
Philosophy") and Ergonomics ("the best solutions arise when humans and technology work together in
perfect harmony"). The company page positions Linde as "one of the world's largest manufacturers
of forklifts and warehouse equipment", "the technology leader in the industry" with "innovations
such as the hydrostatic drive and highly effective assistance systems", over 120 years of company
history, and a rental fleet of "more than 60,000 trucks worldwide".

## Operating Context

Visitors arrive to compare truck series (model-range headings such as "H20 – H35", "E14 – E20",
"Xi10 – Xi20" recur across product pages), read campaign pages for new series, find a dealer or
service location, request a rental quote or submit a contact form, and read press releases.
Content is published through a CMS with fixed section layouts (full-width headline, 33 % and 25 %
teaser rows, teaser carousel), an iframe-free design except for embedded videos, and a
cookie-consent manager (CCM19) in front of tracking scripts.

## Capabilities and Constraints

- Captured pages: 99 of the 100 selected pages (one selected URL, /en/Product-Finder/, answers
  HTTP 404 on the source and is recorded as a crawl failure).
- Interactive surfaces observed: a site search (header), the product finder and location finder
  (same-site data endpoints on 11 pages), eight contact / campaign / rental forms posting to their
  own page URL, a share button on 86 pages, accordions and sticky in-page sub-navigation on campaign
  landing pages, embedded videos on some landing pages, a cookie-consent dialog.
- Terminology: "trucks" (never "lifts"), "intralogistics", model-range codes (H, E, X, Xi, Ri…),
  "Zero Accident Philosophy", "Linde Safety Guard", "myLinde" portal, "Xtranet" (dealer extranet).
- The English site is one locale root of a multi-locale site; only /en/ is in scope. 32 first-level
  targets linked from /en/ (and 1 from /en/EDI/) are outside the selected scope and were not captured.
- Undecided product facts: none recorded — this is a same-design migration; no product changes.

## Brand Commitments

- Name: Linde Material Handling (short form "Linde MH"), KION Group company. Logo captured at
  `stardust/current/assets/logo.svg` (Linde_MH_Logo_RGB.svg, red wordmark in a rounded red frame).
- Register: `brand` — marketing landing pages with hero imagery, benefit grids and CTAs dominate;
  no authentication is required for any captured page.
- Personality as observed: technical, confident, safety-led, plain declarative sentences, brand
  red on white with dark grey text, large industrial photography of red trucks in warehouses.
- Voice samples: hero "Agility on Point" / "The New Linde Reach Trucks Ri14 – Ri18"; CTAs "Learn
  more" (237×), "Find out more" (142×), "Find a Truck", "Rent a Truck", "Contact".
- Observed anti-references: no playful or consumer tone anywhere; no decorative illustration; no
  gradients or heavy shadows in the captured style.
- Typography is a licensed commercial family (FF Daxline Pro / Dax Pro web fonts) with Noto Sans
  and Outfit also declared; see DESIGN.md for the migration font policy.

## Evidence on Hand

- `stardust/current/pages/<slug>.json` + `.html` — 99 live Playwright renders with content, CTAs,
  media inventory, dynamic-surface signals.
- `stardust/current/assets/screenshots/<slug>.png` — 99 full-page captures at 1440 px.
- `stardust/current/assets/logo.svg`, `assets/favicon.jpg`, `assets/fonts/*.woff2` (5 files),
  `assets/css/*.css` (the three production stylesheets).
- `stardust/current/_computed-styles.json` — computed-style census at 1440 and 360.
- `stardust/current/_prep-analysis.json` — cross-page repeats (headings, CTAs, forms, alt text).
- `stardust/current/_crawl-log.json` — discovery, consent method, failures, capture gaps, dynamic
  surface roll-up.
- Absent, must not be fabricated: testimonials beyond the captured "Testimonials" sections, press
  releases not in the selected 18 news-detail pages, product data behind the product finder.

## Product Principles

1. Safety first — every product and solution is framed by the Zero Accident Philosophy.
2. Performance proven by engineering — claims are backed by named innovations and model data.
3. Human-centred ergonomics — people and technology "in perfect harmony".
4. One portfolio, one service promise — trucks, software, service and financing as a system.
5. Business-to-business clarity — no consumer flourish; facts, ranges, contacts.

## Accessibility & Inclusion

Observed: an accessibility note in the footer, 12 % of images carry empty alt text, no
content-free link labels detected. No product-specific requirement beyond the captured state was
established; the replica keeps the captured behaviour.
