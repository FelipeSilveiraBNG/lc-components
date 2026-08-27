/*
 * docs.js — o casco da documentação multi-página do lc-components.
 *
 * A documentação é MULTI-PÁGINA: cada tópico é um .html carregado de verdade,
 * com navegação do navegador, URL própria, histórico e botão voltar. Não é
 * roteador de hash nem SPA.
 *
 * O preço de multi-página é a duplicação do shell: doze arquivos com o mesmo
 * cabeçalho, a mesma lateral e o mesmo rodapé é a receita para eles
 * divergirem — alguém acrescenta uma página e esquece de onze arquivos. Sem
 * build e sem dependência (as duas restrições do kit), não há include de
 * template no HTML.
 *
 * Então o shell é montado AQUI, deste módulo, a partir de uma única lista
 * (`NAV`). Cada página carrega só o próprio conteúdo dentro de um
 * `<main class="doc-conteudo">`; este arquivo cria cabeçalho, lateral, sumário,
 * anterior/próximo e rodapé em volta. Acrescentar página é editar `NAV` e criar
 * o arquivo — nenhum outro arquivo muda.
 *
 * O que cada página ainda precisa declarar por conta própria, e por quê:
 *   - `<title>`, porque é o título da aba e o do histórico;
 *   - o `data-lc-theme` inicial, num script clássico no <head>. Este módulo é
 *     deferido, e esperar por ele daria um flash do tema errado a cada
 *     navegação — que é exatamente o que mais aparece numa doc multi-página.
 */

/* ══════════════════════════════════════════════════════════════════════════════
   1. A LISTA — fonte única da navegação, do sumário lateral e do anterior/próximo
   ══════════════════════════════════════════════════════════════════════════ */
const NAV = [
  {
    grupo: 'Guia',
    icone: 'info',
    itens: [
      { arquivo: 'index.html', rotulo: 'Início' },
      { arquivo: 'instalacao.html', rotulo: 'Instalação' },
      { arquivo: 'tokens.html', rotulo: 'Tokens' },
      { arquivo: 'eventos.html', rotulo: 'Eventos' },
    ],
  },
  /*
   * ── Por que só a tabela tem selo ──────────────────────────────────────────
   * Antes do ADR 0001 metade do kit era classe e metade componente, e o selo
   * `classe`/`comp` em cada item era informação de verdade — o leitor precisava
   * saber de que lado estava antes de escrever markup.
   *
   * Agora tudo é componente, com UMA exceção. Marcar onze itens com "comp" para
   * distinguir de um só seria ruído: o selo passaria a ser decoração, que é
   * exatamente o que a doc não deve ter. Então o selo sobrou onde carrega
   * informação — na tabela, que é o caso estranho e precisa se anunciar.
   */
  {
    grupo: 'Componentes',
    icone: 'plus',
    /* Uma tag, uma página. Em ordem alfabética: com quinze itens, agrupar por
       afinidade (campos juntos, avisos juntos) vira decisão de quem escreveu, e
       quem procura "Textarea" não sabe se é "campo" ou "formulário". */
    itens: [
      { arquivo: 'alert.html', rotulo: 'Alert' },
      { arquivo: 'badge.html', rotulo: 'Badge' },
      { arquivo: 'button.html', rotulo: 'Button' },
      { arquivo: 'button-group.html', rotulo: 'Button Group' },
      { arquivo: 'card.html', rotulo: 'Card' },
      { arquivo: 'dropdown.html', rotulo: 'Dropdown' },
      { arquivo: 'icon.html', rotulo: 'Icon' },
      { arquivo: 'input.html', rotulo: 'Input' },
      { arquivo: 'logo.html', rotulo: 'Logo' },
      { arquivo: 'menu-item.html', rotulo: 'Menu Item' },
      { arquivo: 'modal.html', rotulo: 'Modal' },
      { arquivo: 'select.html', rotulo: 'Select' },
      { arquivo: 'switch.html', rotulo: 'Switch' },
      { arquivo: 'textarea.html', rotulo: 'Textarea' },
      { arquivo: 'toast.html', rotulo: 'Toast' },
    ],
  },
  {
    grupo: 'Camada nativa',
    icone: 'check',
    itens: [{ arquivo: 'tabela.html', rotulo: 'Tabela', selo: 'classe' }],
  },
];

