/**
 * Segmentos de dificultad 1: un solo tipo de problema cada vez y mucho espacio.
 * Cada fila mide 3 m; ver SegmentDefinition.js para el significado de los códigos.
 */
export const SEGMENTS_EASY = [
  {
    id: 'monedas-centro',
    name: 'Línea de monedas',
    difficulty: 1,
    rows: ['.c.', '.c.', '.c.', '.c.', '.c.', '.c.', '.c.', '.c.'],
  },
  {
    id: 'monedas-ola',
    name: 'Ola de monedas',
    difficulty: 1,
    rows: ['c..', 'c..', '.c.', '..c', '..c', '.c.', 'c..', 'c..', '.c.', '..c'],
  },
  {
    id: 'primera-valla',
    name: 'Una valla',
    difficulty: 1,
    rows: ['...', '...', '...', '.l.', '...', '...', '...', '...', 'l..', '...', '...', '...'],
  },
  {
    id: 'vallas-premio',
    name: 'Muro de vallas con premio',
    difficulty: 1,
    rows: ['...', '...', '...', 'jjj', '...', '...', '...', '...', '.c.', '.c.', '.c.'],
  },
  {
    id: 'arco-simple',
    name: 'Un arco',
    difficulty: 1,
    rows: ['...', '...', '...', 'uuu', '...', '...', '...', '...', '..c', '..c'],
  },
  {
    id: 'bloques-sueltos',
    name: 'Bloques sueltos',
    difficulty: 1,
    rows: ['...', '...', 'x..', '...', '...', '...', '...', '..x', '...', '...', '...', '...', '.x.', '...', '...'],
  },
  {
    id: 'zigzag-monedas',
    name: 'Zigzag de monedas',
    difficulty: 1,
    rows: ['c..', '.c.', '..c', '.c.', 'c..', '.c.', '..c', '.c.', 'c..'],
  },
];
