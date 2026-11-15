import { LANES, TRACK, DIFFICULTY } from '../config/gameplay.config.js';
import { ITEM_TYPES, CELL_CODES } from './items.js';

const EMPTY_ROW = '...';

/** Dificultad máxima permitida a cierta distancia. */
export function difficultyAt(distance) {
  let max = 1;
  for (const step of DIFFICULTY) if (distance >= step.from) max = step.max;
  return max;
}

/**
 * Pista: genera, mantiene y descarta los elementos (obstáculos y monedas) por
 * delante del jugador, a partir de segmentos que le suministra una fuente
 * (`SegmentSource`). No sabe nada de dibujo.
 *
 * `items` está ordenado por `z` creciente. Los objetos se reciclan (pool) para
 * no generar basura durante la partida.
 */
export class Track {
  /** @param {{source: {next: Function}}} cfg */
  constructor({ source }) {
    this.source = source;
    this.items = [];
    this._pool = [];
    this._rows = [];
    this._rowIndex = 0;
    this._nextZ = 0;
    this._startZ = 0;
  }

  reset(startZ = 0) {
    for (const it of this.items) this._pool.push(it);
    this.items.length = 0;
    this._rows.length = 0;
    this._rowIndex = 0;
    this._startZ = startZ;
    this._nextZ = startZ + TRACK.introDistance;
  }

  /**
   * Genera lo necesario hasta `z + ahead` y descarta lo que quedó atrás.
   * @param {number} playerZ
   * @param {number} ahead  metros por delante que deben estar generados
   */
  update(playerZ, ahead) {
    const limit = playerZ + ahead;
    while (this._nextZ <= limit) {
      if (this._rowIndex >= this._rows.length) this._refill(playerZ - this._startZ);
      this._spawnRow(this._rows[this._rowIndex++], this._nextZ);
      this._nextZ += TRACK.rowLength;
    }
    const cut = playerZ - TRACK.keepBehind;
    let drop = 0;
    while (drop < this.items.length && this.items[drop].z < cut) drop++;
    if (drop > 0) {
      for (let i = 0; i < drop; i++) this._pool.push(this.items[i]);
      this.items.splice(0, drop);
    }
  }

  _refill(distance) {
    this._rows.length = 0;
    this._rowIndex = 0;
    for (let i = 0; i < TRACK.gapRows; i++) this._rows.push(EMPTY_ROW);
    const segment = this.source.next({ difficulty: difficultyAt(distance), distance });
    for (const row of segment.rows) this._rows.push(row);
  }

  _spawnRow(row, z) {
    for (let lane = 0; lane < LANES.count; lane++) {
      const specs = CELL_CODES[row[lane]];
      for (const spec of specs) this._add(spec, (lane - 1) * LANES.spacing, z);
    }
  }

  _add(spec, x, z) {
    const type = ITEM_TYPES[spec.type];
    const it = this._pool.pop() || {};
    it.type = spec.type;
    it.kind = type.kind;
    it.sprite = type.sprite;
    it.x = x;
    it.z = z;
    it.w = type.w;
    it.d = type.d;
    if (type.kind === 'coin') {
      it.y = spec.y;
      it.y0 = spec.y - 0.3;
      it.y1 = spec.y + 0.3;
    } else {
      it.y = 0;
      it.y0 = type.y0;
      it.y1 = type.y1;
    }
    it.taken = false;
    it.takenAt = 0;
    it.phase = ((x * 7 + z * 3) % 6.28) + 3.14;
    this.items.push(it);
  }
}
