/**
 * Tipos de elementos que pueden aparecer en la pista. Datos puros: tamaño de
 * la caja de colisión y el rango de alturas que ocupan.
 *
 *   w, d     ancho (en x) y fondo (en z) de la caja, en unidades/metros
 *   y0, y1   altura inferior y superior que ocupa (el jugador choca si su
 *            cuerpo se solapa con este rango)
 *   sprite   clave del dibujo (ver graphics/runner/SpriteSet.js)
 *
 * Cómo se esquiva cada obstáculo:
 *   hurdle  valla baja    → SALTAR     (y1 por debajo de la altura del salto)
 *   gate    arco alto     → DESLIZARSE (y0 por encima del cuerpo deslizando)
 *   block   bloque macizo → CAMBIAR DE CARRIL (no se puede saltar ni pasar por debajo)
 */
export const ITEM_TYPES = Object.freeze({
  hurdle: Object.freeze({ kind: 'obstacle', sprite: 'hurdle', w: 0.8, d: 0.5, y0: 0, y1: 0.55 }),
  gate: Object.freeze({ kind: 'obstacle', sprite: 'gate', w: 0.9, d: 0.5, y0: 0.85, y1: 2.2 }),
  block: Object.freeze({ kind: 'obstacle', sprite: 'block', w: 0.86, d: 0.8, y0: 0, y1: 1.7 }),
  coin: Object.freeze({ kind: 'coin', sprite: null, w: 0.5, d: 0.5, y0: 0, y1: 0.5 }),
});

/**
 * Código de cada celda de un segmento → elementos que genera.
 * `y` es la altura del centro de la moneda.
 */
export const CELL_CODES = Object.freeze({
  '.': Object.freeze([]),
  c: Object.freeze([{ type: 'coin', y: 0.5 }]),
  l: Object.freeze([{ type: 'hurdle' }]),
  j: Object.freeze([{ type: 'hurdle' }, { type: 'coin', y: 1.2 }]),
  h: Object.freeze([{ type: 'gate' }]),
  u: Object.freeze([{ type: 'gate' }, { type: 'coin', y: 0.35 }]),
  x: Object.freeze([{ type: 'block' }]),
});

/** Celdas que bloquean por completo un carril (obligan a cambiar de carril). */
export const BLOCKING_CODES = Object.freeze(['x']);
