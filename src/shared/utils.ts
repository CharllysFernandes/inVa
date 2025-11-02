/// <reference types="chrome" />

/**
 * Utilitários para gerenciamento de storage da extensão com rate limiting
 * @module utils
 */

import { logger } from "./logger";
import { STORAGE_KEYS } from "./constants";
import { RateLimiter, RATE_LIMIT_CONFIGS } from "./rate-limiter";

/**
 * Rate limiters para operações de URL
 * @private
 */
const urlStorageRateLimiters = {
  read: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_READ),
  write: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_WRITE)
};

/**
 * Rate limiters para operações de OpenRouter
 * @private
 */
const openRouterStorageRateLimiters = {
  read: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_READ),
  write: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_WRITE)
};

/**
 * Interface para configuração do OpenRouter
 * @interface OpenRouterConfig
 */
export interface OpenRouterConfig {
  apiKey?: string;
  siteUrl?: string;
  appName?: string;
}

/**
 * Reseta os rate limiters de storage de URL (útil para testes)
 * @private
 * @returns {void}
 */
export function __resetUrlStorageRateLimiters(): void {
  urlStorageRateLimiters.read.reset();
  urlStorageRateLimiters.write.reset();
  openRouterStorageRateLimiters.read.reset();
  openRouterStorageRateLimiters.write.reset();
}

/**
 * Recupera a URL de criação de ticket salva no Chrome Storage (com rate limiting)
 * @async
 * @function getStoredCreateTicketUrl
 * @returns {Promise<string|undefined>} URL salva ou undefined se não existir
 * @throws {Error} Erro de leitura do Chrome Storage ou rate limit excedido
 * @example
 * const url = await getStoredCreateTicketUrl();
 * if (url) {
 *   console.log('URL salva:', url);
 * }
 */
export const getStoredCreateTicketUrl = async (): Promise<string | undefined> => {
  void logger.debug("shared", "Reading stored ticket URL");
  
  return urlStorageRateLimiters.read.execute(async () => {
    return new Promise<string | undefined>((resolve, reject) => {
      chrome.storage.sync.get({ [STORAGE_KEYS.CREATE_TICKET_URL]: "" }, (items) => {
        const error = chrome.runtime.lastError;
        if (error) {
          void logger.error("shared", "Failed to read ticket URL", { error: String(error) });
          reject(error);
          return;
        }
        const value = items[STORAGE_KEYS.CREATE_TICKET_URL];
        void logger.debug("shared", "Resolved ticket URL", { value });
        resolve(typeof value === "string" && value.trim() ? value.trim() : undefined);
      });
    });
  });
};

/**
 * Salva a URL de criação de ticket no Chrome Storage (com rate limiting)
 * @async
 * @function saveCreateTicketUrl
 * @param {string} url - URL a ser salva
 * @returns {Promise<void>}
 * @throws {Error} Erro de escrita no Chrome Storage ou rate limit excedido
 * @example
 * await saveCreateTicketUrl('https://example.com/create-ticket');
 */
export const saveCreateTicketUrl = async (url: string): Promise<void> => {
  void logger.debug("shared", "Persisting ticket URL", { url });
  
  return urlStorageRateLimiters.write.execute(async () => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: url }, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          void logger.error("shared", "Failed to persist ticket URL", { error: String(error) });
          reject(error);
          return;
        }
        void logger.info("shared", "Ticket URL saved", { url });
        resolve();
      });
    });
  });
};

/**
 * Recupera a configuração do OpenRouter salva no Chrome Storage (com rate limiting)
 * @async
 * @function getStoredOpenRouterConfig
 * @returns {Promise<OpenRouterConfig>} Configuração do OpenRouter
 * @throws {Error} Erro de leitura do Chrome Storage ou rate limit excedido
 * @example
 * const config = await getStoredOpenRouterConfig();
 * if (config.apiKey) {
 *   console.log('API Key configurada');
 * }
 */
export const getStoredOpenRouterConfig = async (): Promise<OpenRouterConfig> => {
  void logger.debug("shared", "Reading stored OpenRouter config");
  
  return openRouterStorageRateLimiters.read.execute(async () => {
    return new Promise<OpenRouterConfig>((resolve, reject) => {
      chrome.storage.sync.get(
        {
          [STORAGE_KEYS.OPENROUTER_API_KEY]: "",
          [STORAGE_KEYS.OPENROUTER_SITE_URL]: "",
          [STORAGE_KEYS.OPENROUTER_APP_NAME]: ""
        },
        (items) => {
          const error = chrome.runtime.lastError;
          if (error) {
            void logger.error("shared", "Failed to read OpenRouter config", { error: String(error) });
            reject(error);
            return;
          }
          
          const config: OpenRouterConfig = {
            apiKey: items[STORAGE_KEYS.OPENROUTER_API_KEY] || undefined,
            siteUrl: items[STORAGE_KEYS.OPENROUTER_SITE_URL] || undefined,
            appName: items[STORAGE_KEYS.OPENROUTER_APP_NAME] || undefined
          };
          
          void logger.debug("shared", "Resolved OpenRouter config", { 
            hasApiKey: Boolean(config.apiKey),
            hasSiteUrl: Boolean(config.siteUrl),
            hasAppName: Boolean(config.appName)
          });
          resolve(config);
        }
      );
    });
  });
};

/**
 * Salva a configuração do OpenRouter no Chrome Storage (com rate limiting)
 * @async
 * @function saveOpenRouterConfig
 * @param {OpenRouterConfig} config - Configuração a ser salva
 * @returns {Promise<void>}
 * @throws {Error} Erro de escrita no Chrome Storage ou rate limit excedido
 * @example
 * await saveOpenRouterConfig({
 *   apiKey: 'sk-or-v1-...',
 *   siteUrl: 'https://mysite.com',
 *   appName: 'My App'
 * });
 */
export const saveOpenRouterConfig = async (config: OpenRouterConfig): Promise<void> => {
  void logger.debug("shared", "Persisting OpenRouter config", { 
    hasApiKey: Boolean(config.apiKey),
    hasSiteUrl: Boolean(config.siteUrl),
    hasAppName: Boolean(config.appName)
  });
  
  return openRouterStorageRateLimiters.write.execute(async () => {
    return new Promise<void>((resolve, reject) => {
      const dataToSave = {
        [STORAGE_KEYS.OPENROUTER_API_KEY]: config.apiKey || "",
        [STORAGE_KEYS.OPENROUTER_SITE_URL]: config.siteUrl || "",
        [STORAGE_KEYS.OPENROUTER_APP_NAME]: config.appName || ""
      };
      
      chrome.storage.sync.set(dataToSave, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          void logger.error("shared", "Failed to persist OpenRouter config", { error: String(error) });
          reject(error);
          return;
        }
        void logger.info("shared", "OpenRouter config saved");
        resolve();
      });
    });
  });
};
