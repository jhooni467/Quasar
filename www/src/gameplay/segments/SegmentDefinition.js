import { CELL_CODES, BLOCKING_CODES } from '../items.js';
import { LANES } from '../../config/gameplay.config.js';

/**
 * Definición de segmento: un tramo de pista diseñado a mano. Datos puros.
 *
 * @typedef {Object} SegmentDefinition
 * @property {string}   id
 * @property {string}   name
 * @property {1|2|3}    difficulty
 * @property {string[]} rows   filas de la MÁS CERCANA a la más lejana. Cada fila tiene un
 *                             carácter por carril (izquierda, centro, derecha):
 *                               .  vacío            c  moneda
 *                               l  valla baja (saltar)      j  valla baja + moneda encima
 *                               h  arco alto (deslizarse)   u  arco alto + moneda debajo
 *                               x  bloque macizo (cambiar de carril)
 *
 * Cada fila mide `TRACK.rowLength` metros. Para separar obstáculos se dejan
 * filas vacías ('...'). Los segmentos se validan al registrarse: así un error
 * de diseño (por ejemplo, un tramo imposible) se detecta al arrancar.
 *
 * Esta es la forma de contenido "diseñado a mano". La generación procedural
 * futura producirá segmentos con esta misma forma (ver SegmentSource.js).
 */

const isStr = (v) => typeof v === 'string' && v.length > 0;

/** Filas que se necesitan entre dos cambios de carril consecutivos. */
const ROWS_BETWEEN_LANE_CHANGES = 2;

/**
 * Comprueba que existe al menos un recorrido posible esquivando los bloques,
 * suponiendo un cambio de carril como máximo cada `ROWS_BETWEEN_LANE_CHANGES`
 * filas. Empieza desde cualquier carril (los segmentos van precedidos de una pausa).
 */
export function hasSafePath(rows) {
  const n = LANES.count;
  const free = (row, lane) => !BLOCKING_CODES.includes(row[lane]);
  // estado: carril + filas desde el último cambio (saturado)
  let states = new Set();
  for (let lane = 0; lane < n; lane++) if (free(rows[0], lane)) states.add(`${lane}:${ROWS_BETWEEN_LANE_CHANGES}`);
  if (states.size === 0) return false;

  for (let r = 1; r < rows.length; r++) {
    const next = new Set();
    for (const key of states) {
      const [lane, since] = key.split(':').map(Number);
      const age = Math.min(ROWS_BETWEEN_LANE_CHANGES, since + 1);
      if (free(rows[r], lane)) next.add(`${lane}:${age}`);
      if (since >= ROWS_BETWEEN_LANE_CHANGES) {
        for (const to of [lane - 1, lane + 1]) {
          if (to >= 0 && to < n && free(rows[r], to)) next.add(`${to}:0`);
        }
      }
    }
    if (next.size === 0) return false;
    states = next;
  }
  return true;
}

/** Devuelve la lista de errores de una definición de segmento (vacía si es válida). */
export function validateSegmentDefinition(def) {
  const errors = [];
  if (!def || typeof def !== 'object') return ['la definición no es un objeto'];
  if (!isStr(def.id)) errors.push('falta "id"');
  if (!isStr(def.name)) errors.push('falta "name"');
  if (![1, 2, 3].includes(def.difficulty)) errors.push('"difficulty" debe ser 1, 2 o 3');
  if (!Array.isArray(def.rows) || def.rows.length < 2) {
    errors.push('"rows" debe ser una lista con al menos 2 filas');
    return errors;
  }
  def.rows.forEach((row, i) => {
    if (typeof row !== 'string' || row.length !== LANES.count) {
      errors.push(`la fila #${i} debe ser un texto de ${LANES.count} caracteres`);
    } else if (![...row].every((ch) => ch in CELL_CODES)) {
      errors.push(`la fila #${i} ("${row}") usa un carácter desconocido`);
    }
  });
  if (errors.length === 0 && !hasSafePath(def.rows)) {
    errors.push('no existe un recorrido posible entre los bloques (hay que dejar más hueco entre ellos)');
  }
  return errors;
}
