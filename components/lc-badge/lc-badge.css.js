export default /* css */ `
@layer lc-component {
  :host {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  :host([hidden]) { display: none; }

  .base {
    display: inline-flex;
    align-items: center;
    gap: var(--lc-space-3xs);
    padding: var(--lc-space-3xs) var(--lc-space-xs);
    border: var(--lc-border-width) solid var(--lc-color-neutral-border);
    border-radius: var(--lc-radius-badge);
    background: var(--lc-color-neutral-fill-quiet);
    color: var(--lc-color-neutral-text);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-xs);
    font-weight: var(--lc-font-weight-semibold);
    line-height: 1.4;
    white-space: nowrap;
  }

  /* Chip usa a cor ESCURA da variante sobre fundo tintado, nunca branco sobre o
     sólido. Neste tamanho de texto o branco sobre \`fill-normal\` não passaria
     contraste — é a mesma razão de \`--lc-color-*-text\` existir no contrato. */
  :host([variant='brand']) .base {
    border-color: var(--lc-color-brand-border);
    background: var(--lc-color-brand-fill-quiet);
    color: var(--lc-color-brand-text);
  }

  :host([variant='success']) .base {
    border-color: var(--lc-color-success-border);
    background: var(--lc-color-success-fill-quiet);
    color: var(--lc-color-success-text);
  }

  :host([variant='warning']) .base {
    border-color: var(--lc-color-warning-border);
    background: var(--lc-color-warning-fill-quiet);
    color: var(--lc-color-warning-text);
  }

  :host([variant='danger']) .base {
    border-color: var(--lc-color-danger-border);
    background: var(--lc-color-danger-fill-quiet);
    color: var(--lc-color-danger-text);
  }
}
`;
