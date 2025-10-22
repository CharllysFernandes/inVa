import { logger } from "@shared/logger";

chrome.runtime.onInstalled.addListener(() => {
  void logger.info("background", "Service worker installed");
});
