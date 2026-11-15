import { Scene } from '../core/Scene.js';
import { Character } from '../characters/Character.js';
import { Run } from '../gameplay/Run.js';
import { SegmentRegistry } from '../gameplay/segments/SegmentRegistry.js';
import { SEGMENT_DEFINITIONS } from '../gameplay/segments/definitions/index.js';
import { HandmadeSegmentSource } from '../gameplay/segments/SegmentSource.js';
import { RunnerRenderer } from '../graphics/runner/RunnerRenderer.js';
import { mulberry32 } from '../graphics/random.js';

/** Región jugable de la Etapa 01 (ver regions/definitions/duskMeadow.js). */
const PLAY_REGION = 'dusk-meadow';
/** Metros de pista que se generan por delante además de los que se dibujan. */
const SPAWN_MARGIN = 14;

let segmentRegistry = null;
/** Registro de segmentos: se crea (y valida) una sola vez. */
function getSegments() {
  if (!segmentRegistry) {
    segmentRegistry = new SegmentRegistry();
    for (const def of SEGMENT_DEFINITIONS) segmentRegistry.register(def);
  }
  return segmentRegistry;
}

/**
 * Escena de la partida. Es solo el "pegamento": traduce gestos en acciones,
 * hace avanzar la lógica (`Run`), pide el dibujo (`RunnerRenderer`) y mantiene
 * el HUD y las pantallas de pausa / fin de partida. Las reglas viven en
 * gameplay/ y el dibujo en graphics/runner/.
 */
export class GameScene extends Scene {
  enter() {
    const g = this.game;
    const region = g.regions.get(PLAY_REGION);
    if (!region || !region.run) throw new Error(`La región "${PLAY_REGION}" no es jugable`);

    const selected = g.save.data.profile.selectedCharacter;
    const definition = g.characters.get(selected) || g.characters.list()[0];
    this.character = new Character(definition);
    this.character.play('run');

    const seed = (Math.random() * 0xffffffff) >>> 0;
    this.run = new Run({ source: new HandmadeSegmentSource({ registry: getSegments(), rnd: mulberry32(seed) }) });
    this.renderer = new RunnerRenderer({ region, quality: g.quality, character: this.character });

    this.paused = false;
    this._overShown = false;
    this._firstSwipe = false;

    this.run.onEvent = (name, data) => {
      this.renderer.onRunEvent(name, data, this.run);
      if (name === 'over') this._showGameOver();
    };
    this.run.track.update(0, this._ahead());

    this._offSwipe = g.bus.on('gesture:swipe', (dir) => this._onSwipe(dir));
    this._offHidden = g.bus.on('app:hidden', () => this.pause());
    this._offKey = g.bus.on('input:keydown', (code, e) => {
      if ((code === 'Escape' || code === 'KeyP') && !e.repeat) this.paused ? this.resume() : this.pause();
    });
    this._offQuality = g.bus.on('quality:changed', () => this.renderer.setQuality(g.quality));

    g.gestures.setEnabled(true);
    this._showHud();
  }

  exit() {
    this._offSwipe();
    this._offHidden();
    this._offKey();
    this._offQuality();
    this.game.gestures.setEnabled(false);
    this.game.ui.hide();
  }

  update(dt) {
    if (this.paused) return;
    this.run.update(dt, this._ahead());
    this.renderer.update(dt, this.run);
    if (this.hud) this.hud.setValues(this.run);
  }

  resize(viewport) {
    this.renderer.resize(viewport);
  }

  render(ctx, viewport) {
    this.renderer.render(ctx, viewport, this.run);
  }

  /** Datos para el panel de diagnóstico. */
  debugInfo() {
    const r = this.run;
    return `Carrera  ${r.speed.toFixed(1)} m/s · ${r.track.items.length} elem. · ${r.state}${this.paused ? ' (pausa)' : ''}`;
  }

  _ahead() {
    return this.game.quality.drawDistance + SPAWN_MARGIN;
  }

  _onSwipe(dir) {
    if (this.paused || this.run.state !== 'running') return;
    if (!this._firstSwipe) {
      this._firstSwipe = true;
      if (this.hud) this.hud.hideHint();
    }
    this.run.swipe(dir);
  }

  _showHud() {
    this.game.ui.show('hud');
    this.hud = this.game.ui.current;
    this.hud.setValues(this.run);
    if (this._firstSwipe) this.hud.hideHint();
  }

  pause() {
    if (this.paused || this.run.state !== 'running') return;
    this.paused = true;
    this.hud = null;
    this.game.ui.show('pause', {
      summary: this.run,
      onResume: () => this.resume(),
      onHome: () => this.game.scenes.switchTo('title'),
    });
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this._showHud();
  }

  _showGameOver() {
    if (this._overShown) return;
    this._overShown = true;
    this.hud = null;
    const { score, distance, coins } = this.run;
    this.game.ui.show('gameover', {
      summary: { score, distance, coins },
      onRetry: () => this.game.scenes.switchTo('game'),
      onHome: () => this.game.scenes.switchTo('title'),
    });
  }
}
