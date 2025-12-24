// Constantes compartilhadas entre diferentes partes do projeto

// Para compatibilidade com content scripts não-modulares, expomos as
// constantes no objeto global `window.INVA_CONSTANTS` (evita usar `export`/ESM).
window.INVA_CONSTANTS = window.INVA_CONSTANTS || {};
window.INVA_CONSTANTS.EXTENSION_NAME = 'inVa Extension';
window.INVA_CONSTANTS.DEFAULT_TIMEOUT = 5000;
window.INVA_CONSTANTS.CREATE_TICKET_URL_KEY = 'createTicketUrl';

// Constantes específicas para RequestShowView
window.INVA_CONSTANTS.REQUEST_SHOW_TITLE = window.INVA_CONSTANTS.REQUEST_SHOW_TITLE || 'Artigos';
window.INVA_CONSTANTS.REQUEST_SHOW_TIMEOUT = window.INVA_CONSTANTS.REQUEST_SHOW_TIMEOUT || 5000; // ms

// Editor e descrição
window.INVA_CONSTANTS.CATEGORY_STEP1_ID = 'category_step1';
window.INVA_CONSTANTS.REQUEST_DESCRIPTION_ID = 'request_description';
window.INVA_CONSTANTS.REQUEST_DESCRIPTION_STORAGE_KEY = 'request_description_text';

// KB Featured Articles
window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_TIMEOUT = 300000; // 5 minutos em ms

