import * as THREE from 'three';
import { DOORS, LOBBY_COLUMNS, ROOMS } from '../lib/layout.js';
import { solidSpans } from '../lib/segments.js';
import { PALETTE } from './palette.js';
import { architraveShape, wallShape } from './shapes.js';
import {
  chevronParquetCanvas, cofferCanvas, concreteCanvas, damaskCanvas, fabricCanvas,
  limestoneCanvas, marbleCheckerCanvas, nightSkyCanvas, panelCanvas, plasterCanvas,
  toTexture, withRepeat,
} from './textures.js';

const WALL_THICKNESS = 0.3;
const EPSILON = 0.01;

/** Surface treatment per room. Tile sizes are in metres. */
const roomStyles = (materials) => {
  const marble = toTexture(marbleCheckerCanvas(11));
  return {
    lobby: {
      wall: { map: toTexture(limestoneCanvas()), tile: [2, 1], roughness: 0.85 },
      floor: { map: marble, tile: 2, roughness: 0.25 },
      ceiling: { map: toTexture(cofferCanvas({ beam: '#b8ab92', panel: '#cfc3ab', accent: PALETTE.gold })), tile: 2 },
      trim: materials.stoneDark,
      architrave: materials.stone,
    },
    gallery: {
      wall: { map: toTexture(fabricCanvas({ base: PALETTE.green })), tile: [0.5, 0.5], roughness: 0.95 },
      floor: { map: toTexture(chevronParquetCanvas({ tone: PALETTE.oak })), tile: 1.2, roughness: 0.45 },
      ceiling: { map: toTexture(cofferCanvas({ beam: '#1d2a24', panel: '#2a3b33', accent: PALETTE.gold })), tile: 2 },
      wainscot: 1.05,
      trim: materials.walnut,
      rail: materials.gold,
      crown: materials.gold,
      architrave: materials.gold,
      skylight: { x0: -1.8, x1: 1.8, z0: -34.5, z1: -4.1 },
    },
    salon: {
      wall: { map: toTexture(damaskCanvas()), tile: [1, 1], roughness: 0.8 },
      floor: { map: toTexture(chevronParquetCanvas({ tone: '#6e4526', seed: 9 })), tile: 1.2, roughness: 0.4 },
      ceiling: { map: toTexture(cofferCanvas({ beam: '#e9dfca', panel: '#d9ccb0', accent: PALETTE.gold })), tile: 2 },
      wainscot: 1.3,
      trim: materials.walnut,
      rail: materials.gold,
      crown: materials.gold,
      architrave: materials.gold,
      skylight: { x0: -4, x1: 4, z0: -50, z1: -41 },
    },
    future: {
      wall: { map: toTexture(plasterCanvas()), tile: [1, 1], roughness: 0.95 },
      floor: { map: toTexture(concreteCanvas()), tile: 3, roughness: 0.35 },
      ceiling: { map: toTexture(plasterCanvas({ base: '#f6f3ee', seed: 4 })), tile: 1 },
      trim: new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.6 }),
      architrave: new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.6 }),
      lightStrips: true,
    },
  };
};

const surface = ({ map, tile, roughness = 0.8 }, u, v) =>
  new THREE.MeshStandardMaterial({ map: withRepeat(map, u, v), roughness });

/** Doors on the room's +z (north) or -z (south) wall, in that wall's local x. */
const openingsFor = (room, side) => {
  const cx = (room.x0 + room.x1) / 2;
  return DOORS.filter((door) =>
    side === 'north' ? Math.abs(door.z0 - room.z1) < EPSILON : Math.abs(door.z1 - room.z0) < EPSILON,
  ).map((door) => ({
    offset: side === 'north' ? -(door.x - cx) : door.x - cx,
    width: door.width,
    height: door.height,
  }));
};

