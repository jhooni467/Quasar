import { GAME, LOOP } from '../config/game.config.js';
import { QUALITY_PROFILES, DEFAULT_QUALITY } from '../config/quality.config.js';
import { EventBus } from './EventBus.js';
import { Loop } from './Loop.js';
import { Viewport } from './Viewport.js';
import { Input } from './Input.js';
import { SceneManager } from './SceneManager.js';
import { AssetLoader } from './AssetLoader.js';
import { SaveManager } from '../save/SaveManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { UIManager } from '../ui/UIManager.js';
import { CharacterRegistry } from '../characters/CharacterRegistry.js';
import { registerCharacterRenderer } from '../characters/CharacterRendererRegistry.js';
import { placeholderRenderer } from '../characters/renderers/placeholderRenderer.js';
import { CHARACTER_DEFINITIONS } from '../characters/definitions/index.js';
import { RegionRegistry } from '../regions/RegionRegistry.js';
import { REGION_DEFINITIONS } from '../regions/definitions/index.js';
import { SCENES } from '../scenes/index.js';

/**
 * Sistema principal: crea los servicios y los conecta. Las escenas y la UI
 * acceden a ellos a través de `game` (game.save, game.audio, game.scenes…).
 */
export class Game {
  constructor({ canvas, appEl, uiEl }) {
    this.config = GAME;
    this.canvas = canvas;
    this.appEl = appEl;
    this.bus = new EventBus();

    this.save = new SaveManager({ key: `${GAME.id}.save` });
    this.save.load();

    const saved = this.save.data.settings.quality;
    this.qualityId = QUALITY_PROFILES[saved] ? saved : DEFAULT_QUALITY;

    this.ctx = canvas.getContext('2d', { alpha: false });
    this.viewport = new Viewport({ canvas, appEl, uiEl, bus: this.bus, maxDpr: this.quality.maxDpr });
    this.input = new Input({ target: appEl, viewport: this.viewport, bus: this.bus });
    this.audio = new AudioManager({ bus: this.bus });
    this.assets = new AssetLoader({ audio: this.audio });

    this.characters = new CharacterRegistry();
    this.regions = new RegionRegistry();
    this._registerContent();

    this.scenes = new SceneManager(this);
    for (const [name, SceneClass] of Object.entries(SCENES)) this.scenes.register(name, SceneClass);

    this.ui = new UIManager({ root: uiEl, game: this });

    this.loop = new Loop({
      update: (dt) => this.scenes.update(dt),
      render: () => this._render(),
      fixedStep: LOOP.fixedStep,
      maxFrameDelta: LOOP.maxFrameDelta,
      maxSubSteps: LOOP.maxSubSteps,
    });
    this.loop.setTargetFps(this.quality.targetFps);
  }

  get quality() {
    return QUALITY_PROFILES[this.qualityId];
  }

  setQuality(id) {
    if (!QUALITY_PROFILES[id] || id === this.qualityId) return;
    this.qualityId = id;
    this.save.data.settings.quality = id;
    this.save.commit();
    this.loop.setTargetFps(this.quality.targetFps);
    this.viewport.setMaxDpr(this.quality.maxDpr);
    this.bus.emit('quality:changed', this.quality);
  }

  start() {
    document.title = GAME.name;

    const volumes = this.save.data.settings.volumes;
    for (const bus of Object.keys(volumes)) this.audio.setVolume(bus, volumes[bus]);
    this.audio.attachAutoUnlock(this.appEl);

    this.viewport.init();
    this.ui.debug.init();
    this.bus.on('resize', (vp) => this.scenes.resize(vp));
    this.input.attach();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.loop.stop();
        this.audio.suspend();
        this.save.flush();
      } else {
        this.audio.resume();
        this.loop.start();
      }
    });
    window.addEventListener('pagehide', () => this.save.flush());

    this.scenes.switchTo('boot');
    this.loop.start();
  }

  _registerContent() {
    registerCharacterRenderer('placeholder', placeholderRenderer);
    for (const def of CHARACTER_DEFINITIONS) this.characters.register(def);
    for (const def of REGION_DEFINITIONS) this.regions.register(def);
  }

  _render() {
    const ctx = this.ctx;
    this.viewport.applyTransform(ctx);
    this.scenes.render(ctx, this.viewport, 0);
  }
}
