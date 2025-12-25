
/**
 * Função global para identificar o tipo de URL com base em padrões conhecidos.
 * 
 * @param {string} url - A URL a ser analisada.
 * @returns {string|null} O tipo de URL ou null se a entrada for inválida.
 */
function getUrlType(url) {
    // Validação da entrada
    if (!url || typeof url !== 'string') return null;

    // Verifica se as constantes estão definidas
    if (!window.INVA_CONSTANTS || !window.INVA_CONSTANTS.URL_TYPES || !window.INVA_CONSTANTS.URL_IDENTIFIERS) {
        console.warn('URL_TYPES ou URL_IDENTIFIERS não estão definidos.');
        return null;
    }

    const URL_TYPES = window.INVA_CONSTANTS.URL_TYPES;
    const URL_IDENTIFIERS = window.INVA_CONSTANTS.URL_IDENTIFIERS;

    // Verifica cada tipo de URL conhecido
    for (const [type, identifier] of Object.entries(URL_IDENTIFIERS)) {
        if (url.includes(identifier)) {
            return type;
        }
    }

    // Retorna UNKNOWN se nenhum padrão for encontrado
    return URL_TYPES.UNKNOWN;
}

// Exporta a função para uso global
window.getUrlType = getUrlType;
