/**
 * Shared JSDoc types for things a visitor can look at or tap.
 *
 * @typedef {'photo' | 'masterpiece' | 'sculpture' | 'future' | 'finale' | 'heart'} InteractableKind
 *
 * @typedef {Object} Slot
 * @property {{ x: number, y: number, z: number }} position centre of the artwork
 * @property {{ x: number, z: number }} normal direction the artwork faces
 *
 * @typedef {Object} Interactable
 * @property {string} id
 * @property {InteractableKind} kind
 * @property {Record<string, any>} data content shown on the placard
 * @property {import('three').Object3D} object root to add to the scene
 * @property {import('three').Object3D} [extras] floor-standing pieces placed in world space
 * @property {import('three').Object3D[]} hitTargets meshes that respond to taps
 * @property {Slot} slot where the camera frames it from
 * @property {{ width: number, height: number }} size framed size, for camera distance
 * @property {boolean} [isPlaceholder] photo file not added yet
 * @property {(on: boolean) => void} setHover
 * @property {(value: number) => void} [setReveal] masterpieces only: 0 painting .. 1 photo
 */

export {};
