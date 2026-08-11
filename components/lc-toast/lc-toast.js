import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-toast.css.js';
import '../lc-icon/lc-icon.js';

const ICON = {
  brand: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  neutral: 'info',
};

/**
 * @summary Região de notificações. Host singleton — normalmente usado pela função `toast()`.
 * @documentation ./lc-toast.md
 * @status experimental
 * @since 0.1
 *
 * @dependency lc-icon
 *
 * @csspart region - O contêiner flutuante.
 * @csspart toast - Cada notificação.
 * @csspart close - O botão de fechar de uma notificação.
 *
 * Substitui `AdminFn.notificacao` (doc 03 §1.1) e consolida TRÊS bibliotecas do
 * legado numa: bootstrap-notify, bootstrap-dialog e notiflix (doc 02 §E).
 *
 * `newest_on_top` era a configuração do legado e é o comportamento aqui.
 */
export class LcToast extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <div part="region" class="region" popover="manual" role="status" aria-live="polite"></div>
  `;

  #region;

  ready() {
    this.#region = this.$('.region');
  }

  /**
   * Mostra uma notificação.
   * @param {string} message
   * @param {{ variant?: 'brand'|'success'|'warning'|'danger'|'neutral', title?: string, duration?: number }} [options]
   */
  show(message, options = {}) {
    const variant = options.variant ?? 'neutral';
    const duration = options.duration ?? 5000;

    const item = document.createElement('div');
    item.className = 'toast';
    item.setAttribute('part', 'toast');
    item.dataset.variant = variant;
    // Erro é anunciado imediatamente; o resto espera a vez do leitor de tela.
    if (variant === 'danger') item.setAttribute('role', 'alert');

    const icon = document.createElement('lc-icon');
    icon.setAttribute('name', ICON[variant] ?? 'info');
    item.append(icon);

    const content = document.createElement('div');
    content.className = 'content';
    if (options.title) {
      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = options.title;
      content.append(title);
    }
    const text = document.createElement('div');
    text.textContent = message;
    content.append(text);
    item.append(content);

    const close = document.createElement('button');
    close.className = 'close';
    close.setAttribute('part', 'close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar notificação');
    close.textContent = '×';
    close.addEventListener('click', () => this.#remove(item));
    item.append(close);

    // newest_on_top — como no legado.
    this.#region.prepend(item);

    // hide + show recoloca a região no TOPO da pilha do top layer. Sem isto, um
    // modal aberto DEPOIS do toast ficaria por cima dele.
    if (this.#region.matches(':popover-open')) this.#region.hidePopover();
    this.#region.showPopover();

    if (duration > 0) setTimeout(() => this.#remove(item), duration);
    return item;
  }

  #remove(item) {
    item.remove();
    if (!this.#region.children.length && this.#region.matches(':popover-open')) {
      this.#region.hidePopover();
    }
  }
}

define('lc-toast', LcToast);

/**
 * Atalho imperativo. Cria o host na primeira chamada.
 *
 *   import { toast } from '.../lc-toast.js';
 *   toast('Paciente salvo.', { variant: 'success' });
 *
 * Também disponível como `lc.toast(...)` no escopo global, para protótipo com
 * handler inline (`onclick="lc.toast('oi')"`) — que é como uma tela de teste
 * costuma ser escrita.
 */
export function toast(message, options) {
  let host = document.querySelector('lc-toast');
  if (!host) {
    host = document.createElement('lc-toast');
    document.body.append(host);
  }
  return host.show(message, options);
}

globalThis.lc = Object.assign(globalThis.lc ?? {}, { toast });
