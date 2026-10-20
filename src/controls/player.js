import * as THREE from 'three';
import { EYE_HEIGHT, floorHeightAt, moveWithCollision } from '../lib/layout.js';
import { findPath } from '../lib/navigation.js';
import { omegaFromResponse, shortestAngle, smootherstep, stepSpring } from '../lib/spring.js';

const WALK_SPEED = 2.8;
const RUN_SPEED = 5.2;
const GLIDE_SPEED = 4.5;
const TURN_SPEED = 1.9;
const PITCH_LIMIT = 1.15;
const LOOK_SENSITIVITY = { mouse: 0.0042, pen: 0.0042, touch: 0.0068 };
const LOOK_MOMENTUM_DECAY = 7;
const TAP_SLOP_PX = 8;
const TAP_MAX_MS = 350;
const VELOCITY_OMEGA = omegaFromResponse(0.32);
const EYE_OMEGA = omegaFromResponse(0.7);
const SHORT_GLIDE = 2.5;

const MOVE_KEYS = Object.freeze({
  forward: ['KeyW', 'ArrowUp'],
  back: ['KeyS', 'ArrowDown'],
  left: ['KeyA'],
  right: ['KeyD'],
  turnLeft: ['ArrowLeft', 'KeyQ'],
  turnRight: ['ArrowRight', 'KeyE'],
});

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const yawToward = (from, to) => Math.atan2(from.x - to.x, from.z - to.z);
const pitchToward = (from, to) => Math.atan2(to.y - from.y, Math.hypot(to.x - from.x, to.z - from.z));
const blendAngle = (a, b, t) => a + shortestAngle(a, b) * t;
const isTyping = (target) => target instanceof HTMLElement && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName));
/** Arrow keys inside an overlay scroll it or move a slider; they must not walk. */
const isOverlayArrow = (event) => event.code.startsWith('Arrow') && event.target instanceof Element && event.target.closest('.placard, .modal');

/**
 * First-person visitor: walking, looking, tapping and gliding between exhibits.
 * @param {{
 *   camera: THREE.PerspectiveCamera,
 *   surface: HTMLElement,
 *   joystick: { readonly vector: { x: number, y: number } },
 *   reducedMotion: boolean,
 *   onTap: (x: number, y: number) => void,
 *   onHover: (x: number, y: number) => void,
 *   onInterrupt: () => void,
 *   onTeleport: (swap: () => void) => void,
 *   isInputBlocked: () => boolean,
 * }} options
 */
