/// <reference types="chrome" />

/**
 * Popup Entry Point - Clean Architecture
 */

import { elements, displayVersion } from "./ui";
import { StorageRepository } from "../infrastructure/repositories/storage-repository";
import { LoadConfigUseCase, SaveTicketUrlUseCase, SaveOpenRouterConfigUseCase, SaveGeneralSettingsUseCase, ToggleDebugUseCase } from "../domain/use-cases/config-use-cases";
import { PopupController } from "../presentation/controllers/popup-controller";
import { showStatus } from "./ui/status";
import { viewLogs, clearLogs } from "./handlers/debug";

displayVersion(elements.appVersionLabel);

const repo = new StorageRepository();
const controller = new PopupController(
  new LoadConfigUseCase(repo),
  new SaveTicketUrlUseCase(repo),
  new SaveOpenRouterConfigUseCase(repo),
  new SaveGeneralSettingsUseCase(repo),
  new ToggleDebugUseCase(repo)
);

controller.initialize(elements);

const listeners = [
  [elements.saveButton, "click", () => controller.saveTicketUrlHandler(
    elements.urlInput?.value.trim() ?? "",
    () => showStatus(elements.saveStatus, "Salvo!"),
    () => showStatus(elements.saveStatus, "Falha ao salvar")
  )],
  [elements.saveOpenRouterButton, "click", () => controller.saveOpenRouterHandler(
    elements.openrouterApiKeyInput?.value.trim() ?? "",
    elements.openrouterSiteUrlInput?.value.trim() ?? "",
    elements.openrouterAppNameInput?.value.trim() ?? "",
    () => showStatus(elements.openrouterStatus, "Configuração salva!", "#047857"),
    () => showStatus(elements.openrouterStatus, "Falha ao salvar", "#dc2626")
  )],
  [elements.saveGeneralSettingsButton, "click", () => controller.saveGeneralHandler(
    Boolean(elements.hideKnowledgeBaseCheckbox?.checked),
    () => showStatus(elements.generalSettingsStatus, "Configurações salvas!"),
    () => showStatus(elements.generalSettingsStatus, "Falha ao salvar")
  )],
  [elements.debugEnabledCheckbox, "change", () => controller.toggleDebugHandler(Boolean(elements.debugEnabledCheckbox?.checked))],
  [elements.viewLogsBtn, "click", () => viewLogs(elements.logsOutput)],
  [elements.clearLogsBtn, "click", () => clearLogs(elements.logsOutput)],
] as const;

listeners.forEach(([el, event, handler]) => el?.addEventListener(event, handler));
