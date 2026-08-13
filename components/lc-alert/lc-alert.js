import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-alert.css.js';

/**
 * @summary Aviso em bloco. Substitui a classe `.lc-alert` (ADR 0001).
 * @documentation ./lc-alert.md
 * @status experimental
 * @since 0.1
 *
 * @slot - A mensagem.
 * @slot icon - Ícone à esquerda. Normalmente um `<lc-icon>`.
 *
 * @csspart base - O contêiner.
 * @csspart icon - O contêiner do ícone.
 * @csspart message - O contêiner da mensagem.
 *
 * Unifica o `.alert` e o `.callout` do legado, que eram a mesma coisa com ênfase
 * diferente: `appearance="banner"` é o antigo callout, com barra na lateral.
 *
 * O ícone é SLOT, não atributo. Na camada de classes ele era escrito como primeiro
 * filho e o alinhamento dependia de quem escrevia acertar; como slot, o componente
 * garante que ele não encolha e fique alinhado à primeira linha do texto.
 *
 * `role="alert"` NÃO é aplicado por padrão: este componente é usado para aviso
 * estático de página, e um `role="alert"` em conteúdo que já está na tela no
 * carregamento faz o leitor de tela interromper o usuário sem motivo. Para aviso
 * que aparece em resposta a uma ação, use `<lc-toast>`, que é live region de fato.
 */
export class LcAlert extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base">
      <span part="icon" class="icone"><slot name="icon"></slot></span>
      <div part="message" class="mensagem"><slot></slot></div>
    </div>
  `;

  static properties = {
    /**
     * Papel semântico do aviso.
     * @type {'neutral'|'brand'|'success'|'warning'|'danger'}
     */
    variant: { type: 'string', default: 'neutral' },
    /**
     * `outlined` é borda em volta; `banner` é barra na lateral (o antigo callout).
     * @type {'outlined'|'banner'}
     */
    appearance: { type: 'string', default: 'outlined' },
  };
}

define('lc-alert', LcAlert);
