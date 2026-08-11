# lc-bricks — guia para agentes de IA

Como **consumir** o lc-bricks ao gerar protótipo do BNG LinkCare. Leia antes de escrever
qualquer HTML.

(Formato herdado do `me-bricks`, onde esse arquivo é o que mais evita HTML errado de primeira.
O Web Awesome faz o equivalente publicando uma skill junto do pacote.)

## Setup obrigatório de toda página

```html
<!doctype html>
<html lang="pt-BR" data-lc-theme="legacy">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Protótipo — BNG LinkCare</title>
    <link rel="stylesheet" href="../lc.css" />
    <script type="module" src="../components/loader.js"></script>
  </head>
  <body class="lc">
    <div class="lc-page-body">…</div>
  </body>
</html>
```

Ajuste os caminhos relativos conforme a pasta. **A página precisa ser servida por HTTP**
(`npx serve .`) — ES modules não funcionam em `file://`.

`class="lc"` no `<body>` é o que aplica fundo, cor e tipografia do tema. Sem ela a página fica
branca com Times New Roman.

## Regras de ouro

1. **Botão, campo, card, alert, badge e tabela são CLASSE, não tag.** Não existe
   `<lc-button>`. Use `<button class="lc-btn">`. Componente só onde há comportamento.
2. **Nunca reestilize componente por dentro.** Use atributo, `::part()` ou a custom property
   documentada no JSDoc do componente.
3. **Tag custom nunca é self-closing.** `<lc-icon name="x"></lc-icon>`, jamais `<lc-icon />` —
   o parser HTML engole o resto do markup.
4. **Nenhum valor literal de cor ou medida no protótipo.** Use token (`var(--lc-space-m)`).
   Literal quebra na troca de tema, que é a razão de o kit existir.
5. **Textos de UI em pt-BR.**
6. Ícone sempre por `<lc-icon>`, nunca SVG inline nem emoji.

## Receitas

### Botões

```html
<button class="lc-btn lc-btn--brand">Salvar</button>
<button class="lc-btn">Cancelar</button>
<button class="lc-btn lc-btn--quiet">Ver mais</button>
<button class="lc-btn lc-btn--danger">Excluir</button>
<button class="lc-btn lc-btn--sm">Pequeno</button>
<button class="lc-btn lc-btn--block">Largura total</button>
<button class="lc-btn" disabled>Desabilitado</button>
```

Variantes: `--brand` `--success` `--warning` `--danger` `--quiet`. Tamanhos: `--sm` `--lg`.

### Campo de formulário

```html
<div class="lc-field">
  <label class="lc-label" for="nome">Nome do paciente</label>
  <input class="lc-input" id="nome" placeholder="Digite o nome" />
</div>

<!-- Erro -->
<div class="lc-field lc-field--error">
  <label class="lc-label" for="cpf">CPF</label>
  <input class="lc-input" id="cpf" />
  <span class="lc-error">CPF inválido.</span>
</div>
```

### Card

```html
<div class="lc-card lc-card--brand">
  <div class="lc-card__header">Dados do paciente</div>
  <div class="lc-card__body">…</div>
  <div class="lc-card__footer">
    <button class="lc-btn lc-btn--brand">Salvar</button>
  </div>
</div>
```

Variantes de acento no topo: `--brand` `--success` `--warning` `--danger`.

### Avisos e chips

```html
<div class="lc-alert lc-alert--warning">Outro usuário está editando este registro.</div>
<div class="lc-alert lc-alert--danger lc-alert--banner">Falha ao consultar o CEP.</div>

<span class="lc-badge lc-badge--success">Ativo</span>
<span class="lc-badge lc-badge--warning">Pendente</span>
```

`--banner` é o antigo `.callout` do legado (barra na lateral em vez de borda em volta).

### Tabela

```html
<table class="lc-table lc-table--striped lc-table--hover">
  <thead>
    <tr><th>#</th><th>Paciente</th><th>Ações</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Ana Souza</td>
      <td>
        <lc-dropdown placement="bottom-end">
          <button slot="trigger" class="lc-btn lc-btn--sm">···</button>
          <button class="lc-menu-item" data-value="editar">Editar</button>
        </lc-dropdown>
      </td>
    </tr>
  </tbody>
</table>
```

Modificadores: `--striped` `--hover` `--bordered` `--condensed`.

### Interruptor (entra no `<form>` nativo)

```html
<form id="f">
  <lc-switch name="noturno" value="sim" checked>Aceita plantão noturno</lc-switch>
  <lc-switch name="termo" required>Aceito o termo</lc-switch>
  <button class="lc-btn lc-btn--brand" type="submit">Enviar</button>
</form>
<script>
  document.getElementById('f').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(Object.fromEntries(new FormData(e.target)));
  });
</script>
```

