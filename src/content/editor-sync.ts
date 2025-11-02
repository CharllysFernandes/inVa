/**
 * Módulo de sincronização com CKEditor
 * Gerencia a aplicação de texto em editores iframe e inline com proteção contra loops
 * @module editor-sync
 */

import { SELECTORS, LIMITS } from "@shared/constants";
import { normalizeContent, isContentEmpty } from "@shared/text-utils";
import { logger } from "@shared/logger";

/**
 * Converte texto com quebras de linha em HTML formatado para CKEditor
 * Preserva parágrafos e quebras de linha
 * @param {string} text - Texto com quebras de linha (\n)
 * @returns {string} HTML formatado com tags <p> e <br>
 * @example
 * textToHtml("Linha 1\nLinha 2\n\nParágrafo 2")
 * // Returns: "<p>Linha 1<br>Linha 2</p><p>Parágrafo 2</p>"
 */
export function textToHtml(text: string): string {
  if (!text) return "<p><br></p>";
  
  // Divide por blocos de parágrafos (dupla quebra de linha)
  const paragraphs = text.split(/\n\n+/);
  
  const htmlParagraphs = paragraphs.map(paragraph => {
    // Dentro de cada parágrafo, substitui quebras simples por <br>
    const lines = paragraph.split('\n');
    const htmlLines = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('<br>');
    
    return htmlLines ? `<p>${htmlLines}</p>` : '';
  }).filter(p => p.length > 0);
  
  return htmlParagraphs.length > 0 ? htmlParagraphs.join('') : '<p><br></p>';
}

/**
 * Estado interno do gerenciador de sincronização
 * @interface EditorState
 * @property {string} lastSyncedText - Último texto sincronizado
 * @property {boolean} enforcementActive - Se deve forçar o texto no editor
 * @property {boolean} isProgrammaticSync - Flag para evitar loops de sincronização
 */
interface EditorState {
  lastSyncedText: string;
  enforcementActive: boolean;
  isProgrammaticSync: boolean;
}

/**
 * Referências aos observadores de DOM ativos
 * @interface ObserverRefs
 * @property {MutationObserver|null} iframeMutation - Observer de mutações no iframe
 * @property {MutationObserver|null} iframeAppearance - Observer de aparecimento do iframe
 * @property {number|null} iframeStability - ID do intervalo de verificação de estabilidade
 * @property {MutationObserver|null} inlineMutation - Observer de mutações no editor inline
 * @property {MutationObserver|null} inlineAppearance - Observer de aparecimento do editor inline
 */
interface ObserverRefs {
  iframeMutation: MutationObserver | null;
  iframeAppearance: MutationObserver | null;
  iframeStability: number | null;
  inlineMutation: MutationObserver | null;
  inlineAppearance: MutationObserver | null;
}

/**
 * Gerenciador de sincronização com CKEditor
 * Suporta tanto modo iframe quanto inline, com proteção contra loops de sincronização
 * @class CKEditorSyncManager
 */
class CKEditorSyncManager {
  /**
   * Estado interno do sincronizador
   * @private
   * @type {EditorState}
   */
  private state: EditorState = {
    lastSyncedText: "",
    enforcementActive: false,
    isProgrammaticSync: false
  };

  /**
   * Referências aos observadores de DOM
   * @private
   * @type {ObserverRefs}
   */
  private observers: ObserverRefs = {
    iframeMutation: null,
    iframeAppearance: null,
    iframeStability: null,
    inlineMutation: null,
    inlineAppearance: null
  };

  /**
   * Sincroniza texto com ambos os modos de editor (iframe e inline)
   * Ativa a proteção de conteúdo se o texto não estiver vazio
   * @param {string} text - Texto a ser sincronizado
   * @returns {void}
   * @example
   * editorSync.sync('Meu comentário importante');
   */
  sync(text: string): void {
    void logger.debug("content", "Syncing CKEditor content", { length: text.length });
    this.state.lastSyncedText = text;
    this.state.enforcementActive = !isContentEmpty(text);
    this.syncInlineEditor();
    this.syncIframeEditor();
  }

  /**
   * Limpa todos os observadores ativos
   * Deve ser chamado ao desmontar o componente ou limpar recursos
   * @returns {void}
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

  /**
   * Sincroniza com editor em modo iframe
   * Aguarda o iframe estar pronto e inicia observadores
   * @private
   * @returns {void}
   */
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

