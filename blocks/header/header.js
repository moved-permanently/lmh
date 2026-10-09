import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width (source chrome breakpoint: 1024px)
const isDesktop = window.matchMedia('(min-width: 1024px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Closes the open nav dropdown (desktop) or the nav menu (mobile) on Escape
 * @param {KeyboardEvent} e keydown event
 */
function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

/**
 * Closes the open nav dropdown (desktop) or the nav menu (mobile) when focus leaves the nav
 * @param {FocusEvent} e focusout event
 */
function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean|string} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-drop > button').forEach((button) => {
    button.setAttribute('aria-expanded', expanded);
  });
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
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  button.setAttribute('aria-expanded', expanded ? 'false' : 'true');

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
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
 * Decorates a mega-menu sub-list (authored nodes are moved, never rebuilt)
 * @param {Element} ul the authored sub-list
 * @param {number} level nesting level (0 = the panel's columns)
 */
function decorateSubList(ul, level) {
  ul.classList.add('submenu', `lvl-${level}`);
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const a = unwrapLink(li);
    if (a) a.classList.add('menu-nav-subitem');
    const sub = li.querySelector(':scope > ul');
    if (sub) {
      li.classList.add('has-sub');
      decorateSubList(sub, level + 1);
    }
  });
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
  list.querySelectorAll(':scope > li').forEach((navSection) => {
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
    button.setAttribute('aria-expanded', false);
    [...navSection.childNodes].forEach((node) => {
      if (node === subList) return;
      // the pipeline may wrap the label in a <p>: move its children, keep the authored text nodes
      if (node.tagName === 'P') button.append(...node.childNodes);
      else button.append(node);
    });
    navSection.prepend(button);
    decorateSubList(subList, 0);
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      if (isDesktop.matches) {
        button.focus();
        toggleAllNavSections(navSections);
      }
      button.setAttribute('aria-expanded', !expanded);
    });
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
    .filter((el) => el.offsetHeight > 0);
  const placeStack = (sections, sticky, headerH, slide) => {
    let top = headerH;
    sections.forEach((el, i) => {
      el.classList.toggle('stack-sticky', sticky);
      el.classList.toggle('stack-last', sticky && i === sections.length - 1);
      el.style.top = sticky ? `${top}px` : '';
      el.style.transform = (sticky && slide) ? `translateY(${slide}px)` : '';
      top += el.offsetHeight;
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
    const slideMax = stackH + sections.reduce((sum, el) => sum + el.offsetHeight, 0) - lastH;
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
