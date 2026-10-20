import * as THREE from 'three';
import { PALETTE } from './palette.js';

let maxAnisotropy = 1;

/** @param {number} value */
export function setMaxAnisotropy(value) {
  maxAnisotropy = value;
}

/** Deterministic PRNG (mulberry32) so the building looks the same on every visit. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function rgba(hex, alpha) {
  const c = new THREE.Color(hex);
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha})`;
}

export function shade(hex, amount) {
  const c = new THREE.Color(hex);
  const hsl = c.getHSL({ h: 0, s: 0, l: 0 });
  return `#${new THREE.Color().setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + amount))).getHexString()}`;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ repeat?: [number, number], srgb?: boolean, wrap?: boolean }} [options]
 */
export function toTexture(canvas, { repeat = [1, 1], srgb = true, wrap = true } = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  if (wrap) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/** A copy sharing the same image (uploaded once) with its own tiling. */
export function withRepeat(texture, u, v) {
  const copy = texture.clone();
  copy.repeat.set(u, v);
  copy.needsUpdate = true;
  return copy;
}

const speckle = (ctx, w, h, random, count, color, maxAlpha) => {
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = rgba(color, random() * maxAlpha);
    ctx.fillRect(random() * w, random() * h, 1 + random() * 2, 1 + random() * 2);
  }
};

const paintMarble = (ctx, x, y, size, base, vein, random) => {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();
  ctx.fillStyle = base;
  ctx.fillRect(x, y, size, size);
  for (let i = 0; i < 36; i += 1) {
    const cx = x + random() * size;
    const cy = y + random() * size;
    const r = (0.1 + random() * 0.45) * size;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    glow.addColorStop(0, rgba(vein, 0.07));
    glow.addColorStop(1, rgba(vein, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, size, size);
  }
  for (let v = 0; v < 9; v += 1) {
    let px = x + random() * size;
    let py = y + random() * size;
    let angle = random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 70; s += 1) {
      angle += (random() - 0.5) * 0.55;
      px += Math.cos(angle) * size * 0.025;
      py += Math.sin(angle) * size * 0.025;
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = rgba(vein, 0.12 + random() * 0.35);
    ctx.lineWidth = 0.6 + random() * 2.4;
    ctx.stroke();
  }
  speckle(ctx, size, size, random, 900, vein, 0.08);
  ctx.restore();
};

/** 2 x 2 checker of Carrara and Nero Marquina marble; one tile = 1 m. */
export function marbleCheckerCanvas(seed = 11) {
  const size = 1024;
  const tile = size / 2;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 2; c += 1) {
      const isWhite = (r + c) % 2 === 0;
      paintMarble(
        ctx, c * tile, r * tile, tile,
        isWhite ? PALETTE.marbleWhite : PALETTE.marbleBlack,
        isWhite ? PALETTE.marbleVein : PALETTE.marbleBlackVein,
        random,
      );
    }
  }
  ctx.strokeStyle = 'rgba(10, 8, 6, 0.45)';
  ctx.lineWidth = 3;
  [0, tile, size].forEach((p) => {
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
  });
  return canvas;
}

/** Parisian chevron parquet; the canvas represents 1.2 m square. */
export function chevronParquetCanvas({ tone = PALETTE.oak, seed = 7 } = {}) {
  const size = 1024;
  const column = 512;
  const plank = 128;
  const rows = size / plank;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  const tones = [0, 1].map(() => Array.from({ length: rows }, () => shade(tone, (random() - 0.5) * 0.12)));
  ctx.fillStyle = shade(tone, -0.25);
  ctx.fillRect(0, 0, size, size);

  for (let c = 0; c < 2; c += 1) {
    const x0 = c * column;
    for (let r = -rows; r < rows * 2; r += 1) {
      const y = r * plank;
      const top = c === 0 ? [y, y - column] : [y - column, y];
      const slope = top[1] - top[0];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x0, top[0]);
      ctx.lineTo(x0 + column, top[1]);
      ctx.lineTo(x0 + column, top[1] + plank);
      ctx.lineTo(x0, top[0] + plank);
      ctx.closePath();
      ctx.fillStyle = tones[c][((r % rows) + rows) % rows];
      ctx.fill();
      ctx.clip();
      for (let g = 0; g < 10; g += 1) {
        const offset = top[0] + (g / 10) * plank + random() * 6;
        ctx.strokeStyle = rgba(PALETTE.walnut, 0.08 + random() * 0.1);
        ctx.lineWidth = 1 + random();
        ctx.beginPath();
        ctx.moveTo(x0, offset);
        ctx.lineTo(x0 + column, offset + slope);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(25, 12, 5, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, top[0]);
      ctx.lineTo(x0 + column, top[1]);
      ctx.stroke();
    }
  }
  return canvas;
}

