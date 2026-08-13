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
  // fase 2:
  //   'lc-badge': '<lc-badge>',
};

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

for (const arquivo of arquivos) {
  const linhas = readFileSync(arquivo, 'utf8').split('\n');

  linhas.forEach((linha, i) => {
    for (const [classe, substituto] of Object.entries(APOSENTADAS)) {
      /* Casa a classe como PALAVRA, para `lc-btn` não pegar `lc-btn-group`.
         Procura em qualquer contexto (class="", className, seletor CSS, prosa
         de markdown), porque documentação que ensina a classe morta é tão
         ruim quanto código que a usa. */
      const re = new RegExp(`(?<![\\w-])${classe}(?![\\w-])`);
      if (re.test(linha)) {
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
if (n === 0) {
  console.log(
    `OK — nenhuma classe aposentada ainda (a migração do ADR 0001 não começou a remover). ` +
      `${arquivos.length} arquivo(s) varrido(s).`,
  );
} else {
  console.log(`OK — ${n} classe(s) aposentada(s), sem uso em ${arquivos.length} arquivo(s).`);
}
