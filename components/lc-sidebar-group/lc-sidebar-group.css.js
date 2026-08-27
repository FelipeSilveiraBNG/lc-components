export default /* css */ `
@layer lc-component {
  :host { display: block; }
  :host([hidden]) { display: none; }

  .gatilho {
    display: flex;
    align-items: center;
    gap: var(--lc-space-s);
    box-sizing: border-box;
    width: 100%;
    min-height: var(--lc-shell-row-height);
    padding: 0 var(--lc-space-m);

    /* Mesmo acento do lc-sidebar-item, e pelo mesmo motivo: nasce transparente
       e do tamanho final, para a linha não pular quando o grupo abre. */
    border: 0;
    border-inline-start: 3px solid transparent;

    background: none;
    color: var(--lc-color-shell-text);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    text-align: start;
    cursor: pointer;
    transition: background-color var(--lc-transition-fast), color var(--lc-transition-fast);
  }

  .gatilho:hover {
    background: var(--lc-color-shell-fill-raised);
    color: var(--lc-color-shell-text-strong);
  }

  .gatilho:focus-visible {
    outline: 2px solid var(--lc-color-shell-accent);
    outline-offset: -2px;
  }

  /* Grupo ABERTO usa o mesmo tratamento do item atual — afunda e ganha acento.
     No painel é assim, e faz sentido: um grupo aberto É onde você está. */
  :host(:state(open)) .gatilho {
    background: var(--lc-color-shell-fill-sunken);
    border-inline-start-color: var(--lc-color-shell-accent);
    color: var(--lc-color-shell-text-strong);
  }

  .icone {
    flex: 0 0 auto;
    font-size: var(--lc-font-size-l);
  }
  .icone:not([name]) { display: none; }

  .rotulo {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .seta {
    flex: 0 0 auto;
    font-size: var(--lc-font-size-s);
    transition: transform var(--lc-transition-fast);
  }

  /* A seta aponta para a direita fechada e para baixo aberta. Girar o mesmo
     ícone em vez de trocar por \`chevron-down\` mantém o movimento contínuo e
     evita um segundo nome para manter em dia. */
  :host(:state(open)) .seta { transform: rotate(90deg); }

  @media (prefers-reduced-motion: reduce) {
    .gatilho, .seta { transition: none; }
  }

  /* ── O submenu ───────────────────────────────────────────────────────────
     Fundo mais claro que a barra, com uma régua vertical amarrando os itens —
     é o que o painel faz, e é o que diz "estes pertencem àquele" sem recorrer a
     mais recuo ainda. */
  .submenu {
    position: relative;
    background: var(--lc-color-shell-fill-raised);
  }

  .submenu[hidden] { display: none; }

  .submenu::before {
    content: '';
    position: absolute;
    inset-block: 0;
    /* Alinhada com o centro do ícone do gatilho: 3px de acento + 16px de padding
       + metade dos 16px do ícone. Números do próprio layout, não escolhidos. */
    inset-inline-start: calc(3px + var(--lc-space-m) + var(--lc-font-size-l) / 2);
    width: var(--lc-border-width);
    background: var(--lc-color-shell-border);
  }
}
`;
