import { CAMERA, TRACK } from '../../config/gameplay.config.js';
import { mixHex, rgba } from '../color.js';
import { mulberry32, hash3 } from '../random.js';
import { Projection } from './Projection.js';
import { SpriteSet } from './SpriteSet.js';

const TAU = Math.PI * 2;
/** Largo (m) de cada franja del suelo y de cada "casilla" de escenario. */
const STRIPE = 4;
const SLOT = 4;
/** Metros por detrás del jugador que aún se dibujan, y distancia a la que se desvanecen. */
const BEHIND = 3.2;
const NEAR_FADE = 5.2;

const out = { x: 0, y: 0, s: 0, depth: 0 };

/**
 * Dibuja una partida: cielo, pista en perspectiva, escenario, obstáculos,
 * monedas, personaje y efectos. No contiene reglas de juego: solo LEE el
 * estado de `Run`.
 *
 * Rendimiento: todo lo costoso (degradados, sprites) se prepara una vez en
 * `resize`/constructor; por fotograma solo hay rellenos de polígonos simples,
 * estampado de sprites ya dibujados y unas pocas partículas, sin reservar memoria.
 */
export class RunnerRenderer {
  /**
   * @param {{region: object, quality: object, character: import('../../characters/Character.js').Character}} cfg
   */
  constructor({ region, quality, character }) {
    this.region = region;
    this.run = region.run;
    this.quality = quality;
    this.character = character;
    this.proj = new Projection();
    this.sprites = SpriteSet.forRegion(region, quality.spriteRes);
    this.time = 0;
    this.camX = 0;
    this.lift = 0;
    this.shake = 0;
    this.flash = 0;
    this.sceneryTable = this._buildSceneryTable();
    this._seed = (Math.random() * 1e9) | 0;
    this._rnd = mulberry32(this._seed);
    this._particles = Array.from({ length: 56 }, () => ({ on: false, kind: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1 }));
    this._puffTimer = 0;
    this._clouds = this._buildClouds();
    this._grain = null;
    this._vp = { width: 0, height: 0 };
    this._hills = this._buildHills();
  }

  setQuality(quality) {
    this.quality = quality;
    this.sprites = SpriteSet.forRegion(this.region, quality.spriteRes);
    this.sceneryTable = this._buildSceneryTable();
    this._grain = null;
    if (this._vp.width) this._buildGradients();
  }

  resize(viewport) {
    this.proj.resize(viewport);
    this.safe = viewport.safe;
    this._vp.width = viewport.width;
    this._vp.height = viewport.height;
    this._buildGradients();
  }

  /* ───────────── preparación ───────────── */

  _buildSceneryTable() {
    const types = this.run.scenery.types;
    let total = 0;
    const table = types.map((t) => {
      total += t.weight;
      return { ...t, acc: total };
    });
    return { list: table, total };
  }

  _buildClouds() {
    const rnd = mulberry32(77);
    return Array.from({ length: 6 }, (_, i) => ({
      sprite: `cloud${i % 3}`,
      x: rnd(),
      y: 0.05 + rnd() * 0.2,
      scale: 0.5 + rnd() * 0.55,
      speed: 0.004 + rnd() * 0.006,
      par: 0.02 + rnd() * 0.05,
    }));
  }

  _buildHills() {
    const pal = this.region.palette;
    return this.region.layers.map((l) => {
      const rnd = mulberry32(l.seed);
      return {
        ...l,
        fill: mixHex(l.color, pal.skyBottom, l.fade),
        phases: l.harmonics.map(() => rnd() * TAU),
        norm: l.harmonics.reduce((a, [, w]) => a + w, 0),
      };
    });
  }

