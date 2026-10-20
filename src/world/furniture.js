import * as THREE from 'three';
import { PALETTE } from './palette.js';
import { standSign } from './signage.js';
import { glowCanvas, toTexture } from './textures.js';

const box = (w, h, d, material, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
};

let haloMaterial = null;
/** Shared additive glow sprite material for flames and bulbs. */
export function halo() {
  haloMaterial ??= new THREE.SpriteMaterial({
    map: toTexture(glowCanvas(), { wrap: false }),
    color: PALETTE.warmLight,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 0.7,
  });
  return haloMaterial;
}

const candleRing = (materials, radius, count, y) => {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.03, 8, 48), materials.gold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = y;
  group.add(ring);
  const crystalGeometry = new THREE.OctahedronGeometry(0.045);
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    group.add(box(0.06, 0.03, 0.06, materials.gold, x, y + 0.03, z));
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 10), materials.candle);
    candle.position.set(x, y + 0.14, z);
    group.add(candle);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), materials.flame);
    flame.scale.y = 1.8;
    flame.position.set(x, y + 0.28, z);
    group.add(flame);
    const glow = new THREE.Sprite(halo());
    glow.scale.setScalar(0.32);
    glow.position.copy(flame.position);
    group.add(glow);
    const drop = new THREE.Mesh(crystalGeometry, materials.crystal);
    const dropAngle = angle + Math.PI / count;
    drop.position.set(Math.cos(dropAngle) * radius, y - 0.12, Math.sin(dropAngle) * radius);
    drop.scale.y = 1.8;
    group.add(drop);
  }
  return group;
};

/**
 * A gilt candle chandelier hanging from `ceilingY` with its body at `y`.
 * @returns {THREE.Group}
 */
export function chandelier(materials, { x, y, z, ceilingY, scale = 1 }) {
  const group = new THREE.Group();
  const rodLength = ceilingY - y;
  group.add(box(0.03, rodLength, 0.03, materials.gold, 0, rodLength / 2, 0));
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), materials.gold);
  body.scale.y = 1.6;
  group.add(body);
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 16), materials.gold);
  finial.rotation.x = Math.PI;
  finial.position.y = -0.38;
  group.add(finial);
  group.add(candleRing(materials, 1.0, 10, -0.2));
  group.add(candleRing(materials, 0.62, 6, 0.32));
  group.scale.setScalar(scale);
  group.position.set(x, y, z);
  return group;
}

/** Gallery bench: walnut frame, oxblood leather seat. */
export function bench(materials, { x, z, rotationY = 0 }) {
  const group = new THREE.Group();
  group.add(box(1.9, 0.12, 0.55, materials.leather, 0, 0.46, 0));
  group.add(box(1.94, 0.06, 0.6, materials.walnut, 0, 0.38, 0));
  [-0.85, 0.85].forEach((bx) => [-0.22, 0.22].forEach((bz) => group.add(box(0.07, 0.38, 0.07, materials.walnut, bx, 0.19, bz))));
  group.position.set(x, 0, z);
  group.rotation.y = rotationY;
  return group;
}

const sag = (a, b, drop) => {
  const mid = a.clone().lerp(b, 0.5);
  mid.y -= drop;
  return new THREE.QuadraticBezierCurve3(a, mid, b);
};

/**
 * Brass stanchions joined by sagging velvet rope, through the given floor points.
 * @param {Array<{ x: number, z: number }>} points
 */
export function velvetRope(materials, points, { closed = false } = {}) {
  const group = new THREE.Group();
  const postGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.95, 12);
  const baseGeometry = new THREE.CylinderGeometry(0.17, 0.2, 0.05, 24);
  const knobGeometry = new THREE.SphereGeometry(0.06, 14, 10);
  points.forEach(({ x, z }) => {
    const post = new THREE.Mesh(postGeometry, materials.brass);
    post.position.set(x, 0.5, z);
    group.add(post);
    const base = new THREE.Mesh(baseGeometry, materials.brass);
    base.position.set(x, 0.025, z);
    group.add(base);
    const knob = new THREE.Mesh(knobGeometry, materials.brass);
    knob.position.set(x, 1.0, z);
    group.add(knob);
  });
  const pairs = points.slice(1).map((p, i) => [points[i], p]);
  if (closed) pairs.push([points[points.length - 1], points[0]]);
  pairs.forEach(([a, b]) => {
    const curve = sag(new THREE.Vector3(a.x, 0.9, a.z), new THREE.Vector3(b.x, 0.9, b.z), 0.16);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.025, 8, false), materials.velvet));
  });
  return group;
}

/** Posts on an arc in front of a wall (x, z is the arc centre on the wall). */
export function arcPoints({ x, z, radius, count }) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / (count - 1)) * Math.PI;
    return { x: x + Math.cos(angle) * radius, z: z + Math.sin(angle) * radius };
  });
}

/** Easel-style sign on a brass post. */
export function signStand(materials, { x, z, rotationY = 0, eyebrow, lines }) {
  const group = new THREE.Group();
  const sign = standSign({ eyebrow, lines });
  const width = 0.8;
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width / sign.aspect),
    new THREE.MeshStandardMaterial({ map: sign.texture, roughness: 0.6 }),
  );
  board.position.set(0, 1.25, 0.03);
  board.rotation.x = -0.2;
  group.add(board);
  group.add(box(width + 0.04, width / sign.aspect + 0.04, 0.03, materials.brass, 0, 1.25, 0));
  group.children[group.children.length - 1].rotation.x = -0.2;
  group.add(box(0.04, 1.05, 0.04, materials.brass, 0, 0.55, -0.05));
  group.add(box(0.4, 0.03, 0.3, materials.brass, 0, 0.015, -0.05));
  group.position.set(x, 0, z);
  group.rotation.y = rotationY;
  return group;
}

/** Brass picture light that hangs over a frame (in the frame's local space). */
export function pictureLight(materials, { width, top }) {
  const group = new THREE.Group();
  group.add(box(width, 0.05, 0.07, materials.brass, 0, top + 0.16, 0.24));
  group.add(box(width * 0.92, 0.012, 0.03, materials.glowWarm, 0, top + 0.13, 0.25));
  group.add(box(0.03, 0.03, 0.24, materials.brass, 0, top + 0.16, 0.12));
  return group;
}
