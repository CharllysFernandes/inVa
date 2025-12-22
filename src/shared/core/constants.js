
/**
 * Constantes centralizadas da aplicação
 * @module constants
 */

/**
 * Chaves de armazenamento do Chrome Storage API
 */
export const STORAGE_KEYS = {
  CREATE_TICKET_URL: "createTicketUrl",
  DEBUG_ENABLED: "inva_debug_enabled",
  LOGS: "inva_logs",
  COMMENT_PREFIX: "inva_comments:",
  OPENROUTER_API_KEY: "inva_openrouter_api_key",
  OPENROUTER_SITE_URL: "inva_openrouter_site_url",
  OPENROUTER_APP_NAME: "inva_openrouter_app_name",
  HIDE_KNOWLEDGE_BASE: "inva_hide_knowledge_base",
};

/**
 * Seletores CSS para elementos do DOM
 */
export const SELECTORS = {
  SUBMIT_BUTTON: "#submit_button.button-blue",
  CONTAINER:
    ".category_step1, #category_step1, div.category_step1, div#category_step1",
  IFRAME_EDITOR: ".cke_wysiwyg_frame",
  INLINE_EDITOR: ".cke_editable",
  TEXTAREA: "#comments",
  KNOWLEDGE_BASE_ARTICLES: "#featured_kb_articles",
  ACTIVITY_MESSAGE_ARTICLES: ".activity-message__articles",
  KNOWLEDGE_BASE_LOADER: "#kb_box .section-box__loader",
};

/**
 * IDs de elementos HTML criados dinamicamente
 */
export const ELEMENT_IDS = {
  COMMENTS_TEXTAREA: "comments",
  FORM_STYLES: "inva-comment-form-styles",
};

/**
 * Classes CSS utilizadas nos elementos criados
 */
export const CSS_CLASSES = {
  COMMENT_FORM: "inva-comment-form",
  COMMENT_HEADER: "inva-comment-header",
  COMMENT_TEXTAREA: "inva-comment-textarea",
};

/**
 * Limites e timeouts utilizados na aplicação
 */
export const LIMITS = {
  MAX_LOGS: 200,
  STABILITY_INTERVAL_MS: 400,
  STABILITY_MAX_ATTEMPTS: 80,
  STABILITY_REQUIRED_MATCHES: 4,
  DOM_OBSERVER_TIMEOUT_MS: 10000,
  DEBOUNCE_INPUT_MS: 600,
  STATUS_MESSAGE_DURATION_MS: 1500,
};

/**
 * ID do wrapper principal que contém o formulário injetado
 */
export const WRAPPER_ID = "inva-elemento-wrapper";