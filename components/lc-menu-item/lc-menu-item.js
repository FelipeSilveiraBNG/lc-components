import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-menu-item.css.js';

/**
 * @summary Item de menu do `lc-dropdown`. Substitui `.lc-menu-item` (ADR 0001).
 * @documentation ./lc-menu-item.md
 * @status experimental
 * @since 0.1
 *
 * @slot - O rótulo.
 *
 * @csspart base - O `<button>` interno.
 *
 * Era a única classe da qual um COMPONENTE dependia: o `lc-dropdown` buscava
 * `.lc-menu-item` para achar o primeiro item e para descobrir qual foi acionado,
 * e o CSS dele estilizava `::slotted(.lc-menu-item)`. Com o componente, o
 * dropdown passa a procurar pela TAG — e um erro de digitação no nome vira uma
 * tag que não sobe, visível, em vez de um item que existe mas não responde.
 *
 * `value` é o que chega em `detail.value` do evento `lc-select`.
 */
export class LcMenuItem extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <button part="base" class="base" type="button" role="menuitem"><slot></slot></button>
  `;

  static properties = {
    /** Identificador que chega em `detail.value` do `lc-select`. */
    value: 'string',
    /**
     * Ênfase do item.
     * @type {'default'|'danger'}
     */
    variant: { type: 'string', default: 'default' },
    /** Desabilita o item. */
    disabled: 'boolean',
  };

  static watch = {
    disabled: 'syncState',
  };

  ready() {
    this.syncState();
  }

  syncState() {
    const base = this.$('.base');
    if (base) base.disabled = Boolean(this.disabled);
  }

  /** O dropdown foca o primeiro item por aqui, sem alcançar o shadow root. */
  focus(options) {
    this.$('.base')?.focus(options);
  }
}

define('lc-menu-item', LcMenuItem);
