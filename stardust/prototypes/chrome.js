/* chrome.js — the ONLY prototype JS: the sticky-header scroll machine observed on linde-mh.com (motion-observe, 1440, 2026-10-06).
   Mechanism cloned from the source "stickystacky" module (index_bundle_lmh.js): elements carrying [data-stickystacky] semantics
   (.header, .subheader, .navigation-anchor-navigation-wrapper) are CLONED into the fixed .stickystacky-wrapper once their top scrolls
   under the stack; the originals get `stickystacky-enabled sticky-hidden` (opacity 0, still in flow). Scrolling down moves the wrapper
   out of view (top = -stackHeight); scrolling up brings it back (top = 0). Header state: scrollY <= 48 → normal-state;
   48 < y < 86 → `small` with height 100 + (48 - y); y >= 86 → small-state (62px). Thresholds: scrollBreakpointSmall 48,
   scrollBreakpointMax 86, headerHeightMax 100 (source JS). Desktop (>= 1024px) only — the observed branch (isXLOrMAX). Inert at y = 0. */
(function () {
  const mq = window.matchMedia('(min-width: 1024px)');
  const wrap = document.querySelector('.stickystacky-wrapper');
  const header = document.querySelector('.body-container > .header');
  if (!wrap || !header) return;
  const SMALL = 48; const MAX = 86; const
    HMAX = 100;
  const stack = [header, document.querySelector('.body-container > .subheader'), document.querySelector('#pjax-container .navigation-anchor-navigation-wrapper')].filter(Boolean)
    .map((el) => ({ el, clone: null, top: 0 }));
  let lastY = window.scrollY; let state = ''; let outY = 0; let dir = 0; let modeY = 0; let
    modeOff = 0;
  function setState(el, y) {
    const cl = el.classList;
    if (y <= SMALL) { cl.remove('small-state', 'small'); cl.add('normal-state'); el.style.height = ''; } else if (y < MAX) { cl.remove('normal-state', 'small-state'); cl.add('small'); el.style.height = `${HMAX + (SMALL - y)}px`; } else { cl.remove('normal-state', 'small'); cl.add('small-state'); el.style.height = ''; }
  }
  function measure() { stack.forEach((s) => { s.top = s.el.getBoundingClientRect().top + window.scrollY; }); }
  function tick() {
    const y = window.scrollY;
    if (!mq.matches) { if (state !== 'off') { teardown(); state = 'off'; } lastY = y; return; }
    state = 'on';
    let stackH = 0;
    stack.forEach((s) => {
      const sticky = s.top - y <= stackH - (s.clone ? s.clone.offsetHeight : 0) && y > 0;
      if (sticky && !s.clone) {
        s.clone = s.el.cloneNode(true); s.clone.classList.remove('sticky-hidden'); wrap.appendChild(s.clone);
        s.el.classList.add('stickystacky-enabled', 'sticky-hidden');
      } else if (!sticky && s.clone) { wrap.removeChild(s.clone); s.clone = null; s.el.classList.remove('sticky-hidden'); }
      if (s.clone) stackH += s.clone.offsetHeight;
    });
    setState(header, y); if (stack[0].clone) setState(stack[0].clone, y);
    /* source: the wrapper slides proportionally to the scroll distance since the last direction change —
       down: top = max(-stackH, off + (startY - y)); up: top = min(0, off + (startY - y)) */
    const d = y > lastY ? 1 : (y < lastY ? -1 : 0);
    if (d && d !== dir) { dir = d; modeY = lastY; modeOff = outY; }
    if (dir) { const t = modeOff + (modeY - y); outY = dir > 0 ? (t > -stackH ? t : -stackH) : (t <= 0 ? t : 0); }
    wrap.style.top = `${stackH > 0 ? outY : 0}px`;
    lastY = y;
  }
  function teardown() {
    stack.forEach((s) => { if (s.clone) { wrap.removeChild(s.clone); s.clone = null; } s.el.classList.remove('sticky-hidden', 'small', 'small-state'); s.el.style.height = ''; });
    header.classList.add('normal-state'); wrap.style.top = '';
  }
  measure(); wrap.classList.add('stickystacky-initialized'); /* live: set once at module init, never removed */
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', () => { measure(); tick(); });
  if (window.scrollY > 0) tick();
}());
