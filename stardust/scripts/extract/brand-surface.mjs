#!/usr/bin/env node
// brand-surface.mjs — assembles stardust/current/_brand-extraction.json from the census aggregate,
// the cross-page analysis, the page records and the module draft (extract Phase 3). Values cite sources.
import fs from 'node:fs';
const rd = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const census = rd('stardust/current/_computed-styles.json'); const prep = rd('stardust/current/_prep-analysis.json'); const mods = rd('stardust/current/_modules-draft.json'); const state = rd('stardust/state.json'); const log = rd('stardust/current/_crawl-log.json');
const home = rd('stardust/current/pages/en.json'); const company = rd('stardust/current/pages/en-about-us-company.json');
const agg = census.aggregate; const now = new Date().toISOString();
const NAV = /^(Products|Services|Solutions|About us) /;
const prose = (r) => (r.body || []).filter((s) => s.length > 80 && !NAV.test(s));
const roleMap = { '#aa0020': ['primary', ['background', 'text', 'border']], '#222222': ['text-primary', ['text']], '#4a595c': ['text-secondary', ['text', 'background']], '#eeeff3': ['surface', ['background', 'border']], '#ffffff': ['background', ['background', 'text']], '#cccdd1': ['border', ['border']], '#444444': ['text-body', ['text']], '#6a6b6e': ['text-muted', ['text']], '#ba1926': ['accent-carousel', ['background']] };
const palette = agg.colors.map((c) => ({ value: c.hex, role: roleMap[c.hex]?.[0] || 'accent', occurrences: c.weight, usedAs: roleMap[c.hex]?.[1] || (c.bgArea ? ['background'] : ['text']), censusRoles: c.roles, sources: (c.sources || []).slice(0, 3).map((s) => ({ page: s.url, selector: s.selector, prop: s.prop })) }));
palette.push({ value: '#94001d', role: 'primary-hover', occurrences: agg.hover.filter((h) => JSON.stringify(h.to).includes('148, 0, 29')).reduce((a, h) => a + h.count, 0), usedAs: ['background', 'text'], sources: [{ page: 'census aggregate.hover', selector: 'a, .btn', prop: 'hover color/background' }, { page: 'customProps --color-primary-700', selector: ':root', prop: '--color-primary-700' }] });
palette.push({ value: '#f5f6fa', role: 'surface-hover', occurrences: 196, usedAs: ['background'], sources: [{ page: 'census aggregate.hover', selector: '.btn', prop: 'hover background' }, { page: 'customProps', selector: ':root', prop: '--color-hover-lightgrey' }] });
palette.push({ value: '#77b340', role: 'accent-green', occurrences: 0, usedAs: ['background'], sources: [{ page: 'customProps', selector: ':root', prop: '--color-green' }], note: 'declared token, not measured on the captured pages' });
const sizes = agg.type.sizes.map((s) => ({ px: s.px, count: s.count, headings: s.headings, text: s.text, buttons: s.buttons, weight: s.px >= 24 ? 400 : 400, lineHeight: s.px >= 24 ? 1.2 : 1.75 }));
const ratioSet = new Set(); const sorted = [...new Set(sizes.filter((s) => s.count >= 20).map((s) => s.px))].sort((a, b) => b - a); for (let i = 1; i < sorted.length; i++) ratioSet.add((sorted[i - 1] / sorted[i]).toFixed(2));
const brand = {
  _provenance: { writtenBy: 'stardust:extract', writtenAt: now, readArtifacts: ['stardust/current/_computed-styles.json', 'stardust/current/_prep-analysis.json', 'stardust/current/_modules-draft.json', 'stardust/current/pages/en.json', 'stardust/current/pages/en-about-us-company.json', 'stardust/current/assets/css/index_style_bundle_lmh.css'], synthesizedInputs: [], stardustVersion: '0.27.0', notes: ['palette, type and motifs aggregated across all 98 censused pages at 1440 and 360', 'home-only fields: logo, voice samples, register'] },
  site: { name: 'Linde Material Handling', tagline: home.description, originUrl: 'https://www.linde-mh.com/en/' },
  origins: [{ url: 'https://www.linde-mh.com', role: 'primary', pages: state.pages.length }],
  logo: { source: 'img-logo-class', sourceSelector: '.navigation_logo a.logo_link img', url: 'https://www.linde-mh.com/en/layoutmedia/Linde_MH_Logo_RGB.svg', path: 'stardust/current/assets/logo.svg', format: 'svg', renderedWidth: 150, variants: ['primary (red on white)'], variantsNotCaptured: ['inverted / monochrome (none observed in the capture)'], note: 'census logo chain reported none (no header landmark); captured from the rendered DOM' },
  favicon: { url: log.favicon?.url, path: 'stardust/current/' + (log.favicon?.file || 'assets/favicon.jpg') },
  palette,
  type: {
    headingFamily: 'DaxWebPro-Medi', bodyFamily: 'DaxlineWebPro', italicFamily: 'DaxlineWebPro-Italic', boldFamily: 'DaxlineWebPro-Bold',
    stack: { heading: '"DaxWebPro-Medi", "Dax Pro", "Daxline Pro", Arial, sans-serif', body: '"DaxlineWebPro", "Daxline Pro", Arial, sans-serif' },
    families: agg.type.families, sizes, weights: agg.type.weights, levels: agg.type.levels,
    bodySize: { px: 17.1, lineHeight: 1.75, note: 'p { line-height: 1.75 } in index_style_bundle_lmh.css; 15.2 px at 360' },
    files: fs.readdirSync('stardust/current/assets/fonts').filter((f) => f.endsWith('.woff2')).map((f) => ({ file: 'stardust/current/assets/fonts/' + f, family: f.startsWith('Noto') ? 'NotoSans-Variable' : f.includes('bolditalic') ? 'DaxlineWebPro-BoldItalic' : f.includes('bold') ? 'DaxlineWebPro-Bold' : f.includes('italic') ? 'DaxlineWebPro-Italic' : 'DaxlineWebPro', licensing: f.startsWith('Noto') ? 'open (OFL)' : 'commercial (FF Daxline Pro, FontFont/Monotype) — do not rehost' })),
    declaredNotCaptured: ['DaxWebPro-Medi', 'DaxWebPro-Light', 'Outfit-*'],
    scaleAudit: { kind: 'ad-hoc', ratios: [...ratioSet], basis: 'heading sizes 54 / 29.34 / 27 / 24 / 20 / 18 / 16 / 14 — no consistent ratio; many values are 0.9× of a round size' },
  },
  spacing: { baseUnit: 8, scale: [8, 16, 24, 32, 48, 72, 96], sources: [{ page: 'index_style_bundle_lmh.css', selector: '.footer', prop: 'margin: 72px auto 0; padding: 2.5vw 0 1vw' }, { page: 'index_style_bundle_lmh.css', selector: '.navigation', prop: 'height 56px (mobile) / 100px (≥1024)' }] },
  motifs: { borderRadius: { mode: agg.motifs.radius.mode, occurrences: agg.motifs.radius.values.map((v) => ({ value: v.value, count: v.count })), note: '100% = circular icon buttons; cards and buttons are square-cornered (0)' }, shadows: agg.motifs.shadows.map((s) => ({ value: s.value, count: s.count })), gradients: agg.motifs.gradients.map((g) => ({ value: g.value, count: g.count })), patterns: ['hero-with-image', 'card', 'icon-tile', 'accordion', 'sticky-subnav', 'teaser-carousel', 'share-button'] },
  componentStyle: { buttonPrimary: { background: '#aa0020', color: '#ffffff', hoverBackground: '#94001d', radius: '0', weight: 700, sizePx: 16.2, sources: ['census aggregate.hover[5]', 'customProps --color-red / --color-primary-700'] }, buttonSecondary: { background: '#eeeff3', color: '#222222', hoverBackground: '#94001d', hoverColor: '#ffffff', sources: ['census aggregate.hover[4]'] }, buttonGhost: { background: 'transparent', hoverBackground: '#f5f6fa', hoverColor: '#aa0020', sources: ['.btn:hover in index_style_bundle_lmh.css', 'census aggregate.hover[1]'] }, link: { color: '#aa0020', hoverColor: '#94001d', bodyLinkColor: '#222222', bodyLinkHover: '#aa0020', sources: ['census aggregate.hover[0]', 'census aggregate.hover[3]'] } },
  hover: agg.hover,
  systemComponents: [
    { kind: 'header', name: 'site-header', occurrences: state.pages.length, headingSequence: [], ctaLabels: ['Search', 'Xtranet', 'Products', 'Services', 'Solutions', 'About us', 'Location Overview'], selector: '.header .navigation' },
    { kind: 'footer', name: 'site-footer', occurrences: state.pages.length, headingSequence: ['Follow us on'], ctaLabels: ['Contact', 'Home', 'Legal', 'Terms of use', 'Suppliers', 'EDI', 'Privacy Statements', 'Cookie Settings', 'Vulnerability Disclosure Policy'], selector: '.footer' },
    { kind: 'strip', name: 'a11y-note', occurrences: state.pages.length, headingSequence: [], ctaLabels: [], selector: '.footer-a11y-note', text: 'This website is intended exclusively for business customers.' },
    { kind: 'cross-promo', name: 'related-teasers', occurrences: 34, headingSequence: ['This may also interest you'], ctaLabels: ['Learn more', 'Find out more'] },
    { kind: 'widget', name: 'share-button', occurrences: 86, headingSequence: [], ctaLabels: ['Share'], selector: '.share-btn' },
    { kind: 'strip', name: 'press-contact', occurrences: 18, headingSequence: ['Trade Press', 'Heike Oder'], ctaLabels: ['+49 6021 991277', 'Send email'] },
  ],
  iconFont: { family: agg.iconFont.families[0], file: fs.existsSync('stardust/current/assets/fonts/LindeGlobalIconFont.woff2') ? 'stardust/current/assets/fonts/LindeGlobalIconFont.woff2' : null, glyphs: agg.iconFont.glyphs.map((g) => ({ class: g.class, codepoint: g.codepoint, count: g.count })) },
  voice: { heroHeadline: 'Agility on Point', heroKicker: 'The New Linde Reach Trucks Ri14 – Ri18', heroCta: 'Find out more', heroImage: home.og?.image || null, heroMedium: { kind: 'image-carousel', note: 'hero is a rotating teaser carousel of still key visuals (no video)' }, firstParagraph: prose(home)[0], companyParagraph: prose(company)[0], ctaSamples: ['Learn more', 'Find out more', 'Find a Truck'], toneGuess: 'technical-confident', linkList: ['Products', 'Services', 'Solutions', 'About us'] },
  voiceTable: { ctaFrequency: prep.repeatedCtas.filter((c) => !/^\d+$/.test(c.key)).slice(0, 20).map((c) => ({ label: c.key, count: c.occurrences, pages: c.pages })), headingFrequency: prep.repeatedHeadings.map((h) => ({ text: h.key.split('|')[1], level: h.key.split('|')[0], pages: h.pages })), headingsUppercasePercent: 0, distinctHeadings: prep.repeatedHeadings.length, distinctCtaLabels: prep.repeatedCtas.length },
  crossPromo: { detected: true, anchorHeading: 'This may also interest you', pages: 34, clusterHeadings: ['Learn more', 'Find out more'] },
  register: 'brand',
  tensions: [],
};
// mechanical detectors (brand-review-template.md § Detector rules)
const T = brand.tensions;
if (brand.type.scaleAudit.kind === 'ad-hoc') T.push({ id: 'T-scale', text: `Type scale is ad-hoc (${sorted.join(' → ')}, no consistent ratio). Direct will need to decide whether the target adopts a modular scale.` });
const small = brand.motifs.borderRadius.occurrences.filter((r) => /px$/.test(r.value) && parseFloat(r.value) < 16 && r.count >= 10); if (small.length > 2) T.push({ id: 'T-radius-vocab', text: `Radius vocabulary is fragmented: ${small.map((r) => `${r.value} ×${r.count}`).join(', ')}.` });
const seeMore = prep.repeatedCtas.filter((c) => /^(learn more|find out more|read more|more details|discover more|see more)$/i.test(c.key)); if (seeMore.length >= 2) T.push({ id: 'T-cta-vocab', text: `CTA voice is fragmented: ${seeMore.map((c) => `"${c.key}" ×${c.occurrences}`).join(', ')}. Direct will need to pick a canonical voice for see-more / read-more / learn-more affordances.` });
if (prep.contentFreeLinks.length) T.push({ id: 'T-link-content-free', text: `Content-free link labels found: ${prep.contentFreeLinks.map((l) => `"${l.key}" ×${l.occurrences}`).join(', ')}.` });
T.push({ id: 'T-logo-variants', text: 'Only one logo variant captured (.navigation_logo img, Linde_MH_Logo_RGB.svg). The redesign will need a monochrome / inverted / SVG variant set; direct should plan that.' });
for (const c of palette) if (!['#000000', '#ffffff', '#222222'].includes(c.value) && !/^text-/.test(c.role) && c.usedAs.length === 1 && c.occurrences > 0) T.push({ id: 'T-color-imbalance', text: `Color ${c.value} (${c.role}) appears as ${c.usedAs[0]} only — never as ${c.usedAs[0] === 'text' ? 'background' : 'text'}. Direct will need to decide: drop, expand, or keep as accent.` });
if (prep.genericAlt.length) T.push({ id: 'T-img-alt-generic', text: `Generic alt text found: ${prep.genericAlt.reduce((a, g) => a + g.occurrences, 0)} image(s) carry a stock placeholder alt (${prep.genericAlt.map((g) => `"${g.key}"`).join(', ')}).` });
if (prep.images.emptyAltShare >= 0.3) T.push({ id: 'T-img-alt-empty', text: `${Math.round(prep.images.emptyAltShare * 100)}% of images carry empty alt text.` });
fs.writeFileSync('stardust/current/_brand-extraction.json', JSON.stringify(brand, null, 2) + '\n');
console.log(`brand-extraction: ${palette.length} colors · ${sizes.length} sizes · ${brand.systemComponents.length} system components · ${T.length} tensions (${T.map((t) => t.id).join(', ')})`);
