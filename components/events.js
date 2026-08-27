/*
 * Registro central de nomes de evento.
 *
 * No Web Awesome cada evento é uma classe num arquivo próprio (59 arquivos para
 * 70 componentes). Dois motivos sustentam aquilo: aumentar o mapa de tipos do
 * TypeScript, e ter nome único e grep-ável. Sem TS o primeiro motivo desaparece;
 * o segundo, não. Então: um arquivo, constantes.
 *
 * Convenções mantidas do Web Awesome:
 *   - prefixo obrigatório (`lc-`)
 *   - kebab-case minúsculo — navegador rebaixa nome de atributo, e alguns
 *     frameworks não conseguem escutar `lcChange`
 *   - ciclo de overlay em quatro tempos: show → after-show → hide → after-hide
 *
 * Se um evento novo não está aqui, ele não existe. Nome de evento não se inventa
 * no meio de um componente.
 */

/** Valor de um controle mudou e foi comitado. */
export const LC_CHANGE = 'lc-change';

/** Valor mudou durante a edição (a cada tecla). */
export const LC_INPUT = 'lc-input';

/** Overlay vai aparecer. Cancelável. */
export const LC_SHOW = 'lc-show';

/** Overlay terminou de aparecer (animação concluída). */
export const LC_AFTER_SHOW = 'lc-after-show';

/** Overlay vai fechar. Cancelável — `detail.source` diz a origem. */
export const LC_HIDE = 'lc-hide';

/** Overlay terminou de fechar. */
export const LC_AFTER_HIDE = 'lc-after-hide';

/** Item de menu acionado. Cancelável — preventDefault mantém o menu aberto. */
export const LC_SELECT = 'lc-select';

/**
 * A barra lateral recolheu ou expandiu. `detail.collapsed` diz qual dos dois.
 *
 * Existe porque o componente NÃO GUARDA esse estado: quem quiser que a escolha
 * sobreviva à troca de tela escuta isto e grava onde achar melhor. Um kit de
 * protótipo que escrevesse sozinho em `localStorage` surpreenderia quem monta
 * duas telas lado a lado.
 */
export const LC_COLLAPSE = 'lc-collapse';

/**
 * Controle foi verificado e não satisfaz as restrições.
 *
 * Existe porque o ADR 0001 decidiu que erro de campo é ESTADO DE VALIDADE, não
 * um atributo que o autor preenche — o `.lc-error` da camada de classes era um
 * `<span>` que podia dessincronizar do campo. Segue o `wa-invalid` do Web
 * Awesome.
 */
export const LC_INVALID = 'lc-invalid';
