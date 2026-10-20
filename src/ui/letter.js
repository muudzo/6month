import { el, icon, prefersReducedMotion } from './dom.js';

/** What the reluctant "no" button says each time it is tried. The last one gives in. */
const CHANGES_OF_HEART = ['Are you sure?', 'Really sure?', 'The curator is crying', 'Think of the art', 'Fine, renew it'];

const dodge = (button, area) => {
  if (prefersReducedMotion()) return;
  const bounds = area.getBoundingClientRect();
  const size = button.getBoundingClientRect();
  const maxX = Math.max(0, (bounds.width - size.width) / 2);
  const maxY = Math.max(0, bounds.height - size.height - 8);
  const x = (Math.random() * 2 - 1) * maxX;
  const y = Math.random() * maxY * (Math.random() > 0.5 ? 1 : -0.4);
  button.style.transform = `translate(${x}px, ${y}px) rotate(${(Math.random() - 0.5) * 10}deg)`;
};

const renewal = (museum, { alreadyRenewed, onRenew }) => {
  const thanks = el('p', { class: 'renewal__thanks', role: 'status', text: museum.renewal.thanks });
  if (alreadyRenewed) {
    return el('section', { class: 'renewal', 'aria-label': 'Membership' }, [el('p', { class: 'renewal__question', text: 'Membership status: renewed.' }), thanks]);
  }
  const actions = el('div', { class: 'renewal__actions' });
  const section = el('section', { class: 'renewal', 'aria-label': 'Membership renewal' }, [
    el('p', { class: 'renewal__question', text: museum.renewal.question }),
    actions,
  ]);
  const renew = () => {
    section.replaceChildren(el('p', { class: 'renewal__question', text: 'Membership status: renewed.' }), thanks);
    onRenew();
  };
  let attempts = 0;
  const yes = el('button', { class: 'btn btn--gold', type: 'button', 'data-autofocus': true, onclick: renew, text: museum.renewal.yes });
  const no = el('button', { class: 'btn btn--line renewal__no', type: 'button', text: museum.renewal.no });
  const hasGivenIn = () => attempts >= CHANGES_OF_HEART.length;
  const reconsider = () => {
    no.textContent = CHANGES_OF_HEART[attempts];
    attempts += 1;
    if (hasGivenIn()) no.style.transform = 'none';
    else dodge(no, actions);
  };
  no.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' && attempts < CHANGES_OF_HEART.length - 1) reconsider();
  });
  no.addEventListener('click', () => (hasGivenIn() ? renew() : reconsider()));
  actions.append(yes, no);
  return section;
};

/**
 * The sealed letter from the end of the Future Wing.
 * @param {Record<string, any>} museum prepared config
 * @param {{ alreadyRenewed: boolean, onRenew: () => void }} options
 * @returns {Node[]}
 */
export function letterContent(museum, options) {
  const { greeting, paragraphs, signoff } = museum.finalLetter;
  return [
    el('div', { class: 'seal', 'aria-hidden': 'true' }, [icon('heart', { filled: true })]),
    el('h2', { class: 'letter__greeting', text: greeting }),
    el('div', { class: 'letter__body' }, paragraphs.map((text) => el('p', { text }))),
    el('p', { class: 'letter__signoff', text: signoff }),
    renewal(museum, options),
  ];
}
