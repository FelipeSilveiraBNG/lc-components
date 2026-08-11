/*
 * check-syntax.mjs — guarda de sintaxe de todo arquivo JS do kit.
 *
 * Portado do me-bricks (tools/check-syntax.mjs), cujo cabeçalho documenta o bug
 * MEDIDO duas vezes no mesmo dia: os componentes montam CSS e template com
 * template literal, e um backtick dentro de um comentário do CSS (citando um nome
 * de propriedade, por exemplo) ENCERRA a string e o arquivo vira SyntaxError.
 *
 * POR QUE A GUARDA EXISTE: o modo de falha é cruel. A exceção aborta a avaliação
 * do módulo, nenhuma tag se registra, e o sintoma na tela é "as tags <lc-*>
 * viraram texto cru" — que aponta para três causas erradas (404, cópia
 * duplicada, tag self-closing) antes da certa.
 *
 * COMO: importa cada arquivo. Em Node não existe `document`, então quase todo
 * arquivo do kit falha com ReferenceError ao ser avaliado — e isso é APROVAÇÃO,
 * porque significa que o arquivo foi parseado inteiro antes de rodar. Só
 * SyntaxError reprova.
 *
 *   node tools/check-syntax.mjs
 */
import { readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

function listarJs(dir) {
  const saida = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) saida.push(...listarJs(caminho));
    else if (entrada.name.endsWith('.js')) saida.push(caminho);
  }
  return saida;
}

/* `demo/` entra na varredura porque o casco da documentação virou módulo
   (demo/docs.js). Enquanto ele era um <script> dentro do index.html, não havia
   lint que o alcançasse — e foi exatamente ali que passou um erro que derrubava
   o módulo inteiro. Código que roda merece guarda, esteja em componente ou não. */
const arquivos = [...listarJs(join(RAIZ, 'components')), ...listarJs(join(RAIZ, 'demo'))].sort();
const falhas = [];

for (const arquivo of arquivos) {
  const nome = relative(RAIZ, arquivo).split('\\').join('/');
  try {
    await import(pathToFileURL(arquivo).href);
  } catch (erro) {
    if (erro instanceof SyntaxError) falhas.push({ nome, mensagem: erro.message });
  }
}

if (falhas.length > 0) {
  console.error('FALHA de sintaxe:\n');
  for (const f of falhas) console.error(`  ${f.nome}: ${f.mensagem}`);
  console.error(
    '\nCausa provável: backtick dentro de um template literal (ex.: nome de\n' +
      'propriedade CSS citado entre backticks num comentário). Isso encerra a\n' +
      'string e derruba o módulo inteiro — e o sintoma na página é "as tags\n' +
      '<lc-*> viraram texto cru", que não parece erro de sintaxe.',
  );
  process.exit(1);
}

console.log(`OK — ${arquivos.length} arquivo(s) JS sem erro de sintaxe.`);
