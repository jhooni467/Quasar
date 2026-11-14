import { Registry } from '../core/Registry.js';
import { validateRegionDefinition } from './RegionDefinition.js';

/** Registro de regiones del universo QUASAR. */
export class RegionRegistry extends Registry {
  constructor() {
    super('región', validateRegionDefinition);
  }
}
