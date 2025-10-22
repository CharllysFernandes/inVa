/**
 * Utilitários de manipulação de DOM
 */

/**
 * Aguarda o elemento aparecer no DOM usando MutationObserver
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
 * Aguarda o DOM estar pronto
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
 * Cria um debouncer genérico
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
