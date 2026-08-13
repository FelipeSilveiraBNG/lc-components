import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-badge.css.js';

/**
 * @summary Chip de status. Substitui a classe `.lc-badge` (ADR 0001).
 * @documentation ./lc-badge.md
 * @status experimental
 * @since 0.1
 *
 * @slot - O texto do chip.
 *
 * @csspart base - O contêiner.
 *
 * É chip de STATUS, não contador: `<lc-badge variant="warning">Pendente</lc-badge>`,
 * não um número sobre um ícone. O legado usava `.label-*` do Bootstrap para as duas
 * coisas, e é por isso que a distinção precisa estar escrita aqui.
 *
 * O texto usa a cor escura da variante sobre fundo tintado, nunca branco sobre o
 * sólido — ver o comentário em lc-badge.css.js.
 */
export class LcBadge extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <span part="base" class="base"><slot></slot></span>
  `;

  static properties = {
    /**
     * Papel semântico do chip.
     * @type {'neutral'|'brand'|'success'|'warning'|'danger'}
     */
    variant: { type: 'string', default: 'neutral' },
  };
}

define('lc-badge', LcBadge);
