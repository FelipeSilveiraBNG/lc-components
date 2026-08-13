# lc-components v0.1.0

Kit de protótipos do **BNG LinkCare**. Tokens + CSS base + custom elements em JavaScript
puro, sem build, com **dois temas** trocáveis por um atributo.

É ferramenta interna do time de produtos. Não é biblioteca de produção — nem do painel PHP,
nem dos apps React.

O levantamento e as decisões que originaram este kit estão em
`bnglinkcare_design/framework-prototipos/` (docs 01–09). Este README é só o operacional.

---

## Uso

```html
<!doctype html>
<html lang="pt-BR" data-lc-theme="legacy">
  <head>
    <link rel="stylesheet" href="lc.css" />
    <script type="module" src="components/loader.js"></script>
  </head>
  <body class="lc">
    <div class="lc-page-body">
      <lc-button variant="brand">Salvar</lc-button>
    </div>
  </body>
</html>
```

Duas linhas no `<head>`. O `loader.js` é o **autoloader**: importa cada componente no
primeiro uso, então a página não precisa saber quais existem. Quem preferir carregar tudo de
uma vez usa `components/index.js`.

**Sirva por HTTP.** ES modules não funcionam em `file://`:

```bash
npx serve .          # e abra /demo/index.html
```

---

## Os dois temas

```html
<html data-lc-theme="legacy">   <!-- default -->
<html data-lc-theme="modern">
```

| Tema | Reproduz | Aparência |
|---|---|---|
| `legacy` | o backoffice PHP (AdminLTE 2.4.2 + Bootstrap 3.3.7) | base 14px, raio 3–4px, controle 34px, sombra dura de 1px, azul `#3c8dbc` |
| `modern` | o console admin React (Next 16 + Tailwind v4) | base 14px, raio 8–12px, controle 38px, `shadow-sm`, slate + `blue-600` |

**Os dois são reprodução medida, não proposta.** Todo valor saiu de medição no código —
o `legacy` do doc 01, o `modern` da contagem de frequência de classe Tailwind do doc 08.

Não existe tema da marca (turquesa + Poppins) ainda: a hierarquia visual do brandbook não foi
definida, e inventá-la aqui fixaria por acidente de protótipo uma primária que ninguém
escolheu. Quando existir, entra como terceiro tema sem tocar em componente nenhum.

---

## O que tem no v0.1

**Camada nativa** — o que sobrou dela depois do
[ADR 0001](docs/adr/0001-aposentar-a-camada-de-classes.md), que aposentou as classes de
componente: `<table class="lc-table">` e os quatro modificadores, mais tipografia
(`.lc-h1`, `.lc-h2`, `.lc-quiet`, `.lc-link`), página (`.lc-page`, `.lc-page-body`) e
utilitários (`.lc-stack`, `.lc-row`, `.lc-cloak`…).

A tabela fica como classe por limite da plataforma, não por escolha: o parser HTML expulsa
elemento desconhecido de dentro de `<table>`/`<tbody>`/`<tr>`, então uma linha componentizada
viraria irmã da tabela. O Web Awesome chegou à mesma conclusão e também não tem componente de
tabela.

**Componentes** (custom elements — tudo o que não é tabela nem utilitário):

| Tag | O que faz | O que substitui do legado |
|---|---|---|
| `<lc-icon>` | ícone com biblioteca registrável; nome inválido rende marcador visível | Font Awesome 4 com nome livre vindo do banco |
| `<lc-switch>` | interruptor form-associated, com validação | uniform + iCheck |
| `<lc-dropdown>` | menu no top layer, sem recorte | `.dropdown` + `dropdownParent` do Select2 |
| `<lc-modal>` | `<dialog>` nativo: focus trap, `inert`, Esc | `.modal` + o host `#ajax` + bootstrap-dialog |
| `<lc-toast>` | notificação no top layer, `newest_on_top` | bootstrap-notify + notiflix + bootstrap-dialog |

`lc.toast('Salvo.', { variant: 'success' })` está no escopo global, para protótipo com
handler inline.

---

## Comandos

```bash
node tools/check-syntax.mjs     # SyntaxError em template literal (o bug que já nos pegou)
node tools/check-contrato.mjs   # paridade dos temas + regras de token
node tools/run-tests.mjs        # a suíte, em Chromium headless
```

O `run-tests.mjs` **empresta o Playwright** de `minhaescala_web` (o kit não tem
`package.json`, de propósito). Se o caminho mudar:

```bash
LC_PLAYWRIGHT=/caminho/node_modules/playwright/index.js node tools/run-tests.mjs
```

### Estado da suíte

```
tema.html        13 PASS · 0 FAIL · 4 HERDADO
clipping.html    10 PASS · 0 FAIL
formulario.html  14 PASS · 0 FAIL
TOTAL            37 PASS · 0 FAIL · 4 HERDADO
```

**HERDADO** é veredicto próprio: defeito do produto que o tema reproduz fielmente. Os quatro
são de contraste — e a lista é informação, não ruído:

| Par | Razão | |
|---|---|---|
| `[legacy]` texto fraco sobre card | 2,85:1 | `#999999` sobre branco |
| `[legacy]` texto sobre marca sólida | 3,67:1 | branco sobre `#3c8dbc` |
| `[legacy]` texto sobre aviso sólido | 2,19:1 | branco sobre `#f39c12` |
| `[modern]` texto sobre aviso sólido | 2,15:1 | branco sobre `#f59e0b` |

O `modern` passa em três dos quatro pares em que o `legacy` falha — ou seja, **o console
React é medivelmente mais acessível que o painel** nas combinações que mais aparecem.
Consertar isso é decisão de design, não de kit: mexer na cor aqui faria o protótipo deixar de
parecer com o sistema que ele existe para representar.

---

## Estrutura

```
lc.css                    ponto de entrada (só @imports)
tokens/primitivos.css     escalas cruas --lc-_*  (nenhum componente lê)
styles/
  layers.css              ordem de cascata
  temas/legacy.css        \ o contrato inteiro, 85 tokens,
  temas/modern.css        / definidos pelos dois — o lint garante a paridade
  native.css              elementos nativos
  utilities.css
components/
  lc-element.js           base de todo componente
  lc-form-element.js      base dos controles de formulário
  define.js               guarda de colisão de tag
  loader.js               autoloader
  events.js               registro central de nomes de evento
  <nome>/<nome>.js + <nome>.css.js
test/                     páginas autoafirmativas
tools/                    lints e runner
demo/                     a documentação, multi-página
  index.html              instalação — a porta de entrada
  docs.css + docs.js      o casco (cabeçalho, lateral, sumário, rodapé)
  <topico>.html           uma página por tópico, só com o próprio conteúdo
```

O casco é montado pelo `docs.js` a partir de uma única lista de navegação, então
acrescentar página é editar essa lista e criar o arquivo — nenhuma das outras
páginas muda. É o que evita treze cópias de cabeçalho divergindo.

---

## O que NÃO tem no v0.1

- `<nome>.md` por componente (a convenção do doc 09 §5 pede três arquivos; a API está no
  JSDoc e as receitas no `AGENTS.md`)
- `custom-elements.json` gerado por CEM — o JSDoc já está no formato que o analyzer lê
- Grid e formulário dirigidos por schema, shell, e o resto dos ~24 componentes previstos
- Publicação em CDN com prefixo de versão imutável
- Dark mode (o eixo `appearance` está previsto, mas nenhum app do produto usa `dark:`)
