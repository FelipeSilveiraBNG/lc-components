/*
 * Arné de teste mínimo. Cada página de teste é autoafirmativa: renderiza os
 * resultados na tela E publica em `window.__lcResults`, para que a mesma página
 * sirva de teste automatizado (Playwright) e de demonstração para humano.
 *
 * É o padrão do me-bricks (test/*.html + test/demos.test.mjs).
 *
 * Três veredictos, não dois:
 *   PASS     esperado e obtido
 *   FAIL     regressão — reprova a suíte
 *   HERDADO  defeito do produto que o tema reproduz fielmente. Não reprova, mas
 *            fica visível: é a regra "não replicar bug em silêncio" (doc 06 §5).
 *
 * ── A linha que separa FAIL de HERDADO ──────────────────────────────────────
 * FAIL é para o que é responsabilidade do KIT: paridade do contrato, token que
 * resolve, tema que muda de fato, overlay que não recorta, formulário que
 * associa. Se isso quebra, quebramos nós.
 *
 * HERDADO é para defeito que já existe no produto e que o tema REPRODUZ de
 * propósito — contraste de cor, principalmente. Os dois temas são reprodução
 * medida, não proposta (ver o cabeçalho de temas/modern.css); "consertar" a cor
 * aqui faria o protótipo deixar de parecer com o sistema que ele existe para
 * representar. O lugar de consertar é a decisão de design, e é para alimentá-la
 * que esta lista existe.
 *
 * O que NÃO é aceitável: transformar FAIL em HERDADO para a suíte ficar verde.
 * HERDADO exige que o valor tenha vindo medido do produto.
 */

const results = [];
window.__lcResults = results;

export function check(name, condition, detail = '') {
  results.push({ name, verdict: condition ? 'PASS' : 'FAIL', detail: String(detail) });
}

export function inherited(name, condition, note) {
  results.push({
    name,
    verdict: condition ? 'PASS' : 'HERDADO',
    detail: condition ? '' : note,
  });
}

export function render(target = document.body) {
  const fails = results.filter((r) => r.verdict === 'FAIL');
  const herdados = results.filter((r) => r.verdict === 'HERDADO');

  const table = document.createElement('table');
  table.className = 'lc-table lc-table--striped';
  table.innerHTML =
    '<thead><tr><th>Verificação</th><th>Veredicto</th><th>Detalhe</th></tr></thead><tbody></tbody>';
  const tbody = table.querySelector('tbody');

  for (const r of results) {
    const tr = document.createElement('tr');
    const color =
      r.verdict === 'PASS' ? 'success' : r.verdict === 'FAIL' ? 'danger' : 'warning';
    tr.innerHTML = `<td>${r.name}</td><td><span class="lc-badge lc-badge--${color}">${r.verdict}</span></td><td class="lc-quiet">${r.detail}</td>`;
    tbody.append(tr);
  }

  const summary = document.createElement('p');
  summary.id = 'resumo';
  summary.className = 'lc-h2';
  summary.textContent =
    `${results.length - fails.length - herdados.length} PASS · ` +
    `${fails.length} FAIL · ${herdados.length} HERDADO`;

  target.append(summary, table);
  window.__lcDone = true;
}
