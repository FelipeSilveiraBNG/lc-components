/*
 * define() — registro de custom element tolerante a colisão de nome.
 *
 * Portado do me-bricks (minhaescala_design/me-bricks/components/define.js), cujo
 * cabeçalho documenta um bug MEDIDO: `customElements.define` lança
 * NotSupportedError quando a tag já existe, e como a chamada fica no topo do
 * módulo a exceção aborta a avaliação dele e, em cascata, dos imports seguintes.
 * Duas cópias do kit na mesma página (URLs/versões diferentes) são grafos de
 * módulo distintos. No me-bricks, uma colisão em Sidebar.js derrubou 14 das 23
 * tags registradas.
 *
 * POLÍTICA: first-wins. Não é escolha — o CustomElementRegistry é append-only,
 * não existe redefinir uma tag. A primeira cópia avaliada vence; as seguintes
 * são ignoradas com aviso agregado e nunca lançam.
 *
 * ISTO É CONTENÇÃO DE DANO, NÃO CURA: com duas cópias, as tags usam a definição
 * da primeira, então a versão declarada no <head> pode não ser a que roda. O
 * aviso existe para isso ser diagnosticável em vez de silencioso.
 */

const collided = [];
let scheduled = false;

/**
 * Registra a tag, chamando `finalize()` antes para que `observedAttributes` já
 * esteja pronto quando o navegador ler a classe.
 * @param {string} tag
 * @param {CustomElementConstructor & { finalize?: () => void }} ctor
 * @returns {boolean} true se registrou, false se a tag já existia
 */
export function define(tag, ctor) {
  const existing = customElements.get(tag);

  if (existing) {
    // existing === ctor só ocorre chamando define() duas vezes no mesmo módulo;
    // colisão real tem construtor diferente = outra cópia do kit.
    if (existing !== ctor) {
      collided.push(tag);
      if (!scheduled) {
        scheduled = true;
        // O grafo de módulos avalia num único job, então o microtask agrega
        // todas as colisões desta cópia num aviso só.
        queueMicrotask(report);
      }
    }
    return false;
  }

  if (typeof ctor.finalize === 'function') ctor.finalize();
  customElements.define(tag, ctor);
  return true;
}

function report() {
  console.warn(
    `[lc-bricks] ${collided.length} tag(s) já estavam registradas e foram ignoradas: ` +
      `${collided.join(', ')}.\n` +
      `Há mais de uma cópia do lc-bricks nesta página. Mantenha um único ` +
      `<script type="module"> do kit — as tags acima seguem usando a definição da ` +
      `cópia que carregou primeiro.`,
  );
  collided.length = 0;
  scheduled = false;
}
