import { prefersReducedMotion } from './dom.js';

const COLORS = ['#ff4f7b', '#f0d488', '#c9a14a', '#ffd1dc', '#f3ead6'];
const GRAVITY = 900;
const DRAG = 0.985;

const drawHeart = (ctx, size) => {
  ctx.beginPath();
  ctx.moveTo(0, size * 0.35);
  ctx.bezierCurveTo(-size, -size * 0.35, -size * 0.45, -size * 1.05, 0, -size * 0.4);
  ctx.bezierCurveTo(size * 0.45, -size * 1.05, size, -size * 0.35, 0, size * 0.35);
  ctx.fill();
};

/**
 * Hearts and gold leaf thrown across the screen.
 * @param {HTMLCanvasElement} canvas
 */
export function createConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  let pieces = [];
  let frame = null;
  let last = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const step = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces = pieces
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vx: p.vx * DRAG,
        vy: p.vy * DRAG + GRAVITY * p.weight * dt,
        spin: p.spin + p.spinSpeed * dt,
        life: p.life - dt,
      }))
      .filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    pieces.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.fillStyle = p.color;
      if (p.isHeart) drawHeart(ctx, p.size);
      else {
        ctx.scale(1, Math.cos(p.spin * 2));
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    });
    frame = pieces.length ? requestAnimationFrame(step) : null;
  };

  /** @param {{ count?: number }} [options] */
  const burst = ({ count = 160 } = {}) => {
    resize();
    const reduced = prefersReducedMotion();
    const total = reduced ? 24 : count;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const fresh = Array.from({ length: total }, (_, i) => {
      const fromLeft = i % 2 === 0;
      const angle = (fromLeft ? -1 : -2.14) + (Math.random() - 0.5) * 0.6;
      const speed = reduced ? 0 : 700 + Math.random() * 600;
      return {
        x: reduced ? Math.random() * width : fromLeft ? -10 : width + 10,
        y: reduced ? Math.random() * height * 0.6 : height * 0.75,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        weight: reduced ? 0.08 : 0.5 + Math.random() * 0.5,
        size: 7 + Math.random() * 9,
        spin: Math.random() * Math.PI,
        spinSpeed: (Math.random() - 0.5) * 10,
        color: COLORS[i % COLORS.length],
        isHeart: i % 3 === 0,
        life: reduced ? 2 : 3.5 + Math.random() * 1.5,
      };
    });
    pieces = [...pieces, ...fresh];
    if (!frame) {
      last = performance.now();
      frame = requestAnimationFrame(step);
    }
  };

  return { burst };
}
