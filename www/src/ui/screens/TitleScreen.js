import { h } from '../components/dom.js';
import { SegmentedControl } from '../components/SegmentedControl.js';
import { QUALITY_ORDER, QUALITY_PROFILES } from '../../config/quality.config.js';

/**
 * Pantalla de título: identidad del proyecto, botón de jugar y los ajustes
 * técnicos disponibles (calidad gráfica y diagnóstico).
 */
export class TitleScreen {
  constructor(game, ui) {
    this.game = game;
    this.ui = ui;
  }

  mount(container) {
    const { config } = this.game;
    const debugOn = this.ui.debug.enabled;

    const quality = SegmentedControl({
      label: 'Calidad gráfica',
      value: this.game.qualityId,
      options: QUALITY_ORDER.map((id) => ({ value: id, label: QUALITY_PROFILES[id].label })),
      onChange: (id) => this.game.setQuality(id),
    });

    this.debugBtn = h(
      'button',
      {
        class: 'seg-btn solo',
        type: 'button',
        'aria-pressed': String(debugOn),
        onclick: () => {
          const next = !this.ui.debug.enabled;
          this.ui.debug.setEnabled(next);
          this.debugBtn.setAttribute('aria-pressed', String(next));
          this.game.save.data.settings.debug = next;
          this.game.save.commit();
        },
      },
      'Diagnóstico'
    );

    this.root = h(
      'div',
      { class: 'title-screen' },
      h(
        'header',
        { class: 'title-block' },
        h('p', { class: 'eyebrow' }, config.tagline),
        h('h1', { class: 'logo' }, config.name),
        h('p', { class: 'subtitle' }, config.stage),
        h('p', { class: 'note' }, 'Desliza para moverte, saltar y deslizarte')
      ),
      h(
        'footer',
        { class: 'bottom-bar' },
        h('button', { class: 'btn btn-primary btn-play', type: 'button', onclick: () => this.game.scenes.switchTo('game') }, 'Jugar'),
        h(
          'div',
          { class: 'controls' },
          h('div', { class: 'control-row' }, h('span', { class: 'control-label' }, 'Calidad'), quality),
          this.debugBtn
        ),
        h('div', { class: 'chips' }, h('span', { class: 'chip' }, `v${config.version}`), h('span', { class: 'chip' }, 'Web · Canvas 2D'))
      )
    );
    container.append(this.root);
  }

  unmount() {
    if (this.root) this.root.remove();
  }
}
