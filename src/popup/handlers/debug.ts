/**
 * Handler para funcionalidades de debug
 */

import { debugAPI, logger } from "@shared/core";

export async function loadDebugState(checkbox: HTMLInputElement | null): Promise<void> {
  if (!checkbox) return;

  try {
    const enabled = await debugAPI.getDebugEnabled();
    checkbox.checked = enabled;
    void logger.debug("popup", "Loaded debug flag", { enabled });
  } catch {
    // noop
  }
}

export async function toggleDebug(checkbox: HTMLInputElement | null): Promise<void> {
  await debugAPI.setDebugEnabled(Boolean(checkbox?.checked));
  void logger.info("popup", "Debug toggled", { enabled: checkbox?.checked });
}

export async function viewLogs(output: HTMLPreElement | null): Promise<void> {
  if (!output) return;

  void logger.debug("popup", "View logs requested");
  const logs = await debugAPI.getLogs();
  output.hidden = false;
  output.textContent = logs
    .map(
      (l) =>
        `${new Date(l.ts).toISOString()} [${l.level.toUpperCase()}] ${l.component}: ${l.message}${
          l.data ? "\n  " + JSON.stringify(l.data, null, 2) : ""
        }`
    )
    .join("\n");
}

export async function clearLogs(output: HTMLPreElement | null): Promise<void> {
  void logger.debug("popup", "Clearing persisted logs");
  await debugAPI.clearLogs();
  if (output) {
    output.textContent = "";
    output.hidden = true;
  }
}
