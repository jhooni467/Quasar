/**
 * Entrada básica: posición del puntero (en unidades lógicas) y estado del
 * teclado. Emite eventos en el bus. NO interpreta gestos todavía: el
 * movimiento por carriles, saltos y deslizamientos (deslizar/tocar) se
 * construirán sobre esta capa en una etapa futura.
 */
export class Input {
  constructor({ target, viewport, bus }) {
    this.target = target;
    this.viewport = viewport;
    this.bus = bus;
    this.pointer = { x: 0, y: 0, down: false };
    this.keys = new Set();

    this._onDown = (e) => this._pointer('input:pointerdown', e, true);
    this._onMove = (e) => this._pointer('input:pointermove', e, null);
    this._onUp = (e) => this._pointer('input:pointerup', e, false);
    this._onKeyDown = (e) => {
      this.keys.add(e.code);
      this.bus.emit('input:keydown', e.code, e);
    };
    this._onKeyUp = (e) => {
      this.keys.delete(e.code);
      this.bus.emit('input:keyup', e.code, e);
    };
    this._onBlur = () => {
      this.keys.clear();
      this.pointer.down = false;
    };
  }

  attach() {
    this.target.addEventListener('pointerdown', this._onDown);
    window.addEventListener('pointermove', this._onMove);
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
  }

  detach() {
    this.target.removeEventListener('pointerdown', this._onDown);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
  }

  isKeyDown(code) {
    return this.keys.has(code);
  }

  _pointer(type, e, down) {
    const s = this.viewport.scale;
    this.pointer.x = e.clientX / s;
    this.pointer.y = e.clientY / s;
    if (down !== null) this.pointer.down = down;
    this.bus.emit(type, this.pointer, e);
  }
}
