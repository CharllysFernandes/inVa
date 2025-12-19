/**
 * Referências aos elementos do DOM do popup
 */

export const elements = {
  // URL Configuration
  urlInput: document.getElementById("createTicketUrl") as HTMLInputElement | null,
  saveButton: document.getElementById("saveCreateTicketUrl"),
  saveStatus: document.getElementById("saveStatus") as HTMLParagraphElement | null,

  // OpenRouter Configuration
  openrouterApiKeyInput: document.getElementById("openrouterApiKey") as HTMLInputElement | null,
  openrouterSiteUrlInput: document.getElementById("openrouterSiteUrl") as HTMLInputElement | null,
  openrouterAppNameInput: document.getElementById("openrouterAppName") as HTMLInputElement | null,
  saveOpenRouterButton: document.getElementById("saveOpenRouterConfig"),
  testOpenRouterButton: document.getElementById("testOpenRouterConnection"),
  openrouterStatus: document.getElementById("openrouterStatus") as HTMLParagraphElement | null,

  // General Settings
  hideKnowledgeBaseCheckbox: document.getElementById("hideKnowledgeBase") as HTMLInputElement | null,
  saveGeneralSettingsButton: document.getElementById("saveGeneralSettings"),
  generalSettingsStatus: document.getElementById("generalSettingsStatus") as HTMLParagraphElement | null,

  // Debug
  debugEnabledCheckbox: document.getElementById("debugEnabled") as HTMLInputElement | null,
  viewLogsBtn: document.getElementById("viewLogs"),
  clearLogsBtn: document.getElementById("clearLogs"),
  logsOutput: document.getElementById("logsOutput") as HTMLPreElement | null,
  appVersionLabel: document.getElementById("appVersion"),
} as const;