const VERSAO = 'v0.2.0';

/* Lista plana, na ordem de leitura — é dela que sai o anterior/próximo. */
const PLANA = NAV.flatMap((g) => g.itens);

/* Qual arquivo é este. Servidor que entrega diretório como index.html deixa o
   caminho terminando em `/`, então esse caso vira index.html explicitamente. */
const ATUAL = (() => {
  const ultimo = location.pathname.split('/').pop();
  return ultimo === '' ? 'index.html' : ultimo;
})();

const raiz = document.documentElement;
const conteudo = document.querySelector('main.doc-conteudo');

/* ══════════════════════════════════════════════════════════════════════════════
   2. Pequenos ajudantes de DOM

   `el()` em vez de innerHTML com template string: o rótulo de uma página vai
   para dentro de um nó de texto, não para dentro de HTML interpretado. Numa doc
   isso é detalhe, mas o hábito é o que evita injeção quando a mesma função
   passar a receber texto que não escrevemos.
   ══════════════════════════════════════════════════════════════════════════ */
function el(tag, props = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null) continue;
    if (k === 'class') n.className = v;
    else if (k === 'texto') n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const f of filhos) {
    if (f === undefined || f === null) continue;
    n.append(f);
  }
  return n;
}

function icone(nome) {
  /* Decorativo: sem `label`, o componente marca como aria-hidden. */
  return el('lc-icon', { name: nome });
}

/* ══════════════════════════════════════════════════════════════════════════════
   3. CABEÇALHO
   ══════════════════════════════════════════════════════════════════════════ */
function montarTopo() {
  const marca = el(
    'div',
    { class: 'doc-marca' },
    el('a', { class: 'doc-marca__nome', href: 'index.html', texto: 'lc-components' }),
    el('lc-badge', { texto: VERSAO }),
    el('span', {
      class: 'lc-quiet doc-marca__desc',
      texto: 'kit de protótipos do BNG LinkCare',
    }),
    el('span', { class: 'lc-grow' }),
    /* ══ O seletor de tema É o artefato ══════════════════════════════════════
       Um tema serve para prototipar. Dois servem para ARGUMENTAR: a mesma tela
       em dois futuros, num clique, na frente de quem decide. */
    el('span', { class: 'lc-quiet', texto: 'tema:' }),
    el(
      'lc-button-group',
      { label: 'Tema' },
      el('lc-button', { id: 't-legacy', size: 'small', texto: 'legacy (PHP)' }),
      el('lc-button', { id: 't-modern', size: 'small', texto: 'modern (React)' }),
    ),
  );

  /* Só a faixa da marca. Havia uma segunda faixa aqui, com um link por grupo do
     NAV mais "Suíte de testes", e ela saiu por ser redundante: a lateral já
     lista TODOS os grupos com todas as páginas — não só a primeira de cada — e
     o rodapé já linka as três páginas de teste. Duas faixas grudadas no topo
     custavam ~80px de altura permanente para repetir navegação que já existia
     em dois outros lugares.

     O que fica grudado é esta faixa, e por um motivo: o seletor de tema tem de
     estar alcançável em qualquer ponto do scroll. */
  return el('header', { class: 'doc-topo lc-no-print' }, marca);
}

/* ══════════════════════════════════════════════════════════════════════════════
   4. LATERAL
   ══════════════════════════════════════════════════════════════════════════ */
