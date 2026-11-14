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
  }),
});

export const QUALITY_ORDER = Object.freeze(['low', 'medium', 'high']);
export const DEFAULT_QUALITY = 'medium';
