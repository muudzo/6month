import { describe, test, expect } from 'vitest';
import { validateConfig, prepareConfig } from '../../src/lib/config.js';
import { MUSEUM } from '../../src/config/museum.js';

const exhibit = (overrides = {}) => ({
  kind: 'photo',
  src: 'photos/01.jpg',
  title: 'A title',
  date: 'May 2026',
  medium: 'Phone camera',
  note: 'A note',
  ...overrides,
});

const baseConfig = (overrides = {}) => ({
  herName: 'Amara',
  yourName: 'Tendai',
  startDate: '2026-04-20',
  music: '',
  exhibits: [exhibit(), exhibit({ kind: 'masterpiece', style: 'renaissance' })],
  futureExhibits: ['Month seven'],
  finalLetter: { greeting: 'Dear {her},', paragraphs: ['Hi'], signoff: '{me}' },
  secretNote: 'Secret',
  sculptureNote: 'Marble',
  ...overrides,
});

describe('validateConfig', () => {
  test('accepts the shipped museum config', () => {
    expect(validateConfig(MUSEUM)).toEqual({ ok: true, errors: [] });
  });

  test('accepts a minimal valid config', () => {
    expect(validateConfig(baseConfig()).ok).toBe(true);
  });

  test('requires both names', () => {
    const result = validateConfig(baseConfig({ herName: ' ' }));
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/herName/);
  });

  test('rejects an invalid start date', () => {
    expect(validateConfig(baseConfig({ startDate: '2026-02-31' })).errors.join(' ')).toMatch(/startDate/);
  });

  test('limits the collection to 15 photos and 3 masterpieces', () => {
    const photos = Array.from({ length: 16 }, () => exhibit());
    expect(validateConfig(baseConfig({ exhibits: photos })).errors.join(' ')).toMatch(/15 photos/);
    const masterpieces = Array.from({ length: 4 }, () => exhibit({ kind: 'masterpiece' }));
    expect(validateConfig(baseConfig({ exhibits: masterpieces })).errors.join(' ')).toMatch(/3 masterpieces/);
  });

  test('names the exhibit that is broken', () => {
    const result = validateConfig(baseConfig({ exhibits: [exhibit(), exhibit({ title: '' })] }));
    expect(result.errors.join(' ')).toMatch(/exhibit 2/i);
  });

  test('rejects unknown kinds and painting styles', () => {
    expect(validateConfig(baseConfig({ exhibits: [exhibit({ kind: 'sculpture' })] })).ok).toBe(false);
    expect(validateConfig(baseConfig({ exhibits: [exhibit({ kind: 'masterpiece', style: 'cubist' })] })).ok).toBe(false);
  });

  test('handles a missing config object', () => {
    expect(validateConfig(undefined).ok).toBe(false);
  });

  test('accepts an optional artist credit and rejects one that is not text', () => {
    expect(validateConfig(baseConfig({ exhibits: [exhibit({ artist: 'A kind stranger' })] })).ok).toBe(true);
    const result = validateConfig(baseConfig({ exhibits: [exhibit({ artist: 42 })] }));
    expect(result.errors.join(' ')).toMatch(/Exhibit 1: artist/);
  });

  test('accepts a museum without a tour guide', () => {
    const { guide, ...withoutGuide } = baseConfig({ guide: undefined });
    expect(validateConfig(withoutGuide).ok).toBe(true);
  });

  test('accepts a tour guide with a speech', () => {
    const guide = { name: '{me}', role: 'Your guide', portrait: 'photos/03.jpg', speech: ['Welcome, {her}.', 'Shall we?'] };
    expect(validateConfig(baseConfig({ guide })).ok).toBe(true);
  });

  test('explains a tour guide speech that is empty or not a list of lines', () => {
    expect(validateConfig(baseConfig({ guide: { speech: [] } })).errors.join(' ')).toMatch(/guide\.speech/);
    expect(validateConfig(baseConfig({ guide: { speech: 'Hello' } })).errors.join(' ')).toMatch(/guide\.speech/);
    expect(validateConfig(baseConfig({ guide: { speech: ['Hello', ' '] } })).errors.join(' ')).toMatch(/guide\.speech/);
  });

  test('explains tour guide details that are not text', () => {
    const result = validateConfig(baseConfig({ guide: { name: 7, portrait: false, speech: ['Hi'] } }));
    expect(result.errors.join(' ')).toMatch(/guide\.name/);
    expect(result.errors.join(' ')).toMatch(/guide\.portrait/);
  });
});

describe('prepareConfig', () => {
  test('fills {her} and {me} everywhere and numbers the catalogue', () => {
    const prepared = prepareConfig(
      baseConfig({ exhibits: [exhibit({ title: 'For {her}' }), exhibit({ kind: 'masterpiece', title: 'By {me}' })] }),
    );
    expect(prepared.photos[0].title).toBe('For Amara');
    expect(prepared.photos[0].number).toBe(1);
    expect(prepared.masterpieces[0].title).toBe('By Tendai');
    expect(prepared.masterpieces[0].number).toBe(2);
    expect(prepared.finalLetter.greeting).toBe('Dear Amara,');
    expect(prepared.catalogue).toHaveLength(2);
  });

  test('fills names into the tour guide and the artist credits', () => {
    const prepared = prepareConfig(
      baseConfig({
        exhibits: [exhibit({ artist: '{me}, self-portrait' })],
        guide: { name: '{me}', speech: ['Welcome, {her}.'] },
      }),
    );
    expect(prepared.photos[0].artist).toBe('Tendai, self-portrait');
    expect(prepared.guide).toEqual({ name: 'Tendai', speech: ['Welcome, Amara.'] });
  });

  test('defaults masterpiece styles in order', () => {
    const prepared = prepareConfig(
      baseConfig({ exhibits: [exhibit({ kind: 'masterpiece' }), exhibit({ kind: 'masterpiece' }), exhibit({ kind: 'masterpiece' })] }),
    );
    expect(prepared.masterpieces.map((m) => m.style)).toEqual(['renaissance', 'gilded', 'surreal']);
  });

  test('does not mutate the source config', () => {
    const source = baseConfig();
    const snapshot = JSON.stringify(source);
    prepareConfig(source);
    expect(JSON.stringify(source)).toBe(snapshot);
  });
});
