import { el, prefersReducedMotion } from './dom.js';

const TEAR_DISTANCE_PX = 70;
const DECELERATION = 0.998;
const VELOCITY_WINDOW_MS = 90;

/** Where a flick would come to rest (Apple's scroll-deceleration projection). */
const project = (velocityPxPerS) => ((velocityPxPerS / 1000) * DECELERATION) / (1 - DECELERATION);

/** Soft resistance when pulling the stub the wrong way. */
const rubberband = (overshoot, dimension = 120, constant = 0.55) =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));

const buildTicket = (museum) => {
  const { dedication } = museum.ticket;
  const details = [
    ['Guest of honour', museum.herName],
    ['Ticket', museum.ticket.ticketClass],
    ['Validity', museum.ticket.validity],
    ...(dedication ? [] : [['Curated by', museum.yourName]]),
  ];
  const stub = el('button', { class: 'ticket__stub', type: 'button', 'aria-label': 'Tear off the stub to enter the museum' }, [
    el('span', { class: 'ticket__admit', text: museum.ticket.admit }),
    el('span', { class: 'ticket__serial', text: 'No. 000001' }),
    el('span', { class: 'ticket__tear' }, ['Tear to enter', el('span', { class: 'ticket__arrow', 'aria-hidden': 'true', text: '→' })]),
  ]);
  const ticket = el('div', { class: 'ticket' }, [
    el('div', { class: 'ticket__main' }, [
      el('p', { class: 'ticket__eyebrow', text: 'Admission · After hours' }),
      el('h1', { class: 'ticket__title', id: 'ticket-title', text: museum.museumName }),
      el('p', { class: 'ticket__subtitle', text: museum.exhibitionTitle }),
      dedication && el('p', { class: 'ticket__dedication', text: dedication }),
      el('dl', { class: 'ticket__details' }, details.map(([term, value]) => el('div', {}, [el('dt', { text: term }), el('dd', { text: value })]))),
    ]),
    stub,
  ]);
  return { ticket, stub };
};

/**
 * Show the admission ticket; resolves once the stub has been torn off.
 * @param {HTMLElement} root
 * @param {Record<string, any>} museum
 * @param {{ onTear: () => void }} hooks called inside the tearing gesture (audio may start there)
 * @returns {Promise<void>}
 */
export function showTicket(root, museum, { onTear }) {
  const { ticket, stub } = buildTicket(museum);
  const isVertical = () => window.matchMedia('(max-width: 560px)').matches;
  const hint = el('p', {
    class: 'entrance__hint',
    text: isVertical() ? 'Pull the stub down to step inside.' : 'Tear off the stub to step inside.',
  });
  root.replaceChildren(el('div', { class: 'entrance__inner' }, [ticket, hint]));
  root.hidden = false;

  return new Promise((resolve) => {
    let drag = null;
    let torn = false;

    const setStub = (offset, { animate = false, rotate = 0, fade = 1 } = {}) => {
      const axis = isVertical() ? `translateY(${offset}px)` : `translateX(${offset}px)`;
      stub.style.transition = animate ? 'transform 650ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms ease' : 'none';
      stub.style.transform = `${axis} rotate(${rotate}deg)`;
      stub.style.opacity = String(fade);
    };

    const tear = (velocity = 900) => {
      if (torn) return;
      torn = true;
      onTear();
      const reduced = prefersReducedMotion();
      setStub(reduced ? 0 : Math.max(420, velocity * 0.45), { animate: true, rotate: reduced ? 0 : 14, fade: 0 });
      ticket.classList.add('is-torn');
      window.setTimeout(() => root.classList.add('is-leaving'), reduced ? 50 : 450);
      window.setTimeout(() => {
        root.hidden = true;
        resolve();
      }, reduced ? 400 : 1200);
    };

    stub.addEventListener('pointerdown', (event) => {
      if (torn) return;
      stub.setPointerCapture(event.pointerId);
      const start = isVertical() ? event.clientY : event.clientX;
      drag = { id: event.pointerId, start, offset: 0, samples: [{ t: performance.now(), p: start }] };
    });

    stub.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const position = isVertical() ? event.clientY : event.clientX;
      const raw = position - drag.start;
      const offset = raw < 0 ? rubberband(raw) : raw;
      const now = performance.now();
      drag = { ...drag, offset, samples: [...drag.samples.filter((s) => now - s.t < VELOCITY_WINDOW_MS), { t: now, p: position }] };
      setStub(offset, { rotate: Math.max(0, offset) * 0.04 });
    });

    const release = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const first = drag.samples[0];
      const last = drag.samples[drag.samples.length - 1];
      const velocity = last.t > first.t ? ((last.p - first.p) / (last.t - first.t)) * 1000 : 0;
      const landing = drag.offset + project(velocity);
      const wasDragged = Math.abs(drag.offset) > 6;
      drag = null;
      if (landing > TEAR_DISTANCE_PX || !wasDragged) tear(Math.max(velocity, 900));
      else setStub(0, { animate: true });
    };
    stub.addEventListener('pointerup', release);
    stub.addEventListener('pointercancel', (event) => {
      if (drag && event.pointerId === drag.id) {
        drag = null;
        setStub(0, { animate: true });
      }
    });
    stub.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        tear();
      }
    });
    stub.focus({ preventScroll: true });
  });
}
