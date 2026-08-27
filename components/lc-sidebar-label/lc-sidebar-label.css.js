export default /* css */ `
@layer lc-component {
  :host { display: block; }
  :host([hidden]) { display: none; }

  /* No trilho o rótulo some. "MENU" em 56px de largura vira duas letras e meia,
     e o que sobra não é rótulo de coisa nenhuma. O painel faz o mesmo. */
  :host([data-rail]) { display: none; }

  .base {
    padding: var(--lc-space-s) var(--lc-space-m) var(--lc-space-xs);
    color: var(--lc-color-shell-text-quiet);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-xs);
    font-weight: var(--lc-font-weight-bold);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    /* O texto não quebra nem estica a coluna: rótulo longo é corte, não
       reflow. A barra tem largura fixa e a lista inteira depende disso. */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
`;
