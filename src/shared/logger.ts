/// <reference types="chrome" />

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  ts: number;
  level: LogLevel;
  component: "background" | "content" | "popup" | string;
  message: string;
  data?: unknown;
};

const DEBUG_KEY = "inva_debug_enabled" as const;
const LOGS_KEY = "inva_logs" as const;
const MAX_LOGS = 200;

export const getDebugEnabled = async (): Promise<boolean> =>
  new Promise((resolve) => {
    chrome.storage.sync.get({ [DEBUG_KEY]: false }, (items) => {
      resolve(Boolean(items[DEBUG_KEY]));
    });
  });

export const setDebugEnabled = async (enabled: boolean): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [DEBUG_KEY]: enabled }, () => {
      const err = chrome.runtime.lastError;
      if (err) reject(err);
      else resolve();
    });
  });

export const getLogs = async (): Promise<LogEntry[]> =>
  new Promise((resolve) => {
    chrome.storage.local.get({ [LOGS_KEY]: [] as LogEntry[] }, (items) => {
      const list = Array.isArray(items[LOGS_KEY]) ? (items[LOGS_KEY] as LogEntry[]) : [];
      resolve(list);
    });
  });

export const clearLogs = async (): Promise<void> =>
  new Promise((resolve, reject) => {
    chrome.storage.local.set({ [LOGS_KEY]: [] }, () => {
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
    const pruned = current.slice(-MAX_LOGS);
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [LOGS_KEY]: pruned }, () => {
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
  async log(level: LogLevel, component: LogEntry["component"], message: string, data?: unknown) {
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
  debug(component: LogEntry["component"], message: string, data?: unknown) {
    return this.log("debug", component, message, data);
  },
  info(component: LogEntry["component"], message: string, data?: unknown) {
    return this.log("info", component, message, data);
  },
  warn(component: LogEntry["component"], message: string, data?: unknown) {
    return this.log("warn", component, message, data);
  },
  error(component: LogEntry["component"], message: string, data?: unknown) {
    return this.log("error", component, message, data);
  }
};

export const debugAPI = { getDebugEnabled, setDebugEnabled, getLogs, clearLogs };
