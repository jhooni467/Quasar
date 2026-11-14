/**
 * Sistema de audio sobre Web Audio API.
 *
 * Estructura de buses:   fuente → bus (music | sfx) → master → salida
 *
 * Etapa 00: aún no hay sonidos ni música. Esta capa solo aporta lo que no se
 * puede improvisar después: desbloqueo del audio tras el primer gesto del
 * usuario (obligatorio en navegadores y WebView), volúmenes por bus y
 * registro/reproducción de buffers. La música y los efectos ambientales se
 * construirán encima en etapas futuras.
 */
export class AudioManager {
  constructor({ bus }) {
    this.bus = bus;
    this.ctx = null;
    this.buses = null;
    this._volumes = { master: 1, music: 1, sfx: 1 };
    this._buffers = new Map();
  }

  _ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    const master = this.ctx.createGain();
    const music = this.ctx.createGain();
    const sfx = this.ctx.createGain();
    music.connect(master);
    sfx.connect(master);
    master.connect(this.ctx.destination);
    this.buses = { master, music, sfx };
    for (const name of Object.keys(this._volumes)) this._applyVolume(name);
    return this.ctx;
  }

  /** Registra el desbloqueo automático en el primer gesto del usuario. */
  attachAutoUnlock(target) {
    const unlock = () => {
      this.unlock();
      target.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    target.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  unlock() {
    const ctx = this._ensureContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(busName, value) {
    if (!(busName in this._volumes)) return;
    this._volumes[busName] = Math.min(1, Math.max(0, value));
    this._applyVolume(busName);
  }

  getVolume(busName) {
    return this._volumes[busName];
  }

  _applyVolume(busName) {
    if (this.buses) this.buses[busName].gain.value = this._volumes[busName];
  }

  decode(arrayBuffer) {
    const ctx = this._ensureContext();
    if (!ctx) return Promise.reject(new Error('Web Audio no disponible'));
    return ctx.decodeAudioData(arrayBuffer);
  }

  register(id, buffer) {
    this._buffers.set(id, buffer);
  }

  /** Reproduce un efecto ya registrado. Devuelve la fuente, o null si no se pudo. */
  playSfx(id, { volume = 1, rate = 1 } = {}) {
    const buffer = this._buffers.get(id);
    if (!buffer || !this.ctx || this.ctx.state !== 'running') return null;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(this.buses.sfx);
    src.start();
    return src;
  }
}
