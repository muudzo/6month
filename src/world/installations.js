import * as THREE from 'three';
import { CENTERPIECE_WALL, FINALE, ROOMS, SCULPTURE } from '../lib/layout.js';
import { elapsedSince, formatCount } from '../lib/dates.js';
import { PALETTE } from './palette.js';
import { createPhotoFrame } from './frames.js';
import { halo, signStand } from './furniture.js';
import { heartGeometry } from './shapes.js';
import { counterSign, headerSign, plaqueSign, reservedSign, wallTextSign } from './signage.js';
import { damaskCanvas, toTexture, withRepeat } from './textures.js';

const box = (w, h, d, material, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
};

const signPlane = (sign, width, material = {}) =>
  new THREE.Mesh(
    new THREE.PlaneGeometry(width, width / sign.aspect),
    new THREE.MeshBasicMaterial({ map: sign.texture, transparent: true, depthWrite: false, ...material }),
  );

const room = (id) => ROOMS.find((r) => r.id === id);

/** Freestanding wall in the salon that carries the centrepiece, Louvre style. */
export function centerpieceWall(materials) {
  const { x0, x1, z0, z1, height } = CENTERPIECE_WALL;
  const width = x1 - x0;
  const depth = z1 - z0;
  const damask = new THREE.MeshStandardMaterial({ map: withRepeat(toTexture(damaskCanvas({ seed: 8 })), width, height), roughness: 0.8 });
  const group = new THREE.Group();
  group.add(box(width, height, depth, damask, 0, height / 2, 0));
  group.add(box(width + 0.1, 1.3, depth + 0.06, materials.walnut, 0, 0.65, 0));
  group.add(box(width + 0.14, 0.08, depth + 0.1, materials.gold, 0, 1.3, 0));
  group.add(box(width + 0.3, 0.2, depth + 0.24, materials.gold, 0, height + 0.1, 0));
  group.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
  return group;
}

/** Lettering sits just proud of a title panel's painted face. */
const PANEL_FACE = 0.07;

/** Painted panel with a gilt edge that sets wall lettering off the stone. */
const titlePanel = (materials, width, height, color, x, y, z) => {
  const group = new THREE.Group();
  group.add(box(width + 0.1, height + 0.1, 0.03, materials.gold, 0, 0, 0.01));
  group.add(box(width, height, 0.04, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }), 0, 0, 0.02));
  group.position.set(x, y, z);
  return group;
};

/**
 * Lettering on the walls: welcome text, live counter and room headers.
 * @returns {{ group: THREE.Group, tick: (now: Date) => void }}
 */
export function wallTexts(materials, museum) {
  const group = new THREE.Group();
  const lobby = room('lobby');
  const front = lobby.z0 + 0.03;

  const welcomeSign = wallTextSign({ eyebrow: museum.museumName, title: museum.exhibitionTitle, body: museum.welcome });
  const welcome = signPlane(welcomeSign, 4.3);
  welcome.position.set(-4.6, 3.7, front + PANEL_FACE);
  group.add(titlePanel(materials, 4.8, 4.3 / welcomeSign.aspect + 0.7, PALETTE.oxbloodDeep, -4.6, 3.7, front));
  group.add(welcome);

  const since = museum.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const counter = counterSign({ eyebrow: `Open since ${since}` });
  const counterPlane = signPlane(counter, 3.9);
  counterPlane.position.set(4.6, 3.6, front + PANEL_FACE);
  group.add(titlePanel(materials, 4.5, 3.9 / counter.aspect + 0.7, PALETTE.greenDeep, 4.6, 3.6, front));
  group.add(counterPlane);

  const headers = [
    { sign: headerSign('Gallery I', 'The first six months'), width: 5.6, x: 0, y: 5.75, z: front, panel: PALETTE.ink },
    { sign: headerSign('The Masterpiece Salon', 'Three works of exceptional importance'), width: 4.4, x: 0, y: 5.3, z: room('gallery').z0 + 0.03 },
    { sign: headerSign('The Future Wing', 'Opening soon, and forever'), width: 5.4, x: 0, y: 5.6, z: room('salon').z0 + 0.03 },
  ];
  headers.forEach(({ sign, width, x, y, z, panel }) => {
    const plane = signPlane(sign, width);
    plane.position.set(x, y, panel ? z + PANEL_FACE : z);
    if (panel) group.add(titlePanel(materials, width + 0.3, width / sign.aspect + 0.2, panel, x, y, z));
    group.add(plane);
  });

  const future = room('future');
  const ending = signPlane(wallTextSign({
    eyebrow: 'The Future Wing',
    title: 'To be continued…',
    body: 'This wing is still under construction. Expected completion date: never. That is the whole point.',
    color: PALETTE.ink,
    accent: PALETTE.goldDeep,
  }), 6.6);
  ending.position.set(0, 3.2, future.z0 + 0.03);
  group.add(ending);

  let lastSecond = -1;
  const tick = (now) => {
    const second = Math.floor(now.getTime() / 1000);
    if (second === lastSecond) return;
    lastSecond = second;
    counter.draw(elapsedSince(museum.startDate, now), formatCount);
  };
  return { group, tick };
}

/** Polite rules on easels. */
export function lobbySigns(materials) {
  const group = new THREE.Group();
  group.add(signStand(materials, {
    x: 3.2, z: 1.9, rotationY: -0.45,
    eyebrow: 'House rules',
    lines: ['Please do not touch the art.', 'Holding hands with the curator is permitted.'],
  }));
  return group;
}

