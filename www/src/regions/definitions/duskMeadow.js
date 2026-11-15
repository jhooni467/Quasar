/**
 * Región de PRUEBA JUGABLE (status: 'preview'): un valle al atardecer con cielo
 * de nebulosa, colinas lejanas y bosque ilustrado. Sirve para probar el núcleo
 * de juego en la Etapa 01; las regiones definitivas se diseñarán más adelante.
 *
 * Además de los campos comunes (cielo, luz, estrellas, capas de colinas), una
 * región jugable declara `run`: colores del suelo y la pista, elementos
 * ambientales y estilo de los obstáculos. Todo es dato: otra región cambia su
 * aspecto sin tocar el código del dibujado.
 *
 * Capas de colinas (`layers`): aquí `base` es el desplazamiento bajo el horizonte
 * (fracción del alto) y `amplitude` la altura de las colinas sobre él.
 */
export default {
  id: 'dusk-meadow',
  name: 'Valle del atardecer (prueba)',
  status: 'preview',
  palette: {
    skyTop: '#241060',
    skyMid: '#7a3fae',
    skyBottom: '#ffb394',
  },
  light: { x: 0.74, y: 0.27, radius: 0.55, color: '#ffd9a3' },
  stars: { count: 70, seed: 21 },
  layers: [
    { id: 'lejos', parallax: 0.1, base: 0.0, amplitude: 0.085, harmonics: [[2, 1], [5, 0.5], [9, 0.22]], seed: 5, color: '#b27ad0', fade: 0.55 },
    { id: 'media', parallax: 0.22, base: 0.004, amplitude: 0.065, harmonics: [[3, 1], [7, 0.45], [12, 0.2]], seed: 17, color: '#7a5cc0', fade: 0.38 },
    { id: 'cerca', parallax: 0.4, base: 0.01, amplitude: 0.045, harmonics: [[4, 1], [8, 0.4], [15, 0.18]], seed: 29, color: '#2fa5a0', fade: 0.12 },
  ],
  run: {
    /** Color de la bruma del horizonte (perspectiva atmosférica). */
    fog: '#ffb89a',
    ground: {
      grass: '#34b98a',
      grassShade: '#259172',
      grassFar: '#6fd39c',
    },
    track: {
      base: '#f7d5b6',
      shade: '#e9b894',
      line: '#fff6e6',
      curbA: '#ff6f91',
      curbB: '#ffe8c6',
      edge: '#a7437a',
    },
    /** Colores de los elementos ambientales. */
    palette: {
      trunk: '#7a4660',
      pine: { dark: '#1d6a5b', mid: '#2f9a78', light: '#7be0a2' },
      trees: [
        { base: '#ff8a4c', light: '#ffc47a', dark: '#d9524a' },
        { base: '#ff7fb0', light: '#ffc3dd', dark: '#c64f9c' },
        { base: '#47c4a6', light: '#a2f2cc', dark: '#27898a' },
      ],
      bush: { base: '#35b08a', light: '#8ff0b8', dark: '#1f7a74', berry: '#ff6f91' },
      rock: { base: '#9a86c9', light: '#cdbcf5', dark: '#5d4a96' },
      mushroom: { cap: '#ff5c7a', spot: '#fff1d6', stem: '#ffe2c2' },
      flower: ['#ffd36a', '#ff8fb8', '#fff1d6', '#b79bff'],
      lamp: { post: '#7a4660', glow: '#ffd36a' },
    },
    /**
     * Elementos ambientales: `x` es la distancia lateral desde el borde de la
     * pista; `scale` multiplica el tamaño base (variedad de escalas).
     */
    scenery: {
      density: 1,
      types: [
        { type: 'pine', weight: 4, x: [1.8, 13], scale: [0.8, 1.5] },
        { type: 'tree', weight: 3, x: [2.2, 11], scale: [0.8, 1.35] },
        { type: 'bush', weight: 4, x: [0.7, 6], scale: [0.7, 1.3] },
        { type: 'rock', weight: 2, x: [0.9, 8], scale: [0.6, 1.4] },
        { type: 'mushroom', weight: 1.5, x: [0.8, 5], scale: [0.8, 1.6] },
        { type: 'flower', weight: 3, x: [0.6, 3.5], scale: [0.9, 1.5] },
        { type: 'lamp', weight: 0.8, x: [0.5, 1.2], scale: [1, 1] },
      ],
    },
    /** Estilo de los obstáculos (colored lineart: el contorno sale del propio color). */
    obstacles: {
      hurdle: { post: '#ff6f91', stripeA: '#fff1d6', stripeB: '#ff7a9e', top: '#ffc4d6' },
      gate: { post: '#2fbfae', stripeA: '#fff1d6', stripeB: '#8a5cf0', lantern: '#ffd36a', top: '#a8f0e4' },
      block: { face: '#8b6ad8', top: '#b9a0ff', side: '#6a4cbc', glyph: '#ffe08a' },
    },
    coin: { base: '#ffc93c', light: '#fff0a8', dark: '#e08a1e' },
  },
};
