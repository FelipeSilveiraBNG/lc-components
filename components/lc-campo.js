/*
 * LcCampo — base dos controles com rótulo, dica e mensagem de erro.
 *
 * Existe por causa da decisão B do ADR 0001: o CONTROLE é dono do rótulo. Na
 * camada de classes, `.lc-field` + `.lc-label` + `.lc-error` eram três nós que
 * precisavam concordar entre si, e o `for`/`id` dependia de quem escrevia. Aqui
 * é um nó, e não há como desalinhar.
 *
 * ── Validação é ESTADO, não atributo ─────────────────────────────────────────
 * O `.lc-error` era um `<span>` que o autor preenchia à mão e podia esquecer de
 * sincronizar com o campo. Aqui a mensagem sai da constraint validation nativa
 * do controle interno: `required`, `type="email"`, `pattern`, `min`, tudo o que
 * o navegador já sabe validar. `setCustomValidity()` cobre a regra de negócio.
 *
 * Segue o Web Awesome, que também não tem atributo `error`.
 *
 * ── Convenção de valor ───────────────────────────────────────────────────────
 * Como no nativo: o ATRIBUTO `value` é o valor de reset (`defaultValue`), e a
 * PROPRIEDADE `value` é o valor ao vivo. É isso que faz `form.reset()` voltar ao
 * que o HTML declarava em vez de esvaziar o campo.
 */
import { LC_CHANGE, LC_INPUT, LC_INVALID } from './events.js';
import { LcFormElement } from './lc-form-element.js';

/** As bandeiras de ValidityState que espelhamos do controle interno. */
const BANDEIRAS = [
  'badInput',
  'customError',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing',
];

export class LcCampo extends LcFormElement {
  static properties = {
    ...LcFormElement.properties,
    /** Rótulo. Para rótulo com HTML, use o slot `label`. */
    label: 'string',
    /** Texto de apoio. Para HTML, use o slot `hint`. */
    hint: 'string',
    /** Texto de exemplo dentro do controle. */
    placeholder: 'string',
    /** Valor de RESET. A propriedade `value` é o valor ao vivo. */
    defaultValue: { type: 'string', attribute: 'value' },
  };

  static watch = {
    label: 'syncChrome',
    hint: 'syncChrome',
    placeholder: 'syncChrome',
    disabled: 'syncChrome',
    required: 'syncChrome',
  };

  /** O controle nativo dentro do shadow root. Subclasse define o seletor. */
  get control() {
    return this.$('.control');
  }

  get value() {
    return this.control?.value ?? this.defaultValue ?? '';
  }

  set value(v) {
    if (this.control) this.control.value = v ?? '';
    this.syncValue();
  }

  ready() {
    const c = this.control;
    if (!c) return;

    /* Rótulo aponta para o controle por `for`/`id` DENTRO do mesmo shadow root:
       clicar no texto foca o campo, e o leitor de tela anuncia os dois juntos. */
    c.id = 'control';
    this.$('.rotulo')?.setAttribute('for', 'control');

    /* Só aplica se houver valor de fato. MEDIDO: com `!= null`, um
       `defaultValue` vazio (o caso de `<lc-select>` sem atributo `value`)
       atribuía '' ao `<select>`, o que LIMPA a seleção — e o nativo, sem atributo
       `value`, seleciona a primeira opção. O campo saía vazio do FormData. */
    if (this.defaultValue) c.value = this.defaultValue;

    c.addEventListener('input', () => {
      this.syncValue();
      /* Enquanto digita, só LIMPAMOS o erro; não acusamos. Acusar a cada tecla
         marca o campo como errado antes de a pessoa terminar de escrever. */
      if (this.hasState('invalid') && c.checkValidity()) this.setState('invalid', false);
      this.emit(LC_INPUT, { detail: { value: this.value } });
    });

    c.addEventListener('change', () => {
      this.syncValue();
      this.emit(LC_CHANGE, { detail: { value: this.value } });
    });

    /* Ao sair do campo é o momento honesto de mostrar erro: a pessoa terminou. */
    c.addEventListener('blur', () => this.revelarErro());

    /* Disparado pelo navegador durante a validação do formulário (no submit). */
    this.addEventListener('invalid', () => {
      this.revelarErro();
      this.emit(LC_INVALID, { detail: { message: this.validationMessage } });
    });

    this.syncChrome();
    this.syncValue();
  }

  /** Espelha rótulo, dica, placeholder e estados no shadow root. */
  syncChrome() {
    const c = this.control;
    if (!c) return;

    const rotulo = this.$('.rotulo-texto');
    if (rotulo) rotulo.textContent = this.label ?? '';

    const dica = this.$('.dica-texto');
    if (dica) dica.textContent = this.hint ?? '';

    /* `has-label`/`has-hint` consideram o SLOT também: rótulo com HTML vem por
       slot e o atributo fica vazio, mas o espaço tem de ser reservado. */
    this.setState('has-label', Boolean(this.label) || this.temSlot('label'));
    this.setState('has-hint', Boolean(this.hint) || this.temSlot('hint'));

    if (this.placeholder != null && 'placeholder' in c) c.placeholder = this.placeholder;
    c.disabled = Boolean(this.disabled);
    c.required = Boolean(this.required);

    this.syncValue();
  }

  temSlot(nome) {
    return Boolean(this.querySelector(`[slot="${nome}"]`));
  }

  /** Publica o valor no formulário e espelha a validade do controle interno. */
  syncValue() {
    const c = this.control;
    if (!c) return;

    this.setFormValue(c.value);

    const flags = {};
    for (const b of BANDEIRAS) if (c.validity[b]) flags[b] = true;
    this.setValidity(flags, c.validationMessage, c);

    const erro = this.$('.erro');
    if (erro) erro.textContent = c.validationMessage;
  }

  revelarErro() {
    const c = this.control;
    if (!c) return;
    this.setState('invalid', !c.checkValidity());
    this.syncValue();
  }

  /**
   * Define uma mensagem de erro de negócio. String vazia limpa.
   * É o caminho previsto pela decisão B — não existe atributo `error`.
   */
  setCustomValidity(message) {
    this.control?.setCustomValidity(message ?? '');
    this.revelarErro();
  }

  /** Limpa erro customizado e o estado visual de inválido. */
  resetValidity() {
    this.control?.setCustomValidity('');
    this.setState('invalid', false);
    this.syncValue();
  }

  /** Chamado pelo `formResetCallback` da base em `form.reset()`. */
  reset() {
    if (this.control) this.control.value = this.defaultValue ?? '';
    this.resetValidity();
  }

  focus(options) {
    this.control?.focus(options);
  }

  blur() {
    this.control?.blur();
  }
}
