/// <reference types="chrome" />

import { TOGGLE_HIGHLIGHT, type Message } from "../shared/types";

chrome.runtime.onInstalled.addListener(() => {
  console.info("inVa background script installed");
});

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  if (!tab.id) {
    return;
  }

  const message: Message = { type: TOGGLE_HIGHLIGHT };

  chrome.tabs.sendMessage(tab.id, message);
});
