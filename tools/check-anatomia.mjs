/*
 * check-anatomia.mjs — a guarda que faz a regra de ouro nº 2 ser cumprível.
 *
 * A regra diz: "nunca reestilize componente por dentro; use atributo, `::part()`
 * ou a custom property documentada". Isso só é uma instrução honesta se o
 * conjunto de `part` documentados for igual ao conjunto de `part` que existe de
 * fato no shadow root. Se divergir, a regra manda o consumidor usar uma porta
 * que não existe — ou esconde dele uma que existe.
 *
 * O ADR 0001 aposenta a camada de classes: `.lc-btn--brand` deixa de existir e
 * o gancho equivalente passa a ser `::part(base)`. Ou seja, a partir daqui a
 * superfície de estilo do kit É a lista de parts. Ela precisa de lint pelo mesmo
 * motivo que o contrato de tokens precisa: sem verificação, é boa intenção.
 *
 * A ideia de ter lint de convenção no portão de publicação vem do Web Awesome
 * (`scripts/check-css-parts.js`, `check-anatomy.js` — doc 09 §2.6). Este é o
 * nosso equivalente.
 *
 * VERIFICA, nos dois sentidos:
 *   1. todo `@csspart x` documentado aparece como `part="x"` no componente;
 *   2. todo `part="x"` no componente está documentado com `@csspart x`;
 *   3. o mesmo par para `@slot` e `<slot name="x">`, incluindo o slot default.
 *
 *   node tools/check-anatomia.mjs
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => relative(RAIZ, p).split('\\').join('/');

/** Componente = diretório `components/lc-*` com um `<nome>.js` dentro. */
function componentes() {
  const base = join(RAIZ, 'components');
  const saida = [];
  for (const entrada of readdirSync(base, { withFileTypes: true })) {
    if (!entrada.isDirectory() || !entrada.name.startsWith('lc-')) continue;
    const js = join(base, entrada.name, `${entrada.name}.js`);
    const css = join(base, entrada.name, `${entrada.name}.css.js`);
    if (!existsSync(js)) continue;
    saida.push({ tag: entrada.name, js, css: existsSync(css) ? css : null });
  }
  return saida;
}

const capturar = (texto, re, grupo = 1) => {
  const set = new Set();
  for (const m of texto.matchAll(re)) set.add(m[grupo]);
  return set;
};

const falhas = [];

for (const { tag, js, css } of componentes()) {
  const fonteJs = readFileSync(js, 'utf8');
  /* O CSS entra na leitura porque `::part()` e `::slotted()` de dentro do
     próprio componente também são uso — mas NÃO contam como definição. */
  const fonteCss = css ? readFileSync(css, 'utf8') : '';

  /* ── Parts ─────────────────────────────────────────────────────────────── */
  const documentados = capturar(fonteJs, /@csspart\s+([a-z][a-z0-9-]*)/g);

  /* `part="a b"` define DOIS parts. Por isso o split. */
  const reais = new Set();
  for (const m of fonteJs.matchAll(/\bpart="([^"]+)"/g)) {
    for (const nome of m[1].trim().split(/\s+/)) reais.add(nome);
  }
  /* Componente que cria nó por script usa setAttribute('part', '...'). */
  for (const m of fonteJs.matchAll(/setAttribute\(\s*['"]part['"]\s*,\s*['"]([^'"]+)['"]/g)) {
    for (const nome of m[1].trim().split(/\s+/)) reais.add(nome);
  }

  for (const p of documentados) {
    if (!reais.has(p)) {
      falhas.push(
        `${tag}: @csspart ${p} está documentado mas nenhum nó tem part="${p}". ` +
          `O consumidor seguiria a doc e escreveria um ::part() que nunca casa.`,
      );
    }
  }
  for (const p of reais) {
    if (!documentados.has(p)) {
      falhas.push(
        `${tag}: existe part="${p}" mas não há @csspart ${p} no JSDoc. ` +
          `Gancho de estilo não documentado é gancho que ninguém sabe que pode usar — ` +
          `e que a próxima refatoração remove sem avisar.`,
      );
    }
  }

  /* Uso de ::part() dentro do próprio componente também precisa existir. */
  for (const p of capturar(fonteCss, /::part\(\s*([a-z][a-z0-9-]*)\s*\)/g)) {
    if (!reais.has(p)) {
      falhas.push(`${tag}: ${rel(css)} estiliza ::part(${p}), que nenhum nó define.`);
    }
  }

  /* ── Slots ─────────────────────────────────────────────────────────────── */
  /* `@slot nome - desc` é slot nomeado; `@slot - desc` é o default. */
  const slotsDoc = new Set();
  for (const m of fonteJs.matchAll(/@slot\s+(?:([a-z][a-z0-9-]*)\s+)?-/g)) {
    slotsDoc.add(m[1] ?? '(default)');
  }

  const slotsReais = new Set();
  for (const m of fonteJs.matchAll(/<slot\b([^>]*)>/g)) {
    const nome = m[1].match(/name="([^"]+)"/);
    slotsReais.add(nome ? nome[1] : '(default)');
  }

  for (const s of slotsDoc) {
    if (!slotsReais.has(s)) {
      falhas.push(`${tag}: @slot ${s} documentado, mas não existe <slot> correspondente.`);
    }
  }
  for (const s of slotsReais) {
    if (!slotsDoc.has(s)) {
      falhas.push(
        `${tag}: existe <slot${s === '(default)' ? '' : ` name="${s}"`}> sem @slot no JSDoc.`,
      );
    }
  }
}

if (falhas.length > 0) {
  console.error('FALHA de anatomia:\n');
  for (const f of falhas) console.error(`  ${f}`);
  console.error(
    `\nA regra de ouro nº 2 ("nunca reestilize por dentro") só é honesta se a lista\n` +
      `de parts documentada for exatamente a que existe. Ver docs/adr/0001.`,
  );
  process.exit(1);
}

const total = componentes().length;
console.log(`OK — anatomia de ${total} componente(s): parts e slots documentados batem com o real.`);
