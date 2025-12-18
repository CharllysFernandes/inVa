/**
 * Gerenciador do formulário de comentários
 */

import {
  SELECTORS,
  WRAPPER_ID,
  LIMITS,
  isContentEmpty,
  waitForElement,
  debounce,
  logger,
} from "@shared/core";
import { createCommentForm } from "@shared/ui";
import { commentStorage, AISuggestionsManager } from "@shared/services";
import { editorSync } from "@content/features/editor-sync";
import type { StorageClearReason } from "@shared/core";

const wiredSubmitElements = new WeakSet<Element>();
const wiredSubmitForms = new WeakSet<HTMLFormElement>();

async function clearComment(
  storageKey: string,
  textarea: HTMLTextAreaElement,
  reason: StorageClearReason
): Promise<void> {
  const previousValue = textarea.value;
  textarea.value = "";
  editorSync.sync("");
  textarea.focus();
  void logger.debug("comment-form", "Clearing stored comment", {
    key: storageKey,
    reason,
    previousLength: previousValue.length,
  });
  await commentStorage.remove(storageKey, reason);
}

async function registerSubmitHandlers(
  storageKey: string,
  textarea: HTMLTextAreaElement
): Promise<void> {
  const submitButton = await waitForElement<HTMLElement>(
    SELECTORS.SUBMIT_BUTTON,
    LIMITS.DOM_OBSERVER_TIMEOUT_MS
  );
  if (submitButton && !wiredSubmitElements.has(submitButton)) {
    submitButton.addEventListener(
      "click",
      () => void clearComment(storageKey, textarea, "button-click")
    );
    wiredSubmitElements.add(submitButton);
    void logger.debug("comment-form", "Attached submit button listener");
  }

  const form = textarea.closest("form");
  if (form && !wiredSubmitForms.has(form)) {
    form.addEventListener(
      "submit",
      () => void clearComment(storageKey, textarea, "form-submit"),
      { capture: true }
    );
    wiredSubmitForms.add(form);
    void logger.debug("comment-form", "Attached form submit listener");
  }
}

async function setupTextarea(
  textarea: HTMLTextAreaElement,
  storageKey: string,
  parentContainer: HTMLElement
): Promise<void> {
  try {
    const saved = await commentStorage.load(storageKey);
    if (saved) {
      textarea.value = saved;
      editorSync.sync(saved);
      void logger.info("comment-form", "Loaded saved comment", {
        key: storageKey,
        length: saved.length,
      });

      if (!isContentEmpty(saved)) {
        await commentStorage.remove(storageKey, "after-load");
        textarea.value = "";
        void logger.debug(
          "comment-form",
          "Cleared storage after applying to CKEditor",
          { key: storageKey }
        );
      }
    }
  } catch (e) {
    void logger.warn("comment-form", "Failed to load saved comment", {
      error: String(e),
    });
  }

  const saveComment = async (reason: string) => {
    try {
      await commentStorage.save(storageKey, textarea.value);
      void logger.info("comment-form", "Saved comment", {
        key: storageKey,
        length: textarea.value.length,
        reason,
      });
    } catch (e) {
      void logger.error("comment-form", "Failed to save comment", {
        error: String(e),
      });
    }
  };

  const debouncedSave = debounce(
    () => void saveComment("input"),
    LIMITS.DEBOUNCE_INPUT_MS
  );

  textarea.addEventListener("input", () => {
    editorSync.sync(textarea.value);
    debouncedSave();
  });

  textarea.addEventListener("blur", () => {
    editorSync.sync(textarea.value);
    void saveComment("blur");
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[storageKey]) return;

    const pendingReason = commentStorage.getPendingRemovalReason(storageKey);
    if (pendingReason) {
      commentStorage.clearPendingRemoval(storageKey);
      void logger.debug(
        "comment-form",
        "Skipping storage change from local removal",
        { key: storageKey, reason: pendingReason }
      );
      return;
    }

    const newValue =
      typeof changes[storageKey].newValue === "string"
        ? changes[storageKey].newValue
        : "";
    if (textarea.value !== newValue) {
      textarea.value = newValue;
      editorSync.sync(newValue);
      void logger.debug("comment-form", "Storage change detected", {
        key: storageKey,
        length: newValue.length,
      });
    }
  });

  try {
    const aiSuggestions = new AISuggestionsManager();
    await aiSuggestions.initialize(textarea, parentContainer);
    void logger.info("comment-form", "AI suggestions manager initialized");
  } catch (e) {
    void logger.warn("comment-form", "Failed to initialize AI suggestions", {
      error: String(e),
    });
  }
}

async function injectForm(savedUrl: string): Promise<boolean> {
  const container = await waitForElement<HTMLDivElement>(
    SELECTORS.CONTAINER,
    LIMITS.DOM_OBSERVER_TIMEOUT_MS
  );
  if (!container) return false;
  if (container.querySelector(`#${WRAPPER_ID}`)) return true;

  const wrapper = document.createElement("div");
  wrapper.id = WRAPPER_ID;

  const elements = createCommentForm();
  wrapper.appendChild(elements.form);
  container.insertBefore(wrapper, container.firstChild);
  void logger.info(
    "comment-form",
    "Injected comment panel into container"
  );

  const textarea = elements.textarea;
  if (!textarea) {
    void logger.warn("comment-form", "Textarea not found in injected wrapper");
    return true;
  }

  const storageKey = commentStorage.getKey(savedUrl);
  await setupTextarea(textarea, storageKey, wrapper);
  await registerSubmitHandlers(storageKey, textarea);

  return true;
}

export async function initializeCommentForm(savedUrl: string): Promise<void> {
  await injectForm(savedUrl);
}
