export default /* css */ `
@layer lc-component {
  :host {
    display: inline-block;
    /* O SVG é bloco lá embaixo, então não há gap de descendente para matar;
       o vertical-align existe para o logo sentar bem quando estiver na mesma
       linha que um texto (cabeçalho com nome do sistema ao lado, p. ex.). */
    vertical-align: middle;

    /* ----------------------------------------------------------------------
       AS CORES DA MARCA SÃO LITERAIS AQUI, E ISSO É DELIBERADO.

       A regra do kit é que componente lê contrato (--lc-color-*) e nunca
       primitivo nem hex solto — está escrita no topo do lc.css. O logo é a
       exceção, e é exceção por um motivo que vale para qualquer design
       system: as cores dele não são APARÊNCIA, são IDENTIDADE. Um logo que
       muda de cor quando a página troca de tema deixou de ser o logo.

       Por isso nenhum valor daqui vem de token, nem mesmo o branco do
       negativo (--lc-color-text-inverse resolveria para #fff nos dois temas
       hoje, mas é token de TEXTO: se um tema o mudasse para um branco
       quebrado, o logo seguiria junto, e não deveria).

       Os dois hex de cor estão registrados também em tokens/primitivos.css,
       como --lc-_brand-blue e --lc-_brand-turquoise, com o contraste medido.
       Lá é catálogo da marca; aqui é a marca desenhada. Se o brandbook mudar,
       os dois lugares mudam — são um valor cada, e este comentário é o que
       liga um ao outro.
       ---------------------------------------------------------------------- */
    --symbol-color: #003cff;
    --wordmark-color: #3cdbc0;
  }

  :host([hidden]) { display: none; }

  /* A mini é monocromática: o letreiro miúdo em turquesa não teria contraste
     nenhum no tamanho em que ela é usada. É assim que vem do Figma. */
  :host([variant='mini']) {
    --wordmark-color: #003cff;
  }

  /* Negativo: peça inteira em branco, para fundo escuro ou tintado. As duas
     variantes negativas dividem esta regra porque a pintura é a mesma; o que
     muda entre elas é só a geometria, e essa quem escolhe é o JS. */
  :host([variant='negative']),
  :host([variant='mini-negative']) {
    --symbol-color: #ffffff;
    --wordmark-color: #ffffff;
  }

  /* O logo é medido por ALTURA, não por largura: as duas geometrias têm
     proporções muito diferentes (4,36:1 na horizontal, 1,32:1 na mini) e
     altura é o que faz as duas conviverem numa mesma barra. A largura sai
     sozinha da razão do viewBox.

     O padrão em \`em\` é o mesmo espírito do lc-icon: sem nenhum override, o
     logo acompanha a tipografia do contexto em que foi posto. */
  svg {
    display: block;
    height: var(--height, 2em);
    width: auto;
  }

  .simbolo { fill: var(--symbol-color); }
  .letreiro { fill: var(--wordmark-color); }
}
`;
