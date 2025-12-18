/// <reference types="chrome" />

/**
 * Content script principal da extensão
 * Orquestra a inicialização de todas as features
 * @module contentScript
 */

import { getStoredCreateTicketUrl, logger, waitForDOMReady } from "@shared/core";
import { initializeCommentForm } from "@content/features/comment-form";
import { initializeCustomerUsernameMonitor } from "@content/features/customer-username-validation";
import { initializeKnowledgeBaseControl } from "@content/features/knowledge-base-control";
import { initializeActivityMessageMonitor } from "@content/features/activity-message-monitor";

function matchesUrl(savedUrl: string, currentUrl: string): boolean {
  try {
    const saved = new URL(savedUrl);
    const current = new URL(currentUrl);
    return (
      current.origin === saved.origin &&
      current.pathname.startsWith(saved.pathname)
    );
  } catch {
    return currentUrl.startsWith(savedUrl);
  }
}

/**
 * Fluxo principal: orquestra inicialização de features
 */
(async () => {
  try {
    await waitForDOMReady();
    initializeActivityMessageMonitor();

    const savedUrl = await getStoredCreateTicketUrl();
    if (!savedUrl) {
      void logger.debug("content", "No saved ticket URL found; skipping form injection");
      return;
    }

    const currentUrl = window.location.href;
    if (!matchesUrl(savedUrl, currentUrl)) {
      void logger.debug("content", "URL does not match saved, skipping", {
        savedUrl,
        currentUrl,
      });
      return;
    }

    void logger.info("content", "Matched saved URL, initializing features", {
      savedUrl,
      currentUrl,
    });
    
    initializeCustomerUsernameMonitor();
    initializeKnowledgeBaseControl();
    await initializeCommentForm(savedUrl);
  } catch (e) {
    void logger.error("content", "Unexpected error in main flow", {
      error: String(e),
    });
  }
})();
