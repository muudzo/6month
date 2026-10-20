import * as THREE from 'three';
import { PALETTE } from './palette.js';
import { marbleCheckerCanvas, panelCanvas, toTexture } from './textures.js';

/** Materials shared across the building (room-specific surfaces live in architecture.js). */
export function createMaterials() {
  const marble = toTexture(marbleCheckerCanvas(41), { repeat: [0.5, 0.5] });
  const walnutGrain = toTexture(panelCanvas({ wood: PALETTE.walnut, seed: 2 }));
  return {
    gold: new THREE.MeshStandardMaterial({ color: '#d4a754', metalness: 1, roughness: 0.36 }),
    goldAntique: new THREE.MeshStandardMaterial({ color: '#94702f', metalness: 1, roughness: 0.42 }),
    brass: new THREE.MeshStandardMaterial({ color: PALETTE.brass, metalness: 1, roughness: 0.32 }),
    ebony: new THREE.MeshStandardMaterial({ color: '#141011', metalness: 0.1, roughness: 0.35 }),
    walnut: new THREE.MeshStandardMaterial({ color: '#6b4630', map: walnutGrain, roughness: 0.55 }),
    matBoard: new THREE.MeshStandardMaterial({ color: '#f1e9d8', roughness: 0.95 }),
    velvet: new THREE.MeshPhysicalMaterial({ color: PALETTE.velvet, roughness: 0.8, sheen: 1, sheenColor: '#ff8a9a' }),
    leather: new THREE.MeshStandardMaterial({ color: '#4a1a1c', roughness: 0.6 }),
    marbleWhite: new THREE.MeshStandardMaterial({ color: '#e6e0d6', roughness: 0.34, metalness: 0 }),
    marbleFloor: new THREE.MeshStandardMaterial({ map: marble, roughness: 0.28 }),
    stone: new THREE.MeshStandardMaterial({ color: PALETTE.limestone, roughness: 0.85 }),
    stoneDark: new THREE.MeshStandardMaterial({ color: PALETTE.limestoneDark, roughness: 0.9 }),
    candle: new THREE.MeshStandardMaterial({ color: '#f6eedd', roughness: 0.6 }),
    flame: new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.warmLight).multiplyScalar(4) }),
    crystal: new THREE.MeshStandardMaterial({ color: '#fff7ea', metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.75 }),
    glowWarm: new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.warmLight).multiplyScalar(2.2) }),
    heart: new THREE.MeshStandardMaterial({
      color: PALETTE.rose,
      emissive: new THREE.Color(PALETTE.rose),
      emissiveIntensity: 1.6,
      roughness: 0.3,
      metalness: 0.2,
    }),
  };
}
