import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-card.css.js';

/**
 * @summary Contêiner de conteúdo com barra de acento no topo. Substitui `.lc-card` (ADR 0001).
 * @documentation ./lc-card.md
 * @status experimental
 * @since 0.1
 *
 * @slot - O corpo.
 * @slot header - O título e ações do cabeçalho.
 * @slot footer - Os botões de ação.
 *
 * @csspart base - O contêiner.
 * @csspart header - O cabeçalho.
 * @csspart body - O corpo.
 * @csspart footer - O rodapé.
 *
 * Unifica o `.box` (AdminLTE) e o `.portlet` (Metronic) do legado, que eram
 * redundantes. A barra de acento no topo é o que o `.box` usava para dizer "este
 * card é de aviso"; aqui é o atributo `variant`.
 *
 * Cabeçalho e rodapé desaparecem sozinhos quando o slot está vazio — na camada de
 * classes isso dependia de o autor não escrever a `div`, e um card com faixa vazia
 * e borda era o defeito mais comum. Ver o comentário em lc-card.css.js.
 */
export class LcCard extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base">
      <div part="header" class="cabecalho"><slot name="header"></slot></div>
      <div part="body" class="corpo"><slot></slot></div>
      <div part="footer" class="rodape"><slot name="footer"></slot></div>
    </div>
  `;

  static properties = {
    /**
     * Cor da barra de acento no topo.
     * @type {'neutral'|'brand'|'success'|'warning'|'danger'}
     */
    variant: { type: 'string', default: 'neutral' },
  };

  ready() {
    /* Liga o estado que o CSS lê para mostrar cabeçalho e rodapé. Ver o
       comentário em lc-card.css.js sobre por que não é `:has()`.

       `slotchange` cobre conteúdo que chega depois — protótipo que preenche o
       rodapé por script continua funcionando sem nada a mais. */
    for (const [slot, estado] of [
      ['header', 'has-header'],
      ['footer', 'has-footer'],
    ]) {
      const alvo = this.$(`slot[name="${slot}"]`);
      /* `assignedElements`, não `assignedNodes`: slot NOMEADO só recebe elemento
         (nó de texto não pode ter atributo `slot`), então isto evita que espaço
         em branco no markup conte como conteúdo. */
      const atualizar = () => this.setState(estado, alvo.assignedElements().length > 0);
      alvo.addEventListener('slotchange', atualizar);
      atualizar();
    }
  }
}

define('lc-card', LcCard);
