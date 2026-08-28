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
const PAGINAS = [
  'tema.html',
  'clipping.html',
  'formulario.html',
  /* Componentes que substituem a camada de classes (ADR 0001). */
  'componentes-basicos.html',
  'botao.html',
  'campos.html',
  /* A gaveta do telefone. Metade das asserções está no driver: precisa de
     viewport estreito e de Esc de verdade. */
  'gaveta.html',
];

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

  /* ── Passo dirigido: a gaveta do telefone ───────────────────────────────
     Duas coisas que a página não consegue fazer sozinha. A primeira é ESTREITAR
     A JANELA: `window.resizeTo` é bloqueado, e a faixa da gaveta é uma media
     query de viewport — só o driver muda isso. A segunda é o Esc, pelo mesmo
     motivo que já valia para o `clipping.html`: o Esc do `<dialog>` reage a
     tecla de verdade, não a `KeyboardEvent` sintético.

     A barra chega aqui RECOLHIDA de propósito: é como se prova que a faixa da
     gaveta ignora o trilho sem apagar o `collapsed` de quem o pediu. */
  if (pagina === 'gaveta.html') {
    const montado = await page.evaluate('Boolean(window.__lcGaveta)');
    if (montado) {
      const anota = (name, ok, detail = '') =>
        resultados.push({ name: `[driver] ${name}`, verdict: ok ? 'PASS' : 'FAIL', detail });

      /* ── A alça abre no hover, e diz o que o clique vai fazer ─────────
         Hover não se simula: `dispatchEvent(new MouseEvent('mouseover'))` não
         faz `:hover` casar. Precisa de ponteiro de verdade, que só o driver
         tem — mesmo motivo do Esc. A barra chega aqui RECOLHIDA da página. */
      const alcaEm = async () => {
        await page.hover('#barra >>> .alca');
        await page.waitForTimeout(300);
        return page.evaluate(`({
          largura: window.__lcGaveta.alca.getBoundingClientRect().width,
          rotulo: window.__lcGaveta.barra.shadowRoot.querySelector('.alca-rotulo').textContent,
          rotuloVisivel:
            window.__lcGaveta.barra.shadowRoot.querySelector('.alca-rotulo')
              .getBoundingClientRect().width > 20,
        })`);
      };

      let h = await alcaEm();
      anota(
        'a alça se abre de 20px para 128px no hover',
        Math.round(h.largura) === 128,
        `${h.largura.toFixed(1)}px`,
      );
      anota('e revela o rótulo, que em repouso tinha largura zero', h.rotuloVisivel);
      anota(
        'no trilho o hover diz EXPANDIR',
        h.rotulo === 'Expandir',
        `rótulo "${h.rotulo}"`,
      );

      /* Expande a barra e passa o mouse de novo: mesma animação, outra palavra.
         É esta a asserção que amarra "um hover para cada sentido". */
      await page.evaluate('window.__lcGaveta.barra.collapsed = false');
      await page.mouse.move(600, 600);
      await page.waitForTimeout(200);
      h = await alcaEm();
      anota(
        'expandida o hover diz RECOLHER — mesma abertura, outro sentido',
        h.rotulo === 'Recolher' && Math.round(h.largura) === 128,
        `rótulo "${h.rotulo}" · ${h.largura.toFixed(1)}px`,
      );
      /* Devolve o trilho: a faixa da gaveta abaixo conta com ele posto. */
      await page.evaluate('window.__lcGaveta.barra.collapsed = true');
      await page.mouse.move(600, 600);
      await page.waitForTimeout(200);

      /* ── Entra na faixa da gaveta ─────────────────────────────────────── */
      await page.setViewportSize({ width: 380, height: 720 });
      await page.waitForTimeout(200);

      let e = await page.evaluate(`({
        naFaixa: window.__lcGaveta.barra.matches(':state(drawer)'),
        noTrilho: window.__lcGaveta.barra.matches(':state(rail)'),
        collapsed: window.__lcGaveta.barra.hasAttribute('collapsed'),
        railNosFilhos: [...window.__lcGaveta.barra.children].some((f) => f.dataset.rail !== undefined),
        larguraBarra: window.__lcGaveta.barra.getBoundingClientRect().width,
        larguraConteudo: window.__lcGaveta.conteudo.getBoundingClientRect().width,
        gatilhoEscondido: getComputedStyle(window.__lcGaveta.gatilho).display === 'none',
        aberta: window.__lcGaveta.gaveta.open,
      })`);

      anota('abaixo de 767px a barra entra na faixa da gaveta', e.naFaixa);
      anota('a coluna vai a ZERO — sai do fluxo', Math.round(e.larguraBarra) === 0, `${e.larguraBarra}px`);
      anota('o conteúdo fica com a tela inteira', Math.round(e.larguraConteudo) === 380, `${e.larguraConteudo}px`);
      anota('o trilho deixa de existir na faixa da gaveta', !e.noTrilho && !e.railNosFilhos);
      anota('mas o collapsed de quem pediu NÃO é apagado', e.collapsed);
      anota('o gatilho do consumidor aparece (.lc-only-drawer)', !e.gatilhoEscondido);
      anota('entrar na faixa não abre a gaveta sozinha', !e.aberta);

      /* ── Abre pelo invocador, sem uma linha de JS na página ───────────── */
      await page.click('#gatilho');
      await page.waitForTimeout(450);

      e = await page.evaluate(`({
        aberta: window.__lcGaveta.gaveta.open,
        atributo: window.__lcGaveta.barra.hasAttribute('open'),
        caixa: window.__lcGaveta.gaveta.getBoundingClientRect().toJSON(),
        fimDoTopo: document.querySelector('.topo').getBoundingClientRect().bottom,
        veuComeca: getComputedStyle(window.__lcGaveta.gaveta, '::backdrop').insetBlockStart,
        eventos: window.__lcGaveta.eventos.slice(),
      })`);

      anota('data-lc-sidebar="toggle" abre a gaveta', e.aberta && e.atributo);
      anota(
        'a gaveta é encostada à esquerda e mede os 230px do painel',
        Math.round(e.caixa.width) === 230 && Math.round(e.caixa.left) === 0,
        JSON.stringify(e.caixa),
      );
      /* O --drawer-top da tela sai de `--lc-shell-row-height`, o MESMO token que
         dá a altura do cabeçalho. Se as duas linhas não coincidirem, ou o token
         não chegou à gaveta ou o `inset` não é o que se pensava. */
      anota(
        'a gaveta começa exatamente onde o cabeçalho termina',
        Math.round(e.caixa.top) === Math.round(e.fimDoTopo) &&
          Math.round(e.caixa.bottom) === 720,
        `gaveta ${e.caixa.top}–${e.caixa.bottom} · cabeçalho termina em ${e.fimDoTopo}`,
      );
      anota(
        'o véu começa na mesma linha — o ::backdrop herda o --drawer-top',
        parseFloat(e.veuComeca) === Math.round(e.fimDoTopo),
        `véu em ${e.veuComeca} · cabeçalho termina em ${e.fimDoTopo}`,
      );
      anota(
        'emitiu lc-show e lc-after-show',
        e.eventos.some((x) => x[0] === 'lc-show') && e.eventos.some((x) => x[0] === 'lc-after-show'),
        JSON.stringify(e.eventos),
      );

      /* ── Foco preso: o showModal nativo tem de bastar ─────────────────── */
      for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
      const foco = await page.evaluate(`({
        dentro: Boolean(document.activeElement?.closest?.('lc-sidebar')),
        onde: document.activeElement?.localName ?? '(nenhum)',
      })`);
      anota('o foco não escapa da gaveta em 12 Tabs', foco.dentro, `parou em <${foco.onde}>`);

      /* ── Esc, com tecla de verdade ───────────────────────────────────── */
      await page.keyboard.press('Escape');
      await page.waitForTimeout(450);
      e = await page.evaluate(`({
        aberta: window.__lcGaveta.gaveta.open,
        atributo: window.__lcGaveta.barra.hasAttribute('open'),
        eventos: window.__lcGaveta.eventos.slice(),
      })`);
      anota('Esc fecha a gaveta e apaga o atributo', !e.aberta && !e.atributo);
      anota(
        'o lc-hide do Esc diz de onde veio',
        e.eventos.some((x) => x[0] === 'lc-hide' && x[1] === 'escape'),
        JSON.stringify(e.eventos.filter((x) => x[0] === 'lc-hide')),
      );

      /* ── Clique no véu ───────────────────────────────────────────────── */
      await page.evaluate('window.__lcGaveta.barra.open = true');
      await page.waitForTimeout(450);
      /* x = 360 numa tela de 380: fora da gaveta de 230, em cima do véu. */
      await page.mouse.click(360, 400);
      await page.waitForTimeout(450);
      e = await page.evaluate(`({
        aberta: window.__lcGaveta.gaveta.open,
        eventos: window.__lcGaveta.eventos.slice(),
      })`);
      anota('clique no véu fecha a gaveta', !e.aberta);
      anota(
        'o lc-hide do véu diz de onde veio',
        e.eventos.some((x) => x[0] === 'lc-hide' && x[1] === 'backdrop'),
        JSON.stringify(e.eventos.filter((x) => x[0] === 'lc-hide')),
      );

      /* ── Sai da faixa com a gaveta ABERTA ────────────────────────────── */
      await page.evaluate('window.__lcGaveta.barra.open = true');
      await page.waitForTimeout(450);
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(450);
      e = await page.evaluate(`({
        aberta: window.__lcGaveta.gaveta.open,
        atributo: window.__lcGaveta.barra.hasAttribute('open'),
        naFaixa: window.__lcGaveta.barra.matches(':state(drawer)'),
        noTrilho: window.__lcGaveta.barra.matches(':state(rail)'),
        larguraBarra: window.__lcGaveta.barra.getBoundingClientRect().width,
        eventos: window.__lcGaveta.eventos.slice(),
      })`);
      anota('alargar a janela fecha a gaveta e apaga o open', !e.aberta && !e.atributo && !e.naFaixa);
      anota(
        'e devolve o trilho de 56px que o collapsed pedia',
        e.noTrilho && Math.round(e.larguraBarra) === 56,
        `${e.larguraBarra}px`,
      );
      anota(
        'o lc-after-hide sai mesmo quando quem fechou foi o breakpoint',
        e.eventos.filter((x) => x[0] === 'lc-after-hide').length === 3,
        JSON.stringify(e.eventos.map((x) => x[0])),
      );
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
