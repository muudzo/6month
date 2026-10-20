import { DOORS, ROOMS } from '../lib/layout.js';
import { el, isCoarsePointer, svg } from './dom.js';

/** The map is drawn sideways: entrance on the left, deepest room on the right. */
const toMap = (x, z) => ({ mx: -z, my: x });
const PLAZA_CROP = 22;
const SHORT_NAMES = { plaza: 'Steps', lobby: 'Lobby', gallery: 'Gallery I', salon: 'Salon', future: 'Future Wing' };

const roomShapes = () =>
  ROOMS.flatMap((room) => {
    const z1 = room.id === 'plaza' ? Math.min(room.z1, PLAZA_CROP) : room.z1;
    const { mx, my } = toMap(room.x0, z1);
    const width = z1 - room.z0;
    const height = room.x1 - room.x0;
    return [
      svg('rect', { class: 'plan__room', x: mx, y: my, width, height, rx: 0.3 }),
      svg('text', { class: 'plan__room-label', x: mx + width / 2, y: my - 0.8, 'text-anchor': 'middle' }, [document.createTextNode(SHORT_NAMES[room.id])]),
    ];
  });

const doorShapes = () =>
  DOORS.map((door) => {
    const { mx, my } = toMap(door.x - door.width / 2, door.z1);
    return svg('rect', { class: 'plan__room', x: mx - 0.05, y: my, width: door.z1 - door.z0 + 0.1, height: door.width, 'stroke-width': 0 });
  });

const helpText = () =>
  isCoarsePointer()
    ? ['Drag anywhere to look around. Use the stick to walk. Tap a picture to read its story.']
    : ['Drag to look around. Walk with ', el('kbd', { text: 'W A S D' }), ' or the arrow keys, hold ', el('kbd', { text: 'Shift' }), ' to hurry. Click a picture to read its story.'];

/**
 * Floor plan with every exhibit, where you are, and how to get around.
 * @param {{ tour: Array<import('../world/types.js').Interactable>, seen: string[], pose: { x: number, z: number }, onGo: (item: any) => void }} options
 * @returns {Node[]}
 */
export function planContent({ tour, seen, pose, onGo }) {
  const seenSet = new Set(seen);
  const dots = tour.map((item) => {
    const { position, normal } = item.slot;
    const { mx, my } = toMap(position.x + normal.x * 1.1, position.z + normal.z * 1.1);
    const label = `No. ${item.data.number}: ${item.data.title}`;
    const dot = svg('circle', {
      class: `plan__dot${seenSet.has(item.id) ? ' is-seen' : ''}`,
      cx: mx,
      cy: my,
      r: 0.62,
      tabindex: 0,
      role: 'button',
      'aria-label': label,
    }, [svg('title', {}, [document.createTextNode(label)])]);
    dot.addEventListener('click', () => onGo(item));
    dot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onGo(item);
      }
    });
    return dot;
  });
  const you = toMap(pose.x, pose.z);
  const map = svg('svg', { class: 'plan__map', viewBox: '-23 -14 104 28', role: 'img', 'aria-label': 'Floor plan of the museum' }, [
    ...roomShapes(),
    ...doorShapes(),
    ...dots,
    svg('circle', { class: 'plan__you', cx: you.mx, cy: you.my, r: 0.75 }, [svg('title', {}, [document.createTextNode('You are here')])]),
  ]);

  const list = el('ol', { class: 'plan__list' }, tour.map((item) =>
    el('li', {}, [
      el('button', { class: 'plan__item', type: 'button', onclick: () => onGo(item) }, [
        el('span', { class: 'plan__number', text: String(item.data.number).padStart(2, '0') }),
        el('span', { class: 'plan__name', text: item.data.title }),
        el('span', { class: 'plan__seen', text: seenSet.has(item.id) ? 'Seen' : '' }),
      ]),
    ]),
  ));

  return [
    el('p', { class: 'eyebrow', text: 'Floor plan' }),
    el('h2', { class: 'plan__title', text: 'Where would you like to go?' }),
    el('div', { class: 'plan__layout' }, [map, list]),
    el('p', { class: 'plan__help' }, helpText()),
  ];
}
