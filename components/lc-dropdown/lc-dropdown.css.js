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

  /* ── O item saiu daqui ─────────────────────────────────────────────────────
     Antes o item era um <button class="lc-menu-item"> em light DOM, e este
     arquivo o estilizava por ::slotted(.lc-menu-item). Era o único lugar do kit
     onde um COMPONENTE dependia de uma classe: se o autor escrevesse a classe
     errada, o item aparecia sem estilo e sem responder ao clique, e nada
     acusava.

     Agora é <lc-menu-item>, que se estiliza. O que sobra aqui é só o que
     pertence ao PAINEL — o separador. Ver ADR 0001.

     (Sem backtick neste comentário de propósito: o CSS mora num template
     literal, e um backtick aqui encerraria a string e derrubaria o módulo. Foi o
     que aconteceu ao escrever este comentário — o check-syntax pegou.) */
  ::slotted(hr) {
    margin: var(--lc-space-2xs) 0;
    border: 0;
    border-top: var(--lc-border-width) solid var(--lc-color-border-quiet);
  }
}
`;
