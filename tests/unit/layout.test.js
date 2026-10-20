import { describe, test, expect } from 'vitest';
import {
  ROOMS,
  DOORS,
  HEARTS,
  PLAYER_RADIUS,
  isWalkable,
  moveWithCollision,
  roomAt,
  floorHeightAt,
  gallerySlots,
  masterpieceSlots,
  fitSize,
  viewPointFor,
  hangHeight,
  GALLERY_FRAME_MIN_BOTTOM,
} from '../../src/lib/layout.js';

describe('floor plan', () => {
  test('every door connects two existing rooms', () => {
    const ids = new Set(ROOMS.map((room) => room.id));
    DOORS.forEach((door) => {
      expect(ids.has(door.from)).toBe(true);
      expect(ids.has(door.to)).toBe(true);
    });
  });

  test('every hidden heart sits inside a room', () => {
    expect(HEARTS).toHaveLength(6);
    HEARTS.forEach((heart) => expect(roomAt(heart.x, heart.z)).not.toBeNull());
  });
});

describe('isWalkable', () => {
  test('room centres are walkable', () => {
    expect(isWalkable(0, 9)).toBe(true);
    expect(isWalkable(0, -20)).toBe(true);
    expect(isWalkable(0, -70)).toBe(true);
  });

  test('walls and the space outside the building are not', () => {
    expect(isWalkable(5.4, -20)).toBe(false);
    expect(isWalkable(20, -20)).toBe(false);
  });

  test('doorways are walkable but the wall beside them is not', () => {
    expect(isWalkable(0, -0.3)).toBe(true);
    expect(isWalkable(4, -0.3)).toBe(false);
  });

  test('obstacles block, including the player radius around them', () => {
    expect(isWalkable(0, -52)).toBe(false);
    expect(isWalkable(0, -12.5 + 0.3 + PLAYER_RADIUS - 0.01)).toBe(false);
  });
});

describe('moveWithCollision', () => {
  test('moves freely in open space', () => {
    expect(moveWithCollision({ x: 0, z: -20 }, 0.5, -0.5)).toEqual({ x: 0.5, z: -20.5 });
  });

  test('slides along a wall instead of stopping dead', () => {
    const start = { x: 5.5 - PLAYER_RADIUS - 0.01, z: -20 };
    const next = moveWithCollision(start, 0.5, -0.5);
    expect(next.x).toBe(start.x);
    expect(next.z).toBeCloseTo(-20.5);
  });

  test('does not mutate the input position', () => {
    const start = Object.freeze({ x: 0, z: 0 });
    expect(() => moveWithCollision(start, 1, 1)).not.toThrow();
  });
});

describe('roomAt', () => {
  test('names the room under a point', () => {
    expect(roomAt(0, 9).id).toBe('lobby');
    expect(roomAt(0, -50).id).toBe('salon');
    expect(roomAt(40, 40)).toBeNull();
  });
});

describe('floorHeightAt', () => {
  test('steps down from the portico to the plaza', () => {
    expect(floorHeightAt(5)).toBe(0);
    expect(floorHeightAt(30)).toBeLessThan(0);
    const mid = floorHeightAt(18.6);
    expect(mid).toBeLessThan(0);
    expect(mid).toBeGreaterThan(floorHeightAt(30));
  });
});

describe('exhibit slots', () => {
  test('gallery slots alternate walls and run deeper into the hall', () => {
    const slots = gallerySlots(15);
    expect(slots).toHaveLength(15);
    expect(slots[0].normal.x).toBe(1);
    expect(slots[1].normal.x).toBe(-1);
    for (let i = 1; i < slots.length; i += 1) {
      expect(slots[i].position.z).toBeLessThan(slots[i - 1].position.z);
    }
    slots.forEach((slot) => expect(roomAt(slot.position.x, slot.position.z).id).toBe('gallery'));
  });

  test('there are three masterpiece slots in the salon', () => {
    const slots = masterpieceSlots(3);
    expect(slots).toHaveLength(3);
    slots.forEach((slot) => expect(roomAt(slot.position.x, slot.position.z).id).toBe('salon'));
  });

  test('requesting more slots than the walls hold throws', () => {
    expect(() => gallerySlots(16)).toThrow();
    expect(() => masterpieceSlots(4)).toThrow();
  });
});

describe('hangHeight', () => {
  test('keeps the usual height for frames that already clear the wainscot', () => {
    const slot = gallerySlots(1)[0];
    expect(hangHeight(slot, 1.2)).toBe(slot.position.y);
  });

  test('raises tall frames so their bottom edge clears the wainscot', () => {
    const slot = gallerySlots(1)[0];
    const y = hangHeight(slot, 2.1);
    expect(y - 2.1 / 2).toBeCloseTo(GALLERY_FRAME_MIN_BOTTOM);
  });
});

describe('fitSize', () => {
  test('fits portrait and landscape images inside the box', () => {
    expect(fitSize(0.75, 2, 2)).toEqual({ width: 1.5, height: 2 });
    expect(fitSize(2, 2, 2)).toEqual({ width: 2, height: 1 });
  });
});

describe('viewPointFor', () => {
  test('stands in front of the art, on walkable floor', () => {
    const slot = masterpieceSlots(1)[0];
    const view = viewPointFor(slot, { width: 2.6, height: 3.4 }, { fovDeg: 55, aspect: 1.6 });
    expect(isWalkable(view.x, view.z)).toBe(true);
    expect(view.z).toBeGreaterThan(slot.position.z);
  });

  test('backs off further for a narrow (phone) screen', () => {
    const slot = gallerySlots(1)[0];
    const size = { width: 1.6, height: 1.2 };
    const wide = viewPointFor(slot, size, { fovDeg: 55, aspect: 1.6 });
    const narrow = viewPointFor(slot, size, { fovDeg: 55, aspect: 0.5 });
    expect(narrow.x).toBeGreaterThan(wide.x);
  });
});
