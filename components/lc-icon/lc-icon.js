import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-icon.css.js';
import { resolveIcon } from './library.system.js';

/**
 * @summary Ícone de interface, resolvido por biblioteca registrável.
 * @documentation ./lc-icon.md
 * @status experimental
 * @since 0.1
 *
 * @csspart svg - O elemento <svg>.
 * @csspart missing - O marcador mostrado quando o nome não existe.
 *
 * @cssproperty --size - Atalho para o tamanho; por padrão herda o `font-size` do contexto.
 *
 * Tamanho e cor herdam do contexto (`1em` e `currentColor`), então o mesmo ícone
 * serve a um botão e a um texto secundário sem override.
 *
 * Nome inexistente renderiza um marcador VISÍVEL, nunca vazio — ver o
 * comentário em lc-icon.css.js.
 */
export class LcIcon extends LcElement {
  static css = [styles];

  static properties = {
    /** Nome do ícone dentro da biblioteca. */
    name: 'string',
    /** Biblioteca que resolve o nome. */
    library: { type: 'string', default: 'system' },
    /** Rótulo acessível. Sem ele, o ícone é decorativo e fica oculto a leitores de tela. */
    label: 'string',
  };

  static watch = {
    name: 'render',
    library: 'render',
    label: 'applyA11y',
  };

  ready() {
    this.render();
    this.applyA11y();
  }

  render() {
    const paths = this.name ? resolveIcon(this.library, this.name) : null;

    this.shadowRoot.innerHTML = paths
      ? `<svg part="svg" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`
      : `<div part="missing" class="lc-missing"></div>`;

    if (!paths && this.name) {
      console.warn(
        `[lc-bricks] <lc-icon>: "${this.name}" não existe na biblioteca "${this.library}". ` +
          `Renderizando marcador. Registre o ícone em library.system.js ou corrija o nome.`,
      );
    }
  }

  applyA11y() {
    if (this.label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', this.label);
      this.removeAttribute('aria-hidden');
    } else {
      this.setAttribute('aria-hidden', 'true');
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
    }
  }
}

define('lc-icon', LcIcon);
