export default /* css */ `
@layer lc-component {
  :host {
    display: block;
  }

  :host([hidden]) { display: none; }

  .base {
    display: flex;
    align-items: center;
    gap: var(--lc-space-s);
    box-sizing: border-box;
    min-height: var(--lc-shell-row-height);
    padding: 0 var(--lc-space-m);

    /* A barra de acento do item atual. Nasce transparente e do tamanho final,
       para o item não pular 3px para a direita quando vira o atual — o AdminLTE
       faz o mesmo, com \`border-left: 3px solid transparent\` no estado normal. */
    border-inline-start: 3px solid transparent;

    color: var(--lc-color-shell-text);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    text-decoration: none;
    transition: background-color var(--lc-transition-fast), color var(--lc-transition-fast);
  }

  .base:hover {
    background: var(--lc-color-shell-fill-raised);
    color: var(--lc-color-shell-text-strong);
  }

  .base:focus-visible {
    outline: 2px solid var(--lc-color-shell-accent);
    outline-offset: -2px;
  }

  /* O item ATUAL fica mais ESCURO que o fundo, não mais claro — é o que o painel
     faz, e é o que o distingue do hover sem depender de cor: um afunda, o outro
     levanta. Ver o comentário em primitivos.css. */
  :host([current]) .base {
    background: var(--lc-color-shell-fill-sunken);
    border-inline-start-color: var(--lc-color-shell-accent);
    color: var(--lc-color-shell-text-strong);
  }

  .icone {
    flex: 0 0 auto;
    font-size: var(--lc-font-size-l);
  }

  /* Sem \`name\`, o lc-icon renderiza o marcador de ausente — visível de
     propósito, para nome errado não passar batido. Mas item de submenu NÃO TEM
     ícone por desenho, e ali o marcador seria ruído. Então o que some é o
     elemento inteiro, e só quando não há nome. */
  .icone:not([name]) { display: none; }

  .rotulo {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Dentro de um grupo ──────────────────────────────────────────────────
     Recuo maior e texto mais fraco. A hierarquia do submenu é dada pelo recuo e
     pela régua vertical que o grupo desenha, não por um segundo ícone. */
  :host([data-nivel='2']) .base {
    min-height: auto;
    padding-block: var(--lc-space-xs);
    padding-inline-start: var(--lc-space-2xl);
    color: var(--lc-color-shell-text-quiet);
    font-size: var(--lc-font-size-s);
  }

  :host([data-nivel='2']) .base:hover,
  :host([data-nivel='2'][current]) .base {
    color: var(--lc-color-shell-text-strong);
  }
}
`;
