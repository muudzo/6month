import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { omegaFromResponse, stepSpring } from '../lib/spring.js';
import { renderTargetType } from './gpu.js';

const FOV = 58;
const BLOOM = Object.freeze({ strength: 0.4, radius: 0.5, threshold: 1.05 });
const SHIFT_OMEGA = omegaFromResponse(0.45);
/** The bloom pipeline renders off-screen, where the canvas's own antialiasing doesn't apply. */
const MSAA_SAMPLES = 4;
/** Pixel ratio while moving: phones and small tablets render lighter so walking stays smooth. */
const MOVING_PIXEL_RATIO = Object.freeze({ high: 2, low: 1.5 });
/** Pixel ratio while standing still at a picture: full screen sharpness, now that the camera isn't moving. */
const STILL_PIXEL_RATIO = 3;

/** Phones and small tablets skip bloom and render at a lower pixel ratio while moving. */
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
  const deviceRatio = window.devicePixelRatio || 1;
  const movingRatio = Math.min(deviceRatio, MOVING_PIXEL_RATIO[quality]);
  const stillRatio = Math.min(deviceRatio, STILL_PIXEL_RATIO);
  let isStill = false;
  renderer.setPixelRatio(movingRatio);
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
    const ratio = renderer.getPixelRatio();
    const target = new THREE.WebGLRenderTarget(size.width * ratio, size.height * ratio, {
      type: renderTargetType(renderer),
      samples: MSAA_SAMPLES,
    });
    composer = new EffectComposer(renderer, target);
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
    /** Sharpen to the screen's full resolution while the camera rests on a picture. */
    setStill: (still) => {
      if (still === isStill) return;
      isStill = still;
      const ratio = still ? stillRatio : movingRatio;
      if (ratio === renderer.getPixelRatio()) return;
      renderer.setPixelRatio(ratio);
      composer?.setPixelRatio(ratio);
      resize();
    },
    get size() {
      return size;
    },
  };
}
