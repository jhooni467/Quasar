import { mixHex } from '../color.js';
import { TAU, lineColor, groundShadow, paintTexture, litGradient, fillAndLine, wobblyRect, roundedPoly } from './artKit.js';

/**
 * Obstáculos. Son los objetos importantes del juego, así que llevan "colored
 * lineart" GRUESO (el contorno es el color del objeto, más oscuro y violáceo),
 * volumen con luz arriba-izquierda y una cara superior visible (la cámara los
 * mira desde arriba) para que se lean como objetos 3D.
 *
 * Geometría `g`: cx, yBase (suelo), u (píxeles por unidad del mundo), wu (ancho
 * en unidades). Las alturas se miden en unidades desde el suelo con `g.y(h)`,
 * de modo que el dibujo coincide con la caja de colisión de gameplay/items.js.
 */

/** Rellena el camino actual con franjas inclinadas (palo de caramelo) y lo deja listo para contornear. */
function candyStripes(ctx, x, y, w, h, count, colorA, colorB) {
  ctx.save();
  ctx.clip();
  ctx.fillStyle = colorA;
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = colorB;
  const step = w / count;
  for (let i = 0; i < count; i += 2) {
    // Path2D: no altera el camino actual, que el llamador contornea después
    const stripe = new Path2D();
    stripe.moveTo(x + i * step + h * 0.35, y);
    stripe.lineTo(x + (i + 1) * step + h * 0.35, y);
    stripe.lineTo(x + (i + 1) * step - h * 0.35, y + h);
    stripe.lineTo(x + i * step - h * 0.35, y + h);
    stripe.closePath();
    ctx.fill(stripe);
  }
  // volumen: luz arriba, sombra abajo
  const shade = ctx.createLinearGradient(0, y, 0, y + h);
  shade.addColorStop(0, 'rgba(255,255,255,0.34)');
  shade.addColorStop(0.5, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(60,10,90,0.3)');
  ctx.fillStyle = shade;
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.restore();
}

function post(ctx, x, y, w, h, color, lw, rnd) {
  ctx.beginPath();
  wobblyRect(ctx, x, y, w, h, w * 0.42, rnd, 1.2);
  fillAndLine(ctx, litGradient(ctx, y, y + h, mixHex(color, '#ffffff', 0.32), color, mixHex(color, '#4a0f4f', 0.38)), lw, lineColor(color));
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.32, y + h * 0.3, w * 0.1, Math.min(h * 0.14, w * 0.5), 0, 0, TAU);
  ctx.fill();
}

/** Valla baja: se SALTA. Dos postes y una barra a rayas con cara superior. */
export function paintHurdle(ctx, g, rnd, pal) {
  const { cx } = g;
  const w = g.wu * g.u;
  const lw = Math.max(4, g.u * 0.05);
  groundShadow(ctx, cx, g.yBase, w * 0.62, g.u * 0.1, 0.38);

  const postW = w * 0.16;
  for (const side of [-1, 1]) post(ctx, cx + side * w * 0.36 - postW / 2, g.y(0.6), postW, g.y(0) - g.y(0.6), pal.post, lw, rnd);

  // cara superior de la barra (más clara)
  const bx = cx - w * 0.5;
  const frontTop = g.y(0.56);
  const frontH = g.y(0.2) - frontTop;
  const topH = g.u * 0.1;
  ctx.beginPath();
  roundedPoly(ctx, [[bx + w * 0.04, frontTop - topH], [bx + w * 0.96, frontTop - topH], [bx + w, frontTop + lw], [bx, frontTop + lw]], lw * 0.7);
  fillAndLine(ctx, pal.top, lw, lineColor(pal.top, 0.55));
  // cara frontal a rayas
  ctx.beginPath();
  wobblyRect(ctx, bx, frontTop, w, frontH, frontH * 0.3, rnd, 1);
  candyStripes(ctx, bx, frontTop, w, frontH, 9, pal.stripeA, pal.stripeB);
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw;
  ctx.strokeStyle = lineColor(pal.stripeB, 0.62);
  ctx.stroke();
}

