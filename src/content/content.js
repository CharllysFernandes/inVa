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
    // Lógica específica para exibição de ticket
} else if (urlType === 'REQUESTS_SHOW_ID') {
    console.log('Página de requisição detectada.');
    // Lógica específica para requisição
} else {
    console.log('Tipo de URL desconhecido.');
}