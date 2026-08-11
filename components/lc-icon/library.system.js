/*
 * Bibliotecas de ícone.
 *
 * Convenção do Web Awesome (contributing.md → "System Icons"): componente nunca
 * inlina SVG no próprio template; usa `<lc-icon library="system">`, que resolve
 * na hora em vez de buscar remoto.
 *
 * A biblioteca é REGISTRÁVEL, e é isso que faz o set de ícones fazer parte do
 * tema (doc 07 §7.4): o tema `legacy` pode resolver nomes do Font Awesome 4 —
 * incluindo os 6 quebrados do doc 04 apontando para substituto visível — e o
 * `modern` pode resolver de um set atual. Trocar o set é trocar um resolver.
 *
 * O v0.1 traz o mínimo de que os componentes precisam, mais o mapa `fa4` como
 * demonstração do mecanismo (não é o mapa completo dos 118 nomes).
 *
 * Os paths são de traço (`stroke`), 24×24, para herdar cor via currentColor.
 */

/** @type {Map<string, (name: string) => string | null>} */
const libraries = new Map();

const system = {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash:
    '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/>',
  pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  danger: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  success: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
};

registerIconLibrary('system', (name) => system[name] ?? null);

/*
 * Mapa Font Awesome 4 → system. Demonstra o mecanismo e resolve dois dos ícones
 * QUEBRADOS do legado (doc 04 §1) para substituto que existe, em vez de nada.
 */
const fa4 = {
  'fa-times': 'x',
  'fa-check': 'check',
  'fa-angle-left': 'chevron-right',
  'fa-search': 'search',
  'fa-plus': 'plus',
  'fa-trash-o': 'trash',
  'fa-pencil': 'pencil',
  'fa-info-circle': 'info',
  'fa-exclamation-triangle': 'warning',
  'fa-user': 'user',
  'fa-calendar': 'calendar',
  // Quebrados em produção, agora com substituto visível:
  'fa-edit-o': 'pencil',
  'fa-remove-o': 'trash',
};

registerIconLibrary('fa4', (name) => system[fa4[name] ?? ''] ?? null);

/**
 * Registra (ou substitui) uma biblioteca de ícones.
 * @param {string} name
 * @param {(iconName: string) => string | null} resolver devolve o innerHTML do
 *   <svg> (paths), ou null se o nome não existe na biblioteca.
 */
export function registerIconLibrary(name, resolver) {
  libraries.set(name, resolver);
}

/** @returns {string | null} */
export function resolveIcon(library, name) {
  const resolver = libraries.get(library);
  return resolver ? resolver(name) : null;
}
