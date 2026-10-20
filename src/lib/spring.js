/**
 * Critically damped springs (damping ratio 1.0) — the "Apple default":
 * interruptible, velocity-aware and never overshooting.
 */

/**
 * Convert a "response" (seconds to settle, roughly) to angular frequency.
 * @param {number} response
 * @returns {number}
 */
export function omegaFromResponse(response) {
  return (2 * Math.PI) / response;
}

/**
 * Exact closed-form step of a critically damped spring.
 * @param {{ value: number, velocity: number }} state
 * @param {number} target
 * @param {number} omega
 * @param {number} dt seconds
 * @returns {{ value: number, velocity: number }}
 */
export function stepSpring(state, target, omega, dt) {
  const offset = state.value - target;
  const decay = Math.exp(-omega * dt);
  const drift = (state.velocity + omega * offset) * dt;
  return {
    value: target + (offset + drift) * decay,
    velocity: (state.velocity - omega * drift) * decay,
  };
}

/**
 * Signed shortest rotation from one angle to another, in (-PI, PI].
 * @param {number} from
 * @param {number} to
 * @returns {number}
 */
export function shortestAngle(from, to) {
  const turn = Math.PI * 2;
  const delta = (((to - from) % turn) + turn * 1.5) % turn - Math.PI;
  return delta === -Math.PI ? Math.PI : delta;
}

/**
 * Ken Perlin's smootherstep on [0, 1].
 * @param {number} t
 * @returns {number}
 */
export function smootherstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}
