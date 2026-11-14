import { h } from './dom.js';

/**
 * Selector de una opción entre varias (botones contiguos).
 * @param {{options: Array<{value:string,label:string}>, value:string, label:string, onChange:(v:string)=>void}} cfg
 */
export function SegmentedControl({ options, value, label, onChange }) {
  const buttons = new Map();
  const group = h('div', { class: 'segmented', role: 'group', 'aria-label': label });

  const select = (v) => {
    for (const [optValue, btn] of buttons) {
      btn.setAttribute('aria-pressed', String(optValue === v));
    }
  };

  for (const opt of options) {
    const btn = h(
      'button',
      {
        class: 'seg-btn',
        type: 'button',
        onclick: () => {
          select(opt.value);
          onChange(opt.value);
        },
      },
      opt.label
    );
    buttons.set(opt.value, btn);
    group.append(btn);
  }
  select(value);
  return group;
}
