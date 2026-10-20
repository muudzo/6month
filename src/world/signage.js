import { FONTS, PALETTE } from './palette.js';
import { makeCanvas, rgba, toTexture } from './textures.js';

/**
 * Split text into lines that fit maxWidth with the current ctx font.
 * Explicit newlines are respected.
 */
export function wrapText(ctx, text, maxWidth) {
  return String(text)
    .split('\n')
    .flatMap((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      return words.reduce(
        (lines, word) => {
          const last = lines[lines.length - 1];
          const candidate = last ? `${last} ${word}` : word;
          return ctx.measureText(candidate).width <= maxWidth || !last
            ? [...lines.slice(0, -1), candidate]
            : [...lines, word];
        },
        [''],
      );
    });
}

/** Draw letter-spaced text (canvas letterSpacing is not universal yet). */
export function drawTracked(ctx, text, x, y, tracking, align = 'left') {
  const chars = [...String(text)];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * Math.max(0, chars.length - 1);
  const start = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const previousAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.reduce((cursor, ch, i) => {
    ctx.fillText(ch, cursor, y);
    return cursor + widths[i] + tracking;
  }, start);
  ctx.textAlign = previousAlign;
  return total;
}

const finish = (canvas) => ({ texture: toTexture(canvas, { wrap: false }), aspect: canvas.width / canvas.height, canvas });

/** Ivory exhibit label hung beside each photograph. */
export function plaqueSign({ number, eyebrow, title, date, medium }) {
  const canvas = makeCanvas(720, 450);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = PALETTE.ivory;
  ctx.fillRect(0, 0, 720, 450);
  ctx.strokeStyle = rgba(PALETTE.gold, 0.9);
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, 692, 422);
  ctx.fillStyle = PALETTE.goldDeep;
  ctx.font = `500 26px ${FONTS.label}`;
  drawTracked(ctx, (eyebrow ?? `No. ${String(number).padStart(2, '0')}`).toUpperCase(), 48, 76, 6);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `italic 400 46px ${FONTS.display}`;
  const lines = wrapText(ctx, title, 620).slice(0, 3);
  lines.forEach((line, i) => ctx.fillText(line, 48, 140 + i * 54));
  ctx.fillStyle = rgba(PALETTE.ink, 0.72);
  ctx.font = `400 26px ${FONTS.label}`;
  const meta = wrapText(ctx, [date, medium].filter(Boolean).join(' · '), 620).slice(0, 2);
  meta.forEach((line, i) => ctx.fillText(line, 48, 150 + lines.length * 54 + 30 + i * 34));
  return finish(canvas);
}

/** Lettering applied straight onto the wall, museum style (transparent background). */
export function wallTextSign({ eyebrow, title, body, width = 1400, color = PALETTE.ivory, accent = PALETTE.gold }) {
  const measure = makeCanvas(10, 10).getContext('2d');
  measure.font = `400 40px ${FONTS.label}`;
  const bodyLines = body ? wrapText(measure, body, width - 120) : [];
  measure.font = `400 96px ${FONTS.display}`;
  const titleLines = title ? wrapText(measure, title, width - 120) : [];
  const height = 120 + titleLines.length * 108 + (bodyLines.length ? 50 + bodyLines.length * 58 : 0) + 40;
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext('2d');
  let y = 80;
  if (eyebrow) {
    ctx.fillStyle = accent;
    ctx.font = `500 34px ${FONTS.label}`;
    drawTracked(ctx, eyebrow.toUpperCase(), 60, y, 10);
  }
  y += 100;
  ctx.fillStyle = color;
  ctx.font = `400 96px ${FONTS.display}`;
  titleLines.forEach((line) => {
    ctx.fillText(line, 60, y);
    y += 108;
  });
  if (bodyLines.length) {
    ctx.fillStyle = accent;
    ctx.fillRect(60, y - 50, 120, 3);
    y += 20;
    ctx.fillStyle = rgba(color, 0.86);
    ctx.font = `400 40px ${FONTS.label}`;
    bodyLines.forEach((line) => {
      ctx.fillText(line, 60, y);
      y += 58;
    });
  }
  return finish(canvas);
}

/** Gilded room name carved above a doorway. */
export function headerSign(title, subtitle) {
  const canvas = makeCanvas(1600, 260);
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'middle';
  const gilt = ctx.createLinearGradient(0, 40, 0, 160);
  gilt.addColorStop(0, PALETTE.goldBright);
  gilt.addColorStop(0.55, PALETTE.gold);
  gilt.addColorStop(1, PALETTE.goldDeep);
  ctx.fillStyle = gilt;
  ctx.font = `400 92px ${FONTS.display}`;
  drawTracked(ctx, title.toUpperCase(), 800, 100, 18, 'center');
  if (subtitle) {
    ctx.fillStyle = rgba(PALETTE.ivory, 0.8);
    ctx.font = `italic 400 46px ${FONTS.display}`;
    ctx.textAlign = 'center';
    ctx.fillText(subtitle, 800, 200);
  }
  return finish(canvas);
}

