// Detecta itens apenas sob o título "Artigos" dentro de .message-list
// Fornece funções leves e um observer seletivo para evitar carga desnecessária na página.
(function () {
    const TITLE_TEXT = 'Artigos';
    const DEFAULT_TIMEOUT = 10000; // desconecta observer após 10s por padrão

    function findArticleTitleElements() {
        try {
            return Array.from(document.querySelectorAll('.message-list__title'))
                .filter(el => el && el.textContent && el.textContent.trim() === TITLE_TEXT);
        } catch (e) {
            console.warn('requestShowView: erro em findArticleTitleElements', e);
            return [];
        }
    }

    // Dado um elemento .message-list__title, retorna os elementos de item correspondentes
    function getItemsFromTitleEl(titleEl) {
        if (!titleEl || titleEl.nodeType !== 1) return [];
        const list = titleEl.closest('.message-list');
        if (!list) return [];

        // Priorizar container explícito de itens
        const itemsContainer = list.querySelector('.message-list__items');
        if (itemsContainer) {
            return Array.from(itemsContainer.children).filter(n => n.nodeType === 1);
        }

        // Fallback: procurar elementos com classe que contenha 'message-list-item'
        return Array.from(list.querySelectorAll('[class*="message-list-item"]'));
    }

    function getAllArticleItems() {
        const titles = findArticleTitleElements();
        if (!titles.length) return [];
        return titles.flatMap(getItemsFromTitleEl);
    }

    // Chama callback assim que itens de "Artigos" forem encontrados.
    // Observa adicionamentos de nós de forma seletiva e se desconecta ao primeiro sucesso (ou timeout).
    function whenArticleItemsAvailable(callback, options = {}) {
        const timeout = typeof options.timeout === 'number' ? options.timeout : DEFAULT_TIMEOUT;

        try {
            const found = getAllArticleItems();
            if (found.length) {
                callback(found);
                return { disconnected: true };
            }

            const root = document.documentElement || document.body;
            if (!root) {
                // nada a observar
                callback([]);
                return { disconnected: true };
            }

            const observer = new MutationObserver((mutations, obs) => {
                for (const m of mutations) {
                    // limitar trabalho: apenas quando houver nós adicionados
                    if (m.addedNodes && m.addedNodes.length) {
                        for (const node of m.addedNodes) {
                            if (node.nodeType !== 1) continue;

                            // caso o nó adicionado seja ou contenha uma message-list, verificar
                            if (node.matches && (node.matches('.message-list') || node.matches('.message-list *'))) {
                                const items = getAllArticleItems();
                                if (items.length) {
                                    try { callback(items); } catch (_) {}
                                    obs.disconnect();
                                    return;
                                }
                            }
                        }
                    }
                }
            });

            observer.observe(root, { childList: true, subtree: true });

            // Timeout para garantir desconexão e evitar observer permanente
            const to = setTimeout(() => {
                try { observer.disconnect(); } catch (e) {}
            }, timeout);

            return {
                disconnect: () => {
                    try { observer.disconnect(); } catch (e) {}
                    clearTimeout(to);
                }
            };
        } catch (e) {
            console.warn('requestShowView: erro ao observar itens de Artigos', e);
            callback([]);
            return { disconnected: true };
        }
    }

    // Expor API leve global para uso por outras features
    window.requestShowView = window.requestShowView || {};
    window.requestShowView.findArticleTitleElements = findArticleTitleElements;
    window.requestShowView.getItemsFromTitleEl = getItemsFromTitleEl;
    window.requestShowView.getAllArticleItems = getAllArticleItems;
    window.requestShowView.whenArticleItemsAvailable = whenArticleItemsAvailable;

    // Auto-log para depuração leve (desabilite em produção se necessário)
    try {
        const items = getAllArticleItems();
        if (items.length) console.log('requestShowView: itens de Artigos encontrados:', items.length);
    } catch (e) {}
})();