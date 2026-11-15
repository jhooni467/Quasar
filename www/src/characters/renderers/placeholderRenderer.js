import { mixHex } from '../../graphics/color.js';

/**
 * Renderer del personaje PROVISIONAL: una silueta neutra y sin rostro, vista
 * desde atrás como en el runner, con "colored lineart". No define estilo ni
 * anatomía finales; se sustituye registrando otro renderer.
 *
 * Contrato que cumple todo renderer de personaje (también el definitivo):
 *   draw(ctx, character, x, y, size)
 *     (x, y) = centro del cuerpo EN PIE; `size` = alto en píxeles.
 *     Lee `character.animation` ('idle' | 'run' | 'jump' | 'slide' | 'hit'),
 *     `character.time` (s desde que empezó la animación) y `character.lean`
 *     (-1..1, inclinación al cambiar de carril).
 *     La parte inferior (los pies) queda siempre anclada a y + size/2.
 */
const INK = '#35104f';

function capsule(ctx, cx, cy, w, h) {
  const r = Math.min(w, h) / 2;
  const x = cx - w / 2;
  const y = cy - h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  ctx.closePath();
}

/** Calcula la pose (escala, giro, posición de los pies) de cada animación. */
function pose(character, size) {
  const t = character.time;
  const p = { sx: 1, sy: 1, rot: character.lean * 0.2, bob: 0, footL: 0, footR: 0, spread: 1 };
  switch (character.animation) {
    case 'run': {
      const ph = t * 13;
      p.sy = 1 + Math.sin(ph * 2) * 0.035;
      p.sx = 2 - p.sy;
      p.bob = -Math.abs(Math.sin(ph)) * size * 0.05;
      p.footL = Math.sin(ph) * size * 0.1;
      p.footR = -p.footL;
      p.rot += Math.sin(ph) * 0.035;
      break;
    }
    case 'jump': {
      const k = Math.min(1, t * 9);
      p.sy = 1 + 0.1 * k;
      p.sx = 1 - 0.07 * k;
      p.footL = p.footR = size * 0.1 * k; // pies recogidos
      p.spread = 1 - 0.15 * k;
      break;
    }
    case 'slide': {
      const k = Math.min(1, t * 14);
      p.sy = 1 - 0.52 * k;
      p.sx = 1 + 0.2 * k;
      p.rot += -0.05 * k;
      p.spread = 1.3;
      break;
    }
    case 'hit': {
      const k = Math.min(1, t * 2.4);
      p.rot = Math.min(t * 11, Math.PI * 2) * 1 + character.lean * 0.2;
      p.sy = 0.9 - 0.12 * k;
      p.sx = 1.05 + 0.1 * k;
      p.bob = size * 0.08 * Math.sin(Math.min(1, t * 3) * Math.PI);
      break;
    }
    default: {
      const wave = Math.sin(t * 2);
      p.sy = 1 + wave * 0.02;
      p.sx = 2 - p.sy;
      p.bob = wave * size * 0.03;
    }
  }
  return p;
}

export const placeholderRenderer = {
  draw(ctx, character, x, y, size) {
    const body = character.skin.palette.body || '#ffc6e5';
    const line = mixHex(body, INK, 0.62);
    const lw = Math.max(2, size * 0.05);
    const p = pose(character, size);
    const bottom = y + size / 2;

    if (character.drawShadow) {
      ctx.fillStyle = 'rgba(40,12,70,0.3)';
      ctx.beginPath();
      ctx.ellipse(x, bottom + size * 0.04, size * 0.36, size * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const h = size * p.sy;
    const w = size * 0.7 * p.sx;
    const cy = bottom - h / 2 + p.bob;

    ctx.save();
    ctx.translate(x, cy);
    ctx.rotate(p.rot);

    // Pies (detrás del cuerpo): alternan al correr y se recogen al saltar.
    const footW = size * 0.17;
    const footH = size * 0.11;
    const fy = h / 2 - footH * 0.35;
    for (const [side, lift] of [[-1, p.footL], [1, p.footR]]) {
      const fx = side * w * 0.29 * p.spread;
      const yy = fy - Math.max(0, lift);
      ctx.beginPath();
      ctx.ellipse(fx, yy, footW * (1 - Math.max(0, -lift) / size), footH, 0, 0, Math.PI * 2);
      ctx.fillStyle = mixHex(body, '#7a3d8c', 0.45);
      ctx.fill();
      ctx.lineWidth = lw * 0.9;
      ctx.strokeStyle = line;
      ctx.stroke();
    }

    // Cuerpo con luz arriba-izquierda y contorno de color.
    const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    grad.addColorStop(0, mixHex(body, '#ffffff', 0.4));
    grad.addColorStop(0.5, body);
    grad.addColorStop(1, mixHex(body, '#5a2a8c', 0.38));
    capsule(ctx, 0, 0, w, h);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.lineWidth = lw;
    ctx.strokeStyle = line;
    ctx.stroke();

    // Marca en la espalda (indica la orientación sin definir un diseño).
    ctx.fillStyle = mixHex(body, '#7a3d8c', 0.28);
    capsule(ctx, 0, -h * 0.02, w * 0.46, h * 0.36);
    ctx.fill();
    ctx.lineWidth = lw * 0.6;
    ctx.strokeStyle = mixHex(body, INK, 0.45);
    ctx.stroke();

    // Brillo suave.
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-w * 0.2, -h * 0.3, w * 0.09, h * 0.13, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },
};
