import { mixHex, rgba } from '../color.js';
import { TAU, lineColor, groundShadow, blob, brush, paintTexture, litGradient, fillAndLine, wobblyRect, roundedPoly } from './artKit.js';

/**
 * Elementos ambientales (árboles, arbustos, rocas…). Cada función dibuja en un
 * canvas ya preparado y recibe la geometría `g`:
 *   g.cx      centro horizontal           g.yBase   línea del suelo
 *   g.yTop    parte alta del objeto       g.u       píxeles por unidad del mundo
 *   g.wu      ancho del objeto (unidades) g.hu      alto del objeto (unidades)
 *
 * Contornos finos y del color del propio objeto: el escenario no se llena de
 * bordes gruesos (esos se reservan para personaje y obstáculos).
 */

/** Pino de pincelada (varias capas de trazos que cuelgan hacia abajo). */
export function paintPine(ctx, g, rnd, pal) {
  const { cx, yBase, yTop } = g;
  const h = yBase - yTop;
  const w = g.wu * g.u;
  const c = pal.pine;
  groundShadow(ctx, cx, yBase, w * 0.5, h * 0.045, 0.34);

  // tronco
  ctx.beginPath();
  wobblyRect(ctx, cx - w * 0.04, yBase - h * 0.16, w * 0.08, h * 0.17, w * 0.02, rnd, 1.5);
  fillAndLine(ctx, pal.trunk, w * 0.012, lineColor(pal.trunk));

  const tiers = 5;
  for (let t = 0; t < tiers; t++) {
    const f = t / (tiers - 1);
    const top = yTop + h * (0.0 + f * 0.56);
    const bot = top + h * 0.34;
    const hw = w * (0.17 + f * 0.31);

    // silueta del piso con borde inferior irregular
    const pts = [[cx, top]];
    pts.push([cx - hw * 0.55, top + (bot - top) * 0.55]);
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const u = -1 + (i / n) * 2;
      const jag = (i % 2 ? 1 : -1) * h * 0.018 * (0.5 + rnd());
      pts.push([cx + u * hw, bot + jag - Math.abs(u) * h * 0.012]);
    }
    pts.push([cx + hw * 0.55, top + (bot - top) * 0.55]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    fillAndLine(ctx, litGradient(ctx, top, bot, c.mid, c.dark, mixHex(c.dark, '#10223a', 0.35)), w * 0.01, lineColor(c.dark, 0.5));

    // pinceladas que cuelgan: más claras a la izquierda (la luz llega de ese lado)
    const strokes = 12 + t * 4;
    for (let i = 0; i < strokes; i++) {
      const u = (rnd() * 2 - 1) * 0.92;
      const sx = cx + u * hw * 0.35;
      const sy = top + (bot - top) * (0.12 + rnd() * 0.3);
      const ex = cx + u * hw;
      const ey = bot + (rnd() - 0.4) * h * 0.025;
      const lightK = Math.max(0, Math.min(1, 0.5 - u * 0.55 + (rnd() - 0.5) * 0.35));
      const col = mixHex(c.dark, c.light, lightK);
      brush(ctx, sx, sy, ex, ey, w * (0.045 + rnd() * 0.04), col, 0.88);
    }
    // destellos
    for (let i = 0; i < 4; i++) {
      const u = -0.2 - rnd() * 0.7;
      brush(ctx, cx + u * hw * 0.3, top + (bot - top) * 0.25, cx + u * hw, bot - h * 0.02, w * 0.03, c.light, 0.55);
    }
  }
}