/** Arco alto: se pasa DESLIZÁNDOSE por debajo (el paso libre llega hasta 0,85). */
export function paintGate(ctx, g, rnd, pal) {
  const { cx } = g;
  const w = g.wu * g.u;
  const lw = Math.max(4, g.u * 0.05);
  groundShadow(ctx, cx, g.yBase, w * 0.62, g.u * 0.1, 0.36);

  const postW = w * 0.19;
  for (const side of [-1, 1]) post(ctx, cx + side * w * 0.4 - postW / 2, g.y(2.0), postW, g.y(0) - g.y(2.0), pal.post, lw, rnd);

  // viga baja (borde inferior a 0,85 de altura) con cara superior
  const bx = cx - w * 0.5;
  const frontTop = g.y(1.4);
  const frontH = g.y(0.85) - frontTop;
  const topH = g.u * 0.12;
  ctx.beginPath();
  roundedPoly(ctx, [[bx + w * 0.05, frontTop - topH], [bx + w * 0.95, frontTop - topH], [bx + w, frontTop + lw], [bx, frontTop + lw]], lw * 0.7);
  fillAndLine(ctx, pal.top, lw, lineColor(pal.top, 0.55));
  ctx.beginPath();
  wobblyRect(ctx, bx, frontTop, w, frontH, frontH * 0.3, rnd, 1);
  candyStripes(ctx, bx, frontTop, w, frontH, 8, pal.stripeA, pal.stripeB);
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw;
  ctx.strokeStyle = lineColor(pal.stripeB, 0.62);
  ctx.stroke();

  // coronación: farolillo y banderines sobre los postes, para que se lea como "arco"
  const lanternY = g.y(2.12);
  ctx.beginPath();
  ctx.ellipse(cx, lanternY, w * 0.16, g.u * 0.2, 0, 0, TAU);
  fillAndLine(ctx, litGradient(ctx, lanternY - g.u * 0.2, lanternY + g.u * 0.2, '#fff6c8', pal.lantern, mixHex(pal.lantern, '#c0521e', 0.5)), lw, lineColor(pal.lantern, 0.6));
  ctx.strokeStyle = lineColor(pal.post);
  ctx.lineWidth = lw * 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.4, g.y(2.0));
  ctx.quadraticCurveTo(cx, g.y(2.28), cx + w * 0.4, g.y(2.0));
  ctx.stroke();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    const px = cx + side * w * 0.4;
    ctx.moveTo(px, g.y(2.0));
    ctx.lineTo(px + side * w * 0.2, g.y(2.12));
    ctx.lineTo(px, g.y(2.2));
    ctx.closePath();
    fillAndLine(ctx, pal.stripeB, lw * 0.8, lineColor(pal.stripeB, 0.6));
  }
}

/** Bloque macizo: hay que CAMBIAR DE CARRIL. Piedra tallada con cara superior. */
export function paintBlock(ctx, g, rnd, pal) {
  const { cx } = g;
  const w = g.wu * g.u;
  const lw = Math.max(5, g.u * 0.06);
  groundShadow(ctx, cx, g.yBase, w * 0.66, g.u * 0.13, 0.4);

  const x0 = cx - w / 2;
  const frontTop = g.y(1.45);
  const frontBottom = g.y(0);
  const frontH = frontBottom - frontTop;
  const topH = g.u * 0.28;

  // cara superior (trapecio más estrecho al fondo)
  ctx.beginPath();
  roundedPoly(ctx, [[x0 + w * 0.1, frontTop - topH], [x0 + w * 0.9, frontTop - topH], [x0 + w, frontTop + lw * 0.6], [x0, frontTop + lw * 0.6]], lw * 0.9);
  fillAndLine(ctx, litGradient(ctx, frontTop - topH, frontTop, mixHex(pal.top, '#ffffff', 0.25), pal.top, mixHex(pal.top, pal.face, 0.4)), lw, lineColor(pal.top, 0.6));
  paintTexture(ctx, rnd, [x0, frontTop - topH, w, topH], { light: '#ffffff', dark: pal.face, count: 10, width: 0.1, alpha: 0.18 });

  // cara frontal
  ctx.beginPath();
  wobblyRect(ctx, x0, frontTop, w, frontH, w * 0.12, rnd, 1.5);
  fillAndLine(ctx, litGradient(ctx, frontTop, frontBottom, mixHex(pal.face, '#ffffff', 0.18), pal.face, pal.side), lw, lineColor(pal.face, 0.62));
  paintTexture(ctx, rnd, [x0, frontTop, w, frontH], { light: pal.top, dark: pal.side, count: 22, width: 0.07, alpha: 0.26 });

  // juntas de piedra
  ctx.strokeStyle = lineColor(pal.face, 0.4);
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = lw * 0.35;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0 + w * 0.06, frontTop + frontH * 0.5);
  ctx.lineTo(x0 + w * 0.94, frontTop + frontH * 0.5);
  ctx.moveTo(x0 + w * 0.36, frontTop + frontH * 0.5);
  ctx.lineTo(x0 + w * 0.36, frontBottom - lw);
  ctx.moveTo(x0 + w * 0.68, frontTop + lw);
  ctx.lineTo(x0 + w * 0.68, frontTop + frontH * 0.5);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // estrella tallada (símbolo de QUASAR)
  const sx = cx;
  const sy = frontTop + frontH * 0.27;
  const r = w * 0.17;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr);
  }
  ctx.closePath();
  fillAndLine(ctx, pal.glyph, lw * 0.5, lineColor(pal.glyph, 0.6));
}
