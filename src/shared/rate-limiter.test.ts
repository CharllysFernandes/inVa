import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter, RATE_LIMIT_CONFIGS } from "./rate-limiter";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe("constructor", () => {
    it("should create a rate limiter with config", () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      expect(limiter).toBeDefined();
    });
  });

  describe("canMakeCall", () => {
    it("should allow calls under the limit", () => {
      const limiter = new RateLimiter({ maxCalls: 3, windowMs: 1000 });
      
      expect(limiter.canMakeCall()).toBe(true);
      limiter.recordCall(true);
      
      expect(limiter.canMakeCall()).toBe(true);
      limiter.recordCall(true);
      
      expect(limiter.canMakeCall()).toBe(true);
    });

    it("should block calls over the limit", () => {
      const limiter = new RateLimiter({ maxCalls: 2, windowMs: 1000 });
      
      limiter.recordCall(true);
      limiter.recordCall(true);
      
      expect(limiter.canMakeCall()).toBe(false);
    });

    it("should allow calls after window expires", () => {
      const limiter = new RateLimiter({ maxCalls: 2, windowMs: 1000 });
      
      limiter.recordCall(true);
      limiter.recordCall(true);
      expect(limiter.canMakeCall()).toBe(false);
      
      // Avança tempo além da janela
      vi.advanceTimersByTime(1001);
      
      expect(limiter.canMakeCall()).toBe(true);
    });

    it("should respect minInterval between calls", () => {
      const limiter = new RateLimiter({ 
        maxCalls: 10, 
        windowMs: 1000,
        minInterval: 100
      });
      
      limiter.recordCall(true);
      
      // Imediatamente após - deve bloquear
      expect(limiter.canMakeCall()).toBe(false);
      
      // Avança 50ms - ainda bloqueado
      vi.advanceTimersByTime(50);
      expect(limiter.canMakeCall()).toBe(false);
      
      // Avança mais 51ms (total 101ms) - deve permitir
      vi.advanceTimersByTime(51);
      expect(limiter.canMakeCall()).toBe(true);
    });
  });

  describe("recordCall", () => {
    it("should record allowed calls", () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      
      limiter.recordCall(true);
      const stats = limiter.getStats();
      
      expect(stats.allowedCalls).toBe(1);
      expect(stats.totalCalls).toBe(1);
    });

    it("should record blocked calls", () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      
      limiter.recordCall(false);
      const stats = limiter.getStats();
      
      expect(stats.blockedCalls).toBe(1);
      expect(stats.totalCalls).toBe(1);
    });

    it("should track multiple calls", () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      
      limiter.recordCall(true);
      limiter.recordCall(true);
      limiter.recordCall(false);
      
      const stats = limiter.getStats();
      expect(stats.allowedCalls).toBe(2);
      expect(stats.blockedCalls).toBe(1);
      expect(stats.totalCalls).toBe(3);
    });
  });

  describe("execute", () => {
    it("should execute function if under limit", async () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      const mockFn = vi.fn(async () => "success");
      
      const result = await limiter.execute(mockFn);
      
      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should throw error if over limit", async () => {
      const limiter = new RateLimiter({ maxCalls: 1, windowMs: 1000 });
      const mockFn = vi.fn(async () => "success");
      
      await limiter.execute(mockFn);
      
      await expect(limiter.execute(mockFn)).rejects.toThrow("Rate limit exceeded");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should return function result", async () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      const mockFn = vi.fn(async () => ({ data: "test" }));
      
      const result = await limiter.execute(mockFn);
      
      expect(result).toEqual({ data: "test" });
    });

    it("should propagate function errors", async () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      const mockFn = vi.fn(async () => {
        throw new Error("Function failed");
      });
      
      await expect(limiter.execute(mockFn)).rejects.toThrow("Function failed");
    });
  });

  describe("reset", () => {
    it("should clear all history", () => {
      const limiter = new RateLimiter({ maxCalls: 2, windowMs: 1000 });
      
      limiter.recordCall(true);
      limiter.recordCall(true);
      expect(limiter.canMakeCall()).toBe(false);
      
      limiter.reset();
      expect(limiter.canMakeCall()).toBe(true);
    });

    it("should reset stats", () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      
      limiter.recordCall(true);
      limiter.recordCall(false);
      
      limiter.reset();
      const stats = limiter.getStats();
      
      expect(stats.totalCalls).toBe(0);
      expect(stats.allowedCalls).toBe(0);
      expect(stats.blockedCalls).toBe(0);
    });
  });

  describe("getStats", () => {
    it("should return accurate statistics", () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      
      limiter.recordCall(true);
      limiter.recordCall(true);
      limiter.recordCall(false);
      
      const stats = limiter.getStats();
      
      expect(stats.totalCalls).toBe(3);
      expect(stats.allowedCalls).toBe(2);
      expect(stats.blockedCalls).toBe(1);
      expect(stats.remainingCalls).toBe(3);
    });

    it("should exclude expired calls", () => {
      const limiter = new RateLimiter({ maxCalls: 5, windowMs: 1000 });
      
      limiter.recordCall(true);
      limiter.recordCall(true);
      
      vi.advanceTimersByTime(1001);
      
      const stats = limiter.getStats();
      expect(stats.totalCalls).toBe(0);
      expect(stats.remainingCalls).toBe(5);
    });
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("should have STORAGE_WRITE config", () => {
      expect(RATE_LIMIT_CONFIGS.STORAGE_WRITE).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.STORAGE_WRITE.maxCalls).toBe(60);
      expect(RATE_LIMIT_CONFIGS.STORAGE_WRITE.windowMs).toBe(60000);
    });

    it("should have STORAGE_READ config", () => {
      expect(RATE_LIMIT_CONFIGS.STORAGE_READ).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.STORAGE_READ.maxCalls).toBe(120);
    });

    it("should have STORAGE_DELETE config", () => {
      expect(RATE_LIMIT_CONFIGS.STORAGE_DELETE).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.STORAGE_DELETE.maxCalls).toBe(30);
    });
  });

  describe("sliding window behavior", () => {
    it("should gradually allow new calls as window slides", () => {
      const limiter = new RateLimiter({ maxCalls: 2, windowMs: 1000 });
      
      // T=0: 2 chamadas
      limiter.recordCall(true);
      vi.advanceTimersByTime(100);
      limiter.recordCall(true);
      
      expect(limiter.canMakeCall()).toBe(false);
      
      // T=600: primeira chamada ainda válida
      vi.advanceTimersByTime(500);
      expect(limiter.canMakeCall()).toBe(false);
      
      // T=1001: primeira chamada expirou
      vi.advanceTimersByTime(401);
      expect(limiter.canMakeCall()).toBe(true);
      
      limiter.recordCall(true);
      expect(limiter.canMakeCall()).toBe(false);
      
      // T=1101: segunda chamada original expirou
      vi.advanceTimersByTime(100);
      expect(limiter.canMakeCall()).toBe(true);
    });
  });
});
