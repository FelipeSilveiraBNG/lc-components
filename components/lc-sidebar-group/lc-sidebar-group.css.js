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

  .submenu-rotulo { display: none; }

  /* ── No trilho ───────────────────────────────────────────────────────────
     Sobra o ícone no gatilho, e o submenu vira painel flutuante. */
  :host([data-rail]) .gatilho {
    justify-content: center;
    padding-inline: 0;
    gap: 0;
  }

  :host([data-rail]) .rotulo,
  :host([data-rail]) .seta {
    display: none;
  }

  /* ── O flyout ────────────────────────────────────────────────────────────
     O MESMO elemento do submenu inline, agora no top layer. \`popover\` traz
     \`position: fixed\` e \`inset: 0\` por padrão do UA; zeramos o inset para
     que o \`top\`/\`left\` calculados em posicionar.js sejam os que valem. */
  :host([data-rail]) .submenu[popover] {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: var(--lc-space-2xs) 0;
    border: var(--lc-border-width) solid var(--lc-color-shell-border);
    border-radius: var(--lc-radius-panel);
    /* Medidos no painel: \`min-width: 236px\`, \`max-width: 290px\`,
       \`max-height: 330px\`. Um grupo de dezenove itens rola dentro do painel
       em vez de esticar até fora da tela. */
    min-inline-size: 236px;
    max-inline-size: 290px;
    max-block-size: 330px;
    overflow-y: auto;
    /* Fundo da BARRA, não do hover. O painel usa #20292e, a dois passos do
       #222d32 daqui — mas a razão de escolher este não é a semelhança: se o
       flyout usasse \`fill-raised\`, o hover do item usaria a mesma cor e
       simplesmente não existiria. */
    background: var(--lc-color-shell-fill);
    box-shadow: var(--lc-shadow-panel);
    overscroll-behavior: contain;
  }

  /* No flyout não há régua a que alinhar, então o recuo de submenu sai: os
     itens voltam ao respiro normal de uma linha de menu. */
  :host([data-rail]) .submenu[popover] ::slotted(lc-sidebar-item) {
    --recuo-submenu: var(--lc-space-m);
  }

  /* A régua não faz sentido no flyout: ali não há um gatilho acima a que
     amarrar os itens — o cabeçalho já diz de onde eles vieram. */
  :host([data-rail]) .submenu[popover]::before { content: none; }

  :host([data-rail]) .submenu-rotulo {
    display: block;
    padding: var(--lc-space-xs) var(--lc-space-m);
    color: var(--lc-color-shell-text-strong);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-s);
    font-weight: var(--lc-font-weight-semibold);
  }

  :host([data-rail]) .submenu-rotulo[hidden] { display: none; }
}
`;
