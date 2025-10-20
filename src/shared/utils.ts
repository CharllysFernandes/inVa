/// <reference types="chrome" />

import { logger } from "./logger";

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
