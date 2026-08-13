import { define } from '../define.js';
import { LcCampo } from '../lc-campo.js';
import styles from '../lc-campo.css.js';

/**
 * @summary Campo de texto de uma linha. Substitui `.lc-input` + `.lc-field` (ADR 0001).
 * @documentation ./lc-input.md
 * @status experimental
 * @since 0.1
 *
 * @slot label - Rótulo com HTML. Alternativa ao atributo `label`.
 * @slot hint - Texto de apoio com HTML. Alternativa ao atributo `hint`.
 *
 * @event lc-input - A cada tecla.
 * @event lc-change - Valor comitado.
 * @event lc-invalid - Verificado e inválido.
 *
 * @csspart base - O contêiner.
 * @csspart label - O rótulo.
 * @csspart control - O `<input>` interno.
 * @csspart hint - O texto de apoio.
 * @csspart error - A mensagem de erro.
 *
 * O rótulo é do PRÓPRIO campo: um nó em vez dos três de antes
 * (`.lc-field` + `.lc-label` + `.lc-error`), e o `for`/`id` não depende de quem
 * escreve. Erro vem da constraint validation nativa — não existe atributo
 * `error`. Ver a decisão B do ADR 0001 e o cabeçalho de lc-campo.js.
 */
export class LcInput extends LcCampo {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base">
      <label part="label" class="rotulo"><span class="rotulo-texto"></span><slot name="label"></slot></label>
      <input part="control" class="control" />
      <span part="hint" class="dica"><span class="dica-texto"></span><slot name="hint"></slot></span>
      <span part="error" class="erro"></span>
    </div>
  `;

  static properties = {
    ...LcCampo.properties,
    /**
     * Tipo do `<input>`. É o que liga a validação nativa de e-mail, número e data.
     * @type {'text'|'email'|'tel'|'number'|'password'|'date'|'time'|'url'|'search'}
     */
    type: { type: 'string', default: 'text' },
    /** Expressão que o valor precisa satisfazer. */
    pattern: 'string',
    /** Tamanho mínimo em caracteres. */
    minlength: 'string',
    /** Tamanho máximo em caracteres. */
    maxlength: 'string',
    /** Valor mínimo, para `type="number"` e datas. */
    min: 'string',
    /** Valor máximo, mesma condição. */
    max: 'string',
    /** Impede edição sem tirar o valor do FormData. */
    readonly: 'boolean',
    /** Dica de preenchimento automático do navegador. */
    autocomplete: 'string',
  };

  static watch = {
    ...LcCampo.watch,
    type: 'syncChrome',
    pattern: 'syncChrome',
    minlength: 'syncChrome',
    maxlength: 'syncChrome',
    min: 'syncChrome',
    max: 'syncChrome',
    readonly: 'syncChrome',
    autocomplete: 'syncChrome',
  };

  syncChrome() {
    const c = this.control;
    if (!c) return;

    /* Espelhados um a um, e não por um laço genérico, porque cada um precisa
       SAIR do input quando o atributo é removido — senão um `pattern` apagado
       continuaria valendo e o campo ficaria inválido sem motivo visível. */
    c.type = this.type || 'text';
    for (const [prop, valor] of [
      ['pattern', this.pattern],
      ['minLength', this.minlength],
      ['maxLength', this.maxlength],
      ['min', this.min],
      ['max', this.max],
      ['autocomplete', this.autocomplete],
    ]) {
      if (valor == null || valor === '') c.removeAttribute(prop.toLowerCase());
      else c.setAttribute(prop.toLowerCase(), valor);
    }
    c.readOnly = Boolean(this.readonly);

    super.syncChrome();
  }
}

define('lc-input', LcInput);
