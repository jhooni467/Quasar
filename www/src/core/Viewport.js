import { VIEW } from '../config/game.config.js';

/**
 * Gestiona el tamaño del canvas y la conversión entre píxeles de pantalla y
 * "unidades lógicas" del juego.
 *
 * Reglas:
 *  - El canvas ocupa toda la ventana (sin barras negras).
 *  - La escala es uniforme: nunca se deforma nada.
 *  - Existe un área segura de 1280×720 unidades, centrada, donde vive todo lo
 *    importante. Descuenta además muescas/barras del sistema (safe-area-inset).
 *  - El fondo puede dibujarse en todo `width × height` (unidades lógicas).
 */
export class Viewport {
  constructor({ canvas, appEl, uiEl, bus, maxDpr }) {
    this.canvas = canvas;
    this.appEl = appEl;
    this.uiEl = uiEl;
    this.bus = bus;
    this.maxDpr = maxDpr;

    /** Píxeles CSS por unidad lógica. */
    this.scale = 1;
    /** Tamaño total del canvas en unidades lógicas. */
    this.width = VIEW.designWidth;
    this.height = VIEW.designHeight;
    /** Área segura en unidades lógicas. */
    this.safe = { x: 0, y: 0, w: VIEW.designWidth, h: VIEW.designHeight };
    /** Píxeles de canvas por unidad lógica (escala × densidad). */
    this.pixelRatio = 1;
    this.dpr = 1;

    this._pending = false;
    this._probe = null;
    this._onResize = this._schedule.bind(this);
  }

  init() {
    this._probe = document.createElement('div');
    this._probe.style.cssText =
      'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top) env(safe-area-inset-right) ' +
      'env(safe-area-inset-bottom) env(safe-area-inset-left);';
    document.body.appendChild(this._probe);

    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', this._onResize);
    this.refresh();
  }

  setMaxDpr(value) {
    this.maxDpr = value;
    this.refresh();
  }

  /** Agrupa varios eventos de resize en un solo recálculo por fotograma. */
  _schedule() {
    if (this._pending) return;
    this._pending = true;
    requestAnimationFrame(() => {
      this._pending = false;
      this.refresh();
    });
  }

  _readInsets() {
    const cs = getComputedStyle(this._probe);
    return {
      top: parseFloat(cs.paddingTop) || 0,
      right: parseFloat(cs.paddingRight) || 0,
      bottom: parseFloat(cs.paddingBottom) || 0,
      left: parseFloat(cs.paddingLeft) || 0,
    };
  }

  refresh() {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    const inset = this._readInsets();
    const availW = Math.max(1, w - inset.left - inset.right);
    const availH = Math.max(1, h - inset.top - inset.bottom);

    const scale = Math.min(availW / VIEW.designWidth, availH / VIEW.designHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);

    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (this.canvas.width !== bw) this.canvas.width = bw;
    if (this.canvas.height !== bh) this.canvas.height = bh;

    this.scale = scale;
    this.dpr = dpr;
    this.pixelRatio = dpr * scale;
    this.width = w / scale;
    this.height = h / scale;

    const safePxX = inset.left + (availW - VIEW.designWidth * scale) / 2;
    const safePxY = inset.top + (availH - VIEW.designHeight * scale) / 2;
    this.safe = {
      x: safePxX / scale,
      y: safePxY / scale,
      w: VIEW.designWidth,
      h: VIEW.designHeight,
    };

    // La capa de interfaz (DOM) usa el mismo área segura y la misma escala.
    this.appEl.style.setProperty('--u', String(scale));
    const s = this.uiEl.style;
    s.left = `${safePxX}px`;
    s.top = `${safePxY}px`;
    s.width = `${VIEW.designWidth * scale}px`;
    s.height = `${VIEW.designHeight * scale}px`;

    this.bus.emit('resize', this);
  }

  /** Deja el contexto en coordenadas lógicas. Llamar al inicio de cada fotograma. */
  applyTransform(ctx) {
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }
}
