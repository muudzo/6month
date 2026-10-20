import { describe, test, expect } from 'vitest';
import { parseLocalDate, elapsedSince, wholeMonthsBetween, formatCount } from '../../src/lib/dates.js';

describe('parseLocalDate', () => {
  test('parses YYYY-MM-DD as local midnight', () => {
    const date = parseLocalDate('2026-04-20');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(3);
    expect(date.getDate()).toBe(20);
    expect(date.getHours()).toBe(0);
  });

  test('returns null for malformed strings', () => {
    expect(parseLocalDate('20/04/2026')).toBeNull();
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate(undefined)).toBeNull();
  });

  test('returns null for impossible calendar dates', () => {
    expect(parseLocalDate('2026-02-30')).toBeNull();
    expect(parseLocalDate('2026-13-01')).toBeNull();
  });
});

describe('elapsedSince', () => {
  test('breaks elapsed time into whole units', () => {
    const start = new Date(2026, 3, 20, 0, 0, 0);
    const now = new Date(2026, 3, 22, 3, 4, 5);
    expect(elapsedSince(start, now)).toEqual({
      days: 2,
      hours: 51,
      minutes: 3064,
      seconds: 183845,
    });
  });

  test('clamps to zero when the start is in the future', () => {
    const start = new Date(2026, 5, 1);
    const now = new Date(2026, 4, 1);
    expect(elapsedSince(start, now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe('wholeMonthsBetween', () => {
  test('counts completed months only', () => {
    expect(wholeMonthsBetween(new Date(2026, 3, 20), new Date(2026, 9, 20))).toBe(6);
    expect(wholeMonthsBetween(new Date(2026, 3, 20), new Date(2026, 9, 19))).toBe(5);
  });

  test('never goes negative', () => {
    expect(wholeMonthsBetween(new Date(2026, 9, 20), new Date(2026, 3, 20))).toBe(0);
  });
});

describe('formatCount', () => {
  test('adds thousands separators', () => {
    expect(formatCount(15811200)).toBe('15,811,200');
    expect(formatCount(7)).toBe('7');
  });
});
