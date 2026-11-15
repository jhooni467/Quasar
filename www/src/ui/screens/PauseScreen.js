import { h } from '../components/dom.js';

/**
 * Pausa (se activa sola al salir de la app o con Esc / P). Recibe en `params`:
 *   { summary: {score, distance, coins}, onResume(), onHome() }
 */
export class PauseScreen {
  constructor(game, ui, params) {
    this.params = params;
  }

  mount(container) {
    const { summary, onResume, onHome } = this.params;
    this.root = h(
      'div',
      { class: 'over-screen' },
      h(
        'div',
        { class: 'over-card', role: 'dialog', 'aria-label': 'Partida en pausa' },
        h('h2', { class: 'over-title' }, 'Pausa'),
        h('div', { class: 'over-score' }, h('span', { class: 'over-score-value' }, String(summary.score)), h('span', { class: 'over-score-label' }, 'Puntos')),
        h('button', { class: 'btn btn-primary', type: 'button', onclick: onResume }, 'Continuar'),
        h('button', { class: 'btn btn-secondary', type: 'button', onclick: onHome }, 'Salir al inicio')
      )
    );
    container.append(this.root);
  }

  unmount() {
    if (this.root) this.root.remove();
  }
}
