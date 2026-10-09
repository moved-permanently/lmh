#!/usr/bin/env node
/**
 * line-parity — text-line box parity between two stitched captures (origin vs build), from the PNGs alone.
 *
 * Why: a substituted typeface (licensed kit → metric-matched substitute) fails the pixel bar on text-dense pages
 * even when every line box sits where the source puts it. The pixel number cannot tell "different glyph shapes
 * on the same lines" from "lines in different places". This probe can. Per row it counts horizontal luminance
 * edges (ink rows = text lines, rules, photo rows); it then aligns the build to the origin in windows (--window
 * rows): each window takes the vertical offset (within ±height-tol × originH) that best matches its ink pattern,
 * keeping the previous window's offset unless another is clearly better. The offset profile IS the layout
 * story: a wrap fork adds or drops one line (a step of one line height), a collapsed or stretched block is a
 * step of hundreds of px. Origin text-line runs (3–72 px) are PAIRED when the build has ink on the same rows at
 * the window offset, MISSING otherwise; build runs with no origin ink are EXTRA. The aligned pixel % compares
 * the two captures window by window at the found offsets — the diff that remains once the layout is aligned,
 * i.e. the glyph-shape share.
 *
 * Verdict (printed, never a gate by itself):
 *   glyph-only  every offset step ≤ --step-max px (one wrapped line), |offset| ≤ --height-tol × originH, and no window's
 *               aligned diff is over --hot (35 %: glyph shapes of same-size text never reach it; missing paint does)
 *   drift       otherwise — the first failing window names where the layout leaves the source
 *   (line parity / extra lines are reported as calibration data: ink runs split differently around photos and rules)
 *
 * Usage: node line-parity.mjs <origin.png> <build.png> [--window 200] [--step-max 48] [--height-tol 0.05]
 *                             [--hot 35] [--edge 48] [--min-edges 10] [--json]
 */
import fs from 'node:fs';
import { PNG } from 'pngjs';

const args = process.argv.slice(2);
if (args.length < 2 || args.includes('--help')) { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('*/')[0]); process.exit(args.includes('--help') ? 0 : 1); }
const o = { window: 200, stepMax: 48, heightTol: 0.05, parity: 97, extra: 3, edge: 48, minEdges: 10, hot: 35, json: false };
for (let i = 2; i < args.length; i++) { const a = args[i]; const v = () => args[++i]; if (a === '--window') o.window = +v(); else if (a === '--step-max') o.stepMax = +v(); else if (a === '--height-tol') o.heightTol = +v(); else if (a === '--parity') o.parity = +v(); else if (a === '--extra') o.extra = +v(); else if (a === '--edge') o.edge = +v(); else if (a === '--min-edges') o.minEdges = +v(); else if (a === '--hot') o.hot = +v(); else if (a === '--json') o.json = true; }

const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
function ink(img) {
  const { width: w, height: h, data: d } = img; const on = new Uint8Array(h);
  for (let y = 0; y < h; y++) { let c = 0; const row = y * w * 4; let prev = lum(d, row);
    for (let x = 1; x < w; x++) { const l = lum(d, row + x * 4); if (Math.abs(l - prev) > o.edge) c++; prev = l; } on[y] = c >= o.minEdges ? 1 : 0; }
  return on;
}
function runs(on) { const r = []; let y0 = -1; for (let y = 0; y <= on.length; y++) { const v = y < on.length && on[y]; if (v && y0 < 0) y0 = y; if (!v && y0 >= 0) { r.push({ y0, y1: y, h: y - y0 }); y0 = -1; } } return r.filter((x) => x.h >= 3 && x.h <= 72); }

