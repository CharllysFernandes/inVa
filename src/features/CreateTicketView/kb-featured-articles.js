/**
 * Inicializa o módulo de artigos destacados da KB.
 * Compatível com MV3: define uma função global para chamada direta.
 * @returns {void}
 */
window.initKbFeaturedArticles = async function () {
    'use strict';

    const STORAGE_KEY = 'switch_kb_featured_articles';

    function parseBool(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'boolean') return value;
        const v = String(value).trim().toLowerCase();
        if (v === 'true' || v === '1') return true;
        if (v === 'false' || v === '0' || v === '') return false;
        try {
            return Boolean(JSON.parse(v));
        } catch (e) {
            return false;
        }
    }

    function isTicketCreatePage() {
        try {
            if (typeof window.getUrlType === 'function') {
                return window.getUrlType(window.location.href) === 'TICKET_CREATE';
            }
        } catch (e) {
            // ignore
        }
        // fallback: check stored createTicketUrl if available
        try {
            const createUrl = localStorage.getItem('createTicketUrl');
            if (createUrl) return window.location.href.indexOf(createUrl) !== -1;
        } catch (e) {
            // ignore
        }
        return false;
    }

    function applyVisibility(shouldHide, el) {
        try {
            el.style.display = shouldHide ? 'none' : '';
        } catch (e) {
            // ignore
        }
    }

    // Entry
    try {
        if (!isTicketCreatePage()) return;

        const raw = localStorage.getItem(STORAGE_KEY);
        const shouldHide = parseBool(raw);

        const targetSelector = '#featured_kb_articles';

        console.log('Iniciando ocultação/habilitação de artigos destacados da KB.');

        // Usa a função utilitária para aguardar o elemento
        const found = await window.waitForElement(targetSelector, 10000);
        if (found) {
            const el = document.querySelector(targetSelector);
            if (el) applyVisibility(shouldHide, el);
        } else {
            console.warn('Elemento #featured_kb_articles não encontrado dentro do timeout.');
        }
    } catch (e) {
        // Fail silently to not break host page
        console.warn('Erro em initKbFeaturedArticles:', e);
    }
};