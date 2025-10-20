/// <reference types="chrome" />

import { getStoredCreateTicketUrl } from "../shared/utils";
import { logger } from "../shared/logger";
import { ELEMENTO_HTML } from "../shared/elemento";

/**
 * Normaliza o texto para facilitar comparações entre edições do CKEditor.
 * - Converte toda quebra de linha para "\n".
 * - Remove espaços excedentes no começo e no final.
 */
const normalizeContent = (value: string): string => value.replace(/\r\n?|\n/g, "\n").trim();

let lastSyncedRichText = "";
let iframeMutationObserver: MutationObserver | null = null;
let iframeAppearanceObserver: MutationObserver | null = null;
let iframeStabilityInterval: number | null = null;
let inlineMutationObserver: MutationObserver | null = null;
let inlineAppearanceObserver: MutationObserver | null = null;
const wiredSubmitElements = new WeakSet<Element>();
const wiredSubmitForms = new WeakSet<HTMLFormElement>();
const SUBMIT_BUTTON_SELECTOR = "#submit_button.button-blue";
type ClearReason = "button-click" | "form-submit" | "manual-clear";

/**
 * Aplica o último texto sincronizado dentro do iframe do CKEditor.
 * Retorna `true` quando o conteúdo final corresponde ao esperado.
 */
const applyTextToIframe = (iframe: HTMLIFrameElement): boolean => {
  const text = lastSyncedRichText;
  const doc = iframe.contentDocument;
  const body = doc?.body;
  if (!doc || !body) {
    return false;
  }

  const current = normalizeContent(body.textContent ?? "");
  const target = normalizeContent(text);

  if (current === target) {
    return true;
  }

  let paragraph = body.querySelector<HTMLParagraphElement>("p");
  if (!paragraph) {
    paragraph = doc.createElement("p");
    body.innerHTML = "";
    body.appendChild(paragraph);
  }

  paragraph.textContent = text;
  return normalizeContent(body.textContent ?? "") === target;
};

/**
 * Observa o iframe para detectar alterações que limpem o conteúdo
 * e reaplica o texto salvo até que o editor estabilize.
 */
const startIframeWatchers = (iframe: HTMLIFrameElement) => {
  const doc = iframe.contentDocument;
  const body = doc?.body;
  if (!doc || !body) {
    return;
  }

  iframeMutationObserver?.disconnect();
  iframeMutationObserver = new MutationObserver(() => {
    const text = lastSyncedRichText;
    const current = normalizeContent(body.textContent ?? "");
    const target = normalizeContent(text);
    if (current !== target) {
      void logger.debug("content", "Reapplying text after iframe mutation", { targetLength: text.length });
      applyTextToIframe(iframe);
    }
  });
  iframeMutationObserver.observe(body, { childList: true, subtree: true, characterData: true });

  if (iframeStabilityInterval) {
    window.clearInterval(iframeStabilityInterval);
  }
  let attempts = 0;
  let stableMatches = 0;
  const requiredStableMatches = 4;
  const maxAttempts = 80; // ~32s
  iframeStabilityInterval = window.setInterval(() => {
    attempts += 1;

    const applied = applyTextToIframe(iframe);
    if (applied) {
      stableMatches += 1;
    } else {
      stableMatches = 0;
    }

    const iframeInDom = document.contains(iframe);
    if (!iframeInDom || stableMatches >= requiredStableMatches || attempts >= maxAttempts) {
      if (!iframeInDom) {
        void logger.debug("content", "Iframe removed before stabilizing");
      }
      if (iframeStabilityInterval) {
        window.clearInterval(iframeStabilityInterval);
        iframeStabilityInterval = null;
      }
    }
  }, 400);
};

/**
 * Garante que o iframe do CKEditor exista e esteja pronto para receber o texto.
 * Se o iframe ainda não estiver disponível, permanece observando o DOM.
 */
const ensureIframeSync = () => {
  const iframe = document.querySelector<HTMLIFrameElement>(".cke_wysiwyg_frame");
  if (iframe) {
    if (iframeAppearanceObserver) {
      iframeAppearanceObserver.disconnect();
      iframeAppearanceObserver = null;
    }

    if (iframe.contentDocument?.readyState === "complete") {
      applyTextToIframe(iframe);
    } else {
      iframe.addEventListener(
        "load",
        () => {
          applyTextToIframe(iframe);
        },
        { once: true }
      );
    }

    startIframeWatchers(iframe);
    return;
  }

  if (!iframeAppearanceObserver) {
    iframeAppearanceObserver = new MutationObserver(() => {
      const candidate = document.querySelector<HTMLIFrameElement>(".cke_wysiwyg_frame");
      if (candidate) {
        ensureIframeSync();
      }
    });
    iframeAppearanceObserver.observe(document.body, { childList: true, subtree: true });
  }
};

/**
 * Reproduz o conteúdo sincronizado em instâncias inline do CKEditor.
 */
const applyTextToInlineEditor = (editable: HTMLElement) => {
  const text = lastSyncedRichText;
  const target = normalizeContent(text);
  const current = normalizeContent(editable.textContent ?? "");

  if (current === target) {
    return;
  }

  let paragraph = editable.querySelector<HTMLParagraphElement>("p");
  if (!paragraph) {
    paragraph = editable.ownerDocument.createElement("p");
    editable.innerHTML = "";
    editable.appendChild(paragraph);
  }

  paragraph.textContent = text;
};

/**
 * Configura observadores para reinstaurar o texto sempre que o editor inline
 * sofrer alterações que removam o conteúdo sincronizado.
 */
