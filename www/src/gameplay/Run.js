import { RUN } from '../config/gameplay.config.js';
import { PlayerController } from './PlayerController.js';
import { Track } from './Track.js';

/**
 * Una partida: jugador + pista + marcador + estado. Lógica pura (sin DOM ni
 * canvas), con paso fijo: se puede ejecutar y probar fuera del navegador.
 *
 * Estados:
 *   running  → se corre, se esquiva y se recogen monedas
 *   crashed  → acaba de chocar: el mundo frena y se reproduce la caída
 *   over     → fin de partida (la escena muestra el resumen)
 *
 * Eventos (`onEvent(nombre, datos)`): 'jump', 'slide', 'land', 'lane',
 * 'coin', 'crash', 'over'. Sirven para efectos visuales (y sonoros, más adelante).
 */
export class Run {
  /** @param {{source: object}} cfg  fuente de segmentos (ver SegmentSource.js) */
  constructor({ source }) {
    this.onEvent = null;
    this.player = new PlayerController();
    this.player.onEvent = (name) => this._emit(name);
    this.track = new Track({ source });
    this.reset();
  }

  reset() {
    this.state = 'running';
    this.time = 0;
    this.z = 0;
    this.speed = 0;
    this.coins = 0;
    this.distance = 0;
    this.score = 0;
    this.crashTime = 0;
    /** Obstáculo contra el que se chocó (para dibujarlo/depurar). */
    this.hitItem = null;
    this.player.reset();
    this.track.reset(0);
    this.track.update(0, 120);
  }

  /** Gesto de dirección. Se ignora si la partida no está en curso. */
  swipe(dir) {
    if (this.state === 'running') this.player.swipe(dir);
  }

  /** @param {number} dt  paso fijo en segundos @param {number} ahead metros que deben existir por delante */
  update(dt, ahead = 120) {
    if (this.state === 'over') return;

    if (this.state === 'crashed') {
      this.crashTime += dt;
      this.speed *= Math.exp(-dt * 7);
      this.z += this.speed * dt;
      this.player.animTime += dt;
      if (this.crashTime >= RUN.crashDuration) {
        this.state = 'over';
        this._emit('over');
      }
      return;
    }

    this.time += dt;
    const target = Math.min(RUN.maxSpeed, RUN.baseSpeed + RUN.accel * this.time);
    this.speed = target * (1 - Math.exp(-this.time * RUN.startRamp));
    this.z += this.speed * dt;
    this.player.update(dt);
    this.track.update(this.z, ahead);
    this._collide();

    this.distance = Math.max(0, this.z);
    this._updateScore();
  }

  _updateScore() {
    this.score = Math.floor(this.distance * RUN.scoring.perMeter) + this.coins * RUN.scoring.perCoin;
  }

  _collide() {
    const p = this.player;
    const body = RUN.player;
    const pTop = p.y + p.bodyHeight;
    const items = this.track.items;
    const reach = 1.6;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.z < this.z - reach) continue;
      if (it.z > this.z + reach) break;
      if (it.taken) continue;

      const dx = Math.abs(it.x - p.x);
      const dz = Math.abs(it.z - this.z);

      if (it.kind === 'coin') {
        if (dx < 0.62 && dz < 0.75 && it.y0 < pTop + 0.1 && it.y1 > p.y - 0.1) {
          it.taken = true;
          it.takenAt = this.time;
          this.coins++;
          this._updateScore();
          this._emit('coin', it);
        }
        continue;
      }

      if (dx < (it.w + body.width) / 2 && dz < (it.d + body.depth) / 2 && p.y < it.y1 && pTop > it.y0) {
        this.hitItem = it;
        this.state = 'crashed';
        this.crashTime = 0;
        p.animation = 'hit';
        p.animTime = 0;
        this._emit('crash', it);
        return;
      }
    }
  }

  _emit(name, data) {
    if (this.onEvent) this.onEvent(name, data);
  }
}
