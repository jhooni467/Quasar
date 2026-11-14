/**
 * Registro genérico de definiciones (personajes, regiones, y lo que venga).
 * Valida cada definición al registrarla para fallar pronto y con mensajes claros.
 */
export class Registry {
  /**
   * @param {string} kind  nombre legible del tipo ("personaje", "región"…)
   * @param {(def: any) => string[]} validate  devuelve la lista de errores
   */
  constructor(kind, validate) {
    this.kind = kind;
    this._validate = validate;
    this._items = new Map();
  }

  register(def) {
    const errors = this._validate(def);
    if (errors.length) {
      const id = def && def.id ? ` "${def.id}"` : '';
      throw new Error(`Definición de ${this.kind}${id} inválida: ${errors.join('; ')}`);
    }
    if (this._items.has(def.id)) {
      throw new Error(`Ya existe un/a ${this.kind} con id "${def.id}"`);
    }
    this._items.set(def.id, def);
    return def;
  }

  has(id) {
    return this._items.has(id);
  }

  get(id) {
    return this._items.get(id) || null;
  }

  list() {
    return Array.from(this._items.values());
  }
}
