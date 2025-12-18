/**
 * Controlador de visibilidade da base de conhecimento
 */

import { STORAGE_KEYS, SELECTORS, logger } from "@shared/core";

let hideKnowledgeBaseEnabled = false;
let observerInitialized = false;
let kbObserver: MutationObserver | null = null;

function applyKnowledgeBaseVisibility(hide: boolean): void {
  const kbElement = document.querySelector<HTMLElement>(
    SELECTORS.KNOWLEDGE_BASE_ARTICLES
  );

  if (!kbElement) {
    return;
  }

  if (hide) {
    kbElement.style.contentVisibility = "hidden";
    void logger.debug("knowledge-base", "Hidden knowledge base articles");
  } else {
    kbElement.style.contentVisibility = "";
    void logger.debug(
      "knowledge-base",
      "Restored knowledge base articles visibility"
    );
  }
}

async function loadAndApplySettings(): Promise<void> {
  const result = await chrome.storage.local.get(
    STORAGE_KEYS.HIDE_KNOWLEDGE_BASE
  );
  hideKnowledgeBaseEnabled = Boolean(result[STORAGE_KEYS.HIDE_KNOWLEDGE_BASE]);
  applyKnowledgeBaseVisibility(hideKnowledgeBaseEnabled);
}

function startKnowledgeBaseObserver(): void {
  if (!document.body) {
    return;
  }

  if (kbObserver) {
    return;
  }

  kbObserver = new MutationObserver(() => {
    const kbElement = document.querySelector(SELECTORS.KNOWLEDGE_BASE_ARTICLES);
    if (kbElement) {
      applyKnowledgeBaseVisibility(hideKnowledgeBaseEnabled);
    }
  });

  kbObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

export function initializeKnowledgeBaseControl(): void {
  if (observerInitialized) {
    return;
  }

  observerInitialized = true;

  void loadAndApplySettings();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEYS.HIDE_KNOWLEDGE_BASE]) {
      return;
    }

    hideKnowledgeBaseEnabled = Boolean(
      changes[STORAGE_KEYS.HIDE_KNOWLEDGE_BASE].newValue
    );
    applyKnowledgeBaseVisibility(hideKnowledgeBaseEnabled);
    void logger.debug("knowledge-base", "Setting changed via storage", {
      enabled: hideKnowledgeBaseEnabled,
    });
  });

  startKnowledgeBaseObserver();

  window.addEventListener(
    "beforeunload",
    () => {
      if (kbObserver) {
        kbObserver.disconnect();
        kbObserver = null;
      }
    },
    { once: true }
  );

  void logger.info("knowledge-base", "Knowledge base control initialized");
}
