import { Registry } from '../../core/Registry.js';
import { validateSegmentDefinition } from './SegmentDefinition.js';

/** Registro de segmentos diseñados a mano. */
export class SegmentRegistry extends Registry {
  constructor() {
    super('segmento', validateSegmentDefinition);
  }
}
