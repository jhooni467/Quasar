import { h } from './components/dom.js';
import { DebugOverlay } from './DebugOverlay.js';
import { TitleScreen } from './screens/TitleScreen.js';
import { HudScreen } from './screens/HudScreen.js';
import { GameOverScreen } from './screens/GameOverScreen.js';
import { PauseScreen } from './screens/PauseScreen.js';

/**
 * Capa de interfaz en DOM encima del canvas, alineada con el área segura.
 * Ventajas: texto nítido en cualquier densidad, accesibilidad y botones
 * táctiles reales. Cada pantalla de UI es una clase con mount()/unmount().
 */
export class UIManager {
  constructor({ root, game }) {
    this.root = root;
    this.game = game;
    this._screens = new Map();
    this._current = null;
    this._container = null;

    this.debug = new DebugOverlay({ game });
    this.root.append(this.debug.el);

    this.register('title', TitleScreen);
    this.register('hud', HudScreen);
    this.register('gameover', GameOverScreen);
    this.register('pause', PauseScreen);
  }

  /** Pantalla de UI visible ahora (o null). */
  get current() {
    return this._current;
  }

  register(name, ScreenClass) {
    this._screens.set(name, ScreenClass);
  }

  /** @param {string} name  @param {object} [params] se pasan a la pantalla (tercer argumento del constructor) */
  show(name, params) {
    this.hide();
    const ScreenClass = this._screens.get(name);
    if (!ScreenClass) throw new Error(`Pantalla de UI no registrada: "${name}"`);
    this._container = h('div', { class: 'screen' });
    this.root.append(this._container);
    this._current = new ScreenClass(this.game, this, params);
    this._current.mount(this._container);
  }

  hide() {
    if (this._current) this._current.unmount();
    if (this._container) this._container.remove();
    this._current = null;
    this._container = null;
  }
}
