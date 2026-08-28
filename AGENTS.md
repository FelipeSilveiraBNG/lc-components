# lc-components — guia para agentes de IA

Como **consumir** o lc-components ao gerar protótipo do BNG LinkCare. Leia antes de escrever
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

1. **Componente é TAG. Não existe classe de componente.** Botão, campo, card, alert, badge e
   item de menu são `<lc-button>`, `<lc-input>`, `<lc-card>`, `<lc-alert>`, `<lc-badge>`,
   `<lc-menu-item>`. Se você está procurando `.lc-btn` ou `.lc-field`, eles não existem mais — <!-- lc-permite-classe -->
   ver o [ADR 0001](docs/adr/0001-aposentar-a-camada-de-classes.md).

   **Duas exceções, e são exceções de verdade:**

   - **Tabela é `<table class="lc-table">`.** Não é inconsistência: o parser HTML EXPULSA
     elemento desconhecido de dentro de `<table>`/`<tbody>`/`<tr>`, então `<lc-row>` viraria
     irmão da tabela e a tabela ficaria vazia. Medido, não suposto. O Web Awesome também não tem
     componente de tabela.
   - **Utilitário e tipografia continuam classe:** `.lc-stack`, `.lc-row`, `.lc-grow`,
     `.lc-quiet`, `.lc-h1`, `.lc-h2`, `.lc-page-body`, `.lc-cloak`, `.lc-no-print`, `.lc-app`,
     `.lc-only-drawer`.

   O `tools/check-sem-classes.mjs` reprova quem usar classe aposentada.
2. **Nunca reestilize componente por dentro.** Use atributo, `::part()` ou a custom property
   documentada no JSDoc do componente.
3. **Tag custom nunca é self-closing.** `<lc-icon name="x"></lc-icon>`, jamais `<lc-icon />` —
   o parser HTML engole o resto do markup.
4. **Nenhum valor literal de cor ou medida no protótipo.** Use token (`var(--lc-space-m)`).
   Literal quebra na troca de tema, que é a razão de o kit existir.
5. **Textos de UI em pt-BR.**
6. Ícone sempre por `<lc-icon>`, nunca SVG inline nem emoji. O logo é `<lc-logo>` — mesma
   regra, outra tag.

## Receitas

### Botões

```html
<lc-button variant="brand">Salvar</lc-button>
<lc-button>Cancelar</lc-button>
<lc-button appearance="plain">Ver mais</lc-button>
<lc-button variant="danger">Excluir</lc-button>
<lc-button size="small">Pequeno</lc-button>
<lc-button block>Largura total</lc-button>
<lc-button disabled>Desabilitado</lc-button>

<lc-button-group label="Período">
  <lc-button>Dia</lc-button>
  <lc-button>Semana</lc-button>
</lc-button-group>
```

`variant`: `brand` `success` `warning` `danger` (padrão: neutro).
`appearance`: `plain` remove tinta e borda. `size`: `small` `large`.

> ⚠️ **`type` padrão é `button`, não `submit`** — o oposto do `<button>` nativo. Dentro de um
> `<form>`, escreva `type="submit"` explicitamente, senão **nada acontece e nada avisa**.

```html
<form>
  <lc-button type="submit" variant="brand">Enviar</lc-button>
  <lc-button type="reset">Limpar</lc-button>
</form>
```

### Campo de formulário

O controle é dono do rótulo: **um** nó, não três. `label` e `hint` são atributo (ou slot, se
precisar de HTML dentro).

```html
<lc-input label="Nome do paciente" name="nome" placeholder="Digite o nome"></lc-input>
<lc-input label="CPF" name="cpf" required hint="Só números"></lc-input>
<lc-input label="E-mail" name="email" type="email"></lc-input>

<lc-select label="Unidade" name="unidade">
  <option value="central">Hospital Central</option>
  <option value="norte">Unidade Norte</option>
</lc-select>

<lc-textarea label="Observações" name="obs" rows="4"></lc-textarea>
```

