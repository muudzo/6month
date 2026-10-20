/**
 * The museum floor plan, in metres. +y is up, the visitor walks towards -z.
 *
 *   plaza (front steps) → lobby → gallery I → masterpiece salon → future wing
 *
 * Rooms are separated by 0.6 m walls; doors are the gaps that join them.
 */

export const PLAYER_RADIUS = 0.35;
export const EYE_HEIGHT = 1.65;

/** Portico level is y = 0; the steps drop to the plaza in front of it. */
const PORTICO_EDGE_Z = 17.4;
const PLAZA_EDGE_Z = 19.8;
export const PLAZA_LEVEL = -0.6;

export const ROOMS = Object.freeze([
  { id: 'plaza', name: 'The Front Steps', x0: -11, x1: 11, z0: 14.6, z1: 34, height: 0 },
  { id: 'lobby', name: 'The Grand Lobby', x0: -9, x1: 9, z0: 0, z1: 14, height: 8 },
  { id: 'gallery', name: 'Gallery I · The First Six Months', x0: -5.5, x1: 5.5, z0: -38, z1: -0.6, height: 6.2 },
  { id: 'salon', name: 'The Masterpiece Salon', x0: -12, x1: 12, z0: -64, z1: -38.6, height: 11 },
  { id: 'future', name: 'The Future Wing', x0: -5, x1: 5, z0: -80, z1: -64.6, height: 5.5 },
]);

export const DOORS = Object.freeze([
  { id: 'entrance', from: 'plaza', to: 'lobby', x: 0, z0: 14, z1: 14.6, width: 3.2, height: 5.2 },
  { id: 'lobby-gallery', from: 'lobby', to: 'gallery', x: 0, z0: -0.6, z1: 0, width: 3.6, height: 4.6 },
  { id: 'gallery-salon', from: 'gallery', to: 'salon', x: 0, z0: -38.6, z1: -38, width: 4.4, height: 4.6 },
  { id: 'salon-future', from: 'salon', to: 'future', x: 0, z0: -64.6, z1: -64, width: 3.2, height: 4.4 },
]);

const rect = (id, x0, x1, z0, z1) => ({ id, x0, x1, z0, z1 });
const square = (id, x, z, half) => rect(id, x - half, x + half, z - half, z + half);

export const LOBBY_COLUMNS = Object.freeze([
  { x: -7.3, z: 3.5 }, { x: 7.3, z: 3.5 }, { x: -7.3, z: 10.5 }, { x: 7.3, z: 10.5 },
]);
export const PORTICO_COLUMNS = Object.freeze(
  [-9.6, -6, -2.4, 2.4, 6, 9.6].map((x) => ({ x, z: 16.6 })),
);
export const BENCHES = Object.freeze([{ x: 0, z: -12.5 }, { x: 0, z: -26 }]);
export const SCULPTURE = Object.freeze({ x: 0, z: 7 });
export const FINALE = Object.freeze({ x: 0, z: -76 });
export const CENTERPIECE_WALL = Object.freeze({ x0: -4.5, x1: 4.5, z0: -54.3, z1: -53.7, height: 6.5 });

export const OBSTACLES = Object.freeze([
  ...LOBBY_COLUMNS.map((c, i) => square(`lobby-column-${i}`, c.x, c.z, 0.55)),
  ...PORTICO_COLUMNS.map((c, i) => square(`portico-column-${i}`, c.x, c.z, 0.45)),
  ...BENCHES.map((b, i) => rect(`bench-${i}`, b.x - 1, b.x + 1, b.z - 0.3, b.z + 0.3)),
  square('sculpture', SCULPTURE.x, SCULPTURE.z, 0.75),
  rect('centerpiece', -4.8, 4.8, -54.6, -50.6),
  rect('masterpiece-left', -12, -10.2, -53, -47),
  rect('masterpiece-right', 10.2, 12, -53, -47),
  square('finale', FINALE.x, FINALE.z, 0.6),
]);

/** Six hidden hearts, one for every month. */
export const HEARTS = Object.freeze([
  { id: 'month-1', x: 8.6, y: -0.3, z: 22 },
  { id: 'month-2', x: -8.3, y: 0.35, z: 12.8 },
  { id: 'month-3', x: 1.2, y: 0.28, z: -26 },
  { id: 'month-4', x: -5.0, y: 0.3, z: -37.5 },
  { id: 'month-5', x: 0, y: 1.4, z: -54.75 },
  { id: 'month-6', x: 4.4, y: 0.3, z: -79.4 },
]);

const buildWalkRects = (radius) => [
  ...ROOMS.map((room) => rect(room.id, room.x0 + radius, room.x1 - radius, room.z0 + radius, room.z1 - radius)),
  ...DOORS.map((door) =>
    rect(door.id, door.x - door.width / 2 + radius, door.x + door.width / 2 - radius, door.z0 - radius - 0.05, door.z1 + radius + 0.05),
  ),
];

const WALK_RECTS = Object.freeze(buildWalkRects(PLAYER_RADIUS));

const inside = (r, x, z, pad = 0) => x > r.x0 - pad && x < r.x1 + pad && z > r.z0 - pad && z < r.z1 + pad;

/**
 * @param {number} x
 * @param {number} z
 * @returns {boolean}
 */
