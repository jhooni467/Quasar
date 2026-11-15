/** Segmentos de dificultad 2: combinan dos tipos de obstáculo con menos margen. */
export const SEGMENTS_MEDIUM = [
  {
    id: 'slalom-bloques',
    name: 'Slalom de bloques',
    difficulty: 2,
    rows: ['...', '...', 'x..', '...', '...', '.x.', '...', '...', '..x', '...', '...', '.x.', '...', '...', 'x..', '...'],
  },
  {
    id: 'muros-dobles',
    name: 'Muros dobles',
    difficulty: 2,
    rows: ['...', '...', 'xx.', '...', '...', '...', '.xx', '...', '...', '...', 'x.x', '...', '...'],
  },
  {
    id: 'valla-y-arco',
    name: 'Salta y desliza',
    difficulty: 2,
    rows: ['...', '...', 'lll', '...', '...', '...', 'hhh', '...', '...', '...', 'jjj', '...', '...', '...', 'uuu', '...'],
  },
  {
    id: 'mixto-1',
    name: 'Mezcla de tres',
    difficulty: 2,
    rows: ['...', '...', 'l.x', '...', '...', '...', 'x.h', '...', '...', '...', 'hxl', '...', '...'],
  },
  {
    id: 'bloque-central',
    name: 'Bloque central y monedas',
    difficulty: 2,
    rows: ['...', '...', '.x.', 'c.c', 'c.c', '...', '...', '.x.', 'c.c', 'c.c', '...', '...'],
  },
  {
    id: 'arcos-y-bloques',
    name: 'Arcos y bloques',
    difficulty: 2,
    rows: ['...', '...', 'hh.', '...', '...', '...', 'x.x', '...', '...', '...', '.hh', '...', '...', '...', 'xx.', '...'],
  },
];