/** Árbol redondo (copa de manchas). `variant` elige la paleta (naranja, rosa, turquesa). */
export function paintTree(ctx, g, rnd, pal, variant = 0) {
  const { cx, yBase, yTop } = g;
  const h = yBase - yTop;
  const w = g.wu * g.u;
  const col = pal.trees[variant % pal.trees.length];
  groundShadow(ctx, cx, yBase, w * 0.46, h * 0.04, 0.34);

  // tronco ligeramente curvo
  const tw = w * 0.1;
  ctx.beginPath();
  ctx.moveTo(cx - tw * 0.6, yBase);
  ctx.quadraticCurveTo(cx - tw * 0.8, yBase - h * 0.25, cx - tw * 0.35, yBase - h * 0.42);
  ctx.lineTo(cx + tw * 0.45, yBase - h * 0.42);
  ctx.quadraticCurveTo(cx + tw * 0.9, yBase - h * 0.22, cx + tw * 0.7, yBase);
  ctx.closePath();
  fillAndLine(ctx, litGradient(ctx, yBase - h * 0.4, yBase, mixHex(pal.trunk, '#ffffff', 0.2), pal.trunk, mixHex(pal.trunk, '#2a0f3a', 0.4)), w * 0.012, lineColor(pal.trunk));

  // copa: manchas grandes de atrás hacia delante
  const cy = yTop + h * 0.36;
  const blobs = [
    [-0.2, 0.1, 0.27, 0.24],
    [0.21, 0.12, 0.27, 0.24],
    [0, -0.06, 0.32, 0.27],
    [-0.08, 0.2, 0.3, 0.22],
    [0.12, 0.22, 0.27, 0.2],
  ];
  for (let i = 0; i < blobs.length; i++) {
    const [bx, by, rx, ry] = blobs[i];
    const x = cx + bx * w;
    const y = cy + by * h;
    blob(ctx, x, y, rx * w, ry * h, rnd, 10, 0.1);
    const fill = litGradient(ctx, y - ry * h, y + ry * h, col.light, col.base, col.dark);
    fillAndLine(ctx, fill, w * 0.011, lineColor(col.dark, 0.55));
    paintTexture(ctx, rnd, [x - rx * w, y - ry * h, rx * w * 2, ry * h * 2], { light: col.light, dark: col.dark, count: 14, width: 0.09, alpha: 0.3 });
  }
  // luces de pincel arriba a la izquierda
  for (let i = 0; i < 6; i++) {
    const x = cx - w * (0.05 + rnd() * 0.25);
    const y = cy - h * (0.04 + rnd() * 0.16);
    brush(ctx, x, y, x + w * 0.12, y - h * 0.02, w * 0.03, col.light, 0.6);
  }
}

/** Arbusto bajo con bayas. */
export function paintBush(ctx, g, rnd, pal) {
  const { cx, yBase, yTop } = g;
  const h = yBase - yTop;
  const w = g.wu * g.u;
  const c = pal.bush;
  groundShadow(ctx, cx, yBase, w * 0.55, h * 0.12, 0.3);
  const blobs = [
    [-0.26, 0.55, 0.3, 0.42],
    [0.26, 0.58, 0.28, 0.4],
    [0, 0.4, 0.34, 0.5],
  ];
  for (const [bx, by, rx, ry] of blobs) {
    const x = cx + bx * w;
    const y = yTop + by * h;
    blob(ctx, x, y, rx * w, ry * h, rnd, 9, 0.1);
    fillAndLine(ctx, litGradient(ctx, y - ry * h, y + ry * h, c.light, c.base, c.dark), w * 0.014, lineColor(c.dark, 0.55));
    paintTexture(ctx, rnd, [x - rx * w, y - ry * h, rx * w * 2, ry * h * 2], { light: c.light, dark: c.dark, count: 10, width: 0.1, alpha: 0.3 });
  }
  ctx.fillStyle = c.berry;
  for (let i = 0; i < 6; i++) {
    const x = cx + (rnd() - 0.5) * w * 0.7;
    const y = yTop + h * (0.3 + rnd() * 0.45);
    ctx.beginPath();
    ctx.arc(x, y, w * 0.032, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(x - w * 0.01, y - w * 0.01, w * 0.011, 0, TAU);
    ctx.fill();
    ctx.fillStyle = c.berry;
  }
}

/** Roca facetada (aspecto "low poly" suave). */
export function paintRock(ctx, g, rnd, pal) {
  const { cx, yBase, yTop } = g;
  const h = yBase - yTop;
  const w = g.wu * g.u;
  const c = pal.rock;
  groundShadow(ctx, cx, yBase, w * 0.6, h * 0.14, 0.3);
  const pts = [
    [cx - w * 0.48, yBase - h * 0.02],
    [cx - w * 0.42, yBase - h * 0.5],
    [cx - w * 0.12, yTop + h * 0.02],
    [cx + w * 0.22, yTop + h * 0.12],
    [cx + w * 0.46, yBase - h * 0.42],
    [cx + w * 0.5, yBase - h * 0.03],
  ].map(([x, y]) => [x + (rnd() - 0.5) * w * 0.06, y + (rnd() - 0.5) * h * 0.05]);
  roundedPoly(ctx, pts, w * 0.06);
  fillAndLine(ctx, c.base, w * 0.02, lineColor(c.dark, 0.55));
  // facetas
  const facet = (poly, color, alpha) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  facet([pts[1], pts[2], pts[3], [cx - w * 0.02, yBase - h * 0.55]], c.light, 0.85);
  facet([pts[3], pts[4], pts[5], [cx + w * 0.1, yBase - h * 0.05], [cx + w * 0.02, yBase - h * 0.5]], c.dark, 0.55);
  facet([pts[0], pts[1], [cx - w * 0.1, yBase - h * 0.35], [cx - w * 0.15, yBase - h * 0.04]], mixHex(c.base, c.dark, 0.35), 0.55);
}

/** Seta con motas. */
export function paintMushroom(ctx, g, rnd, pal) {
  const { cx, yBase, yTop } = g;
  const h = yBase - yTop;
  const w = g.wu * g.u;
  const c = pal.mushroom;
  groundShadow(ctx, cx, yBase, w * 0.5, h * 0.09, 0.3);
  // pie
  ctx.beginPath();
  wobblyRect(ctx, cx - w * 0.14, yTop + h * 0.45, w * 0.28, h * 0.55, w * 0.08, rnd, 1);
  fillAndLine(ctx, litGradient(ctx, yTop + h * 0.45, yBase, '#fff5e4', c.stem, mixHex(c.stem, '#b97c8e', 0.5)), w * 0.03, lineColor(c.stem, 0.5));
  // sombrero
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.5, yTop + h * 0.62);
  ctx.bezierCurveTo(cx - w * 0.52, yTop - h * 0.04, cx + w * 0.52, yTop - h * 0.04, cx + w * 0.5, yTop + h * 0.62);
  ctx.quadraticCurveTo(cx, yTop + h * 0.76, cx - w * 0.5, yTop + h * 0.62);
  ctx.closePath();
  fillAndLine(ctx, litGradient(ctx, yTop, yTop + h * 0.7, mixHex(c.cap, '#ffffff', 0.35), c.cap, mixHex(c.cap, '#4b0f4f', 0.4)), w * 0.035, lineColor(c.cap, 0.62));
  ctx.fillStyle = c.spot;
  for (const [sx, sy, sr] of [[-0.22, 0.28, 0.09], [0.12, 0.2, 0.11], [0.3, 0.42, 0.07], [-0.02, 0.45, 0.06]]) {
    ctx.beginPath();
    ctx.ellipse(cx + sx * w, yTop + sy * h, sr * w, sr * w * 0.8, 0, 0, TAU);
    ctx.fill();
  }
}

