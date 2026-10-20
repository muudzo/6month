/** Mid-grey a painting should average out to (display brightness, 0..1). */
const TARGET_MEAN = 0.42;
const MAX_GAIN = 2.2;

/**
 * Average perceived brightness (Rec. 601 weights) of RGBA pixel data, 0..1.
 * @param {Uint8ClampedArray} rgba
 * @returns {number}
 */
export function meanLuminance(rgba) {
  const pixels = rgba.length / 4;
  if (pixels === 0) return 0;
  let sum = 0;
  for (let i = 0; i < rgba.length; i += 4) sum += 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  return sum / pixels / 255;
}

/**
 * How much to lift a photo before painting it, so night-time shots don't
 * turn into murky canvases. 1 means leave it alone.
 * @param {number} mean average brightness from meanLuminance
 * @returns {number}
 */
export function exposureGain(mean) {
  if (mean <= 0) return MAX_GAIN;
  return Math.min(MAX_GAIN, Math.max(1, TARGET_MEAN / mean));
}
