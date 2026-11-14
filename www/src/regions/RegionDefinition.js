/**
 * Definición de región: datos puros, sin lógica. Una región describe cómo se
 * ve y (en el futuro) cómo se comporta un lugar del universo QUASAR.
 *
 * @typedef {Object} RegionDefinition
 * @property {string} id
 * @property {string} name
 * @property {'preview'|'final'} status           'preview' = solo para pruebas técnicas
 * @property {{skyTop:string, skyMid:string, skyBottom:string}} palette
 * @property {{x:number, y:number, radius:number, color:string}} light   posición relativa (0..1)
 * @property {{count:number, seed:number}} stars
 * @property {Array<{id:string, parallax:number, base:number, amplitude:number,
 *                   harmonics:Array<[number,number]>, seed:number, color:string, fade:number}>} layers
 *           capas de siluetas de lejos a cerca (`parallax` mayor = más cercana y rápida)
 *
 * Campos futuros previstos (se añadirán en sus etapas): obstáculos y
 * coleccionables propios, reglas de generación procedural, música y efectos
 * ambientales, criaturas.
 */

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isStr = (v) => typeof v === 'string' && v.length > 0;

/** Devuelve la lista de errores de una definición de región (vacía si es válida). */
export function validateRegionDefinition(def) {
  const errors = [];
  if (!def || typeof def !== 'object') return ['la definición no es un objeto'];
  if (!isStr(def.id)) errors.push('falta "id"');
  if (!isStr(def.name)) errors.push('falta "name"');

  const p = def.palette;
  if (!p || !isStr(p.skyTop) || !isStr(p.skyMid) || !isStr(p.skyBottom)) {
    errors.push('"palette" necesita skyTop, skyMid y skyBottom');
  }

  const l = def.light;
  if (!l || !isNum(l.x) || !isNum(l.y) || !isNum(l.radius) || !isStr(l.color)) {
    errors.push('"light" necesita x, y, radius y color');
  }

  if (!def.stars || !isNum(def.stars.count) || !isNum(def.stars.seed)) {
    errors.push('"stars" necesita count y seed');
  }

  if (!Array.isArray(def.layers) || def.layers.length === 0) {
    errors.push('"layers" debe ser una lista con al menos una capa');
  } else {
    def.layers.forEach((layer, i) => {
      const ok =
        layer &&
        isStr(layer.id) &&
        isNum(layer.parallax) &&
        isNum(layer.base) &&
        isNum(layer.amplitude) &&
        isNum(layer.seed) &&
        isNum(layer.fade) &&
        isStr(layer.color) &&
        Array.isArray(layer.harmonics) &&
        layer.harmonics.length > 0 &&
        layer.harmonics.every((h) => Array.isArray(h) && Number.isInteger(h[0]) && isNum(h[1]));
      if (!ok) errors.push(`la capa #${i} está incompleta (armónicos: [[entero, peso], …])`);
    });
  }
  return errors;
}
