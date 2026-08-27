export default /* css */ `
@layer lc-component {
  :host {
    /* 230px é medido: é o \`--bng-sb-largura\` da folha do painel. Fica como
       padrão de uma custom property, e não como valor fixo, porque menu curto
       cabe em menos e ninguém deveria ter de sobrescrever por \`::part\`. */
    --width: 230px;

    display: block;
    inline-size: var(--width);
    flex: 0 0 auto;
    background: var(--lc-color-shell-fill);
    color: var(--lc-color-shell-text);
  }

  :host([hidden]) { display: none; }

  .base {
    display: flex;
    flex-direction: column;
    /* Ocupa a altura da coluna do grid, seja ela qual for. Sem isto a barra
       teria a altura do conteúdo e o fundo escuro pararia no meio da tela. */
    block-size: 100%;
    min-block-size: 0;
  }

  /* ── A faixa da marca ────────────────────────────────────────────────────
     Nasce escondida e só aparece com conteúdo no slot, como o cabeçalho do
     lc-card — pela mesma razão: faixa vazia com cor é o defeito que ninguém
     nota até estar publicado. */
  .marca {
    display: none;
    align-items: center;
    box-sizing: border-box;
    block-size: 50px;
    padding-inline: var(--lc-space-s);
    background: var(--lc-color-brand-fill-loud);
    overflow: hidden;
  }

  :host(:state(has-brand)) .marca { display: flex; }

  /* ── A lista ─────────────────────────────────────────────────────────────
     É ela que rola, não a página: uma barra de dezessete linhas não cabe em
     laptop, e rolar a página inteira para achar o último item é pior do que
     rolar só a coluna. */
  .menu {
    flex: 1 1 auto;
    min-block-size: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  /* Barra de rolagem discreta sobre o fundo escuro. A padrão do sistema é
     desenhada para fundo claro e vira um risco branco aqui. */
  .menu {
    scrollbar-width: thin;
    scrollbar-color: var(--lc-color-shell-border) transparent;
  }
}
`;
