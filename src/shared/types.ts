/**
 * Tipos centralizados da aplicação
 * @module types
 */

/**
 * Razões para limpeza de comentário do storage
 * @typedef {("button-click"|"form-submit"|"manual-clear"|"after-load")} StorageClearReason
 */
export type StorageClearReason = "button-click" | "form-submit" | "manual-clear" | "after-load";

/**
 * Níveis de log disponíveis
 * @typedef {("debug"|"info"|"warn"|"error")} LogLevel
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Componentes que podem gerar logs
 * @typedef {("background"|"content"|"popup"|string)} LogComponent
 */
export type LogComponent = "background" | "content" | "popup" | string;

/**
 * Estrutura de uma entrada de log
 * @interface LogEntry
 * @property {number} ts - Timestamp em milissegundos
 * @property {LogLevel} level - Nível do log
 * @property {LogComponent} component - Componente que gerou o log
 * @property {string} message - Mensagem do log
 * @property {unknown} [data] - Dados adicionais opcionais
 */
export interface LogEntry {
  ts: number;
  level: LogLevel;
  component: LogComponent;
  message: string;
  data?: unknown;
}
