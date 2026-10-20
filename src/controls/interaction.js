import * as THREE from 'three';

const MAX_PICK_DISTANCE = 14;
const PROMPT_DISTANCE = 5.5;
const PROBE_INTERVAL_S = 0.15;

/**
 * Finds what the visitor is pointing at, with walls blocking the view.
 * @param {{
 *   camera: THREE.Camera,
 *   surface: HTMLElement,
 *   interactables: Array<import('../world/types.js').Interactable>,
 *   occluders: THREE.Object3D[],
 * }} options
 */
export function createInteraction({ camera, surface, interactables, occluders }) {
  const raycaster = new THREE.Raycaster();
  raycaster.far = MAX_PICK_DISTANCE;
  const pointer = new THREE.Vector2();
  const owners = new Map();
  interactables.forEach((item) => item.hitTargets.forEach((mesh) => owners.set(mesh, item)));
  const pickables = [...owners.keys(), ...occluders];
  let enabled = new Set(interactables.map((item) => item.id));
  let hovered = null;
  let probeClock = 0;
  let inView = null;

  const castFrom = (ndcX, ndcY, far) => {
    pointer.set(ndcX, ndcY);
    raycaster.setFromCamera(pointer, camera);
    raycaster.far = far;
    const hits = raycaster.intersectObjects(pickables, true);
    const first = hits.find((hit) => {
      const owner = owners.get(hit.object);
      if (owner) return enabled.has(owner.id);
      return hit.object.isMesh && hit.object.visible;
    });
    return first ? owners.get(first.object) ?? null : null;
  };

  const toNdc = (clientX, clientY) => {
    const rect = surface.getBoundingClientRect();
    return [((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1];
  };

  const setHovered = (item) => {
    if (item === hovered) return;
    hovered?.setHover(false);
    hovered = item;
    hovered?.setHover(true);
    surface.style.cursor = hovered ? 'pointer' : '';
  };

  return {
    /** @returns {import('../world/types.js').Interactable | null} */
    pick: (clientX, clientY) => castFrom(...toNdc(clientX, clientY), MAX_PICK_DISTANCE),
    hover: (clientX, clientY) => setHovered(castFrom(...toNdc(clientX, clientY), MAX_PICK_DISTANCE)),
    clearHover: () => setHovered(null),
    /** Remove something from play (e.g. a heart once collected). */
    disable: (id) => {
      enabled = new Set([...enabled].filter((value) => value !== id));
      if (hovered?.id === id) setHovered(null);
    },
    /** What sits in the middle of the view, close enough to suggest tapping. */
    probe: (dt) => {
      probeClock += dt;
      if (probeClock < PROBE_INTERVAL_S) return inView;
      probeClock = 0;
      inView = castFrom(0, 0, PROMPT_DISTANCE);
      return inView;
    },
  };
}