/** Flores pequeñas (tres tallos). */
export function paintFlower(ctx, g, rnd, pal) {
  const { cx, yBase, yTop } = g;
  const h = yBase - yTop;
  const w = g.wu * g.u;
  groundShadow(ctx, cx, yBase, w * 0.5, h * 0.08, 0.22);
  const heads = [-0.28, 0.02, 0.3];
  for (let i = 0; i < heads.length; i++) {
    const x = cx + heads[i] * w;
    const top = yTop + h * (0.1 + (i === 1 ? 0 : 0.2));
    ctx.strokeStyle = '#2c9477';
    ctx.lineWidth = w * 0.035;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - heads[i] * w * 0.2, yBase);
    ctx.quadraticCurveTo(x - heads[i] * w * 0.1, (yBase + top) / 2, x, top);
    ctx.stroke();
    const petal = pal.flower[(i + Math.floor(rnd() * 4)) % pal.flower.length];
    ctx.fillStyle = petal;
    ctx.strokeStyle = lineColor(petal, 0.5);
    ctx.lineWidth = w * 0.012;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * TAU + rnd() * 0.3;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * w * 0.07, top + Math.sin(a) * w * 0.07, w * 0.065, w * 0.045, a, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.arc(x, top, w * 0.04, 0, TAU);
    ctx.fill();
  }
}

/** Farola con halo luminoso (decoración del atardecer). */
export function paintLamp(ctx, g, rnd, pal) {
  const { cx, yBase, yTop } = g;
  const h = yBase - yTop;
  const w = g.wu * g.u;
  const c = pal.lamp;
  groundShadow(ctx, cx, yBase, w * 0.9, h * 0.03, 0.28);
  // poste
  ctx.beginPath();
  wobblyRect(ctx, cx - w * 0.07, yTop + h * 0.16, w * 0.14, h * 0.84, w * 0.05, rnd, 0.8);
  fillAndLine(ctx, litGradient(ctx, yTop, yBase, mixHex(c.post, '#fff', 0.25), c.post, mixHex(c.post, '#2a0f3a', 0.4)), w * 0.03, lineColor(c.post));
  // halo
  const r = w * 1.6;
  const gl = ctx.createRadialGradient(cx, yTop + h * 0.1, 0, cx, yTop + h * 0.1, r);
  gl.addColorStop(0, rgba(c.glow, 0.7));
  gl.addColorStop(0.35, rgba(c.glow, 0.22));
  gl.addColorStop(1, rgba(c.glow, 0));
  ctx.fillStyle = gl;
  ctx.fillRect(cx - r, yTop + h * 0.1 - r, r * 2, r * 2);
  // farol
  ctx.beginPath();
  ctx.arc(cx, yTop + h * 0.1, w * 0.36, 0, TAU);
  fillAndLine(ctx, '#fff3c4', w * 0.04, lineColor(c.glow, 0.6));
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(cx - w * 0.1, yTop + h * 0.07, w * 0.09, 0, TAU);
  ctx.fill();
}
