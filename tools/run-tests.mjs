/*
 * run-tests.mjs — roda as páginas de test/ num Chromium headless.
 *
 * O kit não tem package.json (mesma escolha do me-bricks: zero build, zero
 * dependência de runtime). Então o Playwright é EMPRESTADO de um projeto vizinho.
 * Ajuste com a variável de ambiente se o caminho mudar:
 *
 *   LC_PLAYWRIGHT=/caminho/para/node_modules/playwright node tools/run-tests.mjs
 *
 * Serve os arquivos por HTTP com o módulo http do Node — ES modules não
 * funcionam em file://, e depender de `npx serve` seria mais uma dependência.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGINAS = ['tema.html', 'clipping.html', 'formulario.html'];

/* Import de diretório não funciona em ESM: precisa apontar para o index.js. */
const PLAYWRIGHT =
  process.env.LC_PLAYWRIGHT ??
  resolve(RAIZ, '..', 'minhaescala_web', 'node_modules', 'playwright', 'index.js');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    const caminho = join(RAIZ, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!caminho.startsWith(RAIZ)) throw new Error('fora da raiz');
    const corpo = await readFile(caminho);
    res.writeHead(200, { 'content-type': TIPOS[extname(caminho)] ?? 'application/octet-stream' });
    res.end(corpo);
  } catch {
    res.writeHead(404).end('não encontrado');
  }
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

let chromium;
try {
  // O pacote do Playwright é CommonJS: dependendo do interop, os exports vêm em
  // `default`. Aceitamos os dois formatos.
  const mod = await import(pathToFileURL(PLAYWRIGHT).href);
  chromium = mod.chromium ?? mod.default?.chromium;
  if (!chromium) throw new Error('o módulo não expõe `chromium`');
} catch (erro) {
  console.error(
    `Não achei o Playwright em ${PLAYWRIGHT}.\n` +
      `Aponte com LC_PLAYWRIGHT=<caminho para node_modules/playwright>.\n${erro.message}`,
  );
  server.close();
  process.exit(1);
}

const browser = await chromium.launch();
let totalFail = 0;
let totalPass = 0;
let totalHerdado = 0;

for (const pagina of PAGINAS) {
  const page = await browser.newPage();
  const erros = [];
  page.on('pageerror', (e) => erros.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(m.text());
  });

  await page.goto(`${base}/test/${pagina}`);

  let resultados = [];
  try {
    await page.waitForFunction('window.__lcDone === true', null, { timeout: 15000 });
    resultados = await page.evaluate('window.__lcResults');
  } catch {
    erros.push('a página não terminou de rodar (window.__lcDone nunca virou true)');
  }

  /* ── Passo dirigido: a pilha do Esc ─────────────────────────────────────
     Light dismiss de popover e Esc de <dialog> só reagem a entrada de teclado
     REAL — evento sintético na página não dispara. Então esta asserção mora
     aqui, onde há um teclado de verdade. É o teste que decide se precisamos de
     uma pilha de dismissíveis própria (doc 09 §3.8) ou se o top layer nativo já
     resolve: se o Esc fecha o menu e MANTÉM o modal, não precisamos. */
  if (pagina === 'clipping.html') {
    const montado = await page.evaluate('Boolean(window.__lcEsc)');
    if (montado) {
      await page.evaluate(`
        window.__lcEsc.modal.show();
        window.__lcEsc.dropdown.show();
      `);
      await page.waitForTimeout(120);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(120);

      const estado = await page.evaluate(`({
        menuAberto: window.__lcEsc.dropdown.shadowRoot.querySelector('.panel').matches(':popover-open'),
        modalAberto: window.__lcEsc.modal.shadowRoot.querySelector('.dialog').open,
      })`);

      resultados.push({
        name: '[driver] Esc fecha o dropdown',
        verdict: estado.menuAberto ? 'FAIL' : 'PASS',
        detail: `menuAberto=${estado.menuAberto}`,
      });
      resultados.push({
        name: '[driver] Esc NÃO fecha o modal junto — top layer nativo coordena',
        verdict: estado.modalAberto ? 'PASS' : 'FAIL',
        detail: `modalAberto=${estado.modalAberto}`,
      });
    }
  }

  const fails = resultados.filter((r) => r.verdict === 'FAIL');
  const herdados = resultados.filter((r) => r.verdict === 'HERDADO');
  const passes = resultados.length - fails.length - herdados.length;

  totalFail += fails.length + (resultados.length ? 0 : 1);
  totalPass += passes;
  totalHerdado += herdados.length;

  console.log(
    `\n${pagina} — ${passes} PASS · ${fails.length} FAIL · ${herdados.length} HERDADO`,
  );
  for (const r of fails) console.log(`   FAIL     ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  for (const r of herdados) console.log(`   HERDADO  ${r.name} — ${r.detail}`);
  for (const e of erros) console.log(`   ERRO NA PÁGINA: ${e}`);
  if (erros.length) totalFail += erros.length;

  await page.close();
}

await browser.close();
server.close();

console.log(
  `\n${'='.repeat(60)}\nTOTAL: ${totalPass} PASS · ${totalFail} FAIL · ${totalHerdado} HERDADO`,
);
if (totalHerdado) {
  console.log(
    'HERDADO = defeito conhecido do legado, reproduzido de propósito e anotado.\n' +
      'Não reprova a suíte, mas está visível de propósito (doc 06 §5).',
  );
}
process.exit(totalFail > 0 ? 1 : 0);
