import * as THREE from 'three';
import { HEARTS } from '../lib/layout.js';
import { PALETTE } from './palette.js';
import { halo } from './furniture.js';
import { heartGeometry } from './shapes.js';
import { glowCanvas, seededRandom, toTexture } from './textures.js';

const COLLECT_SECONDS = 0.6;

/**
 * Six glowing hearts hidden around the building.
 * @returns {{ group: THREE.Group, items: Array<import('./types.js').Interactable>, collect: (id: string) => void, update: (t: number, dt: number) => void }}
 */
export function buildHearts(materials) {
  const group = new THREE.Group();
  const geometry = heartGeometry(0.16, 0.06, 0.03);
  const hitGeometry = new THREE.SphereGeometry(0.32, 8, 6);
  const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
  const state = new Map();

  const items = HEARTS.map((spot, i) => {
    const holder = new THREE.Group();
    const heart = new THREE.Mesh(geometry, materials.heart);
    const glowMaterial = halo().clone();
    glowMaterial.color = new THREE.Color(PALETTE.rose);
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.setScalar(0.9);
    const hit = new THREE.Mesh(hitGeometry, hitMaterial);
    holder.add(heart, glow, hit);
    holder.position.set(spot.x, spot.y, spot.z);
    group.add(holder);
    state.set(spot.id, { holder, glowMaterial, baseY: spot.y, phase: i * 1.3, collectedAt: null });
    return {
      id: spot.id,
      kind: 'heart',
      data: { month: i + 1 },
      object: holder,
      hitTargets: [hit, heart],
      slot: { position: { x: spot.x, y: spot.y, z: spot.z }, normal: { x: 0, z: 1 } },
      size: { width: 0.4, height: 0.4 },
      setHover: (on) => heart.scale.setScalar(on ? 1.25 : 1),
    };
  });

  let clock = 0;
  const collect = (id) => {
    const entry = state.get(id);
    if (entry && entry.collectedAt === null) entry.collectedAt = clock;
  };

  const update = (t) => {
    clock = t;
    state.forEach((entry) => {
      const { holder, glowMaterial, baseY, phase, collectedAt } = entry;
      if (collectedAt === null) {
        holder.children[0].rotation.y = t * 1.6 + phase;
        holder.children[0].position.y = Math.sin(t * 2 + phase) * 0.05;
        glowMaterial.opacity = 0.55 + Math.sin(t * 3 + phase) * 0.2;
        return;
      }
      const progress = Math.min(1, (t - collectedAt) / COLLECT_SECONDS);
      holder.scale.setScalar(1 + progress * 1.5);
      holder.position.y = baseY + progress * 0.4;
      glowMaterial.opacity = 0.8 * (1 - progress);
      holder.children[0].visible = progress < 0.6;
      if (progress >= 1) holder.visible = false;
    });
  };

  return { group, items, collect, update };
}

/**
 * Dust drifting through the light in a room-sized box.
 * @param {{ x0: number, x1: number, y0: number, y1: number, z0: number, z1: number }} bounds
 */
export function buildDust(bounds, count = 500) {
  const random = seededRandom(97);
  const positions = new Float32Array(count * 3);
  const speeds = Float32Array.from({ length: count }, () => 0.03 + random() * 0.06);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = bounds.x0 + random() * (bounds.x1 - bounds.x0);
    positions[i * 3 + 1] = bounds.y0 + random() * (bounds.y1 - bounds.y0);
    positions[i * 3 + 2] = bounds.z0 + random() * (bounds.z1 - bounds.z0);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: toTexture(glowCanvas(), { wrap: false }),
      color: PALETTE.warmLight,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  const height = bounds.y1 - bounds.y0;
  const update = (t, dt) => {
    const attr = geometry.attributes.position;
    for (let i = 0; i < count; i += 1) {
      const y = attr.getY(i) + speeds[i] * dt;
      attr.setY(i, y > bounds.y1 ? y - height : y);
      attr.setX(i, attr.getX(i) + Math.sin(t * 0.3 + i) * 0.0015);
    }
    attr.needsUpdate = true;
  };
  return { points, update };
}
