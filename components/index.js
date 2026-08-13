/*
 * lc-bricks — agregador. Importar isto registra todas as tags <lc-*>.
 *
 *   <link rel="stylesheet" href="lc.css">
 *   <script type="module" src="components/index.js"></script>
 *
 * Para páginas que usam poucos componentes, prefira o loader.js (autoloader):
 * ele importa sob demanda o que a página de fato usa.
 *
 * ES modules exigem http:// — sirva com `npx serve .`. Em file:// não funciona.
 *
 * Carregue o kit UMA VEZ por página. Duas URLs diferentes são dois grafos de
 * módulo e ambos tentam registrar as mesmas tags; a primeira vence e a segunda
 * emite aviso `[lc-bricks]` no console. Ver define.js.
 */

export * from './lc-element.js';
export * from './lc-form-element.js';
export * from './events.js';

export { registerIconLibrary } from './lc-icon/library.system.js';
export { toast } from './lc-toast/lc-toast.js';

import './lc-icon/lc-icon.js';
import './lc-switch/lc-switch.js';
import './lc-dropdown/lc-dropdown.js';
import './lc-modal/lc-modal.js';
import './lc-toast/lc-toast.js';

/* Componentes que substituem a camada de classes (ADR 0001). O autoloader os
   encontra por convenção de caminho e não precisa saber deles; esta lista existe
   para quem usa o index.js em vez do loader.js. */
import './lc-badge/lc-badge.js';
import './lc-alert/lc-alert.js';
import './lc-card/lc-card.js';