export function isWalkable(x, z) {
  const onFloor = WALK_RECTS.some((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
  return onFloor && !OBSTACLES.some((o) => inside(o, x, z, PLAYER_RADIUS));
}

/**
 * Move by (dx, dz), sliding along whatever blocks the way.
 * @param {{ x: number, z: number }} position
 * @param {number} dx
 * @param {number} dz
 * @returns {{ x: number, z: number }}
 */
export function moveWithCollision(position, dx, dz) {
  const candidates = [
    { x: position.x + dx, z: position.z + dz },
    { x: position.x + dx, z: position.z },
    { x: position.x, z: position.z + dz },
  ];
  return candidates.find((c) => isWalkable(c.x, c.z)) ?? { x: position.x, z: position.z };
}

/**
 * @param {number} x
 * @param {number} z
 * @returns {(typeof ROOMS)[number] | null}
 */
export function roomAt(x, z) {
  const room = ROOMS.find((r) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1);
  if (room) return room;
  const door = DOORS.find((d) => Math.abs(x - d.x) <= d.width / 2 && z >= d.z0 && z <= d.z1);
  return door ? ROOMS.find((r) => r.id === door.to) : null;
}

/**
 * Floor height under the visitor (the front steps are the only change in level).
 * @param {number} z
 * @returns {number}
 */
export function floorHeightAt(z) {
  if (z <= PORTICO_EDGE_Z) return 0;
  if (z >= PLAZA_EDGE_Z) return PLAZA_LEVEL;
  return ((z - PORTICO_EDGE_Z) / (PLAZA_EDGE_Z - PORTICO_EDGE_Z)) * PLAZA_LEVEL;
}

export const STEPS = Object.freeze({ top: PORTICO_EDGE_Z, bottom: PLAZA_EDGE_Z, count: 4 });

const GALLERY_CAPACITY = 12;
const WALL_OFFSET = 0.06;

/**
 * Hanging positions in Gallery I, alternating left/right as you walk in.
 * @param {number} count
 */
export function gallerySlots(count) {
  if (count > GALLERY_CAPACITY) throw new Error(`Gallery I holds at most ${GALLERY_CAPACITY} photos`);
  const room = ROOMS.find((r) => r.id === 'gallery');
  const first = -3.6;
  const last = -34.6;
  const step = count > 1 ? (first - last) / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) => {
    const isLeft = i % 2 === 0;
    return {
      position: { x: isLeft ? room.x0 + WALL_OFFSET : room.x1 - WALL_OFFSET, y: 1.65, z: first - i * step },
      normal: { x: isLeft ? 1 : -1, z: 0 },
      rotationY: isLeft ? Math.PI / 2 : -Math.PI / 2,
      maxWidth: 1.7,
      maxHeight: 1.45,
    };
  });
}

const MASTERPIECE_SLOTS = Object.freeze([
  { position: { x: 0, y: 3.1, z: CENTERPIECE_WALL.z1 + WALL_OFFSET }, normal: { x: 0, z: 1 }, rotationY: 0, maxWidth: 2.8, maxHeight: 3.3 },
  { position: { x: -12 + 0.1, y: 3.7, z: -50 }, normal: { x: 1, z: 0 }, rotationY: Math.PI / 2, maxWidth: 3.4, maxHeight: 4 },
  { position: { x: 12 - 0.1, y: 3.7, z: -50 }, normal: { x: -1, z: 0 }, rotationY: -Math.PI / 2, maxWidth: 3.4, maxHeight: 4 },
]);

/**
 * Hanging positions in the salon: the centrepiece first, then left and right walls.
 * @param {number} count
 */
export function masterpieceSlots(count) {
  if (count > MASTERPIECE_SLOTS.length) throw new Error(`The salon holds at most ${MASTERPIECE_SLOTS.length} masterpieces`);
  return MASTERPIECE_SLOTS.slice(0, count).map((slot) => structuredClone(slot));
}

/**
 * Largest size with the given aspect ratio (width / height) that fits the box.
 * @param {number} aspect
 * @param {number} maxWidth
 * @param {number} maxHeight
 */
export function fitSize(aspect, maxWidth, maxHeight) {
  const width = Math.min(maxWidth, maxHeight * aspect);
  return { width, height: width / aspect };
}

const FRAME_MARGIN = 1.35;
const SCREEN_FILL = 0.74;

/**
 * Where to stand so the framed artwork fills the visible part of the screen.
 * @param {{ position: { x: number, y: number, z: number }, normal: { x: number, z: number } }} slot
 * @param {{ width: number, height: number }} size
 * @param {{ fovDeg: number, aspect: number, availWidth?: number, availHeight?: number }} view
 */
export function viewPointFor(slot, size, { fovDeg, aspect, availWidth = 1, availHeight = 1 }) {
  const tanHalf = Math.tan((fovDeg * Math.PI) / 360);
  const forHeight = (size.height * FRAME_MARGIN) / (2 * tanHalf * SCREEN_FILL * availHeight);
  const forWidth = (size.width * FRAME_MARGIN) / (2 * tanHalf * aspect * SCREEN_FILL * availWidth);
  const ideal = Math.max(forHeight, forWidth, 1.6);
  const at = (d) => ({ x: slot.position.x + slot.normal.x * d, z: slot.position.z + slot.normal.z * d });
  const tries = Array.from({ length: 40 }, (_, i) => ideal + (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * 0.25);
  const distance = tries.find((d) => d > 0.8 && isWalkable(at(d).x, at(d).z)) ?? ideal;
  const point = at(distance);
  return { ...point, y: Math.min(2.6, Math.max(1.5, slot.position.y)), distance };
}
