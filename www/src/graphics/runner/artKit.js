import { mixHex, rgba } from '../color.js';

/**
 * Herramientas de dibujo ilustrado para los sprites del runner.
 *
 * Estilo: ilustración 2D con volumen. Formas orgánicas (vértices con ligera
 * irregularidad), luz desde arriba a la izquierda, trazos de pincel sutiles y
 * "colored lineart": el contorno se obtiene oscureciendo y saturando el color
 * del propio objeto hacia un violeta profundo; nunca se usa negro puro.
 */
export const TAU = Math.PI * 2;
const INK_TINT = '#35104f';

/** Color de contorno que armoniza con `fill` (más oscuro y violáceo). */
export function lineColor(fill, amount = 0.6) {
  return mixHex(fill, INK_TINT, amount);
}

/** Sombra suave en el suelo (elipse con degradado radial). */
export function groundShadow(ctx, cx, cy, rx, ry, alpha = 0.32) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(45,14,76,${alpha})`);
  g.addColorStop(0.6, `rgba(45,14,76,${alpha * 0.55})`);
  g.addColorStop(1, 'rgba(45,14,76,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Curva cerrada suave que pasa cerca de los puntos (puntos medios + curvas cuadráticas). */
export function smoothClosed(ctx, pts) {
  const n = pts.length;
  ctx.beginPath();
  ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
  }
  ctx.closePath();
}

/** Polígono con esquinas redondeadas (radio `r`). */
export function roundedPoly(ctx, pts, r) {
  const n = pts.length;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]);
  ctx.beginPath();
  ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    ctx.arcTo(pts[i][0], pts[i][1], m[0], m[1], r);
  }
  ctx.closePath();
}

/** Rectángulo redondeado con vértices ligeramente irregulares. */
export function wobblyRect(ctx, x, y, w, h, r, rnd, jitter = 0) {
  const j = () => (rnd ? (rnd() * 2 - 1) * jitter : 0);
  roundedPoly(
    ctx,
    [
      [x + j(), y + j()],
      [x + w + j(), y + j()],
      [x + w + j(), y + h + j()],
      [x + j(), y + h + j()],
    ],
    r
  );
}

/** Mancha orgánica (elipse con radios irregulares). */
export function blob(ctx, cx, cy, rx, ry, rnd, n = 9, jitter = 0.1, rot = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rot;
    const k = 1 + (rnd() * 2 - 1) * jitter;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  smoothClosed(ctx, pts);
}

/** Trazo de pincel: polígono alargado y afilado, de (x0,y0) a (x1,y1). */
export function brush(ctx, x0, y0, x1, y1, w, color, alpha = 1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * w * 0.5, y0 + ny * w * 0.5);
  ctx.quadraticCurveTo(mx + nx * w * 0.75, my + ny * w * 0.75, x1, y1);
  ctx.quadraticCurveTo(mx - nx * w * 0.4, my - ny * w * 0.4, x0 - nx * w * 0.5, y0 - ny * w * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * Textura pictórica dentro de la forma que esté en el camino actual de `ctx`:
 * trazos cortos y translúcidos de luces y sombras. Debe llamarse con una forma
 * ya trazada (se recorta con ella).
 */
export function paintTexture(ctx, rnd, box, { light, dark, count = 26, len = 0.22, width = 0.07, alpha = 0.32 }) {
  ctx.save();
  ctx.clip();
  const [x, y, w, h] = box;
  for (let i = 0; i < count; i++) {
    const px = x + rnd() * w;
    const py = y + rnd() * h;
    const l = len * Math.min(w, h) * (0.6 + rnd() * 0.8);
    const a = -0.9 + (rnd() - 0.5) * 0.8; // trazos inclinados, como pincelada
    brush(ctx, px, py, px + Math.cos(a) * l, py + Math.sin(a) * l, width * Math.min(w, h) * (0.6 + rnd() * 0.8), rnd() < 0.55 ? light : dark, alpha);
  }
  ctx.restore();
}

/** Relleno con luz arriba y sombra abajo. */
export function litGradient(ctx, y0, y1, light, base, dark) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, light);
  g.addColorStop(0.45, base);
  g.addColorStop(1, dark);
  return g;
}

/** Rellena y contornea el camino actual con "colored lineart". */
export function fillAndLine(ctx, fill, lineWidth, line, join = 'round') {
  ctx.fillStyle = fill;
  ctx.fill();
  if (lineWidth > 0) {
    ctx.lineJoin = join;
    ctx.lineCap = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = line;
    ctx.stroke();
  }
}
