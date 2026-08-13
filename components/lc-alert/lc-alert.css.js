export default /* css */ `
@layer lc-component {
  :host {
    display: block;
    margin-bottom: var(--lc-space-l);
  }

  :host([hidden]) { display: none; }

  .base {
    display: flex;
    align-items: flex-start;
    gap: var(--lc-space-xs);
    box-sizing: border-box;
    padding: var(--lc-space-s) var(--lc-space-m);
    border: var(--lc-border-width) solid var(--lc-color-neutral-border);
    border-radius: var(--lc-radius-control);
    background: var(--lc-color-neutral-fill-quiet);
    color: var(--lc-color-text-normal);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    line-height: var(--lc-line-height-normal);
  }

  /* O ícone não encolhe nem cresce: alinhado ao topo da primeira linha, para o
     aviso de duas linhas não deixar o ícone centralizado no meio do bloco. */
  .icone {
    display: flex;
    flex: 0 0 auto;
    margin-top: 0.15em;
  }

  .mensagem {
    flex: 1 1 auto;
    min-width: 0;
  }

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

  /* \`banner\` é o antigo \`.callout\` do legado: barra na lateral em vez de borda
     em volta. Usa \`currentColor\`, então acompanha a variante sem token próprio —
     era assim na camada de classes e continua sendo. */
  :host([appearance='banner']) .base {
    border-width: 0;
    border-inline-start: var(--lc-accent-bar-width) solid currentColor;
    border-radius: 0;
  }
}
`;
