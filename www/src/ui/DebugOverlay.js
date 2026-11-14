import { h } from './components/dom.js';

/**
 * Panel de diagnóstico (FPS, tamaño de pantalla, escala, densidad, calidad).
 * Útil para probar en dispositivos reales. Se activa desde la pantalla de
 * título y su estado se guarda en los ajustes.
 */
export class DebugOverlay {
  constructor({ game }) {
    this.game = game;
    this.el = h('pre', { class: 'debug-overlay', 'aria-hidden': 'true', hidden: true });
    this._timer = 0;
  }

  /** Aplica el ajuste guardado. Se llama desde Game.start(), cuando ya existen todos los servicios. */
  init() {
    this.setEnabled(Boolean(this.game.save.data.settings.debug));
  }

  get enabled() {
    return !this.el.hidden;
  }

  setEnabled(enabled) {
    this.el.hidden = !enabled;
    clearInterval(this._timer);
    if (enabled) {
      this._refresh();
      this._timer = setInterval(() => this._refresh(), 500);
    }
  }

  _refresh() {
    const g = this.game;
    const vp = g.viewport;
    this.el.textContent = [
      `FPS      ${g.loop.fps.toFixed(0)} (tope ${g.quality.targetFps}) · ${g.quality.label}`,
      `Pantalla ${window.innerWidth}×${window.innerHeight} px`,
      `Lógica   ${vp.width.toFixed(0)}×${vp.height.toFixed(0)} u · segura ${vp.safe.w.toFixed(0)}×${vp.safe.h.toFixed(0)}`,
      `Escala   ${vp.scale.toFixed(3)} · DPR ${vp.dpr.toFixed(2)} · ${g.scenes.currentName}`,
    ].join('\n');
  }
}