  /**
   * Sincroniza com editor em modo inline
   * Aplica texto diretamente no elemento editável
   * @private
   * @returns {void}
   */
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

  /**
   * Aplica texto ao documento do iframe
   * @private
   * @param {HTMLIFrameElement} iframe - Elemento iframe do CKEditor
   * @returns {boolean} True se o texto foi aplicado com sucesso
   */
  private applyTextToIframe(iframe: HTMLIFrameElement): boolean {
    const doc = iframe.contentDocument;
    const body = doc?.body;
    if (!doc || !body) return false;

    const current = normalizeContent(body.textContent ?? "");
    const target = normalizeContent(this.state.lastSyncedText);

    if (current === target) return true;

    this.state.isProgrammaticSync = true;
    try {
      // Converte texto com quebras de linha em HTML formatado
      const htmlContent = textToHtml(this.state.lastSyncedText);
      body.innerHTML = htmlContent;
      
      void logger.debug("content", "Applied HTML to iframe", {
        textLength: this.state.lastSyncedText.length,
        htmlLength: htmlContent.length
      });
    } finally {
      this.state.isProgrammaticSync = false;
    }

    return normalizeContent(body.textContent ?? "") === target;
  }

  /**
   * Aplica texto ao editor inline
   * @private
   * @param {HTMLElement} editable - Elemento editável do CKEditor
   * @returns {void}
   */
  private applyTextToInline(editable: HTMLElement): void {
    const current = normalizeContent(editable.textContent ?? "");
    const target = normalizeContent(this.state.lastSyncedText);

    if (current === target) return;

    this.state.isProgrammaticSync = true;
    try {
      // Converte texto com quebras de linha em HTML formatado
      const htmlContent = textToHtml(this.state.lastSyncedText);
      editable.innerHTML = htmlContent;
      
      void logger.debug("content", "Applied HTML to inline editor", {
        textLength: this.state.lastSyncedText.length,
        htmlLength: htmlContent.length
      });
    } finally {
      this.state.isProgrammaticSync = false;
    }
  }

  /**
   * Inicia observadores de mutação para o iframe
   * Protege o conteúdo contra remoções acidentais
   * @private
   * @param {HTMLIFrameElement} iframe - Elemento iframe do CKEditor
   * @returns {void}
   */
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

  /**
   * Inicia verificador periódico de estabilidade do iframe
   * Tenta aplicar o texto até que esteja estável ou timeout
   * @private
   * @param {HTMLIFrameElement} iframe - Elemento iframe do CKEditor
   * @returns {void}
   */
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

  /**
   * Inicia observadores de mutação para o editor inline
   * @private
   * @param {HTMLElement} editable - Elemento editável do CKEditor
   * @returns {void}
   */
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

  /**
   * Verifica se o iframe tem foco atualmente
   * @private
   * @param {HTMLIFrameElement} iframe - Elemento iframe do CKEditor
   * @returns {boolean} True se o iframe ou algum elemento dentro dele tem foco
   */
  private iframeHasFocus(iframe: HTMLIFrameElement): boolean {
    const doc = iframe.contentDocument;
    const body = doc?.body;
    if (!doc || !body) return false;
    const active = doc.activeElement;
    return Boolean(active && body.contains(active));
  }

  /**
   * Verifica se o editor inline tem foco atualmente
   * @private
   * @param {HTMLElement} editable - Elemento editável do CKEditor
   * @returns {boolean} True se o editor tem foco
   */
  private inlineHasFocus(editable: HTMLElement): boolean {
    const active = document.activeElement;
    return Boolean(active && (active === editable || editable.contains(active)));
  }

  /**
   * Desconecta o observador de aparecimento do iframe
   * @private
   * @returns {void}
   */
  private disconnectIframeAppearance(): void {
    if (this.observers.iframeAppearance) {
      this.observers.iframeAppearance.disconnect();
      this.observers.iframeAppearance = null;
    }
  }

  /**
   * Desconecta o observador de aparecimento do editor inline
   * @private
   * @returns {void}
   */
  private disconnectInlineAppearance(): void {
    if (this.observers.inlineAppearance) {
      this.observers.inlineAppearance.disconnect();
      this.observers.inlineAppearance = null;
    }
  }
}

/**
 * Instância singleton do gerenciador de sincronização
 * @constant
 * @type {CKEditorSyncManager}
 * @example
 * import { editorSync } from './editor-sync';
 * editorSync.sync('Novo conteúdo');
 */
export const editorSync = new CKEditorSyncManager();
