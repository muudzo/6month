import { describe, test, expect } from 'vitest';
import { emptyVisit, markSeen, collectHeart, markRenewed, loadVisit, saveVisit } from '../../src/lib/visit.js';

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    data,
  };
};

describe('visit state', () => {
  test('marking an exhibit seen is idempotent and immutable', () => {
    const start = emptyVisit();
    const once = markSeen(start, 'exhibit-1');
    const twice = markSeen(once, 'exhibit-1');
    expect(start.seen).toEqual([]);
    expect(once.seen).toEqual(['exhibit-1']);
    expect(twice).toBe(once);
  });

  test('collecting a heart records it once', () => {
    const visit = collectHeart(collectHeart(emptyVisit(), 'month-2'), 'month-2');
    expect(visit.hearts).toEqual(['month-2']);
  });

  test('renewal is remembered', () => {
    expect(markRenewed(emptyVisit()).renewed).toBe(true);
  });
});

describe('persistence', () => {
  test('round-trips through storage', () => {
    const storage = memoryStorage();
    const visit = markSeen(collectHeart(emptyVisit(), 'month-1'), 'exhibit-3');
    saveVisit(storage, visit);
    expect(loadVisit(storage)).toEqual(visit);
  });

  test('falls back to an empty visit on corrupt data', () => {
    expect(loadVisit(memoryStorage({ 'museum-of-us:visit': '{not json' }))).toEqual(emptyVisit());
    expect(loadVisit(memoryStorage({ 'museum-of-us:visit': '{"seen": "nope"}' }))).toEqual(emptyVisit());
  });

  test('survives storage that throws (private mode)', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadVisit(broken)).toEqual(emptyVisit());
    expect(() => saveVisit(broken, emptyVisit())).not.toThrow();
  });

  test('works with no storage at all', () => {
    expect(loadVisit(undefined)).toEqual(emptyVisit());
  });
});
