import * as THREE from 'three';
import { DOORS, PLAZA_LEVEL, PORTICO_COLUMNS, STEPS } from '../lib/layout.js';
import { flutedColumn } from './architecture.js';
import { PALETTE } from './palette.js';
import { heartGeometry, wallShape } from './shapes.js';
import { bannerSign, friezeSign } from './signage.js';
import { flagstoneCanvas, glowCanvas, limestoneCanvas, nightSkyCanvas, toTexture, withRepeat } from './textures.js';

const FACADE = Object.freeze({ width: 32, height: 13, front: 14.6, depth: 0.3 });
const PORTICO = Object.freeze({ x: 11.2, front: STEPS.top, columnHeight: 9.2 });
const ENTABLATURE = Object.freeze({ bottom: PORTICO.columnHeight, height: 1.2 });
const DOOR_OPEN_ANGLE = 1.35;

const box = (w, h, d, material, x, y, z) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
};

const buildSky = () => {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(400, 48, 24),
    new THREE.MeshBasicMaterial({ map: toTexture(nightSkyCanvas(), { wrap: false }), side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  sky.rotation.y = Math.PI / 2;
  sky.renderOrder = -1;
  return sky;
};

const buildGround = (stone) => {
  const group = new THREE.Group();
  const flags = toTexture(flagstoneCanvas());
  const plaza = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 60),
    new THREE.MeshStandardMaterial({ map: withRepeat(flags, 90 / 4, 60 / 4), roughness: 0.75 }),
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, PLAZA_LEVEL, FACADE.front + 30);
  group.add(plaza);
  const platformDepth = PORTICO.front - FACADE.front;
  group.add(box(PORTICO.x * 2 + 1.2, -PLAZA_LEVEL, platformDepth, stone, 0, PLAZA_LEVEL / 2, FACADE.front + platformDepth / 2));
  const stepDepth = (STEPS.bottom - STEPS.top) / STEPS.count;
  for (let i = 0; i < STEPS.count; i += 1) {
    const top = (PLAZA_LEVEL * (i + 1)) / (STEPS.count + 1);
    const z = STEPS.top + stepDepth * (i + 0.5);
    group.add(box(PORTICO.x * 2 + 1.2 - i * 0.2, top - PLAZA_LEVEL, stepDepth, stone, 0, (top + PLAZA_LEVEL) / 2, z));
  }
  return group;
};

const buildFacade = (stoneMaterial) => {
  const door = DOORS.find((d) => d.id === 'entrance');
  const geometry = new THREE.ExtrudeGeometry(
    wallShape(FACADE.width, FACADE.height, [{ offset: door.x, width: door.width, height: door.height }]),
    { depth: FACADE.depth, bevelEnabled: false, curveSegments: 24 },
  );
  geometry.translate(0, 0, -FACADE.depth);
  const facade = new THREE.Mesh(geometry, stoneMaterial);
  facade.position.z = FACADE.front;
  return facade;
};

const buildPediment = (stone, gold, base) => {
  const group = new THREE.Group();
  const half = PORTICO.x + 0.5;
  const rise = 3.2;
  const triangle = new THREE.Shape([new THREE.Vector2(-half, 0), new THREE.Vector2(half, 0), new THREE.Vector2(0, rise)]);
  const pediment = new THREE.Mesh(new THREE.ExtrudeGeometry(triangle, { depth: 0.8, bevelEnabled: false }), stone);
  pediment.position.set(0, base, PORTICO.front - 0.8);
  group.add(pediment);
  const slope = Math.atan2(rise, half);
  const rake = Math.hypot(half, rise);
  [-1, 1].forEach((side) => {
    const cornice = box(rake + 0.4, 0.28, 1.0, stone, (side * half) / 2, base + rise / 2 + 0.1, PORTICO.front - 0.4);
    cornice.rotation.z = -side * slope;
    group.add(cornice);
  });
  const crest = new THREE.Mesh(heartGeometry(0.75, 0.15, 0.08), gold);
  crest.position.set(0, base + 1.25, PORTICO.front + 0.08);
  group.add(crest);
  return group;
};

