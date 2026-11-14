/**
 * Clase base de las escenas. Cada escena es independiente: recibe el `game`
 * (acceso a los servicios) y solo implementa los ganchos que necesite.
 */
export class Scene {
  constructor(game) {
    this.game = game;
  }

  /** Se llama al activar la escena. `params` viene de `scenes.switchTo()`. */
  enter(params) {}

  /** Se llama al abandonar la escena: liberar suscripciones y elementos de UI. */
  exit() {}

  /** Lógica con paso fijo (`dt` en segundos). */
  update(dt) {}

  /** Dibujo. El contexto ya está en coordenadas lógicas (ver Viewport). */
  render(ctx, viewport, alpha) {}

  /** Se llama tras `enter()` y cada vez que cambia el tamaño de la pantalla. */
  resize(viewport) {}
}
