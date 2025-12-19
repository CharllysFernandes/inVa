/**
 * Storage Repository - Clean Code
 */

import type { ConfigRepository } from "../../domain/use-cases/config-use-cases";
import type { OpenRouterConfig, GeneralSettings, DebugConfig } from "../../domain/entities/config";
import { STORAGE_KEYS } from "@shared/core";

export class StorageRepository implements ConfigRepository {
  private async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  }

  private async set(key: string, value: unknown): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  async getTicketUrl(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.CREATE_TICKET_URL);
  }

  async saveTicketUrl(url: string): Promise<void> {
    await this.set(STORAGE_KEYS.CREATE_TICKET_URL, url);
  }

  async getOpenRouterConfig(): Promise<OpenRouterConfig> {
    const [apiKey, siteUrl, appName] = await Promise.all([
      this.get<string>(STORAGE_KEYS.OPENROUTER_API_KEY),
      this.get<string>(STORAGE_KEYS.OPENROUTER_SITE_URL),
      this.get<string>(STORAGE_KEYS.OPENROUTER_APP_NAME),
    ]);

    return { apiKey: apiKey ?? undefined, siteUrl: siteUrl ?? undefined, appName: appName ?? undefined };
  }

  async saveOpenRouterConfig(config: OpenRouterConfig): Promise<void> {
    await Promise.all([
      this.set(STORAGE_KEYS.OPENROUTER_API_KEY, config.apiKey),
      this.set(STORAGE_KEYS.OPENROUTER_SITE_URL, config.siteUrl),
      this.set(STORAGE_KEYS.OPENROUTER_APP_NAME, config.appName),
    ]);
  }

  async getGeneralSettings(): Promise<GeneralSettings> {
    const hideKnowledgeBase = await this.get<boolean>(STORAGE_KEYS.HIDE_KNOWLEDGE_BASE);
    return { hideKnowledgeBase: Boolean(hideKnowledgeBase) };
  }

  async saveGeneralSettings(settings: GeneralSettings): Promise<void> {
    await this.set(STORAGE_KEYS.HIDE_KNOWLEDGE_BASE, settings.hideKnowledgeBase);
  }

  async getDebugConfig(): Promise<DebugConfig> {
    const enabled = await this.get<boolean>(STORAGE_KEYS.DEBUG_ENABLED);
    return { enabled: Boolean(enabled) };
  }

  async saveDebugConfig(config: DebugConfig): Promise<void> {
    await this.set(STORAGE_KEYS.DEBUG_ENABLED, config.enabled);
  }
}
