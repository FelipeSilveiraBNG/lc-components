import { define } from '../define.js';
import { LcCampo } from '../lc-campo.js';
import styles from '../lc-campo.css.js';

/**
 * @summary Campo de texto de várias linhas. Substitui `.lc-textarea` (ADR 0001).
 * @documentation ./lc-textarea.md
 * @status experimental
 * @since 0.1
 *
 * @slot label - Rótulo com HTML.
 * @slot hint - Texto de apoio com HTML.
 *
 * @event lc-input - A cada tecla.
 * @event lc-change - Valor comitado.
 * @event lc-invalid - Verificado e inválido.
 *
 * @csspart base - O contêiner.
 * @csspart label - O rótulo.
 * @csspart control - O `<textarea>` interno.
 * @csspart hint - O texto de apoio.
 * @csspart error - A mensagem de erro.
 *
 * Redimensiona só na vertical, como na camada de classes: horizontal quebraria a
 * grade do formulário.
 */
export class LcTextarea extends LcCampo {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base">
      <label part="label" class="rotulo"><span class="rotulo-texto"></span><slot name="label"></slot></label>
      <textarea part="control" class="control textarea"></textarea>
      <span part="hint" class="dica"><span class="dica-texto"></span><slot name="hint"></slot></span>
      <span part="error" class="erro"></span>
    </div>
  `;

  static properties = {
    ...LcCampo.properties,
    /** Altura em linhas. */
    rows: 'string',
    /** Tamanho mínimo em caracteres. */
    minlength: 'string',
    /** Tamanho máximo em caracteres. */
    maxlength: 'string',
    /** Impede edição sem tirar o valor do FormData. */
    readonly: 'boolean',
  };

  static watch = {
    ...LcCampo.watch,
    rows: 'syncChrome',
    minlength: 'syncChrome',
    maxlength: 'syncChrome',
    readonly: 'syncChrome',
  };

  syncChrome() {
    const c = this.control;
    if (!c) return;

    for (const [attr, valor] of [
      ['rows', this.rows],
      ['minlength', this.minlength],
      ['maxlength', this.maxlength],
    ]) {
      if (valor == null || valor === '') c.removeAttribute(attr);
      else c.setAttribute(attr, valor);
    }
    c.readOnly = Boolean(this.readonly);

    super.syncChrome();
  }
}

define('lc-textarea', LcTextarea);
