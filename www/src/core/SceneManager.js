/** Registra escenas por nombre y gestiona la escena activa. */
export class SceneManager {
  constructor(game) {
    this.game = game;
    this._registry = new Map();
    this.current = null;
    this.currentName = null;
  }

  register(name, SceneClass) {
    this._registry.set(name, SceneClass);
  }

  switchTo(name, params) {
    const SceneClass = this._registry.get(name);
    if (!SceneClass) throw new Error(`Escena no registrada: "${name}"`);
    if (this.current) this.current.exit();
    this.current = new SceneClass(this.game);
    this.currentName = name;
    this.current.enter(params);
    this.current.resize(this.game.viewport);
    this.game.bus.emit('scene:changed', name);
  }

  update(dt) {
    if (this.current) this.current.update(dt);
  }

  render(ctx, viewport, alpha) {
    if (this.current) this.current.render(ctx, viewport, alpha);
  }

  resize(viewport) {
    if (this.current) this.current.resize(viewport);
  }
}
