/**
 * Setup global para testes
 * Mock das APIs do Chrome para ambiente de testes
 */

import { vi } from 'vitest';

// Mock básico da API chrome.storage
const createStorageMock = () => {
  const data: Record<string, Record<string, unknown>> = {
    local: {},
    sync: {},
  };

  return {
    local: {
      get: vi.fn((keys, callback) => {
        const result: Record<string, unknown> = {};
        if (typeof keys === 'string') {
          result[keys] = data.local[keys];
        } else if (typeof keys === 'object' && keys !== null) {
          Object.keys(keys).forEach((key) => {
            result[key] = data.local[key] ?? keys[key];
          });
        }
        callback?.(result);
        return Promise.resolve(result);
      }),
      set: vi.fn((items, callback) => {
        Object.assign(data.local, items);
        callback?.();
        return Promise.resolve();
      }),
      remove: vi.fn((keys, callback) => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        keyArray.forEach((key) => delete data.local[key]);
        callback?.();
        return Promise.resolve();
      }),
      clear: vi.fn((callback) => {
        data.local = {};
        callback?.();
        return Promise.resolve();
      }),
    },
    sync: {
      get: vi.fn((keys, callback) => {
        const result: Record<string, unknown> = {};
        if (typeof keys === 'string') {
          result[keys] = data.sync[keys];
        } else if (typeof keys === 'object' && keys !== null) {
          Object.keys(keys).forEach((key) => {
            result[key] = data.sync[key] ?? keys[key];
          });
        }
        callback?.(result);
        return Promise.resolve(result);
      }),
      set: vi.fn((items, callback) => {
        Object.assign(data.sync, items);
        callback?.();
        return Promise.resolve();
      }),
      remove: vi.fn((keys, callback) => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        keyArray.forEach((key) => delete data.sync[key]);
        callback?.();
        return Promise.resolve();
      }),
      clear: vi.fn((callback) => {
        data.sync = {};
        callback?.();
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn(),
    },
  };
};

// Mock global do chrome
global.chrome = {
  storage: createStorageMock(),
  runtime: {
    lastError: undefined,
    getManifest: vi.fn(() => ({
      version: '0.1.0',
      manifest_version: 3,
    })),
  },
} as any;
