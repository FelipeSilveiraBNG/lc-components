export default /* css */ `
@layer lc-component {
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) { display: none; }

  .base {
    display: inline-flex;
  }

  /* ── Como o grupo achata as junções sem alcançar o shadow do botão ──────────
     A regra de ouro nº 2 proíbe reestilizar componente por dentro, e \`::slotted()\`
     não atravessa o shadow boundary do elemento slotado — dá para estilizar o
     HOST do botão, não o \`.base\` dentro dele, que é quem tem o raio.

     Custom property, porém, ATRAVESSA: herda pela árvore achatada. Então o grupo
     zera \`--raio-inicio\`/\`--raio-fim\` no host e o CSS do lc-button, que já lê
     essas variáveis, obedece. É acoplamento — mas declarado nos dois JSDoc, e a
     alternativa (o grupo escrevendo atributo no light DOM dos filhos) seria pior.

     Vale para qualquer filho, não só \`lc-button\`: um \`lc-dropdown\` no meio de
     um grupo continua funcionando. */
  ::slotted(*:not(:first-child)) {
    --raio-inicio: 0;
    /* Sobrepõe as bordas adjacentes para não virar linha dupla. */
    margin-inline-start: calc(-1 * var(--lc-border-width));
  }

  ::slotted(*:not(:last-child)) {
    --raio-fim: 0;
  }

  /* O botão sob o cursor sobe, senão a borda dele fica escondida pelo vizinho. */
  ::slotted(*:hover) {
    z-index: 1;
  }
}
`;
