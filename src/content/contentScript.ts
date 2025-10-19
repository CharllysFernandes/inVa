/// <reference types="chrome" />

import { TOGGLE_HIGHLIGHT, type Message } from "../shared/types";
import { getStoredHighlightColor, getStoredCreateTicketUrl } from "../shared/utils";
import { logger } from "../shared/logger";
import { ELEMENTO_HTML } from "../shared/elemento";

const HIGHLIGHT_CLASS = "inva__highlight";

const toggleHighlight = async () => {
  await logger.debug("content", "toggleHighlight invoked");
  const existingHighlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`);

  if (existingHighlights.length > 0) {
    existingHighlights.forEach((node) => node.classList.remove(HIGHLIGHT_CLASS));
    document.head.querySelector(`#${HIGHLIGHT_CLASS}`)?.remove();
    await logger.info("content", "Removed highlights", { count: existingHighlights.length });
    return;
  }

  const color = await getStoredHighlightColor();
  await logger.debug("content", "Applying highlight color", { color });
  const styleEl = document.createElement("style");
  styleEl.id = HIGHLIGHT_CLASS;
  styleEl.textContent = `.${HIGHLIGHT_CLASS} { outline: 3px solid ${color}; transition: outline 0.2s ease-in-out; }`;
  document.head.append(styleEl);

  document.querySelectorAll("p, h1, h2, h3, h4, h5, h6").forEach((node) => {
    node.classList.add(HIGHLIGHT_CLASS);
  });
  await logger.info("content", "Applied highlight to text nodes");
};

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === TOGGLE_HIGHLIGHT) {
    void logger.debug("content", "Received TOGGLE_HIGHLIGHT message");
    void toggleHighlight();
  }
});

// Verifica URL e injeta elemento.html
(async () => {
  try {
  const savedUrl = await getStoredCreateTicketUrl();
    if (!savedUrl) return;

    const currentUrl = window.location.href;
    const matchesSaved = (() => {
      try {
        const saved = new URL(savedUrl);
        const current = new URL(currentUrl);
        return current.origin === saved.origin && current.pathname.startsWith(saved.pathname);
      } catch {
        // fallback para beginsWith caso parsing falhe
        return currentUrl.startsWith(savedUrl);
      }
    })();
    if (!matchesSaved) {
      void logger.debug("content", "URL does not match saved, skipping", { savedUrl, currentUrl });
      return;
    }
    void logger.info("content", "Matched saved URL, will attempt injection", { savedUrl, currentUrl });

    // Aguarda DOM pronto se necessário
    if (document.readyState === "loading") {
      await new Promise<void>((resolve) => document.addEventListener("DOMContentLoaded", () => resolve(), { once: true }));
    }

    const MARK_ID = "inva-elemento-wrapper";
    const inject = async (): Promise<boolean> => {
      const container = document.querySelector<HTMLDivElement>(".category_step1, #category_step1, div.category_step1, div#category_step1");
      if (!container) return false;
      if (container.querySelector(`#${MARK_ID}`)) return true;

      const wrapper = document.createElement("div");
      wrapper.id = MARK_ID;
      wrapper.innerHTML = ELEMENTO_HTML;
      container.insertBefore(wrapper, container.firstChild);
      void logger.info("content", "Injected elemento.html into category_step1");
      return true;
    };

    if (await inject()) return;

    // Observa o DOM por um curto período para páginas dinâmicas
    void logger.debug("content", "Starting DOM observer waiting for container");
    const observer = new MutationObserver(async () => {
      if (await inject()) {
        void logger.debug("content", "Container found via observer, injected");
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      void logger.debug("content", "Observer timeout without injection");
    }, 10000);
  } catch (e) {
    // silencia erros para não quebrar páginas
  }
})();
