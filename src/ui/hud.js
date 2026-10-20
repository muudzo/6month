import { el, icon } from './dom.js';

const TOAST_MS = 3800;

/**
 * Heads-up display: where you are, what you've found, and the few controls.
 * @param {{ hud: HTMLElement, prompt: HTMLElement, toast: HTMLElement }} roots
 * @param {{ museumName: string, soundOn: boolean, onMap: () => void, onSound: (on: boolean) => void }} options
 */
export function createHud(roots, { museumName, soundOn, onMap, onSound }) {
  const room = el('p', { class: 'hud__room', text: '' });
  const seen = el('span', { class: 'tally-value', text: '0/0' });
  const hearts = el('span', { class: 'tally-value', text: '0/6' });
  const heartTally = el('span', { class: 'tally tally--hearts', title: 'Hidden hearts found' }, [
    icon('heart', { filled: true }),
    el('span', { class: 'visually-hidden', text: 'Hidden hearts found:' }),
    hearts,
  ]);
  const seenTally = el('span', { class: 'tally', title: 'Exhibits viewed' }, [
    icon('eye'),
    el('span', { class: 'visually-hidden', text: 'Exhibits viewed:' }),
    seen,
  ]);

  const soundButton = el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Music', 'aria-pressed': String(soundOn) }, [
    icon(soundOn ? 'soundOn' : 'soundOff'),
  ]);
  soundButton.addEventListener('click', () => {
    const on = soundButton.getAttribute('aria-pressed') !== 'true';
    soundButton.setAttribute('aria-pressed', String(on));
    soundButton.replaceChildren(icon(on ? 'soundOn' : 'soundOff'));
    onSound(on);
  });

  const mapButton = el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Floor plan and exhibit list', onclick: onMap }, [icon('map')]);
  const actions = [mapButton, soundButton];
  if (document.documentElement.requestFullscreen) {
    actions.push(
      el('button', {
        class: 'icon-btn',
        type: 'button',
        'aria-label': 'Full screen',
        onclick: () => {
          const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
          request?.catch?.(() => {});
        },
      }, [icon('expand')]),
    );
  }

  roots.hud.replaceChildren(
    el('div', { class: 'hud__place' }, [
      el('p', { class: 'eyebrow', text: museumName }),
      room,
      el('div', { class: 'hud__tally' }, [seenTally, heartTally]),
    ]),
    el('nav', { class: 'hud__actions', 'aria-label': 'Museum controls' }, actions),
  );

  let toastTimer = null;
  let currentRoom = '';
  let currentPrompt = '';

  return {
    show: () => {
      roots.hud.hidden = false;
    },
    setRoom: (name) => {
      if (!name || name === currentRoom) return;
      currentRoom = name;
      room.classList.add('is-changing');
      window.setTimeout(() => {
        room.textContent = name;
        room.classList.remove('is-changing');
      }, 200);
    },
    setTally: ({ seenCount, total, heartCount, heartTotal }) => {
      seen.textContent = `${seenCount}/${total}`;
      hearts.textContent = `${heartCount}/${heartTotal}`;
    },
    bumpHearts: () => {
      heartTally.classList.remove('is-bumped');
      void heartTally.offsetWidth;
      heartTally.classList.add('is-bumped');
    },
    setPrompt: (text) => {
      if (text === currentPrompt) return;
      currentPrompt = text;
      roots.prompt.textContent = text;
      roots.prompt.hidden = !text;
    },
    toast: (message) => {
      roots.toast.textContent = message;
      roots.toast.hidden = false;
      requestAnimationFrame(() => roots.toast.classList.add('is-visible'));
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        roots.toast.classList.remove('is-visible');
        window.setTimeout(() => {
          roots.toast.hidden = true;
        }, 400);
      }, TOAST_MS);
    },
  };
}