const buildPortico = (materials, stone, museum) => {
  const group = new THREE.Group();
  PORTICO_COLUMNS.forEach(({ x, z }) => {
    const column = flutedColumn(PORTICO.columnHeight, 0.42, stone, stone);
    column.position.set(x, 0, z);
    group.add(column);
  });
  const depth = PORTICO.front - FACADE.front + 0.2;
  const midZ = FACADE.front + depth / 2;
  group.add(box(PORTICO.x * 2, ENTABLATURE.height, depth, stone, 0, ENTABLATURE.bottom + ENTABLATURE.height / 2, midZ));
  const cornice = ENTABLATURE.bottom + ENTABLATURE.height;
  group.add(box(PORTICO.x * 2 + 1, 0.3, depth + 0.4, stone, 0, cornice + 0.15, midZ + 0.2));
  group.add(buildPediment(stone, materials.gold, cornice + 0.3));

  const frieze = friezeSign(museum.museumName);
  const friezeHeight = 0.95;
  const friezePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(friezeHeight * frieze.aspect, friezeHeight),
    new THREE.MeshStandardMaterial({ map: frieze.texture, roughness: 0.85 }),
  );
  friezePlane.position.set(0, ENTABLATURE.bottom + ENTABLATURE.height / 2, FACADE.front + depth + 0.01);
  group.add(friezePlane);

  const banners = [
    { x: -4.2, sign: bannerSign({ top: 'Now showing', big: 'Six Months', bottom: 'A Retrospective' }) },
    { x: 4.2, sign: bannerSign({ top: 'Guest of honour', big: museum.herName, bottom: 'Admit one' }) },
  ];
  banners.forEach(({ x, sign }) => {
    const height = 5.6;
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(height * sign.aspect, height),
      new THREE.MeshStandardMaterial({ map: sign.texture, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }),
    );
    banner.position.set(x, ENTABLATURE.bottom - height / 2, PORTICO_COLUMNS[0].z);
    group.add(banner);
    group.add(box(height * sign.aspect + 0.2, 0.06, 0.06, materials.brass, x, ENTABLATURE.bottom - 0.03, PORTICO_COLUMNS[0].z));
  });
  return group;
};

const buildDoorLeaf = (materials, width, height, side) => {
  const pivot = new THREE.Group();
  const leaf = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: '#2b1910', roughness: 0.5 });
  leaf.add(box(width, height, 0.12, wood, 0, height / 2, 0));
  [height * 0.28, height * 0.7].forEach((y) => {
    leaf.add(box(width * 0.7, height * 0.3, 0.16, materials.walnut, 0, y, 0));
  });
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 8, 20), materials.brass);
  handle.position.set(side * -width * 0.36, height * 0.48, 0.1);
  leaf.add(handle);
  leaf.position.x = side * -width / 2;
  pivot.add(leaf);
  return pivot;
};

const buildDoors = (materials) => {
  const door = DOORS.find((d) => d.id === 'entrance');
  const radius = door.width / 2;
  const leafHeight = door.height - radius;
  const z = (door.z0 + door.z1) / 2;
  const group = new THREE.Group();
  const leaves = [-1, 1].map((side) => {
    const pivot = buildDoorLeaf(materials, radius, leafHeight, side);
    pivot.position.set(door.x + side * radius, 0, z);
    group.add(pivot);
    return { pivot, side };
  });
  const fanlight = new THREE.Mesh(new THREE.CircleGeometry(radius, 32, 0, Math.PI), materials.glowWarm);
  fanlight.position.set(door.x, leafHeight, z);
  group.add(fanlight);
  const setOpen = (amount) => {
    leaves.forEach(({ pivot, side }) => {
      pivot.rotation.y = -side * DOOR_OPEN_ANGLE * amount;
    });
    fanlight.visible = amount < 0.98;
  };
  return { group, setOpen };
};

const buildLamps = (materials) => {
  const group = new THREE.Group();
  const halo = new THREE.SpriteMaterial({
    map: toTexture(glowCanvas(), { wrap: false }),
    color: PALETTE.warmLight,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.8,
  });
  [-8.6, 8.6].forEach((x) => {
    const z = 21.5;
    group.add(box(0.14, 3.6, 0.14, materials.ebony, x, PLAZA_LEVEL + 1.8, z));
    group.add(box(0.4, 0.55, 0.4, materials.glowWarm, x, PLAZA_LEVEL + 3.85, z));
    group.add(box(0.55, 0.08, 0.55, materials.ebony, x, PLAZA_LEVEL + 4.16, z));
    const sprite = new THREE.Sprite(halo);
    sprite.scale.set(2.6, 2.6, 1);
    sprite.position.set(x, PLAZA_LEVEL + 3.85, z);
    group.add(sprite);
  });
  return group;
};

/**
 * Everything outside: sky, plaza, steps, portico and the grand doors.
 * @returns {{ group: THREE.Group, setDoorsOpen: (amount: number) => void }}
 */
export function buildExterior(materials, museum) {
  const group = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: '#a89c88', map: withRepeat(toTexture(limestoneCanvas(53)), 0.5, 1), roughness: 0.85 });
  const columnStone = new THREE.MeshStandardMaterial({ color: '#bdb29e', roughness: 0.7 });
  group.add(buildSky());
  group.add(buildGround(columnStone));
  group.add(buildFacade(stone));
  group.add(buildPortico(materials, columnStone, museum));
  group.add(buildLamps(materials));
  const doors = buildDoors(materials);
  group.add(doors.group);
  return { group, setDoorsOpen: doors.setOpen };
}
