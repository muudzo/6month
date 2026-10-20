import { describe, test, expect } from 'vitest';
import { meanLuminance, exposureGain } from '../../src/lib/exposure.js';

describe('meanLuminance', () => {
  test('averages perceived brightness of RGBA pixels (0..1)', () => {
    const white = [255, 255, 255, 255];
    const black = [0, 0, 0, 255];
    expect(meanLuminance(Uint8ClampedArray.from([...white, ...black]))).toBeCloseTo(0.5, 3);
  });

  test('weights green above red above blue', () => {
    const red = meanLuminance(Uint8ClampedArray.from([255, 0, 0, 255]));
    const green = meanLuminance(Uint8ClampedArray.from([0, 255, 0, 255]));
    const blue = meanLuminance(Uint8ClampedArray.from([0, 0, 255, 255]));
    expect(green).toBeGreaterThan(red);
    expect(red).toBeGreaterThan(blue);
  });

  test('is zero for an empty buffer', () => {
    expect(meanLuminance(new Uint8ClampedArray(0))).toBe(0);
  });
});

describe('exposureGain', () => {
  test('leaves well-exposed photos alone', () => {
    expect(exposureGain(0.5)).toBe(1);
  });

  test('lifts dark photos', () => {
    expect(exposureGain(0.2)).toBeGreaterThan(1.5);
  });

  test('never lifts by more than the cap, even for black frames', () => {
    expect(exposureGain(0)).toBe(2.2);
    expect(exposureGain(0.01)).toBe(2.2);
  });
});
