#!/usr/bin/env node
// typed-slots.mjs — extract --prep § 4: add a `slots` section to each page record by page type (from state.json).
import fs from 'node:fs';
const state = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8'));
const NAV = /^(Products|Services|Solutions|About us) /;
let n = 0;
for (const p of state.pages) {
  const f = p.currentStatePath; const r = JSON.parse(fs.readFileSync(f, 'utf8'));
  const prose = (r.body || []).filter((s) => s.length > 60 && !NAV.test(s));
  const hs = (r.headings || []).filter((h) => h.text && h.text !== 'Follow us on');
  const h1 = hs.find((h) => h.tag === 'h1');
  const imgs = (r.media?.imgs || []).filter((i) => (i.naturalWidth || i.width || 0) >= 600 || /w960|w1920/.test(i.currentSrc || i.src || ''));
  const ctas = (r.ctas || []).filter((c) => c.href && !/Search|Xtranet|Legal|Terms|Suppliers|EDI|Privacy|Cookie|Vulnerability|^Home$|^Contact$|^Share$/.test(c.label));
  const base = { headline: h1?.text || r.heroHeadline || r.title, 'lead-image': imgs[0]?.currentSrc || imgs[0]?.src || null, intro: prose[0] || null };
  let slots;
  switch (p.type) {
    case 'article': slots = { ...base, deck: prose[1] || null, meta: hs.find((h) => /Trade Press/.test(h.text)) ? 'press-contact' : null, body: prose.slice(1, 12), related: hs.filter((h) => h.tag === 'h3').slice(-4).map((h) => h.text) }; break;
    case 'listing': slots = { 'index-headline': base.headline, 'lead-image': base['lead-image'], intro: base.intro, 'card-grid': hs.filter((h) => h.tag === 'h3').map((h) => ({ title: h.text })), 'filter-controls': (r.dynamic?.forms || []).length > 0 }; break;
    case 'program': slots = { 'program-headline': base.headline, 'lead-image': base['lead-image'], summary: base.intro, 'feature-grid': hs.filter((h) => /^h[23]$/.test(h.tag)).map((h) => h.text), 'cta-band': ctas.slice(0, 3).map((c) => ({ label: c.label, href: c.href })) }; break;
    case 'form': slots = { ...base, form: (r.dynamic?.forms || [])[0] || null, 'cta-label': ctas.find((c) => /send|submit/i.test(c.label))?.label || null }; break;
    case 'landing': slots = { ...base, 'hero-slides': hs.filter((h) => h.tag === 'h2').slice(0, 5).map((h) => h.text), sections: hs.filter((h) => h.tag === 'h2').map((h) => h.text), ctas: ctas.slice(0, 6).map((c) => ({ label: c.label, href: c.href })) }; break;
    case 'static': slots = { ...base, sections: hs.filter((h) => /^h[23]$/.test(h.tag)).map((h) => h.text), body: prose.slice(1, 20) }; break;
    default: slots = { ...base, note: 'unique page — rendered as a one-off' };
  }
  r.slots = slots; fs.writeFileSync(f, JSON.stringify(r, null, 2) + '\n'); n++;
}
console.log(`typed-slots: ${n} page records gained a slots section`);
