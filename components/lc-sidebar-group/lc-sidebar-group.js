import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-sidebar-group.css.js';
import '../lc-icon/lc-icon.js';

/**
 * @summary Grupo com submenu, dentro do `lc-sidebar`.
 * @documentation ./lc-sidebar-group.md
 * @status experimental
 * @since 0.3
 * @dependency lc-icon
 *
 * @slot - Os `lc-sidebar-item` do submenu.
 *
 * @csspart base - O contêiner.
 * @csspart trigger - O `<button>` que abre e fecha.
 * @csspart icon - O ícone da categoria.
 * @csspart label - O rótulo.
 * @csspart arrow - A seta.
 * @csspart menu - O contêiner do submenu.
 *
 * O gatilho é `<button>`, não `<a href="#">` como no painel. O painel usa link
 * porque herdou markup do AdminLTE, e o custo aparece no teclado: Enter num
 * link navega, e o `#` no fim empurra uma entrada no histórico a cada abertura.
 * Um botão que abre um painel é um botão.
 *
 * QUEM MANDA NO ACORDEÃO É O `lc-sidebar`, não este componente. O grupo só sabe
 * abrir e fechar a si mesmo; fechar os irmãos é decisão da lista inteira, e
 * seria errado cada grupo alcançar os outros para isso. Mesma divisão que o
 * `lc-dropdown` faz com o `lc-menu-item`.
 *
 * O submenu é escondido com `hidden`, e não só com altura zero: item invisível
 * que continua focável é a forma clássica de o teclado cair num buraco.
 */
export class LcSidebarGroup extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <div part="base" class="base">
      <button part="trigger" class="gatilho" type="button" aria-expanded="false">
        <lc-icon part="icon" class="icone" aria-hidden="true"></lc-icon>
        <span part="label" class="rotulo"></span>
        <lc-icon part="arrow" class="seta" name="chevron-right" aria-hidden="true"></lc-icon>
      </button>
      <div part="menu" class="submenu" hidden><slot></slot></div>
    </div>
  `;

  static properties = {
    /** O texto do grupo. */
    label: 'string',
    /** Nome do ícone da categoria, resolvido pelo `lc-icon`. */
    icon: 'string',
    /** Submenu aberto. */
    open: 'boolean',
  };

  static watch = {
    label: 'sync',
    icon: 'sync',
    open: 'syncOpen',
  };

  ready() {
    this.$('.gatilho').addEventListener('click', () => {
      this.open = !this.open;
    });

    /* Os itens do submenu ganham o nível pelo PAI, e não por um atributo que
       quem escreve a tela teria de lembrar de pôr. `slotchange` cobre item que
       chega depois, por script. */
    const slot = this.$('slot');
    slot.addEventListener('slotchange', () => this.#marcarNivel(slot));
    this.#marcarNivel(slot);

    this.sync();
    this.syncOpen();
  }

  #marcarNivel(slot) {
    for (const el of slot.assignedElements()) {
      if (el.localName === 'lc-sidebar-item') el.dataset.nivel = '2';
    }
  }

  sync() {
    const rotulo = this.$('.rotulo');
    if (rotulo) rotulo.textContent = this.label ?? '';

    const icone = this.$('.icone');
    if (!icone) return;
    if (this.icon) icone.setAttribute('name', this.icon);
    else icone.removeAttribute('name');
  }

  syncOpen() {
    const gatilho = this.$('.gatilho');
    const submenu = this.$('.submenu');
    if (!gatilho || !submenu) return;

    const aberto = Boolean(this.open);
    gatilho.setAttribute('aria-expanded', String(aberto));
    submenu.hidden = !aberto;
    this.setState('open', aberto);
  }
}

define('lc-sidebar-group', LcSidebarGroup);
