/**
 * Constantes centralizadas da aplicação
 */

export const STORAGE_KEYS = {
  CREATE_TICKET_URL: "createTicketUrl",
  DEBUG_ENABLED: "inva_debug_enabled",
  LOGS: "inva_logs",
  COMMENT_PREFIX: "inva_comments:"
} as const;

export const SELECTORS = {
  SUBMIT_BUTTON: "#submit_button.button-blue",
  CONTAINER: ".category_step1, #category_step1, div.category_step1, div#category_step1",
  IFRAME_EDITOR: ".cke_wysiwyg_frame",
  INLINE_EDITOR: ".cke_editable",
  TEXTAREA: "#comments"
} as const;

export const ELEMENT_IDS = {
  COMMENTS_TEXTAREA: "comments",
  FORM_STYLES: "inva-comment-form-styles",
  VALIDATION_MESSAGE: "inva-validation-message",
  CHAR_COUNTER: "inva-char-counter"
} as const;

export const CSS_CLASSES = {
  COMMENT_FORM: "inva-comment-form",
  COMMENT_HEADER: "inva-comment-header",
  COMMENT_TEXTAREA: "inva-comment-textarea",
  VALIDATION_ERROR: "inva-validation-error",
  CHAR_COUNTER: "inva-char-counter"
} as const;

export const LIMITS = {
  MAX_LOGS: 200,
  STABILITY_INTERVAL_MS: 400,
  STABILITY_MAX_ATTEMPTS: 80,
  STABILITY_REQUIRED_MATCHES: 4,
  DOM_OBSERVER_TIMEOUT_MS: 10000,
  DEBOUNCE_INPUT_MS: 600,
  STATUS_MESSAGE_DURATION_MS: 1500,
  MIN_COMMENT_LENGTH: 3,
  MAX_COMMENT_LENGTH: 5000
} as const;

export const WRAPPER_ID = "inva-elemento-wrapper" as const;
