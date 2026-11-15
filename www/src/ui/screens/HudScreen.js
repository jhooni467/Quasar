import { h } from '../components/dom.js';

/**
 * HUD de la partida: puntuación (centro), monedas (izquierda) y distancia
 * (derecha). Solo se actualiza el texto cuando el valor cambia, para no tocar
 * el DOM en cada fotograma. Incluye una pista de gestos que se desvanece sola.
 */
export class HudScreen {
  constructor(game, ui) {
    this.game = game;
    this.ui = ui;
    this._last = { score: -1, distance: -1, coins: -1 };
  }

  mount(container) {
    this.scoreEl = h('span', { class: 'hud-score-value' }, '0');
    this.coinsEl = h('span', {}, '0');
    this.distEl = h('span', {}, '0');

    this.hint = h(
      'div',
      { class: 'hud-hint', 'aria-hidden': 'true' },
      h('div', { class: 'hint-row' }, h('span', { class: 'hint-key' }, '←  →'), 'Cambia de carril'),
      h('div', { class: 'hint-row' }, h('span', { class: 'hint-key' }, '↑'), 'Salta'),
      h('div', { class: 'hint-row' }, h('span', { class: 'hint-key' }, '↓'), 'Deslízate')
    );

    this.root = h(
      'div',
      { class: 'hud' },
      h(
        'div',
        { class: 'hud-top' },
        h('div', { class: 'hud-pill hud-coins', 'aria-label': 'Monedas' }, h('span', { class: 'coin-icon', 'aria-hidden': 'true' }), this.coinsEl),
        h('div', { class: 'hud-score' }, this.scoreEl, h('span', { class: 'hud-score-label' }, 'Puntos')),
        h('div', { class: 'hud-pill hud-dist', 'aria-label': 'Distancia' }, this.distEl, h('span', { class: 'hud-unit' }, 'm'))
      ),
      this.hint
    );
    container.append(this.root);
  }

  /** Actualiza los marcadores (solo toca el DOM si cambian). */
  setValues({ score, distance, coins }) {
    const d = Math.floor(distance);
    if (score !== this._last.score) {
      this._last.score = score;
      this.scoreEl.textContent = String(score);
    }
    if (d !== this._last.distance) {
      this._last.distance = d;
      this.distEl.textContent = String(d);
    }
    if (coins !== this._last.coins) {
      this._last.coins = coins;
      this.coinsEl.textContent = String(coins);
    }
  }

  hideHint() {
    if (this.hint) this.hint.classList.add('gone');
  }

  unmount() {
    if (this.root) this.root.remove();
  }
}
