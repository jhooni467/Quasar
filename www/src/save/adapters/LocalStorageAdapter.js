/**
 * Almacenamiento por defecto (navegador y WebView de Capacitor).
 * Si localStorage no está disponible (modo privado, permisos), cae a memoria
 * para que el juego siga funcionando sin guardar.
 *
 * Interfaz del adaptador: getItem(key) / setItem(key, value) / removeItem(key).
 * En el futuro se puede sustituir por uno basado en Capacitor Preferences.
 */
export class LocalStorageAdapter {
  constructor() {
    this._memory = new Map();
    this._usable = this._probe();
  }

  _probe() {
    try {
      const k = '__quasar_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  getItem(key) {
    if (!this._usable) return this._memory.has(key) ? this._memory.get(key) : null;
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  setItem(key, value) {
    if (!this._usable) {
      this._memory.set(key, value);
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      this._memory.set(key, value);
    }
  }

  removeItem(key) {
    this._memory.delete(key);
    if (!this._usable) return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      /* sin acción */
    }
  }
}
