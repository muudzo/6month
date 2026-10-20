const MIN_SPAN = 0.05;

/**
 * Solid stretches of a wall (local x from -length/2 to length/2) between openings.
 * @param {number} length
 * @param {Array<{ offset: number, width: number }>} openings
 * @param {number} pad extra clearance either side of each opening
 * @returns {Array<[number, number]>}
 */
export function solidSpans(length, openings, pad) {
  const cuts = [...openings]
    .map(({ offset, width }) => [offset - width / 2 - pad, offset + width / 2 + pad])
    .sort((a, b) => a[0] - b[0]);
  const edges = [-length / 2, ...cuts.flat(), length / 2];
  return Array.from({ length: cuts.length + 1 }, (_, i) => [
    Math.max(-length / 2, edges[i * 2]),
    Math.min(length / 2, edges[i * 2 + 1]),
  ]).filter(([a, b]) => b - a > MIN_SPAN);
}
