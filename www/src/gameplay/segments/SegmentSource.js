/**
 * Fuente de segmentos: de dónde sale el siguiente tramo de pista.
 *
 * Interfaz (cualquier fuente futura debe implementarla):
 *
 *   next({ difficulty, distance }) → SegmentDefinition
 *     - `difficulty`: dificultad máxima permitida ahora (1–3)
 *     - `distance`:   metros recorridos hasta el momento
 *
 * El `Track` solo conoce esta interfaz. Hoy existe `HandmadeSegmentSource`
 * (elige entre segmentos diseñados a mano). La generación procedural futura
 * será otra fuente que fabrique segmentos con la misma forma de datos, sin
 * tocar el `Track`, la lógica de juego ni el dibujado.
 */

/** Elige entre los segmentos diseñados a mano, con azar por semilla. */
export class HandmadeSegmentSource {
  /**
   * @param {{registry: import('./SegmentRegistry.js').SegmentRegistry, rnd: () => number}} cfg
   */
  constructor({ registry, rnd }) {
    this.registry = registry;
    this.rnd = rnd;
    this._last = null;
    this._count = 0;
  }

  next({ difficulty }) {
    const all = this.registry.list();
    let pool = all.filter((s) => s.difficulty <= difficulty);
    if (pool.length === 0) pool = all;
    if (pool.length === 0) throw new Error('No hay segmentos registrados');

    // El primer tramo siempre es suave (monedas) para dar tiempo a entender los gestos.
    if (this._count === 0) {
      const intro = pool.find((s) => s.difficulty === 1 && s.rows.every((r) => !/[lhxju]/.test(r)));
      if (intro) return this._take(intro);
    }

    // Evita repetir el anterior y favorece los de la dificultad actual.
    const candidates = pool.filter((s) => s.id !== this._last);
    const list = candidates.length ? candidates : pool;
    let total = 0;
    for (const s of list) total += s.difficulty === difficulty ? 3 : 1;
    let roll = this.rnd() * total;
    for (const s of list) {
      roll -= s.difficulty === difficulty ? 3 : 1;
      if (roll <= 0) return this._take(s);
    }
    return this._take(list[list.length - 1]);
  }

  _take(segment) {
    this._last = segment.id;
    this._count++;
    return segment;
  }
}
