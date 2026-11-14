/**
 * Personaje PROVISIONAL. Existe solo para que el sistema tenga un protagonista
 * con el que probarse. Se reemplazará (o se añadirán más) sin cambiar el resto
 * del proyecto: basta con una nueva definición y, si usa sprites, su renderer.
 */
export default {
  id: 'placeholder',
  name: 'Personaje provisional',
  render: { type: 'placeholder' },
  skins: [{ id: 'default', name: 'Base', palette: { body: '#ffc6e5' } }],
  animations: { idle: { loop: true } },
  accessories: [],
  abilities: [],
};
