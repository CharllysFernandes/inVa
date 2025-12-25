/**
 * Content script principal para a extensão.
 * Executado no contexto da página para adicionar melhorias específicas por rota.
 * Documentado com JSDoc para facilitar manutenção.
 */


/**
 * Inicializa o content script.
 * @returns {void}
 */
// function initialize content script
function initializeContentScript() {
    console.log('Content script initialized.');

    // Adiciona listener para mensagens do popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggleKnowledgeBase') {
            const elementId = window.INVA_CONSTANTS.KB_FEATURED_ARTICLES_ELEMENT_ID;
            const el = document.getElementById(elementId);
            if (el) {
                el.style.display = request.hide ? 'none' : '';
                console.log(`Elemento ${elementId} ${request.hide ? 'ocultado' : 'mostrado'} na página ativa.`);
            } else {
                console.log(`Elemento ${elementId} não encontrado na página ativa.`);
            }
        }
    });
}

initializeContentScript();

// NOTE: avoid static `import` here to prevent SyntaxError when the content
// script is not loaded as a module. We try dynamic import at runtime and
// always fallback to `window.requestShowView` for maximum compatibility.

/**
 * Determina o tipo de URL atual.
 * @param {string} url - A URL a ser analisada.
 * @returns {string} Tipo de URL identificado.
 */
const currentUrl = window.location.href;
const urlType = window.getUrlType(currentUrl);

/**
 * Handler para a rota de criação de ticket.
 * Ativa o editor (CKEditor) quando disponível.
 * @returns {void}
 */
function handleTicketCreate() {
    console.log('Página de criação de ticket detectada.');
    try {
        if (typeof window.createCKEditor === 'function') window.createCKEditor();
    } catch (e) {
        console.warn('Erro ao chamar createCKEditor:', e);
    }

    // Inicializa o módulo de artigos destacados da KB (compatível com MV3)
    try {
        if (typeof window.initKbFeaturedArticles === 'function') {
            window.featured_kb_articles();
        } else {
            console.warn('featured_kb_articles não disponível.');
        }
    } catch (e) {
        console.warn('Não foi possível inicializar kb-featured-articles:', e);
    }
}

/**
 * Handler para a rota de exibição de ticket.
 * @returns {void}
 */
function handleTicketShowView() {
    console.log('Página de exibição de ticket detectada.');
}

/**
 * Handler para a rota de exibição de requisição (`REQUESTS_SHOW_ID`).
 * Chama a API `requestShowView.whenArticleItemsAvailable` fornecendo o handler
 * documentado em `requestShowView.handleArticleItems`.
 * @returns {void}
 */
function handleRequestsShowId() {
    console.log('Página de requisição detectada.');
    const api = window.requestShowView;
    const whenAvailable = api?.whenArticleItemsAvailable;
    const handler = api?.handleArticleItems ?? (() => { });

    if (typeof whenAvailable !== 'function') {
        console.warn('requestShowView API não disponível.');
        return;
    }

    try {
        whenAvailable(handler, { timeout: 5000 }); // 5 segundos de timeout
    } catch (e) {
        console.error('Erro ao chamar requestShowView:', e);
    }
}

/** Roteia para o handler apropriado com base no tipo de URL.
 */

switch (urlType) {
    case 'TICKET_CREATE':
        handleTicketCreate();
        break;
    case 'TICKET_SHOW_VIEW':
        handleTicketShowView();
        break;
    case 'REQUESTS_SHOW_ID':
        handleRequestsShowId();
        break;
    default:
        console.log('Tipo de URL desconhecido.');
}