/// <reference types="chrome" />

/**
 * Script do popup da extensão
 * Gerencia configuração de URL, debug mode e visualização de logs
 * @module popup
 */

import { getStoredCreateTicketUrl, saveCreateTicketUrl, getStoredOpenRouterConfig, saveOpenRouterConfig, type OpenRouterConfig } from "@shared/utils";
import { debugAPI, logger } from "@shared/logger";
import { LIMITS } from "@shared/constants";

/**
 * Referências aos elementos do DOM do popup
 */
const urlInput = document.getElementById("createTicketUrl") as HTMLInputElement | null;
const saveButton = document.getElementById("saveCreateTicketUrl");
const saveStatus = document.getElementById("saveStatus") as HTMLParagraphElement | null;

// Elementos do OpenRouter
const openrouterApiKeyInput = document.getElementById("openrouterApiKey") as HTMLInputElement | null;
const openrouterSiteUrlInput = document.getElementById("openrouterSiteUrl") as HTMLInputElement | null;
const openrouterAppNameInput = document.getElementById("openrouterAppName") as HTMLInputElement | null;
const saveOpenRouterButton = document.getElementById("saveOpenRouterConfig");
const testOpenRouterButton = document.getElementById("testOpenRouterConnection");
const openrouterStatus = document.getElementById("openrouterStatus") as HTMLParagraphElement | null;

const debugEnabledCheckbox = document.getElementById("debugEnabled") as HTMLInputElement | null;
const viewLogsBtn = document.getElementById("viewLogs");
const clearLogsBtn = document.getElementById("clearLogs");
const logsOutput = document.getElementById("logsOutput") as HTMLPreElement | null;
const appVersionLabel = document.getElementById("appVersion");

/**
 * Apresenta versão da extensão no cabeçalho do popup
 */
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

/**
 * Carrega URL salva e estado do debug ao abrir popup
 * @async
 */
(async () => {
  try {
    const saved = await getStoredCreateTicketUrl();
    if (urlInput && saved) {
      urlInput.value = saved;
      void logger.debug("popup", "Loaded stored ticket URL", { url: saved });
    }
    
    // Carrega configuração do OpenRouter
    const openRouterConfig = await getStoredOpenRouterConfig();
    if (openrouterApiKeyInput && openRouterConfig.apiKey) {
      openrouterApiKeyInput.value = openRouterConfig.apiKey;
    }
    if (openrouterSiteUrlInput && openRouterConfig.siteUrl) {
      openrouterSiteUrlInput.value = openRouterConfig.siteUrl;
    }
    if (openrouterAppNameInput && openRouterConfig.appName) {
      openrouterAppNameInput.value = openRouterConfig.appName;
    }
    void logger.debug("popup", "Loaded OpenRouter config", { hasApiKey: Boolean(openRouterConfig.apiKey) });
    
    // estado inicial do debug
    const dbg = await debugAPI.getDebugEnabled();
    if (debugEnabledCheckbox) debugEnabledCheckbox.checked = dbg;
    void logger.debug("popup", "Loaded debug flag", { enabled: dbg });
  } catch (e) {
    // noop
  }
})();

/**
 * Event listener para salvar URL de criação de ticket
 * Adiciona protocolo https:// se não fornecido
 */
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

/**
 * Event listener para alternar modo debug
 * Habilita/desabilita logs detalhados
 */
debugEnabledCheckbox?.addEventListener("change", async () => {
  await debugAPI.setDebugEnabled(Boolean(debugEnabledCheckbox?.checked));
  void logger.info("popup", "Debug toggled", { enabled: debugEnabledCheckbox?.checked });
});

/**
 * Event listener para visualizar logs armazenados
 * Exibe logs formatados no popup
 */
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

/**
 * Event listener para limpar todos os logs armazenados
 * Remove logs do storage e limpa visualização
 */
clearLogsBtn?.addEventListener("click", async () => {
  void logger.debug("popup", "Clearing persisted logs");
  await debugAPI.clearLogs();
  if (logsOutput) {
    logsOutput.textContent = "";
    logsOutput.hidden = true;
  }
});

