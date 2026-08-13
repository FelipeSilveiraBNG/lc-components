# ADR 0001 — Aposentar a camada de classes

**Status:** aceito · **Data:** 2026-08-13 · **Alcança:** `styles/native.css`, `components/`,
`demo/`, `test/`, `AGENTS.md`, `README.md`

## Contexto

O kit nasceu com duas formas de usar a mesma coisa. Componente onde há comportamento
(`lc-switch`, `lc-dropdown`, `lc-modal`, `lc-toast`, `lc-icon`) e **classe** onde há só
aparência: `.lc-btn`, `.lc-input`, `.lc-card`, `.lc-alert`, `.lc-badge`, `.lc-table`. A regra de
ouro nº 1 do `AGENTS.md` diz isso com todas as letras — "botão, campo, card, alert, badge e
tabela são CLASSE, não tag" — e o cabeçalho de `styles/native.css` registra a razão:

> Existe porque o alvo do kit é reproduzir telas que JÁ existem em HTML simples. Portar uma view
> do legado é renomear classe, não reescrever em componente.

Essa razão é real e continua verdadeira. A decisão abaixo a contraria de propósito.

## Decisão

**Tudo que é componente passa a ser custom element.** A camada de classes de componente sai de
`styles/native.css`. Duas exceções, justificadas adiante: a tabela e os utilitários.

## O que foi consultado, e o que ele disse

O kit declara o Web Awesome como referência de convenções (doc 09), então a pergunta foi levada
ao repositório dele antes de decidir: `shoelace-style/webawesome`, branch `next`.

**O WA não sustenta esta decisão.** Ele mantém as duas camadas de propósito:

- 68 componentes em `src/components/` — `button`, `input`, `select`, `textarea`, `card`,
  `badge`, `callout`, `dropdown-item`, entre outros;
- **e** `src/styles/native.css`, com 1.442 linhas estilizando `table`, `button`, `input`,
  `textarea` nativos, com modificadores em classe como `table.wa-hover-rows`.

A estrutura de `styles/` do lc-components — `layers.css` + `native.css` + `utilities.css` — é a do WA,
arquivo por arquivo. Portanto: **a partir deste ADR, o kit não pode mais justificar esta parte da
arquitetura apontando para o Web Awesome.** A justificativa é nossa, e está abaixo. Registrar isto
é o ponto principal deste documento: quem vier depois vai encontrar o WA fazendo o contrário e
merece saber que isso foi visto, não ignorado.

## Por que ainda assim

1. **Uma forma só de usar o kit.** Hoje quem escreve um protótipo decide, a cada elemento, se
   procura uma classe ou uma tag. A decisão não tem valor para ele — é herança de como o kit foi
   construído.
2. **Erro de uso passa a ser detectável.** `<lc-buton>` aparece na tela como texto cru e no
   console como aviso. `class="lc-bton"` não produz nada: o botão simplesmente fica sem estilo, e
   isso atravessa revisão.
3. **Estado deixa de depender de memória.** `disabled`, `invalid`, `loading` hoje exigem que o
   autor lembre de acrescentar a classe certa. Como estado interno, não há como divergir do
   comportamento.
4. **Acessibilidade fica dentro do componente.** `.lc-field` depende de o autor escrever
   `for`/`id` corretamente. Um controle que é dono do próprio rótulo não pode errar isso.

## Consequências, inclusive as ruins

Aceitas conscientemente:

- **Portar view do legado passa a ser reescrever markup**, não renomear classe. É a perda direta
  da razão citada no Contexto, e é o maior custo desta decisão.
- **Render sem JS morre.** Hoje um protótipo aparece correto com CSS apenas. Depois, nada tem
  aparência antes do upgrade dos custom elements. Ver decisão C.
- **Superfície de API muito maior.** Cada gancho visual passa a ser um `part` declarado e mantido,
  porque a regra de ouro nº 2 proíbe reestilizar por dentro. Exige lint próprio (fase 1).
- **Autofill e gerenciador de senha ficam menos previsíveis** com `input` dentro de shadow root.
  Importa se algum protótipo virar tela real de login.

Caminho de volta, se o objetivo de reproduzir telas existentes voltar a pesar mais que a
uniformidade: uma folha de compatibilidade mapeando classe antiga → tag nova. **Não** desfazer os
componentes.

## Exceção 1 — a tabela continua nativa

`<table>` não pode ser componentizada por dentro, e isso foi **medido**, não presumido. O modo de
inserção "in table" do parser HTML expulsa elemento desconhecido de dentro de `<table>`,
`<tbody>` e `<tr>`:

```
entrada:  <table><lc-row><lc-cell>A</lc-cell></lc-row></table>
saída:    <lc-row><lc-cell>A</lc-cell></lc-row><table></table>
          ↑ a linha virou IRMÃ da tabela, e a tabela ficou vazia
```

Não há polyfill: o dano acontece no parse, antes de qualquer script rodar. Custom element dentro
de `<td>` funciona — é como o `lc-dropdown` já vive na tabela hoje. O problema é só no nível de
linha e célula.

O Web Awesome chegou à mesma conclusão: não existe `wa-table`, `wa-row` nem `wa-cell` em
`src/components/`. O `wa-data-grid` que aparece na documentação não está no repositório aberto —
aparece só no changelog e numa folha de estilo da doc, o que o coloca no lado Pro.

