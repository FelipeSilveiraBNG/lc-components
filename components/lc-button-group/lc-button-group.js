import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-button-group.css.js';

/**
 * @summary Botões emendados num controle segmentado. Substitui `.lc-btn-group` (ADR 0001).
 * @documentation ./lc-button-group.md
 * @status experimental
 * @since 0.1
 *
 * @slot - Os botões.
 *
 * @csspart base - O contêiner.
 *
 * Achata o raio das junções e sobrepõe as bordas adjacentes. Faz isso zerando as
 * custom properties `--raio-inicio` e `--raio-fim` nos filhos slotados — custom
 * property atravessa o shadow boundary, seletor não. Ver o comentário em
 * lc-button-group.css.js.
 *
 * O grupo NÃO gerencia seleção: não há estado "botão ativo". Se o protótipo
 * precisa de um segmentado com seleção, isso é comportamento, e comportamento
 * pede componente próprio — não um atributo aqui.
 *
 * `role="group"` com o rótulo vindo de `label`, para o leitor de tela anunciar o
 * conjunto em vez de três botões soltos.
 */
export class LcButtonGroup extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base" role="group"><slot></slot></div>
  `;

  static properties = {
    /** Rótulo acessível do conjunto. */
    label: 'string',
  };

  static watch = {
    label: 'applyA11y',
  };

  ready() {
    this.applyA11y();
  }

  applyA11y() {
    const base = this.$('.base');
    if (!base) return;
    if (this.label) base.setAttribute('aria-label', this.label);
    else base.removeAttribute('aria-label');
  }
}

define('lc-button-group', LcButtonGroup);
