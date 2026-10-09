/**
 * wizard — the source `.wizard` slide deck ("Energy Quick Check", Solutions/Energy-Systems):
 * ONE row per slide, cells [picture] [headings, paragraphs, button labels as <strong> paragraphs].
 * Decode tier: reconstructive (repeat group), node-slotting (EW1–EW3): the authored cells move
 * into slide wrappers. Capture state: the intro slide is visible, the others hidden. Motion kept
 * minimal: a label click shows the next slide ("Back" the previous one); the source's answer
 * scoring is JS-driven and not reproduced (deviation recorded on the sidecar). Question slides
 * carry the source's .wizard-progress row (one 6 px dot per slide, the passed ones marked done).
 * @param {Element} block
 */
export default function decorate(block) {
  const slides = [...block.children];
  const show = (i) => slides.forEach((s, j) => s.classList.toggle('wizard-active', i === j));
  slides.forEach((row, i) => {
    row.classList.add('wizard-slide');
    const [media, text] = [...row.children];
    if (media) media.classList.add('wizard-media');
    if (text) {
      text.classList.add('wizard-text');
      if (i > 0) {
        const progress = document.createElement('div');
        progress.className = 'wizard-progress';
        progress.setAttribute('aria-hidden', 'true');
        slides.forEach((_, j) => {
          const dot = document.createElement('span');
          if (j < i) dot.classList.add('done');
          progress.append(dot);
        });
        text.prepend(progress);
      }
      [...text.querySelectorAll('p > strong')].forEach((strong) => {
        const p = strong.parentElement;
        const label = strong.textContent.trim();
        const back = /^back$/i.test(label);
        if (back) p.classList.add('wizard-back');
        if (i === 0) p.classList.add('wizard-primary');
        if (i === slides.length - 1 && !back) return;
        strong.setAttribute('role', 'button');
        strong.setAttribute('tabindex', '0');
        const go = () => show(Math.min(Math.max(back ? i - 1 : i + 1, 0), slides.length - 1));
        strong.addEventListener('click', go);
        strong.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
    }
  });
  show(0);
}
