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
window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_STORAGE_KEY = 'switch_kb_featured_articles';
window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_ELEMENT_ID = 'featured_kb_articles';

// Constantes para tipos de URL
window.INVA_CONSTANTS.URL_TYPES = {
    TICKET_CREATE: 'TICKET_CREATE',
    TICKET_SHOW_VIEW: 'TICKET_SHOW_VIEW',
    REQUESTS_SHOW_ID: 'REQUESTS_SHOW_ID',
    UNKNOWN: 'UNKNOWN'
};

// Identificadores de URL para cada tipo
window.INVA_CONSTANTS.URL_IDENTIFIERS = {
    [window.INVA_CONSTANTS.URL_TYPES.TICKET_CREATE]: '/incident/create',
    [window.INVA_CONSTANTS.URL_TYPES.TICKET_SHOW_VIEW]: 'views/index/show/view_id/',
    [window.INVA_CONSTANTS.URL_TYPES.REQUESTS_SHOW_ID]: 'requests/show/index/id'
};

// Timeout padrão para aguardar elementos no DOM (em milissegundos)
window.INVA_CONSTANTS.DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT = 10000;

