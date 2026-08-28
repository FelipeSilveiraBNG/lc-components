import { define } from '../define.js';
import { LC_AFTER_HIDE, LC_AFTER_SHOW, LC_COLLAPSE, LC_HIDE, LC_SHOW } from '../events.js';
import { LcElement } from '../lc-element.js';
import styles from './lc-sidebar.css.js';
import '../lc-icon/lc-icon.js';

/*
 * A FAIXA DA GAVETA, num só lugar.
 *
 * 767px não é escolha: é o `@media (max-width: 767px)` do `bng-sidebar.css` do
 * painel de homologação, medido na fase 01. O painel já vira gaveta nesse
 * ponto, e esta fase é reprodução, não desenho novo.
 *
 * O número mora AQUI e em nenhum outro lugar. O CSS do componente não repete a
 * media query: ele reage ao custom state `drawer`, que este módulo liga. E o
 * utilitário `.lc-only-drawer`, que mostra o gatilho do consumidor só nesta
 * faixa, reage ao MESMO state, por `:has()`. Mudar o breakpoint é mudar esta
 * linha — e não três arquivos que precisariam concordar entre si.
 */
const FAIXA_GAVETA = '(max-width: 767px)';

/**
 * @summary Barra de navegação lateral da aplicação.
 * @documentation ./lc-sidebar.md
 * @status experimental
 * @since 0.3
 * @dependency lc-icon
 *
 * @slot - Os `lc-sidebar-item`, `lc-sidebar-group` e `lc-sidebar-label`.
 * @slot brand - A marca no topo, normalmente um `lc-logo`.
 * @slot brand-collapsed - A marca do trilho, normalmente `lc-logo variant="symbol"`.
 *
 * @event lc-collapse - Recolheu ou expandiu. `detail.collapsed` diz qual.
 * @event lc-show - A gaveta vai abrir. Cancelável.
 * @event lc-after-show - A gaveta abriu.
 * @event lc-hide - A gaveta vai fechar por ação de quem usa. Cancelável.
 *   `detail.source` ∈ backdrop | escape | api.
 * @event lc-after-hide - A gaveta fechou, seja qual for a causa — inclusive a
 *   janela ter saído da faixa da gaveta. É este que serve para acertar o
 *   `aria-expanded` do gatilho.
 *
 * @csspart base - O `<nav>`.
 * @csspart drawer - O `<dialog>` da gaveta. Fora do telefone não é caixa nenhuma.
 * @csspart brand - A faixa da marca.
 * @csspart menu - A lista, que é quem rola.
 * @csspart handle - A alça de recolher.
 *
 * @cssproperty --width - Largura expandida. Padrão 230px, medido no painel.
 * @cssproperty --rail-width - Largura do trilho. Padrão 56px, medido no painel.
 * @cssproperty --drawer-top - Onde a gaveta e o véu começam, contado do alto da
 *   tela. Padrão 0 — a barra não sabe que a tela tem cabeçalho. Ponha a altura
 *   do seu para reproduzir o painel, que abre a gaveta SOB o cabeçalho.
 *
 * ```html
 * <div class="lc-app">
 *   <lc-sidebar label="Navegação principal">
 *     <lc-logo slot="brand"></lc-logo>
 *     <lc-logo slot="brand-collapsed" variant="symbol"></lc-logo>
 *     <lc-sidebar-item href="/painel" icon="house">Home</lc-sidebar-item>
 *   </lc-sidebar>
 *   <main>…</main>
 * </div>
 * ```
 *
 * A BARRA É SÓ A COLUNA. Ela não é `fixed`, não empurra conteúdo e não escreve
 * nada fora de si — o layout é do consumidor, com o utilitário `.lc-app`. Assim
 * o conteúdo se ajusta sozinho quando ela recolhe, porque quem encolheu foi a
 * coluna do grid.
 *
 * ── O item atual se descobre sozinho ─────────────────────────────────────────
 * A barra casa o `href` de cada item com `location.pathname` e marca quem bate.
 * Um `current` escrito à mão vence e desliga o automático inteiro.
 *
 * O casamento é EXATO, não por prefixo. Prefixo faria `/painel` casar com toda
 * tela do sistema, e o menu apontaria para "Home" em qualquer lugar.
 *
 * ── O acordeão mora aqui ─────────────────────────────────────────────────────
 * Fechar os irmãos é decisão da lista, não de cada grupo. Mesma divisão que o
 * `lc-dropdown` faz com o `lc-menu-item`.
 *
 * ── E o estado do trilho também ──────────────────────────────────────────────
 * Recolhida, a barra marca os filhos com `data-rail`. Eles não perguntam à mãe
 * se ela está recolhida — quem sabe avisa. É o mesmo arranjo do `data-nivel`
 * que o `lc-sidebar-group` usa nos itens dele.
 *
 * ── A gaveta do telefone é o QUARTO ESTADO desta mesma barra ─────────────────
 * Abaixo de 767px — o breakpoint do painel — a coluna vai a ZERO e o menu abre
 * num `<dialog>` modal sobre o conteúdo: Esc, clique no véu e foco preso, os
 * três do `showModal()` nativo. Não é um segundo componente. E o trilho de
 * ícones deixa de existir nessa faixa, porque flyout no hover não existe em
 * toque.
 *
 * O GATILHO É DO CONSUMIDOR. A barra não traz botão: o topo da aplicação não é
 * do kit, então o kit não palpita nele. Quem monta a tela põe o seu e alterna
 * `open` — por script, ou pelo invocador `data-lc-sidebar` no fim deste arquivo.
 * O utilitário `.lc-only-drawer` mostra esse botão só na faixa da gaveta, sem
 * que a tela precise repetir o breakpoint.
 *
 * `collapsed` não é APAGADO na faixa da gaveta, só ignorado: quem estreitou a
 * janela com a barra em trilho encontra o trilho de volta ao alargá-la. É por
 * isso que o trilho é `:state(rail)`, uma conta, e não o atributo cru.
 *
 * Já `open` é apagado ao sair da faixa — o atributo nunca fica dizendo que há
 * gaveta aberta numa tela que não tem gaveta.
 */
