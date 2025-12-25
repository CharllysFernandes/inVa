
// Importa a constante de timeout padrão de constant.js
const DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT = window.INVA_CONSTANTS.DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT;

/**
 * Aguarda um elemento aparecer no DOM usando MutationObserver.
 * 
 * @param {string} selector - Seletor CSS do elemento (ex.: '#id', '.class').
 * @param {number} [timeout=DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT] - Timeout em ms para parar a espera.
 * @returns {Promise<boolean>} - Resolve com true se o elemento foi encontrado, false se timeout.
 * 
 * @example
 * // Aguarda um elemento com ID 'myElement' aparecer no DOM
 * window.waitForElement('#myElement')
 *   .then((found) => {
 *     if (found) {
 *       console.log('Elemento encontrado!');
 *     } else {
 *       console.log('Timeout: elemento não encontrado.');
 *     }
 *   });
 */
window.waitForElement = function (selector, timeout = DEFAULT_WAIT_FOR_ELEMENT_TIMEOUT) {
    return new Promise((resolve) => {
        // Verifica se o elemento já existe no DOM
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

        // Configura o MutationObserver para observar mudanças no DOM
        observer.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true
        });

        // Configura um timeout para evitar espera infinita
        timeoutId = setTimeout(() => {
            observer.disconnect();
            resolve(false);
        }, timeout);
    });
};