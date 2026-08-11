/*
 * LcFormElement — base dos controles de formulário.
 *
 * Equivale ao `WebAwesomeFormAssociatedElement`. As convenções vêm do
 * contributing.md do Web Awesome (§3.7 do nosso doc 09):
 *
 *   - `name`, `value` e `disabled` se comportam como em HTMLInputElement
 *   - `disabled` NÃO reflete atributo... exceto que aqui reflete: sem
 *     decorators, a reflexão é o mecanismo de leitura, e um `disabled` não
 *     refletido exigiria estado paralelo. Divergência anotada.
 *   - controle com valor editável tem `value` (sem atributo) + `defaultValue`
 *     (com atributo, refletido) — igual ao nativo, e é o que faz reset funcionar
 *   - o controle entra no FormData de um <form> nativo, sem JS de cola
 */

import { LcElement } from './lc-element.js';

export class LcFormElement extends LcElement {
  static formAssociated = true;

  static properties = {
    name: 'string',
    disabled: 'boolean',
    required: 'boolean',
  };

  /** O <form> ao qual o controle pertence, ou null. */
  get form() {
    return this.internals.form;
  }

  get validity() {
    return this.internals.validity;
  }

  get validationMessage() {
    return this.internals.validationMessage;
  }

  get willValidate() {
    return this.internals.willValidate;
  }

  checkValidity() {
    return this.internals.checkValidity();
  }

  reportValidity() {
    return this.internals.reportValidity();
  }

  /**
   * Publica o valor atual no formulário. Subclasse chama sempre que o valor
   * muda. Passar `null` remove o controle do FormData (é o que o nativo faz com
   * checkbox desmarcado).
   */
  setFormValue(value) {
    this.internals.setFormValue(value);
  }

  /**
   * Marca o controle como inválido com mensagem, ou válido se `message` vazio.
   * `anchor` é o elemento interno onde o navegador ancora o balão de validação.
   */
  setValidity(flags, message, anchor) {
    this.internals.setValidity(flags, message, anchor ?? this.$('[part]') ?? undefined);
  }

  /** Chamado pelo navegador em form.reset(). */
  formResetCallback() {
    this.reset?.();
  }

  /** Chamado quando um <fieldset> ancestral é desabilitado. */
  formDisabledCallback(disabled) {
    this.toggleAttribute('disabled', disabled);
  }
}
