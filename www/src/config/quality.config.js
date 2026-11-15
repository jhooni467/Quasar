/**
 * Perfiles de calidad gráfica.
 *
 * Cada perfil agrupa los parámetros que afectan al coste de render. Los
 * sistemas gráficos leen el perfil activo (`game.quality`) en lugar de tener
 * números "mágicos" propios; así, añadir opciones de optimización en el futuro
 * (por ejemplo detección automática según el dispositivo) solo requiere
 * tocar este archivo y los consumidores.
 */
export const QUALITY_PROFILES = Object.freeze({
  low: Object.freeze({
    id: 'low',
    label: 'Baja',
    maxDpr: 1, // densidad de píxeles máxima del canvas
    targetFps: 30, // tope de fotogramas dibujados por segundo
    ridgeStep: 40, // separación (unidades lógicas) entre puntos de las siluetas
    starDensity: 0.4, // fracción de estrellas respecto al diseño de la región
    twinkle: false, // parpadeo de estrellas
    rim: false, // borde de luz en las siluetas
    // — Partida (runner) —
    drawDistance: 62, // metros de pista que se dibujan
    scenery: 0.55, // cantidad de elementos ambientales (1 = diseño de la región)
    spriteRes: 0.7, // resolución de los sprites pre-dibujados
    grain: false, // textura pictórica y viñeta sobre toda la pantalla
    particles: 0.5, // cantidad de partículas (polvo, destellos)
  }),
  medium: Object.freeze({
    id: 'medium',
    label: 'Media',
    maxDpr: 1.5,
    targetFps: 60,
    ridgeStep: 24,
    starDensity: 0.8,
    twinkle: true,
    rim: true,
    drawDistance: 84,
    scenery: 0.85,
    spriteRes: 1,
    grain: true,
    particles: 0.8,
  }),
  high: Object.freeze({
    id: 'high',
    label: 'Alta',
    maxDpr: 2,
    targetFps: 60,
    ridgeStep: 12,
    starDensity: 1,
    twinkle: true,
    rim: true,
    drawDistance: 100,
    scenery: 1,
    spriteRes: 1.3,
    grain: true,
    particles: 1,
  }),
});

export const QUALITY_ORDER = Object.freeze(['low', 'medium', 'high']);
export const DEFAULT_QUALITY = 'medium';