  _buildGradients() {
    const { width: W, height: H } = this._vp;
    const p = this.proj;
    const pal = this.region.palette;
    const r = this.run;
    const ctx = document.createElement('canvas').getContext('2d');
    const hz = p.horizonY;

    this.skyGrad = ctx.createLinearGradient(0, 0, 0, hz);
    this.skyGrad.addColorStop(0, pal.skyTop);
    this.skyGrad.addColorStop(0.55, pal.skyMid);
    this.skyGrad.addColorStop(1, pal.skyBottom);

    const span = Math.max(1, H - hz);
    this.grassGrad = ctx.createLinearGradient(0, hz, 0, H);
    this.grassGrad.addColorStop(0, mixHex(r.ground.grassFar, r.fog, 0.4));
    this.grassGrad.addColorStop(0.06, r.ground.grassFar);
    this.grassGrad.addColorStop(0.28, r.ground.grass);
    this.grassGrad.addColorStop(1, r.ground.grassShade);

    this.trackGrad = ctx.createLinearGradient(0, hz, 0, H);
    this.trackGrad.addColorStop(0, mixHex(r.track.base, r.fog, 0.5));
    this.trackGrad.addColorStop(0.12, mixHex(r.track.base, r.fog, 0.12));
    this.trackGrad.addColorStop(0.4, r.track.base);
    this.trackGrad.addColorStop(1, mixHex(r.track.base, r.track.shade, 0.5));

    this.hazeGrad = ctx.createLinearGradient(0, hz - span * 0.2, 0, hz + span * 0.3);
    this.hazeGrad.addColorStop(0, rgba(r.fog, 0));
    this.hazeGrad.addColorStop(0.4, rgba(r.fog, 0.38));
    this.hazeGrad.addColorStop(1, rgba(r.fog, 0));
    this._hazeTop = hz - span * 0.2;
    this._hazeH = span * 0.5;

    const light = this.region.light;
    const lx = W * light.x;
    const ly = this.safe.y + this.safe.h * light.y;
    const lr = W * light.radius;
    this.glowGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
    this.glowGrad.addColorStop(0, rgba(light.color, 0.8));
    this.glowGrad.addColorStop(0.3, rgba(light.color, 0.3));
    this.glowGrad.addColorStop(1, rgba(light.color, 0));
    this._glow = { x: lx, y: ly, r: lr };

    this.vignette = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.3, W / 2, H * 0.55, Math.max(W, H) * 0.78);
    this.vignette.addColorStop(0, 'rgba(36,10,70,0)');
    this.vignette.addColorStop(1, 'rgba(36,10,70,0.38)');

