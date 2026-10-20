import { smootherstep } from '../lib/spring.js';

/** Where the visitor stands while holding the ticket: at the foot of the steps. */
export const OUTSIDE_POSE = Object.freeze({ x: 0, z: 31, yaw: 0, pitch: 0.16 });
const INSIDE = Object.freeze({ x: 0, z: 9.6, yaw: 0, pitch: 0.02 });
const ROUTE = Object.freeze([{ x: 0, z: 31 }, { x: 0, z: 22 }, { x: 0, z: 14.3 }, { x: 0, z: 9.6 }]);
const WALK_IN_SECONDS = 7;
const DOORS_DELAY_S = 0.6;
const DOORS_SECONDS = 2.4;

/**
 * Doors swing open while the camera climbs the steps and walks into the lobby.
 * @param {{ player: any, setDoorsOpen: (amount: number) => void, playDoors: () => void, reducedMotion: boolean, onInside: () => void }} options
 * @returns {{ update: (t: number) => void }}
 */
export function startIntro({ player, setDoorsOpen, playDoors, reducedMotion, onInside }) {
  let startedAt = null;
  let doorsSounded = false;

  if (reducedMotion) {
    setDoorsOpen(1);
    player.glideTo(INSIDE, { onArrive: onInside });
    return { update: () => {} };
  }

  player.glideTo(INSIDE, { path: ROUTE, duration: WALK_IN_SECONDS, onArrive: onInside });
  return {
    update: (t) => {
      startedAt ??= t;
      const elapsed = t - startedAt - DOORS_DELAY_S;
      if (elapsed > 0 && !doorsSounded) {
        doorsSounded = true;
        playDoors();
      }
      setDoorsOpen(smootherstep(elapsed / DOORS_SECONDS));
    },
  };
}
