/*
 * Cromo compartilhado por lc-input, lc-select e lc-textarea: rótulo, controle,
 * dica e mensagem de erro.
 *
 * Uma folha para os três porque o cromo é idêntico. Triplicar isto seria repetir
 * exatamente o defeito que o ADR 0001 combate na camada de classes: a mesma
 * decisão escrita em três lugares, divergindo na primeira alteração.
 */
export default /* css */ `
@layer lc-component {
  :host {
    display: block;
    margin-bottom: var(--lc-space-m);
  }

  :host([hidden]) { display: none; }

  .rotulo {
    display: block;
    margin-bottom: var(--lc-space-2xs);
    color: var(--lc-color-text-normal);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-s);
    font-weight: var(--lc-font-weight-semibold);
    cursor: pointer;
  }

  /* Rótulo vazio não deve reservar espaço nem virar alvo de clique. Mesmo
     mecanismo do lc-card: :state() ligado pelo componente. */
  :host(:not(:state(has-label))) .rotulo { display: none; }

  .control {
    box-sizing: border-box;
    width: 100%;
    min-height: var(--lc-control-height);
    padding: 0 var(--lc-control-padding-x);
    border: var(--lc-border-width) solid var(--lc-color-border-normal);
    border-radius: var(--lc-radius-field);
    background: var(--lc-color-surface-card);
    color: var(--lc-color-text-normal);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    line-height: var(--lc-line-height-normal);
    transition:
      border-color var(--lc-transition-fast),
      box-shadow var(--lc-transition-fast);
  }

  .control::placeholder {
    color: var(--lc-color-text-quiet);
  }

  .control:focus-visible {
    outline: var(--lc-focus-ring-width) solid var(--lc-focus-ring-color);
    outline-offset: var(--lc-focus-ring-offset);
  }

  .control:disabled {
    background: var(--lc-color-surface-sunken);
    cursor: not-allowed;
  }

  /* ── Tamanho compacto ─────────────────────────────────────────────────────
     Existe por causa de UMA tela real: a linha de filtro no cabeçalho das
     tabelas do painel, onde o campo precisa caber na altura da célula. Medido
     lá: 30px de altura e 10px de padding — que são exatamente
     \`--lc-control-height-sm\` e \`--lc-space-s\`, os mesmos que o lc-button já
     usa em \`size="small"\`.

     A fonte medida é 13px e aqui fica 12px (\`--lc-font-size-s\`). É de
     propósito: 1px não é visível e um token novo por causa dele não se paga. */
  :host([size='small']) .control {
    min-height: var(--lc-control-height-sm);
    padding: 0 var(--lc-space-s);
    font-size: var(--lc-font-size-s);
  }

  :host([size='small']) .textarea {
    padding: var(--lc-space-3xs) var(--lc-space-s);
  }

  /* Borda de erro sai de :state(invalid), não de uma classe que o autor
     acrescenta — é a decisão B do ADR 0001. */
  :host(:state(invalid)) .control {
    border-color: var(--lc-color-danger-border);
  }

  .dica,
  .erro {
    display: block;
    margin-top: var(--lc-space-3xs);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-xs);
  }

  .dica {
    color: var(--lc-color-text-quiet);
  }

  .erro {
    display: none;
    color: var(--lc-color-danger-text);
  }

  :host(:not(:state(has-hint))) .dica { display: none; }

  /* A mensagem de erro SUBSTITUI a dica quando aparece: as duas juntas empilham
     texto pequeno no mesmo lugar e o usuário lê a errada primeiro. */
  :host(:state(invalid)) .erro { display: block; }
  :host(:state(invalid)) .dica { display: none; }

  .textarea {
    min-height: calc(var(--lc-control-height) * 2.5);
    padding: var(--lc-space-xs) var(--lc-control-padding-x);
    resize: vertical;
  }
}
`;
