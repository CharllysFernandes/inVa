// Preenche CKEditor em iframe com o texto salvo em comments (robusto)
function insertTextInCkeditorIframe(text: string) {
  const tryInsert = (iframe: HTMLIFrameElement) => {
    if (!iframe.contentDocument) return false;
    const body = iframe.contentDocument.body;
    if (!body) return false;
    let p = body.querySelector('p');
    if (!p) {
      p = iframe.contentDocument.createElement('p');
      body.appendChild(p);
    }
    p.innerText = text;
    return true;
  };

  const insertWhenReady = (iframe: HTMLIFrameElement) => {
    if (tryInsert(iframe)) return;
    let attempts = 0;
    const maxAttempts = 30; // ~9 segundos
    const interval = setInterval(() => {
      attempts++;
      if (tryInsert(iframe) || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 300);
  };

  const observeIframe = () => {
    const iframe = document.querySelector<HTMLIFrameElement>('.cke_wysiwyg_frame');
    if (iframe) {
      if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        insertWhenReady(iframe);
      } else {
        iframe.addEventListener('load', () => insertWhenReady(iframe), { once: true });
      }
      return true;
    }
    return false;
  };

  if (!observeIframe()) {
    const observer = new MutationObserver(() => {
      if (observeIframe()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }
}
// Preenche CKEditor com o texto salvo em comments
function setCkeditorDescription(text: string) {
  const editable = document.querySelector<HTMLElement>('.cke_editable');
  if (editable) {
    const p = editable.querySelector('p');
    if (p) {
      p.innerText = text;
    }
  }
}
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

      // Persistência do conteúdo do textarea #comments em chrome.storage.local
      const textarea = wrapper.querySelector<HTMLTextAreaElement>("#comments");
      if (textarea) {
        const storageKey = `inva_comments:${savedUrl}`;

        // Carrega valor salvo
        try {
          const saved = await new Promise<string>((resolve) => {
            chrome.storage.local.get({ [storageKey]: "" }, (items) => resolve(String(items[storageKey] ?? "")));
          });
          if (saved) {
            textarea.value = saved;
            void logger.info("content", "Loaded saved comment into textarea", { key: storageKey, value: saved });
            // Também preenche o CKEditor, se existir
            setCkeditorDescription(saved);
            // E também preenche o CKEditor em iframe, se existir
            insertTextInCkeditorIframe(saved);
          }
        } catch (e) {
          void logger.warn("content", "Failed to load saved comment", { error: String(e) });
        }

        // Debounce helper
        const debounce = <T extends (...args: unknown[]) => void>(fn: T, wait = 400) => {
          let t: number | undefined;
          return (...args: Parameters<T>) => {
            if (t) window.clearTimeout(t);
            t = window.setTimeout(() => fn(...args), wait);
          };
        };

        const saveNow = async (reason: string) => {
          try {
            const value = textarea.value;
            await new Promise<void>((resolve, reject) => {
              chrome.storage.local.set({ [storageKey]: value }, () => {
                const err = chrome.runtime.lastError;
                if (err) reject(err);
                else resolve();
              });
            });
            void logger.info("content", "Saved comment text", { key: storageKey, value, reason });
          } catch (e) {
            void logger.error("content", "Failed to save comment text", { error: String(e) });
          }
        };

        const saveDebounced = debounce(() => void saveNow("input"), 600);
        textarea.addEventListener("input", saveDebounced);
        textarea.addEventListener("blur", () => { void saveNow("blur"); });
      } else {
        void logger.warn("content", "Textarea #comments not found inside injected wrapper");
      }
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
