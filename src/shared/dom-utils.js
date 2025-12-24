/**
 * Utilitários para manipulação de DOM.
 * Compatível com extensões MV3.
 */

/**
 * Aguarda um elemento aparecer no DOM usando MutationObserver.
 * @param {string} selector - Seletor CSS do elemento (ex.: '#id', '.class').
 * @param {number} [timeout=10000] - Timeout em ms para parar a espera.
 * @returns {Promise<boolean>} - Resolve com true se o elemento foi encontrado, false se timeout.
 */
window.waitForElement = function (selector, timeout = 10000) {
    return new Promise((resolve) => {
        // Verifica se já existe
        if (document.querySelector(selector)) {
            resolve(true);
            return;
        }

        let timeoutId;
        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                clearTimeout(timeoutId);
                resolve(true);
            }
        });

        observer.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true
        });

        // Safety timeout
        timeoutId = setTimeout(() => {
            observer.disconnect();
            resolve(false);
        }, timeout);
    });
};