export default /* css */ `
@layer lc-component {
  :host {
    display: block;
  }

  :host([hidden]) { display: none; }

  .base {
    display: flex;
    align-items: center;
    gap: var(--lc-space-xs);
    box-sizing: border-box;
    width: 100%;
    padding: var(--lc-space-xs) var(--lc-space-m);
    border: 0;
    background: transparent;
    color: var(--lc-color-text-normal);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    line-height: var(--lc-line-height-normal);
    text-align: start;
    cursor: pointer;
  }

  .base:hover:not(:disabled) {
    background: var(--lc-color-neutral-fill-quiet);
  }

  .base:focus-visible {
    outline: var(--lc-focus-ring-width) solid var(--lc-focus-ring-color);
    outline-offset: calc(-1 * var(--lc-focus-ring-width));
  }

  .base:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* Item destrutivo. Era \`data-variant="danger"\` na camada de classes; agora é
     atributo do componente, o que o torna descobrível na doc em vez de
     convenção que só quem leu o CSS conhece. */
  :host([variant='danger']) .base {
    color: var(--lc-color-danger-text);
  }

  :host([variant='danger']) .base:hover:not(:disabled) {
    background: var(--lc-color-danger-fill-quiet);
  }
}
`;
