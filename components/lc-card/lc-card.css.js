export default /* css */ `
@layer lc-component {
  :host {
    display: block;
    margin-bottom: var(--lc-space-l);
  }

  :host([hidden]) { display: none; }

  .base {
    box-sizing: border-box;
    border: var(--lc-border-width) solid var(--lc-color-border-quiet);
    /* A barra de acento no topo é o que o \`.box\` do AdminLTE usa para sinalizar
       variante de contêiner. A largura é token porque os dois temas dão peso
       diferente a ela. */
    border-top: var(--lc-accent-bar-width) solid var(--lc-color-border-normal);
    border-radius: var(--lc-radius-card);
    background: var(--lc-color-surface-card);
    box-shadow: var(--lc-shadow-card);
  }

  :host([variant='brand']) .base { border-top-color: var(--lc-color-brand-border); }
  :host([variant='success']) .base { border-top-color: var(--lc-color-success-border); }
  :host([variant='warning']) .base { border-top-color: var(--lc-color-warning-border); }
  :host([variant='danger']) .base { border-top-color: var(--lc-color-danger-border); }

  /* Cabeçalho e rodapé nascem ESCONDIDOS e só aparecem quando o slot recebe
     conteúdo. Na camada de classes, card sem cabeçalho deixava uma faixa vazia
     com borda se o autor escrevesse a div — e escrever a div era o caminho de
     menor resistência. Aqui não há como errar.

     Por que \`:state()\` e não \`:has()\`: \`:host(:has([slot='header']))\` é
     INVÁLIDO. Medido no Chromium — \`CSS.supports('selector(:host(:has(a)))')\`
     é false e o navegador descarta a regra inteira em silêncio, sem erro de
     console. \`:has()\` solto funciona; dentro de \`:host()\`, não. O kit já usa
     \`:state()\` no lc-switch e no lc-dropdown pelo mesmo motivo: estado interno
     que o CSS precisa ler não é atributo que o consumidor declara.

     Nascer escondido também evita o flash da faixa vazia antes do slotchange. */
  .cabecalho {
    display: none;
    align-items: center;
    justify-content: space-between;
    gap: var(--lc-space-s);
    padding: var(--lc-space-s) var(--lc-space-m);
    border-bottom: var(--lc-border-width) solid var(--lc-color-border-quiet);
    color: var(--lc-color-text-normal);
    font-family: var(--lc-font-family-heading);
    font-size: var(--lc-font-size-xl);
    font-weight: var(--lc-font-weight-semibold);
  }

  .corpo {
    padding: var(--lc-space-m);
    color: var(--lc-color-text-normal);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    line-height: var(--lc-line-height-normal);
  }

  .rodape {
    display: none;
    align-items: center;
    gap: var(--lc-space-s);
    padding: var(--lc-space-s) var(--lc-space-m);
    border-top: var(--lc-border-width) solid var(--lc-color-border-quiet);
  }

  :host(:state(has-header)) .cabecalho,
  :host(:state(has-footer)) .rodape {
    display: flex;
  }

}
`;