**Portanto `.lc-table` e seus quatro modificadores permanecem.** Se um dia houver necessidade de
grid, ele entra como componente **novo** e dirigido por dados (`columns`/`rows` renderizando a
tabela no shadow root), sem tentar embrulhar `<table>` autorado.

## Exceção 2 — utilitários e tipografia continuam classe

`.lc-stack`, `.lc-row`, `.lc-grow`, `.lc-quiet`, `.lc-h1`, `.lc-h2`, `.lc-page`, `.lc-page-body`,
`.lc-clamp-*`, `.lc-visually-hidden`, `.lc-no-print`, `.lc-only-print` **não** são componentes
disfarçados — são utilitários e tipografia. `<lc-heading>` em vez de `<h1 class="lc-h1">`
destruiria o outline do documento sem devolver encapsulamento nenhum.

## Sub-decisões resolvidas

### A — a tabela

Resolvida acima: continua nativa. Fonte: o teste de parser e a ausência de componente de tabela em
`webawesome/src/components/`.

### B — quem é dono do rótulo e do erro

**`label` e `hint` como atributo _e_ slot, no próprio controle. Erro por constraint validation
nativa, não por atributo.**

O `wa-input` tem `label` e `hint` nas duas formas, com a regra explícita na doc: "If you need to
display HTML, use the label slot instead." Não existe `wa-field` envolvendo nada.

Para o erro, o WA **não** usa um atributo `error`: usa `setCustomValidity()`,
`resetValidity()` e um evento `wa-invalid`. Adotamos o mesmo, com o nome `lc-invalid`. É melhor
que a alternativa: o `.lc-error` de hoje é um `<span>` que o autor pode esquecer de sincronizar
com o estado real do campo; como validade, não pode dessincronizar.

Consequência: `.lc-field`, `.lc-label`, `.lc-error` e `.lc-hint` **desaparecem** absorvidos pelos
controles, não viram componentes próprios.

### C — o que a página mostra antes do upgrade

**Portar o utilitário de cloak do WA como `.lc-cloak`, aplicável no `<html>`.**

Implementação do WA, em `src/styles/utilities/fouce.css`:

```css
.wa-cloak:has(:not(:defined)) {
  animation: 2s step-end wa-fouce-cloak;
}
@keyframes wa-fouce-cloak {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

`step-end` segura `opacity: 0` por dois segundos e então salta para `1`. Se o JS nunca carregar, o
conteúdo aparece sozinho — **sem script**. Quando os componentes sobem,
`:has(:not(:defined))` deixa de casar e a opacidade volta na hora. Usa `opacity`, não `display`,
então não há reflow nem salto de layout.

A doc do WA declara o motivo do teto de tempo: "The two-second timeout prevents blank screens from
persisting on slow networks and pages that have errors."

Isto substitui o `lc-modal:not(:defined) { display: none }` que hoje está em `demo/docs.css`: o
modal passa a ser um caso do mecanismo geral, não um remendo pontual.

## Armadilha conhecida: o padrão de `type` do botão

O `wa-button` tem `type = 'button'` por padrão — **o oposto do `<button>` nativo**, que é
`submit`. A doc do WA é explícita: "Web Awesome components are not designed to be one-to-one
replacements for their HTML counterparts."

Se `<lc-button>` copiar esse padrão, todo `<button class="lc-btn">` que hoje submete por omissão
dentro de um `<form>` **para de submeter em silêncio** — sem erro, sem console. O codemod da fase
5 tem de escrever `type` explícito em todo botão dentro de formulário, e a suíte precisa de um
caso que pegue exatamente isso.

Sobre **como** submeter: o WA não usa `requestSubmit()`. Ele constrói um `<button>` em light DOM,
anexa ao `parentElement`, chama `.click()` e remove (`src/components/button/button.ts`, linhas
194–208). Assim o navegador faz o submit nativo inteiro, inclusive registrar o botão como
_submitter_ — que é o que leva o par `name`/`value` para o `FormData`. `requestSubmit()` sozinho
não daria isso.

## Acoplamento a resolver

`.lc-menu-item` é o único ponto onde um **componente existente depende de uma classe**:

- `components/lc-dropdown/lc-dropdown.js:78` e `:89` buscam por `.lc-menu-item`;
- `components/lc-dropdown/lc-dropdown.css.js` estiliza via `::slotted(.lc-menu-item)`.

`<lc-menu-item>` tem de sair na mesma fase que a alteração no `lc-dropdown`. O WA tem precedente:
`dropdown-item` é componente.

## Estado desta decisão no `AGENTS.md`

A regra de ouro nº 1 **continua correta hoje** e não deve ser reescrita antes da fase 5: enquanto
`<lc-button>` não existir, dizer que ele existe seria pior do que a contradição. O que foi feito
agora é acrescentar à regra 1 um ponteiro para este ADR, para que o guia não trabalhe contra a
migração enquanto ela acontece.

A regra é reescrita na fase 5, junto com a remoção das classes de `styles/native.css`.

## Fases

Sequência, portões e o que cada fase entrega estão no plano de refatoração. Resumo: (0) este ADR,
(1) lints antes dos componentes, (2) badge/alert/card, (3) button, (4) campos e menu-item,
(5) codemod, remoção e inversão da regra.
