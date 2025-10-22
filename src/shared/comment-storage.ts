/// <reference types="chrome" />

/**
 * Gerenciador de armazenamento de comentários por URL com rate limiting
 * @module comment-storage
 */

import { STORAGE_KEYS } from "./constants";
import type { StorageClearReason } from "./types";
import { logger } from "./logger";
import { RateLimiter, RATE_LIMIT_CONFIGS } from "./rate-limiter";

/**
 * Gerenciador de armazenamento de comentários
 * Armazena comentários indexados por URL no Chrome Storage Local
 * Inclui rate limiting para prevenir throttling
 * @class CommentStorageManager
 */
class CommentStorageManager {
  /**
   * Mapa de razões de remoção pendentes para evitar loops de sincronização
   * @private
   * @type {Map<string, StorageClearReason>}
   */
  private removalReasons = new Map<string, StorageClearReason>();

  /**
   * Rate limiters para diferentes operações
   * @private
   */
  private rateLimiters = {
    read: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_READ),
    write: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_WRITE),
    delete: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_DELETE)
  };

  /**
   * Gera a chave de storage a partir da URL
   * @param {string} url - URL do ticket
   * @returns {string} Chave de storage formatada
   * @example
   * const key = commentStorage.getKey('https://example.com/ticket/123');
   * // Returns: "inva_comments:https://example.com/ticket/123"
   */
  getKey(url: string): string {
    return `${STORAGE_KEYS.COMMENT_PREFIX}${url}`;
  }

  /**
   * Carrega um comentário do storage com rate limiting
   * @async
   * @param {string} key - Chave de storage
   * @returns {Promise<string>} Comentário salvo ou string vazia
   * @throws {Error} Se o rate limit for excedido
   * @example
   * const comment = await commentStorage.load('inva_comments:url');
   */
  async load(key: string): Promise<string> {
    return this.rateLimiters.read.execute(async () => {
      return new Promise<string>((resolve) => {
        chrome.storage.local.get({ [key]: "" }, (items) => {
          resolve(String(items[key] ?? ""));
        });
      });
    });
  }

  /**
   * Salva um comentário no storage com rate limiting
   * @async
   * @param {string} key - Chave de storage
   * @param {string} value - Comentário a ser salvo
   * @returns {Promise<void>}
   * @throws {Error} Erro de escrita no Chrome Storage ou rate limit excedido
   * @example
   * await commentStorage.save('inva_comments:url', 'Meu comentário');
   */
  async save(key: string, value: string): Promise<void> {
    return this.rateLimiters.write.execute(async () => {
      return new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  /**
   * Remove um comentário do storage com rate limiting
   * Marca a remoção como pendente para evitar loops de sincronização
   * @async
   * @param {string} key - Chave de storage
   * @param {StorageClearReason} reason - Razão da remoção
   * @returns {Promise<void>}
   * @throws {Error} Erro de remoção no Chrome Storage ou rate limit excedido
   * @example
   * await commentStorage.remove('inva_comments:url', 'form-submit');
   */
  async remove(key: string, reason: StorageClearReason): Promise<void> {
    this.removalReasons.set(key, reason);
    
    return this.rateLimiters.delete.execute(async () => {
      return new Promise<void>((resolve, reject) => {
        chrome.storage.local.remove(key, () => {
          const err = chrome.runtime.lastError;
          this.removalReasons.delete(key);
          if (err) {
            void logger.error("content", "Failed to remove comment from storage", {
              error: String(err),
              reason,
              key
            });
            reject(err);
          } else {
            void logger.info("content", "Removed comment from storage", { key, reason });
            resolve();
          }
        });
      });
    });
  }

  /**
   * Verifica se há remoção pendente para uma chave
   * @param {string} key - Chave de storage
   * @returns {boolean} True se há remoção pendente
   */
  hasPendingRemoval(key: string): boolean {
    return this.removalReasons.has(key);
  }

  /**
   * Limpa a marcação de remoção pendente
   * @param {string} key - Chave de storage
   * @returns {void}
   */
  clearPendingRemoval(key: string): void {
    this.removalReasons.delete(key);
  }

  /**
   * Recupera a razão de uma remoção pendente
   * @param {string} key - Chave de storage
   * @returns {StorageClearReason|undefined} Razão da remoção ou undefined
   */
  getPendingRemovalReason(key: string): StorageClearReason | undefined {
    return this.removalReasons.get(key);
  }

  /**
   * Retorna estatísticas de uso do rate limiting
   * @returns {Object} Estatísticas de cada tipo de operação
   * @example
   * const stats = commentStorage.getRateLimitStats();
   * console.log('Write calls remaining:', stats.write.remainingCalls);
   */
  getRateLimitStats() {
    return {
      read: this.rateLimiters.read.getStats(),
      write: this.rateLimiters.write.getStats(),
      delete: this.rateLimiters.delete.getStats()
    };
  }

  /**
   * Reseta todos os rate limiters
   * Útil para testes ou após erros prolongados
   * @returns {void}
   * @example
   * commentStorage.resetRateLimiters();
   */
  resetRateLimiters(): void {
    this.rateLimiters.read.reset();
    this.rateLimiters.write.reset();
    this.rateLimiters.delete.reset();
    void logger.debug("storage", "Rate limiters reset");
  }
}

/**
 * Instância singleton do gerenciador de comentários
 * @constant
 * @type {CommentStorageManager}
 */
export const commentStorage = new CommentStorageManager();
