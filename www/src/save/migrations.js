/**
 * Migraciones del guardado. La clave es la versión de origen; la función
 * recibe los datos de esa versión y devuelve los de la siguiente
 * (incluido `version`). Ejemplo para cuando exista la v2:
 *
 *   1: (data) => ({ ...data, version: 2, progress: { ...data.progress, quests: {} } }),
 */
export const MIGRATIONS = {};
