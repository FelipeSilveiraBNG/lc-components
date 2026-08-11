export default /* css */ `
@layer lc-component {
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;
    /* Herda cor e tamanho do contexto: é assim que o mesmo ícone serve a um
       botão de marca e a um texto fraco sem nenhum override. */
    color: inherit;
    vertical-align: -0.125em;
    flex: 0 0 auto;
  }

  :host([hidden]) { display: none; }

  svg {
    width: 100%;
    height: 100%;
    display: block;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Ícone inexistente NÃO renderiza vazio: renderiza marcador visível.
     O legado monta 'fa fa-{icone}' com string livre vinda do banco, e foi assim
     que 6 nomes quebrados chegaram a produção com 24 ocorrências (doc 04 §1).
     Falhar silenciosamente é como aquilo passou despercebido por anos. */
  .lc-missing {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: 1px dashed currentColor;
    border-radius: 2px;
    opacity: 0.5;
  }
}
`;
