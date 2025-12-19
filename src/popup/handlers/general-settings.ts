/**
 * Handler para configurações gerais
 */

import { STORAGE_KEYS, logger } from "@shared/core";
import { showStatus } from "../ui/status";

export async function loadGeneralSettings(
  hideKnowledgeBaseCheckbox: HTMLInputElement | null
): Promise<void> {
  if (!hideKnowledgeBaseCheckbox) return;

  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.HIDE_KNOWLEDGE_BASE);
    hideKnowledgeBaseCheckbox.checked = Boolean(result[STORAGE_KEYS.HIDE_KNOWLEDGE_BASE]);
    void logger.debug("popup", "Loaded hide knowledge base setting", {
      enabled: Boolean(result[STORAGE_KEYS.HIDE_KNOWLEDGE_BASE]),
    });
  } catch {
    // noop
  }
}

export async function saveGeneralSettings(
  hideKnowledgeBaseCheckbox: HTMLInputElement | null,
  statusElement: HTMLParagraphElement | null
): Promise<void> {
  const hideKnowledgeBase = Boolean(hideKnowledgeBaseCheckbox?.checked);

  void logger.debug("popup", "Attempting to save general settings", { hideKnowledgeBase });

  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.HIDE_KNOWLEDGE_BASE]: hideKnowledgeBase,
    });

    void logger.info("popup", "General settings saved via popup", { hideKnowledgeBase });
    showStatus(statusElement, "Configurações salvas!");
  } catch (e) {
    void logger.error("popup", "Failed to save general settings", { error: String(e) });
    showStatus(statusElement, "Falha ao salvar");
  }
}
