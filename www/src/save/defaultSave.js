import { DEFAULT_QUALITY } from '../config/quality.config.js';

/** Versión del esquema de guardado. Súbela al cambiar la estructura y añade una migración. */
export const SAVE_VERSION = 1;

export function createDefaultSave() {
  return {
    version: SAVE_VERSION,
    settings: {
      quality: DEFAULT_QUALITY,
      debug: false,
      volumes: { master: 1, music: 0.8, sfx: 1 },
    },
    profile: {
      selectedCharacter: 'placeholder',
    },
    // Reservado para etapas futuras (misiones, coleccionables, desbloqueos…).
    progress: {},
  };
}
