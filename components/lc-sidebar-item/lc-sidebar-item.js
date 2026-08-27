import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-sidebar-item.css.js';
import '../lc-icon/lc-icon.js';

/**
 * @summary Uma linha que navega, dentro do `lc-sidebar`.
 * @documentation ./lc-sidebar-item.md
 * @status experimental
 * @since 0.3
 * @dependency lc-icon
 *
 * @slot - O rótulo.
 *
 * @csspart base - O `<a>` interno.
 * @csspart icon - O ícone à esquerda.
 * @csspart label - O contêiner do rótulo.
 *
 * É um `<a href>` de verdade, não um botão que navega por script: middle-click
 * abre em aba nova, o navegador mostra o destino na barra de status, e o
 * histórico funciona. Uma barra de navegação que não faz isso frustra quem usa
 * teclado e mouse do jeito que sempre usou.
 *
 * `icon` só faz sentido no PRIMEIRO nível. Dentro de um `lc-sidebar-group` o
 * item nasce sem ícone e com recuo, porque é assim que o painel desenha — a
 * hierarquia ali é dada pelo recuo e pela régua, não por um segundo ícone.
 *
 * Sobre `current`: quase nunca é preciso escrever. O `lc-sidebar` casa o `href`
 * com `location.pathname` e marca sozinho. Escrever `current` à mão só é
 * necessário quando a URL não bate com o item — rota com parâmetro, por
 * exemplo — e aí o explícito vence.
 */
export class LcSidebarItem extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <a part="base" class="base">
      <lc-icon part="icon" class="icone" aria-hidden="true"></lc-icon>
      <span part="label" class="rotulo"><slot></slot></span>
    </a>
  `;

  static properties = {
    /** Destino. Vira o `href` do `<a>` interno. */
    href: 'string',
    /** Nome do ícone, resolvido pelo `lc-icon`. Só no primeiro nível. */
    icon: 'string',
    /** Marca o item como o da tela atual. Normalmente o `lc-sidebar` cuida. */
    current: 'boolean',
  };

  static watch = {
    href: 'sync',
    icon: 'sync',
    current: 'sync',
  };

  ready() {
    this.sync();
  }

  sync() {
    const a = this.$('.base');
    if (!a) return;

    /* Sem `href` o item não é link: vira `<a>` sem destino, que o navegador já
       tira da ordem de tabulação sozinho. Não inventamos um `tabindex="-1"`. */
    if (this.href) a.setAttribute('href', this.href);
    else a.removeAttribute('href');

    const icone = this.$('.icone');
    if (this.icon) icone.setAttribute('name', this.icon);
    else icone.removeAttribute('name');

    /* `aria-current="page"` é o que o leitor de tela anuncia. O acento visual
       vem do atributo `current` via CSS — os dois em sincronia, um só ponto de
       verdade. */
    if (this.current) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

define('lc-sidebar-item', LcSidebarItem);
