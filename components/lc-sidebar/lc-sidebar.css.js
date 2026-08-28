export default /* css */ `
@layer lc-component {
  :host {
    /* Os dois números são medidos: são o \`--bng-sb-largura\` e o
       \`--bng-sb-rail\` da folha do painel. Ficam como padrão de custom
       property, e não como valor fixo, porque menu curto cabe em menos e
       ninguém deveria ter de sobrescrever por \`::part\`. */
    --width: 230px;
    --rail-width: 56px;

    /* ONDE A GAVETA COMEÇA, contado do alto da tela.

       Zero é a única opção honesta como PADRÃO: a barra não sabe se a tela tem
       cabeçalho, nem qual a altura dele — e descobrir isso exigiria alcançar
       fora de si, que é justamente o que a decisão de layout proíbe.

       O painel de homologação abre a gaveta SOB o cabeçalho, e reproduzir isso
       é uma linha na tela que monta o casco:

         lc-sidebar { --drawer-top: var(--lc-shell-row-height); } */
    --drawer-top: 0px;

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

  /* O TRILHO É ESTADO, NÃO ATRIBUTO — e a diferença aparece no telefone.
     \`collapsed\` é o que o consumidor pede; \`:state(rail)\` é o que a barra de
     fato faz, e na faixa da gaveta ela IGNORA o pedido: um trilho de 56px com
     flyout no hover não existe em toque. Quem calcula é o \`syncCollapsed()\`,
     que também é quem espalha o \`data-rail\` para os filhos — os dois saem da
     mesma conta, então não há como divergirem. */
  :host(:state(rail)) { inline-size: var(--rail-width); }

  :host([hidden]) { display: none; }

  /* ── A faixa da gaveta: a coluna deixa de existir ────────────────────────
     A barra continua sendo só a coluna (é a decisão de layout), e é justamente
     por isso que aqui ela vira uma coluna de largura ZERO: o \`<dialog>\` lá
     embaixo sai para o top layer e não ocupa espaço nenhum no grid, então a
     faixa \`auto\` do \`.lc-app\` colapsa e o conteúdo fica com a tela inteira.

     Sem \`display: none\` no host, que mataria o \`<dialog>\` descendente junto. */
  :host(:state(drawer)) { inline-size: 0; }

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

  /* ── A GAVETA: um <dialog> que só é caixa no telefone ────────────────────
     Fora da faixa da gaveta o \`<dialog>\` é \`display: contents\` — não gera
     caixa nenhuma, e o \`<nav>\` continua sendo filho direto do host, exatamente
     como era antes de a gaveta existir. Nenhum layout de desktop muda por causa
     de um elemento que, ali, não existe.

     POR QUE <dialog> E NÃO position: fixed. A fase 06 pedia quatro coisas —
     sobrepor o conteúdo, Esc, clique fora e FOCO PRESO. O \`showModal()\` nativo
     dá as quatro de graça, mais o \`::backdrop\` e mais o top layer, que dispensa
     inventar \`z-index\` para disputar com o cabeçalho da aplicação. Prender foco
     à mão é um laço de \`Tab\` com lista de focáveis e \`inert\` no resto da
     página: dezenas de linhas para reimplementar, pior, o que o navegador já
     faz. É a mesma escolha do \`lc-modal\`, pelo mesmo motivo.

     Não é popover: \`popover\` dá top layer e light dismiss, mas NÃO prende foco.
     O flyout do \`lc-sidebar-group\` é popover porque não precisa prender nada. */
  .gaveta {
    display: contents;
    margin: 0;
    padding: 0;
    border: 0;
    color: var(--lc-color-shell-text);
    background: var(--lc-color-shell-fill);
  }

  :host(:state(drawer)) .gaveta {
    /* Fechada é \`none\` DECLARADO, não herdado da folha do navegador: é este
       \`display\` que a transição discreta abaixo tem para animar. */
    display: none;
    position: fixed;
    /* Encostada à esquerda, da altura inteira da tela. Sem os quatro zeros do
       \`inset\` a folha do navegador centraliza o diálogo. */
    inset: var(--drawer-top) auto 0 0;
    inline-size: var(--width);
    /* MEDIDO: os quatro zeros do \`inset\` não bastam. A folha do navegador dá ao
       diálogo \`width: fit-content\` e \`height: fit-content\`, e o \`fit-content\`
       vence o par de insets — a gaveta abria com 215px de altura numa tela de
       720, do tamanho exato da lista de itens. O \`auto\` é o que devolve o
       esticamento entre os dois insets. */
    block-size: auto;
    max-inline-size: none;
    max-block-size: none;
    /* Quem rola é a lista, como na coluna. Nada precisa escapar da gaveta: o
       flyout não existe nesta faixa, porque o trilho não existe. */
    overflow: hidden;
    box-shadow: var(--lc-shadow-overlay);
    translate: -100% 0;
    /* \`allow-discrete\` é o que faz \`display\` e \`overlay\` participarem da
       transição. Sem ele a gaveta apareceria pronta, sem deslizar, e sairia da
       tela de uma vez ao fechar — o navegador tiraria o elemento do top layer
       no primeiro quadro. */
    transition:
      translate var(--lc-transition-normal),
      display var(--lc-transition-normal) allow-discrete,
      overlay var(--lc-transition-normal) allow-discrete;
  }

  :host(:state(drawer)) .gaveta[open] {
    display: block;
    translate: 0 0;
  }

  /* O estado de PARTIDA da animação de entrada. Um elemento que acaba de sair
     de \`display: none\` não tem valor anterior para o motor interpolar; é isto
     que dá um. */
  @starting-style {
    :host(:state(drawer)) .gaveta[open] { translate: -100% 0; }
  }

  /* O véu sai do \`::backdrop\` nativo — nenhum elemento a mais no shadow root,
     e nenhuma decisão de \`z-index\`: o top layer já empilha o véu logo abaixo
     da gaveta. O token é o MESMO do \`lc-modal\`, porque é o mesmo papel. */
  :host(:state(drawer)) .gaveta::backdrop {
    /* O véu começa onde a gaveta começa: com \`--drawer-top\` posto, o cabeçalho
       da aplicação fica à vista e por inteiro, como no painel.

       O \`::backdrop\` herda as custom properties do elemento que o originou,
       então o \`var()\` daqui resolve. Onde não herdasse, o valor cairia para o
       \`inset: 0\` da folha do navegador e o véu cobriria a tela toda — degrada
       para o comportamento de antes, não para nada. */
    inset-block-start: var(--drawer-top);
    background-color: transparent;
    transition:
      background-color var(--lc-transition-normal),
      display var(--lc-transition-normal) allow-discrete,
      overlay var(--lc-transition-normal) allow-discrete;
  }

  :host(:state(drawer)) .gaveta[open]::backdrop {
    background-color: var(--lc-color-surface-overlay);
  }

  @starting-style {
    :host(:state(drawer)) .gaveta[open]::backdrop { background-color: transparent; }
  }

  /* A alça não atravessa a faixa da gaveta. Ela recolhe a barra para o trilho,
     e o trilho não existe aqui — sobraria um botão turquesa flutuando sobre uma
     coluna de largura zero, o que é exatamente o que se via antes desta regra. */
  :host(:state(drawer)) .alca { display: none; }

  .base {
    display: flex;
    flex-direction: column;
    /* Ocupa a altura da coluna do grid, seja ela qual for. Sem isto a barra
       teria a altura do conteúdo e o fundo escuro pararia no meio da tela. */
    block-size: 100%;
    min-block-size: 0;
  }

  /* ── A MARCA NÃO MORA AQUI ───────────────────────────────────────────────
     Houve uma faixa de 50px no topo desta barra, com dois slots e a cor de
     marca, reproduzindo a caixa do logo do AdminLTE. Ela saiu, e o motivo
     apareceu quando a gaveta do telefone ficou pronta: ali a barra abre logo
     abaixo do cabeçalho da aplicação, que praticamente sempre traz a marca —
     e ficavam DUAS marcas a quinze pixels de distância.

     Consertar isso por dentro do componente exigiria o kit adivinhar o que a
     tela do consumidor tem no topo, que é o oposto da decisão de layout: a
     barra é só a coluna, e não palpita no cabeçalho. Então a marca passou
     inteira para o cabeçalho, que já é do consumidor, e a barra ficou sendo o
     que ela é — a lista.

     O que saiu junto: os slots \`brand\` e \`brand-collapsed\`, o
     \`::part(brand)\`, o custom state \`has-brand\` e a troca de lockup por
     monograma no trilho. Nada disso tem substituto dentro da barra, de
     propósito. */

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
     conteúdo vizinho, que está no fluxo normal.

     ── ANCORADA PELA ESQUERDA, e isto é o que faz o hover funcionar ──────────
     A âncora era \`inset-inline-end: -10px\`, que prende a aresta DIREITA. Com
     ela, crescer no hover empurraria a alça para dentro da barra, por cima do
     menu. O painel prende a esquerda (\`left: var(--bng-sb-largura)\` com
     \`margin-left: -10px\`), e é por isso que lá ela se abre sobre o conteúdo.
     Reproduzido: \`inset-inline-start: 100%\` é a borda direita da coluna, seja
     ela 230px ou 56px, e a margem negativa monta a aba sobre a borda. */
  .alca {
    position: absolute;
    inset-block-start: var(--lc-space-2xl);
    inset-inline-start: 100%;
    margin-inline-start: -10px;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: center;
    inline-size: 20px;
    block-size: 56px;
    padding: 0;
    border: 0;

    /* ── É UMA ABA, não uma pílula ─────────────────────────────────────────
       \`4px 10px 10px 4px\` no painel: canto quase reto do lado que encosta na
       barra, arredondado do lado que fica sobre o conteúdo. Fechada, em 20px, a
       diferença contra uma pílula quase não aparece; ABERTA, em 128px, aparece
       muito — a pílula viraria um estádio de 28px de raio.

       Nas quatro longhands lógicas, e não no atalho físico, porque é assim que
       o resto deste arquivo se escreve: em RTL a aba nasce do outro lado e os
       cantos precisam acompanhar. */
    border-start-start-radius: 4px;
    border-start-end-radius: 10px;
    border-end-end-radius: 10px;
    border-end-start-radius: 4px;

    /* O rótulo nasce de largura zero; sem isto ele apareceria cortado para fora
       da aba durante a abertura. */
    overflow: hidden;
    white-space: nowrap;

    background: var(--lc-color-shell-handle);
    color: var(--lc-color-shell-handle-icon);
    cursor: pointer;

    /* ── O ANEL BRANCO ────────────────────────────────────────────────────
       Dois px, e não um: é a medida do painel, que traz na própria folha o
       motivo — o turquesa dá 1,52:1 contra o \`#ecf0f5\` do conteúdo, e sem o
       anel a aba não tem contorno nenhum.

       É \`box-shadow\` e não \`border\`: borda entraria na caixa e comeria 4px
       dos 20px de largura da aba, apertando o ícone. O spread do box-shadow
       cresce para FORA sem mexer no layout — e é assim no painel também.

       As duas camadas vêm na MESMA declaração, na ordem do painel: o anel
       primeiro, encostado na aba, e a sombra depois, caindo por fora dele. Trocar
       a ordem poria a sombra por baixo do anel e ela desapareceria. */
    box-shadow:
      0 0 0 2px var(--lc-color-shell-handle-ring),
      var(--lc-shadow-shell-handle);

    /* Animar a largura DA ALÇA é seguro, ao contrário de animar a do host: ela
       é \`position: absolute\`, não é item do grid, e portanto não realimenta a
       faixa \`auto\` que congelava a barra em 230px (ver o bloco lá em cima). */
    transition:
      inline-size var(--lc-transition-fast),
      padding var(--lc-transition-fast),
      background-color var(--lc-transition-fast);
  }

  /* ── O hover, que é o mesmo gesto com dois rótulos ────────────────────────
     A aba se abre de 20px para 128px, escurece o turquesa e revela o que o
     clique vai fazer: "Recolher" quando a barra está aberta, "Expandir" quando
     está no trilho. Os dois estados usam a mesma animação; o que muda é a
     palavra, e quem a troca é o \`syncCollapsed()\` no JS — o CSS não sabe
     escrever texto.

     \`:focus-visible\` abre igual, de propósito: quem chega pelo Tab precisa
     ler o rótulo tanto quanto quem chega pelo mouse. E é \`focus-visible\` e não
     \`focus\` porque depois de um clique de mouse o foco FICA na alça — com
     \`:focus\` o rótulo ficaria aberto por cima do flyout do trilho. O painel
     tem exatamente essa nota na folha dele, achada em teste ao vivo. */
  .alca:hover,
  .alca:focus-visible {
    inline-size: 128px;
    justify-content: flex-start;
    padding-inline-start: 4px;
    background: var(--lc-color-shell-handle-hover);
  }

  .alca:focus-visible {
    outline: 2px solid var(--lc-color-shell-handle);
    /* 3px, não 2: o anel branco já ocupa os dois primeiros. */
    outline-offset: 3px;
  }

  .alca-rotulo {
    /* Fechado é largura zero, não \`display: none\`: só assim há o que animar. */
    max-inline-size: 0;
    opacity: 0;
    overflow: hidden;
    margin-inline-start: 0;
    font-size: var(--lc-font-size-s);
    font-weight: var(--lc-font-weight-semibold);
    transition:
      max-inline-size var(--lc-transition-fast),
      opacity var(--lc-transition-fast),
      margin-inline-start var(--lc-transition-fast);
  }

  .alca:hover .alca-rotulo,
  .alca:focus-visible .alca-rotulo {
    max-inline-size: 100px;
    opacity: 1;
    margin-inline-start: var(--lc-space-xs);
  }

  .alca-icone {
    font-size: var(--lc-font-size-s);
    flex: none;
    /* Expandida, a seta aponta para dentro (recolher); recolhida, para fora. */
    transform: rotate(180deg);
    transition: transform var(--lc-transition-fast);
  }

  :host(:state(rail)) .alca-icone { transform: rotate(0deg); }

  @media (prefers-reduced-motion: reduce) {
    .alca, .alca-icone, .alca-rotulo { transition: none; }
    /* A gaveta ainda precisa de \`display\` e \`overlay\` na transição — sem eles
       ela volta a ser removida do top layer no primeiro quadro do fechamento.
       O que sai é só o DESLIZE, que é o que incomoda quem pediu menos
       movimento. Duração zero em vez de \`transition: none\`. */
    :host(:state(drawer)) .gaveta,
    :host(:state(drawer)) .gaveta::backdrop {
      transition:
        display 0s allow-discrete,
        overlay 0s allow-discrete;
    }
  }
}
`;
