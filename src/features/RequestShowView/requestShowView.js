// Detecta itens apenas sob o título especificado dentro de .message-list
// Fornece funções leves e um observer seletivo para evitar carga desnecessária na página.
// Compatível com ambiente não-modular: usamos `window.INVA_CONSTANTS` e `window.NO_KB_HTML`.
const requestShowViewApi = (function () {

    /**
     * Busca elementos cuja classe é `.message-list__title` e cujo texto é exatamente
     * o título configurado (`TITLE_TEXT`).
     * @returns {HTMLElement[]} Array de elementos de título que correspondem a 'Artigos'.
     */
    function findArticleTitleElements() {
        try {
            return Array.from(document.querySelectorAll('.message-list__title'))
                .filter(el => el && el.textContent && el.textContent.trim() === (window.INVA_CONSTANTS && window.INVA_CONSTANTS.REQUEST_SHOW_TITLE ? window.INVA_CONSTANTS.REQUEST_SHOW_TITLE : 'Artigos'));
        } catch (e) {
            console.warn('requestShowView: erro em findArticleTitleElements', e);
            return [];
        }
    }

    /**
     * Dado um elemento `.message-list__title`, retorna os elementos de item correspondentes
     * dentro do mesmo container `.message-list`.
     * @param {HTMLElement} titleEl
     * @returns {HTMLElement[]} Itens encontrados (possivelmente vazio).
     */
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

    /**
     * Retorna todos os itens encontrados sob os títulos 'Artigos'.
     * @returns {HTMLElement[]} Array com os elementos de item encontrados.
     */
    function getAllArticleItems() {
        const titles = findArticleTitleElements();
        if (!titles.length) return [];
        return titles.flatMap(getItemsFromTitleEl);
    }

    /**
     * Observa a página e chama `callback(items)` quando itens de 'Artigos' estiverem
     * disponíveis. Se já existirem, chama imediatamente. Caso contrário, observa
     * mutações até encontrar itens ou até o timeout expirar, quando chama `callback([])`.
     * @param {(items: HTMLElement[]) => void} callback Função chamada com os itens (array vazio se não encontrado).
     * @param {{timeout?: number}} [options]
     * @returns {{disconnect: () => void}|{disconnected: true}} Handle para desconectar o observer.
     */
    function whenArticleItemsAvailable(callback, options = {}) {
        const timeout = typeof options.timeout === 'number' ? options.timeout : (window.INVA_CONSTANTS && window.INVA_CONSTANTS.REQUEST_SHOW_TIMEOUT ? window.INVA_CONSTANTS.REQUEST_SHOW_TIMEOUT : 10000);
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

            let finished = false;
            let to = null;

            const observer = new MutationObserver((mutations, obs) => {
                for (const m of mutations) {
                    if (m.addedNodes && m.addedNodes.length) {
                        for (const node of m.addedNodes) {
                            if (node.nodeType !== 1) continue;

                            if (node.matches && (node.matches('.message-list') || node.matches('.message-list *'))) {
                                const items = getAllArticleItems();
                                if (items.length) {
                                    if (!finished) {
                                        finished = true;
                                        clearTimeout(to);
                                        try { callback(items); } catch (_) { }
                                    }
                                    try { obs.disconnect(); } catch (e) { }
                                    return;
                                }
                            }
                        }
                    }
                }
            });

            observer.observe(root, { childList: true, subtree: true });

            // Timeout para garantir desconexão e notificar "não encontrado"
            to = setTimeout(() => {
                if (!finished) {
                    finished = true;
                    try { observer.disconnect(); } catch (e) { }
                    try { callback([]); } catch (_) { }
                }
            }, timeout);

            return {
                disconnect: () => {
                    if (!finished) {
                        finished = true;
                        try { observer.disconnect(); } catch (e) { }
                        clearTimeout(to);
                    }
                }
            };
        } catch (e) {
            console.warn('requestShowView: erro ao observar itens de Artigos', e);
            try { callback([]); } catch (_) { }
            return { disconnected: true };
        }
    }

    // Preparar objeto API para export e atribuição global após a fábrica
    /**
     * Handler público padrão para processar/logar os items retornados.
     * Pode ser substituído por outras features que consomem a API.
     * @param {HTMLElement[]} items
     * @returns {void}
     */
    function handleArticleItems(items) {
        try {
            if (items && items.length) {
                console.log('requestShowView: items recebidos:', items.length);
                return;
            }

            // nenhum item encontrado — log único e inserir aviso visual no toolbar
            console.log('requestShowView: nenhum artigo encontrado');

            try {
                const toolbar = document.getElementById('request_toolbar');
                if (!toolbar) return;

                // evitar inserir duplicado (procura pelo template data attribute)
                if (toolbar.querySelector('[data-inva-template="no-kb"]')) return;

                const spacer = toolbar.querySelector('.section-header__spacer');
                const wrapper = document.createElement('div');
                wrapper.innerHTML = window.NO_KB_HTML || '<a data-inva-template="no-kb">Sem base de conhecimento associada</a>'; // use template from templates.js
                const node = wrapper.firstElementChild;

                if (spacer && spacer.parentNode === toolbar) {
                    toolbar.insertBefore(node, spacer.nextSibling);
                } else {
                    toolbar.appendChild(node);
                }
            } catch (e) {
                // não bloquear execução principal
                console.warn('requestShowView: falha ao inserir aviso de "nenhum artigo"', e);
            }
        } catch (e) {
            console.warn('requestShowView: erro em handleArticleItems', e);
        }
    }

    // Auto-log para depuração leve (desabilite em produção se necessário)
    try {
        const items = getAllArticleItems();
        if (items.length) console.log('requestShowView: itens de Artigos encontrados:', items.length);
    } catch (e) { }

    return {
        findArticleTitleElements,
        getItemsFromTitleEl,
        getAllArticleItems,
        whenArticleItemsAvailable,
        handleArticleItems
    };
})();

// Atribuir em `window` para compatibilidade com código que usa a API global
window.requestShowView = window.requestShowView || requestShowViewApi;