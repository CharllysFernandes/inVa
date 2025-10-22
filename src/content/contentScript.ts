/// <reference types="chrome" />

import { getStoredCreateTicketUrl } from "../shared/utils";
import { logger } from "../shared/logger";
import { createCommentForm } from "../shared/elemento";
import { SELECTORS, WRAPPER_ID, LIMITS } from "../shared/constants";
import { commentStorage } from "../shared/comment-storage";
import { isContentEmpty } from "../shared/text-utils";
import { waitForDOMReady, debounce, waitForElement } from "../shared/dom-utils";
import { editorSync } from "./editor-sync";
import type { StorageClearReason } from "../shared/types";

const wiredSubmitElements = new WeakSet<Element>();
const wiredSubmitForms = new WeakSet<HTMLFormElement>();



/**
 * Limpa o comentário armazenado e o CKEditor
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
 * Registra listeners de submit para limpar comentários
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

  // Event handlers
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
 * Injeta o elemento no container e configura funcionalidades
 * Usa criação programática de elementos para maior type-safety
 */
async function injectElement(savedUrl: string): Promise<boolean> {
  const container = await waitForElement<HTMLDivElement>(SELECTORS.CONTAINER, LIMITS.DOM_OBSERVER_TIMEOUT_MS);
  if (!container) return false;
  if (container.querySelector(`#${WRAPPER_ID}`)) return true;

  const wrapper = document.createElement("div");
  wrapper.id = WRAPPER_ID;

  // Criação programática de elementos (type-safe e segura)
  const elements = createCommentForm({ withClearButton: true });
  wrapper.appendChild(elements.form);
  
  const textarea = elements.textarea;
  const clearButton = elements.clearButton ?? null;
  
  container.insertBefore(wrapper, container.firstChild);
  void logger.info("content", "Injected comment panel (programmatic) into container");

  if (!textarea) {
    void logger.warn("content", "Textarea not found in injected wrapper");
    return true;
  }

  const storageKey = commentStorage.getKey(savedUrl);
  await setupTextarea(textarea, storageKey);
  await registerSubmitHandlers(storageKey, textarea);

  // Botão de limpar manual
  if (clearButton) {
    clearButton.addEventListener("click", () => void clearComment(storageKey, textarea, "manual-clear"));
    void logger.debug("content", "Attached clear button listener");
  }

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
