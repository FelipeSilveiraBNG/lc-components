/*
 * check-contrato.mjs — o lint que faz a promessa de multi-tema ser verdadeira.
 *
 * O plano (doc 07 §6.1) declara cinco regras de token. Sem verificação, elas são
 * boa intenção: basta um componente ler um token que só um dos temas define, e o
 * kit passa a renderizar errado no outro tema — silenciosamente, meses depois,
 * numa tela que ninguém estava olhando.
 *
 * A ideia de ter lints próprios de convenção no portão de publicação é do Web
 * Awesome (scripts/check-css-parts.js, check-anatomy.js — doc 09 §2.6). Este é o
 * nosso equivalente, e verifica o que mais importa aqui:
 *
 *   1. PARIDADE — os dois temas definem exatamente o mesmo conjunto de tokens.
 *      É a regra R2. Sem ela, trocar de tema deixa buracos.
 *   2. PERTENCIMENTO — todo `--lc-*` lido por componente ou pela camada nativa
 *      existe no contrato. É a regra R1.
 *   3. ENCAPSULAMENTO — nenhum `--lc-_*` (primitivo) é lido fora de tokens/ e
 *      styles/temas/. Também R1, no outro sentido.
 *
 *   node tools/check-contrato.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => relative(RAIZ, p).split('\\').join('/');

/** Tokens DEFINIDOS num arquivo (lado esquerdo de `--x: valor`). */
function definidos(texto) {
  const set = new Set();
  for (const m of texto.matchAll(/(--lc-[a-z0-9-]+)\s*:/g)) set.add(m[1]);
  return set;
}

/** Tokens LIDOS num arquivo (dentro de `var(...)`). */
function lidos(texto) {
  const set = new Set();
  for (const m of texto.matchAll(/var\(\s*(--lc-[a-z0-9_-]+)/g)) set.add(m[1]);
  return set;
}

function listar(dir, ext) {
  const saida = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) saida.push(...listar(caminho, ext));
    else if (ext.some((e) => entrada.name.endsWith(e))) saida.push(caminho);
  }
  return saida;
}

const falhas = [];

// ── 1. Paridade entre os temas ────────────────────────────────────────────────
const temaLegacy = definidos(readFileSync(join(RAIZ, 'styles/temas/legacy.css'), 'utf8'));
const temaModern = definidos(readFileSync(join(RAIZ, 'styles/temas/modern.css'), 'utf8'));

const soLegacy = [...temaLegacy].filter((t) => !temaModern.has(t)).sort();
const soModern = [...temaModern].filter((t) => !temaLegacy.has(t)).sort();

for (const t of soLegacy) falhas.push(`PARIDADE: ${t} existe em legacy mas não em modern`);
for (const t of soModern) falhas.push(`PARIDADE: ${t} existe em modern mas não em legacy`);

const contrato = new Set([...temaLegacy, ...temaModern]);

// ── 2 e 3. Pertencimento e encapsulamento ────────────────────────────────────
const consumidores = [
  ...listar(join(RAIZ, 'components'), ['.js']),
  join(RAIZ, 'styles/native.css'),
  join(RAIZ, 'styles/utilities.css'),
];

for (const arquivo of consumidores) {
  const texto = readFileSync(arquivo, 'utf8');
  for (const token of lidos(texto)) {
    if (token.startsWith('--lc-_')) {
      falhas.push(
        `ENCAPSULAMENTO: ${rel(arquivo)} lê o primitivo ${token}. ` +
          `Primitivo só é lido por styles/temas/*.css — leia o token de contrato equivalente.`,
      );
    } else if (!contrato.has(token)) {
      falhas.push(
        `PERTENCIMENTO: ${rel(arquivo)} lê ${token}, que nenhum tema define. ` +
          `Acrescente ao contrato nos DOIS temas, ou corrija o nome.`,
      );
    }
  }
}

// ── Relatório ────────────────────────────────────────────────────────────────
if (falhas.length > 0) {
  console.error('FALHA no contrato de tokens:\n');
  for (const f of falhas) console.error(`  ${f}`);
  console.error(
    `\nRegras em framework-prototipos/07-arquitetura.md §6.1.\n` +
      `O ponto: um token que só um tema define é um buraco que aparece meses\n` +
      `depois, na tela que ninguém estava olhando.`,
  );
  process.exit(1);
}

console.log(
  `OK — contrato com ${contrato.size} tokens, definidos pelos 2 temas, ` +
    `e ${consumidores.length} arquivo(s) consumidor(es) sem violação.`,
);