export function createPlayer({ camera, surface, joystick, reducedMotion, onTap, onHover, onInterrupt, onTeleport, isInputBlocked }) {
  let pose = { x: 0, z: 30, yaw: 0, pitch: 0.04 };
  let velocity = { x: { value: 0, velocity: 0 }, z: { value: 0, velocity: 0 } };
  let eye = { value: EYE_HEIGHT, velocity: 0 };
  let eyeTarget = EYE_HEIGHT;
  let lookMomentum = { yaw: 0, pitch: 0 };
  let mode = 'locked';
  let glide = null;
  let drag = null;
  const keys = new Set();
  const held = (names) => names.some((code) => keys.has(code));

  const look = (dYaw, dPitch) => {
    pose = { ...pose, yaw: pose.yaw + dYaw, pitch: clamp(pose.pitch + dPitch, -PITCH_LIMIT, PITCH_LIMIT) };
  };

  const interrupt = () => {
    if (mode !== 'glide' && mode !== 'focus') return;
    const wasHeadingSomewhere = glide?.nextMode === 'focus' || mode === 'focus';
    glide = null;
    mode = 'walk';
    eyeTarget = EYE_HEIGHT;
    if (wasHeadingSomewhere) onInterrupt();
  };

  const onKeyDown = (event) => {
    if (isTyping(event.target) || event.metaKey || event.ctrlKey || isInputBlocked() || isOverlayArrow(event)) return;
    keys.add(event.code);
  };
  const onKeyUp = (event) => keys.delete(event.code);
  const onBlur = () => keys.clear();

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    drag = { id: event.pointerId, type: event.pointerType, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, time: performance.now(), moved: false, samples: [] };
    lookMomentum = { yaw: 0, pitch: 0 };
    surface.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!drag || event.pointerId !== drag.id) {
      if (event.pointerType === 'mouse') onHover(event.clientX, event.clientY);
      return;
    }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag = { ...drag, x: event.clientX, y: event.clientY };
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > TAP_SLOP_PX) {
      drag = { ...drag, moved: true };
      if (mode === 'glide') interrupt();
    }
    if (!drag.moved || mode === 'locked' || mode === 'glide') return;
    const sensitivity = LOOK_SENSITIVITY[drag.type] ?? LOOK_SENSITIVITY.mouse;
    look(-dx * sensitivity, -dy * sensitivity);
    const now = performance.now();
    drag = { ...drag, samples: [...drag.samples.filter((s) => now - s.t < 90), { t: now, yaw: -dx * sensitivity, pitch: -dy * sensitivity }] };
  };

  const onPointerUp = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const elapsed = performance.now() - drag.time;
    if (!drag.moved && elapsed < TAP_MAX_MS) {
      onTap(event.clientX, event.clientY);
    } else if (drag.samples.length > 1 && !reducedMotion) {
      const span = Math.max(16, drag.samples[drag.samples.length - 1].t - drag.samples[0].t) / 1000;
      const sum = drag.samples.reduce((acc, s) => ({ yaw: acc.yaw + s.yaw, pitch: acc.pitch + s.pitch }), { yaw: 0, pitch: 0 });
      lookMomentum = { yaw: sum.yaw / span, pitch: sum.pitch / span };
    }
    drag = null;
  };

  const onPointerCancel = () => {
    drag = null;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  surface.addEventListener('pointerdown', onPointerDown);
  surface.addEventListener('pointermove', onPointerMove);
  surface.addEventListener('pointerup', onPointerUp);
  surface.addEventListener('pointercancel', onPointerCancel);

  const movementInput = () => {
    if (isInputBlocked()) return { forward: 0, strafe: 0, turn: 0, active: false };
    const stick = joystick.vector;
    const forward = (held(MOVE_KEYS.forward) ? 1 : 0) - (held(MOVE_KEYS.back) ? 1 : 0) + stick.y;
    const strafe = (held(MOVE_KEYS.right) ? 1 : 0) - (held(MOVE_KEYS.left) ? 1 : 0) + stick.x;
    const turn = (held(MOVE_KEYS.turnLeft) ? 1 : 0) - (held(MOVE_KEYS.turnRight) ? 1 : 0);
    const length = Math.hypot(forward, strafe);
    const scale = length > 1 ? 1 / length : 1;
    return { forward: forward * scale, strafe: strafe * scale, turn, active: length > 0.05 || turn !== 0 };
  };

  const walk = (dt) => {
    if (!drag && (lookMomentum.yaw || lookMomentum.pitch)) {
      look(lookMomentum.yaw * dt, lookMomentum.pitch * dt);
      const decay = Math.exp(-LOOK_MOMENTUM_DECAY * dt);
      lookMomentum = Math.abs(lookMomentum.yaw) + Math.abs(lookMomentum.pitch) < 0.01
        ? { yaw: 0, pitch: 0 }
        : { yaw: lookMomentum.yaw * decay, pitch: lookMomentum.pitch * decay };
    }
    const input = movementInput();
    if (input.active && mode === 'focus') interrupt();
    look(input.turn * TURN_SPEED * dt, 0);
    const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? RUN_SPEED : WALK_SPEED;
    const sin = Math.sin(pose.yaw);
    const cos = Math.cos(pose.yaw);
    const target = {
      x: (-sin * input.forward + cos * input.strafe) * speed,
      z: (-cos * input.forward - sin * input.strafe) * speed,
    };
    velocity = {
      x: stepSpring(velocity.x, target.x, VELOCITY_OMEGA, dt),
      z: stepSpring(velocity.z, target.z, VELOCITY_OMEGA, dt),
    };
    const next = moveWithCollision(pose, velocity.x.value * dt, velocity.z.value * dt);
    if (next.x === pose.x) velocity = { ...velocity, x: { value: 0, velocity: 0 } };
    if (next.z === pose.z) velocity = { ...velocity, z: { value: 0, velocity: 0 } };
    pose = { ...pose, ...next };
  };

  const stepGlide = (dt) => {
    const g = glide;
    const elapsed = g.elapsed + dt;
    const raw = Math.min(1, elapsed / g.duration);
    const t = smootherstep(raw);
    const point = g.curve.getPointAt(t);
    const tangent = g.curve.getTangentAt(Math.min(t, 0.999));
    const travelYaw = g.length > SHORT_GLIDE ? Math.atan2(-tangent.x, -tangent.z) : g.end.yaw;
    const settle = smootherstep((raw - 0.5) / 0.5);
    const headed = blendAngle(g.start.yaw, travelYaw, smootherstep(raw / 0.25));
    pose = {
      x: point.x,
      z: point.z,
      yaw: blendAngle(headed, g.end.yaw, settle),
      pitch: g.start.pitch + (g.end.pitch - g.start.pitch) * settle,
    };
    eye = { value: g.start.eye + (g.end.eye - g.start.eye) * settle, velocity: 0 };
    glide = { ...g, elapsed };
    if (raw < 1) return;
    mode = g.nextMode;
    eyeTarget = g.end.eye;
    glide = null;
    g.onArrive?.();
  };

  /**
   * Travel to a standing point, ending with a given view.
   * @param {{ x: number, z: number, y?: number, lookAt?: { x: number, y: number, z: number }, yaw?: number, pitch?: number }} target
   * @param {{ nextMode?: 'walk' | 'focus', path?: Array<{ x: number, z: number }>, duration?: number, onArrive?: () => void }} [options]
   */
  const glideTo = (target, { nextMode = 'walk', path, duration, onArrive } = {}) => {
    const endEye = target.y ?? EYE_HEIGHT;
    const eyePoint = { x: target.x, y: floorHeightAt(target.z) + endEye, z: target.z };
    const end = {
      yaw: target.lookAt ? yawToward(target, target.lookAt) : target.yaw ?? pose.yaw,
      pitch: target.lookAt ? pitchToward(eyePoint, target.lookAt) : target.pitch ?? 0,
      eye: endEye,
    };
    const route = path ?? findPath(pose, target) ?? [{ x: pose.x, z: pose.z }, { x: target.x, z: target.z }];
    const arrive = () => {
      pose = { x: target.x, z: target.z, yaw: end.yaw, pitch: end.pitch };
      eye = { value: end.eye, velocity: 0 };
      eyeTarget = end.eye;
      velocity = { x: { value: 0, velocity: 0 }, z: { value: 0, velocity: 0 } };
      mode = nextMode;
      glide = null;
      onArrive?.();
    };
    if (reducedMotion) {
      mode = 'glide';
      onTeleport(arrive);
      return;
    }
    const points = route.map((p) => new THREE.Vector3(p.x, 0, p.z));
    const curve = points.length > 2 ? new THREE.CatmullRomCurve3(points, false, 'centripetal') : new THREE.LineCurve3(points[0], points[1]);
    const length = curve.getLength();
    glide = {
      curve,
      length,
      elapsed: 0,
      duration: duration ?? clamp(length / GLIDE_SPEED + 0.6, 0.9, 7),
      start: { yaw: pose.yaw, pitch: pose.pitch, eye: eye.value },
      end,
      nextMode,
      onArrive: arrive,
    };
    lookMomentum = { yaw: 0, pitch: 0 };
    mode = 'glide';
  };

  const update = (dt) => {
    if (mode === 'glide' && glide) stepGlide(dt);
    else if (mode === 'walk' || mode === 'focus') walk(dt);
    if (mode !== 'glide') eye = stepSpring(eye, eyeTarget, EYE_OMEGA, dt);
    camera.position.set(pose.x, floorHeightAt(pose.z) + eye.value, pose.z);
    camera.rotation.set(pose.pitch, pose.yaw, 0);
  };

  return {
    update,
    glideTo,
    setPose: (next) => {
      pose = { ...pose, ...next };
    },
    /** Stand somewhere instantly, cancelling any glide in progress. */
    jumpTo: (next) => {
      glide = null;
      mode = 'walk';
      eyeTarget = EYE_HEIGHT;
      pose = { ...pose, ...next };
    },
    unlock: () => {
      mode = 'walk';
    },
    /** Leave focus mode (placard closed) and stand up straight again. */
    release: () => {
      if (mode === 'focus') mode = 'walk';
      eyeTarget = EYE_HEIGHT;
    },
    get mode() {
      return mode;
    },
    get pose() {
      return pose;
    },
  };
}
