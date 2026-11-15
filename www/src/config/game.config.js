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
  version: '0.2.0',
  stage: 'Etapa 01 · Primer núcleo jugable',
});

/**
 * Composición de diseño: VERTICAL (Portrait) exclusivamente.
 *
 * Todo el juego se dibuja en "unidades lógicas". El área segura mide siempre
 * 720 unidades de ancho (9:16) y entre 1280 y `maxHeight` de alto, y se escala
 * de forma uniforme (sin deformar) a cualquier pantalla:
 *  - Teléfonos alargados (9:19.5, 9:20…): el área segura crece en vertical
 *    hasta `maxHeight` para aprovechar la pantalla.
 *  - Tablets (3:4, 4:3…) y ventanas horizontales: el área segura se centra y
 *    el fondo se extiende a los lados, sin barras negras.
 * Lo importante (interfaz, personaje, gameplay futuro) vive dentro del área
 * segura y nunca se corta.
 */
export const VIEW = Object.freeze({
  designWidth: 720,
  designHeight: 1280,
  maxHeight: 1700,
});

/** Parámetros del bucle principal (paso fijo para física/lógica futura). */
export const LOOP = Object.freeze({
  fixedStep: 1 / 60,
  maxFrameDelta: 0.1,
  maxSubSteps: 5,
});
