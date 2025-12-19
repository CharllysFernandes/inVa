/**
 * Use Cases - Configuration
 */

import type { TicketUrlConfig, OpenRouterConfig, GeneralSettings, DebugConfig } from "../entities/config";

export interface ConfigRepository {
  getTicketUrl(): Promise<string | null>;
  saveTicketUrl(url: string): Promise<void>;
  getOpenRouterConfig(): Promise<OpenRouterConfig>;
  saveOpenRouterConfig(config: OpenRouterConfig): Promise<void>;
  getGeneralSettings(): Promise<GeneralSettings>;
  saveGeneralSettings(settings: GeneralSettings): Promise<void>;
  getDebugConfig(): Promise<DebugConfig>;
  saveDebugConfig(config: DebugConfig): Promise<void>;
}

export class LoadConfigUseCase {
  constructor(private repo: ConfigRepository) {}

  async execute(): Promise<{
    ticketUrl: string | null;
    openRouter: OpenRouterConfig;
    general: GeneralSettings;
    debug: DebugConfig;
  }> {
    const [ticketUrl, openRouter, general, debug] = await Promise.all([
      this.repo.getTicketUrl(),
      this.repo.getOpenRouterConfig(),
      this.repo.getGeneralSettings(),
      this.repo.getDebugConfig(),
    ]);

    return { ticketUrl, openRouter, general, debug };
  }
}

export class SaveTicketUrlUseCase {
  constructor(private repo: ConfigRepository) {}

  async execute(url: string): Promise<void> {
    const finalUrl = /^(https?:)?\/\//i.test(url) ? url : `https://${url}`;
    await this.repo.saveTicketUrl(finalUrl);
  }
}

export class SaveOpenRouterConfigUseCase {
  constructor(private repo: ConfigRepository) {}

  async execute(config: OpenRouterConfig): Promise<void> {
    await this.repo.saveOpenRouterConfig(config);
  }
}

export class SaveGeneralSettingsUseCase {
  constructor(private repo: ConfigRepository) {}

  async execute(settings: GeneralSettings): Promise<void> {
    await this.repo.saveGeneralSettings(settings);
  }
}

export class ToggleDebugUseCase {
  constructor(private repo: ConfigRepository) {}

  async execute(enabled: boolean): Promise<void> {
    await this.repo.saveDebugConfig({ enabled });
  }
}
