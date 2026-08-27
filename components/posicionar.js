/*
 * posicionar() — coloca um painel de top layer ao lado de uma âncora.
 *
 * Nasceu do `lc-dropdown`, onde era um método privado, e saiu de lá quando o
 * `lc-sidebar-group` precisou do MESMO comportamento noutra direção: o flyout do
 * trilho abre à direita, o menu do dropdown abre embaixo.
 *
 * A alternativa seria o grupo instanciar um `lc-dropdown` inteiro. Não encaixa:
 * os mesmos itens precisam renderizar INLINE quando a barra está expandida e
 * FLUTUANTE quando recolhida, e o dropdown é dono do próprio painel — não há
 * como pedir que ele empreste só a colocação. Então o que se compartilha é o
 * cálculo, que é a parte que ninguém quer escrever duas vezes.
 *
 * Trabalha em coordenadas de VIEWPORT, porque é assim que o top layer funciona:
 * o painel já saiu do fluxo e não tem contêiner de posicionamento.
 *
 * NÃO usa a Anchor Positioning API. Ela resolveria isto em CSS puro, mas ainda
 * não existe no Firefox nem no Safari — e uma barra de navegação que só se
 * posiciona no Chrome não serve para protótipo que vai ser aberto em qualquer
 * lugar.
 */

/** Respiro mínimo entre o painel e a borda da janela. */
const MARGEM = 8;

/**
 * @param {HTMLElement} painel   já no top layer, para a medida sair certa
 * @param {DOMRect} ancora       retângulo de quem o painel acompanha
 * @param {object} [opcoes]
 * @param {string} [opcoes.placement] `bottom-start` (padrão), `bottom-end`,
 *   `top-start`, `top-end` ou `right-start`
 * @param {number} [opcoes.distance] respiro entre âncora e painel, em px
 */
export function posicionar(painel, ancora, opcoes = {}) {
  const { placement = 'bottom-start', distance = 4 } = opcoes;
  const { width, height } = painel.getBoundingClientRect();
  const [lado, alinhamento] = placement.split('-');

  let top;
  let left;

  if (lado === 'right') {
    /* Flyout do trilho: encosta no topo da linha que o abriu, para o primeiro
       item do painel ficar na altura do ícone que o usuário está olhando. */
    top = ancora.top;
    left = ancora.right + distance;

    /* Sem espaço à direita, vira para a esquerda. Acontece com a barra ancorada
       à direita da tela, ou numa janela muito estreita. */
    if (left + width > innerWidth - MARGEM) left = ancora.left - width - distance;

    /* Aqui o clamp vertical é necessário: o flyout de um item lá embaixo do
       trilho estouraria a janela, porque ele nasce alinhado ao topo da linha. */
    top = Math.max(MARGEM, Math.min(top, innerHeight - height - MARGEM));
  } else {
    top = lado === 'top' ? ancora.top - height - distance : ancora.bottom + distance;

    /* Não cabe embaixo e cabe em cima → vira. Mesma regra do dropdown desde o
       v0.1, e o motivo dela é a última linha de tabela que rola. */
    if (lado !== 'top' && top + height > innerHeight - MARGEM && ancora.top - height - distance > MARGEM) {
      top = ancora.top - height - distance;
    }
    top = Math.max(MARGEM, top);

    left = alinhamento === 'end' ? ancora.right - width : ancora.left;
  }

  left = Math.max(MARGEM, Math.min(left, innerWidth - width - MARGEM));

  painel.style.top = `${top}px`;
  painel.style.left = `${left}px`;
}
