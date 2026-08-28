import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-logo.css.js';
import { GEOMETRIAS, VIEWBOX_SIMBOLO } from './marca.js';

/**
 * Variante pública → o que desenhar.
 *
 * Seis variantes sobre duas geometrias. O Figma entrega `default`, `Negativo`
 * e `mini`; `mini-negative` é a mini pintada de branco — a mesma relação que
 * `negative` tem com `default`, aplicada à outra geometria.
 *
 * `symbol` e `symbol-negative` são o monograma SOZINHO, sem letreiro. Não é
 * geometria nova: é a horizontal com o letreiro omitido e a caixa fechada no
 * monograma (ver `VIEWBOX_SIMBOLO`). Existem para o lugar apertado onde o lockup
 * não cabe e a `mini` também não serve, porque ela leva o letreiro miúdo embaixo
 * e ele vira borrão abaixo de uns 40px.
 *
 * O caso que as trouxe foi o trilho de 56px do `lc-sidebar`, que trocava lockup
 * por monograma em dois slots. A barra deixou de carregar a marca — ela mora no
 * cabeçalho da aplicação — e o caso mudou de lugar sem mudar de natureza: é o
 * cabeçalho que estreita no telefone.
 */
const VARIANTES = {
  default: { geometria: 'horizontal' },
  negative: { geometria: 'horizontal' },
  mini: { geometria: 'mini' },
  'mini-negative': { geometria: 'mini' },
  symbol: { geometria: 'horizontal', soSimbolo: true },
  'symbol-negative': { geometria: 'horizontal', soSimbolo: true },
};

/**
 * @summary A marca BNG LinkCare, nas seis variantes.
 * @documentation ./lc-logo.md
 * @status experimental
 * @since 0.2
 *
 * @csspart svg - O elemento <svg>.
 * @csspart symbol - O grupo do monograma `bng`.
 * @csspart wordmark - O grupo do letreiro "LinkCare".
 *
 * @cssproperty --height - Altura do logo. Padrão `2em`, que acompanha a
 *   tipografia do contexto. A largura sai da proporção e não se ajusta.
 * @cssproperty --symbol-color - Cor do monograma. Sobrescreve a da variante.
 * @cssproperty --wordmark-color - Cor do letreiro. Sobrescreve a da variante.
 *
 * ```html
 * <lc-logo></lc-logo>
 * <lc-logo variant="negative"></lc-logo>
 * <lc-logo variant="mini" style="--height: 56px"></lc-logo>
 * <lc-logo variant="mini-negative"></lc-logo>
 * <lc-logo variant="symbol"></lc-logo>
 * <lc-logo variant="symbol-negative"></lc-logo>
 * ```
 *
 * É O ÚNICO SVG INLINE PERMITIDO NO KIT. A regra 6 do AGENTS.md — "ícone
 * sempre por <lc-icon>, nunca SVG inline" — existe para que ninguém cole
 * vetor solto no protótipo; o logo é vetor, mas encapsulado numa tag, que é
 * exatamente o que a regra pede. Colar o SVG do logo à mão continua errado.
 *
 * Não é `<img src="logo.svg">` porque o negativo precisa ser a MESMA peça
 * repintada: com arquivo seriam seis downloads e seis chances de alguém
 * publicar o azul sobre fundo azul.
 *
 * Sobre acessibilidade: o logo NASCE com nome acessível ("BNG LinkCare"),
 * ao contrário do lc-icon, que nasce decorativo. O logo quase sempre carrega
 * o nome do produto — e quando não carrega (já há um <h1> com o nome ao
 * lado, ou ele está dentro de um link que já se anuncia), silencie com
 * `label=""` em vez de deixar o leitor de tela anunciar duas vezes.
 */
export class LcLogo extends LcElement {
  static css = [styles];

  static properties = {
    /**
     * Qual peça da marca desenhar.
     * @type {'default'|'negative'|'mini'|'mini-negative'|'symbol'|'symbol-negative'}
     */
    variant: { type: 'string', default: 'default' },
    /** Nome acessível. `label=""` torna o logo decorativo. */
    label: { type: 'string', default: 'BNG LinkCare' },
  };

  static watch = {
    variant: 'render',
    label: 'applyA11y',
  };

  ready() {
    this.render();
    this.applyA11y();
  }

  /**
   * Reescreve o shadow root a cada troca de variante.
   *
   * O LcElement clona o template UMA vez justamente para não perder foco nem
   * estado ao re-renderizar — mas aqui não há o que perder: o logo é folha,
   * não tem foco, não tem slot e não tem estado interno. Vale o mesmo
   * argumento do lc-icon, que também renderiza por innerHTML.
   *
   * A alternativa seria pôr as duas geometrias no template e alternar por
   * CSS. Custaria os onze paths da geometria não usada em TODA instância —
   * e o logo costuma aparecer no cabeçalho de todas as telas.
   */
  render() {
    let spec = VARIANTES[this.variant];

    if (!spec) {
      console.warn(
        `[lc-components] <lc-logo>: variante "${this.variant}" não existe. ` +
          `Use ${Object.keys(VARIANTES).join(', ')}. Desenhando "default".`,
      );
      spec = VARIANTES.default;
    }

    const { viewBox, simbolo, letreiro } = GEOMETRIAS[spec.geometria];
    const paths = (lista) => lista.map((d) => `<path d="${d}"/>`).join('');

    /* O grupo do letreiro é emitido MESMO VAZIO nas variantes de símbolo. Custa
       um `<g>` e mantém `::part(wordmark)` existindo em todas as seis — quem
       escreveu um seletor de part não o vê sumir ao trocar de variante. */
    this.shadowRoot.innerHTML =
      `<svg part="svg" viewBox="${spec.soSimbolo ? VIEWBOX_SIMBOLO : viewBox}" aria-hidden="true">` +
      `<g part="symbol" class="simbolo">${paths(simbolo)}</g>` +
      `<g part="wordmark" class="letreiro">${spec.soSimbolo ? '' : paths(letreiro)}</g>` +
      `</svg>`;
  }

  /**
   * O nome acessível fica no HOST, não no <svg>: o svg é aria-hidden e existe
   * só como desenho. Mesmo arranjo do lc-icon.
   */
  applyA11y() {
    if (this.label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', this.label);
      this.removeAttribute('aria-hidden');
    } else {
      this.setAttribute('aria-hidden', 'true');
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
    }
  }
}

define('lc-logo', LcLogo);
