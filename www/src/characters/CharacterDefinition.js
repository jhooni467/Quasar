/**
 * Definición de personaje: datos puros, separados de cómo se dibuja.
 * Cambiar el aspecto de un personaje (de provisional a sprites reales) solo
 * exige cambiar `render.type` y sus parámetros; nada más del juego depende
 * de cómo se vea.
 *
 * @typedef {Object} CharacterDefinition
 * @property {string} id
 * @property {string} name
 * @property {{type:string, params?:object}} render
 *           tipo de renderer registrado (ver CharacterRendererRegistry). Hoy: 'placeholder'.
 * @property {Array<{id:string, name:string, palette:Record<string,string>}>} skins
 *           apariencias alternativas (la primera es la de por defecto)
 * @property {Record<string, {loop:boolean}>} animations   debe incluir 'idle'
 * @property {string[]} accessories   ids de accesorios compatibles (futuro)
 * @property {string[]} abilities     ids de habilidades individuales (futuro)
 */

const isStr = (v) => typeof v === 'string' && v.length > 0;

/** Devuelve la lista de errores de una definición de personaje (vacía si es válida). */
export function validateCharacterDefinition(def) {
  const errors = [];
  if (!def || typeof def !== 'object') return ['la definición no es un objeto'];
  if (!isStr(def.id)) errors.push('falta "id"');
  if (!isStr(def.name)) errors.push('falta "name"');
  if (!def.render || !isStr(def.render.type)) errors.push('falta "render.type"');

  if (!Array.isArray(def.skins) || def.skins.length === 0) {
    errors.push('"skins" debe tener al menos una apariencia');
  } else if (!def.skins.every((s) => s && isStr(s.id) && s.palette && typeof s.palette === 'object')) {
    errors.push('cada skin necesita "id" y "palette"');
  }

  if (!def.animations || typeof def.animations !== 'object' || !def.animations.idle) {
    errors.push('"animations" debe incluir "idle"');
  }
  if (!Array.isArray(def.accessories)) errors.push('"accessories" debe ser una lista');
  if (!Array.isArray(def.abilities)) errors.push('"abilities" debe ser una lista');
  return errors;
}
