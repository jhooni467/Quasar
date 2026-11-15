import { CAMERA } from '../../config/gameplay.config.js';

/**
 * Proyección en perspectiva de la cámara de runner (2.5D). Matemática pura,
 * sin dibujar.
 *
 * Mundo: x lateral (1 = un carril), y altura, z hacia delante (metros).
 * La cámara está detrás y por encima del personaje, mirando hacia delante:
 *
 *      escala(z) = f / profundidad        profundidad = z − z_cámara
 *      pantalla.x = centro + (x − camX) · escala
 *      pantalla.y = horizonte + (altura_cámara − y) · escala
 *
 * Con esto las líneas paralelas de la pista convergen en el horizonte y los
 * objetos crecen al acercarse, igual que en un juego 3D, pero con dibujo 2D.
 *
 * El ajuste se calcula desde el área segura (viewport.safe), así que el
 * personaje queda en el mismo punto relativo en cualquier teléfono o tablet y
 * la pista siempre cabe a lo ancho.
 */
export class Projection {
  constructor() {
    this.centerX = 0;
    this.horizonY = 0;
    this.feetY = 0;
    this.unit = 100; // píxeles por unidad a la altura del personaje
    this.f = 500;
    this.baseCamH = 3;
    this.camH = 3;
    this.camX = 0;
    this.camZ = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  /** Recalcula la geometría de pantalla. @param {{safe:{x:number,y:number,w:number,h:number}}} viewport */
  resize(viewport) {
    const { safe } = viewport;
    this.centerX = safe.x + safe.w / 2;
    this.horizonY = safe.y + safe.h * CAMERA.horizon;
    this.feetY = safe.y + safe.h * CAMERA.feet;
    this.unit = safe.w * CAMERA.laneScale;
    this.f = this.unit * CAMERA.distance;
    this.baseCamH = (this.feetY - this.horizonY) / this.unit;
    this.camH = this.baseCamH;
  }

  /** Coloca la cámara siguiendo al jugador. @param {number} playerZ @param {number} camX @param {number} lift */
  follow(playerZ, camX, lift) {
    this.camZ = playerZ - CAMERA.distance;
    this.camX = camX;
    this.camH = this.baseCamH + lift;
  }

  /** Profundidad (m) de una z del mundo. */
  depth(z) {
    return z - this.camZ;
  }

  /** Escala (px por unidad) a cierta profundidad. */
  scaleAt(depth) {
    return this.f / depth;
  }

  /** Y de pantalla del suelo (y = 0) a cierta profundidad. */
  groundY(depth) {
    return this.horizonY + this.camH * (this.f / depth) + this.shakeY;
  }

  /**
   * Proyecta un punto del mundo. Escribe en `out` {x, y, s, depth} y devuelve
   * false si el punto queda detrás de la cámara.
   */
  project(wx, wy, wz, out) {
    const depth = wz - this.camZ;
    if (depth < 0.5) return false;
    const s = this.f / depth;
    out.x = this.centerX + (wx - this.camX) * s + this.shakeX;
    out.y = this.horizonY + (this.camH - wy) * s + this.shakeY;
    out.s = s;
    out.depth = depth;
    return true;
  }
}
