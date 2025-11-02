/**
 * Gerenciador de sugestões de perguntas com IA
 * Cria e gerencia a interface visual de perguntas complementares
 * @module ai-suggestions
 */

import { logger } from "./logger";
import { generateQuestions, isConfigured, type QuestionSuggestions } from "./openrouter-api";
import { debounce } from "./dom-utils";

/**
 * Interface para resposta de pergunta
 * @interface QuestionAnswer
 */
export interface QuestionAnswer {
  question: string;
  answer: string;
}

/**
 * Classe gerenciadora de sugestões de IA
 * @class AISuggestionsManager
 */
export class AISuggestionsManager {
  private container: HTMLElement | null = null;
  private textarea: HTMLTextAreaElement | null = null;
  private currentSuggestions: QuestionSuggestions | null = null;
  private answers: Map<number, string> = new Map();
  private isGenerating: boolean = false;
  private debouncedGenerate: ((...args: unknown[]) => void) | null = null;

  /**
   * CSS ID do container de sugestões
   * @constant
   */
  private readonly SUGGESTIONS_CONTAINER_ID = "inva-ai-suggestions-container";

  /**
   * CSS ID do style tag
   * @constant
   */
  private readonly STYLES_ID = "inva-ai-suggestions-styles";

  /**
   * Delay do debounce em ms (1.5 segundos)
   * @constant
   */
  private readonly DEBOUNCE_DELAY_MS = 1500;

  constructor() {
    void logger.debug("ai-suggestions", "AISuggestionsManager initialized");
  }

  /**
   * Injeta estilos CSS para o componente
   * @private
   */
  private injectStyles(): void {
    if (document.getElementById(this.STYLES_ID)) {
      return; // Já injetado
    }

    const style = document.createElement("style");
    style.id = this.STYLES_ID;
    style.textContent = `
      .inva-ai-suggestions {
        margin-top: 12px;
        padding: 16px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 2px solid #0891b2;
        border-radius: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 4px 12px rgba(8, 145, 178, 0.15);
      }

      .inva-ai-suggestions-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #0c4a6e;
      }

      .inva-ai-suggestions-icon {
        font-size: 18px;
      }

      .inva-ai-suggestions-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        color: #0369a1;
        font-size: 13px;
      }

      .inva-ai-suggestions-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #bae6fd;
        border-top-color: #0891b2;
        border-radius: 50%;
        animation: inva-spin 0.8s linear infinite;
      }

      @keyframes inva-spin {
        to { transform: rotate(360deg); }
      }

      .inva-ai-suggestions-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .inva-ai-question-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        background: #ffffff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .inva-ai-question-item:hover {
        border-color: #0891b2;
        box-shadow: 0 2px 8px rgba(8, 145, 178, 0.1);
      }

      .inva-ai-question-text {
        font-size: 13px;
        font-weight: 500;
        color: #0c4a6e;
        margin-bottom: 4px;
      }

      .inva-ai-answer-input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        background: #f8fafc;
        transition: border-color 0.2s ease, background 0.2s ease;
        box-sizing: border-box;
      }

      .inva-ai-answer-input:focus {
        outline: none;
        border-color: #0891b2;
        background: #ffffff;
        box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
      }

      .inva-ai-answer-input::placeholder {
        color: #94a3b8;
      }

      .inva-ai-suggestions-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .inva-ai-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .inva-ai-btn-primary {
        background: linear-gradient(135deg, #0891b2, #0e7490);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(8, 145, 178, 0.3);
      }

      .inva-ai-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(8, 145, 178, 0.4);
      }

      .inva-ai-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .inva-ai-btn-secondary {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
      }

      .inva-ai-btn-secondary:hover {
        background: #e2e8f0;
      }

      .inva-ai-error {
        padding: 12px;
        background: #fef2f2;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        color: #991b1b;
        font-size: 13px;
      }

      .inva-ai-empty {
        padding: 12px;
        color: #64748b;
        font-size: 13px;
        font-style: italic;
      }
    `;

    document.head.appendChild(style);
    void logger.debug("ai-suggestions", "Styles injected");
  }

