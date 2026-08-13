/*
 * AUTOLOADER — registra componente no primeiro uso.
 *
 * Copiado em espírito do `webawesome.loader.ts`. Um MutationObserver vê uma tag
 * `<lc-*>` ainda não registrada e importa `components/<tag>/<tag>.js`.
 *
 * Por que importa aqui: com ~24 componentes previstos, carregar tudo eager
 * (como o me-bricks faz com 18) passa a custar. E, mais importante para
 * protótipo: quem escreve a tela não precisa saber quais componentes existem
 * nem manter lista de imports. Escreve a tag; ela funciona.
 *
 *   <script type="module" src="components/loader.js"></script>
 *
 * Limitação conhecida: a tag fica sem estilo até o módulo chegar. Em protótipo
 * servido localmente isso é imperceptível; num CDN frio, é um flash. Quem quiser
 * evitar usa o index.js.
 */

const pending = new Set();

function load(tagName) {
  if (pending.has(tagName) || customElements.get(tagName)) return;
  pending.add(tagName);

  const url = new URL(`./${tagName}/${tagName}.js`, import.meta.url).href;

  import(url).catch(() => {
    console.warn(
      `[lc-components] autoloader: não encontrei "${tagName}" em ${url}.\n` +
        `Confira o nome da tag (tag <lc-*> nunca é self-closing: use ` +
        `<${tagName}></${tagName}>) e se o componente existe no kit.`,
    );
  });
}

function scan(root) {
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

  const tag = root.tagName?.toLowerCase();
  if (tag?.startsWith('lc-')) load(tag);

  for (const el of root.querySelectorAll?.(':not(:defined)') ?? []) {
    const name = el.tagName.toLowerCase();
    if (name.startsWith('lc-')) load(name);
  }
}

scan(document);

new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.addedNodes) scan(node);
  }
}).observe(document.documentElement, { childList: true, subtree: true });

/*
 * API imperativa preguiçosa.
 *
 * MEDIDO ao renderizar a vitrine: `lc.toast(...)` num handler inline falhava com
 * "lc is not defined". O autoloader só carrega componente cuja TAG aparece no
 * DOM, e uma página que só chama a função nunca tem <lc-toast> escrito nela.
 *
 * Exigir que o autor lembre de pôr o host na página seria transferir para ele um
 * detalhe de implementação do kit. Então o stub abaixo importa o módulo na
 * primeira chamada; ao carregar, lc-toast.js substitui este stub pela função de
 * verdade, e as chamadas seguintes vão direto.
 */
globalThis.lc = globalThis.lc ?? {};
if (!globalThis.lc.toast) {
  globalThis.lc.toast = async (...args) => {
    const mod = await import(new URL('./lc-toast/lc-toast.js', import.meta.url).href);
    return mod.toast(...args);
  };
}
