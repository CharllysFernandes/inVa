/**
 * Service worker de background da extensão
 * Monitora eventos de instalação e atualização
 * @module background
 */

import { logger } from "@shared/logger";
import type { ChatMessage } from "@shared/openrouter-api";
import { getStoredOpenRouterConfig } from "@shared/utils";

/**
 * Event listener para instalação da extensão
 * Registra log quando a extensão é instalada ou atualizada
 */
chrome.runtime.onInstalled.addListener(() => {
  void logger.info("background", "Service worker installed");
});

/**
 * Interface para requisição de chat completion
 */
interface ChatCompletionRequest {
  type: "OPENROUTER_CHAT_COMPLETION";
  messages: ChatMessage[];
  model?: string;
}

/**
 * Interface para resposta de chat completion
 */
interface ChatCompletionResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Handler de mensagens para requisições OpenRouter
 * Faz as requisições do background para evitar problemas de CSP
 */
chrome.runtime.onMessage.addListener((
  request: ChatCompletionRequest,
  _sender,
  sendResponse: (response: ChatCompletionResponse) => void
) => {
  void logger.debug("background", "Message received", { type: request.type });
  
  if (request.type === "OPENROUTER_CHAT_COMPLETION") {
    void logger.info("background", "Processing OpenRouter chat completion", {
      model: request.model,
      messageCount: request.messages?.length || 0
    });

    void (async () => {
      try {
        const config = await getStoredOpenRouterConfig();
        
        if (!config.apiKey) {
          void logger.error("background", "API Key not configured", {});
          sendResponse({ success: false, error: "API Key não configurada" });
          return;
        }

        void logger.debug("background", "Making request to OpenRouter", {
          url: "https://openrouter.ai/api/v1/chat/completions",
          model: request.model || "google/gemini-flash-1.5"
        });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.apiKey}`,
            "HTTP-Referer": config.siteUrl || "https://inva-extension.com",
            "X-Title": config.appName || "inVa Extension",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: request.model || "google/gemini-flash-1.5",
            messages: request.messages,
            temperature: 0.7,
            max_tokens: 500
          })
        });

        void logger.debug("background", "OpenRouter response received", {
          status: response.status,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          void logger.error("background", "OpenRouter API error", {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          sendResponse({ 
            success: false, 
            error: `API error: ${response.status} - ${errorText}` 
          });
          return;
        }

        const data = await response.json();
        void logger.info("background", "OpenRouter request successful", {
          model: data.model,
          choices: data.choices?.length || 0
        });
        
        sendResponse({ success: true, data });
      } catch (e) {
        const error = e as Error;
        void logger.error("background", "OpenRouter request failed", {
          error: error.message,
          stack: error.stack
        });
        sendResponse({ 
          success: false, 
          error: error.message || String(e)
        });
      }
    })();

    return true; // Mantém o canal de resposta aberto para async
  }
  
  return false;
});
