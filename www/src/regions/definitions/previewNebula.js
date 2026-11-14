/**
 * Región de PRUEBA TÉCNICA (status: 'preview'). Sirve para demostrar capas,
 * profundidad e iluminación en la pantalla de título. No es contenido final
 * del juego: las regiones reales se diseñarán en etapas futuras.
 */
export default {
  id: 'preview-nebula',
  name: 'Nebulosa de prueba',
  status: 'preview',
  palette: {
    skyTop: '#0f0838',
    skyMid: '#47207f',
    skyBottom: '#ff7fb0',
  },
  light: { x: 0.7, y: 0.5, radius: 0.55, color: '#ffd08a' },
  stars: { count: 110, seed: 7 },
  layers: [
    { id: 'lejos', parallax: 0.12, base: 0.66, amplitude: 0.1, harmonics: [[2, 1], [5, 0.5], [9, 0.25]], seed: 11, color: '#7b46b8', fade: 0.55 },
    { id: 'media', parallax: 0.3, base: 0.74, amplitude: 0.11, harmonics: [[3, 1], [7, 0.45], [13, 0.2]], seed: 23, color: '#5a2f9a', fade: 0.32 },
    { id: 'cerca', parallax: 0.6, base: 0.84, amplitude: 0.1, harmonics: [[4, 1], [9, 0.4], [17, 0.18]], seed: 37, color: '#3a1d70', fade: 0.12 },
    { id: 'frente', parallax: 1, base: 0.94, amplitude: 0.06, harmonics: [[6, 1], [11, 0.5], [23, 0.2]], seed: 51, color: '#1d0e4a', fade: 0 },
  ],
};