const drawMedallion = (ctx, cx, cy, color) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = rgba(color, 0.55);
  ctx.fillStyle = rgba(color, 0.32);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -210);
  ctx.bezierCurveTo(70, -150, 150, -60, 110, 0);
  ctx.bezierCurveTo(150, 60, 70, 150, 0, 210);
  ctx.bezierCurveTo(-70, 150, -150, 60, -110, 0);
  ctx.bezierCurveTo(-150, -60, -70, -150, 0, -210);
  ctx.stroke();
  const petal = (angle) => {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(38, -40, 30, -110, 0, -140);
    ctx.bezierCurveTo(-30, -110, -38, -40, 0, 0);
    ctx.fill();
    ctx.restore();
  };
  [0, Math.PI, Math.PI / 2, -Math.PI / 2].forEach(petal);
  [Math.PI / 4, -Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4].forEach((a) => {
    ctx.save();
    ctx.rotate(a);
    ctx.scale(0.55, 0.55);
    petal(0);
    ctx.restore();
  });
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fillStyle = rgba(color, 0.6);
  ctx.fill();
  ctx.restore();
};

/** Tone-on-tone silk damask; the canvas represents 1 m square. */
export function damaskCanvas({ base = PALETTE.oxblood, motif = '#9a3341', seed = 3 } = {}) {
  const size = 512;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 2) {
    ctx.fillStyle = rgba('#ffffff', random() * 0.025);
    ctx.fillRect(x, 0, 1, size);
  }
  [[256, 256], [0, 0], [512, 0], [0, 512], [512, 512]].forEach(([x, y]) => drawMedallion(ctx, x, y, motif));
  speckle(ctx, size, size, random, 1500, '#000000', 0.12);
  return canvas;
}

/** Woven wall fabric; the canvas represents 0.5 m square. */
export function fabricCanvas({ base = PALETTE.green, seed = 5 } = {}) {
  const size = 256;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < size; i += 2) {
    ctx.fillStyle = rgba('#ffffff', 0.02 + random() * 0.02);
    ctx.fillRect(0, i, size, 1);
    ctx.fillStyle = rgba('#000000', 0.03 + random() * 0.03);
    ctx.fillRect(i, 0, 1, size);
  }
  speckle(ctx, size, size, random, 800, '#000000', 0.15);
  return canvas;
}

/** Ashlar limestone blocks 1 m x 0.5 m; the canvas represents 2 m x 1 m. */
export function limestoneCanvas(seed = 13) {
  const canvas = makeCanvas(1024, 512);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  const bw = 512;
  const bh = 256;
  for (let row = 0; row < 2; row += 1) {
    for (let col = -1; col < 3; col += 1) {
      const x = col * bw + (row % 2) * (bw / 2);
      const y = row * bh;
      ctx.fillStyle = shade(PALETTE.limestone, (random() - 0.5) * 0.06);
      ctx.fillRect(x, y, bw, bh);
      const light = ctx.createLinearGradient(x, y, x, y + bh);
      light.addColorStop(0, 'rgba(255,255,255,0.10)');
      light.addColorStop(0.1, 'rgba(255,255,255,0)');
      light.addColorStop(0.9, 'rgba(0,0,0,0)');
      light.addColorStop(1, 'rgba(0,0,0,0.14)');
      ctx.fillStyle = light;
      ctx.fillRect(x, y, bw, bh);
      ctx.strokeStyle = rgba(PALETTE.limestoneDark, 0.9);
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, bw, bh);
    }
  }
  speckle(ctx, 1024, 512, random, 5000, '#3b3226', 0.18);
  return canvas;
}

export function plasterCanvas({ base = PALETTE.plaster, seed = 17 } = {}) {
  const canvas = makeCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  speckle(ctx, 256, 256, seededRandom(seed), 2500, '#6b665e', 0.06);
  return canvas;
}

/** Large flagstones; the canvas represents 4 m square. */
export function flagstoneCanvas(seed = 19) {
  const canvas = makeCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      ctx.fillStyle = shade('#57524b', (random() - 0.5) * 0.08);
      ctx.fillRect(c * 256, r * 256, 256, 256);
    }
  }
  speckle(ctx, 1024, 1024, random, 9000, '#000000', 0.25);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 5;
  for (let p = 0; p <= 1024; p += 256) {
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 1024); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(1024, p); ctx.stroke();
  }
  return canvas;
}

