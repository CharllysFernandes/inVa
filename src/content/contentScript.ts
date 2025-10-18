/// <reference types="chrome" />

import { TOGGLE_HIGHLIGHT, type Message } from "../shared/types";
import { getStoredHighlightColor } from "../shared/utils";

const HIGHLIGHT_CLASS = "inva__highlight";

const toggleHighlight = async () => {
  const existingHighlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);

  if (existingHighlights.length > 0) {
    existingHighlights.forEach((node) => node.classList.remove(HIGHLIGHT_CLASS));
    document.head.querySelector(`#${HIGHLIGHT_CLASS}`)?.remove();
    return;
  }

  const color = await getStoredHighlightColor();
  const styleEl = document.createElement("style");
  styleEl.id = HIGHLIGHT_CLASS;
  styleEl.textContent = `.${HIGHLIGHT_CLASS} { outline: 3px solid ${color}; transition: outline 0.2s ease-in-out; }`;
  document.head.append(styleEl);

  document.querySelectorAll("p, h1, h2, h3, h4, h5, h6").forEach((node) => {
    node.classList.add(HIGHLIGHT_CLASS);
  });
};

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === TOGGLE_HIGHLIGHT) {
    void toggleHighlight();
  }
});
