/**
 * Carga de recursos a partir de un manifiesto (ver assets/manifest.js).
 * Soporta imágenes, JSON y audio. Las rutas son relativas a index.html.
 */
export class AssetLoader {
  constructor({ audio }) {
    this.audio = audio;
    this.images = new Map();
    this.json = new Map();
  }

  /**
   * @param {{images?: Record<string,string>, json?: Record<string,string>, audio?: Record<string,string>}} manifest
   * @param {(progress: number) => void} [onProgress]  valor 0..1
   */
  async load(manifest, onProgress = () => {}) {
    const { images = {}, json = {}, audio = {} } = manifest;
    const jobs = [];
    for (const [key, url] of Object.entries(images)) jobs.push(() => this._loadImage(key, url));
    for (const [key, url] of Object.entries(json)) jobs.push(() => this._loadJson(key, url));
    for (const [key, url] of Object.entries(audio)) jobs.push(() => this._loadAudio(key, url));

    if (jobs.length === 0) {
      onProgress(1);
      return;
    }
    let done = 0;
    await Promise.all(
      jobs.map(async (job) => {
        await job();
        done++;
        onProgress(done / jobs.length);
      })
    );
  }

  getImage(key) {
    return this.images.get(key) || null;
  }

  getJson(key) {
    return this.json.get(key) || null;
  }

  _loadImage(key, url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };
      img.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${url}`));
      img.src = url;
    });
  }

  async _loadJson(key, url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar el JSON: ${url} (${res.status})`);
    this.json.set(key, await res.json());
  }

  async _loadAudio(key, url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar el audio: ${url} (${res.status})`);
    const buffer = await this.audio.decode(await res.arrayBuffer());
    this.audio.register(key, buffer);
  }
}
