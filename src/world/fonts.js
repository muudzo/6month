const FONT_TIMEOUT_MS = 4000;

const FACES = [
  '400 48px "Bodoni Moda"',
  'italic 400 48px "Bodoni Moda"',
  '700 48px "Bodoni Moda"',
  '400 24px "Jost"',
  '500 24px "Jost"',
];

/**
 * Wait for the web fonts so canvas-drawn signage uses them. Falls back to the
 * system stacks if the fonts are slow or blocked, rather than hanging the load.
 * @returns {Promise<boolean>} whether every face loaded
 */
export async function ensureFonts() {
  if (!document.fonts?.load) return false;
  const timeout = new Promise((resolve) => setTimeout(() => resolve(false), FONT_TIMEOUT_MS));
  const loads = Promise.all(FACES.map((face) => document.fonts.load(face)))
    .then((results) => results.every((faces) => faces.length > 0))
    .catch(() => false);
  return Promise.race([loads, timeout]);
}