/** Letters incised into the limestone frieze of the facade. */
export function friezeSign(text) {
  const canvas = makeCanvas(2048, 200);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = PALETTE.limestone;
  ctx.fillRect(0, 0, 2048, 200);
  ctx.textBaseline = 'middle';
  ctx.font = `400 120px ${FONTS.display}`;
  ctx.fillStyle = 'rgba(255, 250, 235, 0.55)';
  drawTracked(ctx, text.toUpperCase(), 1027, 107, 34, 'center');
  ctx.fillStyle = '#4a4033';
  drawTracked(ctx, text.toUpperCase(), 1024, 104, 34, 'center');
  return finish(canvas);
}

/** Vertical exhibition banner hung between the portico columns. */
export function bannerSign({ top, big, bottom }) {
  const canvas = makeCanvas(400, 1200);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = PALETTE.oxblood;
  ctx.fillRect(0, 0, 400, 1120);
  for (let x = 0; x < 400; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 1120);
    ctx.lineTo(x + 10, 1190);
    ctx.lineTo(x + 20, 1120);
    ctx.fillStyle = PALETTE.gold;
    ctx.fill();
  }
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, 352, 1072);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.goldBright;
  ctx.font = `500 30px ${FONTS.label}`;
  drawTracked(ctx, top.toUpperCase(), 200, 120, 8, 'center');
  ctx.font = `400 120px ${FONTS.display}`;
  const lines = wrapText(ctx, big, 320);
  lines.forEach((line, i) => ctx.fillText(line, 200, 420 + i * 132));
  ctx.fillStyle = PALETTE.ivory;
  ctx.font = `italic 400 52px ${FONTS.display}`;
  wrapText(ctx, bottom, 320).forEach((line, i) => ctx.fillText(line, 200, 900 + i * 60));
  return finish(canvas);
}

/** Small free-standing sign (queue, rules, directions). */
export function standSign({ eyebrow, lines }) {
  const canvas = makeCanvas(640, 420);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, 640, 420);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 608, 388);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `500 26px ${FONTS.label}`;
  drawTracked(ctx, eyebrow.toUpperCase(), 320, 80, 8, 'center');
  ctx.fillStyle = PALETTE.ivory;
  ctx.font = `italic 400 40px ${FONTS.display}`;
  const wrapped = lines.flatMap((line) => wrapText(ctx, line, 540));
  wrapped.slice(0, 6).forEach((line, i) => ctx.fillText(line, 320, 150 + i * 50));
  return finish(canvas);
}

/** Bare linen in an empty frame, waiting for a future photo. */
export function reservedSign(title) {
  const canvas = makeCanvas(1000, 760);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2b2622';
  ctx.fillRect(0, 0, 1000, 760);
  for (let i = 0; i < 1000; i += 3) {
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    ctx.fillRect(i, 0, 1, 760);
    ctx.fillRect(0, i, 1000, 1);
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = rgba(PALETTE.gold, 0.85);
  ctx.font = `500 30px ${FONTS.label}`;
  drawTracked(ctx, 'RESERVED FOR', 500, 330, 10, 'center');
  ctx.fillStyle = rgba(PALETTE.ivory, 0.9);
  ctx.font = `italic 400 64px ${FONTS.display}`;
  wrapText(ctx, title, 820).slice(0, 2).forEach((line, i) => ctx.fillText(line, 500, 420 + i * 74));
  return finish(canvas);
}

/**
 * The live "open for N days" counter on the lobby wall. Call draw() to refresh.
 * @param {{ eyebrow: string }} options
 */
export function counterSign({ eyebrow }) {
  const canvas = makeCanvas(1400, 900);
  const ctx = canvas.getContext('2d');
  const { texture } = finish(canvas);
  const draw = ({ days, hours, minutes, seconds }, format) => {
    ctx.clearRect(0, 0, 1400, 900);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `500 34px ${FONTS.label}`;
    drawTracked(ctx, eyebrow.toUpperCase(), 60, 80, 10);
    ctx.fillStyle = PALETTE.ivory;
    ctx.font = `400 260px ${FONTS.display}`;
    ctx.fillText(format(days), 50, 330);
    ctx.font = `italic 400 64px ${FONTS.display}`;
    ctx.fillText('days, and counting', 60, 420);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(60, 480, 120, 3);
    ctx.fillStyle = rgba(PALETTE.ivory, 0.85);
    ctx.font = `400 44px ${FONTS.label}`;
    [`${format(hours)} hours`, `${format(minutes)} minutes`, `${format(seconds)} seconds`].forEach((line, i) =>
      ctx.fillText(line, 60, 570 + i * 70),
    );
    ctx.fillStyle = rgba(PALETTE.ivory, 0.6);
    ctx.font = `italic 400 40px ${FONTS.display}`;
    ctx.fillText('…and the curator would do every one of them again.', 60, 820);
    texture.needsUpdate = true;
  };
  return { texture, aspect: 1400 / 900, draw };
}