const wallPlacements = (room) => {
  const cx = (room.x0 + room.x1) / 2;
  const cz = (room.z0 + room.z1) / 2;
  const width = room.x1 - room.x0;
  const depth = room.z1 - room.z0;
  return [
    { side: 'north', length: width, position: [cx, 0, room.z1], rotationY: Math.PI },
    { side: 'south', length: width, position: [cx, 0, room.z0], rotationY: 0 },
    { side: 'west', length: depth, position: [room.x0, 0, cz], rotationY: Math.PI / 2 },
    { side: 'east', length: depth, position: [room.x1, 0, cz], rotationY: -Math.PI / 2 },
  ].map((p) => ({ ...p, openings: p.side === 'north' || p.side === 'south' ? openingsFor(room, p.side) : [] }));
};

const box = (w, h, d, material, x, y, z) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
};

const panelTexture = toTexture(panelCanvas());

/** Wainscot, chair rail, skirting and crown for one wall (in wall-local space). */
const wallTrim = (style, length, height, openings) => {
  const group = new THREE.Group();
  const spans = solidSpans(length, openings, 0.3);
  spans.forEach(([a, b]) => {
    const len = b - a;
    const mid = (a + b) / 2;
    if (style.wainscot) {
      const wood = new THREE.MeshStandardMaterial({ map: withRepeat(panelTexture, len / 1.1, 1), roughness: 0.5 });
      group.add(box(len, style.wainscot, 0.05, wood, mid, style.wainscot / 2, 0.025));
      group.add(box(len, 0.07, 0.09, style.rail, mid, style.wainscot, 0.045));
    }
    group.add(box(len, 0.2, 0.07, style.trim, mid, 0.1, 0.035));
  });
  if (style.crown) {
    group.add(box(length, 0.26, 0.12, style.crown, 0, height - 0.13, 0.06));
    group.add(box(length, 0.08, 0.22, style.crown, 0, height - 0.3, 0.11));
  }
  openings.forEach(({ offset, width, height: doorHeight }) => {
    const moulding = new THREE.Mesh(
      new THREE.ExtrudeGeometry(architraveShape(width, doorHeight, 0.26), { depth: 0.06, bevelEnabled: false, curveSegments: 24 }),
      style.architrave,
    );
    moulding.position.set(offset, 0, 0);
    group.add(moulding);
  });
  return group;
};

const buildWall = (placement, height, wallMaterial, revealMaterial, style) => {
  const geometry = new THREE.ExtrudeGeometry(wallShape(placement.length, height, placement.openings), {
    depth: WALL_THICKNESS,
    bevelEnabled: false,
    curveSegments: 24,
  });
  geometry.translate(0, 0, -WALL_THICKNESS);
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, [wallMaterial, revealMaterial]));
  group.add(wallTrim(style, placement.length, height, placement.openings));
  group.position.set(...placement.position);
  group.rotation.y = placement.rotationY;
  return group;
};

const ceilingShape = (room, skylight) => {
  const shape = new THREE.Shape();
  shape.moveTo(room.x0, room.z0);
  shape.lineTo(room.x1, room.z0);
  shape.lineTo(room.x1, room.z1);
  shape.lineTo(room.x0, room.z1);
  shape.closePath();
  if (skylight) {
    const hole = new THREE.Path();
    hole.moveTo(skylight.x0, skylight.z0);
    hole.lineTo(skylight.x0, skylight.z1);
    hole.lineTo(skylight.x1, skylight.z1);
    hole.lineTo(skylight.x1, skylight.z0);
    hole.closePath();
    shape.holes.push(hole);
  }
  return shape;
};

const skySurface = toTexture(nightSkyCanvas(77));

/** A recessed lantern in the ceiling, open to the night sky. */
const buildSkylight = (skylight, height, wellMaterial, goldMaterial) => {
  const group = new THREE.Group();
  const w = skylight.x1 - skylight.x0;
  const d = skylight.z1 - skylight.z0;
  const cx = (skylight.x0 + skylight.x1) / 2;
  const cz = (skylight.z0 + skylight.z1) / 2;
  const well = 0.9;
  const sides = new THREE.Mesh(new THREE.BoxGeometry(w, well, d), wellMaterial.clone());
  sides.material.side = THREE.BackSide;
  sides.position.set(cx, height + well / 2, cz);
  group.add(sides);
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: withRepeat(skySurface, w / 30, d / 15), fog: false }),
  );
  sky.rotation.x = Math.PI / 2;
  sky.position.set(cx, height + well - 0.01, cz);
  group.add(sky);
  [[w + 0.2, 0.12, cx, cz - d / 2], [w + 0.2, 0.12, cx, cz + d / 2]].forEach(([len, t, x, z]) =>
    group.add(box(len, t, t, goldMaterial, x, height - 0.04, z)),
  );
  [[d, cx - w / 2], [d, cx + w / 2]].forEach(([len, x]) => group.add(box(0.12, 0.12, len, goldMaterial, x, height - 0.04, cz)));
  return group;
};

