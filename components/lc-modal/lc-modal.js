import { define } from '../define.js';
import { LC_AFTER_HIDE, LC_AFTER_SHOW, LC_HIDE, LC_SHOW } from '../events.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-modal.css.js';
import '../lc-icon/lc-icon.js';

/**
 * @summary Diálogo modal sobre o `<dialog>` nativo.
 * @documentation ./lc-modal.md
 * @status experimental
 * @since 0.1
 *
 * @dependency lc-icon
 *
 * @slot - O corpo.
 * @slot header - O título. Sem ele, usa o atributo `label`.
 * @slot footer - Os botões de ação.
 *
 * @event lc-show - Vai abrir. Cancelável.
 * @event lc-after-show - Abriu.
 * @event lc-hide - Vai fechar. Cancelável. `detail.source` ∈ close-button | overlay | escape | api.
 * @event lc-after-hide - Fechou.
 *
 * @csspart dialog - O `<dialog>`.
 * @csspart panel - O contêiner interno em coluna.
 * @csspart header - O cabeçalho.
 * @csspart title - O título.
 * @csspart close - O botão de fechar.
 * @csspart body - O corpo (é quem rola).
 * @csspart footer - O rodapé.
 *
 * @cssproperty --width - Largura do diálogo.
 * @cssproperty --max-height - Altura máxima.
 *
 * Nota de convenção: as custom properties do componente NÃO usam o prefixo
 * `--lc-`, que é reservado a token de design de escopo global. É a regra do
 * Web Awesome (doc 09 §3.5).
 *
 * Pode ser aberto SEM JAVASCRIPT, pelo invocador por data-attribute:
 *   <button data-lc-modal="open meu-id">Abrir</button>
 */
export class LcModal extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <dialog part="dialog" class="dialog">
      <div part="panel" class="panel">
        <header part="header" class="header">
          <div part="title" class="title"><slot name="header"></slot></div>
          <button part="close" class="close" type="button" aria-label="Fechar">
            <lc-icon name="x"></lc-icon>
          </button>
        </header>
        <div part="body" class="body"><slot></slot></div>
        <footer part="footer" class="footer"><slot name="footer"></slot></footer>
      </div>
    </dialog>
  `;

  static properties = {
    open: 'boolean',
    /** Título usado quando o slot `header` está vazio. Também vira o rótulo acessível. */
    label: 'string',
    /** `small` (380px), default (600px), `large` (900px — o padrão do legado). */
    size: 'string',
    withoutHeader: { type: 'boolean', attribute: 'without-header' },
    withoutFooter: { type: 'boolean', attribute: 'without-footer' },
    withoutCloseButton: { type: 'boolean', attribute: 'without-close-button' },
  };

  static watch = { open: 'syncOpen', label: 'syncLabel' };

  #dialog;

  ready() {
    this.#dialog = this.$('.dialog');

    this.$('.close').addEventListener('click', () => this.#requestHide('close-button'));

    // Clique no backdrop tem o próprio <dialog> como target — o conteúdo está
    // dentro de .panel, então qualquer clique no dialog em si é backdrop.
    this.#dialog.addEventListener('click', (event) => {
      if (event.target === this.#dialog) this.#requestHide('overlay');
    });

    // Esc dispara `cancel` no <dialog>. Interceptamos para que TODO fechamento
    // passe pelo mesmo evento cancelável, com a origem em detail.source.
    this.#dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.#requestHide('escape');
    });

    this.syncLabel();
    this.syncOpen();
  }

  syncLabel() {
    const slot = this.$('slot[name="header"]');
    const hasHeaderSlot = slot?.assignedNodes({ flatten: true }).length > 0;
    if (!hasHeaderSlot && this.label) this.$('.title').textContent = this.label;
    if (this.label) this.#dialog?.setAttribute('aria-label', this.label);
  }

  syncOpen() {
    if (!this.#dialog) return;

    if (this.open && !this.#dialog.open) {
      if (!this.emit(LC_SHOW, { cancelable: true })) {
        this.open = false;
        return;
      }
      this.#dialog.showModal();
      this.setState('open', true);
      // `autofocus` no conteúdo escolhe o foco inicial; o <dialog> respeita.
      this.emit(LC_AFTER_SHOW);
    } else if (!this.open && this.#dialog.open) {
      this.#dialog.close();
      this.setState('open', false);
      this.emit(LC_AFTER_HIDE);
    }
  }

  /** Roteia todo fechamento por um único evento cancelável. */
  #requestHide(source) {
    if (this.emit(LC_HIDE, { cancelable: true, detail: { source } })) this.open = false;
  }

  show() {
    this.open = true;
  }

  hide() {
    this.#requestHide('api');
  }
}

define('lc-modal', LcModal);

/*
 * Invocador por data-attribute — convenção do Web Awesome (doc 09 §3.9):
 *
 *   <button data-lc-modal="open meu-id">Abrir</button>
 *   <button data-lc-modal="close meu-id">Fechar</button>
 *
 * O id pode ser omitido quando o botão está DENTRO do modal.
 * Vale muito aqui: protótipo com navegação entre modais sem uma linha de JS.
 */
if (!globalThis.__lcModalInvoker) {
  globalThis.__lcModalInvoker = true;
  document.addEventListener('click', (event) => {
    const trigger = event.target?.closest?.('[data-lc-modal]');
    if (!trigger) return;

    const [action, id] = trigger.getAttribute('data-lc-modal').trim().split(/\s+/);
    const target = id ? document.getElementById(id) : trigger.closest('lc-modal');
    if (!(target instanceof LcModal)) {
      console.warn(`[lc-components] data-lc-modal="${action} ${id ?? ''}": alvo não encontrado.`);
      return;
    }

    if (action === 'open') target.show();
    else if (action === 'close') target.hide();
  });
}
