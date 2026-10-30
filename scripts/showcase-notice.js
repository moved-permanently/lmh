/**
 * Showcase notice: a modal telling visitors that this replica is a technical showcase, not an
 * official Linde Material Handling website. Same behaviour as the Manulife IM replica
 * (cloudadoption/manulifeim scripts/showcase-notice.js), which ports the Lufthansa one
 * (moved-permanently/lh-com scripts/showcase-notice.js).
 *
 * - Loaded from loadDelayed() (scripts/scripts.js), about 3.5 s after load: no LCP impact.
 * - Nothing to wait for: lmh has no attestation prompt, and its consent check
 *   (scripts/consent-check.js) is a dummy without a visible banner.
 * - Native <dialog> opened with showModal(). Escape does not close it (the cancel event is
 *   prevented, closedby="none" where supported, and a close without the button reopens it);
 *   only the "I understand" button does.
 * - The button stores the acknowledgement in localStorage 'lmh-showcase-acknowledged': the
 *   notice shows once per browser for every page. Without storage the button still closes it
 *   for the current page view.
 * - Never shown inside iframes (DA preview, Experience Workspace) or under /tools/.
 * - aem.js is imported on demand, so noticeApplies() can be tested under node.
 */
export const STORAGE_KEY = 'lmh-showcase-acknowledged';

const TEXT = {
  title: 'Technical showcase',
  text: 'This page is a technical showcase, not an official Linde Material Handling website. It is for demonstration purposes only.',
  button: 'I understand',
};

let shown = false;

function isAcknowledged() {
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return false;
  }
}

function acknowledge() {
  try {
    window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch (e) {
    // storage blocked: the notice closes for this page view only
  }
}

/**
 * Whether the notice applies to a page view.
 * @param {{ framed: boolean, pathname: string, acknowledged: boolean }} view
 * @returns {boolean}
 */
export function noticeApplies({ framed, pathname, acknowledged }) {
  if (framed) return false;
  if (pathname.startsWith('/tools/')) return false;
  return !acknowledged;
}

function buildDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'showcase-notice';
  dialog.lang = 'en';
  dialog.setAttribute('aria-labelledby', 'showcase-notice-title');
  dialog.setAttribute('aria-describedby', 'showcase-notice-text');
  dialog.setAttribute('closedby', 'none');

  const title = document.createElement('h2');
  title.id = 'showcase-notice-title';
  title.className = 'showcase-notice-title';
  title.textContent = TEXT.title;

  const text = document.createElement('p');
  text.id = 'showcase-notice-text';
  text.className = 'showcase-notice-text';
  text.textContent = TEXT.text;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button primary showcase-notice-button';
  button.textContent = TEXT.button;

  dialog.append(title, text, button);
  return { dialog, button };
}

/**
 * Shows the notice once per page view, unless acknowledged or not applicable.
 */
export default async function showShowcaseNotice() {
  if (shown) return;
  const applies = noticeApplies({
    framed: window.self !== window.top,
    pathname: window.location.pathname,
    acknowledged: isAcknowledged(),
  });
  if (!applies) return;
  shown = true;
  const { loadCSS } = await import('./aem.js');
  await loadCSS(`${window.hlx.codeBasePath}/styles/showcase-notice.css`);

  const { dialog, button } = buildDialog();
  let confirmed = false;
  // Escape (and any other close request) must not dismiss the notice
  dialog.addEventListener('cancel', (e) => e.preventDefault());
  dialog.addEventListener('close', () => {
    // browsers may skip a cancelable cancel event (no user activation): reopen
    if (!confirmed && dialog.isConnected) dialog.showModal();
  });
  button.addEventListener('click', () => {
    confirmed = true;
    acknowledge();
    dialog.close();
    dialog.remove();
    document.documentElement.classList.remove('showcase-notice-open');
  });

  document.body.append(dialog);
  document.documentElement.classList.add('showcase-notice-open');
  dialog.showModal();
}
