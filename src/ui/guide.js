import { el, icon } from './dom.js';

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

/** Two letters for the cameo when there is no portrait photo, skipping a leading "The". */
const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter((word) => word && !/^the$/i.test(word))
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const portraitFor = (guide) => {
  const monogram = el('span', { class: 'guide__monogram', text: initialsOf(guide.name) });
  if (!guide.portrait) return monogram;
  const photo = el('img', { class: 'guide__photo', src: assetUrl(guide.portrait), alt: '', width: 96, height: 116, decoding: 'async' });
  photo.addEventListener('error', () => photo.replaceWith(monogram), { once: true });
  return photo;
};

/** Each word gets its index so CSS can let the line arrive a word at a time. */
const sayLine = (target, text) => {
  const words = text.split(/\s+/).filter(Boolean).map((word, i) => {
    const span = el('span', { class: 'guide__word', text: word });
    span.style.setProperty('--i', String(i));
    return span;
  });
  target.replaceChildren(...words.flatMap((span, i) => (i === 0 ? [span] : [' ', span])));
};

/**
 * The tour guide's welcome speech in the lobby, one line at a time.
 * @param {{ name?: string, role?: string, portrait?: string, speech: string[] }} guide prepared config
 * @param {{ onBegin: () => void, onWander: () => void }} options
 * @returns {Node[]}
 */
export function guideContent(guide, { onBegin, onWander }) {
  const { speech } = guide;
  let index = 0;
  const line = el('p', { class: 'guide__line', 'aria-live': 'polite' });
  const dots = speech.map(() => el('span', { class: 'guide__dot' }));
  const actions = el('div', { class: 'guide__actions' });

  const show = () => {
    sayLine(line, speech[index]);
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-past', i < index);
      dot.classList.toggle('is-current', i === index);
    });
    const isLast = index === speech.length - 1;
    const primary = isLast
      ? el('button', { class: 'btn btn--gold', type: 'button', 'data-autofocus': true, onclick: onBegin }, ['Begin the tour', icon('next')])
      : el('button', { class: 'btn btn--gold', type: 'button', 'data-autofocus': true, onclick: advance }, ['Continue', icon('next')]);
    const wander = isLast && el('button', { class: 'btn btn--line', type: 'button', onclick: onWander, text: 'I’ll explore on my own' });
    actions.replaceChildren(...[wander, primary].filter(Boolean));
    if (index > 0) primary.focus({ preventScroll: true });
  };

  function advance() {
    index = Math.min(index + 1, speech.length - 1);
    show();
  }

  show();
  return [
    el('div', { class: 'guide__head' }, [
      el('div', { class: 'guide__portrait', 'aria-hidden': 'true' }, [portraitFor(guide)]),
      el('div', {}, [
        el('p', { class: 'eyebrow guide__role', text: guide.role ?? 'Your guide this evening' }),
        guide.name && el('h2', { class: 'guide__name', text: guide.name }),
      ]),
    ]),
    line,
    el('div', { class: 'guide__footer' }, [el('div', { class: 'guide__dots', 'aria-hidden': 'true' }, dots), actions]),
  ];
}
