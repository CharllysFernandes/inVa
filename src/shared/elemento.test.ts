import { describe, it, expect, beforeEach } from 'vitest';
import { createCommentForm, injectCommentFormStyles } from './elemento';
import { ELEMENT_IDS, CSS_CLASSES } from './constants';

describe('elemento', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('injectCommentFormStyles', () => {
    it('deve injetar estilos no head', () => {
      injectCommentFormStyles();

      const styleElement = document.getElementById(ELEMENT_IDS.FORM_STYLES);
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
    });

    it('não deve injetar estilos duplicados', () => {
      injectCommentFormStyles();
      injectCommentFormStyles();
      injectCommentFormStyles();

      const styles = document.querySelectorAll(`#${ELEMENT_IDS.FORM_STYLES}`);
      expect(styles.length).toBe(1);
    });

    it('deve conter classes CSS esperadas', () => {
      injectCommentFormStyles();

      const styleElement = document.getElementById(ELEMENT_IDS.FORM_STYLES);
      const content = styleElement?.textContent || '';

      expect(content).toContain('.inva-comment-form');
      expect(content).toContain('.inva-comment-header');
      expect(content).toContain('.inva-comment-textarea');
    });
  });

  describe('createCommentForm', () => {
    it('deve criar formulário com elementos básicos', () => {
      const elements = createCommentForm();

      expect(elements.form).toBeInstanceOf(HTMLFormElement);
      expect(elements.textarea).toBeInstanceOf(HTMLTextAreaElement);
      
      // Verifica se textarea está na árvore DOM do formulário
      const allTextareas = elements.form.querySelectorAll('textarea');
      expect(Array.from(allTextareas)).toContain(elements.textarea);
    });

    it('deve aplicar classes CSS corretas', () => {
      const elements = createCommentForm();

      expect(elements.form.className).toContain(CSS_CLASSES.COMMENT_FORM);
      expect(elements.textarea.className).toContain(CSS_CLASSES.COMMENT_TEXTAREA);
    });

    it('deve definir atributos ARIA para acessibilidade', () => {
      const elements = createCommentForm();

      expect(elements.form.getAttribute('aria-label')).toBe('Formulário de anotação do chamado');
      expect(elements.textarea.getAttribute('aria-label')).toBe('Campo de anotação do chamado');
    });

    it('deve criar textarea com ID correto', () => {
      const elements = createCommentForm();

      expect(elements.textarea.id).toBe(ELEMENT_IDS.COMMENTS_TEXTAREA);
    });

    it('deve aplicar configuração padrão', () => {
      const elements = createCommentForm();

      expect(elements.textarea.getAttribute('rows')).toBe('4');
      expect(elements.textarea.getAttribute('placeholder')).toBe('Digite sua anotação aqui...');
    });

    it('deve aplicar placeholder personalizado', () => {
      const customPlaceholder = 'Escreva suas observações aqui';
      const elements = createCommentForm({ placeholder: customPlaceholder });

      expect(elements.textarea.getAttribute('placeholder')).toBe(customPlaceholder);
    });

    it('deve aplicar número de linhas personalizado', () => {
      const elements = createCommentForm({ rows: 10 });

      expect(elements.textarea.getAttribute('rows')).toBe('10');
    });

    it('deve combinar múltiplas configurações', () => {
      const elements = createCommentForm({
        placeholder: 'Custom placeholder',
        rows: 6
      });

      expect(elements.textarea.getAttribute('placeholder')).toBe('Custom placeholder');
      expect(elements.textarea.getAttribute('rows')).toBe('6');
    });

    it('deve incluir header com título', () => {
      const elements = createCommentForm();

      const header = elements.form.querySelector(`.${CSS_CLASSES.COMMENT_HEADER}`);
      expect(header).not.toBeNull();
      expect(header?.textContent).toContain('Anotação do chamado:');
    });

    it('deve ter estrutura DOM correta', () => {
      const elements = createCommentForm();

      // Form deve ter 2 filhos: header e textarea
      expect(elements.form.children.length).toBe(2);
      
      const header = elements.form.children[0];
      const textarea = elements.form.children[1];

      expect(header.className).toContain(CSS_CLASSES.COMMENT_HEADER);
      expect(textarea).toBe(elements.textarea);
    });

    it('deve injetar estilos automaticamente ao criar formulário', () => {
      createCommentForm();

      const styleElement = document.getElementById(ELEMENT_IDS.FORM_STYLES);
      expect(styleElement).not.toBeNull();
    });

    it('header deve ter atributos de role apropriados', () => {
      const elements = createCommentForm();

      const header = elements.form.querySelector(`.${CSS_CLASSES.COMMENT_HEADER}`) as HTMLElement;
      expect(header?.getAttribute('role')).toBe('heading');
      expect(header?.getAttribute('aria-level')).toBe('1');
    });

    it('deve criar múltiplos formulários independentes', () => {
      const form1 = createCommentForm();
      const form2 = createCommentForm();

      expect(form1.form).not.toBe(form2.form);
      expect(form1.textarea).not.toBe(form2.textarea);
    });
  });

  describe('integração - uso no DOM', () => {
    it('deve funcionar quando anexado ao documento', () => {
      const elements = createCommentForm();
      document.body.appendChild(elements.form);

      const formInDom = document.querySelector(`#${ELEMENT_IDS.COMMENTS_TEXTAREA}`);
      expect(formInDom).toBe(elements.textarea);
    });

    it('textarea deve ser editável', () => {
      const elements = createCommentForm();
      document.body.appendChild(elements.form);

      elements.textarea.value = 'Test content';
      expect(elements.textarea.value).toBe('Test content');
    });

    it('botão de limpar deve ter classe inputBasic no textarea', () => {
      const elements = createCommentForm();
      
      expect(elements.textarea.className).toContain('inputBasic');
    });
  });
});
