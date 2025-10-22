/**
 * Tipos centralizados da aplicação
 */

export type StorageClearReason = "button-click" | "form-submit" | "manual-clear" | "after-load";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogComponent = "background" | "content" | "popup" | string;

export interface LogEntry {
  ts: number;
  level: LogLevel;
  component: LogComponent;
  message: string;
  data?: unknown;
}
