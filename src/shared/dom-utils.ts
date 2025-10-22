/**
 * Utilitários de manipulação de DOM
 * @module dom-utils
 */

/**
 * Aguarda o elemento aparecer no DOM usando MutationObserver
 * Retorna imediatamente se o elemento já existir
 * @template T - Tipo do elemento HTML esperado
 * @function waitForElement
 * @param {string} selector - Seletor CSS do elemento
 * @param {number} [timeout=10000] - Timeout em milissegundos
 * @returns {Promise<T|null>} Elemento encontrado ou null se timeout
 * @example
 * const button = await waitForElement<HTMLButtonElement>('#submit-btn', 5000);
 * if (button) {
 *   button.click();
 * }
 */
export function waitForElement<T extends Element>(
  selector: string,
  timeout: number = 10000
): Promise<T | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector<T>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Aguarda o DOM estar completamente pronto (DOMContentLoaded)
 * Retorna imediatamente se o DOM já estiver pronto
 * @function waitForDOMReady
 * @returns {Promise<void>}
 * @example
 * await waitForDOMReady();
 * console.log('DOM está pronto!');
 */
export function waitForDOMReady(): Promise<void> {
  if (document.readyState !== "loading") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
  });
}

/**
 * Cria uma função com debounce que atrasa a execução
 * Útil para limitar chamadas em eventos de alta frequência (input, scroll, etc)
 * @template T - Tipo da função a ser debounced
 * @function debounce
 * @param {T} fn - Função a ser executada com delay
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função debounced
 * @example
 * const saveData = debounce(() => {
 *   console.log('Salvando...');
 * }, 300);
 * input.addEventListener('input', saveData);
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;
  return (...args: Parameters<T>) => {
    if (timeout) window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}
