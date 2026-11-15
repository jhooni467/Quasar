import { getCharacterRenderer } from './CharacterRendererRegistry.js';

/**
 * Instancia de un personaje en pantalla: estado mutable (animación, apariencia,
 * accesorios) sobre una definición inmutable. No sabe cómo dibujarse; delega
 * en el renderer indicado por la definición.
 */
export class Character {
  /** @param {import('./CharacterDefinition.js').CharacterDefinition} definition */
  constructor(definition) {
    this.definition = definition;
    this.renderer = getCharacterRenderer(definition.render.type);
    this.skin = definition.skins[0];
    this.accessories = [];
    this.animation = 'idle';
    this.time = 0;
    /** Inclinación (-1..1) por cambio de carril; la fija quien controla al personaje. */
    this.lean = 0;
    /** false si quien lo dibuja ya pinta su propia sombra (p. ej. el runner). */
    this.drawShadow = true;
  }

  setSkin(skinId) {
    const skin = this.definition.skins.find((s) => s.id === skinId);
    if (skin) this.skin = skin;
  }

  play(animation) {
    if (!this.definition.animations[animation] || animation === this.animation) return;
    this.animation = animation;
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  render(ctx, x, y, size) {
    this.renderer.draw(ctx, this, x, y, size);
  }
}
