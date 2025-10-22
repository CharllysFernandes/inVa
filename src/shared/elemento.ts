import { ELEMENT_IDS, CSS_CLASSES } from "./constants";

/**
 * Configuração do formulário de comentário
 */
export interface CommentFormConfig {
  withClearButton?: boolean;
  placeholder?: string;
  rows?: number;
}

/**
 * Elementos retornados ao criar o formulário
 */
export interface CommentFormElements {
  form: HTMLFormElement;
  textarea: HTMLTextAreaElement;
  clearButton?: HTMLButtonElement;
}

const DEFAULT_CONFIG: Required<CommentFormConfig> = {
  withClearButton: false,
  placeholder: "Digite sua anotação aqui...",
  rows: 4
};

/**
 * Injeta os estilos CSS do formulário de comentário no documento
 * Evita injeção duplicada verificando existência prévia
 */
export function injectCommentFormStyles(): void {
  if (document.getElementById(ELEMENT_IDS.FORM_STYLES)) return;

  const style = document.createElement("style");
  style.id = ELEMENT_IDS.FORM_STYLES;
  style.textContent = `
    .inva-comment-form { margin-bottom: 1rem; }
    .inva-comment-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 10px; }
    .inva-comment-textarea {
      margin: 8px 0 20px 0;
      width: -webkit-fill-available;
      width: -moz-available;
      width: fill-available;
      border: 1px solid aliceblue;
      background: var(--color-grey95, #f5f5f5);
      height: fit-content;
      min-height: 80px;
      font-size: var(--font-size--130, 14px);
      padding: 8px;
      line-height: 22px;
      resize: vertical;
      font-family: inherit;
      border-radius: 4px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .inva-comment-textarea:focus {
      outline: none;
      border-color: #00bcd4;
      box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.1);
    }
    .inva-comment-textarea::placeholder { color: #9e9e9e; opacity: 0.7; }
    .inva-clear-button {
      border: none;
      background: transparent;
      color: #b91c1c;
      font-weight: 700;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 16px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    .inva-clear-button:hover { background: rgba(185, 28, 28, 0.1); }
    .inva-clear-button:focus { outline: 2px solid #b91c1c; outline-offset: 2px; }
  `;
  document.head.appendChild(style);
}

/**
 * Cria o formulário de anotação de chamado programaticamente
 * @param config - Configuração opcional do formulário
 * @returns Objeto contendo as referências aos elementos criados
 */
export function createCommentForm(config: CommentFormConfig = {}): CommentFormElements {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Injeta estilos
  injectCommentFormStyles();

  const form = document.createElement("form");
  form.className = CSS_CLASSES.COMMENT_FORM;
  form.setAttribute("aria-label", "Formulário de anotação do chamado");

  // Header com título e botão opcional
  const header = document.createElement("div");
  header.className = `requestCategoryTitle ${CSS_CLASSES.COMMENT_HEADER}`;
  header.setAttribute("role", "heading");
  header.setAttribute("aria-level", "1");

  const titleSpan = document.createElement("span");
  titleSpan.textContent = "Anotação do chamado:";
  header.appendChild(titleSpan);

  let clearButton: HTMLButtonElement | undefined;
  if (finalConfig.withClearButton) {
    clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = CSS_CLASSES.CLEAR_BUTTON;
    clearButton.id = ELEMENT_IDS.CLEAR_BUTTON;
    clearButton.textContent = "×";
    clearButton.setAttribute("title", "Limpar anotação");
    clearButton.setAttribute("aria-label", "Limpar anotação");
    header.appendChild(clearButton);
  }

  // Textarea para comentários
  const textarea = document.createElement("textarea");
  textarea.className = `inputBasic ${CSS_CLASSES.COMMENT_TEXTAREA}`;
  textarea.id = ELEMENT_IDS.COMMENTS_TEXTAREA;
  textarea.setAttribute("rows", String(finalConfig.rows));
  textarea.setAttribute("aria-label", "Campo de anotação do chamado");
  textarea.setAttribute("placeholder", finalConfig.placeholder);

  form.appendChild(header);
  form.appendChild(textarea);

  return {
    form,
    textarea,
    clearButton
  };
}