**Erro não é markup, é validade.** Não existe atributo `error`. A mensagem vem da validação
nativa (`required`, `type`, `pattern`, `minlength`), e regra de negócio usa
`setCustomValidity()`:

```html
<script>
  document.querySelector('[name="cpf"]').setCustomValidity('CPF já cadastrado.');
  // e para limpar:
  document.querySelector('[name="cpf"]').resetValidity();
</script>
```

O erro aparece ao **sair** do campo ou no submit, não a cada tecla. Evento: `lc-invalid`.

### Card

```html
<lc-card variant="brand">
  <span slot="header">Dados do paciente</span>
  …
  <div slot="footer">
    <lc-button variant="brand">Salvar</lc-button>
  </div>
</lc-card>
```

`variant`: `brand` `success` `warning` `danger`. Cabeçalho e rodapé **desaparecem sozinhos**
quando o slot está vazio — não escreva div vazia para "manter a estrutura".

### Avisos e chips

```html
<lc-alert variant="warning">
  <lc-icon slot="icon" name="warning"></lc-icon>
  Outro usuário está editando este registro.
</lc-alert>

<lc-alert variant="danger" appearance="banner">Falha ao consultar o CEP.</lc-alert>

<lc-badge variant="success">Ativo</lc-badge>
<lc-badge variant="warning">Pendente</lc-badge>
```

`appearance="banner"` é o antigo `.callout` do legado (barra na lateral em vez de borda em
volta). O ícone do alerta vai no **slot `icon`**, não como primeiro filho.

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
          <lc-button slot="trigger" size="small">···</lc-button>
          <lc-menu-item value="editar">Editar</lc-menu-item>
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
  <lc-button variant="brand" type="submit">Enviar</lc-button>
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
  <lc-button slot="trigger">
    Ações <lc-icon name="chevron-down"></lc-icon>
  </lc-button>
  <lc-menu-item value="editar">
    <lc-icon name="pencil"></lc-icon> Editar
  </lc-menu-item>
  <hr />
  <lc-menu-item value="excluir" variant="danger">Excluir</lc-menu-item>
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
<lc-button variant="brand" data-lc-modal="open m1">Editar</lc-button>

<lc-modal id="m1" label="Editar paciente">
  <lc-input label="Nome" id="n" autofocus></lc-input>
  <div slot="footer">
    <lc-button data-lc-modal="close m1">Cancelar</lc-button>
    <lc-button variant="brand">Salvar</lc-button>
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
<lc-button onclick="lc.toast('Registro salvo.', { variant: 'success' })">Salvar</lc-button>
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

### Logo

```html
<lc-logo></lc-logo>                              <!-- horizontal, colorido -->
<lc-logo variant="negative"></lc-logo>           <!-- horizontal, branco -->
<lc-logo variant="mini"></lc-logo>               <!-- empilhado, azul -->
<lc-logo variant="mini-negative"></lc-logo>      <!-- empilhado, branco -->
<lc-logo variant="symbol"></lc-logo>             <!-- só o monograma, azul -->
<lc-logo variant="symbol-negative"></lc-logo>    <!-- só o monograma, branco -->
<lc-logo style="--height: 40px"></lc-logo>       <!-- mede-se por ALTURA -->
```

Duas geometrias × duas pinturas. A `mini` empilha o letreiro sob o monograma e serve onde a
horizontal não cabe; as `negative` são as mesmas peças em branco, para fundo escuro ou tintado —
**nunca sobre o turquesa da marca** (branco ali dá 1,74:1).

O logo **nasce com nome acessível** ("BNG LinkCare"), ao contrário do `<lc-icon>`, que nasce
decorativo. Se já houver um `<h1>` com o nome ao lado, silencie com `label=""`.

> É a única exceção à regra de ouro nº 6, e só porque continua sendo tag. Colar o SVG do logo à
> mão segue proibido, e `<img src="logo.svg">` também: com arquivo são seis downloads e seis
> chances de publicar o azul sobre fundo azul.