  /**
   * Inicializa o gerenciador com referências aos elementos
   * @param {HTMLTextAreaElement} textarea - Campo de texto principal
   * @param {HTMLElement} parentContainer - Container pai onde injetar sugestões
   */
  public async initialize(
    textarea: HTMLTextAreaElement,
    parentContainer: HTMLElement
  ): Promise<void> {
    this.textarea = textarea;
    this.injectStyles();

    // Verifica se API está configurada
    const configured = await isConfigured();
    if (!configured) {
      void logger.warn("ai-suggestions", "OpenRouter not configured, suggestions disabled");
      return;
    }

    // Cria container de sugestões
    this.createContainer(parentContainer);

    // Configura debounce para geração automática
    const generateWrapper = (...args: unknown[]) => {
      const text = args[0] as string;
      void this.autoGenerate(text);
    };
    this.debouncedGenerate = debounce(generateWrapper, this.DEBOUNCE_DELAY_MS);

    // Escuta mudanças no textarea
    textarea.addEventListener("input", () => {
      if (this.debouncedGenerate) {
        this.debouncedGenerate(textarea.value);
      }
    });

    void logger.info("ai-suggestions", "AISuggestionsManager initialized and listening");
  }

  /**
   * Cria o container de sugestões no DOM
   * @private
   * @param {HTMLElement} parentContainer - Container pai
   */
  private createContainer(parentContainer: HTMLElement): void {
    // Remove container existente se houver
    const existing = document.getElementById(this.SUGGESTIONS_CONTAINER_ID);
    if (existing) {
      existing.remove();
    }

    this.container = document.createElement("div");
    this.container.id = this.SUGGESTIONS_CONTAINER_ID;
    parentContainer.appendChild(this.container);

    void logger.debug("ai-suggestions", "Container created");
  }

  /**
   * Gera sugestões automaticamente (chamado via debounce)
   * @private
   * @param {string} text - Texto do usuário
   */
  private async autoGenerate(text: string): Promise<void> {
    if (!text || text.trim().length < 10) {
      this.hide();
      return;
    }

    await this.generate(text);
  }

