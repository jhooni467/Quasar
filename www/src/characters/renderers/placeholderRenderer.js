import { mixHex } from '../../graphics/color.js';

/**
 * Renderer del personaje PROVISIONAL: una silueta neutra y sin rostro con
 * sombra, solo para ocupar el lugar del protagonista mientras no exista su
 * diseño. No define estilo ni anatomía; se sustituye registrando otro renderer.
 */
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

export const placeholderRenderer = {
  draw(ctx, character, x, y, size) {
    const body = character.skin.palette.body || '#ffc6e5';
    const t = character.time;
    const wave = Math.sin(t * 2);
    const bob = wave * size * 0.03;
    const squash = 1 + wave * 0.02;

    // Sombra en el suelo: se contrae un poco cuando el personaje sube.
    const shadowScale = 1 - wave * 0.06;
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.62, size * 0.36 * shadowScale, size * 0.07 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cuerpo con degradado (luz desde arriba).
    const w = size * 0.7 * (2 - squash);
    const h = size * squash;
    const cy = y + bob;
    const grad = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
    grad.addColorStop(0, mixHex(body, '#ffffff', 0.35));
    grad.addColorStop(1, mixHex(body, '#3a1d70', 0.25));
    ctx.fillStyle = grad;
    capsule(ctx, x, cy, w, h);
    ctx.fill();

    // Brillo suave.
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(x - w * 0.18, cy - h * 0.28, w * 0.1, h * 0.14, -0.3, 0, Math.PI * 2);
    ctx.fill();
  },
};