const buildLightStrips = (room, glow) => {
  const group = new THREE.Group();
  [-2.4, 0, 2.4].forEach((x) => {
    group.add(box(0.08, 0.03, room.z1 - room.z0 - 3, glow, x, room.height - 0.02, (room.z0 + room.z1) / 2));
  });
  return group;
};

const flutedColumn = (height, radius, material, capMaterial) => {
  const group = new THREE.Group();
  const shaft = new THREE.CylinderGeometry(radius * 0.92, radius, height - 1.1, 64, 1, true);
  const pos = shaft.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const angle = Math.atan2(pos.getZ(i), pos.getX(i));
    const flute = 1 - 0.05 * Math.max(0, Math.cos(angle * 20)) ** 0.5;
    pos.setX(i, pos.getX(i) * flute);
    pos.setZ(i, pos.getZ(i) * flute);
  }
  shaft.computeVertexNormals();
  const shaftMesh = new THREE.Mesh(shaft, material);
  shaftMesh.position.y = (height - 1.1) / 2 + 0.55;
  group.add(shaftMesh);
  group.add(box(radius * 2.6, 0.3, radius * 2.6, capMaterial, 0, 0.15, 0));
  const torus = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.02, radius * 0.16, 10, 32), capMaterial);
  torus.rotation.x = Math.PI / 2;
  torus.position.y = 0.42;
  group.add(torus);
  const echinus = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.35, radius * 0.92, 0.35, 32), capMaterial);
  echinus.position.y = height - 0.6;
  group.add(echinus);
  group.add(box(radius * 2.9, 0.3, radius * 2.9, capMaterial, 0, height - 0.28, 0));
  return group;
};

const buildRoom = (room, style, materials) => {
  const group = new THREE.Group();
  group.name = room.id;
  const width = room.x1 - room.x0;
  const depth = room.z1 - room.z0;
  const cx = (room.x0 + room.x1) / 2;
  const cz = (room.z0 + room.z1) / 2;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    surface(style.floor, width / style.floor.tile, depth / style.floor.tile),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(cx, 0, cz);
  group.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.ShapeGeometry(ceilingShape(room, style.skylight)),
    surface(style.ceiling, 1 / style.ceiling.tile, 1 / style.ceiling.tile),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = room.height;
  group.add(ceiling);
  if (style.skylight) group.add(buildSkylight(style.skylight, room.height, ceiling.material, materials.gold));
  if (style.lightStrips) group.add(buildLightStrips(room, materials.glowWarm));

  const wallMaterial = surface(style.wall, 1 / style.wall.tile[0], 1 / style.wall.tile[1]);
  wallPlacements(room).forEach((placement) =>
    group.add(buildWall(placement, room.height, wallMaterial, materials.stone, style)),
  );
  return group;
};

/** Every interior room, the thresholds between them and the lobby colonnade. */
export function buildArchitecture(materials) {
  const group = new THREE.Group();
  const styles = roomStyles(materials);
  ROOMS.filter((room) => styles[room.id]).forEach((room) => group.add(buildRoom(room, styles[room.id], materials)));
  DOORS.forEach((door) => {
    group.add(box(door.width, 0.02, door.z1 - door.z0, materials.marbleFloor, door.x, 0.01, (door.z0 + door.z1) / 2));
  });
  const lobby = ROOMS.find((room) => room.id === 'lobby');
  LOBBY_COLUMNS.forEach(({ x, z }) => {
    const column = flutedColumn(lobby.height, 0.45, materials.marbleWhite, materials.stone);
    column.position.set(x, 0, z);
    group.add(column);
  });
  return group;
}
