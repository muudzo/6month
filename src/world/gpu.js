import * as THREE from 'three';

/**
 * Best render-target type this GPU can draw into. Half-float avoids banding in
 * dark gradients; plain bytes are the universal fallback (some older phones).
 * @param {THREE.WebGLRenderer} renderer
 */
export function renderTargetType(renderer) {
  const canRenderHalfFloat =
    renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
  return canRenderHalfFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;
}