function montarLateral() {
  const nav = el('nav', { 'aria-label': 'Navegação da documentação', id: 'lateral' });

  for (const g of NAV) {
    const lista = el('ul');
    for (const item of g.itens) {
      const ehAtual = item.arquivo === ATUAL;
      const link = el('a', {
        href: item.arquivo,
        /* `aria-current="page"` é o valor correto para "esta é a página em que
           você está" — diferente do `="true"` usado no sumário, que marca a
           SEÇÃO visível dentro da página. */
        'aria-current': ehAtual ? 'page' : null,
      });
      link.append(document.createTextNode(item.rotulo));
      if (item.selo) {
        link.append(
          el('span', {
            class: `doc-selo doc-selo--${item.selo === 'comp' ? 'componente' : 'classe'}`,
            texto: item.selo,
          }),
        );
      }
      lista.append(el('li', {}, link));
    }
    nav.append(
      el(
        'div',
        { class: 'doc-grupo' },
        el('div', { class: 'doc-grupo__titulo' }, icone(g.icone), document.createTextNode(g.grupo)),
        lista,
      ),
    );
  }

  return el('aside', { class: 'doc-lateral lc-no-print' }, nav);
}

/* ══════════════════════════════════════════════════════════════════════════════
   5. SUMÁRIO "nesta página", derivado dos títulos que a página tem

   Derivado, não escrito: uma lista à mão numa doc multi-página é doze listas
   para envelhecer. Se a página não tem pelo menos dois títulos, a coluna não
   aparece — sumário de um item só é ruído.
   ══════════════════════════════════════════════════════════════════════════ */
