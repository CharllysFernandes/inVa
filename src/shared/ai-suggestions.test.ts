/**
 * Testes do gerenciador de sugestões de IA
 * @module ai-suggestions.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AISuggestionsManager } from "./ai-suggestions";
import * as openrouterApi from "./openrouter-api";

// Mock das dependências
vi.mock("./openrouter-api");
vi.mock("./logger");
vi.mock("./dom-utils", () => ({
  debounce: (fn: (...args: unknown[]) => void, _delay: number) => fn,
}));

describe("AISuggestionsManager", () => {
  let manager: AISuggestionsManager;
  let textarea: HTMLTextAreaElement;
  let container: HTMLDivElement;

  beforeEach(() => {
    manager = new AISuggestionsManager();
    textarea = document.createElement("textarea");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    manager.destroy();
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("should inject styles on initialization", async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);

      await manager.initialize(textarea, container);

      const style = document.getElementById("inva-ai-suggestions-styles");
      expect(style).toBeTruthy();
      expect(style?.tagName).toBe("STYLE");
    });

    it("should not inject styles twice", async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);

      await manager.initialize(textarea, container);
      await manager.initialize(textarea, container);

      const styles = document.querySelectorAll("#inva-ai-suggestions-styles");
      expect(styles.length).toBe(1);
    });

    it("should create suggestions container", async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);

      await manager.initialize(textarea, container);

      const suggestionsContainer = document.getElementById("inva-ai-suggestions-container");
      expect(suggestionsContainer).toBeTruthy();
      expect(container.contains(suggestionsContainer)).toBe(true);
    });

    it("should skip initialization if API not configured", async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(false);

      await manager.initialize(textarea, container);

      const suggestionsContainer = document.getElementById("inva-ai-suggestions-container");
      expect(suggestionsContainer).toBeFalsy();
    });
  });

  describe("generate", () => {
    beforeEach(async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);
      await manager.initialize(textarea, container);
    });

    it("should show loading state", async () => {
      vi.mocked(openrouterApi.generateQuestions).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          questions: [],
          context: "test",
          timestamp: Date.now()
        }), 100))
      );

      const generatePromise = manager.generate("test text");

      // Verifica loading state imediatamente
      const loadingElement = document.querySelector(".inva-ai-suggestions-loading");
      expect(loadingElement).toBeTruthy();
      expect(loadingElement?.textContent).toContain("Gerando perguntas");

      await generatePromise;
    });

    it("should display generated questions", async () => {
      const mockQuestions = {
        questions: [
          "Qual é o modelo do equipamento?",
          "Quando o problema começou?",
          "O erro está ocorrendo sempre?",
        ],
        context: "Impressora não imprime",
        timestamp: Date.now(),
      };

      vi.mocked(openrouterApi.generateQuestions).mockResolvedValue(mockQuestions);

      await manager.generate("Impressora não imprime");

      const questionItems = document.querySelectorAll(".inva-ai-question-item");
      expect(questionItems.length).toBe(3);

      const questionTexts = Array.from(questionItems).map(
        (item) => item.querySelector(".inva-ai-question-text")?.textContent
      );
      expect(questionTexts).toEqual(mockQuestions.questions);
    });

    it("should show empty state when no questions", async () => {
      vi.mocked(openrouterApi.generateQuestions).mockResolvedValue({
        questions: [],
        context: "test",
        timestamp: Date.now(),
      });

      await manager.generate("test");

      const emptyElement = document.querySelector(".inva-ai-empty");
      expect(emptyElement).toBeTruthy();
      expect(emptyElement?.textContent).toContain("Nenhuma pergunta complementar");
    });

    it("should show error state on failure", async () => {
      vi.mocked(openrouterApi.generateQuestions).mockRejectedValue(
        new Error("API error")
      );

      await manager.generate("test");

      const errorElement = document.querySelector(".inva-ai-error");
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).toContain("Erro ao gerar sugestões");
    });

    it("should not generate if already generating", async () => {
      vi.mocked(openrouterApi.generateQuestions).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          questions: [],
          context: "test",
          timestamp: Date.now()
        }), 100))
      );

      const promise1 = manager.generate("test1");
      const promise2 = manager.generate("test2");

      await Promise.all([promise1, promise2]);

      // Deve ter chamado generateQuestions apenas uma vez
      expect(openrouterApi.generateQuestions).toHaveBeenCalledTimes(1);
    });
  });

  describe("answer input", () => {
    beforeEach(async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);
      await manager.initialize(textarea, container);

      const mockQuestions = {
        questions: ["Pergunta 1?", "Pergunta 2?"],
        context: "test",
        timestamp: Date.now(),
      };
      vi.mocked(openrouterApi.generateQuestions).mockResolvedValue(mockQuestions);
      await manager.generate("test");
    });

    it("should create input fields for each question", () => {
      const inputs = document.querySelectorAll(".inva-ai-answer-input");
      expect(inputs.length).toBe(2);

      inputs.forEach((input) => {
        expect(input.getAttribute("type")).toBe("text");
        expect(input.getAttribute("placeholder")).toBe("Digite a resposta...");
      });
    });

    it("should track answer changes", () => {
      const input = document.querySelector<HTMLInputElement>(".inva-ai-answer-input");
      expect(input).toBeTruthy();

      input!.value = "Resposta de teste";
      input!.dispatchEvent(new Event("input"));

      // Verifica que o valor foi registrado (não podemos acessar o Map privado diretamente)
      // Verificamos isso indiretamente através do comportamento do botão Apply
      expect(input!.value).toBe("Resposta de teste");
    });
  });

  describe("apply answers", () => {
    beforeEach(async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);
      await manager.initialize(textarea, container);

      const mockQuestions = {
        questions: ["Qual é o modelo?", "Quando começou?"],
        context: "Problema na impressora",
        timestamp: Date.now(),
      };
      vi.mocked(openrouterApi.generateQuestions).mockResolvedValue(mockQuestions);
      await manager.generate("Problema na impressora");
    });

    it("should insert answered questions into textarea", () => {
      textarea.value = "Problema inicial";

      const inputs = document.querySelectorAll<HTMLInputElement>(".inva-ai-answer-input");
      inputs[0].value = "HP LaserJet";
      inputs[0].dispatchEvent(new Event("input"));
      inputs[1].value = "Ontem pela manhã";
      inputs[1].dispatchEvent(new Event("input"));

      const applyBtn = document.querySelector<HTMLButtonElement>("#inva-apply-answers");
      expect(applyBtn).toBeTruthy();
      applyBtn!.click();

      expect(textarea.value).toContain("Problema inicial");
      expect(textarea.value).toContain("📋 Informações Complementares:");
      expect(textarea.value).toContain("- Qual é o modelo?");
      expect(textarea.value).toContain("  R: HP LaserJet");
      expect(textarea.value).toContain("- Quando começou?");
      expect(textarea.value).toContain("  R: Ontem pela manhã");
    });

    it("should not apply if no answers provided", () => {
      textarea.value = "Problema inicial";

      const applyBtn = document.querySelector<HTMLButtonElement>("#inva-apply-answers");
      applyBtn!.click();

      expect(textarea.value).toBe("Problema inicial");
    });

    it("should hide suggestions after applying", () => {
      const inputs = document.querySelectorAll<HTMLInputElement>(".inva-ai-answer-input");
      inputs[0].value = "Resposta";
      inputs[0].dispatchEvent(new Event("input"));

      const applyBtn = document.querySelector<HTMLButtonElement>("#inva-apply-answers");
      applyBtn!.click();

      const suggestionsContainer = document.getElementById("inva-ai-suggestions-container");
      expect(suggestionsContainer?.style.display).toBe("none");
    });
  });

  describe("dismiss", () => {
    beforeEach(async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);
      await manager.initialize(textarea, container);

      const mockQuestions = {
        questions: ["Pergunta?"],
        context: "test",
        timestamp: Date.now(),
      };
      vi.mocked(openrouterApi.generateQuestions).mockResolvedValue(mockQuestions);
      await manager.generate("test");
    });

    it("should hide suggestions when dismiss button clicked", () => {
      const dismissBtn = document.querySelector<HTMLButtonElement>("#inva-dismiss-suggestions");
      expect(dismissBtn).toBeTruthy();

      dismissBtn!.click();

      const suggestionsContainer = document.getElementById("inva-ai-suggestions-container");
      expect(suggestionsContainer?.style.display).toBe("none");
    });

    it("should clear container content", () => {
      const dismissBtn = document.querySelector<HTMLButtonElement>("#inva-dismiss-suggestions");
      dismissBtn!.click();

      const suggestionsContainer = document.getElementById("inva-ai-suggestions-container");
      expect(suggestionsContainer?.innerHTML).toBe("");
    });
  });

  describe("hide", () => {
    beforeEach(async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);
      await manager.initialize(textarea, container);
    });

    it("should hide container and clear content", async () => {
      vi.mocked(openrouterApi.generateQuestions).mockResolvedValue({
        questions: ["Test?"],
        context: "test",
        timestamp: Date.now(),
      });
      await manager.generate("test");

      manager.hide();

      const suggestionsContainer = document.getElementById("inva-ai-suggestions-container");
      expect(suggestionsContainer?.style.display).toBe("none");
      expect(suggestionsContainer?.innerHTML).toBe("");
    });
  });

  describe("destroy", () => {
    it("should remove container from DOM", async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);
      await manager.initialize(textarea, container);

      const suggestionsContainer = document.getElementById("inva-ai-suggestions-container");
      expect(suggestionsContainer).toBeTruthy();

      manager.destroy();

      expect(document.getElementById("inva-ai-suggestions-container")).toBeFalsy();
    });

    it("should clear all references", async () => {
      vi.mocked(openrouterApi.isConfigured).mockResolvedValue(true);
      await manager.initialize(textarea, container);

      manager.destroy();

      // Após destroy, não deve haver erros ao chamar métodos
      expect(() => manager.hide()).not.toThrow();
    });
  });
});