  /**
   * Gera e exibe sugestões de perguntas
   * @param {string} text - Texto do usuário
   */
  public async generate(text: string): Promise<void> {
    if (this.isGenerating || !this.container) {
      return;
    }

    this.isGenerating = true;
    this.showLoading();

    try {
      this.currentSuggestions = await generateQuestions(text, true);

      if (this.currentSuggestions.questions.length === 0) {
        this.showEmpty();
      } else {
        this.render();
      }
    } catch (e) {
      void logger.error("ai-suggestions", "Failed to generate suggestions", {
        error: String(e)
      });
      this.showError("Erro ao gerar sugestões. Verifique a configuração da API.");
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Exibe estado de carregamento
   * @private
   */
  private showLoading(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="inva-ai-suggestions">
        <div class="inva-ai-suggestions-loading">
          <div class="inva-ai-suggestions-spinner"></div>
          <span>Gerando perguntas complementares...</span>
        </div>
      </div>
    `;
    this.container.style.display = "block";
  }

  /**
   * Exibe mensagem de erro
   * @private
   * @param {string} message - Mensagem de erro
   */
  private showError(message: string): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="inva-ai-suggestions">
        <div class="inva-ai-error">${message}</div>
      </div>
    `;
    this.container.style.display = "block";
  }

  /**
   * Exibe mensagem de vazio
   * @private
   */
  private showEmpty(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="inva-ai-suggestions">
        <div class="inva-ai-empty">
          Nenhuma pergunta complementar sugerida para este texto.
        </div>
      </div>
    `;
    this.container.style.display = "block";
  }

  /**
   * Renderiza as sugestões na interface
   * @private
   */
  private render(): void {
    if (!this.container || !this.currentSuggestions) return;

    const questions = this.currentSuggestions.questions;
    this.answers.clear();

    const questionsList = questions
      .map((q, index) => {
        const answerId = `inva-answer-${index}`;
        return `
          <div class="inva-ai-question-item">
            <label class="inva-ai-question-text" for="${answerId}">${q}</label>
            <input
              type="text"
              id="${answerId}"
              class="inva-ai-answer-input"
              placeholder="Digite a resposta..."
              data-question-index="${index}"
            />
          </div>
        `;
      })
      .join("");

    this.container.innerHTML = `
      <div class="inva-ai-suggestions">
        <div class="inva-ai-suggestions-header">
          <span class="inva-ai-suggestions-icon">💡</span>
          <span>Informações adicionais sugeridas:</span>
        </div>
        <div class="inva-ai-suggestions-list">
          ${questionsList}
        </div>
        <div class="inva-ai-suggestions-actions">
          <button class="inva-ai-btn inva-ai-btn-primary" id="inva-apply-answers">
            Aplicar Respostas
          </button>
          <button class="inva-ai-btn inva-ai-btn-secondary" id="inva-dismiss-suggestions">
            Dispensar
          </button>
        </div>
      </div>
    `;

    this.container.style.display = "block";

    // Adiciona event listeners
    this.attachEventListeners();

    void logger.info("ai-suggestions", "Suggestions rendered", {
      questionCount: questions.length
    });
  }

  /**
   * Anexa event listeners aos elementos
   * @private
   */
  private attachEventListeners(): void {
    if (!this.container) return;

    // Captura respostas
    const inputs = this.container.querySelectorAll<HTMLInputElement>(".inva-ai-answer-input");
    inputs.forEach(input => {
      input.addEventListener("input", (e) => {
        const target = e.target as HTMLInputElement;
        const index = parseInt(target.dataset.questionIndex || "0", 10);
        this.answers.set(index, target.value);
      });
    });

    // Botão aplicar
    const applyBtn = this.container.querySelector("#inva-apply-answers");
    applyBtn?.addEventListener("click", () => this.applyAnswers());

    // Botão dispensar
    const dismissBtn = this.container.querySelector("#inva-dismiss-suggestions");
    dismissBtn?.addEventListener("click", () => this.hide());
  }

  /**
   * Aplica as respostas ao texto principal
   * Verifica se já existe o cabeçalho "📋 Informações Complementares:" e adiciona apenas uma vez
   * @private
   */
  private applyAnswers(): void {
    if (!this.textarea || !this.currentSuggestions) return;

    const answeredQuestions: QuestionAnswer[] = [];

    this.currentSuggestions.questions.forEach((question, index) => {
      const answer = this.answers.get(index);
      if (answer && answer.trim()) {
        answeredQuestions.push({ question, answer: answer.trim() });
      }
    });

    if (answeredQuestions.length === 0) {
      void logger.debug("ai-suggestions", "No answers to apply");
      return;
    }

    // Formata as respostas
    const currentText = this.textarea.value.trim();
    const additionalInfo = answeredQuestions
      .map(qa => `- ${qa.question}\n  R: ${qa.answer}`)
      .join("\n");

    // Verifica se já existe o cabeçalho "📋 Informações Complementares:"
    const hasComplementaryInfo = currentText.includes("📋 Informações Complementares:");

    let newText: string;
    if (hasComplementaryInfo) {
      // Já existe o cabeçalho, apenas adiciona as novas respostas ao final
      newText = `${currentText}\n${additionalInfo}`;
      void logger.debug("ai-suggestions", "Appending to existing complementary info");
    } else {
      // Primeira vez, adiciona o cabeçalho
      newText = `${currentText}\n\n📋 Informações Complementares:\n${additionalInfo}`;
      void logger.debug("ai-suggestions", "Adding complementary info header");
    }

    this.textarea.value = newText;
    this.textarea.dispatchEvent(new Event("input", { bubbles: true }));

    void logger.info("ai-suggestions", "Answers applied to textarea", {
      answerCount: answeredQuestions.length,
      hasExistingHeader: hasComplementaryInfo
    });

    this.hide();
  }

  /**
   * Oculta o container de sugestões
   */
  public hide(): void {
    if (this.container) {
      this.container.style.display = "none";
      this.container.innerHTML = "";
    }
    this.currentSuggestions = null;
    this.answers.clear();

    void logger.debug("ai-suggestions", "Suggestions hidden");
  }

  /**
   * Destrói o gerenciador e limpa recursos
   */
  public destroy(): void {
    this.hide();
    
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    this.textarea = null;
    this.debouncedGenerate = null;

    void logger.debug("ai-suggestions", "AISuggestionsManager destroyed");
  }
}
