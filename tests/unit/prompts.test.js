import { describe, test, expect } from 'vitest';
import { promptFor } from '../../src/app/prompts.js';

describe('promptFor', () => {
  test('says nothing when nothing is in view', () => {
    expect(promptFor(null, false)).toBe('');
  });

  test('uses tap on touch screens and click with a mouse', () => {
    expect(promptFor({ kind: 'photo' }, true)).toMatch(/^Tap/);
    expect(promptFor({ kind: 'photo' }, false)).toMatch(/^Click/);
    expect(promptFor({ kind: 'masterpiece' }, false)).toMatch(/Enter/);
  });

  test('has its own words for hearts, the letter, the sculpture and empty frames', () => {
    expect(promptFor({ kind: 'heart' }, true)).toMatch(/heart/);
    expect(promptFor({ kind: 'finale' }, true)).toMatch(/letter/);
    expect(promptFor({ kind: 'sculpture' }, true)).toMatch(/sculpture/);
    expect(promptFor({ kind: 'future' }, true)).toMatch(/empty frame/);
  });
});
