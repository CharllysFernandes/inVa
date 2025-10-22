/// <reference types="chrome" />

import { STORAGE_KEYS } from "./constants";
import type { StorageClearReason } from "./types";
import { logger } from "./logger";

/**
 * Gerenciador de armazenamento de comentários
 */
class CommentStorageManager {
  private removalReasons = new Map<string, StorageClearReason>();

  getKey(url: string): string {
    return `${STORAGE_KEYS.COMMENT_PREFIX}${url}`;
  }

  async load(key: string): Promise<string> {
    return new Promise((resolve) => {
      chrome.storage.local.get({ [key]: "" }, (items) => {
        resolve(String(items[key] ?? ""));
      });
    });
  }

  async save(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        const err = chrome.runtime.lastError;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async remove(key: string, reason: StorageClearReason): Promise<void> {
    this.removalReasons.set(key, reason);
    return new Promise((resolve, reject) => {
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
  }

  hasPendingRemoval(key: string): boolean {
    return this.removalReasons.has(key);
  }

  clearPendingRemoval(key: string): void {
    this.removalReasons.delete(key);
  }

  getPendingRemovalReason(key: string): StorageClearReason | undefined {
    return this.removalReasons.get(key);
  }
}

export const commentStorage = new CommentStorageManager();
