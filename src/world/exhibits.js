import * as THREE from 'three';
import { fitSize } from '../lib/layout.js';
import { PALETTE } from './palette.js';
import { createOrnateFrame, createPhotoFrame } from './frames.js';
import { arcPoints, pictureLight, signStand, velvetRope } from './furniture.js';
import { masterpieceMaterial, paintify } from './paintify.js';
import { plaqueSign } from './signage.js';
import { toTexture, wallWashCanvas } from './textures.js';

/** Photo whites stay below the bloom threshold, so pictures never glow. */
const PICTURE_LEVEL = 1;
const WALL_LABEL_HEIGHT = 1.42;

let washTexture = null;
const wallWash = (width, height, intensity) => {
  washTexture ??= toTexture(wallWashCanvas(), { wrap: false });
  const material = new THREE.MeshBasicMaterial({
    map: washTexture,
    color: new THREE.Color(PALETTE.warmLight).multiplyScalar(intensity),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.position.set(0, height * 0.12, 0.004);
  return mesh;
};

const photoTexture = (canvas, anisotropy) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.onUpdate = () => {
    // The GPU holds its own copy now; shrinking the canvas frees the decoded pixels.
    texture.onUpdate = null;
    canvas.width = 1;
    canvas.height = 1;
  };
  return texture;
};

const plaque = (exhibit, width) => {
  const sign = plaqueSign(exhibit);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, width / sign.aspect),
    new THREE.MeshStandardMaterial({ map: sign.texture, roughness: 0.7 }),
  );
};

const place = (group, slot) => {
  group.position.set(slot.position.x, slot.position.y, slot.position.z);
  group.rotation.y = slot.rotationY;
  return group;
};

/**
 * A photograph in Gallery I.
 * @returns {import('./types.js').Interactable}
 */
export function buildPhotoExhibit({ exhibit, slot, photo, index, materials, anisotropy }) {
  const aspect = photo.canvas.width / photo.canvas.height;
  const { width, height } = fitSize(aspect, slot.maxWidth, slot.maxHeight);
  const frame = createPhotoFrame({ width, height, index, materials });
  const group = new THREE.Group();
  group.add(wallWash(frame.outerWidth * 2.2, frame.outerHeight * 2.6, 0.32));
  group.add(frame.group);

  const pictureMaterial = new THREE.MeshBasicMaterial({
    map: photoTexture(photo.canvas, anisotropy),
    color: new THREE.Color().setScalar(PICTURE_LEVEL),
  });
  const picture = new THREE.Mesh(new THREE.PlaneGeometry(width, height), pictureMaterial);
  picture.position.z = frame.photoZ;
  group.add(picture);
  group.add(pictureLight(materials, { width: frame.outerWidth * 0.55, top: frame.outerHeight / 2 }));

  const label = plaque(exhibit, 0.34);
  label.position.set(frame.outerWidth / 2 + 0.34, WALL_LABEL_HEIGHT - slot.position.y, 0.01);
  group.add(label);

  return {
    id: exhibit.id,
    kind: 'photo',
    data: exhibit,
    object: place(group, slot),
    hitTargets: [picture, label],
    slot,
    size: { width: frame.outerWidth, height: frame.outerHeight },
    isPlaceholder: photo.isPlaceholder,
    setHover: (on) => pictureMaterial.color.setScalar(on ? PICTURE_LEVEL * 1.06 : PICTURE_LEVEL),
  };
}

const glassPane = (width, height) =>
  new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorld;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          vNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vWorld;
        varying vec3 vNormal;
        void main() {
          vec3 view = normalize(cameraPosition - vWorld);
          float fresnel = pow(1.0 - abs(dot(view, vNormal)), 3.0);
          float diagonal = vUv.x * 0.8 + vUv.y;
          float streaks = smoothstep(0.08, 0.0, abs(diagonal - 0.55)) * 0.6 + smoothstep(0.03, 0.0, abs(diagonal - 0.78)) * 0.4;
          vec3 tint = vec3(0.85, 0.92, 1.0);
          gl_FragColor = vec4(tint * (0.015 + fresnel * 0.3 + streaks * 0.045), 1.0);
        }
      `,
    }),
  );

const barrierFor = (slotIndex, slot) => {
  if (slotIndex === 0) {
    return arcPoints({ x: slot.position.x, z: slot.position.z, radius: 3.1, count: 7 });
  }
  const wallX = slot.position.x + slot.normal.x * 0.25;
  const frontX = slot.position.x + slot.normal.x * 1.7;
  return [
    { x: wallX, z: slot.position.z - 2.8 },
    { x: frontX, z: slot.position.z - 2.8 },
    { x: frontX, z: slot.position.z },
    { x: frontX, z: slot.position.z + 2.8 },
    { x: wallX, z: slot.position.z + 2.8 },
  ];
};

/**
 * One of the three masterpieces in the salon, painted on the GPU.
 * @returns {import('./types.js').Interactable}
 */
export function buildMasterpiece({ exhibit, slot, slotIndex, photo, renderer, materials, anisotropy }) {
  const aspect = photo.canvas.width / photo.canvas.height;
  const { width, height } = fitSize(aspect, slot.maxWidth, slot.maxHeight);
  const photoTex = photoTexture(photo.canvas, anisotropy);
  const painting = paintify(renderer, photoTex, { width: photo.canvas.width, height: photo.canvas.height, style: exhibit.style });
  painting.anisotropy = anisotropy;
  const material = masterpieceMaterial(photoTex, painting);

  const frame = createOrnateFrame({ width, height, materials });
  const group = new THREE.Group();
  group.add(wallWash(frame.outerWidth * 2.1, frame.outerHeight * 2.3, 0.26));
  group.add(frame.group);
  const canvas = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  canvas.position.z = frame.photoZ;
  group.add(canvas);

  if (slotIndex === 0) {
    const glass = glassPane(frame.outerWidth + 0.2, frame.outerHeight + 0.1);
    glass.position.set(0, 0.2, 0.42);
    group.add(glass);
  }

  const label = plaque(exhibit, 0.56);
  label.position.set(frame.outerWidth / 2 + 0.55, WALL_LABEL_HEIGHT - slot.position.y + 0.1, 0.01);
  group.add(label);
  place(group, slot);

  const extras = new THREE.Group();
  extras.add(velvetRope(materials, barrierFor(slotIndex, slot)));

  return {
    id: exhibit.id,
    kind: 'masterpiece',
    data: exhibit,
    object: group,
    extras,
    hitTargets: [canvas, label],
    slot,
    size: { width: frame.outerWidth, height: frame.outerHeight },
    isPlaceholder: photo.isPlaceholder,
    setHover: (on) => {
      material.uniforms.uGlow.value = on ? 1 : 0;
    },
    setReveal: (value) => {
      material.uniforms.uReveal.value = value;
    },
  };
}

/** The salon's rules, in the voice of a very serious museum. */
export function salonSigns(materials) {
  const group = new THREE.Group();
  group.add(signStand(materials, {
    x: -3.4, z: -48.6, rotationY: 0.35,
    eyebrow: 'Queue for the masterpiece',
    lines: ['Estimated wait: 0 minutes.', 'You are the only visitor allowed in tonight.'],
  }));
  group.add(signStand(materials, {
    x: 3.6, z: -48.4, rotationY: -0.35,
    eyebrow: 'Please note',
    lines: ['Kept behind glass because it is irreplaceable.', 'No flash photography.', 'Staring is encouraged.'],
  }));
  return group;
}
