import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { omegaFromResponse, stepSpring } from '../lib/spring.js';

const FOV = 58;
const BLOOM = Object.freeze({ strength: 0.5, radius: 0.55, threshold: 0.95 });
const SHIFT_OMEGA = omegaFromResponse(0.45);

/** Phones and small tablets skip bloom and render at a lower pixel ratio. */
export function detectQuality() {
  const forced = new URLSearchParams(window.location.search).get('quality');
  if (forced === 'low' || forced === 'high') return forced;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  return coarse || window.innerWidth < 820 ? 'low' : 'high';
}

/**
 * Renderer, camera and (on capable devices) bloom.
 * The camera view can be shifted so artwork stays centred beside the placard.
 * @param {HTMLElement} container
 * @param {'low' | 'high'} quality
 */
export function createStage(container, quality) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 900);
  camera.rotation.order = 'YXZ';

  let composer = null;
  let bloom = null;
  let shift = { x: { value: 0, velocity: 0 }, y: { value: 0, velocity: 0 } };
  let shiftTarget = { x: 0, y: 0 };
  let size = { width: 1, height: 1 };

  const resize = () => {
    size = { width: container.clientWidth || window.innerWidth, height: container.clientHeight || window.innerHeight };
    renderer.setSize(size.width, size.height);
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    composer?.setSize(size.width, size.height);
    bloom?.setSize(size.width, size.height);
  };

  const attach = (scene) => {
    if (quality !== 'high') return;
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), BLOOM.strength, BLOOM.radius, BLOOM.threshold);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    resize();
  };

  const applyShift = (dt) => {
    shift = {
      x: stepSpring(shift.x, shiftTarget.x, SHIFT_OMEGA, dt),
      y: stepSpring(shift.y, shiftTarget.y, SHIFT_OMEGA, dt),
    };
    const settled = Math.abs(shift.x.value) < 0.5 && Math.abs(shift.y.value) < 0.5 && shiftTarget.x === 0 && shiftTarget.y === 0;
    if (settled) {
      camera.clearViewOffset();
      return;
    }
    camera.setViewOffset(size.width, size.height, shift.x.value, shift.y.value, size.width, size.height);
  };

  const render = (scene, dt) => {
    applyShift(dt);
    if (composer) composer.render(dt);
    else renderer.render(scene, camera);
  };

  window.addEventListener('resize', resize);
  resize();

  return {
    renderer,
    camera,
    canvas: renderer.domElement,
    attach,
    render,
    /** Pixels to slide the picture by (positive x moves the scene left). */
    setViewShift: (x, y) => {
      shiftTarget = { x, y };
    },
    get size() {
      return size;
    },
  };
}
