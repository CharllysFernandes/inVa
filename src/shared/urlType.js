
// Função global para identificar o tipo de URL
function getUrlType(url) {
    if (!url || typeof url !== 'string') return null;
    if (url.endsWith('/incident/create')) return 'TICKET_CREATE';
    if (url.includes('views/index/show/view_id/')) return 'TICKET_SHOW_VIEW';
    if (url.includes('requests/show/index/id')) return 'REQUESTS_SHOW_ID';
    return 'UNKNOWN';
}

window.getUrlType = getUrlType;
