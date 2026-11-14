/** Bus de eventos mínimo para comunicar módulos sin acoplarlos entre sí. */
export class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  /** Suscribe `fn` a `event`. Devuelve una función para cancelar la suscripción. */
  on(event, fn) {
    let set = this._handlers.get(event);
    if (!set) {
      set = new Set();
      this._handlers.set(event, set);
    }
    set.add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const set = this._handlers.get(event);
    if (set) set.delete(fn);
  }

  emit(event, ...args) {
    const set = this._handlers.get(event);
    if (!set) return;
    // Copia para tolerar altas/bajas de suscriptores durante la emisión.
    for (const fn of Array.from(set)) fn(...args);
  }
}
