import { makeCanvas } from './textures.js';
import { placeholderCanvas } from './placeholder.js';

/** Phone photos are ~4000px; nothing in the museum renders larger than this. */
const MAX_SIDE = 1600;

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });

/** Downscale (and bake in EXIF rotation, which drawImage honours). */
const toCanvas = (img) => {
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = makeCanvas(Math.round(img.naturalWidth * scale), Math.round(img.naturalHeight * scale));
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * Load an exhibit's photo, or paint a placeholder if the file isn't there yet.
 * @param {{ src: string, kind: string, style?: string }} exhibit
 * @param {number} index
 * @returns {Promise<{ canvas: HTMLCanvasElement, isPlaceholder: boolean }>}
 */
export async function loadPhoto(exhibit, index) {
  const url = `${import.meta.env.BASE_URL}${exhibit.src.replace(/^\/+/, '')}`;
  try {
    const img = await loadImage(url);
    return { canvas: toCanvas(img), isPlaceholder: false };
  } catch {
    return {
      canvas: placeholderCanvas({ index, src: `public/${exhibit.src}`, kind: exhibit.kind, style: exhibit.style }),
      isPlaceholder: true,
    };
  }
}
