import { FONTS, PALETTE } from './palette.js';
import { makeCanvas, seededRandom } from './textures.js';
import { drawTracked } from './signage.js';

const hills = (ctx, w, h, random, colors, horizon) => {
  colors.forEach((color, layer) => {
    const base = h * (horizon + layer * 0.08);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += w / 12) {
      ctx.lineTo(x, base - Math.sin(x / w * Math.PI * (2 + layer) + random() * 2) * h * 0.05 - random() * h * 0.03);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  });
};

const figure = (ctx, x, y, scale, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 120 * scale, 34 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 50 * scale, y + 60 * scale);
  ctx.quadraticCurveTo(x - 56 * scale, y - 70 * scale, x, y - 78 * scale);
  ctx.quadraticCurveTo(x + 56 * scale, y - 70 * scale, x + 50 * scale, y + 60 * scale);
  ctx.fill();
};

const heart = (ctx, x, y, size, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.35);
  ctx.bezierCurveTo(x - size, y - size * 0.4, x - size * 0.4, y - size * 1.1, x, y - size * 0.45);
  ctx.bezierCurveTo(x + size * 0.4, y - size * 1.1, x + size, y - size * 0.4, x, y + size * 0.35);
  ctx.fill();
};

const caption = (ctx, w, h, text) => {
  ctx.fillStyle = 'rgba(10, 8, 6, 0.62)';
  ctx.fillRect(0, h - 74, w, 74);
  ctx.fillStyle = PALETTE.ivory;
  ctx.font = `500 24px ${FONTS.label}`;
  drawTracked(ctx, text.toUpperCase(), w / 2, h - 30, 4, 'center');
};

const sky = (ctx, w, h, top, bottom) => {
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
};

const DUSKS = [
  ['#2b3f73', '#f2a07b'], ['#3d2f6b', '#f7c59f'], ['#1f4e5f', '#f6d6a8'],
  ['#5b2a4f', '#f4a261'], ['#23395b', '#e9c46a'], ['#40305c', '#ffb4a2'],
];

function photoPlaceholder(index, src) {
  const isPortrait = index % 3 === 1;
  const w = isPortrait ? 900 : 1200;
  const h = isPortrait ? 1200 : 900;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const random = seededRandom(100 + index);
  const [top, bottom] = DUSKS[index % DUSKS.length];
  sky(ctx, w, h, top, bottom);
  ctx.fillStyle = 'rgba(255, 240, 210, 0.85)';
  ctx.beginPath();
  ctx.arc(w * (0.25 + random() * 0.5), h * 0.36, Math.min(w, h) * 0.08, 0, Math.PI * 2);
  ctx.fill();
  hills(ctx, w, h, random, ['#3b3557', '#2a2742', '#1b1a2c'], 0.56);
  const ground = h * 0.86;
  figure(ctx, w * 0.45, ground, 1.25, '#120f1c');
  figure(ctx, w * 0.56, ground + 6, 1.15, '#120f1c');
  heart(ctx, w * 0.505, h * 0.5, 34, PALETTE.rose);
  caption(ctx, w, h, `Exhibit ${String(index + 1).padStart(2, '0')} · add ${src}`);
  return canvas;
}

function renaissance(ctx, w, h, random) {
  sky(ctx, w, h, '#8fa59a', '#d9c99a');
  hills(ctx, w, h, random, ['#6f8a78', '#4f6b5a', '#3a4f3f'], 0.42);
  ctx.strokeStyle = '#c7b98d';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.62);
  ctx.bezierCurveTo(w * 0.3, h * 0.5, w * 0.05, h * 0.45, w * 0.22, h * 0.38);
  ctx.stroke();
  ctx.fillStyle = '#2b2116';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.92, w * 0.42, h * 0.38, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#1d150e';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.36, w * 0.17, h * 0.17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d8b48a';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.37, w * 0.115, h * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(w * 0.45, h * 0.47, w * 0.1, h * 0.08);
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.6, w * 0.16, h * 0.06, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#7a4a35';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.4, w * 0.03, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function gilded(ctx, w, h, random) {
  ctx.fillStyle = '#b8862f';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 500; i += 1) {
    ctx.fillStyle = `hsla(${38 + random() * 12}, 70%, ${45 + random() * 25}%, 0.8)`;
    ctx.fillRect(random() * w, random() * h, 8 + random() * 26, 8 + random() * 26);
  }
  ctx.fillStyle = '#e6c25a';
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.62, w * 0.3, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 120; i += 1) {
    ctx.fillStyle = random() > 0.5 ? '#1b1b1b' : '#f5f0e0';
    ctx.fillRect(w * 0.3 + random() * w * 0.4, h * 0.35 + random() * h * 0.6, 10, 26);
  }
  ctx.fillStyle = '#e9c3a0';
  ctx.beginPath();
  ctx.ellipse(w * 0.44, h * 0.3, w * 0.08, h * 0.07, -0.4, 0, Math.PI * 2);
  ctx.ellipse(w * 0.57, h * 0.27, w * 0.08, h * 0.07, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function surreal(ctx, w, h, random) {
  sky(ctx, w, h, '#3f78b5', '#f2d49b');
  ctx.fillStyle = '#c98b4a';
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.fillStyle = '#8c5a2e';
  ctx.fillRect(w * 0.05, h * 0.58, w * 0.5, h * 0.06);
  ctx.fillStyle = '#e8e2c8';
  ctx.beginPath();
  ctx.moveTo(w * 0.25, h * 0.58);
  ctx.bezierCurveTo(w * 0.45, h * 0.5, w * 0.62, h * 0.6, w * 0.58, h * 0.78);
  ctx.bezierCurveTo(w * 0.5, h * 0.7, w * 0.4, h * 0.66, w * 0.25, h * 0.66);
  ctx.fill();
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.4, h * 0.6);
  ctx.lineTo(w * 0.47, h * 0.64);
  ctx.moveTo(w * 0.4, h * 0.6);
  ctx.lineTo(w * 0.42, h * 0.54);
  ctx.stroke();
  ctx.fillStyle = '#5a3d22';
  ctx.fillRect(w * 0.72, h * 0.3, 14, h * 0.34);
  ctx.beginPath();
  ctx.moveTo(w * 0.73, h * 0.3);
  ctx.quadraticCurveTo(w * 0.85, h * 0.25, w * 0.9, h * 0.4);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#5a3d22';
  ctx.stroke();
  heart(ctx, w * 0.82, h * 0.82, 40 + random() * 4, PALETTE.rose);
}

const MASTERPIECE_PAINTERS = { renaissance, gilded, surreal };

function masterpiecePlaceholder(index, src, style) {
  const w = 900;
  const h = 1200;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  (MASTERPIECE_PAINTERS[style] ?? renaissance)(ctx, w, h, seededRandom(200 + index));
  caption(ctx, w, h, `Masterpiece · add ${src}`);
  return canvas;
}

/**
 * A stand-in picture for an exhibit whose photo has not been added yet.
 * @param {{ index: number, src: string, kind: string, style?: string }} exhibit
 */
export function placeholderCanvas({ index, src, kind, style }) {
  return kind === 'masterpiece' ? masterpiecePlaceholder(index, src, style) : photoPlaceholder(index, src);
}