const A = PNG.sync.read(fs.readFileSync(args[0])), B = PNG.sync.read(fs.readFileSync(args[1]));
if (A.width !== B.width) { console.error(`line-parity: width mismatch ${A.width} vs ${B.width}`); process.exit(1); }
const inkA = ink(A), inkB = ink(B); const HA = A.height, HB = B.height, W = A.width;
const maxShift = Math.max(8, Math.round(o.heightTol * HA));
// windows + offsets
const wins = []; let prev = 0;
for (let w0 = 0; w0 < HA; w0 += o.window) {
  const w1 = Math.min(HA, w0 + o.window); let inkRows = 0; for (let y = w0; y < w1; y++) inkRows += inkA[y];
  const score = (d) => { let s = 0; for (let y = w0; y < w1; y++) { const yb = y + d; if (yb < 0 || yb >= HB) { s -= 1; continue; } s += inkA[y] === inkB[yb] ? 1 : -1; } return s; };
  // candidates: the previous offset + the best ink-pattern offsets; the winner is the one with the LOWEST pixel
  // diff over the window (ink patterns repeat in card grids; pixels do not), and it must beat the previous offset clearly
  const pix = (d) => { let n = 0, t = 0; for (let y = w0; y < Math.min(HA, w0 + 2 * o.window); y += 2) { const yb = y + d; if (yb < 0 || yb >= HB) { n += W / 3; t += W / 3; continue; } const ra = y * W * 4, rb = yb * W * 4; for (let x = 0; x < W; x += 3) { const i = ra + x * 4, j = rb + x * 4; t++; if (Math.abs(A.data[i] - B.data[j]) + Math.abs(A.data[i + 1] - B.data[j + 1]) + Math.abs(A.data[i + 2] - B.data[j + 2]) > 60) n++; } } return n / Math.max(1, t); };
  let best = prev, bs = pix(prev); const base = bs;
  if (inkRows > 2 && inkRows < w1 - w0 - 2) {
    const cands = []; for (let d = -maxShift; d <= maxShift; d++) cands.push([score(d), d]); cands.sort((p, q) => q[0] - p[0]);
    const top = cands.slice(0, 6).map((c) => c[1]).filter((d) => d !== prev);
    for (const d of top) { const s = pix(d); if (s < bs - 0.03 || (s < bs - 0.005 && Math.abs(d - prev) < Math.abs(best - prev))) { bs = s; best = d; } }
  }
  wins.push({ y0: w0, y1: w1, d: best, step: Math.abs(best - prev), scorePrev: base, score: bs }); prev = best;
}
// a one-window outlier (both neighbours agree within --step-max, it differs from both by more) is a locked-on repeat or a flat region — take the neighbours' value
for (let i = 1; i < wins.length - 1; i++) { const a = wins[i - 1].d, b = wins[i].d, c = wins[i + 1].d; if (Math.abs(a - c) <= o.stepMax && Math.abs(b - a) > o.stepMax && Math.abs(b - c) > o.stepMax) wins[i].d = Math.round((a + c) / 2); }
for (let i = 0; i < wins.length; i++) wins[i].step = Math.abs(wins[i].d - (i ? wins[i - 1].d : 0));
const offAt = (y) => wins[Math.min(wins.length - 1, Math.floor(y / o.window))].d;
// pairing
const RA = runs(inkA), RB = runs(inkB); const missing = [];
let paired = 0;
for (const r of RA) { const d = offAt(r.y0); let hit = 0; for (let y = r.y0; y < r.y1; y++) { const yb = y + d; if (yb >= 0 && yb < HB && inkB[yb]) hit++; } if (hit >= 0.6 * r.h) paired++; else missing.push(r.y0); }
const extra = [];
for (const r of RB) { // map back through the window whose image covers r.y0
  let d = 0; for (const w of wins) { if (r.y0 >= w.y0 + w.d && r.y0 < w.y1 + w.d) { d = w.d; break; } }
  let hit = 0; for (let y = r.y0; y < r.y1; y++) { const ya = y - d; if (ya >= 0 && ya < HA && inkA[ya]) hit++; } if (hit < 0.4 * r.h) extra.push(r.y0); }
// aligned pixel diff
let diff = 0, total = 0; const da = A.data, db = B.data;
for (const w of wins) { let wd = 0, wt = 0; for (let y = w.y0; y < w.y1; y++) { const yb = y + w.d; if (yb < 0 || yb >= HB) continue; const ra = y * W * 4, rb = yb * W * 4; for (let x = 0; x < W; x++) { const i = ra + x * 4, j = rb + x * 4; total++; if (Math.abs(da[i] - db[j]) + Math.abs(da[i + 1] - db[j + 1]) + Math.abs(da[i + 2] - db[j + 2]) > 60) { diff++; wd++; } wt++; } } w.pct = wt ? +((wd / wt) * 100).toFixed(1) : 0; }
const steps = wins.filter((w) => w.step > 0); const maxStep = steps.reduce((m, w) => Math.max(m, w.step), 0); const maxOff = wins.reduce((m, w) => Math.max(m, Math.abs(w.d)), 0);
const parity = RA.length ? (paired / RA.length) * 100 : 100, extraPct = RB.length ? (extra.length / RB.length) * 100 : 0;
const hot = wins.filter((w) => w.pct > o.hot);
const reasons = [];
if (hot.length) reasons.push(`${hot.length} window(s) over ${o.hot} % aligned (first y ${hot[0].y0} at ${hot[0].pct} %)`);
if (maxStep > o.stepMax) reasons.push(`step ${maxStep} px > ${o.stepMax} at y ${steps.find((w) => w.step === maxStep).y0}`);
if (maxOff > maxShift) reasons.push(`offset ${maxOff} px > ${maxShift}`);
const firstBad = Math.min(...[hot[0] && hot[0].y0, (steps.find((w) => w.step > o.stepMax) || {}).y0].filter((v) => v != null));
const out = { a: args[0], b: args[1], originH: HA, buildH: HB, lines: { origin: RA.length, build: RB.length, paired, missing: missing.length, extra: extra.length }, parityPct: +parity.toFixed(1), extraPct: +extraPct.toFixed(1), steps: steps.length, maxStep, maxOffset: maxOff, maxShift, alignedPct: +((diff / total) * 100).toFixed(2), verdict: reasons.length ? 'drift' : 'glyph-only', reasons, hotWindows: hot.map((w) => [w.y0, w.pct]), windowPct: wins.map((w) => w.pct), firstDriftY: Number.isFinite(firstBad) ? firstBad : null, offsets: wins.map((w) => w.d), missingY: missing.slice(0, 8), extraY: extra.slice(0, 8) };
if (o.json) console.log(JSON.stringify(out)); else console.log(`line-parity: ${out.verdict}  lines ${RA.length}→${RB.length} paired ${paired} missing ${missing.length} extra ${extra.length} (parity ${out.parityPct} %) steps ${steps.length} max ${maxStep} px, |offset| max ${maxOff} (bar ${maxShift}), aligned diff ${out.alignedPct} %${reasons.length ? ' — ' + reasons.join('; ') : ''}`);
process.exit(reasons.length ? 2 : 0);
