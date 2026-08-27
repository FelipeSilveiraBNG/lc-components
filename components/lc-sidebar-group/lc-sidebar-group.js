import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-sidebar-group.css.js';
import { posicionar } from '../posicionar.js';
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
 * @csspart menu-label - O rótulo dentro do flyout. Só existe no trilho.
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
 *
 * ── No trilho, o mesmo submenu vira flyout ───────────────────────────────────
 * Recolhida a barra, o painel sai do fluxo para o TOP LAYER e abre à direita do
 * ícone. É o mesmo elemento e os mesmos itens — o que muda é o `popover`, ligado
 * e desligado conforme o `data-rail` que o `lc-sidebar` põe aqui.
 *
 * Top layer, e não `position: fixed`, porque a lista da barra rola com
 * `overflow-y: auto`: qualquer painel dentro dela seria recortado na primeira
 * linha que passasse da borda. É o mesmo motivo do `lc-dropdown`, e o cálculo de
 * posição é literalmente o mesmo código — ver `posicionar.js`.
 *
 * O painel ganha o rótulo do grupo como CABEÇALHO. No trilho não há mais nada
 * dizendo de onde aquela lista saiu.
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
      <div part="menu" class="submenu" hidden>
        <span part="menu-label" class="submenu-rotulo" hidden></span>
        <slot></slot>
      </div>
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

  /* `data-rail` é posto pelo lc-sidebar, e atributo `data-*` não entra em
     `static properties` — então o observador é declarado aqui. */
  static get observedAttributes() {
    return [...super.observedAttributes, 'data-rail'];
  }

  attributeChangedCallback(attr, antes, depois) {
    super.attributeChangedCallback(attr, antes, depois);
    if (attr === 'data-rail') {
      this.open = false;
      this.sync();
      this.syncOpen();
    }
  }

  /** @returns {boolean} */
  get #noTrilho() {
    return this.dataset.rail !== undefined;
  }

  #reposicionar = () => {
    if (this.open && this.#noTrilho) this.#posicionarFlyout();
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

    /* No trilho o painel abre no hover, como no painel de homologação — mas só
       com MOUSE. Em toque não existe hover: o dedo que "passa por cima" já é um
       clique, e abrir no `pointerenter` faria o painel piscar antes do toque
       chegar. O clique continua valendo nos dois casos, e é ele que atende
       teclado e touch. */
    this.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' && this.#noTrilho) this.open = true;
    });
    this.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse' && this.#noTrilho) this.open = false;
    });

    this.sync();
    this.syncOpen();
  }

  disconnected() {
    removeEventListener('scroll', this.#reposicionar, { capture: true });
    removeEventListener('resize', this.#reposicionar);
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
    this.setState('open', aberto);

    /* O rótulo dentro do painel só existe no trilho: expandida, ele está logo
       acima, no gatilho, e repeti-lo seria dizer a mesma coisa duas vezes. */
    const rotulo = this.$('.submenu-rotulo');
    if (rotulo) {
      rotulo.textContent = this.label ?? '';
      rotulo.hidden = !this.#noTrilho;
    }

    if (!this.#noTrilho) {
      /* Fora do trilho o painel é conteúdo comum. Se veio de lá, devolve. */
      if (submenu.hasAttribute('popover')) {
        if (submenu.matches(':popover-open')) submenu.hidePopover();
        submenu.removeAttribute('popover');
        submenu.style.top = submenu.style.left = '';
      }
      submenu.hidden = !aberto;
      this.#pararDeAcompanhar();
      return;
    }

    /* No trilho, quem esconde é o popover — `hidden` junto brigaria com ele. */
    submenu.hidden = false;
    if (!submenu.hasAttribute('popover')) submenu.setAttribute('popover', 'manual');

    const estaAberto = submenu.matches(':popover-open');
    if (aberto && !estaAberto) {
      submenu.showPopover();
      this.#posicionarFlyout();
      addEventListener('scroll', this.#reposicionar, { passive: true, capture: true });
      addEventListener('resize', this.#reposicionar);
    } else if (!aberto && estaAberto) {
      submenu.hidePopover();
      this.#pararDeAcompanhar();
    }
  }

  #pararDeAcompanhar() {
    removeEventListener('scroll', this.#reposicionar, { capture: true });
    removeEventListener('resize', this.#reposicionar);
  }

  #posicionarFlyout() {
    /* Ancorado no GATILHO, não no host: no trilho os dois têm o mesmo
       retângulo, mas o gatilho é quem o usuário está de fato apontando. */
    posicionar(this.$('.submenu'), this.$('.gatilho').getBoundingClientRect(), {
      placement: 'right-start',
      distance: 2,
    });
  }
}

define('lc-sidebar-group', LcSidebarGroup);
