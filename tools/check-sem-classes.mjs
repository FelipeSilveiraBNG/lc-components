/*
 * check-sem-classes.mjs — o trilho da migração do ADR 0001.
 *
 * O ADR aposenta a camada de classes de componente. O risco de uma migração
 * dessas não é escrever os componentes: é a classe antiga sobreviver esquecida
 * em algum arquivo, funcionando, até alguém copiar aquele trecho e propagar o
 * padrão morto. Numa doc de 13 páginas, isso é questão de tempo.
 *
 * Então a lista abaixo é a fonte da verdade de "o que já foi aposentado". Cada
 * fase da migração acrescenta entradas AQUI e, a partir daquele commit, usar a
 * classe reprova o portão.
 *
 * A lista começa VAZIA de propósito: nada foi aposentado ainda, e um lint que
 * passa trivialmente hoje é o que garante que ele está ligado e correto quando
 * a primeira entrada entrar.
 *
 *   node tools/check-sem-classes.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => relative(RAIZ, p).split('\\').join('/');

/*
 * APOSENTADAS — classe → o que usar no lugar.
 *
 * Preencher fase por fase, junto com o componente que a substitui. Não
 * acrescente entrada antes de a tag existir: a mensagem manda o autor usar algo,
 * e ela precisa ser verdade no commit em que entra.
 */
const APOSENTADAS = {
  /* fase 2 */
  'lc-badge': '<lc-badge variant="...">',
  'lc-alert': '<lc-alert variant="..." appearance="banner">',
  'lc-card': '<lc-card variant="..."> com slots header/footer',

  /* fase 3 */
  'lc-btn': '<lc-button variant="..." size="..." appearance="plain">',
  'lc-btn-group': '<lc-button-group label="...">',

  /* fase 4 — os quatro do campo desapareceram absorvidos pelo controle */
  'lc-input': '<lc-input label="...">',
  'lc-select': '<lc-select label="..."> com <option> dentro',
  'lc-textarea': '<lc-textarea label="...">',
  'lc-field': 'nada: o controle é dono do rótulo (decisão B do ADR)',
  'lc-label': 'o atributo label, ou o slot label',
  'lc-error': 'setCustomValidity(), não markup — erro é estado de validade',
  'lc-hint': 'o atributo hint, ou o slot hint',
  'lc-menu-item': '<lc-menu-item value="...">',
};

/*
 * NÃO estão aqui, e não é esquecimento:
 *
 *   lc-table e modificadores — o parser HTML proíbe componentizar linha e célula
 *   lc-page, lc-page-body, lc-h1, lc-h2, lc-quiet, lc-link — tipografia e layout
 *   lc-stack, lc-row, lc-grow, lc-clamp-*, lc-cloak, lc-no-print… — utilitários
 *
 * Ver as duas exceções no ADR 0001.
 */

/* Onde procurar. `components/` fica de fora: componente PODE citar classe no
   próprio JSDoc enquanto documenta a transição. */
const ALVOS = ['demo', 'test'];
const ARQUIVOS_SOLTOS = ['AGENTS.md', 'README.md'];
const EXTENSOES = ['.html', '.js', '.css', '.md'];

function listar(dir) {
  const saida = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) saida.push(...listar(caminho));
    else if (EXTENSOES.some((e) => entrada.name.endsWith(e))) saida.push(caminho);
  }
  return saida;
}

const arquivos = [
  ...ALVOS.flatMap((d) => listar(join(RAIZ, d))),
  ...ARQUIVOS_SOLTOS.map((f) => join(RAIZ, f)),
];

const falhas = [];
const isentas = [];

/*
 * Válvula explícita: uma linha com o marcador `lc-permite-classe` é ignorada.
 *
 * Existe para a menção HISTÓRICA — um comentário que explica que `.lc-btn--brand`
 * disputava especificidade com `.lc-btn`, por exemplo, precisa citar os nomes para
 * fazer sentido. Proibir isso apagaria a memória do defeito, que é o oposto do que
 * o kit faz com os próprios bugs.
 *
 * O relatório CONTA as isenções mesmo quando passa: uma válvula que ninguém vê
 * cresce até o lint não valer nada.
 */
const MARCADOR = 'lc-permite-classe';

for (const arquivo of arquivos) {
  const linhas = readFileSync(arquivo, 'utf8').split('\n');

  linhas.forEach((linha, i) => {
    if (linha.includes(MARCADOR)) {
      isentas.push(`${rel(arquivo)}:${i + 1}`);
      return;
    }
    for (const [classe, substituto] of Object.entries(APOSENTADAS)) {
      /* ── Por que dois padrões, e não o nome solto ────────────────────────────
         MEDIDO: procurar o nome solto acusou 221 usos, quase todos falsos — o
         nome da classe aposentada é IGUAL ao da tag que a substitui
         (`lc-alert` a classe, `<lc-alert>` a tag), então o lint reprovava
         justamente o código correto.

         Então procuramos USO como classe, em duas formas:
           1. dentro de um `class="..."` — o código;
           2. com ponto na frente (`.lc-alert`) — seletor CSS e a prosa da
              documentação, porque doc que ensina classe morta é tão ruim quanto
              código que a usa.

         `(?![a-z])` no fim deixa o modificador casar (`.lc-btn--brand`) sem que
         `lc-btn` pegue outra classe que só COMECE igual. */
      const emAtributo = new RegExp(`class="[^"]*(?<![\\w-])${classe}(?![a-z])`);
      const comPonto = new RegExp(`\\.${classe}(?![a-z])`);
      if (emAtributo.test(linha) || comPonto.test(linha)) {
        falhas.push({
          arquivo: rel(arquivo),
          linha: i + 1,
          classe,
          substituto,
          trecho: linha.trim().slice(0, 90),
        });
      }
    }
  });
}

if (falhas.length > 0) {
  console.error(`FALHA: ${falhas.length} uso(s) de classe aposentada.\n`);
  for (const f of falhas) {
    console.error(`  ${f.arquivo}:${f.linha}  ${f.classe} → use ${f.substituto}`);
    console.error(`    ${f.trecho}`);
  }
  console.error(
    `\nEssas classes foram aposentadas pelo ADR 0001. Se alguma ainda for\n` +
      `necessária, o lugar de discutir é o ADR — não reintroduzir o uso.`,
  );
  process.exit(1);
}

const n = Object.keys(APOSENTADAS).length;
console.log(
  `OK — ${n} classe(s) aposentada(s), sem uso em ${arquivos.length} arquivo(s) varrido(s).`,
);
if (isentas.length) {
  console.log(`\n${isentas.length} linha(s) com "${MARCADOR}" (menção histórica permitida):`);
  for (const l of isentas) console.log(`  ${l}`);
}
