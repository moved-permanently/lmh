/**
 * Breadcrumb (source .subheader__breadcrumb, desktop only): the authored list items are moved into
 * the source's breadcrumb row; every crumb carries the right-arrow glyph, the last one is `active`.
 * @param {Element} block The breadcrumb block element
 */
export default function decorate(block) {
  const items = [...block.querySelectorAll('li')];
  const authored = items.length ? items : [...block.querySelectorAll(':scope > div > div')];
  const wrapper = document.createElement('div');
  wrapper.className = 'breadcrumb-wrapper';
  const main = document.createElement('div');
  main.className = 'breadcrumb-main';
  // the authored <ul> is moved, never rebuilt (EW1)
  const list = block.querySelector('ul') || document.createElement('ul');
  list.className = 'breadcrumb-list';
  authored.forEach((item, i) => {
    const li = item.tagName === 'LI' ? item : document.createElement('li');
    let a = item.querySelector('a');
    if (a && a.parentElement !== li) a.parentElement.replaceWith(a);
    if (!a) {
      a = document.createElement('a');
      while (item.firstChild) a.append(item.firstChild);
      li.append(a);
    }
    if (i === authored.length - 1) a.classList.add('active');
    const icon = document.createElement('i');
    icon.className = 'icon icon-right';
    icon.setAttribute('aria-hidden', 'true');
    a.prepend(icon);
    list.append(li);
  });
  main.append(list);
  wrapper.append(main);
  const contacts = document.createElement('div');
  contacts.className = 'breadcrumb-contacts';
  wrapper.append(contacts);
  block.textContent = '';
  block.append(wrapper);
}
