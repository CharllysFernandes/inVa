/// <reference types="chrome" />

import { getStoredCreateTicketUrl, saveCreateTicketUrl } from "@shared/utils";
import { debugAPI, logger } from "@shared/logger";
import { LIMITS } from "@shared/constants";

const urlInput = document.getElementById("createTicketUrl") as HTMLInputElement | null;
const saveButton = document.getElementById("saveCreateTicketUrl");
const saveStatus = document.getElementById("saveStatus") as HTMLParagraphElement | null;
const debugEnabledCheckbox = document.getElementById("debugEnabled") as HTMLInputElement | null;
const viewLogsBtn = document.getElementById("viewLogs");
const clearLogsBtn = document.getElementById("clearLogs");
const logsOutput = document.getElementById("logsOutput") as HTMLPreElement | null;
const appVersionLabel = document.getElementById("appVersion");

// Apresenta versão da extensão no cabeçalho
try {
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version_name ?? manifest.version;
  if (appVersionLabel) {
    appVersionLabel.textContent = `v${version}`;
  }
} catch {
  if (appVersionLabel) {
    appVersionLabel.textContent = "v";
  }
}

// Carrega URL salva ao abrir popup
(async () => {
  try {
    const saved = await getStoredCreateTicketUrl();
    if (urlInput && saved) {
      urlInput.value = saved;
      void logger.debug("popup", "Loaded stored ticket URL", { url: saved });
    }
    // estado inicial do debug
    const dbg = await debugAPI.getDebugEnabled();
    if (debugEnabledCheckbox) debugEnabledCheckbox.checked = dbg;
    void logger.debug("popup", "Loaded debug flag", { enabled: dbg });
  } catch (e) {
    // noop
  }
})();

// Salvar URL
if (saveButton) {
  saveButton.addEventListener("click", async () => {
    const value = urlInput?.value.trim() ?? "";
    void logger.debug("popup", "Attempting to save ticket URL", { valueLength: value.length });
    try {
      // validação básica
      if (value) {
        // Se não possuir protocolo, assume https
        const finalValue = /^(https?:)?\/\//i.test(value) ? value : `https://${value}`;
        await saveCreateTicketUrl(finalValue);
        void logger.info("popup", "Ticket URL saved via popup", { url: finalValue });
        if (saveStatus) {
          saveStatus.textContent = "Salvo!";
          saveStatus.hidden = false;
          setTimeout(() => {
            if (saveStatus) {
              saveStatus.hidden = true;
            }
          }, LIMITS.STATUS_MESSAGE_DURATION_MS);
        }
      } else {
        void logger.warn("popup", "Ticket URL input empty, ignoring save");
      }
    } catch (e) {
      void logger.error("popup", "Failed to save ticket URL", { error: String(e) });
      if (saveStatus) {
        saveStatus.textContent = "Falha ao salvar";
        saveStatus.hidden = false;
      }
    }
  });
}

// Toggle debug
debugEnabledCheckbox?.addEventListener("change", async () => {
  await debugAPI.setDebugEnabled(Boolean(debugEnabledCheckbox?.checked));
  void logger.info("popup", "Debug toggled", { enabled: debugEnabledCheckbox?.checked });
});

// Ver logs
viewLogsBtn?.addEventListener("click", async () => {
  void logger.debug("popup", "View logs requested");
  const logs = await debugAPI.getLogs();
  if (logsOutput) {
    logsOutput.hidden = false;
    logsOutput.textContent = logs
      .map((l) => `${new Date(l.ts).toISOString()} [${l.level.toUpperCase()}] ${l.component}: ${l.message}${l.data ? "\n  " + JSON.stringify(l.data, null, 2) : ""}`)
      .join("\n");
  }
});

// Limpar logs
clearLogsBtn?.addEventListener("click", async () => {
  void logger.debug("popup", "Clearing persisted logs");
  await debugAPI.clearLogs();
  if (logsOutput) {
    logsOutput.textContent = "";
    logsOutput.hidden = true;
  }
});
