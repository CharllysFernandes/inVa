/**
 * Constantes centralizadas da aplicação
 * @module constants
 */

/**
 * Chaves de armazenamento do Chrome Storage API
 * @constant
 * @type {Object}
 * @property {string} CREATE_TICKET_URL - URL de criação de ticket salva pelo usuário
 * @property {string} DEBUG_ENABLED - Flag de debug ativado/desativado
 * @property {string} LOGS - Chave para armazenamento de logs
 * @property {string} COMMENT_PREFIX - Prefixo para chaves de comentários por URL
 */
export const STORAGE_KEYS = {
  CREATE_TICKET_URL: "createTicketUrl",
  DEBUG_ENABLED: "inva_debug_enabled",
  LOGS: "inva_logs",
  COMMENT_PREFIX: "inva_comments:"
} as const;

/**
 * Seletores CSS para elementos do DOM
 * @constant
 * @type {Object}
 * @property {string} SUBMIT_BUTTON - Botão de submit do formulário
 * @property {string} CONTAINER - Container principal onde o formulário será injetado
 * @property {string} IFRAME_EDITOR - Editor CKEditor em modo iframe
 * @property {string} INLINE_EDITOR - Editor CKEditor em modo inline
 * @property {string} TEXTAREA - Textarea de comentários
 */
export const SELECTORS = {
  SUBMIT_BUTTON: "#submit_button.button-blue",
  CONTAINER: ".category_step1, #category_step1, div.category_step1, div#category_step1",
  IFRAME_EDITOR: ".cke_wysiwyg_frame",
  INLINE_EDITOR: ".cke_editable",
  TEXTAREA: "#comments"
} as const;

/**
 * IDs de elementos HTML criados dinamicamente
 * @constant
 * @type {Object}
 * @property {string} COMMENTS_TEXTAREA - ID do textarea de comentários
 * @property {string} FORM_STYLES - ID do style tag injetado com CSS do formulário
 */
export const ELEMENT_IDS = {
  COMMENTS_TEXTAREA: "comments",
  FORM_STYLES: "inva-comment-form-styles"
} as const;

/**
 * Classes CSS utilizadas nos elementos criados
 * @constant
 * @type {Object}
 * @property {string} COMMENT_FORM - Classe do formulário de comentários
 * @property {string} COMMENT_HEADER - Classe do cabeçalho do formulário
 * @property {string} COMMENT_TEXTAREA - Classe do textarea de comentários
 */
export const CSS_CLASSES = {
  COMMENT_FORM: "inva-comment-form",
  COMMENT_HEADER: "inva-comment-header",
  COMMENT_TEXTAREA: "inva-comment-textarea"
} as const;

/**
 * Limites e timeouts utilizados na aplicação
 * @constant
 * @type {Object}
 * @property {number} MAX_LOGS - Número máximo de logs mantidos em storage
 * @property {number} STABILITY_INTERVAL_MS - Intervalo de verificação de estabilidade do CKEditor (ms)
 * @property {number} STABILITY_MAX_ATTEMPTS - Número máximo de tentativas de estabilização
 * @property {number} STABILITY_REQUIRED_MATCHES - Número de matches consecutivos para considerar estável
 * @property {number} DOM_OBSERVER_TIMEOUT_MS - Timeout para observadores de DOM (ms)
 * @property {number} DEBOUNCE_INPUT_MS - Delay do debounce para input do usuário (ms)
 * @property {number} STATUS_MESSAGE_DURATION_MS - Duração de mensagens de status (ms)
 */
export const LIMITS = {
  MAX_LOGS: 200,
  STABILITY_INTERVAL_MS: 400,
  STABILITY_MAX_ATTEMPTS: 80,
  STABILITY_REQUIRED_MATCHES: 4,
  DOM_OBSERVER_TIMEOUT_MS: 10000,
  DEBOUNCE_INPUT_MS: 600,
  STATUS_MESSAGE_DURATION_MS: 1500
} as const;

/**
 * ID do wrapper principal que contém o formulário injetado
 * @constant
 * @type {string}
 */
export const WRAPPER_ID = "inva-elemento-wrapper" as const;
