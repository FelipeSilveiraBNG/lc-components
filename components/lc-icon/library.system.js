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
 *
 * ── De onde vêm os desenhos ──────────────────────────────────────────────────
 * Do LUCIDE (lucide.dev), licença ISC. Não foi escolha de gosto: os primeiros
 * ícones daqui já eram Lucide — `x`, `check`, `chevron-down`, `plus` e `search`
 * batem caractere por caractere com o pacote. O set já era esse; a partir de
 * agora está escrito.
 *
 * REGRA DE NOME: o nome é o nome do Lucide, sem tradução. Assim quem procurar
 * um ícone em lucide.dev pode escrever o nome que achou lá e ele funciona, sem
 * dialeto privado no meio. As únicas exceções são os quatro semânticos —
 * `info`, `warning`, `danger`, `success` — que nomeiam o PAPEL, porque é o
 * papel que o `lc-alert` pede, e não um desenho específico.
 *
 * O `trash` é o único adaptado à mão e não bate com o Lucide atual. Fica como
 * está: trocá-lo mudaria um ícone que já está em uso.
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

  /* ── Ícones de CATEGORIA ────────────────────────────────────────────────────
     Os quatorze acima são de AÇÃO: o que um botão faz. Estes dezesseis nomeiam
     uma área do produto, e é o que uma barra lateral precisa.

     Levantados um a um no menu do painel de homologação, que usa Font Awesome 4,
     e traduzidos para o equivalente Lucide mais próximo:

       fa-home        → house              fa-newspaper-o  → newspaper
       fa-cogs        → settings           fa-bar-chart    → chart-column
       fa-clone       → copy               fa-ambulance    → ambulance
       fa-vcard       → id-card            fa-clipboard    → clipboard
       fa-video-camera→ video              fa-desktop      → monitor
       fa-heartbeat   → heart-pulse        fa-money        → banknote
       fa-medkit      → briefcase-medical  fa-user-md      → stethoscope
       fa-picture-o   → image              fa-tachometer   → gauge

     Duas traduções não são literais e valem justificativa:

     `fa-cogs` são DUAS engrenagens e o Lucide não tem par — `settings` é uma só.
     Perde-se o plural, que não carregava significado nenhum.

     `fa-user-md` é uma pessoa com estetoscópio. O Lucide tem `stethoscope`
     sozinho, sem a pessoa. Preferi o objeto à pessoa: no tamanho de 16px da
     barra, a figura humana do FA vira mancha, e o estetoscópio continua legível.
     ------------------------------------------------------------------------- */
  house:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  settings:
    '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  copy:
    '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'id-card':
    '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
  video:
    '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  'heart-pulse':
    '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  'briefcase-medical':
    '<path d="M12 11v4"/><path d="M14 13h-4"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M18 6v14"/><path d="M6 6v14"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  newspaper:
    '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>',
  'chart-column':
    '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  ambulance:
    '<path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><path d="M9 18h6"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  clipboard:
    '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  monitor:
    '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  banknote:
    '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  stethoscope:
    '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
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
