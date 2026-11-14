import { Registry } from '../core/Registry.js';
import { validateCharacterDefinition } from './CharacterDefinition.js';

/** Registro de personajes jugables (y desbloqueables en el futuro). */
export class CharacterRegistry extends Registry {
  constructor() {
    super('personaje', validateCharacterDefinition);
  }
}
