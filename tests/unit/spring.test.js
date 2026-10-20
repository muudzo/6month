import { describe, test, expect } from 'vitest';
import { stepSpring, omegaFromResponse, shortestAngle, smootherstep } from '../../src/lib/spring.js';

describe('stepSpring (critically damped)', () => {
  test('converges on the target without overshoot', () => {
    let state = { value: 0, velocity: 0 };
    const omega = omegaFromResponse(0.4);
    let max = 0;
    for (let i = 0; i < 240; i += 1) {
      state = stepSpring(state, 10, omega, 1 / 60);
      max = Math.max(max, state.value);
    }
    expect(state.value).toBeCloseTo(10, 3);
    expect(max).toBeLessThanOrEqual(10 + 1e-9);
  });

  test('carries initial velocity forward (no seam on hand-off)', () => {
    const next = stepSpring({ value: 0, velocity: 5 }, 0, omegaFromResponse(0.4), 1 / 120);
    expect(next.value).toBeGreaterThan(0);
  });

  test('returns a new object', () => {
    const state = { value: 1, velocity: 0 };
    const next = stepSpring(state, 2, 10, 0.016);
    expect(next).not.toBe(state);
    expect(state.value).toBe(1);
  });

  test('is frame-rate independent', () => {
    const omega = omegaFromResponse(0.3);
    let a = { value: 0, velocity: 0 };
    let b = { value: 0, velocity: 0 };
    for (let i = 0; i < 60; i += 1) a = stepSpring(a, 1, omega, 1 / 60);
    for (let i = 0; i < 120; i += 1) b = stepSpring(b, 1, omega, 1 / 120);
    expect(a.value).toBeCloseTo(b.value, 6);
  });
});

describe('shortestAngle', () => {
  test('wraps across the -PI/PI seam', () => {
    expect(shortestAngle(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2, 6);
    expect(shortestAngle(0.5, 0.2)).toBeCloseTo(-0.3, 6);
  });
});

describe('smootherstep', () => {
  test('clamps and eases', () => {
    expect(smootherstep(-1)).toBe(0);
    expect(smootherstep(2)).toBe(1);
    expect(smootherstep(0.5)).toBeCloseTo(0.5, 6);
  });
});
