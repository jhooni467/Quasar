import { mixHex, rgba } from './color.js';
import { mulberry32 } from './random.js';

const TAU = Math.PI * 2;
/** Longitud del ciclo de las siluetas (unidades lógicas). Garantiza deriva sin saltos. */
const WRAP = 2048;
/** Velocidad base de deriva ambiental (unidades lógicas por segundo). */
const DRIFT_SPEED = 28;

/**
 * Dibuja el escenario de una región como capas con profundidad:
 * cielo → estrellas → resplandor de luz → siluetas lejanas → cercanas.
 *
 * Transmite 2.5D con: perspectiva atmosférica (lo lejano se tiñe del color del
 * horizonte), paralaje (cada capa deriva a distinta velocidad), iluminación
 * (resplandor + borde de luz) y gradientes de sombra en cada silueta.
 *
 * Es solo la vista ambiental de una región; no contiene mecánicas ni escenarios
 * procedurales (eso llegará en etapas futuras).
 */
export class ParallaxBackdrop {
  /**
   * @param {object} region   definición de región (ver regions/RegionDefinition.js)
   * @param {object} quality  perfil de calidad activo
   */
  constructor(region, quality) {
    this.region = region;
    this.quality = quality;
    this.time = 0;
    this._w = 0;
    this._h = 0;
    this._cache = null;
    this._ys = new Float32Array(0);
    this._layers = region.layers.map((def) => {
      const rnd = mulberry32(def.seed);
      return { def, phases: def.harmonics.map(() => rnd() * TAU) };
    });
    this._stars = this._makeStars();
  }

  setQuality(quality) {
    this.quality = quality;
    this._stars = this._makeStars();
    this._cache = null;
  }

  resize(viewport) {
    this._w = viewport.width;
    this._h = viewport.height;
    this._cache = null;
  }

  update(dt) {
    this.time += dt;
  }

  _makeStars() {
    const { count, seed } = this.region.stars;
    const n = Math.round(count * this.quality.starDensity);
    const rnd = mulberry32(seed);
    const stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: rnd(),
        y: rnd() * 0.6,
        r: 0.7 + rnd() * 1.5,
        phase: rnd() * TAU,
        speed: 0.6 + rnd() * 1.6,
      });
    }
    return stars;
  }

  /** Crea los gradientes (dependen del contexto y del tamaño). Se cachean hasta el próximo resize. */
  _build(ctx) {
    const { palette, light } = this.region;
    const w = this._w;
    const h = this._h;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, palette.skyTop);
    sky.addColorStop(0.5, palette.skyMid);
    sky.addColorStop(0.88, palette.skyBottom);

    const lx = light.x * w;
    const ly = light.y * h;
    const lr = light.radius * Math.max(w, h);
    const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
    glow.addColorStop(0, rgba(light.color, 0.75));
    glow.addColorStop(0.35, rgba(light.color, 0.22));
    glow.addColorStop(1, rgba(light.color, 0));

    const layers = this._layers.map(({ def }) => {
      const top = mixHex(def.color, palette.skyBottom, def.fade);
      const bottom = mixHex(top, '#05020f', 0.5);
      const peak = def.base * h - def.amplitude * h;
      const fill = ctx.createLinearGradient(0, peak, 0, h);
      fill.addColorStop(0, top);
      fill.addColorStop(1, bottom);
      return { fill, rim: rgba(mixHex(top, light.color, 0.55), 0.55) };
    });

    this._cache = { sky, glow, lx, ly, lr, layers };
  }

  render(ctx) {
    if (!this._cache) this._build(ctx);
    const c = this._cache;
    const w = this._w;
    const h = this._h;

    ctx.fillStyle = c.sky;
    ctx.fillRect(0, 0, w, h);

    this._drawStars(ctx, w, h);

    ctx.fillStyle = c.glow;
    ctx.fillRect(c.lx - c.lr, c.ly - c.lr, c.lr * 2, c.lr * 2);

    for (let i = 0; i < this._layers.length; i++) {
      this._drawLayer(ctx, this._layers[i], c.layers[i], w, h);
    }
  }

  _drawStars(ctx, w, h) {
    const twinkle = this.quality.twinkle;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < this._stars.length; i++) {
      const s = this._stars[i];
      ctx.globalAlpha = twinkle ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.time * s.speed + s.phase)) : 0.8;
      ctx.fillRect(s.x * w - s.r, s.y * h - s.r, s.r * 2, s.r * 2);
    }
    ctx.globalAlpha = 1;
  }

  _drawLayer(ctx, layer, style, w, h) {
    const { def, phases } = layer;
    const step = this.quality.ridgeStep;
    const count = Math.ceil(w / step) + 3;
    if (this._ys.length < count) this._ys = new Float32Array(count);
    const ys = this._ys;

    const offset = this.time * DRIFT_SPEED * def.parallax;
    const baseY = def.base * h;
    const amp = def.amplitude * h;
    let total = 0;
    for (let k = 0; k < def.harmonics.length; k++) total += def.harmonics[k][1];

    for (let i = 0; i < count; i++) {
      const x = (i - 1) * step;
      let n = 0;
      for (let k = 0; k < def.harmonics.length; k++) {
        const hm = def.harmonics[k];
        n += hm[1] * (0.5 + 0.5 * Math.sin((TAU * hm[0] * (x + offset)) / WRAP + phases[k]));
      }
      ys[i] = baseY - amp * (n / total);
    }

    ctx.beginPath();
    ctx.moveTo(-step, h + 2);
    for (let i = 0; i < count; i++) ctx.lineTo((i - 1) * step, ys[i]);
    ctx.lineTo((count - 2) * step, h + 2);
    ctx.closePath();
    ctx.fillStyle = style.fill;
    ctx.fill();

    if (this.quality.rim) {
      ctx.beginPath();
      ctx.moveTo(-step, ys[0]);
      for (let i = 1; i < count; i++) ctx.lineTo((i - 1) * step, ys[i]);
      ctx.strokeStyle = style.rim;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
