import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const NETWORKS = ['linkedin', 'facebook', 'instagram', 'youtube'];
// hosts the source treats as its own (no external-link glyph):
// the site itself and the not-yet-migrated source origin
const INTERNAL_HOSTS = /(^|\.)linde-mh\.com$/;

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
 * Unwraps a list item's link from the <p> the pipeline may add
 * @param {Element} li list item
 * @returns {Element|null} the link
 */
function unwrapLink(li) {
  const a = li.querySelector(':scope > a, :scope > p > a');
  if (a && a.parentElement !== li) a.parentElement.replaceWith(a);
  return a;
}

/**
 * Builds an icon-only share/social button
 * @param {string} href link target
 * @param {string} icon icon class
 * @param {string} label accessible label
 * @param {string} classes extra button classes
 * @returns {Element}
 */
function iconButton(href, icon, label, classes) {
  const a = el('a', `btn btn-social ${classes}`);
  a.href = href;
  a.setAttribute('aria-label', label);
  if (/^https?:/.test(href)) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  const i = el('i', `icon ${icon}`);
  i.setAttribute('aria-hidden', 'true');
  a.append(i);
  return a;
}

/**
 * The source share bar (UI widget: a "Share" button opening mail / LinkedIn / Facebook / print)
 * @returns {Element}
 */
function buildShareBar() {
  const url = encodeURIComponent(window.location.href);
  const outer = el('div', 'share-btn');
  const inner = el('div', 'share-btn');
  // live shape: a.share--title (inline box) > div.btn
  const title = el('a', 'share-title');
  title.href = '#share';
  title.setAttribute('role', 'button');
  title.setAttribute('aria-expanded', 'false');
  const titleBtn = el('div', 'btn');
  titleBtn.textContent = 'Share';
  title.append(titleBtn);
  const container = el('div', 'share-btn-container');
  const heading = el('div', 'title');
  heading.textContent = 'Share';
  const close = el('button', 'share-close btn btn-icon');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  const closeIcon = el('i', 'icon icon-close');
  closeIcon.setAttribute('aria-hidden', 'true');
  close.append(closeIcon);
  const print = el('button', 'btn btn-social btn-primary inverted');
  print.type = 'button';
  print.setAttribute('aria-label', 'Print');
  const printIcon = el('i', 'icon icon-print');
  printIcon.setAttribute('aria-hidden', 'true');
  print.append(printIcon);
  print.addEventListener('click', () => window.print());
  container.append(
    heading,
    close,
    iconButton(`mailto:?body=${url}`, 'icon-mail', 'Share by e-mail', 'btn-primary inverted'),
    iconButton(`https://www.linkedin.com/shareArticle?url=${url}&v=6248466`, 'icon-linkedin', 'Share on LinkedIn', 'btn-linkedin inverted'),
    iconButton(`https://www.facebook.com/sharer/sharer.php?u=${url}`, 'icon-facebook', 'Share on Facebook', 'btn-facebook inverted'),
    print,
  );
  const toggle = (open) => {
    title.setAttribute('aria-expanded', open);
    inner.classList.toggle('open', open);
  };
  title.addEventListener('click', (e) => {
    e.preventDefault();
    toggle(title.getAttribute('aria-expanded') !== 'true');
  });
  close.addEventListener('click', () => toggle(false));
  inner.append(title, container);
  outer.append(inner);
  return outer;
}

/**
 * Footer link band: the authored <ul> (external targets get the source's external-link glyph)
 * @param {Element} section authored section
 * @param {Element} footer target
 */
function slotLinks(section, footer) {
  const list = section.querySelector('ul');
  if (!list) return;
  list.classList.add('footer-links');
  list.querySelectorAll(':scope > li').forEach((li) => {
    const a = unwrapLink(li);
    if (!a) return;
    a.classList.add('textlink');
    const { hostname } = new URL(a.href, window.location);
    const internal = !hostname || hostname === window.location.hostname
      || INTERNAL_HOSTS.test(hostname);
    if (!internal) a.classList.add('external-link-icon');
  });
  footer.append(list);
}

/**
 * Social band: the authored label + list of network links, rendered as the source's icon buttons
 * @param {Element} section authored section
 * @param {Element} footer target
 */
function slotSocial(section, footer) {
  const band = el('div', 'footer-socialmedia');
  const label = section.querySelector('h1, h2, h3, h4, h5, h6, p');
  if (label) {
    label.classList.add('footer-socialmedia-title');
    band.append(label);
  }
  const list = section.querySelector('ul');
  if (list) {
    list.querySelectorAll(':scope > li').forEach((li) => {
      const a = unwrapLink(li);
      if (!a) return;
      const text = a.textContent.trim();
      const network = NETWORKS.find((n) => a.href.toLowerCase().includes(n)
        || text.toLowerCase().includes(n)) || '';
      a.className = `btn btn-icon no-background btn-${network}`;
      a.setAttribute('aria-label', text || a.href);
      a.target = '_blank';
      a.rel = 'noopener';
      const icon = el('i', `icon${network ? ` icon-${network}` : ''}`);
      icon.setAttribute('aria-hidden', 'true');
      a.textContent = '';
      a.append(icon);
    });
    // the live row carries a fifth, empty social slot (broken `btn--` item): keep its 48px box
    const placeholder = el('li', 'social-placeholder');
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.append(el('span', 'btn btn-icon no-background'));
    list.append(placeholder);
    band.append(list);
  }
  footer.append(band);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM: one authored section per band, in live order
  block.textContent = '';
  // the block itself is the source .footer box; the business-customer note sits OUTSIDE it on live
  const footer = block;
  footer.append(buildShareBar());
  const sections = [...fragment.children];
  const [links, social, copyright, note] = sections;
  if (links) slotLinks(links, footer);
  if (social) slotSocial(social, footer);
  if (copyright) {
    const p = copyright.querySelector('p') || copyright;
    p.classList.add('footer-copyright');
    footer.append(p);
  }
  if (note) {
    const p = note.querySelector('p') || note;
    p.classList.add('footer-a11y-note');
    block.after(p);
  }
}
