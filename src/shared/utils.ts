/// <reference types="chrome" />

import { DEFAULT_HIGHLIGHT_COLOR } from "./constants";

export const getStoredHighlightColor = async (): Promise<string> => {
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

    return result;
  } catch (error) {
    console.warn("Falha ao carregar a cor de destaque. Usando padrão.", error);
    return DEFAULT_HIGHLIGHT_COLOR;
  }
};

export const saveHighlightColor = async (color: string): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.set({ highlightColor: color }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

export const getActiveTab = (): Promise<chrome.tabs.Tab | undefined> =>
  new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });

// URL de criação de chamado
const CREATE_TICKET_URL_KEY = "createTicketUrl" as const;

export const getStoredCreateTicketUrl = async (): Promise<string | undefined> =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.get({ [CREATE_TICKET_URL_KEY]: "" }, (items) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
        return;
      }
      const value = items[CREATE_TICKET_URL_KEY];
      resolve(typeof value === "string" && value.trim() ? value.trim() : undefined);
    });
  });

export const saveCreateTicketUrl = async (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [CREATE_TICKET_URL_KEY]: url }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
