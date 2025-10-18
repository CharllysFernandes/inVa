/// <reference types="chrome" />

import { TOGGLE_HIGHLIGHT, type Message } from "../shared/types";
import { getActiveTab } from "../shared/utils";

const toggleButton = document.getElementById("toggleHighlight");

if (toggleButton) {
  toggleButton.addEventListener("click", async () => {
    const tab = await getActiveTab();

    if (tab?.id) {
  const message: Message = { type: TOGGLE_HIGHLIGHT };
      chrome.tabs.sendMessage(tab.id, message);
    }
  });
}
