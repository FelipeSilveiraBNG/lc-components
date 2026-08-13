/*
 * LcElement — classe base de TODO componente do lc-components.
 *
 * REGRA, copiada do Web Awesome ("Never extend LitElement directly"):
 * nenhum componente estende `HTMLElement` direto. Estende esta classe.
 *
 * Faz o papel do `WebAwesomeElement` deles sem Lit e sem decorators. O que
 * substitui o quê:
 *
 *   @customElement('wa-x')   →  define('lc-x', LcX) no fim do arquivo
 *   @property()              →  static properties = { … }
 *   @watch('prop')           →  static watch = { prop: 'metodo' }
 *   static styles            →  static css = [ … ]  (strings, não template `css`)
 *   render() a cada mudança  →  template clonado UMA vez + CSS reage a atributo
 *
 * ── Por que não re-renderizar a cada mudança ─────────────────────────────
 * Sem o diffing do Lit, "re-render" significaria reescrever `innerHTML` do
 * shadow root: perde foco, perde estado de elemento interno e mata listeners.
 * Então o template é clonado uma vez e a reação a mudança vem de duas fontes:
 * seletor de atributo no CSS (`:host([variant='danger'])`) para aparência, e
 * `static watch` para o que precisa de JS. É o padrão do me-bricks, validado em
 * 18 componentes.
 */

/** Converte `helpText` em `help-text`. */
export function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Normaliza `static properties`: aceita 'string' ou { type, default, attribute }. */
function normalize(decl) {
  const spec = typeof decl === 'string' ? { type: decl } : { ...decl };
  spec.type ??= 'string';
  return spec;
}

const sheetCache = new WeakMap();
const templateCache = new WeakMap();

export class LcElement extends HTMLElement {
  /** @type {Record<string, string | { type: string, default?: unknown, attribute?: string }>} */
  static properties = {};

  /** @type {string[]} CSS do componente. Cada string vira uma CSSStyleSheet adotada. */
  static css = [];

  /** @type {string} HTML do shadow root, clonado uma vez. */
  static template = '';

  /** @type {Record<string, string>} propriedade → nome do método a chamar quando mudar. */
  static watch = {};

  static get observedAttributes() {
    return Object.entries(this.properties ?? {}).map(
      ([name, decl]) => normalize(decl).attribute ?? kebab(name),
    );
  }

  /**
   * Cria os acessores a partir de `static properties`. Chamado por define()
   * ANTES de customElements.define, senão o navegador leria observedAttributes
   * de uma classe ainda não preparada.
   */
  static finalize() {
    if (Object.prototype.hasOwnProperty.call(this, '__lcFinalized')) return;
    for (const [name, decl] of Object.entries(this.properties ?? {})) {
      const spec = normalize(decl);
      const attr = spec.attribute ?? kebab(name);
      Object.defineProperty(this.prototype, name, {
        configurable: true,
        enumerable: true,
        get() {
          const raw = this.getAttribute(attr);
          if (spec.type === 'boolean') return this.hasAttribute(attr);
          if (spec.type === 'number') return raw === null ? (spec.default ?? 0) : Number(raw);
          return raw === null ? (spec.default ?? '') : raw;
        },
        set(value) {
          if (spec.type === 'boolean') {
            this.toggleAttribute(attr, Boolean(value));
          } else if (value === null || value === undefined) {
            this.removeAttribute(attr);
          } else {
            this.setAttribute(attr, String(value));
          }
        },
      });
    }
    this.__lcFinalized = true;
  }

  #internals;
  #connectedOnce = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // ElementInternals dá custom states (`:host(:state(open))`) e, na subclasse
    // de formulário, a associação a <form>.
    this.#internals = this.attachInternals();
  }

  get internals() {
    return this.#internals;
  }

  connectedCallback() {
    if (!this.#connectedOnce) {
      this.#connectedOnce = true;
      const ctor = /** @type {typeof LcElement} */ (this.constructor);

      let sheets = sheetCache.get(ctor);
      if (!sheets) {
        sheets = (ctor.css ?? []).map((text) => {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(text);
          return sheet;
        });
        sheetCache.set(ctor, sheets);
      }
      this.shadowRoot.adoptedStyleSheets = sheets;

      if (ctor.template) {
        let tpl = templateCache.get(ctor);
        if (!tpl) {
          tpl = document.createElement('template');
          tpl.innerHTML = ctor.template;
          templateCache.set(ctor, tpl);
        }
        this.shadowRoot.append(tpl.content.cloneNode(true));
      }

      this.ready?.();
    }
    this.connected?.();
  }

  disconnectedCallback() {
    this.disconnected?.();
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (!this.#connectedOnce || oldValue === newValue) return;
    const ctor = /** @type {typeof LcElement} */ (this.constructor);
    for (const [prop, method] of Object.entries(ctor.watch ?? {})) {
      const propAttr = normalize(ctor.properties[prop] ?? 'string').attribute ?? kebab(prop);
      if (propAttr === attr && typeof this[method] === 'function') this[method](newValue, oldValue);
    }
  }

  /** Liga/desliga um custom state, legível no CSS como `:host(:state(nome))`. */
  setState(name, on) {
    const states = this.#internals?.states;
    if (!states) return;
    if (on) states.add(name);
    else states.delete(name);
  }

  hasState(name) {
    return Boolean(this.#internals?.states?.has(name));
  }

  /** Query no shadow root. */
  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  $$(selector) {
    return [...this.shadowRoot.querySelectorAll(selector)];
  }

  /**
   * Dispara evento customizado.
   *
   * DIVERGÊNCIA DELIBERADA do Web Awesome, que não tem helper `emit()` — lá cada
   * evento é uma classe por arquivo, porque isso alimenta a tipagem do
   * TypeScript. Sem TS esse benefício desaparece e o que sobra é o risco real:
   * esquecer `composed: true` e o evento não atravessar o shadow boundary. O
   * helper existe para tornar isso impossível de errar. Os NOMES continuam
   * centralizados em events.js.
   *
   * @param {string} name nome já prefixado (use as constantes de events.js)
   * @param {{ detail?: unknown, cancelable?: boolean }} [options]
   * @returns {boolean} false se algum ouvinte chamou preventDefault()
   */
  emit(name, options = {}) {
    return this.dispatchEvent(
      new CustomEvent(name, {
        detail: options.detail ?? null,
        bubbles: true,
        composed: true,
        cancelable: options.cancelable ?? false,
      }),
    );
  }
}
