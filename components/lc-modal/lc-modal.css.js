export default /* css */ `
@layer lc-component {
  :host {
    display: contents;
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
  }

  /* <dialog> nativo com showModal(): top layer, focus trap, "inert" no resto da
     página e Esc — tudo de graça, sem escada de z-index. O legado empilhava 8
     z-index à mão (01 §4) e mesmo assim tinha dropdown recortado. */
  .dialog {
    box-sizing: border-box;
    width: var(--width, 600px);
    max-width: calc(100vw - 2 * var(--lc-space-l));
    max-height: var(--max-height, 85vh);
    padding: 0;
    border: 0;
    border-radius: var(--lc-radius-panel);
    background: var(--lc-color-surface-card);
    box-shadow: var(--lc-shadow-overlay);
    color: var(--lc-color-text-normal);
    overflow: hidden;
  }

  :host([size='small']) .dialog { --width: 380px; }
  /* 900px é o padrão de fato do legado: .modal-lg aparece 19× (01 §3.6). */
  :host([size='large']) .dialog { --width: 900px; }

  .dialog::backdrop {
    background: var(--lc-color-surface-overlay);
  }

  .panel {
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }

  .header {
    display: flex;
    align-items: center;
    gap: var(--lc-space-s);
    flex: 0 0 auto;
    padding: var(--lc-space-s) var(--lc-space-m);
    border-bottom: var(--lc-border-width) solid var(--lc-color-border-quiet);
  }

  :host([without-header]) .header { display: none; }

  .title {
    flex: 1 1 auto;
    min-width: 0;
    font-size: var(--lc-font-size-xl);
    font-weight: var(--lc-font-weight-semibold);
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: var(--lc-control-height-sm);
    height: var(--lc-control-height-sm);
    padding: 0;
    border: 0;
    border-radius: var(--lc-radius-control);
    background: transparent;
    color: var(--lc-color-text-quiet);
    cursor: pointer;
  }

  .close:hover { background: var(--lc-color-neutral-fill-quiet); }

  .close:focus-visible {
    outline: var(--lc-focus-ring-width) solid var(--lc-focus-ring-color);
    outline-offset: var(--lc-focus-ring-offset);
  }

  :host([without-close-button]) .close { display: none; }

  /* Só o corpo rola: header e footer ficam parados. */
  .body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: var(--lc-space-m);
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--lc-space-s);
    flex: 0 0 auto;
    padding: var(--lc-space-s) var(--lc-space-m);
    border-top: var(--lc-border-width) solid var(--lc-color-border-quiet);
  }

  :host([without-footer]) .footer { display: none; }
}
`;
