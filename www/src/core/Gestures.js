/**
 * Reconoce deslizamientos (swipes) sobre la capa de entrada y los emite en el
 * bus como `gesture:swipe` con la dirección: 'left' | 'right' | 'up' | 'down'.
 * También traduce el teclado (flechas / WASD) para poder probar en ordenador.
 *
 * Decisiones para que responda bien en móvil:
 *  - El gesto se emite EN CUANTO el dedo recorre la distancia mínima, sin
 *    esperar a que lo levante: la respuesta es inmediata.
 *  - Un trazo cuenta UNA vez por dirección: un deslizamiento largo no se repite
 *    mientras el dedo siga en la misma dirección. Si el dedo cambia de dirección
 *    sin levantarse (p. ej. izquierda y luego arriba) se emite el nuevo gesto.
 *  - Cada dedo se sigue por separado (`pointerId`), así que un segundo dedo no
 *    interfiere con el primero.
 *  - Los toques que empiezan sobre un botón de la interfaz se ignoran.
 *  - Se bloquean el desplazamiento, el zoom por pellizco, el doble toque y el
 *    menú contextual, que si no moverían la página durante la partida.
 *
 * Solo escucha mientras `enabled` sea true, para que las pantallas de menú no
 * reciban gestos de juego.
 */
const MIN_SWIPE_PX = 18;
const SWIPE_FRACTION = 0.055; // de la dimensión menor de la ventana
/** Un gesto es "horizontal" o "vertical" si domina claramente un eje. */
const AXIS_DOMINANCE = 1.15;

const KEY_DIRECTIONS = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'up',
  KeyW: 'up',
  Space: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
};

export class Gestures {
  /** @param {{bus: import('./EventBus.js').EventBus, target: HTMLElement}} cfg */
  constructor({ bus, target }) {
    this.bus = bus;
    this.target = target;
    this.enabled = false;
    this._touches = new Map(); // pointerId → { x, y }
    this._offs = [];
    this._blockers = [];
  }

  attach() {
    this._offs.push(
      this.bus.on('input:pointerdown', (_pointer, e) => this._down(e)),
      this.bus.on('input:pointermove', (_pointer, e) => this._move(e)),
      this.bus.on('input:pointerup', (_pointer, e) => this._up(e)),
      this.bus.on('input:keydown', (code, e) => this._key(code, e))
    );
    this._blockPageGestures();
  }

  detach() {
    for (const off of this._offs) off();
    this._offs.length = 0;
    for (const [el, type, fn, opts] of this._blockers) el.removeEventListener(type, fn, opts);
    this._blockers.length = 0;
  }

  /** Activa o desactiva el reconocimiento (y descarta toques en curso). */
  setEnabled(value) {
    this.enabled = Boolean(value);
    this._touches.clear();
  }

  /** Distancia mínima (px de pantalla) para considerar un deslizamiento. */
  get threshold() {
    const min = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(MIN_SWIPE_PX, min * SWIPE_FRACTION);
  }

  _down(e) {
    if (!this.enabled) return;
    if (e.target && e.target.closest && e.target.closest('button, a, input, select')) return;
    this._touches.set(e.pointerId, { x: e.clientX, y: e.clientY, dir: null });
  }

  _move(e) {
    const t = this._touches.get(e.pointerId);
    if (!t || !this.enabled) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.max(ax, ay) < this.threshold) return;

    let dir = null;
    if (ax > ay * AXIS_DOMINANCE) dir = dx < 0 ? 'left' : 'right';
    else if (ay > ax * AXIS_DOMINANCE) dir = dy < 0 ? 'up' : 'down';
    if (!dir) return; // diagonal ambigua: se espera a que se defina

    // El origen avanza con el dedo: un cambio de dirección se mide desde el punto más lejano.
    t.x = e.clientX;
    t.y = e.clientY;
    if (dir === t.dir) return; // mismo trazo, misma dirección: ya se emitió
    t.dir = dir;
    this.bus.emit('gesture:swipe', dir);
  }

  _up(e) {
    this._touches.delete(e.pointerId);
  }

  _key(code, e) {
    if (!this.enabled || e.repeat) return;
    const dir = KEY_DIRECTIONS[code];
    if (!dir) return;
    if (e.preventDefault) e.preventDefault();
    this.bus.emit('gesture:swipe', dir);
  }

  /** Evita que el navegador interprete los gestos del juego como acciones de la página. */
  _blockPageGestures() {
    const stop = (e) => {
      if (e.cancelable) e.preventDefault();
    };
    const opts = { passive: false };
    const add = (el, type) => {
      el.addEventListener(type, stop, opts);
      this._blockers.push([el, type, stop, opts]);
    };
    add(this.target, 'touchmove'); // desplazamiento y "tirar para recargar"
    // Pellizco con dos dedos (zoom). Un toque simple NO se bloquea: los botones de la interfaz lo necesitan para recibir `click`.
    const stopMulti = (e) => {
      if (e.touches && e.touches.length > 1 && e.cancelable) e.preventDefault();
    };
    this.target.addEventListener('touchstart', stopMulti, opts);
    this._blockers.push([this.target, 'touchstart', stopMulti, opts]);
    add(document, 'gesturestart'); // zoom por pellizco en Safari
    add(document, 'gesturechange');
    add(document, 'contextmenu'); // pulsación larga
    add(document, 'dblclick');
  }
}
