/**
 * Bucle principal con paso fijo para la lógica y render interpolable.
 *
 * - `update(dt)` se llama a intervalos fijos (determinista: ideal para la
 *   física y la generación procedural futuras).
 * - `render(alpha, dt)` se llama una vez por fotograma dibujado; `alpha`
 *   (0..1) indica cuánto del siguiente paso fijo ha transcurrido.
 * - `setTargetFps()` limita los fotogramas dibujados (perfil de calidad).
 */
export class Loop {
  constructor({ update, render, fixedStep, maxFrameDelta, maxSubSteps }) {
    this._update = update;
    this._render = render;
    this.fixedStep = fixedStep;
    this.maxFrameDelta = maxFrameDelta;
    this.maxSubSteps = maxSubSteps;
    this.targetFps = 60;
    this.fps = 0;
    this.running = false;

    this._raf = 0;
    this._last = 0;
    this._lastRender = 0;
    this._acc = 0;
    this._fpsFrames = 0;
    this._fpsStart = 0;
    this._frame = this._frame.bind(this);
  }

  setTargetFps(fps) {
    this.targetFps = fps;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const now = performance.now();
    this._last = now;
    this._lastRender = now;
    this._fpsStart = now;
    this._fpsFrames = 0;
    this._acc = 0;
    this._raf = requestAnimationFrame(this._frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this._raf);
  }

  _frame(now) {
    if (!this.running) return;
    this._raf = requestAnimationFrame(this._frame);

    // Tope de FPS: si aún no toca, saltamos el fotograma sin consumir tiempo
    // (el tiempo se acumula en el siguiente). 2 ms de tolerancia para pantallas
    // cuyo refresco no es múltiplo exacto del objetivo.
    const minInterval = 1000 / this.targetFps - 2;
    if (now - this._lastRender < minInterval) return;

    let dt = (now - this._last) / 1000;
    this._last = now;
    this._lastRender = now;
    if (dt > this.maxFrameDelta) dt = this.maxFrameDelta;

    this._acc += dt;
    let steps = 0;
    while (this._acc >= this.fixedStep && steps < this.maxSubSteps) {
      this._update(this.fixedStep);
      this._acc -= this.fixedStep;
      steps++;
    }
    if (steps === this.maxSubSteps) this._acc = 0; // dispositivo lento: descartar atraso

    this._render(this._acc / this.fixedStep, dt);

    this._fpsFrames++;
    const elapsed = now - this._fpsStart;
    if (elapsed >= 500) {
      this.fps = (this._fpsFrames * 1000) / elapsed;
      this._fpsFrames = 0;
      this._fpsStart = now;
    }
  }
}
