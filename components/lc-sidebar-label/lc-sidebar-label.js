import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-sidebar-label.css.js';

/**
 * @summary Rótulo de seção do `lc-sidebar`. Só texto.
 * @documentation ./lc-sidebar-label.md
 * @status experimental
 * @since 0.3
 *
 * @slot - O texto do rótulo.
 *
 * @csspart base - O contêiner.
 *
 * NÃO AGRUPA NADA. É um rótulo solto na lista, como o "MENU" do painel — e a
 * ausência de agrupamento é o ponto: um `lc-sidebar-section` que envolvesse os
 * itens resolveria mais, mas ninguém pediu isso ainda, e uma tag que existe
 * "por precaução" é uma tag que ninguém sabe quando usar.
 *
 * Se um protótipo precisar de seções de verdade — com recolher, com contagem,
 * com estado — aí nasce outra tag, e esta continua servindo para o caso simples.
 *
 * `role="presentation"` no host: para o leitor de tela isto é decoração de
 * lista, não um cabeçalho navegável. Um `<h2>` aqui poluiria o mapa de
 * cabeçalhos da página com a palavra "MENU".
 */
export class LcSidebarLabel extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base"><slot></slot></div>
  `;

  ready() {
    this.setAttribute('role', 'presentation');
  }
}

define('lc-sidebar-label', LcSidebarLabel);
