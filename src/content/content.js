// content script for the browser extension.
// This script runs in the context of web pages to enhance user experience.

// function initialize content script
function initializeContentScript() {
    console.log('Content script initialized.');
    // Add your content script logic here
}

// Run the initialization function
initializeContentScript();


// Captura a url da página atual e usa a função global getUrlType
const currentUrl = window.location.href;
const urlType = window.getUrlType(currentUrl);




if (urlType === 'TICKET_CREATE') {
    console.log('Página de criação de ticket detectada.');
    // chame a função editor sync
    window.createCKEditor();
    // Lógica específica para criação de ticket
} else if (urlType === 'TICKET_SHOW_VIEW') {
    console.log('Página de exibição de ticket detectada.');
   
} else if (urlType === 'REQUESTS_SHOW_ID') {
    console.log('Página de requisição detectada.');
    // Chamar API da feature apenas nesta rota.
    try {
        if (typeof window.requestShowView === 'function') {
            // compatibilidade com implementação antiga
            window.requestShowView();
        } else if (window.requestShowView && typeof window.requestShowView.whenArticleItemsAvailable === 'function') {
            window.requestShowView.whenArticleItemsAvailable((items) => {
                console.log('requestShowView: items recebidos:', items.length);
                // Exemplo de uso: destacar ou processar items
                // items.forEach(el => { /* ... */ });
            }, { timeout: 10000 });
        } else {
            console.warn('requestShowView API não disponível.');
        }
    } catch (e) {
        console.error('Erro ao chamar requestShowView:', e);
    }
    // Lógica específica para requisição
} else {
    console.log('Tipo de URL desconhecido.');
}