/**
 * Knowledge Base Control Feature
 * Controla a visibilidade da base de conhecimento na página
 * @module knowledge-base-control
 */

import { STORAGE_KEYS, SELECTORS, logger } from "@shared/core";

let hideKnowledgeBaseEnabled = false;
let observerInitialized = false;
let kbObserver: MutationObserver | null = null;

/**
 * Aplica ou remove o estilo hidden na base de conhecimento
 */
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

/**
 * Carrega a configuração atual e aplica
 */
async function loadAndApplySettings(): Promise<void> {
  const result = await chrome.storage.local.get(
    STORAGE_KEYS.HIDE_KNOWLEDGE_BASE
  );
  hideKnowledgeBaseEnabled = Boolean(result[STORAGE_KEYS.HIDE_KNOWLEDGE_BASE]);
  applyKnowledgeBaseVisibility(hideKnowledgeBaseEnabled);
}

/**
 * Observa mudanças no DOM para aplicar estilo quando o elemento aparecer
 */
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

/**
 * Inicializa o controle da base de conhecimento
 */
export function initializeKnowledgeBaseControl(): void {
  if (observerInitialized) {
    return;
  }

  observerInitialized = true;

  // Carrega configuração inicial
  void loadAndApplySettings();

  // Observa mudanças no storage
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

  // Inicia observador de DOM
  startKnowledgeBaseObserver();

  // Cleanup ao descarregar
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
