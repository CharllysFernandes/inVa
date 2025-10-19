/// <reference types="chrome" />

import { TOGGLE_HIGHLIGHT, type Message } from "../shared/types";
import { logger } from "../shared/logger";

chrome.runtime.onInstalled.addListener(() => {
  void logger.info("background", "Service worker installed");
});

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  if (!tab.id) {
    return;
  }

  const message: Message = { type: TOGGLE_HIGHLIGHT };
  void logger.debug("background", "Sending toggle message", { tabId: tab.id });
  chrome.tabs.sendMessage(tab.id, message);
});
