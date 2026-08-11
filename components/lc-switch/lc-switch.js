import { define } from '../define.js';
import { LC_CHANGE } from '../events.js';
import { LcFormElement } from '../lc-form-element.js';
import styles from './lc-switch.css.js';

/**
 * @summary Interruptor liga/desliga. Entra no FormData de um `<form>` nativo.
 * @documentation ./lc-switch.md
 * @status experimental
 * @since 0.1
 *
 * @slot - O rótulo do interruptor.
 *
 * @event lc-change - Disparado quando o estado muda por interação do usuário.
 *
 * @csspart base - O contêiner.
 * @csspart control - O trilho (é um <button role="switch">).
 * @csspart thumb - O círculo que desliza.
 * @csspart label - O contêiner do rótulo.
 *
 * @cssstate invalid - Presente quando o controle está inválido.
 *
 * Existe como custom element, e não como classe CSS, porque tem
 * COMPORTAMENTO: estado, teclado, associação a formulário e validação. É o
 * critério do doc 07 §4.2 — botão e input não têm, então são `.lc-btn`/`.lc-input`.
 */
export class LcSwitch extends LcFormElement {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base">
      <button part="control" class="control" type="button" role="switch" aria-checked="false">
        <span part="thumb" class="thumb"></span>
      </button>
      <span part="label" class="label" id="label"><slot></slot></span>
    </div>
  `;

  static properties = {
    ...LcFormElement.properties,
    /** Estado atual. O valor inicial do atributo também é o valor de reset. */
    checked: 'boolean',
    /** Valor enviado ao formulário quando ligado. */
    value: { type: 'string', default: 'on' },
  };

  static watch = {
    checked: 'syncState',
    disabled: 'syncState',
    required: 'syncState',
  };

  #defaultChecked = false;

  ready() {
    // O atributo declarado no HTML é o default de reset — mesma semântica do
    // `checked` de um <input> nativo.
    this.#defaultChecked = this.checked;

    const control = this.$('.control');
    control.setAttribute('aria-labelledby', 'label');
    control.addEventListener('click', () => this.#toggle());

    // Clicar no rótulo também alterna, como num <label> nativo.
    this.$('.label').addEventListener('click', () => this.#toggle());

    this.syncState();
  }

  #toggle() {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.emit(LC_CHANGE, { detail: { checked: this.checked, value: this.value } });
  }

  /** Reflete estado no ARIA, no formulário e na validade. */
  syncState() {
    const control = this.$('.control');
    if (!control) return;

    control.setAttribute('aria-checked', String(this.checked));
    control.disabled = this.disabled;

    // Checkbox desmarcado não entra no FormData — é o comportamento nativo.
    this.setFormValue(this.checked ? this.value : null);

    const missing = this.required && !this.checked;
    this.setValidity(
      { valueMissing: missing },
      missing ? 'Este campo é obrigatório.' : '',
      control,
    );
    this.setState('invalid', missing);
  }

  /** Chamado pelo `formResetCallback` da base em `form.reset()`. */
  reset() {
    this.checked = this.#defaultChecked;
    this.syncState();
  }
}

define('lc-switch', LcSwitch);
