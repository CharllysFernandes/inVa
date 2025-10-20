/// <reference types="chrome" />

import { DEFAULT_HIGHLIGHT_COLOR } from "./constants";
import { logger } from "./logger";

export const getStoredHighlightColor = async (): Promise<string> => {
  void logger.debug("shared", "Reading stored highlight color");
  try {
    const result = await new Promise<string>((resolve, reject) => {
      chrome.storage.sync.get({ highlightColor: DEFAULT_HIGHLIGHT_COLOR }, (items) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(error);
          return;
        }

        const colorValue = typeof items.highlightColor === "string" ? items.highlightColor : DEFAULT_HIGHLIGHT_COLOR;
        resolve(colorValue);
      });
    });

    void logger.debug("shared", "Resolved highlight color", { color: result });
    return result;
  } catch (error) {
    void logger.warn("shared", "Failed to load highlight color, fallback to default", { error: String(error) });
    return DEFAULT_HIGHLIGHT_COLOR;
  }
};

export const saveHighlightColor = async (color: string): Promise<void> => {
  void logger.debug("shared", "Persisting highlight color", { color });
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ highlightColor: color }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        void logger.error("shared", "Failed to persist highlight color", { error: String(error) });
        reject(error);
        return;
      }

      void logger.info("shared", "Highlight color saved", { color });
      resolve();
    });
  });
};

export const getActiveTab = (): Promise<chrome.tabs.Tab | undefined> => {
  void logger.debug("shared", "Querying active tab");
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      void logger.debug("shared", "Active tab resolved", { tabId: tab?.id ?? null });
      resolve(tab);
    });
  });
};

// URL de criação de chamado
const CREATE_TICKET_URL_KEY = "createTicketUrl" as const;

export const getStoredCreateTicketUrl = async (): Promise<string | undefined> => {
  void logger.debug("shared", "Reading stored ticket URL");
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({ [CREATE_TICKET_URL_KEY]: "" }, (items) => {
      const error = chrome.runtime.lastError;
      if (error) {
        void logger.error("shared", "Failed to read ticket URL", { error: String(error) });
        reject(error);
        return;
      }
      const value = items[CREATE_TICKET_URL_KEY];
      void logger.debug("shared", "Resolved ticket URL", { value });
      resolve(typeof value === "string" && value.trim() ? value.trim() : undefined);
    });
  });
};

export const saveCreateTicketUrl = async (url: string): Promise<void> => {
  void logger.debug("shared", "Persisting ticket URL", { url });
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [CREATE_TICKET_URL_KEY]: url }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        void logger.error("shared", "Failed to persist ticket URL", { error: String(error) });
        reject(error);
        return;
      }
      void logger.info("shared", "Ticket URL saved", { url });
      resolve();
    });
  });
};
