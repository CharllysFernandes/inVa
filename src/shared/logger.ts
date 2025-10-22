/// <reference types="chrome" />

import { STORAGE_KEYS, LIMITS } from "./constants";
import type { LogEntry, LogLevel, LogComponent } from "./types";

export type { LogEntry, LogLevel, LogComponent };

export const getDebugEnabled = async (): Promise<boolean> =>
  new Promise((resolve) => {
    chrome.storage.sync.get({ [STORAGE_KEYS.DEBUG_ENABLED]: false }, (items) => {
      resolve(Boolean(items[STORAGE_KEYS.DEBUG_ENABLED]));
    });
  });

export const setDebugEnabled = async (enabled: boolean): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.DEBUG_ENABLED]: enabled }, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });

export const getLogs = async (): Promise<LogEntry[]> =>
  new Promise((resolve) => {
    chrome.storage.local.get({ [STORAGE_KEYS.LOGS]: [] as LogEntry[] }, (items) => {
      const list = Array.isArray(items[STORAGE_KEYS.LOGS]) ? (items[STORAGE_KEYS.LOGS] as LogEntry[]) : [];
      resolve(list);
    });
  });

export const clearLogs = async (): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: [] }, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });

const formatForConsole = (entry: LogEntry): [string, ...unknown[]] => {
  const dt = new Date(entry.ts).toISOString();
  const prefix = `%c[inVa]%c ${dt} %c${entry.component.toUpperCase()}%c`;
  const levelColor = entry.level === "error" ? "#f44336" : entry.level === "warn" ? "#ff9800" : entry.level === "info" ? "#2196f3" : "#9e9e9e";
  const styles = [
    "color: #00bcd4; font-weight: bold;",
    "color: inherit;",
    `color: ${levelColor}; font-weight: bold;`,
    "color: inherit;"
  ];
  const args: unknown[] = [prefix, ...styles, entry.message];
  if (entry.data !== undefined) args.push(entry.data);
  return args as [string, ...unknown[]];
};

const pushLog = async (entry: LogEntry): Promise<void> => {
  try {
    const current = await getLogs();
    current.push(entry);
    const pruned = current.slice(-LIMITS.MAX_LOGS);
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: pruned }, () => {
        const err = chrome.runtime.lastError;
        if (err) reject(err);
        else resolve();
      });
    });
  } catch {
    // ignore
  }
};

export const logger = {
  async log(level: LogLevel, component: LogComponent, message: string, data?: unknown) {
    const entry: LogEntry = { ts: Date.now(), level, component, message, data };
    // Always console for error/warn; gate others behind debug flag
    const enabled = await getDebugEnabled();
    const shouldConsole = level === "error" || level === "warn" || enabled;
    if (shouldConsole) {
      const args = formatForConsole(entry);
      const fn = level === "error" ? console.error : level === "warn" ? console.warn : level === "info" ? console.info : console.debug;
      fn(...args);
    }
    // Persist only if debug enabled or level is error
    if (enabled || level === "error") {
      await pushLog(entry);
    }
  },
  debug(component: LogComponent, message: string, data?: unknown) {
    return this.log("debug", component, message, data);
  },
  info(component: LogComponent, message: string, data?: unknown) {
    return this.log("info", component, message, data);
  },
  warn(component: LogComponent, message: string, data?: unknown) {
    return this.log("warn", component, message, data);
  },
  error(component: LogComponent, message: string, data?: unknown) {
    return this.log("error", component, message, data);
  }
};

export const debugAPI = { getDebugEnabled, setDebugEnabled, getLogs, clearLogs };