function montarSumario() {
  const titulos = [...conteudo.querySelectorAll('h2.doc-h2, h3.doc-h3')];
  if (titulos.length < 2) return null;

  const lista = el('ul');
  for (const t of titulos) {
    if (!t.id) t.id = t.textContent.trim().toLowerCase().replace(/[^\w]+/g, '-');
    /* `firstChild` em vez de textContent: pega o rótulo sem arrastar o selo nem
       o `#` da âncora que moram dentro do <h2>. */
    const rotulo = (t.firstChild?.textContent ?? t.textContent).trim();
    const item = el('li', {}, el('a', { href: `#${t.id}`, texto: rotulo }));
    if (t.tagName === 'H3') item.classList.add('doc-sumario__sub');
    lista.append(item);
  }

  return el(
    'aside',
    { class: 'doc-sumario lc-no-print' },
    el('div', { class: 'doc-sumario__titulo', texto: 'Nesta página' }),
    el('nav', { 'aria-label': 'Sumário desta página', id: 'sumario' }, lista),
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   6. ANTERIOR / PRÓXIMO
   ══════════════════════════════════════════════════════════════════════════ */
function montarVizinhos() {
  const i = PLANA.findIndex((p) => p.arquivo === ATUAL);
  if (i === -1) return null;
  const anterior = PLANA[i - 1];
  const proximo = PLANA[i + 1];
  if (!anterior && !proximo) return null;

  const caixa = el('nav', { class: 'doc-vizinhos lc-no-print', 'aria-label': 'Páginas vizinhas' });

  if (anterior) {
    caixa.append(
      el(
        'a',
        { class: 'doc-vizinho doc-vizinho--anterior', href: anterior.arquivo, rel: 'prev' },
        el('span', { class: 'doc-vizinho__rotulo', texto: 'Anterior' }),
        el('span', { class: 'doc-vizinho__titulo', texto: anterior.rotulo }),
      ),
    );
  }
  if (proximo) {
    caixa.append(
      el(
        'a',
        { class: 'doc-vizinho doc-vizinho--proximo', href: proximo.arquivo, rel: 'next' },
        el('span', { class: 'doc-vizinho__rotulo', texto: 'Próximo' }),
        el('span', { class: 'doc-vizinho__titulo', texto: proximo.rotulo }),
      ),
    );
  }
  return caixa;
}

function montarRodape() {
  return el(
    'footer',
    { class: 'doc-rodape lc-no-print' },
    el(
      'div',
      { class: 'doc-rodape__interno' },
      el('strong', { texto: 'lc-components' }),
      el('span', {
        class: 'lc-quiet',
        texto: `Kit de protótipos do BNG LinkCare · ${VERSAO}`,
      }),
      el('span', { class: 'lc-grow' }),
      el('a', { class: 'lc-link', href: '../test/tema.html', texto: 'Tema' }),
      el('a', { class: 'lc-link', href: '../test/formulario.html', texto: 'Formulário' }),
      el('a', { class: 'lc-link', href: '../test/clipping.html', texto: 'Clipping' }),
    ),
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   7. Âncora no título, como em toda doc que se pode linkar
   ══════════════════════════════════════════════════════════════════════════ */
function ancorarTitulos() {
  for (const t of conteudo.querySelectorAll('h2.doc-h2')) {
    if (!t.id) t.id = t.textContent.trim().toLowerCase().replace(/[^\w]+/g, '-');
    if (t.querySelector('.doc-ancora')) continue;
    t.append(
      el('a', {
        class: 'doc-ancora',
        href: `#${t.id}`,
        texto: '#',
        'aria-label': `Link para ${(t.firstChild?.textContent ?? '').trim()}`,
      }),
    );
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   8. EXEMPLOS: um <template> gera o preview E o código

   O markup do exemplo é escrito UMA vez, dentro de um <template>. O preview sai
   de um clone; o bloco de código sai do mesmo innerHTML. Não existe cópia
   manual do markup na página, então não existe como o código exibido divergir
   do que está rodando ao lado — o defeito clássico de documentação.

   <template> também é inerte: os custom elements lá dentro não sofrem upgrade,
   então o código mostrado é o que foi AUTORADO, sem atributos que os
   componentes acrescentam em runtime.
   ══════════════════════════════════════════════════════════════════════════ */
function desindentar(txt) {
  const linhas = txt.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const recuos = linhas.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const min = recuos.length ? Math.min(...recuos) : 0;
  return linhas.map((l) => l.slice(min)).join('\n');
}

/* Realce de sintaxe em um passe único.

   Por que tokenizar em vez de encadear .replace(): replace em cadeia
   reprocessa o que o passe anterior já marcou, e aí um `class="x"` dentro de um
   <span> de tag vira HTML quebrado. Aqui cada trecho do fonte é escapado UMA
   vez, no momento em que é emitido — e o round-trip é testado. */
const RE_TOKENS =
  /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)((?:\s+[\w:.\-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)(\s*\/?>)/g;

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function realcar(fonte) {
  let saida = '';
  let i = 0;
  let m;
  RE_TOKENS.lastIndex = 0;
  while ((m = RE_TOKENS.exec(fonte)) !== null) {
    saida += escapar(fonte.slice(i, m.index));
    if (m[1]) {
      saida += `<span class="tok-comentario">${escapar(m[1])}</span>`;
    } else {
      saida += `<span class="tok-pontuacao">${escapar(m[2])}</span>`;
      saida += `<span class="tok-tag">${escapar(m[3])}</span>`;
      /* Os espaços ENTRE atributos não casam com o padrão e passam inalterados
         — espaço não precisa de escape. */
      saida += m[4].replace(
        /([\w:.\-]+)(\s*=\s*)?("[^"]*"|'[^']*')?/g,
        (todo, nome, igual, valor) => {
          if (!nome) return escapar(todo);
          let r = `<span class="tok-atributo">${escapar(nome)}</span>`;
          if (igual) r += escapar(igual);
          if (valor) r += `<span class="tok-string">${escapar(valor)}</span>`;
          return r;
        },
      );
      saida += `<span class="tok-pontuacao">${escapar(m[5])}</span>`;
    }
    i = m.index + m[0].length;
  }
  return saida + escapar(fonte.slice(i));
}

function botaoCopiar(texto) {
  const b = el('button', { class: 'doc-copiar', type: 'button', texto: 'copiar' });
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(texto);
      b.textContent = 'copiado';
    } catch {
      /* Sem clipboard (contexto não seguro, permissão negada): não vale quebrar
         a página por causa de uma conveniência. */
      b.textContent = 'falhou';
    }
    setTimeout(() => (b.textContent = 'copiar'), 1500);
  });
  return b;
}

function montarExemplos() {
  for (const exemplo of conteudo.querySelectorAll('.doc-exemplo')) {
    const tpl = exemplo.querySelector('template');
    if (!tpl) continue;

    const fonte = desindentar(tpl.innerHTML);

    /* O preview já pode existir no markup (quando precisa de modificador, como
       --bloco); se não existe, criamos. */
    let preview = exemplo.querySelector('.doc-preview');
    if (!preview) {
      preview = el('div', { class: 'doc-preview' });
      exemplo.prepend(preview);
    }
    preview.append(tpl.content.cloneNode(true));
    tpl.remove();

    const pre = el('pre', { class: 'doc-codigo' });
    const code = el('code');
    code.innerHTML = realcar(fonte);
    pre.append(code, botaoCopiar(fonte));
    exemplo.append(pre);
  }

  /* Os blocos escritos à mão (instalação) também ganham realce e botão. */
  for (const pre of conteudo.querySelectorAll('.doc-codigo')) {
    if (pre.closest('.doc-exemplo')) continue;
    const code = pre.querySelector('code');
    const fonte = code.textContent;
    code.innerHTML = realcar(fonte);
    pre.append(botaoCopiar(fonte));
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   9. TEMA
   ══════════════════════════════════════════════════════════════════════════ */
const ouvintesDeTema = [];

/** Registra trabalho que precisa refazer quando o tema muda (a tabela de tokens). */
export function aoTrocarTema(fn) {
  ouvintesDeTema.push(fn);
  fn();
}

function ligarTema() {
  const btnLegacy = document.getElementById('t-legacy');
  const btnModern = document.getElementById('t-modern');

  /* O grupo não gerencia seleção por decisão de projeto (ver o JSDoc de
     lc-button-group), então quem marca o tema ativo é esta função: `variant` para
     o olho, `aria-pressed` para o leitor de tela — antes só havia o primeiro. */
  function marcar(botao, ativo) {
    botao.setAttribute('variant', ativo ? 'brand' : 'neutral');
    botao.setAttribute('aria-pressed', String(ativo));
  }

  function aplicar(tema) {
    raiz.setAttribute('data-lc-theme', tema);
    marcar(btnLegacy, tema === 'legacy');
    marcar(btnModern, tema === 'modern');
    /* Persistido porque a doc é multi-página: sem isto, escolher `modern` e
       clicar num link voltaria para `legacy` na página seguinte. */
    localStorage.setItem('lc-tema', tema);
    for (const fn of ouvintesDeTema) fn();
  }

  btnLegacy.addEventListener('click', () => aplicar('legacy'));
  btnModern.addEventListener('click', () => aplicar('modern'));
  aplicar(localStorage.getItem('lc-tema') ?? 'legacy');
}

/* ══════════════════════════════════════════════════════════════════════════════
   10. TABELA DE TOKENS, lida ao vivo do tema

   Vive aqui, e não num script dentro de tokens.html, por um motivo prático: o
   `check-syntax.mjs` varre arquivos .js, então código que mora em .html não é
   coberto por lint nenhum. Guardada pela presença do elemento, a função
   simplesmente não faz nada nas outras onze páginas.
   ══════════════════════════════════════════════════════════════════════════ */
const TOKENS = [
  ['--lc-color-brand-fill-normal', 'preenchimento sólido do botão primário'],
  ['--lc-color-brand-fill-loud', 'o mesmo botão em hover'],
  ['--lc-color-brand-text', 'a cor de marca legível como TEXTO'],
  ['--lc-color-surface-page', 'fundo da página'],
  ['--lc-color-surface-card', 'fundo de card e de campo'],
  ['--lc-color-text-normal', 'texto padrão'],
  ['--lc-color-text-quiet', 'texto secundário'],
  ['--lc-color-border-normal', 'borda padrão'],
  ['--lc-space-m', 'espaçamento de referência'],
  ['--lc-radius-control', 'raio de botão e alerta'],
  ['--lc-radius-field', 'raio de campo — separado desde que o painel foi medido'],
  ['--lc-control-height', 'altura de controle'],
  ['--lc-font-family', 'família de texto'],
  ['--lc-font-size-m', 'corpo de texto'],
  ['--lc-shadow-card', 'elevação de card'],
];

/* Os primitivos do brandbook. Contraste CALCULADO (WCAG 2.1) contra branco, e é
   ele que decide o papel possível de cada cor — sem isso a tabela seria uma
   lista de hex bonitos. */
const MARCA = [
  ['--lc-_brand-mint', '1,43:1', 'fundo tintado — o slot fill-quiet'],
  ['--lc-_brand-turquoise', '1,74:1', 'A cor da marca. Só superfície: reprova como texto e como borda fina'],
  ['--lc-_brand-teal', '3,09:1', 'hover e borda de componente — passa o mínimo de 3:1, não o de texto'],
  ['--lc-_brand-green-deep', '8,04:1', 'o verde escuro do brandbook'],
  ['--lc-_brand-blue', '6,80:1', 'link e acento do logo — o linkcare-me anota "use sparingly"'],
  ['--lc-_brand-navy-deep', '17,34:1', 'do linkcare-me: o texto SOBRE o turquesa, com 9,98:1'],
  ['--lc-_brand-teal-ink', '4,97:1', 'do linkcare-me: o turquesa escurecido até passar como texto'],
  ['--lc-_stack-poppins', '—', 'a fonte da marca'],
];

/* Não entra em `ouvintesDeTema`: primitivo não muda quando o tema troca — é
   justamente o que o separa do contrato. Uma passada só, na carga. */
function preencherMarca() {
  const corpo = document.querySelector('#tabela-marca tbody');
  if (!corpo) return;
  const estilo = getComputedStyle(raiz);
  corpo.textContent = '';
  for (const [token, contraste, papel] of MARCA) {
    const valor = estilo.getPropertyValue(token).trim();

    const tdValor = el('td');
    if (valor.startsWith('#')) {
      const amostra = el('span', { class: 'doc-amostra-cor' });
      amostra.style.background = valor;
      tdValor.append(amostra, ' ');
    }
    tdValor.append(el('span', { class: 'doc-valor', texto: valor }));
    if (contraste !== '—') {
      tdValor.append(' ', el('span', { class: 'lc-quiet', texto: `· ${contraste}` }));
    }

    corpo.append(
      el(
        'tr',
        {},
        el('td', {}, el('code', { texto: token })),
        tdValor,
        el('td', { class: 'lc-quiet', texto: papel }),
      ),
    );
  }
}

function preencherTokens() {
  const corpo = document.querySelector('#tabela-tokens tbody');
  if (!corpo) return;
  const estilo = getComputedStyle(raiz);
  corpo.textContent = '';
  for (const [token, uso] of TOKENS) {
    const valor = estilo.getPropertyValue(token).trim();

    const tdValor = el('td');
    /* Amostra só para token de cor: para `14px` um quadrado não diz nada. */
    if (token.includes('-color-')) {
      const amostra = el('span', { class: 'doc-amostra-cor' });
      amostra.style.background = valor;
      tdValor.append(amostra, ' ');
    }
    tdValor.append(el('span', { class: 'doc-valor', texto: valor }));

    corpo.append(
      el(
        'tr',
        {},
        el('td', {}, el('code', { texto: token })),
        tdValor,
        el('td', { class: 'lc-quiet', texto: uso }),
      ),
    );
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   11. SEÇÃO ATIVA no sumário

   IntersectionObserver em vez de listener de scroll: o navegador só nos chama
   quando o cruzamento muda, em vez de a cada pixel rolado.

   A altura do cabeçalho é MEDIDA, não escrita: `rootMargin` só aceita px e %,
   então não dá para reusar `--doc-topo-altura` (que está em rem). Medir também
   acerta quando o cabeçalho quebra em duas linhas em tela estreita.
   ══════════════════════════════════════════════════════════════════════════ */
function ligarSumario() {
  const links = [...document.querySelectorAll('#sumario a')];
  if (links.length === 0) return;

  const alvos = links
    .map((a) => document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))))
    .filter(Boolean);

  const alturaTopo = document.querySelector('.doc-topo').offsetHeight;
  const visiveis = new Set();

  const obs = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) visiveis.add(e.target);
        else visiveis.delete(e.target);
      }
      /* Entre os visíveis, o que está mais alto manda — é o que o leitor está
         de fato lendo. */
      const ativo = alvos.find((t) => visiveis.has(t));
      if (!ativo) return;
      for (const a of links) {
        if (a.getAttribute('href') === `#${ativo.id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    },
    { rootMargin: `-${alturaTopo + 8}px 0px -70% 0px` },
  );
  for (const t of alvos) obs.observe(t);
}

/* ══════════════════════════════════════════════════════════════════════════════
   12. Espelho do FormData na página do lc-switch

   Guardado pela presença do formulário, como a tabela de tokens, e pelo mesmo
   motivo: código em .js entra no check-syntax, código em .html não entra em
   lint nenhum.
   ══════════════════════════════════════════════════════════════════════════ */
function ligarEspelhoDeFormulario() {
  const form = document.getElementById('form-demo');
  const saida = document.getElementById('saida-form');
  if (!form || !saida) return;

  const mostrar = () => {
    saida.textContent = `FormData: ${JSON.stringify(Object.fromEntries(new FormData(form)))}`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    mostrar();
  });
  form.addEventListener('lc-change', mostrar);
  /* `reset` dispara ANTES do estado voltar; o próximo tick já lê o valor novo. */
  form.addEventListener('reset', () => setTimeout(mostrar, 0));
  /* Espera o upgrade: antes dele o <lc-switch> não é form-associated e o
     FormData sai vazio. */
  customElements.whenDefined('lc-switch').then(mostrar);
}

/* ══════════════════════════════════════════════════════════════════════════════
   13. MONTAGEM
   ══════════════════════════════════════════════════════════════════════════ */
if (!conteudo) {
  console.error(
    '[lc-docs] A página não tem <main class="doc-conteudo">. O casco não foi montado.',
  );
} else {
  ancorarTitulos();
  montarExemplos();

  const sumario = montarSumario();

  const casco = el('div', {
    class: sumario ? 'doc-casco' : 'doc-casco doc-casco--sem-sumario',
  });
  /* O <main> é autorado na página; o casco é inserido em volta dele. */
  conteudo.replaceWith(casco);
  casco.append(montarLateral(), conteudo);
  if (sumario) casco.append(sumario);

  const vizinhos = montarVizinhos();
  if (vizinhos) conteudo.append(vizinhos);

  document.body.prepend(
    el('a', { class: 'doc-pular', href: '#conteudo', texto: 'Pular para o conteúdo' }),
    montarTopo(),
  );
  casco.after(montarRodape());

  conteudo.id = 'conteudo';

  /* Registrado ANTES de ligarTema(): é ele que dispara a primeira passada, então
     registrar depois faria a tabela ser preenchida duas vezes. */
  ouvintesDeTema.push(preencherTokens);

  preencherMarca();

  ligarTema();
  ligarSumario();
  ligarEspelhoDeFormulario();

  /* Ação de menu vira toast, para o dropdown provar que emite evento. */
  document.addEventListener('lc-select', (e) => {
    if (window.lc) window.lc.toast(`Ação: ${e.detail.value}`, { variant: 'brand' });
  });
}
