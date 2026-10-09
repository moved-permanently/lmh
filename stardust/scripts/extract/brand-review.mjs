#!/usr/bin/env node
// brand-review.mjs — renders stardust/current/brand-review.html from the extraction artifacts (extract Phase 5).
import fs from 'node:fs';
const rd = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const brand = rd('stardust/current/_brand-extraction.json'); const log = rd('stardust/current/_crawl-log.json'); const state = rd('stardust/state.json'); const design = rd('stardust/current/DESIGN.json');
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pages = state.pages;
const wait = pages.map((p) => rd(p.currentStatePath)._provenance); const avgWait = Math.round(wait.reduce((a, w) => a + (w.waitMs || 0), 0) / wait.length);
const primary = brand.palette.find((c) => c.role === 'primary')?.value || '#aa0020';
const dark = brand.palette.find((c) => c.role === 'text-primary')?.value || '#222';
const bodyFont = brand.type.bodyFamily; const headFont = brand.type.headingFamily;
const sections = [];
const sec = (id, title, body) => sections.push({ id, title, body });
sec('masthead', brand.site.name, `<p class="hero-line">${esc(brand.voice.heroHeadline)}</p><p>${esc(brand.site.tagline)}</p><p><a href="${esc(brand.site.originUrl)}">${esc(brand.site.originUrl)}</a></p>`);
sec('coverage', 'Coverage', `<div class="stats"><div><b>${pages.length}</b> pages extracted</div><div><b>${wait[0]?.waitMode}</b> wait · avg ${avgWait} ms</div><div><b>${brand.palette.length}</b> colors · <b>${brand.type.sizes.length}</b> type sizes · <b>${brand.systemComponents.length}</b> system components</div></div>${(log.crawl?.failures || []).length ? `<p class="accent">Failures: ${log.crawl.failures.map((f) => `${esc(f.slug)} (${esc(f.errorClass)})`).join(', ')}</p>` : ''}<p>Capture gaps: ${esc(log.captureGaps?.detail || 'none')}</p>`);
sec('pages', 'Pages', `<div class="grid">${pages.map((p) => `<figure><img loading="lazy" src="assets/screenshots/${p.slug}.png" alt=""><figcaption>${esc(p.title)}<br><code>${esc(new URL(p.url).pathname)}</code> · ${p.type}</figcaption></figure>`).join('')}</div>`);
sec('palette', 'Color palette', `<div class="swatches">${brand.palette.map((c) => `<div class="swatch"><span style="background:${c.value}"></span><b>${esc(c.value)}</b> ${esc(c.role)}<br><small>${c.occurrences} · ${(c.usedAs || []).join('/')}<br>${(c.sources || []).slice(0, 3).map((s) => esc(s.page || s)).join(', ')}</small></div>`).join('')}</div>`);
sec('type', 'Typography', `<p>Heading: <b>${esc(headFont)}</b> · Body: <b>${esc(bodyFont)}</b> · <span class="badge">${brand.type.scaleAudit.kind === 'modular' ? `modular ${esc(brand.type.scaleAudit.name || '')}` : 'No modular scale'}</span></p>${brand.type.sizes.map((s) => `<p style="font-size:${s.px}px;font-weight:${s.weight};line-height:${s.lineHeight};margin:.2em 0">${s.px}px / ${s.weight} / ${s.lineHeight} — ${esc(s.sample || brand.voice.heroHeadline)}</p>`).join('')}<p class="specimen">${esc(brand.voice.firstParagraph)}</p>`);
sec('voice', `Voice <span class="badge">${esc(brand.voice.toneGuess)}</span>`, `<div class="cards"><div><h4>Hero headline</h4>${esc(brand.voice.heroHeadline)}</div><div><h4>Tagline</h4>${esc(brand.site.tagline)}</div><div><h4>First paragraph</h4>${esc(brand.voice.firstParagraph)}</div></div><h4>CTA frequency</h4><p>${brand.voiceTable.ctaFrequency.slice(0, 8).map((c) => `<span class="pill">${esc(c.label)} ×${c.count}</span>`).join(' ')}</p><h4>Repeated headings (≥3 pages)</h4><ul class="two">${brand.voiceTable.headingFrequency.filter((h) => h.pages >= 3).map((h) => `<li>${esc(h.text)} <small>(${h.pages})</small></li>`).join('')}</ul><div class="stats"><div><b>${brand.voiceTable.headingsUppercasePercent}%</b> uppercase headings</div><div><b>${brand.voiceTable.distinctHeadings}</b> distinct headings</div><div><b>${brand.voiceTable.distinctCtaLabels}</b> distinct CTA labels</div></div>`);
if (brand.tensions?.length) sec('tensions', 'Tensions', `<div class="cards">${brand.tensions.map((t) => `<div><h4>${esc(t.id)}</h4>${esc(t.text)}</div>`).join('')}</div>`);
sec('motifs', 'Motifs', `<div class="cards">${(brand.motifs.borderRadius.occurrences || []).map((r) => `<div><div class="demo" style="border-radius:${r.value}"></div>${esc(r.value)} <small>×${r.count}</small></div>`).join('')}${(brand.motifs.shadows || []).map((s) => `<div><div class="demo" style="box-shadow:${s.value};background:#fff"></div><small>${esc(s.value)}</small></div>`).join('')}</div>`);
sec('components', 'Components', `<ul class="list">${(design.extensions.modules || []).map((m) => `<li><b>${esc(m.name)}</b> — ${esc(m.instances)} <small>${esc((m.signals || []).join('; '))}</small></li>`).join('')}</ul>`);
sec('system', 'System components', `<ul class="list">${brand.systemComponents.map((s) => `<li><span class="pill">${esc(s.kind)}</span> <b>${esc(s.name)}</b> · ${s.occurrences} pages · ${esc((s.headingSequence || []).join(' › '))} · ${esc((s.ctaLabels || []).join(', '))}</li>`).join('')}</ul>`);
sec('logo', 'Logo & favicons', `<div class="logos"><img src="${esc(brand.logo.path.replace('stardust/current/', ''))}" alt="logo" style="height:60px"><img src="${esc(log.favicon.file)}" alt="favicon" style="height:32px"><dl><dt>Source</dt><dd>${esc(brand.logo.source)} — <code>${esc(brand.logo.sourceSelector)}</code></dd><dt>File</dt><dd>${esc(brand.logo.path)} (${esc(brand.logo.format)})</dd><dt>Variants captured</dt><dd>${esc((brand.logo.variants || ['primary']).join(', '))}</dd><dt>Variants not captured</dt><dd>${esc((brand.logo.variantsNotCaptured || []).join(', ') || 'none noted')}</dd></dl></div>`);
sec('spacing', 'Spacing & shape', `<p>Base unit ${esc(brand.spacing.baseUnit)}px · scale ${brand.spacing.scale.map((v) => `<span class="bar" style="height:${Math.min(v, 120)}px" title="${v}px"></span>`).join('')}</p><p>${(brand.motifs.borderRadius.occurrences || []).map((r) => `<span class="pill">${esc(r.value)}</span>`).join(' ')}</p>`);
const nav = sections.map((s) => `<a href="#${s.id}">${s.title.replace(/<[^>]+>/g, '')}</a>`).join('');
const html = `<!DOCTYPE html>
<html lang="en"><head>
<!-- stardust:provenance
  writtenBy:        stardust:extract
  writtenAt:        ${new Date().toISOString()}
  readArtifacts:
    - stardust/current/_brand-extraction.json
    - stardust/current/_crawl-log.json
    - stardust/current/DESIGN.json
    - stardust/state.json
  synthesizedInputs: []
  stardustVersion:  0.27.0
-->
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(brand.site.name)} · Current state</title>
<style>
:root{--primary:${primary};--primary-dark:${dark};--accent:${primary};--text:${dark}}
body{margin:0;font-family:${bodyFont};color:var(--text);line-height:1.5}
h1,h2,h3,h4{font-family:${headFont}}
nav.top{position:sticky;top:0;background:var(--primary-dark);color:#fff;display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:8px 16px;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;z-index:9}
nav.top strong{margin-right:12px}nav.top a{color:#fff;text-decoration:none;padding:6px 12px;border-radius:150px}nav.top a:hover{background:rgba(255,255,255,.18)}
section{padding:32px 24px;max-width:1200px;margin:0 auto;break-inside:avoid}section+section{border-top:1px solid #e6e7eb}
.hero-line{color:var(--accent);font-size:32px;margin:0}.accent{color:var(--accent)}
.stats{display:flex;gap:16px;flex-wrap:wrap}.stats>div{border:1px solid #e6e7eb;padding:12px 16px;min-width:160px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}.grid img{width:100%;height:220px;object-fit:cover;object-position:top;border:1px solid #e6e7eb}figcaption{font-size:12px}
.swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}.swatch span{display:block;height:48px;border:1px solid #e6e7eb}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}.cards>div{border:1px solid #e6e7eb;padding:12px}
.pill{display:inline-block;border:1px solid var(--primary);color:var(--primary);border-radius:150px;padding:2px 10px;font-size:12px;margin:2px}
.badge{display:inline-block;background:var(--primary);color:#fff;font-size:11px;padding:2px 8px;border-radius:3px;vertical-align:middle}
.demo{width:80px;height:48px;background:var(--primary);margin-bottom:6px}.bar{display:inline-block;width:12px;background:var(--primary);margin:0 2px;vertical-align:bottom}
ul.two{columns:2}ul.list li{border-left:3px solid var(--primary);padding-left:10px;margin:6px 0;list-style:none}.logos{display:flex;gap:24px;align-items:flex-start}
footer{padding:24px;font-size:12px;color:#4a595c}
</style></head><body>
<nav class="top"><strong>${esc(brand.site.name)} · Current state</strong>${nav}</nav>
${sections.map((s) => `<section id="${s.id}"><h2>${s.title}</h2>${s.body}</section>`).join('\n')}
<footer>Provenance: read _brand-extraction.json, _crawl-log.json, DESIGN.json, state.json and ${pages.length} page records. Flow: replica — the design is kept; next: $stardust replica preserve-direction (mechanical promotion). Badges: <span class="pill">pill</span> = captured value, <span class="badge">badge</span> = audit verdict.</footer>
</body></html>`;
fs.writeFileSync('stardust/current/brand-review.html', html);
console.log(`brand-review.html: ${sections.length} sections, ${(html.length / 1024).toFixed(0)} KB`);
