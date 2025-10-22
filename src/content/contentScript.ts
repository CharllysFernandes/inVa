/// <reference types="chrome" />

/**
 * Content script principal da extensão
 * Gerencia injeção do formulário, persistência e sincronização com CKEditor
 * @module contentScript
 */

import { getStoredCreateTicketUrl } from "@shared/utils";
import { logger } from "@shared/logger";
import { createCommentForm } from "@shared/elemento";
import { SELECTORS, WRAPPER_ID, LIMITS } from "@shared/constants";
import { commentStorage } from "@shared/comment-storage";
import { isContentEmpty } from "@shared/text-utils";
import { waitForDOMReady, debounce, waitForElement } from "@shared/dom-utils";
import { editorSync } from "@content/editor-sync";
import type { StorageClearReason } from "@shared/types";

/**
 * Conjunto de elementos de submit já configurados para evitar duplicação
 * @type {WeakSet<Element>}
 */
const wiredSubmitElements = new WeakSet<Element>();

/**
 * Conjunto de formulários já configurados para evitar duplicação
 * @type {WeakSet<HTMLFormElement>}
 */
const wiredSubmitForms = new WeakSet<HTMLFormElement>();

/**
 * Limpa o comentário armazenado e sincroniza com o CKEditor
 * @async
 * @function clearComment
 * @param {string} storageKey - Chave de storage do comentário
 * @param {HTMLTextAreaElement} textarea - Textarea a ser limpo
 * @param {StorageClearReason} reason - Razão da limpeza
 * @returns {Promise<void>}
 */
async function clearComment(storageKey: string, textarea: HTMLTextAreaElement, reason: StorageClearReason): Promise<void> {
  const previousValue = textarea.value;
  textarea.value = "";
  editorSync.sync("");
  textarea.focus();
  void logger.debug("content", "Clearing stored comment", { key: storageKey, reason, previousLength: previousValue.length });
  await commentStorage.remove(storageKey, reason);
}

/**
 * Registra listeners de submit para limpar comentários automaticamente
 * Anexa eventos ao botão de submit e ao formulário
 * @async
 * @function registerSubmitHandlers
 * @param {string} storageKey - Chave de storage do comentário
 * @param {HTMLTextAreaElement} textarea - Textarea a ser monitorado
 * @returns {Promise<void>}
 */
async function registerSubmitHandlers(storageKey: string, textarea: HTMLTextAreaElement): Promise<void> {
  // Tenta anexar ao botão de submit
  const submitButton = await waitForElement<HTMLElement>(SELECTORS.SUBMIT_BUTTON, LIMITS.DOM_OBSERVER_TIMEOUT_MS);
  if (submitButton && !wiredSubmitElements.has(submitButton)) {
    submitButton.addEventListener("click", () => void clearComment(storageKey, textarea, "button-click"));
    wiredSubmitElements.add(submitButton);
    void logger.debug("content", "Attached submit button listener");
  }

  // Anexa ao formulário
  const form = textarea.closest("form");
  if (form && !wiredSubmitForms.has(form)) {
    form.addEventListener("submit", () => void clearComment(storageKey, textarea, "form-submit"), { capture: true });
    wiredSubmitForms.add(form);
    void logger.debug("content", "Attached form submit listener");
  }
}
/**
 * Verifica se a URL atual corresponde à URL salva
 * Compara origin e pathname para determinar se deve injetar o formulário
 * @function matchesUrl
 * @param {string} savedUrl - URL salva pelo usuário
 * @param {string} currentUrl - URL atual da página
 * @returns {boolean} True se as URLs correspondem
 */
function matchesUrl(savedUrl: string, currentUrl: string): boolean {
  try {
    const saved = new URL(savedUrl);
    const current = new URL(currentUrl);
    return current.origin === saved.origin && current.pathname.startsWith(saved.pathname);
  } catch {
    return currentUrl.startsWith(savedUrl);
  }
}

/**
 * Configura o textarea com persistência e sincronização
 * Carrega valor salvo, configura auto-save com debounce e sincroniza com CKEditor
 * @async
 * @function setupTextarea
 * @param {HTMLTextAreaElement} textarea - Textarea a ser configurado
 * @param {string} storageKey - Chave de storage para persistência
 * @returns {Promise<void>}
 */
