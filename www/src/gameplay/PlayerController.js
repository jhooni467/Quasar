import { LANES, RUN } from '../config/gameplay.config.js';

const G = (8 * RUN.jump.height) / (RUN.jump.airTime * RUN.jump.airTime);
const JUMP_V = (4 * RUN.jump.height) / RUN.jump.airTime;

/**
 * Movimiento del jugador: carril, salto y deslizamiento. Sin dibujo ni DOM.
 *
 * - Carril: tres posiciones (-1, 0, 1). La posición `x` persigue al carril
 *   objetivo con un suavizado exponencial (rápido y sin rebotes).
 * - Salto: parábola con altura y duración fijas (ver RUN.jump).
 * - Deslizamiento: reduce la altura del cuerpo durante un tiempo. Si se pide
 *   en el aire, el jugador cae rápido y desliza al tocar el suelo.
 * - Gestos pedidos un instante antes de poder ejecutarse se recuerdan un
 *   momento (buffer), para que se sienta preciso.
 *
 * Los cambios relevantes se comunican con `onEvent(nombre)`.
 */
export class PlayerController {
  constructor() {
    this.onEvent = null;
    this.reset();
  }

  reset() {
    this.lane = 0;
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.grounded = true;
    this.slideTime = 0;
    this.fastFall = false;
    this.jumpBuffer = 0;
    this.slideBuffer = 0;
    /** Inclinación visual (-1..1) según el cambio de carril. */
    this.lean = 0;
    /** Impulso visual al chocar contra el borde de la pista (-1 izquierda, 1 derecha). */
    this.bump = 0;
    this.animation = 'run';
    this.animTime = 0;
  }

  get targetX() {
    return this.lane * LANES.spacing;
  }

  get sliding() {
    return this.slideTime > 0;
  }

  /** Altura actual del cuerpo para colisiones. */
  get bodyHeight() {
    return this.sliding ? RUN.player.slideHeight : RUN.player.height;
  }

  /** Aplica un gesto: 'left' | 'right' | 'up' | 'down'. */
  swipe(dir) {
    if (dir === 'left' || dir === 'right') {
      const next = this.lane + (dir === 'left' ? -1 : 1);
      if (next < -1 || next > 1) {
        this.bump = dir === 'left' ? -1 : 1; // ya está en el borde: pequeño empujón visual
        return;
      }
      this.lane = next;
      this._emit('lane');
    } else if (dir === 'up') {
      if (this.grounded) this._jump();
      else this.jumpBuffer = RUN.inputBuffer;
    } else if (dir === 'down') {
      if (this.grounded) this._slide();
      else {
        this.fastFall = true;
        this.slideBuffer = RUN.slideBuffer;
      }
    }
  }

  update(dt) {
    // Posición lateral.
    const dx = this.targetX - this.x;
    if (Math.abs(dx) < 0.0005) this.x = this.targetX;
    else this.x += dx * (1 - Math.exp(-dt * RUN.laneSmoothing));

    // Inclinación visual.
    const leanTarget = Math.max(-1, Math.min(1, (this.targetX - this.x) * 1.6));
    this.lean += (leanTarget - this.lean) * (1 - Math.exp(-dt * 14));
    this.bump *= Math.exp(-dt * 12);
    if (Math.abs(this.bump) < 0.01) this.bump = 0;

    // Temporizadores.
    if (this.jumpBuffer > 0) this.jumpBuffer -= dt;
    if (this.slideBuffer > 0) this.slideBuffer -= dt;
    if (this.slideTime > 0) {
      this.slideTime -= dt;
      if (this.slideTime <= 0) {
        this.slideTime = 0;
        this._emit('slide-end');
      }
    }

    // Vertical.
    if (!this.grounded) {
      this.vy = this.fastFall ? -RUN.jump.fastFallSpeed : this.vy - G * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        this.grounded = true;
        this.fastFall = false;
        this._emit('land');
        if (this.slideBuffer > 0) {
          this.slideBuffer = 0;
          this._slide();
        } else if (this.jumpBuffer > 0) {
          this.jumpBuffer = 0;
          this._jump();
        }
      }
    }

    this._updateAnimation(dt);
  }

  _jump() {
    this.slideTime = 0; // saltar cancela el deslizamiento
    this.grounded = false;
    this.fastFall = false;
    this.vy = JUMP_V;
    this._emit('jump');
  }

  _slide() {
    this.slideTime = RUN.slide.duration;
    this._emit('slide');
  }

  _updateAnimation(dt) {
    const next = !this.grounded ? 'jump' : this.sliding ? 'slide' : 'run';
    if (next !== this.animation) {
      this.animation = next;
      this.animTime = 0;
    } else {
      this.animTime += dt;
    }
  }

  _emit(name) {
    if (this.onEvent) this.onEvent(name);
  }
}
