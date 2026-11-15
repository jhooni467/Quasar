import { mulberry32 } from '../random.js';
import { paintPine, paintTree, paintBush, paintRock, paintMushroom, paintFlower, paintLamp } from './scenery.js';
import { paintHurdle, paintGate, paintBlock } from './obstacles.js';
import { paintCloud, paintPlanet } from './sky.js';

/**
 * Dibuja una sola vez todos los sprites de una región en lienzos fuera de
 * pantalla; durante la partida solo se escalan y estampan (`drawImage`), que es
 * muchísimo más barato que dibujar trazos y degradados en cada fotograma.
 *
 * Cada sprite guarda:
 *   canvas  el dibujo
 *   ppu     píxeles del sprite por unidad del mundo
 *   ax, ay  punto de anclaje en píxeles del sprite (centro horizontal y línea del suelo)
 */
const cache = new Map();

function makeSprite({ wu, hu, padX = 0.08, padTop = 0.08, padBottom = 0.16, ppu, seed, paint }) {
  const W = Math.ceil((wu + padX * 2) * ppu);
  const H = Math.ceil((hu + padTop + padBottom) * ppu);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const yBase = (padTop + hu) * ppu;
  const g = { cx: W / 2, yBase, yTop: padTop * ppu, u: ppu, wu, hu, W, H, y: (h) => yBase - h * ppu };
  paint(ctx, g, mulberry32(seed));
  return { canvas, ppu, ax: W / 2, ay: yBase };
}

/** Variantes de cada elemento ambiental: tipo → claves de sprite. */
const VARIANTS = { pine: 3, tree: 6, bush: 2, rock: 2, mushroom: 1, flower: 2, lamp: 1 };

export class SpriteSet {
  /** @param {object} region definición de región jugable  @param {number} res factor de resolución (calidad) */
  constructor(region, res = 1) {
    this.sprites = new Map();
    this.variants = VARIANTS;
    const run = region.run;
    const pal = run.palette;
    const ob = run.obstacles;
    const R = res;
    const add = (key, spec) => this.sprites.set(key, makeSprite(spec));

    // Obstáculos (contorno grueso → más resolución)
    add('hurdle', { wu: 0.98, hu: 0.7, ppu: 250 * R, seed: 101, paint: (c, g, r) => paintHurdle(c, g, r, ob.hurdle) });
    add('gate', { wu: 1.06, hu: 2.4, padTop: 0.1, ppu: 190 * R, seed: 102, paint: (c, g, r) => paintGate(c, g, r, ob.gate) });
    add('block', { wu: 0.98, hu: 1.75, padTop: 0.12, ppu: 220 * R, seed: 103, paint: (c, g, r) => paintBlock(c, g, r, ob.block) });

    // Elementos ambientales
    for (let i = 0; i < VARIANTS.pine; i++) add(`pine${i}`, { wu: 2.6, hu: 4.8, padX: 0.1, ppu: 92 * R, seed: 200 + i * 7, paint: (c, g, r) => paintPine(c, g, r, pal) });
    for (let i = 0; i < VARIANTS.tree; i++) add(`tree${i}`, { wu: 2.8, hu: 4.1, padX: 0.1, ppu: 92 * R, seed: 300 + i * 11, paint: (c, g, r) => paintTree(c, g, r, pal, i) });
    for (let i = 0; i < VARIANTS.bush; i++) add(`bush${i}`, { wu: 1.8, hu: 1.05, ppu: 120 * R, seed: 400 + i * 13, paint: (c, g, r) => paintBush(c, g, r, pal) });
    for (let i = 0; i < VARIANTS.rock; i++) add(`rock${i}`, { wu: 1.3, hu: 0.85, ppu: 120 * R, seed: 500 + i * 17, paint: (c, g, r) => paintRock(c, g, r, pal) });
    add('mushroom0', { wu: 0.95, hu: 0.95, ppu: 140 * R, seed: 600, paint: (c, g, r) => paintMushroom(c, g, r, pal) });
    for (let i = 0; i < VARIANTS.flower; i++) add(`flower${i}`, { wu: 0.8, hu: 0.6, ppu: 150 * R, seed: 700 + i * 19, paint: (c, g, r) => paintFlower(c, g, r, pal) });
    add('lamp0', { wu: 0.4, hu: 3.1, padX: 0.9, ppu: 100 * R, seed: 800, paint: (c, g, r) => paintLamp(c, g, r, pal) });

    // Cielo
    const cloudTint = { base: '#ffd9cf', light: '#fff4ee', shade: '#c88fc8' };
    for (let i = 0; i < 3; i++) {
      const ppu = 100 * R;
      const W = Math.ceil(5 * ppu);
      const H = Math.ceil(1.9 * ppu);
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      paintCloud(canvas.getContext('2d'), W, H, mulberry32(900 + i * 5), cloudTint);
      this.sprites.set(`cloud${i}`, { canvas, ppu, ax: W / 2, ay: H / 2 });
    }
    {
      const ppu = 100 * R;
      const W = Math.ceil(4.2 * ppu);
      const H = Math.ceil(3.2 * ppu);
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      paintPlanet(canvas.getContext('2d'), W, H, { base: '#ff9d7a', light: '#ffd9a6', dark: '#b4488f', ring: '#ffc7a0', glow: '#ffd9a3' });
      this.sprites.set('planet', { canvas, ppu, ax: W / 2, ay: H / 2 });
    }
  }

  get(key) {
    return this.sprites.get(key);
  }

  /** Obtiene (o crea) el juego de sprites de una región para cierta resolución. */
  static forRegion(region, res) {
    const key = `${region.id}@${res}`;
    let set = cache.get(key);
    if (!set) {
      set = new SpriteSet(region, res);
      cache.set(key, set);
    }
    return set;
  }
}