export function concreteCanvas(seed = 23) {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  ctx.fillStyle = '#bdb8b0';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i += 1) {
    const x = random() * 512;
    const y = random() * 512;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 40 + random() * 90);
    g.addColorStop(0, rgba('#8f8a82', 0.12));
    g.addColorStop(1, rgba('#8f8a82', 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  }
  speckle(ctx, 512, 512, random, 4000, '#4b4741', 0.12);
  return canvas;
}

/** Coffered ceiling panel; the canvas represents 2 m square. */
export function cofferCanvas({ beam = '#2a221b', panel = '#3a2f25', accent = PALETTE.gold } = {}) {
  const size = 512;
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = beam;
  ctx.fillRect(0, 0, size, size);
  const inset = 56;
  const inner = size - inset * 2;
  for (let step = 0; step < 4; step += 1) {
    const pad = inset + step * 14;
    ctx.fillStyle = shade(panel, -0.05 + step * 0.03);
    ctx.fillRect(pad, pad, size - pad * 2, size - pad * 2);
  }
  ctx.strokeStyle = rgba(accent, 0.8);
  ctx.lineWidth = 4;
  ctx.strokeRect(inset, inset, inner, inner);
  const rosette = ctx.createRadialGradient(256, 256, 0, 256, 256, 46);
  rosette.addColorStop(0, rgba(accent, 1));
  rosette.addColorStop(0.6, rgba(accent, 0.6));
  rosette.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = rosette;
  ctx.beginPath();
  ctx.arc(256, 256, 46, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

/** Raised walnut panels for wainscoting; the canvas represents one 1 m panel. */
export function panelCanvas({ wood = PALETTE.walnut, seed = 29 } = {}) {
  const canvas = makeCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  ctx.fillStyle = wood;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 70; i += 1) {
    ctx.strokeStyle = rgba('#000000', random() * 0.12);
    ctx.lineWidth = 1;
    const y = random() * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(80, y + random() * 8, 170, y - random() * 8, 256, y);
    ctx.stroke();
  }
  const pad = 26;
  ctx.fillStyle = shade(wood, 0.03);
  ctx.fillRect(pad, pad, 256 - pad * 2, 256 - pad * 2);
  ctx.strokeStyle = 'rgba(255, 220, 170, 0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(pad, 256 - pad); ctx.lineTo(pad, pad); ctx.lineTo(256 - pad, pad);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.moveTo(256 - pad, pad); ctx.lineTo(256 - pad, 256 - pad); ctx.lineTo(pad, 256 - pad);
  ctx.stroke();
  return canvas;
}

/** Equirectangular night sky with stars, a faint milky way and a moon. */
export function nightSkyCanvas(seed = 31) {
  const w = 2048;
  const h = 1024;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#03040b');
  sky.addColorStop(0.42, PALETTE.night);
  sky.addColorStop(0.5, PALETTE.nightHorizon);
  sky.addColorStop(0.56, '#07060c');
  sky.addColorStop(1, '#020203');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i += 1) {
    const t = random();
    const x = t * w;
    const y = h * (0.18 + 0.12 * Math.sin(t * Math.PI * 2)) + (random() - 0.5) * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 30 + random() * 50);
    g.addColorStop(0, 'rgba(150, 140, 200, 0.05)');
    g.addColorStop(1, 'rgba(150, 140, 200, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 80, y - 80, 160, 160);
  }
  for (let i = 0; i < 2600; i += 1) {
    const y = random() ** 1.4 * h * 0.5;
    ctx.fillStyle = `rgba(255, ${235 + random() * 20}, ${215 + random() * 40}, ${0.25 + random() * 0.75})`;
    ctx.beginPath();
    ctx.arc(random() * w, y, 0.3 + random() * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  const moon = { x: w * 0.5, y: h * 0.27 };
  const halo = ctx.createRadialGradient(moon.x, moon.y, 0, moon.x, moon.y, 140);
  halo.addColorStop(0, 'rgba(255, 244, 220, 0.5)');
  halo.addColorStop(0.2, 'rgba(255, 244, 220, 0.18)');
  halo.addColorStop(1, 'rgba(255, 244, 220, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(moon.x - 140, moon.y - 140, 280, 280);
  ctx.fillStyle = '#fff6e2';
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, 16, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

/** Soft round glow, white; tint it with the material colour. */
export function glowCanvas() {
  const canvas = makeCanvas(128, 128);
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return canvas;
}

/** Light pool a picture light throws on the wall: bright near the top, fading down. */
export function wallWashCanvas() {
  const canvas = makeCanvas(256, 512);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.translate(128, 190);
  ctx.scale(1, 2);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 128);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-128, -95, 256, 256);
  ctx.restore();
  return canvas;
}
