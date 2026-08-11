export default /* css */ `
@layer lc-component {
  :host {
    display: inline-block;
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
  }

  :host([hidden]) { display: none; }

  /* O painel é um popover: vive no TOP LAYER.
     É isto que mata o bug estrutural nº 1 do legado (doc 05 §3.7): dropdown
     recortado por contêiner com overflow, dentro de modal, ou na última linha de
     uma tabela que rola. O legado precisava de "dropdownParent" no Select2 e de
     override de overflow em custom.css:554-578. Aqui não precisa de nada.

     A UA stylesheet dá ao popover "position: fixed; inset: 0; margin: auto" —
     centralizado. Zeramos para posicionar por JS. */
  .panel {
    position: fixed;
    inset: auto;
    margin: 0;
    box-sizing: border-box;
    min-width: 180px;
    max-width: 320px;
    max-height: 60vh;
    overflow-y: auto;
    padding: var(--lc-space-2xs);
    border: var(--lc-border-width) solid var(--lc-color-border-normal);
    border-radius: var(--lc-radius-panel);
    background: var(--lc-color-surface-raised);
    box-shadow: var(--lc-shadow-overlay);
    color: var(--lc-color-text-normal);
  }

  .panel:not(:popover-open) { display: none; }

  /* Estilo dos itens slotados. Item e um <button class="lc-menu-item"> em light
     DOM — HTML simples, coerente com a camada nativa (07 §4.2). */
  ::slotted(.lc-menu-item) {
    display: flex;
    align-items: center;
    gap: var(--lc-space-xs);
    box-sizing: border-box;
    width: 100%;
    min-height: var(--lc-control-height-sm);
    padding: 0 var(--lc-space-s);
    border: 0;
    border-radius: var(--lc-radius-control);
    background: transparent;
    color: var(--lc-color-text-normal);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  ::slotted(.lc-menu-item:hover) {
    background: var(--lc-color-neutral-fill-quiet);
  }

  ::slotted(.lc-menu-item:focus-visible) {
    outline: var(--lc-focus-ring-width) solid var(--lc-focus-ring-color);
    outline-offset: calc(-1 * var(--lc-focus-ring-width));
  }

  ::slotted(.lc-menu-item[data-variant='danger']) {
    color: var(--lc-color-danger-text);
  }

  ::slotted(hr) {
    margin: var(--lc-space-2xs) 0;
    border: 0;
    border-top: var(--lc-border-width) solid var(--lc-color-border-quiet);
  }
}
`;
