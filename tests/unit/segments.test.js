import { describe, test, expect } from 'vitest';
import { solidSpans } from '../../src/lib/segments.js';

describe('solidSpans', () => {
  test('returns the whole wall when there are no openings', () => {
    expect(solidSpans(10, [], 0)).toEqual([[-5, 5]]);
  });

  test('splits around a centred door, with padding', () => {
    expect(solidSpans(10, [{ offset: 0, width: 2 }], 0.5)).toEqual([[-5, -1.5], [1.5, 5]]);
  });

  test('handles several doors in any order and drops empty slivers', () => {
    const spans = solidSpans(10, [{ offset: 3, width: 2 }, { offset: -4.5, width: 1 }], 0);
    expect(spans).toEqual([[-4, 2], [4, 5]]);
  });
});