const plinth = (materials, width, height) => {
  const group = new THREE.Group();
  group.add(box(width, height, width, materials.marbleWhite, 0, height / 2, 0));
  group.add(box(width + 0.12, 0.1, width + 0.12, materials.gold, 0, height, 0));
  group.add(box(width + 0.16, 0.14, width + 0.16, materials.ebony, 0, 0.07, 0));
  return group;
};

/**
 * The marble heart on a plinth in the middle of the lobby.
 * @returns {import('./types.js').Interactable & { update: (t: number) => void }}
 */
export function sculpture(materials, museum) {
  const group = plinth(materials, 1.1, 1.1);
  const heart = new THREE.Mesh(heartGeometry(0.62, 0.34, 0.16), materials.marbleWhite);
  heart.position.y = 1.1 + 0.62;
  group.add(heart);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.44, 0.275),
    new THREE.MeshStandardMaterial({ map: plaqueSign({ eyebrow: 'In the lobby', ...museum.sculpture }).texture }),
  );
  label.position.set(0, 0.75, 0.56);
  group.add(label);
  group.position.set(SCULPTURE.x, 0, SCULPTURE.z);
  return {
    id: 'sculpture',
    kind: 'sculpture',
    data: { ...museum.sculpture, eyebrow: 'Sculpture · The Grand Lobby' },
    object: group,
    hitTargets: [heart, label],
    slot: { position: { x: SCULPTURE.x, y: 1.6, z: SCULPTURE.z }, normal: { x: 0, z: 1 } },
    size: { width: 1.4, height: 1.6 },
    setHover: (on) => heart.scale.setScalar(on ? 1.04 : 1),
    update: (t) => {
      heart.rotation.y = Math.sin(t * 0.35) * 0.6;
    },
  };
}

const FUTURE_SLOTS = [
  { x: -5 + 0.06, z: -68.5, side: 1 },
  { x: 5 - 0.06, z: -68.5, side: -1 },
  { x: -5 + 0.06, z: -73.8, side: 1 },
  { x: 5 - 0.06, z: -73.8, side: -1 },
];

/** Empty frames in the Future Wing. */
export function futureFrames(materials, titles) {
  return titles.slice(0, FUTURE_SLOTS.length).map((title, i) => {
    const { x, z, side } = FUTURE_SLOTS[i];
    const width = 1.3;
    const height = 1.0;
    const frame = createPhotoFrame({ width, height, index: 0, materials });
    const linen = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: reservedSign(title).texture }));
    linen.position.z = frame.photoZ;
    const group = new THREE.Group();
    group.add(frame.group, linen);
    group.position.set(x, 1.65, z);
    group.rotation.y = side * (Math.PI / 2);
    return {
      id: `future-${i + 1}`,
      kind: 'future',
      data: {
        eyebrow: 'The Future Wing',
        title: `Reserved: ${title}`,
        medium: 'Acquisition pending',
        note: 'This frame is empty on purpose. The curator is saving it for something we haven’t done yet.',
      },
      object: group,
      hitTargets: [linen],
      slot: { position: { x, y: 1.65, z }, normal: { x: side, z: 0 } },
      size: { width: frame.outerWidth, height: frame.outerHeight },
      setHover: (on) => linen.material.color.setScalar(on ? 1.15 : 1),
    };
  });
}

/**
 * A sealed letter on a plinth at the very end of the museum.
 * @returns {import('./types.js').Interactable & { update: (t: number) => void }}
 */
export function finale(materials) {
  const group = plinth(materials, 0.8, 1.0);
  const envelope = new THREE.Group();
  const paper = new THREE.MeshStandardMaterial({ color: PALETTE.ivory, roughness: 0.9 });
  envelope.add(box(0.5, 0.02, 0.34, paper));
  const flap = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-0.25, 0), new THREE.Vector2(0.25, 0), new THREE.Vector2(0, -0.2)])),
    new THREE.MeshStandardMaterial({ color: '#e9dfc8', roughness: 0.9, side: THREE.DoubleSide }),
  );
  flap.rotation.x = -Math.PI / 2;
  flap.position.set(0, 0.012, -0.17);
  envelope.add(flap);
  const seal = new THREE.Mesh(heartGeometry(0.06, 0.02, 0.008), new THREE.MeshStandardMaterial({ color: '#9c1b2c', roughness: 0.4 }));
  seal.rotation.x = -Math.PI / 2;
  seal.position.set(0, 0.025, 0.02);
  envelope.add(seal);
  envelope.position.y = 1.08;
  envelope.rotation.y = 0.18;
  group.add(envelope);
  const glow = new THREE.Sprite(halo().clone());
  glow.scale.setScalar(1.4);
  glow.position.y = 1.15;
  group.add(glow);
  group.position.set(FINALE.x, 0, FINALE.z);
  return {
    id: 'finale',
    kind: 'finale',
    data: { title: 'A letter, sealed', eyebrow: 'For the guest of honour' },
    object: group,
    hitTargets: [envelope.children[0], flap, seal],
    slot: { position: { x: FINALE.x, y: 1.2, z: FINALE.z }, normal: { x: 0, z: 1 } },
    size: { width: 1.2, height: 1.3 },
    setHover: (on) => envelope.scale.setScalar(on ? 1.08 : 1),
    update: (t) => {
      glow.material.opacity = 0.5 + Math.sin(t * 2) * 0.2;
      envelope.position.y = 1.08 + Math.sin(t * 1.5) * 0.015;
    },
  };
}