const startInlineWatchers = (editable: HTMLElement) => {
  inlineMutationObserver?.disconnect();
  inlineMutationObserver = new MutationObserver(() => {
    const text = lastSyncedRichText;
    const target = normalizeContent(text);
    const current = normalizeContent(editable.textContent ?? "");
    if (current !== target) {
      void logger.debug("content", "Reapplying text after inline editor mutation", { targetLength: text.length });
      applyTextToInlineEditor(editable);
    }
  });
  inlineMutationObserver.observe(editable, { childList: true, subtree: true, characterData: true });
};

/**
 * Localiza o editor inline e aplica o texto salvo.
 * Caso ele ainda não esteja no DOM, mantém uma vigilância até aparecer.
 */
const ensureInlineEditorSync = () => {
  const editable = document.querySelector<HTMLElement>(".cke_editable");
  if (editable) {
    if (inlineAppearanceObserver) {
      inlineAppearanceObserver.disconnect();
      inlineAppearanceObserver = null;
    }
    applyTextToInlineEditor(editable);
    startInlineWatchers(editable);
    return;
  }

  if (!inlineAppearanceObserver) {
    inlineAppearanceObserver = new MutationObserver(() => {
      const candidate = document.querySelector<HTMLElement>(".cke_editable");
      if (candidate) {
        ensureInlineEditorSync();
      }
    });
    inlineAppearanceObserver.observe(document.body, { childList: true, subtree: true });
  }
};

/**
 * Dispara o pipeline de sincronização para edições baseadas em iframe.
 */
function insertTextInCkeditorIframe(_text: string) {
  ensureIframeSync();
}
/**
 * Dispara o pipeline de sincronização para edições inline do CKEditor.
 */
function setCkeditorDescription(_text: string) {
  ensureInlineEditorSync();
}
/**
 * Atualiza os diferentes modos do CKEditor (iframe e inline) com o texto fornecido
 * e registra o valor sincronizado para reaplicações futuras.
 */
const syncRichTextEditors = (text: string) => {
  void logger.debug("content", "Syncing CKEditor content", { length: text.length });
  lastSyncedRichText = text;
  setCkeditorDescription(text);
  insertTextInCkeditorIframe(text);
};

/**
 * Limpa o texto sincronizado quando o botão de submissão for clicado.
 * Para evitar múltiplos listeners, utiliza um WeakSet para controlar anexos.
 */
const clearStoredComment = (storageKey: string, textarea: HTMLTextAreaElement, reason: ClearReason) => {
  const previousValue = textarea.value;
  textarea.value = "";
  syncRichTextEditors("");
  textarea.focus();
  void logger.debug("content", "Clearing stored comment", {
    key: storageKey,
    reason,
    previousLength: previousValue.length
  });

  chrome.storage.local.remove(storageKey, () => {
    const err = chrome.runtime.lastError;
    if (err) {
      void logger.error("content", "Failed to clear stored comment", { error: String(err), reason });
      return;
    }
    void logger.info("content", "Cleared stored comment", { key: storageKey, reason });
  });
};

const registerSubmitButtonHandler = (storageKey: string, textarea: HTMLTextAreaElement) => {
  const tryAttachButton = (): boolean => {
    const element = document.querySelector(SUBMIT_BUTTON_SELECTOR);
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    if (wiredSubmitElements.has(element)) {
      return true;
    }

    element.addEventListener("click", () => clearStoredComment(storageKey, textarea, "button-click"));
    wiredSubmitElements.add(element);
    void logger.debug("content", "Attached submit button listener to clear comments");
    return true;
  };

  const tryAttachForm = (): boolean => {
    const form = textarea.closest("form");
    if (!form) {
      return false;
    }

    if (wiredSubmitForms.has(form)) {
      return true;
    }

    form.addEventListener(
      "submit",
      () => {
        clearStoredComment(storageKey, textarea, "form-submit");
      },
      { capture: true }
    );
    wiredSubmitForms.add(form);
    void logger.debug("content", "Attached form submit listener to clear comments");
    return true;
  };

  const ensureHandlers = (): boolean => {
    const buttonAttached = tryAttachButton();
    const formAttached = tryAttachForm();
    return buttonAttached || formAttached;
  };

  if (ensureHandlers()) {
    return;
  }

  const observer = new MutationObserver(() => {
    if (ensureHandlers()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 10000);
};
/**
 * Fluxo principal:
 * 1. Confere se a URL atual corresponde à URL salva no popup.
 * 2. Injeta o formulário auxiliar no container esperado.
 * 3. Sincroniza o textarea local e o editor rico com dados persistidos.
 */
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
          textarea.value = saved;
          syncRichTextEditors(saved);
          void logger.info("content", "Loaded saved comment into textarea", { key: storageKey, value: saved });
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

        const handleInput = () => {
          const value = textarea.value;
          syncRichTextEditors(value);
          saveDebounced();
        };

        textarea.addEventListener("input", handleInput);
        textarea.addEventListener("blur", () => {
          const value = textarea.value;
          syncRichTextEditors(value);
          void saveNow("blur");
        });

        registerSubmitButtonHandler(storageKey, textarea);

        const clearButton = wrapper.querySelector<HTMLButtonElement>("#clearCommentButton");
        if (clearButton) {
          clearButton.addEventListener("click", () => {
            clearStoredComment(storageKey, textarea, "manual-clear");
          });
        }

        chrome.storage.onChanged.addListener((changes, areaName) => {
          if (areaName !== "local") {
            return;
          }

          const change = changes[storageKey];
          if (!change) {
            return;
          }

          const newValue = typeof change.newValue === "string" ? change.newValue : "";

          void logger.debug("content", "Storage change detected for comments", { newValueLength: newValue.length });

          if (textarea.value === newValue) {
            return;
          }

          textarea.value = newValue;
          syncRichTextEditors(newValue);
        });
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
