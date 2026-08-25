import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-button.css.js';

/**
 * @summary Botão. Substitui a classe `.lc-btn` (ADR 0001).
 * @documentation ./lc-button.md
 * @status experimental
 * @since 0.1
 *
 * @slot - O rótulo.
 *
 * @csspart base - O `<button>` interno.
 *
 * ── ATENÇÃO ao `type` ────────────────────────────────────────────────────────
 * O padrão é `button`, **o oposto do `<button>` nativo**, que é `submit`. É a
 * escolha do Web Awesome, e a doc dele explica: componentes não são substitutos
 * um-para-um dos elementos HTML.
 *
 * Consequência prática, e é uma armadilha de verdade: `<lc-button>` dentro de um
 * `<form>` **não submete** a menos que você escreva `type="submit"`. Um
 * `<button class="lc-btn">` que hoje submete por omissão, convertido sem
 * `type`, para de submeter em silêncio — sem erro e sem console.
 *
 * ── Como o submit funciona ───────────────────────────────────────────────────
 * Custom element não herda comportamento de submit, e um `<button>` dentro do
 * shadow root NÃO submete o `<form>` que está fora. Então o componente cria um
 * `<button>` de verdade em light DOM, dentro do form, clica nele e o remove.
 *
 * É a técnica do Web Awesome (`button.ts`), e a razão de não usar
 * `form.requestSubmit()` é o *submitter*: o navegador registra o botão clicado
 * como submitter, e é isso que leva o par `name`/`value` para o `FormData`.
 * `requestSubmit()` sem argumento não daria isso.
 */
export class LcButton extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <button part="base" class="base" type="button"><slot></slot></button>
  `;

  static properties = {
    /**
     * Cor de ênfase.
     * @type {'neutral'|'brand'|'success'|'warning'|'danger'}
     */
    variant: { type: 'string', default: 'neutral' },
    /**
     * `outlined` é o botão com borda; `plain` é sem tinta nem borda (o antigo `--quiet`).
     * @type {'outlined'|'plain'}
     */
    appearance: { type: 'string', default: 'outlined' },
    /**
     * Densidade.
     * @type {'small'|'medium'|'large'}
     */
    size: { type: 'string', default: 'medium' },
    /**
     * O que o clique faz dentro de um `<form>`. Veja o aviso no topo: o padrão
     * NÃO é `submit`.
     * @type {'button'|'submit'|'reset'}
     */
    type: { type: 'string', default: 'button' },
    /** Nome enviado no `FormData`, mas só quando este botão é o submitter. */
    name: 'string',
    /** Valor enviado junto do `name`, mesma condição. */
    value: 'string',
    /** `id` do `<form>` alvo, quando o botão está fora dele. */
    form: 'string',
    /** Ocupa a largura toda. */
    block: 'boolean',
    /**
     * Canto reto. É o `btn-flat` do painel, usado em toda barra de ferramentas
     * de listagem. Booleano e não valor de `appearance` porque as duas coisas
     * são ortogonais: `appearance` decide tinta e borda, `flat` decide canto —
     * e um botão de barra de ferramentas costuma querer as duas.
     */
    flat: 'boolean',
    /** Desabilita de fato: não recebe foco e não dispara clique. */
    disabled: 'boolean',
  };

  ready() {
    /* O listener é no HOST, não no botão interno: assim ele vê também o clique
       sintético de quem chamar `.click()` no elemento. */
    this.addEventListener('click', (event) => this.#handleClick(event));
  }

  /** Delega o foco ao botão interno — `host.focus()` sozinho não focaria nada. */
  focus(options) {
    this.$('.base')?.focus(options);
  }

  blur() {
    this.$('.base')?.blur();
  }

  #form() {
    if (this.form) return this.getRootNode()?.getElementById?.(this.form) ?? null;
    return this.closest('form');
  }

  #handleClick(event) {
    /* `aria-disabled` continua focável de propósito, então o bloqueio do clique
       tem de ser aqui. `stopImmediatePropagation` impede que um `onclick` escrito
       no protótipo rode num botão que o usuário vê como desabilitado. */
    if (this.disabled || this.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (this.type !== 'submit' && this.type !== 'reset') return;

    const form = this.#form();
    if (!form) return;

    const proxy = document.createElement('button');
    proxy.type = this.type;
    if (this.name) proxy.name = this.name;
    if (this.value) proxy.value = this.value;
    /* Fora da tela e fora da ordem de tabulação: existe por um tick só, mas um
       botão visível piscando seria pior que o problema que ele resolve. */
    proxy.tabIndex = -1;
    proxy.setAttribute('aria-hidden', 'true');
    proxy.style.cssText = 'position:absolute;width:0;height:0;padding:0;border:0;clip-path:inset(50%)';

    /* ── Onde inserir o auxiliar, e por que a posição importa ──────────────────
       A ordem das chaves do `FormData` é a ordem dos controles no DOM. Anexar o
       auxiliar no FIM do form faz o par do submitter sair na última posição, e o
       FormData deixa de ser idêntico ao do `<button>` nativo — MEDIDO: o teste de
       paridade reprovou exatamente nisso.

       Então o auxiliar entra na posição do próprio componente. É por isto que o
       Web Awesome anexa ao `parentElement` em vez de ao form.

       O `else` cobre o botão que aponta para um form pelo atributo `form` estando
       fora dele: aí não há posição equivalente, e ser membro vale mais que a
       ordem. */
    if (form.contains(this)) this.before(proxy);
    else form.append(proxy);

    proxy.click();
    proxy.remove();
  }
}

define('lc-button', LcButton);
