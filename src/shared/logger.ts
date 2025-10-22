/// <reference types="chrome" />

/**
 * Sistema de logging da extensão com suporte a debug mode e rate limiting
 * @module logger
 */

import { STORAGE_KEYS, LIMITS } from "./constants";
import type { LogEntry, LogLevel, LogComponent } from "./types";
import { RateLimiter, RATE_LIMIT_CONFIGS } from "./rate-limiter";

export type { LogEntry, LogLevel, LogComponent };

/**
 * Rate limiters para operações de storage do logger
 * @private
 */
const loggerRateLimiters = {
  read: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_READ),
  write: new RateLimiter(RATE_LIMIT_CONFIGS.STORAGE_WRITE)
};

/**
 * Verifica se o modo debug está habilitado (com rate limiting)
 * @async
 * @function getDebugEnabled
 * @returns {Promise<boolean>} True se debug está habilitado
 */
export const getDebugEnabled = async (): Promise<boolean> => {
  try {
    return await loggerRateLimiters.read.execute(async () => {
      return new Promise<boolean>((resolve) => {
        chrome.storage.sync.get({ [STORAGE_KEYS.DEBUG_ENABLED]: false }, (items) => {
          resolve(Boolean(items[STORAGE_KEYS.DEBUG_ENABLED]));
        });
      });
    });
  } catch {
    // Se rate limit excedido, retorna false (modo seguro)
    return false;
  }
};

/**
 * Habilita ou desabilita o modo debug (com rate limiting)
 * @async
 * @function setDebugEnabled
 * @param {boolean} enabled - True para habilitar, false para desabilitar
 * @returns {Promise<void>}
 * @throws {Error} Erro de escrita no Chrome Storage ou rate limit excedido
 */
export const setDebugEnabled = async (enabled: boolean): Promise<void> =>
  loggerRateLimiters.write.execute(async () => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.sync.set({ [STORAGE_KEYS.DEBUG_ENABLED]: enabled }, () => {
        const err = chrome.runtime.lastError;
        if (err) reject(err);
        else resolve();
      });
    });
  });

/**
 * Recupera todos os logs armazenados (com rate limiting)
 * @async
 * @function getLogs
 * @returns {Promise<LogEntry[]>} Array de entradas de log
 */
export const getLogs = async (): Promise<LogEntry[]> => {
  try {
    return await loggerRateLimiters.read.execute(async () => {
      return new Promise<LogEntry[]>((resolve) => {
        chrome.storage.local.get({ [STORAGE_KEYS.LOGS]: [] as LogEntry[] }, (items) => {
          const list = Array.isArray(items[STORAGE_KEYS.LOGS]) ? (items[STORAGE_KEYS.LOGS] as LogEntry[]) : [];
          resolve(list);
        });
      });
    });
  } catch {
    // Se rate limit excedido, retorna array vazio
    return [];
  }
};

/**
 * Limpa todos os logs armazenados (com rate limiting)
 * @async
 * @function clearLogs
 * @returns {Promise<void>}
 * @throws {Error} Erro de escrita no Chrome Storage ou rate limit excedido
 */
export const clearLogs = async (): Promise<void> =>
  loggerRateLimiters.write.execute(async () => {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: [] }, () => {
        const err = chrome.runtime.lastError;
        if (err) reject(err);
        else resolve();
      });
    });
  });

/**
 * Formata uma entrada de log para exibição no console com cores
 * @private
 * @function formatForConsole
 * @param {LogEntry} entry - Entrada de log a ser formatada
 * @returns {[string, ...unknown[]]} Array com string formatada e argumentos
 */
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

/**
 * Adiciona uma entrada de log ao storage (com rate limiting)
 * Mantém apenas os últimos MAX_LOGS registros
 * @private
 * @async
 * @function pushLog
 * @param {LogEntry} entry - Entrada de log a ser armazenada
 * @returns {Promise<void>}
 */
const pushLog = async (entry: LogEntry): Promise<void> => {
  try {
    const current = await getLogs();
    current.push(entry);
    const pruned = current.slice(-LIMITS.MAX_LOGS);
    
    await loggerRateLimiters.write.execute(async () => {
      return new Promise<void>((resolve, reject) => {
        chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: pruned }, () => {
          const err = chrome.runtime.lastError;
          if (err) reject(err);
          else resolve();
        });
      });
    });
  } catch {
    // Ignora silenciosamente erros de rate limit para não quebrar o logger
  }
};

/**
 * Sistema de logging centralizado da extensão
 * @namespace logger
 * @property {Function} log - Registra log genérico
 * @property {Function} debug - Registra log de debug
 * @property {Function} info - Registra log informativo
 * @property {Function} warn - Registra log de aviso
 * @property {Function} error - Registra log de erro
 */
export const logger = {
  /**
   * Registra um log genérico
   * @async
   * @param {LogLevel} level - Nível do log
   * @param {LogComponent} component - Componente que gerou o log
   * @param {string} message - Mensagem do log
   * @param {unknown} [data] - Dados adicionais opcionais
   * @returns {Promise<void>}
   */
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
  /**
   * Registra um log de debug
   * @param {LogComponent} component - Componente que gerou o log
   * @param {string} message - Mensagem do log
   * @param {unknown} [data] - Dados adicionais opcionais
   * @returns {Promise<void>}
   */
  debug(component: LogComponent, message: string, data?: unknown) {
    return this.log("debug", component, message, data);
  },
  /**
   * Registra um log informativo
   * @param {LogComponent} component - Componente que gerou o log
   * @param {string} message - Mensagem do log
   * @param {unknown} [data] - Dados adicionais opcionais
   * @returns {Promise<void>}
   */
  info(component: LogComponent, message: string, data?: unknown) {
    return this.log("info", component, message, data);
  },
  /**
   * Registra um log de aviso
   * @param {LogComponent} component - Componente que gerou o log
   * @param {string} message - Mensagem do log
   * @param {unknown} [data] - Dados adicionais opcionais
   * @returns {Promise<void>}
   */
  warn(component: LogComponent, message: string, data?: unknown) {
    return this.log("warn", component, message, data);
  },
  /**
   * Registra um log de erro
   * @param {LogComponent} component - Componente que gerou o log
   * @param {string} message - Mensagem do log
   * @param {unknown} [data] - Dados adicionais opcionais
   * @returns {Promise<void>}
   */
  error(component: LogComponent, message: string, data?: unknown) {
    return this.log("error", component, message, data);
  }
};

/**
 * API de debug exposta para uso externo
 * @constant
 * @type {Object}
 * @property {Function} getDebugEnabled - Verifica se debug está habilitado
 * @property {Function} setDebugEnabled - Habilita/desabilita debug
 * @property {Function} getLogs - Recupera logs armazenados
 * @property {Function} clearLogs - Limpa logs armazenados
 */
export const debugAPI = { getDebugEnabled, setDebugEnabled, getLogs, clearLogs };
