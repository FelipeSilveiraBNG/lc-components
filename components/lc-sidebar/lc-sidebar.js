import { define } from '../define.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-sidebar.css.js';

/**
 * @summary Barra de navegação lateral da aplicação.
 * @documentation ./lc-sidebar.md
 * @status experimental
 * @since 0.3
 *
 * @slot - Os `lc-sidebar-item`, `lc-sidebar-group` e `lc-sidebar-label`.
 * @slot brand - A marca no topo, normalmente um `lc-logo`.
 *
 * @csspart base - O `<nav>`.
 * @csspart brand - A faixa da marca.
 * @csspart menu - A lista, que é quem rola.
 *
 * @cssproperty --width - Largura da coluna. Padrão 230px, medido no painel.
 *
 * ```html
 * <div class="lc-app">
 *   <lc-sidebar label="Navegação principal">
 *     <lc-logo slot="brand"></lc-logo>
 *     <lc-sidebar-label>Menu</lc-sidebar-label>
 *     <lc-sidebar-item href="/painel" icon="house">Home</lc-sidebar-item>
 *     <lc-sidebar-group label="Sistema" icon="settings">
 *       <lc-sidebar-item href="/painel/usuario">Usuário</lc-sidebar-item>
 *     </lc-sidebar-group>
 *   </lc-sidebar>
 *   <main>…</main>
 * </div>
 * ```
 *
 * A BARRA É SÓ A COLUNA. Ela não é `fixed`, não empurra conteúdo e não escreve
 * nada fora de si — o layout é do consumidor, com o utilitário `.lc-app`. Assim
 * o conteúdo se ajusta sozinho quando ela encolher, porque quem encolheu foi a
 * coluna do grid.
 *
 * ── O item atual se descobre sozinho ─────────────────────────────────────────
 * A barra casa o `href` de cada item com `location.pathname` e marca quem bate.
 * Um `current` escrito à mão vence e desliga o automático inteiro — se alguém
 * decidiu marcar, a barra não discute.
 *
 * O casamento é EXATO, não por prefixo. Prefixo faria `/painel` casar com toda
 * tela do sistema, e o menu apontaria para "Home" em qualquer lugar.
 *
 * ── O acordeão mora aqui ─────────────────────────────────────────────────────
 * Fechar os irmãos é decisão da lista, não de cada grupo — por isso a lógica
 * está aqui e não no `lc-sidebar-group`. Mesma divisão que o `lc-dropdown` faz
 * com o `lc-menu-item`.
 */
export class LcSidebar extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <nav part="base" class="base">
      <div part="brand" class="marca"><slot name="brand"></slot></div>
      <div part="menu" class="menu"><slot></slot></div>
    </nav>
  `;

  static properties = {
    /** Nome acessível do `<nav>`. */
    label: { type: 'string', default: 'Navegação principal' },
    /**
     * Abrir um grupo fecha os outros. Ligado por padrão; desligue com
     * `accordion="false"`.
     *
     * É string, e não boolean, justamente para poder nascer LIGADO: atributo
     * booleano ausente é sempre falso, e aqui o padrão precisa ser o contrário.
     */
    accordion: { type: 'string', default: 'true' },
  };

  static watch = { label: 'applyA11y' };

  /** @returns {boolean} */
  get #acordeao() {
    return this.accordion !== 'false';
  }

  ready() {
    this.applyA11y();

    this.addEventListener('click', (event) => {
      const grupo = event.target.closest?.('lc-sidebar-group');
      if (!grupo || !this.contains(grupo)) return;

      /* Clique num item DENTRO do grupo não é o gatilho — é navegação. O alvo
         chega retargetado no host da tag clicada, então isto basta. */
      if (event.target.closest('lc-sidebar-item')) return;

      /* O grupo já virou o próprio estado no handler dele, que roda antes deste
         porque está mais fundo na árvore. Só fechamos os outros quando o que
         acabou de acontecer foi uma ABERTURA. */
      if (this.#acordeao && grupo.open) {
        for (const outro of this.querySelectorAll('lc-sidebar-group')) {
          if (outro !== grupo) outro.open = false;
        }
      }
    });

    /* A faixa da marca nasce escondida e só aparece com conteúdo, como o
       cabeçalho do lc-card. Mesmo motivo: faixa vazia com cor de marca é o tipo
       de defeito que ninguém nota até estar publicado. */
    const slotMarca = this.$('slot[name="brand"]');
    const sincronizarMarca = () =>
      this.setState('has-brand', slotMarca.assignedElements().length > 0);
    slotMarca.addEventListener('slotchange', sincronizarMarca);
    sincronizarMarca();

    /* Espera os filhos existirem: em `ready()` o slot pode ainda não ter sido
       preenchido quando a barra é montada por script. Um microtask resolve, e
       é mais barato que um MutationObserver que ficaria vivo para sempre. */
    queueMicrotask(() => this.marcarAtual());
  }

  applyA11y() {
    this.$('.base')?.setAttribute('aria-label', this.label);
  }

  /**
   * Marca o item cujo `href` bate com a URL da tela, e abre o grupo dele.
   *
   * Público de propósito: protótipo de rota por hash troca de tela sem
   * recarregar, e precisa de um jeito de pedir a remarcação.
   */
  marcarAtual() {
    const itens = [...this.querySelectorAll('lc-sidebar-item')];
    if (itens.some((item) => item.hasAttribute('current'))) return;

    const normalizar = (caminho) => caminho.replace(/\/+$/, '') || '/';
    const aqui = normalizar(location.pathname);

    const atual = itens.find((item) => {
      const href = item.getAttribute('href');
      if (!href) return false;
      try {
        return normalizar(new URL(href, location.href).pathname) === aqui;
      } catch {
        return false;
      }
    });

    if (!atual) return;
    atual.setAttribute('current', '');
    atual.closest('lc-sidebar-group')?.setAttribute('open', '');
  }
}

define('lc-sidebar', LcSidebar);
