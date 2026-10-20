import { describe, test, expect } from 'vitest';
import { findPath, segmentClear, pathLength } from '../../src/lib/navigation.js';

const allSegmentsClear = (path) =>
  path.slice(1).every((point, i) => segmentClear(path[i], point));

describe('segmentClear', () => {
  test('is true across an open room', () => {
    expect(segmentClear({ x: -3, z: 9 }, { x: 3, z: 9 })).toBe(true);
  });

  test('is false through a wall', () => {
    expect(segmentClear({ x: -4, z: 9 }, { x: -4, z: -20 })).toBe(false);
    expect(segmentClear({ x: -6, z: 9 }, { x: -3, z: -5 })).toBe(false);
  });
});

describe('findPath', () => {
  test('returns the straight line when nothing is in the way', () => {
    const path = findPath({ x: -2, z: -15 }, { x: 2, z: -22 });
    expect(path).toEqual([{ x: -2, z: -15 }, { x: 2, z: -22 }]);
  });

  test('steps around a bench in the way', () => {
    const path = findPath({ x: 0, z: -10 }, { x: 0, z: -15 });
    expect(path.length).toBeGreaterThan(2);
    expect(allSegmentsClear(path)).toBe(true);
  });

  test('walks from the front steps to the future wing through every doorway', () => {
    const path = findPath({ x: 0, z: 28 }, { x: 0, z: -72 });
    expect(path).not.toBeNull();
    expect(path.length).toBeGreaterThan(2);
    expect(allSegmentsClear(path)).toBe(true);
  });

  test('routes around the freestanding masterpiece wall', () => {
    const path = findPath({ x: 0, z: -45 }, { x: 0, z: -60 });
    expect(path).not.toBeNull();
    expect(allSegmentsClear(path)).toBe(true);
    expect(path.some((point) => Math.abs(point.x) > 4.8)).toBe(true);
  });

  test('returns null when the goal is unreachable', () => {
    expect(findPath({ x: 0, z: 9 }, { x: 50, z: 50 })).toBeNull();
  });
});

describe('pathLength', () => {
  test('sums segment lengths', () => {
    expect(pathLength([{ x: 0, z: 0 }, { x: 3, z: 4 }, { x: 3, z: 0 }])).toBe(9);
  });
});