### Casco da aplicação — barra lateral e conteúdo

```html
<body class="lc">
  <div class="lc-app">
    <lc-sidebar label="Navegação principal">
      <lc-sidebar-label>Menu</lc-sidebar-label>
      <lc-sidebar-item href="/painel" icon="house">Home</lc-sidebar-item>

      <lc-sidebar-group label="Sistema" icon="settings">
        <lc-sidebar-item href="/painel/usuario">Usuário</lc-sidebar-item>
      </lc-sidebar-group>
    </lc-sidebar>

    <div>
      <header class="topo">
        <lc-button data-lc-sidebar="toggle" class="lc-only-drawer" aria-label="Abrir o menu">
          <lc-icon name="menu"></lc-icon>
        </lc-button>
        <lc-logo style="--height: 22px"></lc-logo>
      </header>
      <main class="lc-page-body">…</main>
    </div>
  </div>
</body>
```

`.lc-app` é o utilitário que faz o conteúdo se ajustar: a barra é **só a coluna**, nunca
`fixed`, e não escreve nada fora de si. São quatro tags — a coluna, o rótulo de seção, o item
que navega e o grupo que abre submenu.

**A marca vai no cabeçalho, não na barra.** O `<lc-sidebar>` não tem slot de logo: havia uma
faixa no topo dele e ela saiu, porque a gaveta do telefone abre sob o cabeçalho e ficavam duas
marcas colocadas uma sobre a outra. Ponha `<lc-logo>` no seu `<header>`, ao lado do botão da
gaveta.

**Não escreva `current` à mão.** A barra casa o `href` de cada item com o `location.pathname` e
marca quem bate, abrindo o grupo dele junto. `current` explícito vence e desliga o automático
inteiro — serve para rota com parâmetro, onde a URL não bate com item nenhum.

Quatro estados, um só componente:

| Estado | Como se pede |
|---|---|
| Coluna de 230 px | o padrão |
| Trilho de ícones de 56 px | `collapsed`, ou a alça turquesa na borda |
| Flyout do submenu | automático, no trilho |
| **Gaveta sobre o conteúdo** | abaixo de 767 px, com `open` |

> ⚠️ **Abaixo de 767 px a coluna vai a zero e o menu só existe como gaveta.** O gatilho é do
> consumidor — a barra não traz botão. Use `data-lc-sidebar="toggle"` (sem script, como o
> `data-lc-modal`) e `class="lc-only-drawer"` para o botão aparecer só nessa faixa. **Não escreva
> a media query de novo**: o utilitário lê o estado que a própria barra publica.

A gaveta abre **sob o cabeçalho**, como no painel — e a barra não descobre a altura dele
sozinha. Declare as duas com o MESMO token, e as duas linhas nunca discordam:

```css
.topo      { block-size: var(--lc-shell-row-height); }
lc-sidebar { --drawer-top: var(--lc-shell-row-height); }
```

A gaveta é um `<dialog>` modal: fecha no Esc e no clique fora, e prende o foco. Recolher **não é
guardado** — a barra emite `lc-collapse` e não grava nada; quem quiser persistir escuta e grava.

## Eventos

| Evento | Origem | `detail` |
|---|---|---|
| `lc-change` | `lc-switch` | `{ checked, value }` |
| `lc-select` | `lc-dropdown` (cancelável: `preventDefault()` mantém aberto) | `{ value, item }` |
| `lc-show` / `lc-after-show` | `lc-modal`, `lc-dropdown`, `lc-sidebar` (a gaveta) | — |
| `lc-hide` / `lc-after-hide` | `lc-modal`, `lc-dropdown`, `lc-sidebar` (`lc-hide` cancelável) | `{ source }` |
| `lc-collapse` | `lc-sidebar` | `{ collapsed }` |

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
4. **Duas cópias do kit** na página — procure o aviso `[lc-components]` no console.
5. **Tag self-closing** (`<lc-icon />`) — o parser engole o resto do markup.
