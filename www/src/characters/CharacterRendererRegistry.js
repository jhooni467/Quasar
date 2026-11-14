/**
 * Registro de "renderers" de personaje. Un renderer sabe dibujar un personaje
 * de cierto tipo; la lógica del juego nunca dibuja directamente.
 *
 * Interfaz de un renderer:
 *   { draw(ctx, character, x, y, size) }
 *     - (x, y): centro del personaje en unidades lógicas
 *     - size: alto aproximado del personaje en unidades lógicas
 *
 * Hoy existe 'placeholder'. En una etapa futura se registrará, por ejemplo,
 * un renderer 'sprite' (hojas de sprites + animaciones) sin tocar el resto.
 */
const renderers = new Map();

export function registerCharacterRenderer(type, renderer) {
  if (!renderer || typeof renderer.draw !== 'function') {
    throw new Error(`El renderer "${type}" debe implementar draw()`);
  }
  renderers.set(type, renderer);
}

export function getCharacterRenderer(type) {
  const renderer = renderers.get(type);
  if (!renderer) throw new Error(`No hay renderer de personaje registrado para "${type}"`);
  return renderer;
}
