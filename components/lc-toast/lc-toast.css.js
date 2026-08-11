export default /* css */ `
@layer lc-component {
  :host { display: contents; }

  /* popover="manual": top layer, sem light dismiss (toast não fecha por clique
     fora). Estar no top layer é o que faz o toast aparecer ACIMA de um modal
     aberto — no legado isso era z-index 1060 contra 1050, à mão. */
  .region {
    position: fixed;
    inset: auto var(--lc-space-m) auto auto;
    top: var(--lc-space-m);
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: var(--lc-space-xs);
    width: min(380px, calc(100vw - 2 * var(--lc-space-m)));
    overflow: visible;
  }

  .region:not(:popover-open) { display: none; }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: var(--lc-space-xs);
    box-sizing: border-box;
    padding: var(--lc-space-s) var(--lc-space-m);
    border: var(--lc-border-width) solid var(--lc-color-border-normal);
    border-inline-start: var(--lc-accent-bar-width) solid var(--lc-color-neutral-border);
    border-radius: var(--lc-radius-panel);
    background: var(--lc-color-surface-raised);
    box-shadow: var(--lc-shadow-overlay);
    color: var(--lc-color-text-normal);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    animation: lc-toast-in var(--lc-transition-normal) both;
  }

  @keyframes lc-toast-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .toast { animation: none; }
  }

  .toast[data-variant='brand'] { border-inline-start-color: var(--lc-color-brand-border); }
  .toast[data-variant='success'] { border-inline-start-color: var(--lc-color-success-border); }
  .toast[data-variant='warning'] { border-inline-start-color: var(--lc-color-warning-border); }
  .toast[data-variant='danger'] { border-inline-start-color: var(--lc-color-danger-border); }

  .toast[data-variant='brand'] lc-icon { color: var(--lc-color-brand-text); }
  .toast[data-variant='success'] lc-icon { color: var(--lc-color-success-text); }
  .toast[data-variant='warning'] lc-icon { color: var(--lc-color-warning-text); }
  .toast[data-variant='danger'] lc-icon { color: var(--lc-color-danger-text); }

  .content { flex: 1 1 auto; min-width: 0; }

  .title {
    font-weight: var(--lc-font-weight-semibold);
    margin-bottom: var(--lc-space-3xs);
  }

  .close {
    flex: 0 0 auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--lc-color-text-quiet);
    cursor: pointer;
    line-height: 1;
  }

  .close:focus-visible {
    outline: var(--lc-focus-ring-width) solid var(--lc-focus-ring-color);
    outline-offset: var(--lc-focus-ring-offset);
  }
}
`;
