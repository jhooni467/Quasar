/**
 * Configuración global del juego.
 *
 * ÚNICO lugar donde vive el nombre visible del juego. QUASAR es provisional:
 * para renombrarlo basta cambiar `name` (y, más adelante, `appName` en
 * capacitor.config.json). `id` es la clave técnica usada en el guardado local;
 * cámbiala solo si no te importa perder los datos guardados en tu navegador.
 */
export const GAME = Object.freeze({
  id: 'quasar',
  name: 'QUASAR',
  tagline: 'Runner 2.5D',
  version: '0.1.0',
  stage: 'Etapa 00 · Fundación',
});

/**
 * Resolución de diseño. Todo el juego se dibuja en "unidades lógicas":
 * el área segura mide siempre 1280×720 unidades (16:9) y se escala de forma
 * uniforme (sin deformar) a cualquier pantalla. Si la pantalla es más ancha
 * o más alta, el fondo se extiende más allá del área segura, pero lo
 * importante (interfaz, personaje, gameplay futuro) nunca se corta.
 */
export const VIEW = Object.freeze({
  designWidth: 1280,
  designHeight: 720,
});

/** Parámetros del bucle principal (paso fijo para física/lógica futura). */
export const LOOP = Object.freeze({
  fixedStep: 1 / 60,
  maxFrameDelta: 0.1,
  maxSubSteps: 5,
});