Desligado **não entra** no `FormData` — igual ao checkbox nativo. `reset()` volta ao estado
que o atributo declarava.

### Menu de ações

```html
<lc-dropdown placement="bottom-start">
  <button slot="trigger" class="lc-btn">
    Ações <lc-icon name="chevron-down"></lc-icon>
  </button>
  <button class="lc-menu-item" data-value="editar">
    <lc-icon name="pencil"></lc-icon> Editar
  </button>
  <hr />
  <button class="lc-menu-item" data-variant="danger" data-value="excluir">Excluir</button>
</lc-dropdown>
<script>
  document.addEventListener('lc-select', (e) => console.log(e.detail.value));
</script>
```

`placement`: `bottom-start` (default) · `bottom-end` · `top-start` · `top-end`.
Fecha por clique fora e por Esc **sozinho** (top layer nativo). Funciona dentro de modal e na
última linha de tabela que rola, sem configuração.

### Modal — inclusive sem JavaScript

```html
<button class="lc-btn lc-btn--brand" data-lc-modal="open m1">Editar</button>

<lc-modal id="m1" label="Editar paciente">
  <div class="lc-field">
    <label class="lc-label" for="n">Nome</label>
    <input class="lc-input" id="n" autofocus />
  </div>
  <div slot="footer">
    <button class="lc-btn" data-lc-modal="close m1">Cancelar</button>
    <button class="lc-btn lc-btn--brand">Salvar</button>
  </div>
</lc-modal>
```

`data-lc-modal="open <id>"` / `"close <id>"` abre e fecha sem uma linha de JS — use isso em
protótipo. Atributos: `size="small|large"`, `without-header`, `without-footer`,
`without-close-button`. Custom properties: `--width`, `--max-height`.

Fecha pelo ×, pelo fundo e por Esc; os três passam por `lc-hide`, que é **cancelável** e diz a
origem:

```html
<script>
  document.getElementById('m1').addEventListener('lc-hide', (e) => {
    if (e.detail.source !== 'close-button' && temAlteracao) e.preventDefault();
  });
</script>
```

### Notificação

```html
<button class="lc-btn" onclick="lc.toast('Registro salvo.', { variant: 'success' })">Salvar</button>
```

```js
lc.toast('Nenhum registro selecionado.', { variant: 'danger', title: 'Erro' });
lc.toast('Processando…', { duration: 0 }); // 0 = não fecha sozinho
```

Variantes: `brand` `success` `warning` `danger` `neutral`. Aparece **acima de modal aberto**.

### Ícone

```html
<lc-icon name="user" label="Usuário"></lc-icon>   <!-- semântico -->
<lc-icon name="calendar"></lc-icon>                <!-- decorativo -->
<lc-icon name="fa-times" library="fa4"></lc-icon>  <!-- nome do Font Awesome 4 -->
```

Nomes disponíveis em `components/lc-icon/library.system.js`. Nome inexistente rende um
**marcador visível** e um aviso no console — nunca um espaço vazio.

## Eventos

| Evento | Origem | `detail` |
|---|---|---|
| `lc-change` | `lc-switch` | `{ checked, value }` |
| `lc-select` | `lc-dropdown` (cancelável: `preventDefault()` mantém aberto) | `{ value, item }` |
| `lc-show` / `lc-after-show` | `lc-modal`, `lc-dropdown` | — |
| `lc-hide` / `lc-after-hide` | `lc-modal`, `lc-dropdown` (`lc-hide` cancelável) | `{ source }` |

Todos borbulham e atravessam o shadow boundary — pode escutar no `document`.

## Tokens mais usados

| Token | Uso |
|---|---|
| `--lc-space-xs` … `--lc-space-2xl` | espaçamento |
| `--lc-color-text-normal` / `-quiet` | texto |
| `--lc-color-surface-page` / `-card` | fundo |
| `--lc-color-border-normal` | borda |
| `--lc-radius-control` / `-card` | raio |
| `--lc-font-size-m` | corpo de texto |

Lista completa: `styles/temas/legacy.css`. **Todo token existe nos dois temas** — o
`tools/check-contrato.mjs` reprova se não.

## Se a tag `<lc-*>` aparecer como texto cru

Nesta ordem:

1. **A página está em `file://`.** ES modules exigem HTTP. Sirva com `npx serve .`.
2. **Caminho errado** do `loader.js` ou do `lc.css`. Confira a aba Network.
3. **Erro de sintaxe** em algum componente — a exceção aborta o módulo e nenhuma tag se
   registra. Rode `node tools/check-syntax.mjs`. (Já aconteceu: backtick dentro do template
   literal do CSS.)
4. **Duas cópias do kit** na página — procure o aviso `[lc-bricks]` no console.
5. **Tag self-closing** (`<lc-icon />`) — o parser engole o resto do markup.
