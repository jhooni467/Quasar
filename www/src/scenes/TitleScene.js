import { Scene } from '../core/Scene.js';
import { ParallaxBackdrop } from '../graphics/ParallaxBackdrop.js';
import { Character } from '../characters/Character.js';

/**
 * Pantalla de título de la Etapa 00. Integra los sistemas fundamentales para
 * comprobar que trabajan juntos: región (fondo con capas), personaje
 * provisional, interfaz, calidad gráfica y guardado.
 */
export class TitleScene extends Scene {
  enter() {
    const g = this.game;
    const region = g.regions.get('preview-nebula') || g.regions.list()[0];
    this.backdrop = new ParallaxBackdrop(region, g.quality);

    const selected = g.save.data.profile.selectedCharacter;
    const definition = g.characters.get(selected) || g.characters.list()[0];
    this.character = new Character(definition);

    g.ui.show('title');
    this._offQuality = g.bus.on('quality:changed', () => this.backdrop.setQuality(g.quality));
  }

  exit() {
    this._offQuality();
    this.game.ui.hide();
  }

  update(dt) {
    this.backdrop.update(dt);
    this.character.update(dt);
  }

  resize(viewport) {
    this.backdrop.resize(viewport);
  }

  render(ctx, viewport) {
    this.backdrop.render(ctx);
    const { safe } = viewport;
    // Composición vertical: el personaje se centra y su tamaño sigue al ancho del área segura.
    this.character.render(ctx, safe.x + safe.w / 2, safe.y + safe.h * 0.5, safe.w * 0.3);
  }
}
