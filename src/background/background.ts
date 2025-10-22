/**
 * Service worker de background da extensão
 * Monitora eventos de instalação e atualização
 * @module background
 */

import { logger } from "@shared/logger";

/**
 * Event listener para instalação da extensão
 * Registra log quando a extensão é instalada ou atualizada
 */
chrome.runtime.onInstalled.addListener(() => {
  void logger.info("background", "Service worker installed");
});