/**
 * Event listener para salvar configuração do OpenRouter
 * Salva API Key, Site URL e App Name
 */
saveOpenRouterButton?.addEventListener("click", async () => {
  const apiKey = openrouterApiKeyInput?.value.trim() ?? "";
  const siteUrl = openrouterSiteUrlInput?.value.trim() ?? "";
  const appName = openrouterAppNameInput?.value.trim() ?? "";
  
  void logger.debug("popup", "Attempting to save OpenRouter config", { 
    hasApiKey: Boolean(apiKey),
    hasSiteUrl: Boolean(siteUrl),
    hasAppName: Boolean(appName)
  });
  
  try {
    const config: OpenRouterConfig = {
      apiKey: apiKey || undefined,
      siteUrl: siteUrl || undefined,
      appName: appName || undefined
    };
    
    await saveOpenRouterConfig(config);
    void logger.info("popup", "OpenRouter config saved via popup");
    
    if (openrouterStatus) {
      openrouterStatus.textContent = "Configuração salva!";
      openrouterStatus.style.color = "#047857";
      openrouterStatus.hidden = false;
      setTimeout(() => {
        if (openrouterStatus) {
          openrouterStatus.hidden = true;
        }
      }, LIMITS.STATUS_MESSAGE_DURATION_MS);
    }
  } catch (e) {
    void logger.error("popup", "Failed to save OpenRouter config", { error: String(e) });
    if (openrouterStatus) {
      openrouterStatus.textContent = "Falha ao salvar";
      openrouterStatus.style.color = "#dc2626";
      openrouterStatus.hidden = false;
    }
  }
});

/**
 * Event listener para testar conexão com OpenRouter
 * Faz uma requisição de teste para validar a API Key
 */
testOpenRouterButton?.addEventListener("click", async () => {
  const apiKey = openrouterApiKeyInput?.value.trim() ?? "";
  
  if (!apiKey) {
    if (openrouterStatus) {
      openrouterStatus.textContent = "API Key não configurada";
      openrouterStatus.style.color = "#dc2626";
      openrouterStatus.hidden = false;
      setTimeout(() => {
        if (openrouterStatus) {
          openrouterStatus.hidden = true;
        }
      }, LIMITS.STATUS_MESSAGE_DURATION_MS);
    }
    return;
  }
  
  void logger.debug("popup", "Testing OpenRouter connection");
  
  if (openrouterStatus) {
    openrouterStatus.textContent = "Testando conexão...";
    openrouterStatus.style.color = "#0891b2";
    openrouterStatus.hidden = false;
  }
  
  try {
    // Faz uma requisição simples para validar a API Key
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": openrouterSiteUrlInput?.value.trim() || window.location.origin,
        "X-Title": openrouterAppNameInput?.value.trim() || "inVa Extension"
      }
    });
    
    if (response.ok) {
      void logger.info("popup", "OpenRouter connection test successful");
      if (openrouterStatus) {
        openrouterStatus.textContent = "Conexão bem-sucedida!";
        openrouterStatus.style.color = "#047857";
        openrouterStatus.hidden = false;
        setTimeout(() => {
          if (openrouterStatus) {
            openrouterStatus.hidden = true;
          }
        }, LIMITS.STATUS_MESSAGE_DURATION_MS * 2);
      }
    } else {
      const errorText = await response.text();
      void logger.error("popup", "OpenRouter connection test failed", { 
        status: response.status,
        error: errorText
      });
      if (openrouterStatus) {
        openrouterStatus.textContent = `Erro: ${response.status} - Verifique a API Key`;
        openrouterStatus.style.color = "#dc2626";
        openrouterStatus.hidden = false;
      }
    }
  } catch (e) {
    void logger.error("popup", "OpenRouter connection test error", { error: String(e) });
    if (openrouterStatus) {
      openrouterStatus.textContent = "Erro na conexão";
      openrouterStatus.style.color = "#dc2626";
      openrouterStatus.hidden = false;
    }
  }
});
