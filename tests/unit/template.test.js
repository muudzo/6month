import { describe, test, expect } from 'vitest';
import { fillTemplate, fillDeep } from '../../src/lib/template.js';

describe('fillTemplate', () => {
  test('replaces known tokens', () => {
    expect(fillTemplate('La Gioconda di {her}', { her: 'Amara' })).toBe('La Gioconda di Amara');
  });

  test('replaces repeated tokens', () => {
    expect(fillTemplate('{a} & {a}', { a: 'x' })).toBe('x & x');
  });

  test('leaves unknown tokens untouched', () => {
    expect(fillTemplate('Hi {nobody}', { her: 'A' })).toBe('Hi {nobody}');
  });

  test('passes non-strings through', () => {
    expect(fillTemplate(42, {})).toBe(42);
  });
});

describe('fillDeep', () => {
  test('fills strings in nested objects and arrays without mutating the input', () => {
    const input = Object.freeze({ title: '{her}', list: Object.freeze(['{me}', 3]), nested: Object.freeze({ x: '{her}!' }) });
    const out = fillDeep(input, { her: 'A', me: 'B' });
    expect(out).toEqual({ title: 'A', list: ['B', 3], nested: { x: 'A!' } });
    expect(out).not.toBe(input);
  });
});
