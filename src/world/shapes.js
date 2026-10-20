import * as THREE from 'three';

/** A heart about 1.24 wide and 1.2 tall, centred on the origin, point down. */
export function heartShape(size = 1) {
  const s = (x, y) => [x * size, y * size];
  const shape = new THREE.Shape();
  shape.moveTo(...s(0, -0.6));
  shape.bezierCurveTo(...s(-0.15, -0.42), ...s(-0.62, -0.12), ...s(-0.62, 0.18));
  shape.bezierCurveTo(...s(-0.62, 0.5), ...s(-0.2, 0.62), ...s(0, 0.36));
  shape.bezierCurveTo(...s(0.2, 0.62), ...s(0.62, 0.5), ...s(0.62, 0.18));
  shape.bezierCurveTo(...s(0.62, -0.12), ...s(0.15, -0.42), ...s(0, -0.6));
  return shape;
}

export function heartGeometry(size, depth, bevel = depth * 0.4) {
  const geometry = new THREE.ExtrudeGeometry(heartShape(size), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 24,
  });
  geometry.center();
  return geometry;
}

const rectPath = (path, w, h) => {
  path.moveTo(-w / 2, -h / 2);
  path.lineTo(w / 2, -h / 2);
  path.lineTo(w / 2, h / 2);
  path.lineTo(-w / 2, h / 2);
  path.closePath();
  return path;
};

/** Rectangular band (a picture frame face), centred on the origin. */
export function ringShape(innerWidth, innerHeight, outerWidth, outerHeight) {
  const shape = rectPath(new THREE.Shape(), outerWidth, outerHeight);
  shape.holes.push(rectPath(new THREE.Path(), innerWidth, innerHeight));
  return shape;
}

/**
 * Wall outline from x = -length/2..length/2, y = 0..height, with round-arched
 * doorways cut into the bottom edge. Doors are part of the contour (not holes)
 * so triangulation stays robust.
 * @param {number} length
 * @param {number} height
 * @param {Array<{ offset: number, width: number, height: number }>} openings
 */
export function wallShape(length, height, openings) {
  const shape = new THREE.Shape();
  shape.moveTo(-length / 2, 0);
  [...openings]
    .sort((a, b) => a.offset - b.offset)
    .forEach(({ offset, width, height: doorHeight }) => {
      const radius = width / 2;
      shape.lineTo(offset - radius, 0);
      shape.lineTo(offset - radius, doorHeight - radius);
      shape.absarc(offset, doorHeight - radius, radius, Math.PI, 0, true);
      shape.lineTo(offset + radius, 0);
    });
  shape.lineTo(length / 2, 0);
  shape.lineTo(length / 2, height);
  shape.lineTo(-length / 2, height);
  shape.closePath();
  return shape;
}

/** U-shaped moulding that wraps a round-arched doorway. */
export function architraveShape(width, doorHeight, band) {
  const r = width / 2;
  const spring = doorHeight - r;
  const shape = new THREE.Shape();
  shape.moveTo(-r - band, 0);
  shape.lineTo(-r - band, spring);
  shape.absarc(0, spring, r + band, Math.PI, 0, true);
  shape.lineTo(r + band, 0);
  shape.lineTo(r, 0);
  shape.lineTo(r, spring);
  shape.absarc(0, spring, r, 0, Math.PI, false);
  shape.lineTo(-r, 0);
  shape.closePath();
  return shape;
}