    // Estrellas (posiciones fijas, parpadeo por tiempo).
    const rnd = mulberry32(this.region.stars.seed);
    const n = Math.round(this.region.stars.count * this.quality.starDensity);
    this._stars = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * hz * 0.85, r: 0.6 + rnd() * 1.3, ph: rnd() * TAU }));
  }

  /** Textura pictórica: pinceladas translúcidas en un mosaico pequeño que se repite. */
  _makeGrain(ctx) {
    const S = 192;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    const rnd = mulberry32(4242);
    g.lineCap = 'round';
    for (let i = 0; i < 110; i++) {
      const x = rnd() * S;
      const y = rnd() * S;
      const a = -0.8 + (rnd() - 0.5) * 0.9;
      const l = 5 + rnd() * 13;
      g.strokeStyle = rnd() < 0.5 ? 'rgba(255,240,225,0.9)' : 'rgba(60,20,100,0.9)';
      g.lineWidth = 1.5 + rnd() * 3.5;
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        g.beginPath();
        g.moveTo(x + ox, y + oy);
        g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l);
        g.stroke();
      }
    }
    return ctx.createPattern(c, 'repeat');
  }

  /* ───────────── actualización ───────────── */

  /** Avanza efectos visuales. @param {number} dt @param {import('../../gameplay/Run.js').Run} run */
  update(dt, run) {
    this.time += dt;
    const p = run.player;

    // Cámara: sigue lateralmente con suavizado y sube un poco al saltar.
    const camTarget = p.x * CAMERA.followX;
    this.camX += (camTarget - this.camX) * (1 - Math.exp(-dt * CAMERA.followSmooth));
    const liftTarget = p.y * CAMERA.jumpLift;
    this.lift += (liftTarget - this.lift) * (1 - Math.exp(-dt * 10));

    this.shake *= Math.exp(-dt * 7);
    this.flash *= Math.exp(-dt * 6);

    // Polvo continuo al deslizarse.
    if (run.state === 'running' && p.sliding) {
      this._puffTimer -= dt;
      if (this._puffTimer <= 0) {
        this._puffTimer = 0.045;
        this._emit(0, p.x, 0.05, run.z - 0.2, 2);
      }
    }

    // Partículas.
    for (const q of this._particles) {
      if (!q.on) continue;
      q.life -= dt;
      if (q.life <= 0) {
        q.on = false;
        continue;
      }
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy -= (q.kind === 1 ? 0 : 2.5) * dt;
      q.vx *= Math.exp(-dt * 2);
    }

    this.character.lean = p.lean + p.bump * 0.6;
    this.character.drawShadow = false;
    this.character.play(p.animation);
    this.character.update(dt);
  }

  /** Reacciona a eventos de la partida con efectos visuales. */
  onRunEvent(name, data, run) {
    const p = run.player;
    switch (name) {
      case 'jump':
        this._emit(0, p.x, 0.05, run.z, 3);
        break;
      case 'land':
        this._emit(0, p.x, 0.05, run.z, 6);
        this.shake = Math.max(this.shake, 0.18);
        break;
      case 'lane':
        this._emit(0, p.x, 0.05, run.z - 0.1, 2);
        break;
      case 'coin':
        this._emit(1, data.x, data.y, data.z, 6);
        break;
      case 'crash':
        this.shake = 1;
        this.flash = 0.7;
        this._emit(0, p.x, 0.4, run.z, 10);
        this._emit(1, p.x, 0.6, run.z, 8);
        break;
      default:
    }
  }

  /** @param {number} kind 0 = polvo, 1 = destello */
  _emit(kind, x, y, z, n) {
    const count = Math.max(1, Math.round(n * this.quality.particles));
    const rnd = this._rnd;
    for (let i = 0; i < count; i++) {
      const q = this._particles.find((e) => !e.on);
      if (!q) return;
      q.on = true;
      q.kind = kind;
      q.x = x + (rnd() - 0.5) * 0.3;
      q.y = y;
      q.z = z + (rnd() - 0.5) * 0.4;
      q.vx = (rnd() - 0.5) * (kind === 1 ? 3 : 1.8);
      q.vy = kind === 1 ? 1.2 + rnd() * 2.2 : 0.4 + rnd() * 1.2;
      q.max = q.life = kind === 1 ? 0.5 + rnd() * 0.3 : 0.35 + rnd() * 0.3;
      q.size = kind === 1 ? 0.07 + rnd() * 0.06 : 0.14 + rnd() * 0.16;
    }
  }

  /* ───────────── dibujo ───────────── */

  /** @param {CanvasRenderingContext2D} ctx @param {{width:number,height:number}} vp @param {import('../../gameplay/Run.js').Run} run */
  render(ctx, vp, run) {
    const p = this.proj;
    const W = vp.width;
    const H = vp.height;
    p.follow(run.z, this.camX, this.lift);
    p.shakeX = this.shake > 0.01 ? (this._rnd() - 0.5) * this.shake * 14 : 0;
    p.shakeY = this.shake > 0.01 ? (this._rnd() - 0.5) * this.shake * 14 : 0;

    this._drawSky(ctx, W);
    this._drawGround(ctx, W, H, run);
    this._drawWorld(ctx, W, H, run);

    if (this.quality.grain) {
      ctx.fillStyle = this.vignette;
      ctx.fillRect(0, 0, W, H);
      if (!this._grain) this._grain = this._makeGrain(ctx);
      ctx.globalAlpha = 0.045;
      ctx.fillStyle = this._grain;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (this.flash > 0.02) {
      ctx.fillStyle = `rgba(255,236,230,${Math.min(0.6, this.flash)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  _drawSky(ctx, W) {
    const p = this.proj;
    const hz = p.horizonY;
    const t = this.time;
    ctx.fillStyle = this.skyGrad;
    ctx.fillRect(0, 0, W, hz + 2);

    // Estrellas.
    ctx.fillStyle = '#fff6e8';
    for (const s of this._stars) {
      const tw = this.quality.twinkle ? 0.55 + 0.45 * Math.sin(t * 1.6 + s.ph) : 0.8;
      ctx.globalAlpha = tw * 0.9;
      ctx.beginPath();
      ctx.arc(s.x - this.camX * 3, s.y, s.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Resplandor y planeta.
    const g = this._glow;
    ctx.fillStyle = this.glowGrad;
    ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
    const planet = this.sprites.get('planet');
    const pk = (this.safe.w * 0.4) / (planet.canvas.width);
    ctx.drawImage(planet.canvas, g.x - planet.ax * pk - this.camX * 5, this.safe.y + this.safe.h * 0.13 - planet.ay * pk, planet.canvas.width * pk, planet.canvas.height * pk);

    // Nubes a la deriva.
    const wrap = W + 600;
    for (const c of this._clouds) {
      const sp = this.sprites.get(c.sprite);
      const k = (this.safe.w * 0.42 * c.scale) / sp.canvas.width;
      const x = ((c.x * wrap + t * c.speed * wrap - this.camX * c.par * 100) % wrap + wrap) % wrap - 300;
      const y = this.safe.y + this.safe.h * c.y;
      ctx.globalAlpha = 0.82;
      ctx.drawImage(sp.canvas, x - sp.ax * k, y - sp.ay * k, sp.canvas.width * k, sp.canvas.height * k);
    }
    ctx.globalAlpha = 1;

    // Colinas.
    const step = this.quality.ridgeStep;
    for (const l of this._hills) {
      const base = hz + l.base * this.safe.h;
      const amp = l.amplitude * this.safe.h;
      const off = this.camX * l.parallax * 0.6 + t * 0.002 * l.parallax;
      ctx.fillStyle = l.fill;
      ctx.beginPath();
      ctx.moveTo(-step, hz + 6);
      for (let x = -step; x <= W + step; x += step) {
        const u = x / W + off;
        let v = 0;
        for (let i = 0; i < l.harmonics.length; i++) v += Math.sin(u * TAU * l.harmonics[i][0] + l.phases[i]) * l.harmonics[i][1];
        v = (v / l.norm + 1) / 2;
        ctx.lineTo(x, base - v * amp);
      }
      ctx.lineTo(W + step, hz + 6);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawGround(ctx, W, H, run) {
    const p = this.proj;
    const r = this.run;
    const hz = p.horizonY;
    const dist = this.quality.drawDistance;
    const zFar = run.z + dist;

    ctx.fillStyle = this.grassGrad;
    ctx.fillRect(0, hz, W, H - hz);

    const hw = TRACK.halfWidth;
    const cw = TRACK.curbWidth;
    const nearD = 0.7;
    const farD = 700;
    const yN = p.groundY(nearD);
    const yF = p.groundY(farD);
    const sN = p.scaleAt(nearD);
    const sF = p.scaleAt(farD);
    const cxN = p.centerX - p.camX * sN + p.shakeX;
    const cxF = p.centerX - p.camX * sF + p.shakeX;

    // Pista y bordillos (base continua).
    const poly = (x0n, x1n, x0f, x1f) => {
      ctx.beginPath();
      ctx.moveTo(cxN + x0n * sN, yN);
      ctx.lineTo(cxN + x1n * sN, yN);
      ctx.lineTo(cxF + x1f * sF, yF);
      ctx.lineTo(cxF + x0f * sF, yF);
      ctx.closePath();
    };
    ctx.fillStyle = r.track.curbA;
    poly(-hw - cw, -hw, -hw - cw, -hw);
    ctx.fill();
    poly(hw, hw + cw, hw, hw + cw);
    ctx.fill();
    ctx.fillStyle = this.trackGrad;
    poly(-hw, hw, -hw, hw);
    ctx.fill();

    // Franjas alternas ligadas al mundo: dan la sensación de velocidad.
    const first = Math.floor((p.camZ + nearD) / STRIPE);
    const last = Math.floor(zFar / STRIPE);
    const shade = rgba(r.track.shade, 1);
    const grassShade = rgba(r.ground.grassShade, 1);
    const trapezoid = (z0, z1, xa, xb) => {
      const d0 = Math.max(z0 - p.camZ, nearD);
      const d1 = z1 - p.camZ;
      const s0 = p.scaleAt(d0);
      const s1 = p.scaleAt(d1);
      const y0 = p.groundY(d0);
      const y1 = p.groundY(d1);
      const c0 = p.centerX - p.camX * s0 + p.shakeX;
      const c1 = p.centerX - p.camX * s1 + p.shakeX;
      ctx.beginPath();
      ctx.moveTo(c0 + xa * s0, y0);
      ctx.lineTo(c0 + xb * s0, y0);
      ctx.lineTo(c1 + xb * s1, y1);
      ctx.lineTo(c1 + xa * s1, y1);
      ctx.closePath();
    };

    for (let i = first; i <= last; i++) {
      const z0 = i * STRIPE;
      const z1 = z0 + STRIPE;
      const fade = 1 - Math.min(1, (z0 - run.z) / dist);
      if (i & 1) {
        ctx.globalAlpha = 0.16 * fade;
        ctx.fillStyle = grassShade;
        const d0 = Math.max(z0 - p.camZ, nearD);
        const ya = p.groundY(d0);
        const yb = p.groundY(z1 - p.camZ);
        ctx.fillRect(0, yb, W, ya - yb);
        ctx.globalAlpha = 0.5 * fade;
        ctx.fillStyle = shade;
        trapezoid(z0, z1, -hw, hw);
        ctx.fill();
      } else {
        // curbs alternos (franjas claras)
        ctx.globalAlpha = fade;
        ctx.fillStyle = r.track.curbB;
        trapezoid(z0, z1, -hw - cw, -hw);
        ctx.fill();
        trapezoid(z0, z1, hw, hw + cw);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Líneas discontinuas entre carriles.
    ctx.fillStyle = rgba(r.track.line, 0.9);
    ctx.beginPath();
    const lw = 0.035;
    for (let i = first; i <= last; i++) {
      const z0 = i * STRIPE + 0.4;
      const z1 = z0 + 1.7;
      for (const lx of [-0.5, 0.5]) {
        const d0 = Math.max(z0 - p.camZ, nearD);
        const d1 = z1 - p.camZ;
        if (d1 <= nearD) continue;
        const s0 = p.scaleAt(d0);
        const s1 = p.scaleAt(d1);
        const y0 = p.groundY(d0);
        const y1 = p.groundY(d1);
        const c0 = p.centerX - p.camX * s0 + p.shakeX;
        const c1 = p.centerX - p.camX * s1 + p.shakeX;
        ctx.moveTo(c0 + (lx - lw) * s0, y0);
        ctx.lineTo(c0 + (lx + lw) * s0, y0);
        ctx.lineTo(c1 + (lx + lw) * s1, y1);
        ctx.lineTo(c1 + (lx - lw) * s1, y1);
        ctx.closePath();
      }
    }
    ctx.fill();
  }

  /** Escenario, obstáculos, monedas, personaje y partículas, de lejos a cerca. */
  _drawWorld(ctx, W, H, run) {
    const dist = this.quality.drawDistance;
    const zMax = run.z + dist;
    const zMin = run.z - BEHIND;
    const slotEnd = Math.floor(zMax / SLOT);
    const slotStart = Math.floor(zMin / SLOT);
    const items = run.track.items;
    let i = items.length - 1;
    while (i >= 0 && items[i].z >= (slotEnd + 1) * SLOT) i--;

    let playerDone = false;
    let hazeDone = false;
    const hazeZ = run.z + dist * 0.42;

    for (let slot = slotEnd; slot >= slotStart; slot--) {
      const zLo = slot * SLOT;
      if (!hazeDone && zLo <= hazeZ) {
        // Perspectiva atmosférica: lo lejano ya dibujado queda velado por la bruma.
        ctx.fillStyle = this.hazeGrad;
        ctx.fillRect(0, this._hazeTop, W, this._hazeH);
        hazeDone = true;
      }
      this._drawScenery(ctx, W, slot, run, dist);
      while (i >= 0 && items[i].z >= zLo) {
        const it = items[i];
        if (!playerDone && it.z < run.z) {
          this._drawPlayer(ctx, run);
          playerDone = true;
        }
        this._drawItem(ctx, it, run, dist, W);
        i--;
      }
      if (!playerDone && run.z >= zLo) {
        this._drawPlayer(ctx, run);
        playerDone = true;
      }
    }
    if (!playerDone) this._drawPlayer(ctx, run);
    this._drawParticles(ctx);
  }

  _alphaFor(depth, dist) {
    let a = 1;
    const far = dist + 4;
    if (depth > far - 18) a = Math.max(0, (far - depth) / 18);
    if (depth < NEAR_FADE) a = Math.min(a, Math.max(0, (depth - 2.2) / (NEAR_FADE - 2.2)));
    return a;
  }

  _drawScenery(ctx, W, slot, run, dist) {
    const p = this.proj;
    const tbl = this.sceneryTable;
    const density = this.run.scenery.density * this.quality.scenery;
    const edge = TRACK.halfWidth + TRACK.curbWidth;
    for (let side = -1; side <= 1; side += 2) {
      for (let k = 0; k < 2; k++) {
        const base = hash3(slot, side, k, this._seed);
        if (base > density * (k === 0 ? 0.8 : 0.55)) continue;
        // tipo por peso
        let roll = hash3(slot, side, k + 10, this._seed) * tbl.total;
        let t = tbl.list[tbl.list.length - 1];
        for (const e of tbl.list) {
          if (roll <= e.acc) {
            t = e;
            break;
          }
        }
        const hx = hash3(slot, side, k + 20, this._seed);
        const hz = hash3(slot, side, k + 30, this._seed);
        const hs = hash3(slot, side, k + 40, this._seed);
        const hv = hash3(slot, side, k + 50, this._seed);
        const wx = side * (edge + t.x[0] + hx * (t.x[1] - t.x[0]));
        const wz = slot * SLOT + hz * SLOT;
        if (!p.project(wx, 0, wz, out)) continue;
        const alpha = this._alphaFor(out.depth, dist);
        if (alpha <= 0.02) continue;
        const variants = this._variantsOf(t.type);
        const sprite = this.sprites.get(`${t.type}${Math.floor(hv * variants)}`);
        if (!sprite) continue;
        const scale = t.scale[0] + hs * (t.scale[1] - t.scale[0]);
        const kk = (out.s * scale) / sprite.ppu;
        const dw = sprite.canvas.width * kk;
        const dh = sprite.canvas.height * kk;
        const x = out.x - sprite.ax * kk;
        if (x > W || x + dw < 0) continue;
        if (alpha < 1) ctx.globalAlpha = alpha;
        ctx.drawImage(sprite.canvas, x, out.y - sprite.ay * kk, dw, dh);
        if (alpha < 1) ctx.globalAlpha = 1;
      }
    }
  }

  _variantsOf(type) {
    return this.sprites.variants[type] || 1;
  }

  _drawItem(ctx, it, run, dist, W) {
    const p = this.proj;
    if (!p.project(it.x, 0, it.z, out)) return;
    const alpha = this._alphaFor(out.depth, dist);
    if (alpha <= 0.02) return;

    if (it.kind === 'coin') {
      this._drawCoin(ctx, it, run, alpha);
      return;
    }
    const sprite = this.sprites.get(it.sprite);
    const kk = out.s / sprite.ppu;
    const x = out.x - sprite.ax * kk;
    const dw = sprite.canvas.width * kk;
    if (x > W || x + dw < 0) return;
    if (alpha < 1) ctx.globalAlpha = alpha;
    ctx.drawImage(sprite.canvas, x, out.y - sprite.ay * kk, dw, sprite.canvas.height * kk);
    if (alpha < 1) ctx.globalAlpha = 1;
  }

  _drawCoin(ctx, it, run, alpha) {
    const p = this.proj;
    const coin = this.run.coin;
    let age = 0;
    if (it.taken) {
      age = run.time - it.takenAt;
      if (age > 0.28) return; // la moneda recogida desaparece con un destello
    }
    const bob = Math.sin(this.time * 3 + it.phase) * 0.05;
    const gx = out.x;
    const gy = out.y; // suelo
    const s = out.s;
    if (!p.project(it.x, it.y + bob, it.z, out)) return;
    const pop = it.taken ? 1 + age * 4 : 1;
    const r = 0.27 * out.s * pop;
    ctx.globalAlpha = alpha * (it.taken ? 1 - age / 0.28 : 1);

    // sombra en el suelo
    if (!it.taken) {
      ctx.fillStyle = 'rgba(45,14,76,0.25)';
      ctx.beginPath();
      ctx.ellipse(gx, gy, r * 0.8, r * 0.22, 0, 0, TAU);
      ctx.fill();
    }

    const spin = Math.abs(Math.cos(this.time * 4.2 + it.phase));
    const w = r * (0.22 + 0.78 * spin);
    // halo
    ctx.fillStyle = rgba(coin.light, 0.22);
    ctx.beginPath();
    ctx.arc(out.x, out.y, r * 1.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = coin.dark;
    ctx.beginPath();
    ctx.ellipse(out.x, out.y, w, r, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = coin.base;
    ctx.beginPath();
    ctx.ellipse(out.x, out.y, w * 0.82, r * 0.86, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = coin.light;
    ctx.beginPath();
    ctx.ellipse(out.x - w * 0.22, out.y - r * 0.28, w * 0.3, r * 0.3, -0.5, 0, TAU);
    ctx.fill();
    void s;
    ctx.globalAlpha = 1;
  }

  _drawPlayer(ctx, run) {
    const p = this.proj;
    const pl = run.player;
    if (!p.project(pl.x, 0, run.z, out)) return;
    const gx = out.x;
    const gy = out.y;
    const s = out.s;

    // Sombra en el suelo: más pequeña y tenue cuanto más alto está el personaje.
    const h = Math.min(1, pl.y / 1.6);
    ctx.fillStyle = `rgba(45,14,76,${0.34 * (1 - h * 0.55)})`;
    ctx.beginPath();
    ctx.ellipse(gx, gy + s * 0.02, s * 0.36 * (1 - h * 0.3), s * 0.085 * (1 - h * 0.3), 0, 0, TAU);
    ctx.fill();

    // Personaje: (x, y) es el centro del cuerpo en pie; la altura de salto sube los pies.
    const size = s;
    p.project(pl.x, pl.y, run.z, out);
    this.character.render(ctx, out.x, out.y - size / 2, size);
  }

  _drawParticles(ctx) {
    const p = this.proj;
    const coin = this.run.coin;
    for (const q of this._particles) {
      if (!q.on) continue;
      if (!p.project(q.x, q.y, q.z, out)) continue;
      const k = q.life / q.max;
      const r = q.size * out.s;
      if (q.kind === 1) {
        ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.fillStyle = coin.light;
        ctx.beginPath();
        ctx.moveTo(out.x, out.y - r * 1.6);
        ctx.lineTo(out.x + r * 0.5, out.y);
        ctx.lineTo(out.x, out.y + r * 1.6);
        ctx.lineTo(out.x - r * 0.5, out.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.globalAlpha = k * 0.55;
        ctx.fillStyle = '#fff1e0';
        ctx.beginPath();
        ctx.arc(out.x, out.y, r * (1.4 - k * 0.5), 0, TAU);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}
