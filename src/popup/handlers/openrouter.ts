/**
 * Handler para configuração do OpenRouter
 */

import {
  getStoredOpenRouterConfig,
  saveOpenRouterConfig,
  type OpenRouterConfig,
  logger,
  LIMITS,
} from "@shared/core";
import { showStatus } from "../ui/status";

export async function loadOpenRouterConfig(
  apiKeyInput: HTMLInputElement | null,
  siteUrlInput: HTMLInputElement | null,
  appNameInput: HTMLInputElement | null
): Promise<void> {
  try {
    const config = await getStoredOpenRouterConfig();
    if (apiKeyInput && config.apiKey) apiKeyInput.value = config.apiKey;
    if (siteUrlInput && config.siteUrl) siteUrlInput.value = config.siteUrl;
    if (appNameInput && config.appName) appNameInput.value = config.appName;
    void logger.debug("popup", "Loaded OpenRouter config", { hasApiKey: Boolean(config.apiKey) });
  } catch {
    // noop
  }
}

export async function saveOpenRouterConfigHandler(
  apiKeyInput: HTMLInputElement | null,
  siteUrlInput: HTMLInputElement | null,
  appNameInput: HTMLInputElement | null,
  statusElement: HTMLParagraphElement | null
): Promise<void> {
  const apiKey = apiKeyInput?.value.trim() ?? "";
  const siteUrl = siteUrlInput?.value.trim() ?? "";
  const appName = appNameInput?.value.trim() ?? "";

  void logger.debug("popup", "Attempting to save OpenRouter config", {
    hasApiKey: Boolean(apiKey),
    hasSiteUrl: Boolean(siteUrl),
    hasAppName: Boolean(appName),
  });

  try {
    const config: OpenRouterConfig = {
      apiKey: apiKey || undefined,
      siteUrl: siteUrl || undefined,
      appName: appName || undefined,
    };

    await saveOpenRouterConfig(config);
    void logger.info("popup", "OpenRouter config saved via popup");
    showStatus(statusElement, "Configuração salva!", "#047857");
  } catch (e) {
    void logger.error("popup", "Failed to save OpenRouter config", { error: String(e) });
    showStatus(statusElement, "Falha ao salvar", "#dc2626");
  }
}

export async function testOpenRouterConnection(
  apiKeyInput: HTMLInputElement | null,
  siteUrlInput: HTMLInputElement | null,
  appNameInput: HTMLInputElement | null,
  statusElement: HTMLParagraphElement | null
): Promise<void> {
  const apiKey = apiKeyInput?.value.trim() ?? "";

  if (!apiKey) {
    showStatus(statusElement, "API Key não configurada", "#dc2626");
    return;
  }

  void logger.debug("popup", "Testing OpenRouter connection");
  if (statusElement) {
    statusElement.textContent = "Testando conexão...";
    statusElement.style.color = "#0891b2";
    statusElement.hidden = false;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": siteUrlInput?.value.trim() || window.location.origin,
        "X-Title": appNameInput?.value.trim() || "inVa Extension",
      },
    });

    if (response.ok) {
      void logger.info("popup", "OpenRouter connection test successful");
      showStatus(statusElement, "Conexão bem-sucedida!", "#047857");
    } else {
      const errorText = await response.text();
      void logger.error("popup", "OpenRouter connection test failed", {
        status: response.status,
        error: errorText,
      });
      if (statusElement) {
        statusElement.textContent = `Erro: ${response.status} - Verifique a API Key`;
        statusElement.style.color = "#dc2626";
        statusElement.hidden = false;
      }
    }
  } catch (e) {
    void logger.error("popup", "OpenRouter connection test error", { error: String(e) });
    if (statusElement) {
      statusElement.textContent = "Erro na conexão";
      statusElement.style.color = "#dc2626";
      statusElement.hidden = false;
    }
  }
}
