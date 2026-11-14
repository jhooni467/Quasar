import { createDefaultSave, SAVE_VERSION } from './defaultSave.js';
import { MIGRATIONS } from './migrations.js';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter.js';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Copia en `base` los valores de `src` que existen y tienen el mismo tipo. */
function mergeInto(base, src) {
  if (!isObject(src)) return base;
  for (const key of Object.keys(src)) {
    if (isObject(base[key]) && isObject(src[key])) {
      mergeInto(base[key], src[key]);
    } else if (!(key in base) || typeof base[key] === typeof src[key]) {
      base[key] = src[key];
    }
  }
  return base;
}

/**
 * Guardado local versionado y tolerante a datos corruptos.
 * Uso: modificar `save.data` y llamar a `save.commit()` (se escribe con un
 * pequeño retardo para agrupar cambios; `flush()` fuerza la escritura).
 */
export class SaveManager {
  constructor({ key, adapter = new LocalStorageAdapter() }) {
    this.key = key;
    this.adapter = adapter;
    this.data = createDefaultSave();
    this._timer = 0;
  }

  load() {
    const fresh = createDefaultSave();
    try {
      const raw = this.adapter.getItem(this.key);
      if (raw) {
        let parsed = JSON.parse(raw);
        parsed = this._migrate(parsed);
        if (parsed) {
          this.data = mergeInto(fresh, parsed);
          this.data.version = SAVE_VERSION;
          return this.data;
        }
      }
    } catch (e) {
      console.warn('[save] Datos ilegibles; se usan valores por defecto.', e);
    }
    this.data = fresh;
    return this.data;
  }

  _migrate(data) {
    if (!isObject(data) || typeof data.version !== 'number') return null;
    let current = data;
    while (current.version < SAVE_VERSION) {
      const step = MIGRATIONS[current.version];
      if (!step) return null; // no hay camino de migración: empezar de cero
      current = step(current);
    }
    return current.version === SAVE_VERSION ? current : null;
  }

  /** Programa la escritura de `data` (agrupa cambios seguidos). */
  commit() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.flush(), 250);
  }

  flush() {
    clearTimeout(this._timer);
    try {
      this.adapter.setItem(this.key, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[save] No se pudo guardar.', e);
    }
  }

  reset() {
    this.data = createDefaultSave();
    this.adapter.removeItem(this.key);
  }
}
