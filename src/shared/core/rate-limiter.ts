/**
 * Sistema de rate limiting para operações de storage
 * Previne excesso de chamadas ao Chrome Storage API
 * @module rate-limiter
 */

/**
 * Configuração do rate limiter
 * @interface RateLimiterConfig
 * @property {number} maxCalls - Número máximo de chamadas permitidas
 * @property {number} windowMs - Janela de tempo em milissegundos
 * @property {number} [minInterval] - Intervalo mínimo entre chamadas (ms)
 */
interface RateLimiterConfig {
  maxCalls: number;
  windowMs: number;
  minInterval?: number;
}

/**
 * Informações sobre tentativa de chamada
 * @interface CallAttempt
 * @property {number} timestamp - Timestamp da chamada
 * @property {boolean} allowed - Se a chamada foi permitida
 */
interface CallAttempt {
  timestamp: number;
  allowed: boolean;
}

/**
 * Rate limiter genérico com sliding window
 * Controla frequência de operações para evitar throttling
 * @class RateLimiter
 */
export class RateLimiter {
  /**
   * Configuração do rate limiter
   * @private
   * @type {RateLimiterConfig}
   */
  private config: RateLimiterConfig;

  /**
   * Histórico de chamadas na janela atual
   * @private
   * @type {CallAttempt[]}
   */
  private callHistory: CallAttempt[] = [];

  /**
   * Timestamp da última chamada bem-sucedida
   * @private
   * @type {number}
   */
  private lastCallTime: number = 0;

  /**
   * Cria uma nova instância de RateLimiter
   * @param {RateLimiterConfig} config - Configuração do rate limiter
   * @example
   * const limiter = new RateLimiter({
   *   maxCalls: 10,
   *   windowMs: 1000,
   *   minInterval: 100
   * });
   */
  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  /**
   * Remove chamadas antigas fora da janela de tempo
   * @private
   * @returns {void}
   */
  private cleanupOldCalls(): void {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;
    this.callHistory = this.callHistory.filter(call => call.timestamp > cutoff);
  }

  /**
   * Verifica se uma chamada pode ser feita agora
   * @returns {boolean} True se a chamada pode ser feita
   * @example
   * if (limiter.canMakeCall()) {
   *   await doOperation();
   * }
   */
  canMakeCall(): boolean {
    this.cleanupOldCalls();
    
    const now = Date.now();
    const allowedCalls = this.callHistory.filter(call => call.allowed).length;

    // Verifica limite de chamadas na janela
    if (allowedCalls >= this.config.maxCalls) {
      return false;
    }

    // Verifica intervalo mínimo entre chamadas
    if (this.config.minInterval) {
      const timeSinceLastCall = now - this.lastCallTime;
      if (timeSinceLastCall < this.config.minInterval) {
        return false;
      }
    }

    return true;
  }

  /**
   * Registra uma tentativa de chamada
   * @param {boolean} allowed - Se a chamada foi permitida
   * @returns {void}
   */
  recordCall(allowed: boolean): void {
    const now = Date.now();
    this.callHistory.push({ timestamp: now, allowed });
    
    if (allowed) {
      this.lastCallTime = now;
    }
  }

  /**
   * Executa uma função com rate limiting
   * @template T
   * @async
   * @param {() => Promise<T>} fn - Função a ser executada
   * @returns {Promise<T>} Resultado da função
   * @throws {Error} Se o rate limit for excedido
   * @example
   * const result = await limiter.execute(async () => {
   *   return await chrome.storage.local.set({ key: 'value' });
   * });
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canMakeCall()) {
      this.recordCall(false);
      throw new Error("Rate limit exceeded. Too many storage operations.");
    }

    this.recordCall(true);
    return await fn();
  }

  /**
   * Reseta o rate limiter
   * Limpa todo o histórico de chamadas
   * @returns {void}
   */
  reset(): void {
    this.callHistory = [];
    this.lastCallTime = 0;
  }

  /**
   * Retorna estatísticas do rate limiter
   * @returns {Object} Estatísticas de uso
   * @property {number} totalCalls - Total de tentativas de chamadas
   * @property {number} allowedCalls - Chamadas permitidas
   * @property {number} blockedCalls - Chamadas bloqueadas
   * @property {number} remainingCalls - Chamadas restantes na janela
   */
  getStats(): { totalCalls: number; allowedCalls: number; blockedCalls: number; remainingCalls: number } {
    this.cleanupOldCalls();
    
    const allowedCalls = this.callHistory.filter(call => call.allowed).length;
    const blockedCalls = this.callHistory.filter(call => !call.allowed).length;
    
    return {
      totalCalls: this.callHistory.length,
      allowedCalls,
      blockedCalls,
      remainingCalls: Math.max(0, this.config.maxCalls - allowedCalls)
    };
  }
}

/**
 * Configurações padrão para diferentes tipos de operações
 */
export const RATE_LIMIT_CONFIGS = {
  /**
   * Limite para operações de escrita no storage
   * 60 operações por minuto, mínimo 10ms entre chamadas
   */
  STORAGE_WRITE: {
    maxCalls: 60,
    windowMs: 60000,
    minInterval: 10
  },
  
  /**
   * Limite para operações de leitura no storage
   * 120 operações por minuto, mínimo 5ms entre chamadas
   */
  STORAGE_READ: {
    maxCalls: 120,
    windowMs: 60000,
    minInterval: 5
  },
  
  /**
   * Limite para operações de remoção no storage
   * 30 operações por minuto, mínimo 10ms entre chamadas
   */
  STORAGE_DELETE: {
    maxCalls: 30,
    windowMs: 60000,
    minInterval: 10
  }
} as const;
