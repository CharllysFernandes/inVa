/**
 * Módulo de sincronização com CKEditor
 * Gerencia a aplicação de texto em editores iframe e inline
 */

import { SELECTORS, LIMITS } from "../shared/constants";
import { normalizeContent, isContentEmpty } from "../shared/text-utils";
import { logger } from "../shared/logger";

interface EditorState {
  lastSyncedText: string;
  enforcementActive: boolean;
  isProgrammaticSync: boolean;
}

interface ObserverRefs {
  iframeMutation: MutationObserver | null;
  iframeAppearance: MutationObserver | null;
  iframeStability: number | null;
  inlineMutation: MutationObserver | null;
  inlineAppearance: MutationObserver | null;
}

class CKEditorSyncManager {
  private state: EditorState = {
    lastSyncedText: "",
    enforcementActive: false,
    isProgrammaticSync: false
  };

  private observers: ObserverRefs = {
    iframeMutation: null,
    iframeAppearance: null,
    iframeStability: null,
    inlineMutation: null,
    inlineAppearance: null
  };

  /**
   * Sincroniza texto com ambos os modos de editor (iframe e inline)
   */
  sync(text: string): void {
    void logger.debug("content", "Syncing CKEditor content", { length: text.length });
    this.state.lastSyncedText = text;
    this.state.enforcementActive = !isContentEmpty(text);
    this.syncInlineEditor();
    this.syncIframeEditor();
  }

  /**
   * Limpa todos os observadores
   */
  cleanup(): void {
    this.observers.iframeMutation?.disconnect();
    this.observers.iframeAppearance?.disconnect();
    this.observers.inlineMutation?.disconnect();
    this.observers.inlineAppearance?.disconnect();
    if (this.observers.iframeStability) {
      window.clearInterval(this.observers.iframeStability);
    }
  }

  private syncIframeEditor(): void {
    const iframe = document.querySelector<HTMLIFrameElement>(SELECTORS.IFRAME_EDITOR);
    if (iframe) {
      this.disconnectIframeAppearance();
      if (iframe.contentDocument?.readyState === "complete") {
        this.applyTextToIframe(iframe);
      } else {
        iframe.addEventListener("load", () => this.applyTextToIframe(iframe), { once: true });
      }
      this.startIframeWatchers(iframe);
    } else if (!this.observers.iframeAppearance) {
      this.observers.iframeAppearance = new MutationObserver(() => {
        const candidate = document.querySelector<HTMLIFrameElement>(SELECTORS.IFRAME_EDITOR);
        if (candidate) this.syncIframeEditor();
      });
      this.observers.iframeAppearance.observe(document.body, { childList: true, subtree: true });
    }
  }

  private syncInlineEditor(): void {
    const editable = document.querySelector<HTMLElement>(SELECTORS.INLINE_EDITOR);
    if (editable) {
      this.disconnectInlineAppearance();
      this.applyTextToInline(editable);
      this.startInlineWatchers(editable);
    } else if (!this.observers.inlineAppearance) {
      this.observers.inlineAppearance = new MutationObserver(() => {
        const candidate = document.querySelector<HTMLElement>(SELECTORS.INLINE_EDITOR);
        if (candidate) this.syncInlineEditor();
      });
      this.observers.inlineAppearance.observe(document.body, { childList: true, subtree: true });
    }
  }

  private applyTextToIframe(iframe: HTMLIFrameElement): boolean {
    const doc = iframe.contentDocument;
    const body = doc?.body;
    if (!doc || !body) return false;

    const current = normalizeContent(body.textContent ?? "");
    const target = normalizeContent(this.state.lastSyncedText);

    if (current === target) return true;

    let paragraph = body.querySelector<HTMLParagraphElement>("p");
    if (!paragraph) {
      paragraph = doc.createElement("p");
      body.innerHTML = "";
      body.appendChild(paragraph);
    }

    this.state.isProgrammaticSync = true;
    try {
      paragraph.textContent = this.state.lastSyncedText;
    } finally {
      this.state.isProgrammaticSync = false;
    }

    return normalizeContent(body.textContent ?? "") === target;
  }

