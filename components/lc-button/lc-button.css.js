export default /* css */ `
@layer lc-component {
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) { display: none; }
  :host([block]) { display: flex; width: 100%; }

  .base {
    /* ── Fundo de hover por CUSTOM PROPERTY, e não uma regra por variante ─────
       Esta é a lição de um bug real do kit: as regras de hover eram uma por
       variante (\`.lc-btn--brand:hover\`) e disputavam especificidade com a regra
       genérica (\`.lc-btn:hover\`). A genérica tinha uma guarda \`:not()\` a mais,
       valia 4 contra 3, e VENCIA — todo botão sólido ficava cinza-claro no hover
       com o texto ainda branco: 1,07:1 no legacy, 1,10:1 no modern. O botão
       desaparecia, nos dois temas, porque a causa era cascata e não token.

       Aqui existe UMA regra de hover, lá embaixo, lendo esta variável. Cada
       variante só troca o valor. Não há disputa possível, e acrescentar variante
       nova não pode reintroduzir o defeito. */
    --fundo-hover: var(--lc-color-neutral-fill-quiet);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--lc-space-2xs);
    box-sizing: border-box;
    width: 100%;
    min-height: var(--lc-control-height);
    padding: 0 var(--lc-control-padding-x);
    border: var(--lc-border-width) solid var(--lc-color-border-loud);

    /* ── Raio por lado, com o padrão no FALLBACK do var() ─────────────────────
       O lc-button-group achata as junções zerando \`--raio-inicio\`/\`--raio-fim\`
       no host via \`::slotted\` — custom property atravessa o shadow boundary,
       seletor não.

       O padrão TEM de morar no fallback, e não numa declaração aqui. MEDIDO: com
       \`--raio-inicio: var(--lc-radius-control)\` declarado no \`.base\`, a
       declaração local vence o valor herdado do host e o grupo não conseguia
       achatar nada — o raio do botão do meio continuava 4px. Com o fallback, só
       existe declaração quando alguém de fora decide. */
    border-start-start-radius: var(--raio-inicio, var(--lc-radius-control));
    border-end-start-radius: var(--raio-inicio, var(--lc-radius-control));
    border-start-end-radius: var(--raio-fim, var(--lc-radius-control));
    border-end-end-radius: var(--raio-fim, var(--lc-radius-control));
    background: var(--lc-color-surface-card);
    color: var(--lc-color-text-normal);
    font-family: var(--lc-font-family);
    font-size: var(--lc-font-size-m);
    font-weight: var(--lc-font-weight-medium);
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background var(--lc-transition-fast),
      border-color var(--lc-transition-fast),
      color var(--lc-transition-fast);
  }

  /* ── Variantes sólidas ──────────────────────────────────────────────────── */
  :host([variant='brand']) .base {
    border-color: transparent;
    background: var(--lc-color-brand-fill-normal);
    color: var(--lc-color-brand-on-loud);
    --fundo-hover: var(--lc-color-brand-fill-loud);
  }

  :host([variant='success']) .base {
    border-color: transparent;
    background: var(--lc-color-success-fill-normal);
    color: var(--lc-color-success-on-loud);
    --fundo-hover: var(--lc-color-success-fill-loud);
  }

  :host([variant='warning']) .base {
    border-color: transparent;
    background: var(--lc-color-warning-fill-normal);
    color: var(--lc-color-warning-on-loud);
    --fundo-hover: var(--lc-color-warning-fill-loud);
  }

  :host([variant='danger']) .base {
    border-color: transparent;
    background: var(--lc-color-danger-fill-normal);
    color: var(--lc-color-danger-on-loud);
    --fundo-hover: var(--lc-color-danger-fill-loud);
  }

  /* Hierarquia por forma, não por tinta — o antigo \`.lc-btn--quiet\`. */
  :host([appearance='plain']) .base {
    border-color: transparent;
    background: transparent;
    color: var(--lc-color-brand-text);
    --fundo-hover: var(--lc-color-brand-fill-quiet);
  }

  /* ── Tamanhos ───────────────────────────────────────────────────────────── */
  :host([size='small']) .base {
    min-height: var(--lc-control-height-sm);
    padding: 0 var(--lc-space-s);
    font-size: var(--lc-font-size-s);
  }

  :host([size='large']) .base {
    min-height: var(--lc-control-height-lg);
    padding: 0 var(--lc-space-l);
    font-size: var(--lc-font-size-xl);
  }

  /* ── A ÚNICA regra de hover ─────────────────────────────────────────────── */
  :host(:not([disabled]):not([aria-disabled='true'])) .base:hover {
    background: var(--fundo-hover);
  }

  /* ── Desabilitado ───────────────────────────────────────────────────────────
     As duas formas: \`disabled\` nativo e \`aria-disabled\`, para o caso em que o
     botão precisa continuar focável e anunciável. */
  :host([disabled]) .base,
  :host([aria-disabled='true']) .base {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .base:focus-visible {
    outline: var(--lc-focus-ring-width) solid var(--lc-focus-ring-color);
    outline-offset: var(--lc-focus-ring-offset);
  }
}
`;
