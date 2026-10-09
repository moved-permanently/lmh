import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width (source chrome breakpoint: 1024px)
const isDesktop = window.matchMedia('(min-width: 1024px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Collapses the drill-down / mega-menu state below a container
 * @param {Element} root container whose expandable buttons collapse
 */
function collapseAll(root) {
  root.querySelectorAll('.menu-nav-mainitem, .menu-nav-subtoggle').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Toggles all nav sections (closes the open mega-menu panel and its level-3 state)
 * @param {Element} sections The container element
 */
function toggleAllNavSections(sections) {
  if (!sections) return;
  collapseAll(sections);
  sections.closest('.header')?.classList.remove('megamenu-open');
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  // the desktop nav is always expanded, so aria-expanded only applies to the mobile menu
  if (isDesktop.matches) nav.removeAttribute('aria-expanded');
  else nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  // every open/close of the drawer (and every breakpoint change) starts from level 1
  toggleAllNavSections(navSections);
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

/**
 * Esc: desktop closes the open panel; mobile steps one drill level back, then closes the drawer
 * @param {KeyboardEvent} e keydown event
 */
function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  const navSections = nav?.querySelector('.nav-sections');
  if (!navSections) return;
  const open = [...navSections.querySelectorAll('[aria-expanded="true"]')];
  if (isDesktop.matches) {
    const section = navSections.querySelector('.menu-nav-mainitem[aria-expanded="true"]');
    if (!section) return;
    toggleAllNavSections(navSections);
    section.focus();
  } else if (open.length) {
    const deepest = open[open.length - 1];
    deepest.setAttribute('aria-expanded', 'false');
    deepest.focus();
  } else if (nav.getAttribute('aria-expanded') === 'true') {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, navSections, false);
    nav.querySelector('.nav-hamburger button').focus();
  }
}

/**
 * Creates an element with classes
 * @param {string} tag tag name
 * @param {string} className space-separated classes
 * @returns {Element}
 */
function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/**
 * Creates an icon-font glyph
 * @param {string} name icon name (styles.css .icon-*)
 * @returns {Element}
 */
function glyph(name) {
  const i = el('i', `icon icon-${name}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

/**
 * Nav DECODE: the pipeline wraps a list item's trigger link in a <p> on live.
 * Matches `:scope > a, :scope > p > a` and unwraps the <p>.
 * @param {Element} li list item
 * @returns {Element|null} the trigger link
 */
function unwrapLink(li) {
  const a = li.querySelector(':scope > a, :scope > p > a');
  if (a && a.parentElement !== li) a.parentElement.replaceWith(a);
  return a;
}

/**
 * Moves a list item's label (text nodes / <p> children, everything but its sub-list) into a target
 * @param {Element} li list item
 * @param {Element} target receiving element
 */
function moveLabel(li, target) {
  [...li.childNodes].forEach((node) => {
    if (node.tagName === 'UL') return;
    if (node.tagName === 'P') {
      target.append(...node.childNodes);
      node.remove();
    } else target.append(node);
  });
  target.normalize();
  const { firstChild: first, lastChild: last } = target;
  if (first?.nodeType === Node.TEXT_NODE) first.textContent = first.textContent.trimStart();
  if (last?.nodeType === Node.TEXT_NODE) last.textContent = last.textContent.trimEnd();
}

/**
 * The heading row of a drill level: mobile back button + title, desktop "Label >" overview link
 * @param {Element} heading the heading link (authored or created)
 * @param {Element} opener the button that opened this level (collapsed by the back button)
 * @returns {Element} the row
 */
function headingRow(heading, opener) {
  const row = el('li', 'menu-back');
  const back = el('button', 'menu-back-btn');
  back.type = 'button';
  back.setAttribute('aria-label', 'Back');
  back.append(glyph('left'));
  back.addEventListener('click', () => {
    opener.setAttribute('aria-expanded', 'false');
    opener.focus();
  });
  heading.classList.remove('menu-nav-subitem');
  heading.classList.add('menu-heading');
  heading.append(glyph('right'));
  row.append(back, heading);
  return row;
}

/**
 * Grows the absolutely placed panel to its tallest column (level 3 / teaser are out of flow)
 * @param {Element} panel the level-2 list (mega-menu panel)
 */
function fitPanel(panel) {
  panel.style.minHeight = '';
  if (!isDesktop.matches) return;
  const { top, height } = panel.getBoundingClientRect();
  const bottoms = [...panel.querySelectorAll(':scope > li > .submenu, .menu-teaser-links')]
    .filter((ul) => ul.offsetParent)
    .map((ul) => ul.getBoundingClientRect().bottom - top);
  const max = Math.max(0, ...bottoms);
  if (max > height) panel.style.minHeight = `${Math.ceil(max)}px`;
}

/**
 * Decorates a section's level-2 list into the mega-menu panel / mobile drill level.
 * Authored model (nav.html):
 * - the first level-2 item, when it is a plain link, is the section overview;
 * - a level-2 link with a sub-list opens level 3 (the link becomes the level-3 heading);
 * - a level-2 plain-text label with a sub-list is the teaser column ("This might interest you:").
 * @param {Element} ul the authored level-2 list
 * @param {Element} button the section button
 * @param {string} label the section label
 */
function decoratePanel(ul, button, label) {
  ul.classList.add('submenu', 'lvl-0');
  const items = [...ul.querySelectorAll(':scope > li')];
  const hoverTimers = new WeakMap();

  const activate = (toggle) => {
    ul.querySelectorAll(':scope > li > .menu-nav-subtoggle').forEach((t) => {
      t.setAttribute('aria-expanded', t === toggle ? 'true' : 'false');
    });
    fitPanel(ul);
  };

  items.forEach((li, i) => {
    const sub = li.querySelector(':scope > ul');
    const a = unwrapLink(li);
    if (!a && sub) {
      li.classList.add('menu-teaser');
      const title = el('p', 'menu-teaser-label');
      moveLabel(li, title);
      li.prepend(title);
      sub.classList.add('menu-teaser-links');
      sub.querySelectorAll(':scope > li').forEach((tli) => {
        unwrapLink(tli)?.classList.add('menu-teaser-link');
      });
      return;
    }
    if (!a) return;
    a.classList.add('menu-nav-subitem');
    if (!sub) {
      if (i === 0) li.classList.add('menu-overview');
      return;
    }
    li.classList.add('has-sub');
    sub.classList.add('submenu', 'lvl-1');
    const toggle = el('button', 'menu-nav-subtoggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = a.textContent.trim();
    toggle.append(glyph('right'));
    const links = [...sub.querySelectorAll(':scope > li')];
    links.forEach((sli) => unwrapLink(sli)?.classList.add('menu-nav-subitem'));
    // two balanced level-3 columns (source: left list ceil(n/2), right list the rest)
    sub.style.setProperty('--rows', Math.ceil(links.length / 2));
    // the authored link becomes the level-3 heading ("New Industrial Trucks >" → its overview)
    sub.prepend(headingRow(a, toggle));
    li.prepend(toggle);
    toggle.addEventListener('click', () => {
      if (isDesktop.matches) activate(toggle);
      else toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') !== 'true');
    });
    li.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      hoverTimers.set(li, setTimeout(() => activate(toggle), 150));
    });
    li.addEventListener('mouseleave', () => clearTimeout(hoverTimers.get(li)));
  });

  // section heading "Products >" → the overview link (the overview item stays listed for mobile)
  const overview = ul.querySelector(':scope > .menu-overview > a');
  const heading = el(overview ? 'a' : 'span');
  if (overview) heading.href = overview.href;
  heading.textContent = label;
  ul.prepend(headingRow(heading, button));

  const closeRow = el('li', 'menu-close');
  const close = el('button', 'menu-close-btn');
  close.type = 'button';
  close.textContent = 'Close menu';
  close.append(glyph('close'));
  close.addEventListener('click', () => {
    toggleAllNavSections(ul.closest('.nav-sections'));
    button.focus();
  });
  closeRow.append(close);
  ul.prepend(closeRow);
}

/**
 * Slots the authored nav list into the source's .menu-nav row
 * @param {Element} navSections the authored sections wrapper
 */
function decorateSections(navSections) {
  const list = navSections.querySelector('ul');
  if (!list) return;
  list.classList.add('menu-nav');
  const mobileLabel = el('li', 'menu-mobile');
  mobileLabel.textContent = 'Menu';
  list.prepend(mobileLabel);
  // resolved on use: the nav is attached to the block after decoration
  const header = () => navSections.closest('.header');
  list.querySelectorAll(':scope > li').forEach((navSection, i) => {
    if (navSection === mobileLabel) return;
    const subList = navSection.querySelector(':scope > ul');
    const a = unwrapLink(navSection);
    if (!subList) {
      navSection.classList.add('menu-item');
      if (a) a.classList.add('menu-homelink');
      return;
    }
    navSection.classList.add('menu-main', 'nav-drop');
    // wrap the dropdown label in a button so it is announced as expandable
    const button = el('button', 'menu-nav-mainitem');
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    moveLabel(navSection, button);
    const label = button.textContent;
    button.append(glyph('right'));
    subList.id = `nav-panel-${i}`;
    button.setAttribute('aria-controls', subList.id);
    navSection.prepend(button);
    decoratePanel(subList, button, label);
    // desktop: opens on click (not hover); mobile: drills into level 2
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      toggleAllNavSections(navSections);
      button.setAttribute('aria-expanded', !expanded);
      if (isDesktop.matches) {
        header()?.classList.toggle('megamenu-open', !expanded);
        fitPanel(subList);
      }
    });
  });

  // desktop: a click anywhere outside the nav (incl. the dimmed page) closes the panel
  document.addEventListener('click', (e) => {
    if (!isDesktop.matches || !header()?.classList.contains('megamenu-open')) return;
    if (!e.target.closest('.nav-sections')) toggleAllNavSections(navSections);
  });
  window.addEventListener('keydown', closeOnEscape);
}

/**
 * Mobile drawer: the source repeats the meta links and the dealer CTA below the level-1 list
 * @param {Element} navSections the decorated sections wrapper
 * @param {Element} navTools the decorated tools wrapper
 */
function addMobileTools(navSections, navTools) {
  const list = navSections.querySelector('.menu-nav');
  if (!list || !navTools) return;
  navTools.querySelectorAll('.menu-meta-item > a, .dealer-btn-wrapper > a').forEach((a) => {
    const cta = a.closest('.dealer-btn-wrapper');
    const li = el('li', cta ? 'menu-mobile-tool menu-mobile-cta' : 'menu-mobile-tool');
    li.append(a.cloneNode(true));
    list.append(li);
  });
}

/**
 * Slots the authored tools (meta links + dealer CTA) into the source's meta strip
 * @param {Element} navTools the authored tools wrapper
 */
function decorateTools(navTools) {
  const icons = { search: 'icon-search', xtranet: 'icon-logout' };
  const meta = el('div', 'navigation-meta');
  const metaSub = el('div', 'navigation-meta-sub');
  const list = navTools.querySelector('ul');
  if (list) {
    list.classList.add('menu-meta');
    list.querySelectorAll(':scope > li').forEach((li) => {
      li.classList.add('menu-meta-item');
      const a = unwrapLink(li);
      if (!a) return;
      // live shape: a.btn__link > div.btn (label box); the authored text nodes move into the div
      const btn = el('div', 'btn btn-meta with-icon no-background');
      const key = a.textContent.trim().toLowerCase();
      if (icons[key]) {
        const icon = el('i', `icon ${icons[key]}`);
        icon.setAttribute('aria-hidden', 'true');
        btn.append(icon);
      }
      btn.append(...a.childNodes);
      a.append(btn);
    });
    metaSub.append(list);
  }
  meta.append(metaSub);
  const cta = navTools.querySelector('p > a, :scope > a');
  if (cta) {
    const wrapper = el('div', 'dealer-btn-wrapper');
    cta.className = '';
    const btn = el('div', 'btn btn-primary stretch location-overview-button');
    btn.append(...cta.childNodes);
    cta.append(btn);
    wrapper.append(cta);
    meta.append(wrapper);
  }
  navTools.textContent = '';
  navTools.append(meta);
}

/**
 * Slots the authored logo link into the source's logo box
 * @param {Element} navBrand the authored brand wrapper
 */
function decorateBrand(navBrand) {
  const logo = el('div', 'navigation-logo');
  let link = navBrand.querySelector('a');
  const picture = navBrand.querySelector('picture, img');
  if (!link) {
    link = el('a');
    link.href = '/';
  }
  link.className = 'logo-link';
  if (picture && !link.contains(picture)) {
    link.textContent = '';
    link.append(picture);
  }
  logo.append(link);
  navBrand.textContent = '';
  navBrand.append(logo);
}

/**
 * The observed sticky-header scroll machine (source stickystacky, desktop only):
 * y <= 48 normal-state · 48 < y < 86 `small` (height 100 + 48 - y) · y >= 86 small-state (62px).
 * The chrome slides out proportionally while scrolling down and back in while scrolling up;
 * the scroll event that changes direction only re-arms the slide (the live stitched captures keep
 * the header visible at the first scroll seam). prefers-reduced-motion: states morph, no slide.
 * The source stacks the breadcrumb and the in-page anchor row under the header in the same fixed
 * wrapper (stickystacky: header → breadcrumb → anchor navigation); the stack slides out by the
 * height of everything but its LAST element, so the breadcrumb (or the anchor row when the page
 * has one) stays pinned at the top while scrolling down. Mirrored here: the two sections become
 * `position: sticky` (class `stack-sticky`) below the header, slid by the same transform.
 * @param {Element} block the header block (fixed)
 * @param {Element} nav the .navigation row
 */
function initScrollState(block, nav) {
  const SMALL = 48;
  const MAX = 86;
  const HMAX = 100;
  const host = block.closest('header');
  let lastY = window.scrollY;
  let dir = 0;
  let modeY = lastY;
  let modeOff = 0;
  let outY = 0;

  const setState = (y) => {
    const states = ['normal-state', 'small', 'small-state'];
    let state = 'small-state';
    if (y <= SMALL) state = 'normal-state';
    else if (y < MAX) state = 'small';
    states.forEach((s) => block.classList.toggle(s, s === state));
    if (host) host.classList.toggle('small-state', state === 'small-state');
    const h = state === 'small' ? `${HMAX + (SMALL - y)}px` : '';
    block.style.height = h;
    nav.style.height = h;
  };

  // the stacked sections below the header (source order: breadcrumb, then the anchor row)
  const stackSections = () => [...document.querySelectorAll('main > .section.breadcrumb-container, main > .section.anchor-nav')]
    .filter((section) => section.offsetHeight > 0);
  const placeStack = (sections, sticky, headerH, slide) => {
    let top = headerH;
    sections.forEach((section, i) => {
      section.classList.toggle('stack-sticky', sticky);
      section.classList.toggle('stack-last', sticky && i === sections.length - 1);
      section.style.top = sticky ? `${top}px` : '';
      section.style.transform = (sticky && slide) ? `translateY(${slide}px)` : '';
      top += section.offsetHeight;
    });
  };

  const tick = () => {
    const y = window.scrollY;
    const desktop = isDesktop.matches;
    const sticky = desktop && y >= SMALL;
    setState(desktop ? y : 0);
    block.classList.toggle('sticky', sticky);
    const sections = stackSections();
    if (!desktop) {
      // mobile: the header scrolls away with the page; the anchor row alone stays pinned at the
      // top (source data-stickystacky-mobile — observed at the 360 stitch seams)
      block.style.transform = '';
      placeStack(sections, true, 0, 0);
      dir = 0;
      outY = 0;
      lastY = y;
      return;
    }
    if (!sticky) {
      block.style.transform = '';
      placeStack(sections, false, 0, 0);
      dir = 0;
      outY = 0;
      lastY = y;
      return;
    }
    const stackH = block.offsetHeight;
    // slide distance: the whole stack minus its last element, which stays pinned (stickystacky)
    const lastH = sections.length ? sections[sections.length - 1].offsetHeight : stackH;
    const slideMax = stackH + sections.reduce((sum, s) => sum + s.offsetHeight, 0) - lastH;
    const d = Math.sign(y - lastY);
    if (d && d !== dir) {
      // scrolling down: a direction change only re-arms the slide (live: header still visible at
      // the first seam); scrolling up: the chrome comes back with the first upward movement
      dir = d;
      modeY = d > 0 ? y : lastY;
      modeOff = outY;
    }
    if (dir) {
      const t = modeOff + (modeY - y);
      outY = dir > 0 ? Math.max(t, -slideMax) : Math.min(t, 0);
    }
    const slide = (outY && !reducedMotion.matches) ? outY : 0;
    block.style.transform = slide ? `translateY(${slide}px)` : '';
    placeStack(sections, true, stackH, slide);
    lastY = y;
  };

  window.addEventListener('scroll', tick, { passive: true });
  isDesktop.addEventListener('change', tick);
  tick();
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'navigation';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-wrapper, .button-container').className = '';
    }
    decorateBrand(navBrand);
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.classList.add('navigation-menu');
    decorateSections(navSections);
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) decorateTools(navTools);
  if (navSections) addMobileTools(navSections, navTools);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger', 'navigation-burger');
  hamburger.innerHTML = `<button type="button" class="btn btn-icon no-background" aria-controls="nav"
      aria-label="Open navigation" aria-expanded="false">
      <i class="icon icon-menu nav-hamburger-icon" aria-hidden="true"></i>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
  block.classList.add('normal-state');
  initScrollState(block, nav);
}
