import { Scene } from '../core/Scene.js';
import { MANIFEST } from '../../assets/manifest.js';

/** Escena de arranque: precarga los recursos del manifiesto y pasa al título. */
export class BootScene extends Scene {
  enter() {
    this.progress = 0;
    this.error = null;
    this.game.assets
      .load(MANIFEST, (p) => {
        this.progress = p;
      })
      .then(() => this.game.scenes.switchTo('title'))
      .catch((err) => {
        console.error(err);
        this.error = err.message;
      });
  }

  render(ctx, viewport) {
    ctx.fillStyle = '#0b0820';
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    const { safe } = viewport;
    const cx = safe.x + safe.w / 2;
    const cy = safe.y + safe.h / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '28px system-ui, sans-serif';
    ctx.fillStyle = this.error ? '#ff9aa8' : '#cbb8ff';
    ctx.fillText(this.error ? `Error de carga: ${this.error}` : 'Cargando…', cx, cy - 20);

    if (!this.error) {
      const w = 360;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(cx - w / 2, cy + 20, w, 8);
      ctx.fillStyle = '#ffd08a';
      ctx.fillRect(cx - w / 2, cy + 20, w * this.progress, 8);
    }
  }
}
