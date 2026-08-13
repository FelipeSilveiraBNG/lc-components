import { define } from '../define.js';
import { LcCampo } from '../lc-campo.js';
import styles from '../lc-campo.css.js';

/**
 * @summary Seleção de uma opção. Substitui `.lc-select` (ADR 0001).
 * @documentation ./lc-select.md
 * @status experimental
 * @since 0.1
 *
 * @slot label - Rótulo com HTML.
 * @slot hint - Texto de apoio com HTML.
 *
 * @event lc-change - Opção escolhida.
 * @event lc-invalid - Verificado e inválido.
 *
 * @csspart base - O contêiner.
 * @csspart label - O rótulo.
 * @csspart control - O `<select>` interno.
 * @csspart hint - O texto de apoio.
 * @csspart error - A mensagem de erro.
 *
 * As opções continuam sendo `<option>` escritos como filhos:
 *
 *   <lc-select label="Unidade">
 *     <option>Hospital Central</option>
 *     <option>Unidade Norte</option>
 *   </lc-select>
 *
 * ── Por que as opções são COPIADAS e não slotadas ────────────────────────────
 * `<select>` só aceita `<option>` e `<optgroup>` como filhos: um `<slot>` lá
 * dentro não é conteúdo válido e o navegador o descarta. Então o componente lê os
 * `<option>` do light DOM e os clona para dentro do `<select>` do shadow root.
 *
 * Os originais não aparecem duas vezes porque não há slot para eles — filho de
 * light DOM sem slot correspondente simplesmente não é renderizado.
 *
 * Um MutationObserver mantém a cópia em dia, para protótipo que popula a lista
 * por script continuar funcionando.
 *
 * A alternativa seria escrever um listbox próprio, como o `wa-select` faz. Custa
 * muito mais e perde o seletor nativo do celular, que num protótipo de
 * escala/plantão é justamente o que se quer mostrar.
 */
export class LcSelect extends LcCampo {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base">
      <label part="label" class="rotulo"><span class="rotulo-texto"></span><slot name="label"></slot></label>
      <select part="control" class="control"></select>
      <span part="hint" class="dica"><span class="dica-texto"></span><slot name="hint"></slot></span>
      <span part="error" class="erro"></span>
    </div>
  `;

  #observador;

  ready() {
    this.copiarOpcoes();
    /* `super.ready()` depois da cópia: ele aplica o `defaultValue`, e aplicar
       valor num `<select>` vazio não seleciona nada. */
    super.ready();

    this.#observador = new MutationObserver(() => {
      const antes = this.control?.value;
      this.copiarOpcoes();
      /* Preserva a escolha do usuário quando a lista muda por baixo. */
      if (antes && this.control) this.control.value = antes;
      this.syncValue();
    });
    this.#observador.observe(this, { childList: true, subtree: true, characterData: true });
  }

  disconnectedCallback() {
    this.#observador?.disconnect();
    super.disconnectedCallback?.();
  }

  /**
   * `form.reset()` num `<select>` não é "esvaziar": é voltar para a opção que tem
   * `selected`, ou para a primeira. Atribuir '' limparia a seleção, que é
   * justamente o que o nativo NÃO faz. Recopiar as opções restaura o estado
   * declarado no HTML de graça.
   */
  reset() {
    this.copiarOpcoes();
    if (this.defaultValue) this.control.value = this.defaultValue;
    this.resetValidity();
  }

  copiarOpcoes() {
    const c = this.control;
    if (!c) return;
    c.textContent = '';
    for (const o of this.querySelectorAll('option, optgroup')) {
      /* Só o nível de cima: `optgroup` traz os próprios `option` no clone. */
      if (o.parentElement !== this) continue;
      c.append(o.cloneNode(true));
    }
  }
}

define('lc-select', LcSelect);
