/**
 * Popup Controller - Clean Code
 */

import type {
  LoadConfigUseCase,
  SaveTicketUrlUseCase,
  SaveOpenRouterConfigUseCase,
  SaveGeneralSettingsUseCase,
  ToggleDebugUseCase,
} from "../../domain/use-cases/config-use-cases";
import { logger } from "@shared/core";

type Callback = () => void;

export class PopupController {
  constructor(
    private readonly loadConfig: LoadConfigUseCase,
    private readonly saveTicketUrl: SaveTicketUrlUseCase,
    private readonly saveOpenRouter: SaveOpenRouterConfigUseCase,
    private readonly saveGeneral: SaveGeneralSettingsUseCase,
    private readonly toggleDebug: ToggleDebugUseCase
  ) {}

  async initialize(elements: any): Promise<void> {
    const config = await this.loadConfig.execute();

    if (elements.urlInput && config.ticketUrl) elements.urlInput.value = config.ticketUrl;
    if (elements.openrouterApiKeyInput && config.openRouter.apiKey) elements.openrouterApiKeyInput.value = config.openRouter.apiKey;
    if (elements.openrouterSiteUrlInput && config.openRouter.siteUrl) elements.openrouterSiteUrlInput.value = config.openRouter.siteUrl;
    if (elements.openrouterAppNameInput && config.openRouter.appName) elements.openrouterAppNameInput.value = config.openRouter.appName;
    if (elements.hideKnowledgeBaseCheckbox) elements.hideKnowledgeBaseCheckbox.checked = config.general.hideKnowledgeBase;
    if (elements.debugEnabledCheckbox) elements.debugEnabledCheckbox.checked = config.debug.enabled;
  }

  async saveTicketUrlHandler(url: string, onSuccess: Callback, onError: Callback): Promise<void> {
    if (!url.trim()) return;
    
    try {
      await this.saveTicketUrl.execute(url);
      onSuccess();
      void logger.info("popup", "Ticket URL saved");
    } catch (e) {
      onError();
      void logger.error("popup", "Failed to save ticket URL", { error: String(e) });
    }
  }

  async saveOpenRouterHandler(apiKey: string, siteUrl: string, appName: string, onSuccess: Callback, onError: Callback): Promise<void> {
    try {
      await this.saveOpenRouter.execute({ apiKey: apiKey || undefined, siteUrl: siteUrl || undefined, appName: appName || undefined });
      onSuccess();
      void logger.info("popup", "OpenRouter config saved");
    } catch (e) {
      onError();
      void logger.error("popup", "Failed to save OpenRouter config", { error: String(e) });
    }
  }

  async saveGeneralHandler(hideKnowledgeBase: boolean, onSuccess: Callback, onError: Callback): Promise<void> {
    try {
      await this.saveGeneral.execute({ hideKnowledgeBase });
      onSuccess();
      void logger.info("popup", "General settings saved");
    } catch (e) {
      onError();
      void logger.error("popup", "Failed to save general settings", { error: String(e) });
    }
  }

  async toggleDebugHandler(enabled: boolean): Promise<void> {
    await this.toggleDebug.execute(enabled);
    void logger.info("popup", "Debug toggled", { enabled });
  }
}
