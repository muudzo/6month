import { el, icon } from './dom.js';

const ROOM_LABELS = { photo: 'Gallery I', masterpiece: 'Masterpiece' };

const eyebrowFor = (item) =>
  item.data.eyebrow ?? `No. ${String(item.data.number).padStart(2, '0')} · ${ROOM_LABELS[item.kind] ?? ''}`;

const restoration = (item) => {
  const slider = el('input', {
    id: `restore-${item.id}`,
    type: 'range',
    min: '0',
    max: '100',
    value: '0',
    'aria-describedby': `restore-help-${item.id}`,
  });
  slider.addEventListener('input', () => item.setReveal(Number(slider.value) / 100));
  return el('div', { class: 'restore' }, [
    el('label', { class: 'restore__label', for: slider.id, text: 'Restoration view' }),
    el('p', { class: 'restore__help', id: `restore-help-${item.id}`, text: 'Slide to reveal the photograph underneath the paint.' }),
    slider,
    el('div', { class: 'restore__ends', 'aria-hidden': 'true' }, [el('span', { text: 'Painting' }), el('span', { text: 'Photograph' })]),
  ]);
};

/**
 * The ivory exhibit card. Non-modal: the artwork stays visible beside it.
 * @param {HTMLElement} root
 * @param {{ herName: string, yourName: string }} museum
 */
export function createPlacard(root, museum) {
  let current = null;
  let returnFocus = null;

  const close = () => {
    if (!current) return;
    current.setReveal?.(0);
    current = null;
    root.classList.remove('is-open');
    window.setTimeout(() => {
      if (!current) root.hidden = true;
    }, 500);
    returnFocus?.focus?.({ preventScroll: true });
  };

  /**
   * @param {import('../world/types.js').Interactable} item
   * @param {{ position?: number, total?: number, onPrev?: () => void, onNext?: () => void, onClose: () => void }} nav
   */
  const open = (item, { position, total, onPrev, onNext, onClose }) => {
    current?.setReveal?.(0);
    if (!current) returnFocus = document.activeElement;
    current = item;
    const { data } = item;
    const isArt = item.kind === 'photo' || item.kind === 'masterpiece';
    const artist = data.artist ?? `${museum.yourName} & ${museum.herName}`;
    const byline = isArt ? `${artist}${data.date ? `, ${data.date}` : ''}` : null;
    const title = el('h2', { class: 'placard__title', id: 'placard-title', tabindex: '-1', text: data.title });

    const content = el('div', { class: 'placard__scroll' }, [
      el('p', { class: 'placard__eyebrow', text: eyebrowFor(item) }),
      title,
      byline && el('p', { class: 'placard__byline', text: byline }),
      data.medium && el('p', { class: 'placard__medium', text: data.medium }),
      el('hr', { class: 'placard__rule' }),
      data.note && el('p', { class: 'placard__note', text: data.note }),
      item.isPlaceholder && el('p', { class: 'placard__missing', text: `Waiting for its photograph: add public/${data.src}` }),
      item.kind === 'masterpiece' && restoration(item),
    ]);

    const closeButton = el('button', { class: 'icon-btn placard__close', type: 'button', 'aria-label': 'Close and keep wandering', onclick: onClose }, [icon('close')]);
    const nav = onPrev && onNext
      ? el('nav', { class: 'placard__nav', 'aria-label': `Exhibit ${position} of ${total}` }, [
          el('button', { class: 'btn btn--line', type: 'button', onclick: onPrev }, [icon('prev'), 'Previous']),
          el('button', { class: 'btn btn--gold', type: 'button', onclick: onNext }, ['Next', icon('next')]),
        ])
      : null;

    root.setAttribute('aria-label', `About ${data.title}`);
    root.replaceChildren(content, closeButton, ...(nav ? [nav] : []));
    root.hidden = false;
    requestAnimationFrame(() => {
      root.classList.add('is-open');
      title.focus({ preventScroll: true });
    });
  };

  return {
    open,
    close,
    get isOpen() {
      return current !== null;
    },
    get current() {
      return current;
    },
    /** Width and height of the card on screen, so the camera can make room for it. */
    footprint: () => {
      if (!current) return { right: 0, bottom: 0 };
      const isSheet = window.matchMedia('(max-width: 760px)').matches;
      const rect = root.getBoundingClientRect();
      return isSheet ? { right: 0, bottom: rect.height } : { right: rect.width + 24, bottom: 0 };
    },
  };
}
