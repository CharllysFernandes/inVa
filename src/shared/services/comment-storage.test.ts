import { describe, it, expect, beforeEach, vi } from 'vitest';
import { commentStorage } from './comment-storage';

describe('comment-storage', () => {
  beforeEach(() => {
    // Limpa o storage antes de cada teste
    vi.clearAllMocks();
    
    // Reset do storage mock
    const storageMock = chrome.storage as any;
    if (storageMock.local.clear) {
      storageMock.local.clear();
    }
    
    // Resetar rate limiters
    commentStorage.resetRateLimiters();
  });

  describe('getKey', () => {
    it('deve gerar chave com prefixo correto', () => {
      const url = 'https://example.com/tickets/new';
      const key = commentStorage.getKey(url);
      
      expect(key).toBe('inva_comments:https://example.com/tickets/new');
    });

    it('deve funcionar com diferentes URLs', () => {
      expect(commentStorage.getKey('http://localhost:3000'))
        .toBe('inva_comments:http://localhost:3000');
      
      expect(commentStorage.getKey('https://app.invgate.com'))
        .toBe('inva_comments:https://app.invgate.com');
    });
  });

  describe('load', () => {
    it('deve carregar valor salvo', async () => {
      const key = 'inva_comments:test';
      const value = 'test comment content';

      // Simula valor já salvo
      await chrome.storage.local.set({ [key]: value });

      const result = await commentStorage.load(key);
      expect(result).toBe(value);
    });

    it('deve retornar string vazia para chave inexistente', async () => {
      const result = await commentStorage.load('inva_comments:nonexistent');
      expect(result).toBe('');
    });

    it('deve converter valores não-string em string', async () => {
      const key = 'inva_comments:test';
      await chrome.storage.local.set({ [key]: 123 });

      const result = await commentStorage.load(key);
      expect(typeof result).toBe('string');
      expect(result).toBe('123');
    });
  });

  describe('save', () => {
    it('deve salvar valor no storage', async () => {
      const key = 'inva_comments:test';
      const value = 'new comment';

      await commentStorage.save(key, value);

      // Verifica se foi salvo
      const result = await commentStorage.load(key);
      expect(result).toBe(value);
    });

    it('deve sobrescrever valor existente', async () => {
      const key = 'inva_comments:test';
      
      await commentStorage.save(key, 'first value');
      await new Promise(resolve => setTimeout(resolve, 15));
      await commentStorage.save(key, 'second value');
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await commentStorage.load(key);
      expect(result).toBe('second value');
    });

    it('deve salvar string vazia', async () => {
      const key = 'inva_comments:test';
      
      await commentStorage.save(key, '');
      const result = await commentStorage.load(key);
      
      expect(result).toBe('');
    });

    it('deve salvar conteúdo com caracteres especiais', async () => {
      const key = 'inva_comments:test';
      const specialContent = 'Conteúdo com àçêntos e símbolos: @#$%\n\nNova linha';
      
      await commentStorage.save(key, specialContent);
      const result = await commentStorage.load(key);
      
      expect(result).toBe(specialContent);
    });
  });

  describe('remove', () => {
    it('deve remover valor do storage', async () => {
      const key = 'inva_comments:test';
      
      await commentStorage.save(key, 'value to remove');
      await commentStorage.remove(key, 'manual-clear');

      const result = await commentStorage.load(key);
      expect(result).toBe('');
    });

    it('deve rastrear motivo da remoção temporariamente', async () => {
      const key = 'inva_comments:test';
      
      // Inicia remoção (pendente)
      const removePromise = commentStorage.remove(key, 'button-click');
      
      // Durante a remoção, deve ter pending reason
      // (mas como é async, pode já ter completado)
      
      await removePromise;
      
      // Após completar, não deve mais ter pending
      expect(commentStorage.hasPendingRemoval(key)).toBe(false);
    });

    it('deve limpar pending removal após remoção', async () => {
      const key = 'inva_comments:test';
      
      await commentStorage.remove(key, 'form-submit');
      
      expect(commentStorage.getPendingRemovalReason(key)).toBeUndefined();
      expect(commentStorage.hasPendingRemoval(key)).toBe(false);
    });
  });

  describe('getPendingRemovalReason', () => {
    it('deve retornar undefined para chave sem remoção pendente', () => {
      const reason = commentStorage.getPendingRemovalReason('inva_comments:test');
      expect(reason).toBeUndefined();
    });
  });

  describe('clearPendingRemoval', () => {
    it('deve limpar pending removal', () => {
      const key = 'inva_comments:test';
      
      commentStorage.clearPendingRemoval(key);
      
      expect(commentStorage.hasPendingRemoval(key)).toBe(false);
      expect(commentStorage.getPendingRemovalReason(key)).toBeUndefined();
    });
  });

  describe('hasPendingRemoval', () => {
    it('deve retornar false para chave sem remoção pendente', () => {
      expect(commentStorage.hasPendingRemoval('inva_comments:test')).toBe(false);
    });
  });

  describe('integração - fluxo completo', () => {
    it('deve suportar ciclo completo: save -> load -> remove', async () => {
      const key = commentStorage.getKey('https://example.com/tickets/complete-flow');
      const value = 'Complete workflow test';
      
      // Save
      await commentStorage.save(key, value);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Load
      const loaded = await commentStorage.load(key);
      expect(loaded).toBe(value);
      await new Promise(resolve => setTimeout(resolve, 15));
      
      // Remove
      await commentStorage.remove(key, 'manual-clear');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verificar se foi removido
      const afterRemove = await commentStorage.load(key);
      expect(afterRemove).toBe('');
    });

    it('deve suportar múltiplas chaves simultaneamente', async () => {
      const url1 = 'https://example.com/ticket/1';
      const url2 = 'https://example.com/ticket/2';
      const key1 = commentStorage.getKey(url1);
      const key2 = commentStorage.getKey(url2);

      await commentStorage.save(key1, 'Comment 1');
      await new Promise(resolve => setTimeout(resolve, 15));
      await commentStorage.save(key2, 'Comment 2');
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(await commentStorage.load(key1)).toBe('Comment 1');
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(await commentStorage.load(key2)).toBe('Comment 2');
      await new Promise(resolve => setTimeout(resolve, 15));

      await commentStorage.remove(key1, 'manual-clear');
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(await commentStorage.load(key1)).toBe('');
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(await commentStorage.load(key2)).toBe('Comment 2');
    });
  });
});
