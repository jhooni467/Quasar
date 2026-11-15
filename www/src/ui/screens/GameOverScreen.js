import { h } from '../components/dom.js';

/**
 * Fin de partida: resumen y opciones. Recibe en `params`:
 *   { summary: {score, distance, coins}, onRetry(), onHome() }
 */
export class GameOverScreen {
  constructor(game, ui, params) {
    this.params = params;
  }

  mount(container) {
    const { summary, onRetry, onHome } = this.params;
    const stat = (label, value) => h('div', { class: 'over-stat' }, h('span', { class: 'over-stat-value' }, String(value)), h('span', { class: 'over-stat-label' }, label));

    this.retry = h('button', { class: 'btn btn-primary', type: 'button', onclick: onRetry }, 'Jugar de nuevo');
    this.root = h(
      'div',
      { class: 'over-screen' },
      h(
        'div',
        { class: 'over-card', role: 'dialog', 'aria-label': 'Fin de la partida' },
        h('h2', { class: 'over-title' }, '¡Tropezaste!'),
        h('div', { class: 'over-score' }, h('span', { class: 'over-score-value' }, String(summary.score)), h('span', { class: 'over-score-label' }, 'Puntos')),
        h('div', { class: 'over-stats' }, stat('Distancia (m)', Math.floor(summary.distance)), stat('Monedas', summary.coins)),
        this.retry,
        h('button', { class: 'btn btn-secondary', type: 'button', onclick: onHome }, 'Inicio')
      )
    );
    container.append(this.root);
  }

  unmount() {
    if (this.root) this.root.remove();
  }
}