async function setupTextarea(textarea: HTMLTextAreaElement, storageKey: string): Promise<void> {
  // Carrega valor salvo
  try {
    const saved = await commentStorage.load(storageKey);
    if (saved) {
      textarea.value = saved;
      editorSync.sync(saved);
      void logger.info("content", "Loaded saved comment", { key: storageKey, length: saved.length });

      if (!isContentEmpty(saved)) {
        await commentStorage.remove(storageKey, "after-load");
        textarea.value = "";
        void logger.debug("content", "Cleared storage after applying to CKEditor", { key: storageKey });
      }
    }
  } catch (e) {
    void logger.warn("content", "Failed to load saved comment", { error: String(e) });
  }

  // Salvar com debounce
  const saveComment = async (reason: string) => {
    try {
      await commentStorage.save(storageKey, textarea.value);
      void logger.info("content", "Saved comment", { key: storageKey, length: textarea.value.length, reason });
    } catch (e) {
      void logger.error("content", "Failed to save comment", { error: String(e) });
    }
  };

  const debouncedSave = debounce(() => void saveComment("input"), LIMITS.DEBOUNCE_INPUT_MS);

  textarea.addEventListener("input", () => {
    editorSync.sync(textarea.value);
    debouncedSave();
  });

  textarea.addEventListener("blur", () => {
    editorSync.sync(textarea.value);
    void saveComment("blur");
  });

  // Listeners de storage
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[storageKey]) return;

    const pendingReason = commentStorage.getPendingRemovalReason(storageKey);
    if (pendingReason) {
      commentStorage.clearPendingRemoval(storageKey);
      void logger.debug("content", "Skipping storage change from local removal", { key: storageKey, reason: pendingReason });
      return;
    }

    const newValue = typeof changes[storageKey].newValue === "string" ? changes[storageKey].newValue : "";
    if (textarea.value !== newValue) {
      textarea.value = newValue;
      editorSync.sync(newValue);
      void logger.debug("content", "Storage change detected", { key: storageKey, length: newValue.length });
    }
  });
}

/**
 * Injeta o formulário no container da página
 * Usa criação programática de elementos para maior type-safety
 * @async
 * @function injectElement
 * @param {string} savedUrl - URL salva para gerar chave de storage
 * @returns {Promise<boolean>} True se injetado com sucesso
 */
async function injectElement(savedUrl: string): Promise<boolean> {
  const container = await waitForElement<HTMLDivElement>(SELECTORS.CONTAINER, LIMITS.DOM_OBSERVER_TIMEOUT_MS);
  if (!container) return false;
  if (container.querySelector(`#${WRAPPER_ID}`)) return true;

  const wrapper = document.createElement("div");
  wrapper.id = WRAPPER_ID;

  // Criação programática de elementos (type-safe e segura)
  const elements = createCommentForm();
  wrapper.appendChild(elements.form);
  container.insertBefore(wrapper, container.firstChild);
  void logger.info("content", "Injected comment panel (programmatic) into container");

  const textarea = elements.textarea;
  if (!textarea) {
    void logger.warn("content", "Textarea not found in injected wrapper");
    return true;
  }

  const storageKey = commentStorage.getKey(savedUrl);
  await setupTextarea(textarea, storageKey);
  await registerSubmitHandlers(storageKey, textarea);

  return true;
}

/**
 * Fluxo principal: verifica URL, aguarda DOM, e injeta elemento
 */
(async () => {
  try {
    const savedUrl = await getStoredCreateTicketUrl();
    if (!savedUrl) return;

    const currentUrl = window.location.href;
    if (!matchesUrl(savedUrl, currentUrl)) {
      void logger.debug("content", "URL does not match saved, skipping", { savedUrl, currentUrl });
      return;
    }

    void logger.info("content", "Matched saved URL, will attempt injection", { savedUrl, currentUrl });
    await waitForDOMReady();
    await injectElement(savedUrl);
  } catch (e) {
    void logger.error("content", "Unexpected error in main flow", { error: String(e) });
  }
})();
