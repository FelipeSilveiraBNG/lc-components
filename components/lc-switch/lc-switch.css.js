export default /* css */ `
@layer lc-component {
  :host {
    display: inline-block;
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    color: var(--lc-color-text-normal);
  }

  :host([hidden]) { display: none; }

  .base {
    display: inline-flex;
    align-items: center;
    gap: var(--lc-space-xs);
    cursor: pointer;
  }

  :host([disabled]) .base {
    cursor: not-allowed;
    opacity: 0.55;
  }

  /* O trilho. A largura acompanha a altura de controle do tema, então o switch
     fica compacto no legacy (34px) e um pouco maior no modern (38px) sem que o
     componente saiba qual tema está ativo. */
  .control {
    box-sizing: border-box;
    flex: 0 0 auto;
    width: calc(var(--lc-control-height) * 0.82);
    height: calc(var(--lc-control-height) * 0.47);
    padding: 0;
    border: var(--lc-border-width) solid var(--lc-color-border-loud);
    border-radius: var(--lc-radius-pill);
    background: var(--lc-color-neutral-fill-quiet);
    cursor: inherit;
    transition:
      background var(--lc-transition-fast),
      border-color var(--lc-transition-fast);
  }

  .control:focus-visible {
    outline: var(--lc-focus-ring-width) solid var(--lc-focus-ring-color);
    outline-offset: var(--lc-focus-ring-offset);
  }

  .thumb {
    display: block;
    width: calc(var(--lc-control-height) * 0.34);
    height: calc(var(--lc-control-height) * 0.34);
    margin-inline-start: 1px;
    border-radius: var(--lc-radius-pill);
    background: var(--lc-color-surface-card);
    box-shadow: var(--lc-shadow-card);
    transition: transform var(--lc-transition-fast);
  }

  :host([checked]) .control {
    border-color: var(--lc-color-brand-border);
    background: var(--lc-color-brand-fill-normal);
  }

  :host([checked]) .thumb {
    transform: translateX(calc(var(--lc-control-height) * 0.35));
  }

  /* Custom state, não atributo: validade é estado interno, calculado — não é
     algo que o consumidor declara no HTML. É para isto que serve :state(). */
  :host(:state(invalid)) .control {
    border-color: var(--lc-color-danger-border);
  }

  .label::slotted-empty { display: none; }
}
`;
