/**
 * Utilitários para exibir mensagens de status
 */

import { LIMITS } from "@shared/core";

export function showStatus(
  element: HTMLParagraphElement | null,
  message: string,
  color?: string,
  duration = LIMITS.STATUS_MESSAGE_DURATION_MS
): void {
  if (!element) return;

  element.textContent = message;
  if (color) element.style.color = color;
  element.hidden = false;

  setTimeout(() => {
    if (element) element.hidden = true;
  }, duration);
}
