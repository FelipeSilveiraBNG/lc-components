export default /* css */ `
@layer lc-component {
  :host {
    /* Os dois números são medidos: são o \`--bng-sb-largura\` e o
       \`--bng-sb-rail\` da folha do painel. Ficam como padrão de custom
       property, e não como valor fixo, porque menu curto cabe em menos e
       ninguém deveria ter de sobrescrever por \`::part\`. */
    --width: 230px;
    --rail-width: 56px;

    display: block;
    /* Âncora da alça, que fica montada sobre a borda direita. */
    position: relative;
    inline-size: var(--width);
    /* SEM ISTO O TRILHO NÃO ENCOLHE. Item de grid nasce com \`min-width: auto\`,
       que é um piso de CONTEÚDO: a coluna \`auto\` do \`.lc-app\` não desce abaixo
       do que a lista mede, e a largura declarada aqui é simplesmente ignorada.

       Medido: com \`collapsed\` posto e \`--rail-width\` valendo 56px, a barra
       continuava em 230px — e continuava mesmo forçando \`inline-size\` por
       style inline, que foi o que mostrou que a regra não era a culpada. */
    min-inline-size: 0;
    flex: 0 0 auto;
    background: var(--lc-color-shell-fill);
    color: var(--lc-color-shell-text);
  }

  :host([collapsed]) { inline-size: var(--rail-width); }

  :host([hidden]) { display: none; }

  /* ── A largura NÃO é animada, e isso foi decidido depois de medir ─────────
     O \`legacy.css\` define \`--lc-transition-normal\` com o comentário "recolher
     sidebar", então a animação estava prevista desde o começo. Ela não
     funciona aqui, e o modo como falha é pior do que não ter:

     com \`transition: inline-size\` no host, a barra recolhida FICAVA EM 230px
     para sempre. Não é lentidão — medi em 50, 150, 320, 600 e 1200ms depois do
     clique, e o valor nunca saía do inicial. Sem a transição, o mesmo clique
     dá 56px na hora.

     A causa é circular: o host é item de uma faixa \`auto\`, e a faixa se
     dimensiona pela contribuição do item. Animar a largura do item muda a
     contribuição a cada quadro, que muda a faixa, que muda o espaço
     disponível. O motor resolve congelando.

     Animar a FAIXA em vez do item resolveria, mas exigiria que o \`.lc-app\`
     soubesse as duas larguras — e aí o utilitário de layout passaria a
     depender de um componente. A troca instantânea é o preço, e é barato:
     o conteúdo que reflui já dá o retorno visual. */

  .base {
    display: flex;
    flex-direction: column;
    /* Ocupa a altura da coluna do grid, seja ela qual for. Sem isto a barra
       teria a altura do conteúdo e o fundo escuro pararia no meio da tela. */
    block-size: 100%;
    min-block-size: 0;
  }

  /* ── A faixa da marca ────────────────────────────────────────────────────
     Nasce escondida e só aparece com conteúdo em algum dos dois slots, como o
     cabeçalho do lc-card — pela mesma razão: faixa vazia com cor é o defeito
     que ninguém nota até estar publicado. */
  .marca {
    display: none;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    block-size: 50px;
    padding-inline: var(--lc-space-s);
    background: var(--lc-color-brand-fill-loud);
    overflow: hidden;
  }

  :host(:state(has-brand)) .marca { display: flex; }

  /* A troca da marca é por SLOT, não por mágica: a barra não alcança o
     \`lc-logo\` de ninguém para trocar a variante dele. O consumidor põe as duas
     peças e o CSS mostra uma de cada vez.

     Quem não puser a segunda fica com faixa vazia no trilho — visível, e
     preferível a um lockup de 449 unidades espremido em 56px. */
  :host(:not([collapsed])) slot[name='brand-collapsed'],
  :host([collapsed]) slot[name='brand'] {
    display: none;
  }

  /* ── A lista ─────────────────────────────────────────────────────────────
     É ela que rola, não a página: uma barra de dezessete linhas não cabe em
     laptop, e rolar a página inteira para achar o último item é pior do que
     rolar só a coluna. */
  .menu {
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    /* No trilho a rolagem horizontal não existe: o conteúdo é do tamanho da
       coluna. Sem isto, a transição de largura mostraria uma barra horizontal
       piscando no meio do caminho. */
    overflow-x: hidden;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: var(--lc-color-shell-border) transparent;
  }

  /* ── A alça ──────────────────────────────────────────────────────────────
     Montada SOBRE a borda direita, metade para dentro e metade para fora, como
     no painel. Turquesa da marca nos dois temas — é o único ponto de turquesa
     do tema legacy, e é assim que está no ar hoje.

     \`z-index\` não resolve sobreposição com painel de top layer, e nem
     precisa: a alça não disputa com nada: ela só precisa ficar acima do
     conteúdo vizinho, que está no fluxo normal. */
  .alca {
    position: absolute;
    inset-block-start: var(--lc-space-2xl);
    inset-inline-end: -10px;
    z-index: 1;

    display: grid;
    place-items: center;
    inline-size: 20px;
    block-size: 56px;
    padding: 0;
    border: 0;
    border-radius: var(--lc-radius-pill);

    background: var(--lc-color-shell-handle);
    color: var(--lc-color-shell-handle-icon);
    cursor: pointer;
    transition: background-color var(--lc-transition-fast);
  }

  .alca:hover { background: var(--lc-color-shell-handle-hover); }

  .alca:focus-visible {
    outline: 2px solid var(--lc-color-shell-handle);
    outline-offset: 2px;
  }

  .alca-icone {
    font-size: var(--lc-font-size-s);
    /* Expandida, a seta aponta para dentro (recolher); recolhida, para fora. */
    transform: rotate(180deg);
    transition: transform var(--lc-transition-fast);
  }

  :host([collapsed]) .alca-icone { transform: rotate(0deg); }

  @media (prefers-reduced-motion: reduce) {
    .alca, .alca-icone { transition: none; }
  }
}
`;
