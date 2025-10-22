/**
 * Testes para utils.ts
 * Funções utilitárias para gerenciamento de configurações
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStoredCreateTicketUrl, saveCreateTicketUrl } from "./utils";
import { STORAGE_KEYS } from "./constants";

describe("utils", () => {
  beforeEach(async () => {
    // Limpar o storage antes de cada teste
    vi.clearAllMocks();
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
  });

  describe("getStoredCreateTicketUrl()", () => {
    it("should return stored URL when it exists", async () => {
      const testUrl = "https://example.com/create-ticket";
      
      // Simular URL armazenada
      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: testUrl });

      const result = await getStoredCreateTicketUrl();

      expect(result).toBe(testUrl);
    });

    it("should return undefined when no URL is stored", async () => {
      // Storage vazio
      const result = await getStoredCreateTicketUrl();

      expect(result).toBeUndefined();
    });

    it("should return undefined when stored value is empty string", async () => {
      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: "" });

      const result = await getStoredCreateTicketUrl();

      expect(result).toBeUndefined();
    });

    it("should trim whitespace from stored URL", async () => {
      const urlWithSpaces = "  https://example.com/create-ticket  ";
      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: urlWithSpaces });

      const result = await getStoredCreateTicketUrl();

      expect(result).toBe("https://example.com/create-ticket");
    });

    it("should return undefined for whitespace-only string", async () => {
      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: "   " });

      const result = await getStoredCreateTicketUrl();

      expect(result).toBeUndefined();
    });

    it("should handle URLs with query parameters", async () => {
      const urlWithParams = "https://example.com/create?project=123&type=bug";
      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: urlWithParams });

      const result = await getStoredCreateTicketUrl();

      expect(result).toBe(urlWithParams);
    });

    it("should handle URLs with special characters", async () => {
      const specialUrl = "https://example.com/ticket?desc=test%20value&priority=high";
      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: specialUrl });

      const result = await getStoredCreateTicketUrl();

      expect(result).toBe(specialUrl);
    });

    it("should reject when chrome.runtime.lastError is set", async () => {
      // Simular erro do Chrome
      const mockError = new Error("Storage read failed");
      vi.mocked(chrome.runtime).lastError = mockError as chrome.runtime.LastError;

      await expect(getStoredCreateTicketUrl()).rejects.toThrow();

      // Limpar erro
      vi.mocked(chrome.runtime).lastError = undefined;
    });

    it("should return undefined for non-string values", async () => {
      // Armazenar valor não-string (edge case)
      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: 123 as any });

      const result = await getStoredCreateTicketUrl();

      expect(result).toBeUndefined();
    });

    it("should handle concurrent reads correctly", async () => {
      const testUrl = "https://example.com/concurrent";
      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: testUrl });

      // Múltiplas leituras simultâneas
      const results = await Promise.all([
        getStoredCreateTicketUrl(),
        getStoredCreateTicketUrl(),
        getStoredCreateTicketUrl()
      ]);

      expect(results).toEqual([testUrl, testUrl, testUrl]);
    });
  });

  describe("saveCreateTicketUrl()", () => {
    it("should save URL to storage", async () => {
      const testUrl = "https://example.com/save-test";

      await saveCreateTicketUrl(testUrl);

      // Verificar se foi salvo
      const result = await chrome.storage.sync.get(STORAGE_KEYS.CREATE_TICKET_URL);
      expect(result[STORAGE_KEYS.CREATE_TICKET_URL]).toBe(testUrl);
    });

    it("should overwrite existing URL", async () => {
      const oldUrl = "https://old.example.com";
      const newUrl = "https://new.example.com";

      await chrome.storage.sync.set({ [STORAGE_KEYS.CREATE_TICKET_URL]: oldUrl });
      await saveCreateTicketUrl(newUrl);

      const result = await chrome.storage.sync.get(STORAGE_KEYS.CREATE_TICKET_URL);
      expect(result[STORAGE_KEYS.CREATE_TICKET_URL]).toBe(newUrl);
    });

    it("should save empty string", async () => {
      await saveCreateTicketUrl("");

      const result = await chrome.storage.sync.get(STORAGE_KEYS.CREATE_TICKET_URL);
      expect(result[STORAGE_KEYS.CREATE_TICKET_URL]).toBe("");
    });

    it("should save URL with whitespace (not trim)", async () => {
      const urlWithSpaces = "  https://example.com  ";

      await saveCreateTicketUrl(urlWithSpaces);

      // saveCreateTicketUrl não faz trim, apenas salva
      const result = await chrome.storage.sync.get(STORAGE_KEYS.CREATE_TICKET_URL);
      expect(result[STORAGE_KEYS.CREATE_TICKET_URL]).toBe(urlWithSpaces);
    });

    it("should save URL with query parameters", async () => {
      const complexUrl = "https://example.com/create?p=1&t=bug&assignee=john";

      await saveCreateTicketUrl(complexUrl);

      const result = await chrome.storage.sync.get(STORAGE_KEYS.CREATE_TICKET_URL);
      expect(result[STORAGE_KEYS.CREATE_TICKET_URL]).toBe(complexUrl);
    });

    it("should save URL with special characters", async () => {
      const specialUrl = "https://example.com/票?desc=测试";

      await saveCreateTicketUrl(specialUrl);

      const result = await chrome.storage.sync.get(STORAGE_KEYS.CREATE_TICKET_URL);
      expect(result[STORAGE_KEYS.CREATE_TICKET_URL]).toBe(specialUrl);
    });

    it("should save very long URL", async () => {
      const longUrl = "https://example.com/ticket?" + "param=value&".repeat(100);

      await saveCreateTicketUrl(longUrl);

      const result = await chrome.storage.sync.get(STORAGE_KEYS.CREATE_TICKET_URL);
      expect(result[STORAGE_KEYS.CREATE_TICKET_URL]).toBe(longUrl);
    });

    it("should reject when chrome.runtime.lastError is set", async () => {
      const mockError = new Error("Storage write failed");
      
      // Simular erro ao salvar
      const setMock = vi.mocked(chrome.storage.sync.set);
      setMock.mockImplementationOnce((items: any, callback?: () => void) => {
        vi.mocked(chrome.runtime).lastError = mockError as chrome.runtime.LastError;
        if (callback) callback();
        vi.mocked(chrome.runtime).lastError = undefined;
      });

      await expect(saveCreateTicketUrl("test")).rejects.toThrow();
    });

    it("should handle concurrent writes correctly", async () => {
      const urls = [
        "https://example1.com",
        "https://example2.com",
        "https://example3.com"
      ];

      // Múltiplas gravações simultâneas
      await Promise.all(urls.map(url => saveCreateTicketUrl(url)));

      // A última gravação deve prevalecer (mas qual é indeterminado em concurrent)
      const result = await chrome.storage.sync.get(STORAGE_KEYS.CREATE_TICKET_URL);
      expect(urls).toContain(result[STORAGE_KEYS.CREATE_TICKET_URL]);
    });

    it("should resolve promise after successful save", async () => {
      const testUrl = "https://example.com/promise-test";

      const result = await saveCreateTicketUrl(testUrl);

      // Deve retornar undefined (void)
      expect(result).toBeUndefined();
    });
  });

  describe("Integration: save and read", () => {
    it("should save and retrieve the same URL", async () => {
      const testUrl = "https://example.com/integration-test";

      await saveCreateTicketUrl(testUrl);
      const retrieved = await getStoredCreateTicketUrl();

      expect(retrieved).toBe(testUrl);
    });

    it("should handle multiple save-read cycles", async () => {
      const urls = [
        "https://url1.com",
        "https://url2.com",
        "https://url3.com"
      ];

      for (const url of urls) {
        await saveCreateTicketUrl(url);
        const retrieved = await getStoredCreateTicketUrl();
        expect(retrieved).toBe(url);
      }
    });

    it("should clear URL by saving empty string then reading", async () => {
      await saveCreateTicketUrl("https://example.com/test");
      await saveCreateTicketUrl("");
      
      const retrieved = await getStoredCreateTicketUrl();

      expect(retrieved).toBeUndefined();
    });

    it("should handle whitespace trimming on read after untrimmed save", async () => {
      const urlWithSpaces = "  https://example.com/spaces  ";
      
      await saveCreateTicketUrl(urlWithSpaces);
      const retrieved = await getStoredCreateTicketUrl();

      // getStoredCreateTicketUrl faz trim
      expect(retrieved).toBe("https://example.com/spaces");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined storage key gracefully", async () => {
      // Testar que as funções não quebram mesmo sem configuração prévia
      const result = await getStoredCreateTicketUrl();
      expect(result).toBeUndefined();
    });

    it("should handle storage quota exceeded (simulation)", async () => {
      // Em um cenário real, o Chrome limitaria o storage
      // Aqui apenas verificamos que a função lida com erros
      const hugeUrl = "https://example.com/" + "x".repeat(1000000);
      
      // Deve funcionar no mock (não há limite real)
      await expect(saveCreateTicketUrl(hugeUrl)).resolves.not.toThrow();
    });

    it("should work with URLs containing fragments", async () => {
      const urlWithFragment = "https://example.com/page#section";

      await saveCreateTicketUrl(urlWithFragment);
      const retrieved = await getStoredCreateTicketUrl();

      expect(retrieved).toBe(urlWithFragment);
    });

    it("should work with relative URLs (edge case)", async () => {
      const relativeUrl = "/create-ticket";

      await saveCreateTicketUrl(relativeUrl);
      const retrieved = await getStoredCreateTicketUrl();

      expect(retrieved).toBe(relativeUrl);
    });

    it("should work with protocol-relative URLs", async () => {
      const protocolRelative = "//example.com/create-ticket";

      await saveCreateTicketUrl(protocolRelative);
      const retrieved = await getStoredCreateTicketUrl();

      expect(retrieved).toBe(protocolRelative);
    });
  });
});
