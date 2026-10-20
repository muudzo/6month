import * as THREE from 'three';
import { PALETTE } from './palette.js';

/**
 * A deliberately small light budget: three.js evaluates every light for every
 * lit pixel, so pictures get painted-on light pools instead of real spotlights,
 * and only the masterpieces earn a true spotlight each.
 * @param {Array<{ position: { x: number, y: number, z: number }, normal: { x: number, z: number } }>} masterpieceSlots
 */
export function buildLighting(masterpieceSlots) {
  const group = new THREE.Group();
  group.add(new THREE.HemisphereLight('#ffe7c4', '#20140c', 0.38));
  group.add(new THREE.AmbientLight('#fff1dc', 0.1));

  const warm = (x, y, z, intensity, distance = 0) => {
    const light = new THREE.PointLight(PALETTE.warmLight, intensity, distance, 2);
    light.position.set(x, y, z);
    group.add(light);
    return light;
  };

  warm(0, 6.5, 23, 38);
  warm(0, 6.4, 8.5, 48);
  warm(0, 5.4, -9, 32);
  warm(0, 5.4, -29, 32);
  warm(0, 7.4, -45.5, 110);
  warm(0, 4.8, -71, 30);

  masterpieceSlots.forEach(({ position, normal }) => {
    const spot = new THREE.SpotLight(PALETTE.warmLight, 48, 0, 0.32, 0.75, 2);
    spot.position.set(position.x + normal.x * 6, 7.8, position.z + normal.z * 6);
    spot.target.position.set(position.x, position.y, position.z);
    group.add(spot, spot.target);
  });
  return group;
}
