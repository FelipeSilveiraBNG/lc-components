import { define } from '../define.js';
import { LC_AFTER_HIDE, LC_AFTER_SHOW, LC_HIDE, LC_SELECT, LC_SHOW } from '../events.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-dropdown.css.js';

/**
 * @summary Menu de ações ancorado num gatilho, aberto no top layer.
 * @documentation ./lc-dropdown.md
 * @status experimental
 * @since 0.1
 *
 * @slot trigger - O elemento que abre o menu (normalmente um `<button class="lc-btn">`).
 * @slot - Os itens. Use `<lc-menu-item value="x">`. Um `<hr>` separa grupos.
 *
 * @event lc-show - Vai abrir. Cancelável.
 * @event lc-after-show - Abriu.
 * @event lc-hide - Vai fechar. Cancelável.
 * @event lc-after-hide - Fechou.
 * @event lc-select - Item acionado. Cancelável — `preventDefault()` mantém o menu aberto.
 *
 * @csspart base - O contêiner do gatilho.
 * @csspart panel - O painel flutuante.
 *
 * Serve para DISPARAR COMANDO, não para capturar valor. Se o usuário escolhe
 * algo que precisa ir num `<form>`, o componente é outro.
 */
export class LcDropdown extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <span part="base" class="base"><slot name="trigger"></slot></span>
    <div part="panel" class="panel" popover="auto" role="menu"><slot></slot></div>
  `;

  static properties = {
    /** `bottom-start` (default), `bottom-end`, `top-start`, `top-end`. */
    placement: { type: 'string', default: 'bottom-start' },
    /** Respiro em px entre gatilho e painel. */
    distance: { type: 'number', default: 4 },
    /** Estado atual. Alterar reflete no painel. */
    open: 'boolean',
  };

  static watch = { open: 'syncOpen' };

  #panel;
  #reposition = () => this.#position();

  ready() {
    this.#panel = this.$('.panel');

    this.$('.base').addEventListener('click', () => {
      this.open = !this.open;
    });

    // O popover é a fonte de verdade do estado: ele fecha sozinho por clique
    // fora e por Esc (light dismiss nativo), sem listener nosso. Por isso
    // sincronizamos a partir dele, e não o contrário.
    this.#panel.addEventListener('beforetoggle', (event) => {
      const opening = event.newState === 'open';
      const ok = this.emit(opening ? LC_SHOW : LC_HIDE, { cancelable: true });
      if (!ok) {
        event.preventDefault();
        return;
      }
      if (opening) this.#position();
    });

    this.#panel.addEventListener('toggle', (event) => {
      const isOpen = event.newState === 'open';
      // Reflete de volta sem re-disparar (o setter só muda o atributo).
      if (this.open !== isOpen) this.open = isOpen;
      this.setState('open', isOpen);

      if (isOpen) {
        addEventListener('scroll', this.#reposition, { passive: true, capture: true });
        addEventListener('resize', this.#reposition);
        this.#panel.querySelector('lc-menu-item')?.focus?.();
        this.emit(LC_AFTER_SHOW);
      } else {
        removeEventListener('scroll', this.#reposition, { capture: true });
        removeEventListener('resize', this.#reposition);
        this.emit(LC_AFTER_HIDE);
      }
    });

    // Item acionado: cancelável, e por padrão fecha o menu.
    this.addEventListener('click', (event) => {
      const item = event.target.closest?.('lc-menu-item');
      if (!item || !this.contains(item)) return;
      const ok = this.emit(LC_SELECT, {
        cancelable: true,
        detail: { value: item.value ?? item.dataset.value ?? null, item },
      });
      if (ok) this.open = false;
    });

    this.syncOpen();
  }

  disconnected() {
    removeEventListener('scroll', this.#reposition, { capture: true });
    removeEventListener('resize', this.#reposition);
  }

  syncOpen() {
    if (!this.#panel) return;
    const isOpen = this.#panel.matches(':popover-open');
    if (this.open && !isOpen) this.#panel.showPopover();
    else if (!this.open && isOpen) this.#panel.hidePopover();
  }

  show() {
    this.open = true;
  }

  hide() {
    this.open = false;
  }

  /**
   * Posiciona o painel em coordenadas de viewport. Vira para cima quando não há
   * espaço embaixo, e é grudado na borda quando estouraria na horizontal — que é
   * o caso da "última linha da tabela" do doc 05 §3.7.
   */
  #position() {
    const anchor = this.$('.base').getBoundingClientRect();
    const panel = this.#panel;

    // Mede sem mostrar salto: o painel já está no top layer quando isto roda.
    const { width, height } = panel.getBoundingClientRect();
    const gap = this.distance;
    const [side, align] = this.placement.split('-');

    let top = side === 'top' ? anchor.top - height - gap : anchor.bottom + gap;
    if (side !== 'top' && top + height > innerHeight - 8 && anchor.top - height - gap > 8) {
      top = anchor.top - height - gap; // não cabe embaixo → vira para cima
    }

    let left = align === 'end' ? anchor.right - width : anchor.left;
    left = Math.max(8, Math.min(left, innerWidth - width - 8));

    panel.style.top = `${Math.max(8, top)}px`;
    panel.style.left = `${left}px`;
  }
}

define('lc-dropdown', LcDropdown);
