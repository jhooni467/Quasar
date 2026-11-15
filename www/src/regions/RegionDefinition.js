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
 * @property {object} [run]   solo regiones JUGABLES: colores del suelo y la pista, elementos
 *           ambientales y estilo de obstáculos (ver regions/definitions/duskMeadow.js).
 *           En una región jugable, `layers[].base` es el desplazamiento bajo el horizonte.
 *
 * Campos futuros previstos (se añadirán en sus etapas): reglas de generación
 * procedural por región, música y efectos ambientales, criaturas.
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

  if (def.run !== undefined) errors.push(...validateRun(def.run));
  return errors;
}

const SCENERY_TYPES = ['pine', 'tree', 'bush', 'rock', 'mushroom', 'flower', 'lamp'];

/** Valida la sección `run` de una región jugable. */
function validateRun(run) {
  const errors = [];
  if (!run || typeof run !== 'object') return ['"run" debe ser un objeto'];
  if (!isStr(run.fog)) errors.push('"run.fog" debe ser un color');
  for (const [group, keys] of [
    ['ground', ['grass', 'grassShade', 'grassFar']],
    ['track', ['base', 'shade', 'line', 'curbA', 'curbB', 'edge']],
  ]) {
    const g = run[group];
    if (!g || !keys.every((k) => isStr(g[k]))) errors.push(`"run.${group}" necesita: ${keys.join(', ')}`);
  }
  if (!run.palette || typeof run.palette !== 'object') errors.push('falta "run.palette"');
  const sc = run.scenery;
  if (!sc || !isNum(sc.density) || !Array.isArray(sc.types) || sc.types.length === 0) {
    errors.push('"run.scenery" necesita density y una lista de types');
  } else {
    sc.types.forEach((t, i) => {
      const ok =
        t &&
        SCENERY_TYPES.includes(t.type) &&
        isNum(t.weight) &&
        Array.isArray(t.x) &&
        t.x.length === 2 &&
        t.x.every(isNum) &&
        Array.isArray(t.scale) &&
        t.scale.length === 2 &&
        t.scale.every(isNum);
      if (!ok) errors.push(`el elemento ambiental #${i} está incompleto (tipos: ${SCENERY_TYPES.join(', ')})`);
    });
  }
  const ob = run.obstacles;
  if (!ob || !ob.hurdle || !ob.gate || !ob.block) errors.push('"run.obstacles" necesita hurdle, gate y block');
  if (!run.coin) errors.push('falta "run.coin"');
  return errors;
}