export class LcSidebar extends LcElement {
  static css = [styles];

  static template = /* html */ `
    <dialog part="drawer" class="gaveta">
      <nav part="base" class="base">
        <div part="brand" class="marca">
          <slot name="brand"></slot>
          <slot name="brand-collapsed"></slot>
        </div>
        <div part="menu" class="menu"><slot></slot></div>
      </nav>
    </dialog>
    <button part="handle" class="alca" type="button">
      <lc-icon class="alca-icone" name="chevron-right" aria-hidden="true"></lc-icon>
    </button>
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
    /** Trilho de ícones em vez da coluna inteira. Ignorado na faixa da gaveta. */
    collapsed: 'boolean',
    /**
     * A gaveta está aberta. Só tem efeito abaixo de 767px: fora dessa faixa a
     * barra é a coluna, e coluna não abre nem fecha.
     */
    open: 'boolean',
  };

  static watch = {
    label: 'applyA11y',
    collapsed: 'syncCollapsed',
    open: 'syncOpen',
  };

  /**
   * A faixa da gaveta.
   *
   * Campo, e não algo criado em `ready()`, porque `syncCollapsed()` roda pelo
   * watcher de atributo e pode disparar antes de qualquer outra coisa. Se a
   * consulta não existisse ainda, o primeiro cálculo do trilho sairia errado.
   */
  #faixa = matchMedia(FAIXA_GAVETA);

  /** @returns {boolean} */
  get #acordeao() {
    return this.accordion !== 'false';
  }

  /**
   * O trilho de ícones está em vigor?
   *
   * É `collapsed` MENOS a faixa da gaveta, e é uma conta só, num lugar só: dela
   * saem o `:state(rail)` que o CSS lê, o `data-rail` que os filhos leem e a
   * decisão de abrir o grupo do item atual.
   *
   * @returns {boolean}
   */
  get #noTrilho() {
    return Boolean(this.collapsed) && !this.#faixa.matches;
  }

  #aoTrocarDeFaixa = (evento) => {
    /* Saiu da faixa com a gaveta aberta: fecha. Sem passar pelo `lc-hide`
       cancelável — não há o que negociar, a gaveta acabou de deixar de existir.
       O `lc-after-hide` sai normalmente, de dentro do `syncOpen()`. */
    if (!evento.matches) this.open = false;
    this.syncGaveta();
  };

  ready() {
    this.applyA11y();

    /* O state da faixa antes de tudo: o CSS da gaveta pende dele, e um `open`
       que chegue no mesmo instante precisa encontrar o `<dialog>` já sendo
       caixa. O resto da sincronização espera os filhos, lá embaixo. */
    this.setState('drawer', this.#faixa.matches);

    const gaveta = this.$('.gaveta');

    /* Clique no VÉU. O alvo de um clique no `::backdrop` é o próprio `<dialog>`,
       e a gaveta está inteiramente coberta pelo `.base` — então qualquer clique
       cujo alvo seja o diálogo veio de fora dela. Mesmo teste do `lc-modal`. */
    gaveta.addEventListener('click', (event) => {
      if (event.target === gaveta) this.#pedirFechamento('backdrop');
    });

    /* Esc dispara `cancel` no `<dialog>`. Interceptamos para que TODO fechamento
       passe pelo mesmo evento cancelável, com a origem em `detail.source`. */
    gaveta.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.#pedirFechamento('escape');
    });

    this.$('.alca').addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      this.emit(LC_COLLAPSE, { detail: { collapsed: Boolean(this.collapsed) } });
    });

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
    const slots = this.$$('slot[name^="brand"]');
    const sincronizarMarca = () =>
      this.setState('has-brand', slots.some((s) => s.assignedElements().length > 0));
    for (const slot of slots) slot.addEventListener('slotchange', sincronizarMarca);
    sincronizarMarca();

    /* Filho que chega depois também precisa saber do trilho. O observer olha só
       a lista de filhos diretos, não a árvore inteira. */
    new MutationObserver(() => this.syncCollapsed()).observe(this, { childList: true });

    /* Espera os filhos existirem: em `ready()` o slot pode ainda não ter sido
       preenchido quando a barra é montada por script. Um microtask resolve, e
       é mais barato que um MutationObserver que ficaria vivo para sempre. */
    queueMicrotask(() => {
      this.marcarAtual();
      this.syncGaveta();
    });
  }

  /* O ouvinte da faixa entra e sai com a barra: `matchMedia` guarda referência
     para o callback, e callback que sobrevive ao elemento é vazamento. Vive em
     `connected`/`disconnected`, e não em `ready()`, que roda uma única vez —
     barra que é removida e recolocada no DOM continua atendendo a faixa.

     `addEventListener` com a MESMA função é idempotente, então a primeira
     conexão (onde `connected` roda logo depois de `ready`) não registra duas. */
  connected() {
    this.#faixa.addEventListener('change', this.#aoTrocarDeFaixa);
  }

  disconnected() {
    this.#faixa.removeEventListener('change', this.#aoTrocarDeFaixa);
  }

  applyA11y() {
    this.$('.base')?.setAttribute('aria-label', this.label);
  }

  /**
   * Espalha o estado do trilho para os filhos e acerta a alça.
   *
   * Recolher FECHA todos os grupos abertos: um submenu inline dentro de um
   * trilho de 56px seria uma coluna de itens sem rótulo nenhum. No trilho o
   * submenu só existe como flyout, e o flyout abre por interação.
   */
  syncCollapsed() {
    const recolhida = this.#noTrilho;

    for (const filho of this.children) {
      if (recolhida) filho.dataset.rail = '';
      else delete filho.dataset.rail;
    }

    if (recolhida) {
      for (const grupo of this.querySelectorAll('lc-sidebar-group')) grupo.open = false;
    }

    const alca = this.$('.alca');
    if (alca) {
      alca.setAttribute('aria-expanded', String(!recolhida));
      alca.setAttribute('aria-label', recolhida ? 'Expandir o menu' : 'Recolher o menu');
      alca.title = recolhida ? 'Expandir o menu' : 'Recolher o menu';
    }
    this.setState('rail', recolhida);
  }

  /**
   * Entrou ou saiu da faixa da gaveta.
   *
   * Publica o state que o CSS e o utilitário `.lc-only-drawer` leem, e manda os
   * dois outros sincronizadores recalcularem: o trilho, porque ele é suprimido
   * aqui; e a gaveta, porque `open` só vale nesta faixa.
   */
  syncGaveta() {
    this.setState('drawer', this.#faixa.matches);
    this.syncCollapsed();
    this.syncOpen();
  }

  /**
   * Abre e fecha a gaveta — o `<dialog>` modal, e só na faixa dele.
   *
   * `showModal()` é o que entrega as quatro exigências da gaveta de uma vez:
   * sobrepõe o conteúdo pelo top layer, fecha no Esc, pinta o véu no
   * `::backdrop` e PRENDE O FOCO, deixando o resto da página inerte. Nada disso
   * é reimplementado aqui.
   */
  syncOpen() {
    const gaveta = this.$('.gaveta');
    if (!gaveta) return;

    /* Fora da faixa, `open` não faz nada. Não é ignorado em silêncio: quem
       estreitar a janela com o atributo posto vai encontrar a gaveta aberta,
       que é o que o atributo pediu. */
    const deveAbrir = Boolean(this.open) && this.#faixa.matches;

    if (deveAbrir && !gaveta.open) {
      if (!this.emit(LC_SHOW, { cancelable: true })) {
        this.open = false;
        return;
      }
      gaveta.showModal();
      this.setState('open', true);
      this.emit(LC_AFTER_SHOW);
    } else if (!deveAbrir && gaveta.open) {
      gaveta.close();
      this.setState('open', false);
      this.emit(LC_AFTER_HIDE);
    }
  }

  /**
   * Roteia todo fechamento pedido por quem usa a tela por um único evento
   * cancelável. O gatilho da gaveta é do consumidor, e ele precisa saber que o
   * véu ou o Esc fecharam — senão o `aria-expanded` do botão dele mente.
   */
  #pedirFechamento(origem) {
    if (this.emit(LC_HIDE, { cancelable: true, detail: { source: origem } })) this.open = false;
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
    if (!this.#noTrilho) atual.closest('lc-sidebar-group')?.setAttribute('open', '');
  }
}

define('lc-sidebar', LcSidebar);

/*
 * Invocador por data-attribute — a mesma convenção do `lc-modal`:
 *
 *   <lc-button data-lc-sidebar="toggle" class="lc-only-drawer">Menu</lc-button>
 *   <lc-button data-lc-sidebar="open menu-principal">Menu</lc-button>
 *
 * Existe porque o gatilho da gaveta é do CONSUMIDOR, e sem isto toda tela de
 * protótipo precisaria de uma tag `<script>` só para alternar um atributo. Com
 * ele, um protótipo de aplicação inteira sai sem uma linha de JavaScript.
 *
 * Sem id, o alvo é a primeira `lc-sidebar` do documento — o casco tem uma. Um id
 * explícito resolve a tela que tenha duas.
 *
 * O `toggle` é o que interessa. `open` e `close` existem para quem quiser dois
 * botões em vez de um.
 */
if (!globalThis.__lcSidebarInvoker) {
  globalThis.__lcSidebarInvoker = true;
  document.addEventListener('click', (event) => {
    const gatilho = event.target?.closest?.('[data-lc-sidebar]');
    if (!gatilho) return;

    const [acao, id] = gatilho.getAttribute('data-lc-sidebar').trim().split(/\s+/);
    const alvo = id ? document.getElementById(id) : document.querySelector('lc-sidebar');
    if (!(alvo instanceof LcSidebar)) {
      console.warn(`[lc-components] data-lc-sidebar="${acao} ${id ?? ''}": alvo não encontrado.`);
      return;
    }

    if (acao === 'open') alvo.open = true;
    else if (acao === 'close') alvo.open = false;
    else if (acao === 'toggle') alvo.open = !alvo.open;
    else console.warn(`[lc-components] data-lc-sidebar: ação "${acao}" não existe.`);
  });
}