  private applyTextToInline(editable: HTMLElement): void {
    const current = normalizeContent(editable.textContent ?? "");
    const target = normalizeContent(this.state.lastSyncedText);

    if (current === target) return;

    let paragraph = editable.querySelector<HTMLParagraphElement>("p");
    if (!paragraph) {
      paragraph = editable.ownerDocument.createElement("p");
      editable.innerHTML = "";
      editable.appendChild(paragraph);
    }

    this.state.isProgrammaticSync = true;
    try {
      paragraph.textContent = this.state.lastSyncedText;
    } finally {
      this.state.isProgrammaticSync = false;
    }
  }

  private startIframeWatchers(iframe: HTMLIFrameElement): void {
    const doc = iframe.contentDocument;
    const body = doc?.body;
    if (!doc || !body) return;

    this.observers.iframeMutation?.disconnect();
    this.observers.iframeMutation = new MutationObserver(() => {
      if (!this.state.enforcementActive) return;

      const current = normalizeContent(body.textContent ?? "");
      const target = normalizeContent(this.state.lastSyncedText);
      const shouldReapply =
        target.length > 0 && isContentEmpty(current) && !this.iframeHasFocus(iframe);

      if (shouldReapply) {
        void logger.debug("content", "Reapplying text after iframe mutation", {
          targetLength: this.state.lastSyncedText.length
        });
        this.applyTextToIframe(iframe);
      }
    });
    this.observers.iframeMutation.observe(body, { childList: true, subtree: true, characterData: true });

    this.startStabilityChecker(iframe);
  }

  private startStabilityChecker(iframe: HTMLIFrameElement): void {
    if (this.observers.iframeStability) {
      window.clearInterval(this.observers.iframeStability);
    }

    let attempts = 0;
    let stableMatches = 0;

    this.observers.iframeStability = window.setInterval(() => {
      attempts++;
      const applied = this.state.enforcementActive ? this.applyTextToIframe(iframe) : true;

      if (applied) {
        stableMatches++;
      } else {
        stableMatches = 0;
      }

      const iframeInDom = document.contains(iframe);
      const isStable = stableMatches >= LIMITS.STABILITY_REQUIRED_MATCHES;
      const isTimeout = attempts >= LIMITS.STABILITY_MAX_ATTEMPTS;

      if (!iframeInDom || isStable || isTimeout) {
        if (!iframeInDom) {
          void logger.debug("content", "Iframe removed before stabilizing");
        }
        if (this.observers.iframeStability) {
          window.clearInterval(this.observers.iframeStability);
          this.observers.iframeStability = null;
        }
      }
    }, LIMITS.STABILITY_INTERVAL_MS);
  }

  private startInlineWatchers(editable: HTMLElement): void {
    this.observers.inlineMutation?.disconnect();
    this.observers.inlineMutation = new MutationObserver(() => {
      if (!this.state.enforcementActive) return;

      const current = normalizeContent(editable.textContent ?? "");
      const target = normalizeContent(this.state.lastSyncedText);
      const shouldReapply =
        target.length > 0 && isContentEmpty(current) && !this.inlineHasFocus(editable);

      if (shouldReapply) {
        void logger.debug("content", "Reapplying text after inline editor mutation", {
          targetLength: this.state.lastSyncedText.length
        });
        this.applyTextToInline(editable);
      }
    });
    this.observers.inlineMutation.observe(editable, { childList: true, subtree: true, characterData: true });
  }

  private iframeHasFocus(iframe: HTMLIFrameElement): boolean {
    const doc = iframe.contentDocument;
    const body = doc?.body;
    if (!doc || !body) return false;
    const active = doc.activeElement;
    return Boolean(active && body.contains(active));
  }

  private inlineHasFocus(editable: HTMLElement): boolean {
    const active = document.activeElement;
    return Boolean(active && (active === editable || editable.contains(active)));
  }

  private disconnectIframeAppearance(): void {
    if (this.observers.iframeAppearance) {
      this.observers.iframeAppearance.disconnect();
      this.observers.iframeAppearance = null;
    }
  }

  private disconnectInlineAppearance(): void {
    if (this.observers.inlineAppearance) {
      this.observers.inlineAppearance.disconnect();
      this.observers.inlineAppearance = null;
    }
  }
}

export const editorSync = new CKEditorSyncManager();
