/**
 * Parámetros de la jugabilidad. Todo número que afecte a "cómo se siente" el
 * juego vive aquí para poder afinarlo sin tocar la lógica.
 *
 * Unidades del mundo: 1 unidad = ancho de un carril. Distancias en metros
 * (1 m = 1 unidad de profundidad). El jugador mide 1 unidad de alto.
 */

/** Carriles: tres, centrados en x = -1, 0 y 1. */
export const LANES = Object.freeze({
  count: 3,
  spacing: 1,
});

export const RUN = Object.freeze({
  /** Velocidad de avance (m/s): arranca en `baseSpeed` y sube con el tiempo hasta `maxSpeed`. */
  baseSpeed: 9.5,
  maxSpeed: 18.5,
  accel: 0.13,
  /** Rapidez con la que se alcanza la velocidad al empezar (mayor = más brusco). */
  startRamp: 3.2,

  /** Suavizado del cambio de carril (1/s). 24 ≈ 90 % del camino en ~0,1 s. */
  laneSmoothing: 24,

  jump: Object.freeze({
    /** Altura máxima (unidades) y duración total en el aire (s). */
    height: 1.35,
    airTime: 0.58,
    /** Velocidad de caída al deslizar en el aire (unidades/s). */
    fastFallSpeed: 21,
  }),

  slide: Object.freeze({
    duration: 0.72,
  }),

  /** Tiempo (s) que se recuerda un gesto que llega un instante antes de poder ejecutarse. */
  inputBuffer: 0.14,
  slideBuffer: 0.5,

  /** Cuerpo del jugador para colisiones (algo más pequeño que el dibujo: perdona roces). */
  player: Object.freeze({
    width: 0.46,
    depth: 0.5,
    height: 1,
    slideHeight: 0.45,
  }),

  /** Segundos de caída/pantalla de choque antes de mostrar el final de partida. */
  crashDuration: 1.05,

  scoring: Object.freeze({
    perMeter: 1,
    perCoin: 10,
  }),
});

/** Cámara de runner: sigue al personaje desde atrás y desde arriba. */
export const CAMERA = Object.freeze({
  /** Distancia (m) entre la cámara y el personaje. */
  distance: 5,
  /** Horizonte y pies del personaje, como fracción del alto del área segura. */
  horizon: 0.33,
  feet: 0.8,
  /** Píxeles por unidad a la altura del personaje, como fracción del ancho seguro. */
  laneScale: 0.25,
  /** Cuánto sigue la cámara al personaje lateralmente (0 = fija, 1 = pegada) y su suavizado. */
  followX: 0.45,
  followSmooth: 7,
  /** Cuánto sube la cámara cuando el personaje salta. */
  jumpLift: 0.35,
});

export const TRACK = Object.freeze({
  /** Largo (m) de cada fila de un segmento. */
  rowLength: 3,
  /** Filas vacías entre segmentos. */
  gapRows: 4,
  /** Metros de pista sin nada al empezar. */
  introDistance: 36,
  /** Anchura de la pista (a cada lado del centro) y de los bordillos. */
  halfWidth: 1.5,
  curbWidth: 0.34,
  /** Metros por detrás del jugador que se conservan antes de descartar. */
  keepBehind: 6,
});

/** Dificultad máxima de los segmentos según la distancia recorrida (m). */
export const DIFFICULTY = Object.freeze([
  { from: 0, max: 1 },
  { from: 130, max: 2 },
  { from: 380, max: 3 },
]);
