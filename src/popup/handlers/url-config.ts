/**
 * Handler para configuração de URL
 */

import { getStoredCreateTicketUrl, saveCreateTicketUrl, logger } from "@shared/core";
import { showStatus } from "../ui/status";

export async function loadUrlConfig(input: HTMLInputElement | null): Promise<void> {
  if (!input) return;

  try {
    const saved = await getStoredCreateTicketUrl();
    if (saved) {
      input.value = saved;
      void logger.debug("popup", "Loaded stored ticket URL", { url: saved });
    }
  } catch {
    // noop
  }
}

export async function saveUrlConfig(
  input: HTMLInputElement | null,
  statusElement: HTMLParagraphElement | null
): Promise<void> {
  const value = input?.value.trim() ?? "";
  void logger.debug("popup", "Attempting to save ticket URL", { valueLength: value.length });

  try {
    if (value) {
      const finalValue = /^(https?:)?\/\//i.test(value) ? value : `https://${value}`;
      await saveCreateTicketUrl(finalValue);
      void logger.info("popup", "Ticket URL saved via popup", { url: finalValue });
      showStatus(statusElement, "Salvo!");
    } else {
      void logger.warn("popup", "Ticket URL input empty, ignoring save");
    }
  } catch (e) {
    void logger.error("popup", "Failed to save ticket URL", { error: String(e) });
    showStatus(statusElement, "Falha ao salvar");
  }
}
