import * as THREE from 'three';
import { heartGeometry, ringShape } from './shapes.js';

const FRAME_STYLES = Object.freeze(['gold', 'ebony', 'walnut']);

const band = (innerW, innerH, outerW, outerH, depth, bevel, segments = 2) =>
  new THREE.ExtrudeGeometry(ringShape(innerW, innerH, outerW, outerH), {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments,
    curveSegments: 1,
  });

/**
 * A gallery frame with an ivory mat. The picture goes at z = photoZ.
 * @param {{ width: number, height: number, index: number, materials: Record<string, THREE.Material> }} options
 */
export function createPhotoFrame({ width, height, index, materials }) {
  const style = FRAME_STYLES[index % FRAME_STYLES.length];
  const matBorder = Math.min(width, height) * 0.13;
  const innerW = width + matBorder * 2;
  const innerH = height + matBorder * 2;
  const border = style === 'gold' ? 0.085 : 0.065;
  const group = new THREE.Group();

  const mat = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerH), materials.matBoard);
  mat.position.z = 0.012;
  group.add(mat);

  const frame = new THREE.Mesh(band(innerW, innerH, innerW + border * 2, innerH + border * 2, 0.045, 0.012), materials[style]);
  group.add(frame);

  if (style !== 'gold') {
    const fillet = new THREE.Mesh(band(innerW - 0.01, innerH - 0.01, innerW + 0.02, innerH + 0.02, 0.05, 0.004, 1), materials.gold);
    group.add(fillet);
  }
  return { group, outerWidth: innerW + border * 2, outerHeight: innerH + border * 2, photoZ: 0.016 };
}

const ornamentGeometries = () => ({
  ring: new THREE.TorusGeometry(0.13, 0.035, 10, 28),
  boss: new THREE.SphereGeometry(0.075, 18, 12),
  leaf: new THREE.SphereGeometry(1, 12, 8),
  scroll: new THREE.TorusGeometry(0.11, 0.03, 8, 20, Math.PI * 1.2),
});

const rosette = (geo, material) => {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geo.ring, material));
  const boss = new THREE.Mesh(geo.boss, material);
  boss.scale.z = 0.7;
  group.add(boss);
  [0, 1, 2, 3].forEach((i) => {
    const leaf = new THREE.Mesh(geo.leaf, material);
    const angle = Math.PI / 4 + (i * Math.PI) / 2;
    leaf.scale.set(0.16, 0.05, 0.04);
    leaf.rotation.z = angle;
    leaf.position.set(Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0);
    group.add(leaf);
  });
  return group;
};

const cartouche = (geo, material) => {
  const group = new THREE.Group();
  const boss = new THREE.Mesh(geo.boss, material);
  boss.scale.set(1.2, 0.9, 0.7);
  group.add(boss);
  [-1, 1].forEach((side) => {
    const scroll = new THREE.Mesh(geo.scroll, material);
    scroll.position.x = side * 0.17;
    scroll.rotation.z = side > 0 ? -0.3 : Math.PI + 0.3;
    group.add(scroll);
  });
  return group;
};

/**
 * Layered, carved-looking gilt frame for the masterpieces, with corner
 * rosettes, side cartouches and a heart crest.
 * @param {{ width: number, height: number, materials: Record<string, THREE.Material> }} options
 */
export function createOrnateFrame({ width, height, materials }) {
  const group = new THREE.Group();
  const layers = [
    { inner: -0.02, outer: 0.5, depth: 0.06, bevel: 0.03, segments: 2, material: materials.goldAntique },
    { inner: 0.08, outer: 0.4, depth: 0.12, bevel: 0.07, segments: 5, material: materials.gold },
    { inner: 0.43, outer: 0.5, depth: 0.17, bevel: 0.02, segments: 2, material: materials.gold },
    { inner: -0.02, outer: 0.05, depth: 0.17, bevel: 0.02, segments: 2, material: materials.gold },
  ];
  layers.forEach(({ inner, outer, depth, bevel, segments, material }) => {
    const geometry = band(width + inner * 2, height + inner * 2, width + outer * 2, height + outer * 2, depth, bevel, segments);
    group.add(new THREE.Mesh(geometry, material));
  });

  const geo = ornamentGeometries();
  const cx = width / 2 + 0.24;
  const cy = height / 2 + 0.24;
  [[-cx, cy], [cx, cy], [-cx, -cy], [cx, -cy]].forEach(([x, y]) => {
    const ornament = rosette(geo, materials.gold);
    ornament.position.set(x, y, 0.22);
    group.add(ornament);
  });
  [[0, cy, 0], [0, -cy, Math.PI], [-cx, 0, Math.PI / 2], [cx, 0, -Math.PI / 2]].forEach(([x, y, rot]) => {
    const ornament = cartouche(geo, materials.gold);
    ornament.position.set(x, y, 0.22);
    ornament.rotation.z = rot;
    group.add(ornament);
  });

  const crest = new THREE.Mesh(heartGeometry(0.34, 0.08, 0.035), materials.gold);
  crest.position.set(0, height / 2 + 0.66, 0.12);
  group.add(crest);
  [-1, 1].forEach((side) => {
    const scroll = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 24, Math.PI * 1.25), materials.gold);
    scroll.position.set(side * 0.42, height / 2 + 0.56, 0.1);
    scroll.rotation.z = side > 0 ? -0.2 : Math.PI + 0.2;
    group.add(scroll);
  });

  return { group, outerWidth: width + 1, outerHeight: height + 1.45, photoZ: 0.02 };
}
