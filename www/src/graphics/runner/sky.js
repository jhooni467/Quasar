import { mixHex, rgba } from '../color.js';
import { TAU, blob } from './artKit.js';

/** Nube ilustrada: manchas superpuestas, luz arriba y tono cálido abajo. */
export function paintCloud(ctx, W, H, rnd, tint) {
  const base = tint.base;
  const puffs = 6;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < puffs; i++) {
      const f = i / (puffs - 1);
      const rx = W * (0.16 + Math.sin(f * Math.PI) * 0.1);
      const ry = H * (0.28 + Math.sin(f * Math.PI) * 0.18);
      const x = W * (0.14 + f * 0.72);
      const y = H * 0.62 - Math.sin(f * Math.PI) * H * 0.16 + (rnd() - 0.5) * H * 0.05;
      blob(ctx, x, y + (pass === 0 ? H * 0.05 : 0), rx * (pass === 0 ? 1.04 : 1), ry * (pass === 0 ? 1.04 : 1), rnd, 9, 0.06);
      if (pass === 0) {
        ctx.fillStyle = rgba(tint.shade, 0.9);
      } else {
        const g = ctx.createLinearGradient(0, y - ry, 0, y + ry);
        g.addColorStop(0, tint.light);
        g.addColorStop(1, base);
        ctx.fillStyle = g;
      }
      ctx.fill();
    }
  }
}

/** Planeta con anillo y halo: un guiño cósmico al nombre QUASAR. */
export function paintPlanet(ctx, W, H, pal) {
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) * 0.27;

  const halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, Math.min(W, H) * 0.5);
  halo.addColorStop(0, rgba(pal.glow, 0.45));
  halo.addColorStop(1, rgba(pal.glow, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  const ring = (front) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.28);
    ctx.lineCap = 'round';
    for (const [rad, width, color] of [[r * 1.75, r * 0.2, pal.ring], [r * 1.5, r * 0.09, mixHex(pal.ring, '#ffffff', 0.4)]]) {
      ctx.beginPath();
      ctx.ellipse(0, 0, rad, rad * 0.26, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    }
    ctx.restore();
  };

  ring(false);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.clip();
  const body = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  body.addColorStop(0, pal.light);
  body.addColorStop(0.55, pal.base);
  body.addColorStop(1, pal.dark);
  ctx.fillStyle = body;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? pal.light : pal.dark;
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.6 + i * r * 0.32, r * 1.1, r * 0.09, -0.28, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  ring(true);
}
