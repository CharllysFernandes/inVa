/**
 * Domain Entities - Config
 */

export interface TicketUrlConfig {
  url: string;
}

export interface OpenRouterConfig {
  apiKey?: string;
  siteUrl?: string;
  appName?: string;
}

export interface GeneralSettings {
  hideKnowledgeBase: boolean;
}

export interface DebugConfig {
  enabled: boolean;
}
