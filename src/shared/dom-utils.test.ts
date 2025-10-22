import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitForElement, waitForDOMReady, debounce } from './dom-utils';

describe('dom-utils', () => {
  describe('waitForElement', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('deve retornar elemento já existente imediatamente', async () => {
      const div = document.createElement('div');
      div.id = 'test-element';
      document.body.appendChild(div);

      const result = await waitForElement('#test-element', 1000);
      expect(result).toBe(div);
    });

    it('deve aguardar elemento aparecer no DOM', async () => {
      const promise = waitForElement('#delayed-element', 2000);

      setTimeout(() => {
        const div = document.createElement('div');
        div.id = 'delayed-element';
        document.body.appendChild(div);
      }, 100);

      const result = await promise;
      expect(result).not.toBeNull();
      expect(result?.id).toBe('delayed-element');
    });

    it('deve retornar null após timeout', async () => {
      const result = await waitForElement('#non-existent', 100);
      expect(result).toBeNull();
    });

    it('deve funcionar com seletores de classe', async () => {
      const div = document.createElement('div');
      div.className = 'test-class';
      document.body.appendChild(div);

      const result = await waitForElement('.test-class', 1000);
      expect(result).toBe(div);
    });

    it('deve funcionar com seletores complexos', async () => {
      const container = document.createElement('div');
      container.className = 'container';
      const child = document.createElement('span');
      child.className = 'child';
      container.appendChild(child);
      document.body.appendChild(container);

      const result = await waitForElement('.container .child', 1000);
      expect(result).toBe(child);
    });

    it('deve suportar tipagem genérica', async () => {
      const button = document.createElement('button');
      button.id = 'test-button';
      document.body.appendChild(button);

      const result = await waitForElement<HTMLButtonElement>('#test-button', 1000);
      expect(result).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('waitForDOMReady', () => {
    it('deve resolver imediatamente se DOM já está pronto', async () => {
      // readyState já é 'complete' ou 'interactive' nos testes
      const start = Date.now();
      await waitForDOMReady();
      const elapsed = Date.now() - start;
      
      // Deve resolver quase instantaneamente
      expect(elapsed).toBeLessThan(50);
    });

    // Nota: Testar o caso de 'loading' é difícil em ambiente de testes
    // pois o DOM já está carregado quando os testes rodam
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('deve atrasar a execução da função', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('deve cancelar execução anterior quando chamado novamente', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      vi.advanceTimersByTime(300);
      debouncedFn();
      vi.advanceTimersByTime(300);
      
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(200);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('deve passar argumentos corretamente', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn('arg1', 'arg2', 123);
      vi.advanceTimersByTime(500);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('deve usar os argumentos da última chamada', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn('first');
      vi.advanceTimersByTime(300);
      debouncedFn('second');
      vi.advanceTimersByTime(500);

      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith('second');
    });

    it('deve funcionar com múltiplas chamadas após tempo de espera', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      vi.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledTimes(1);

      debouncedFn();
      vi.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('deve executar função com contexto apropriado', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn('test');
      vi.advanceTimersByTime(500);
      
      expect(fn).toHaveBeenCalledWith('test');
      expect(fn).toHaveBeenCalledOnce();
    });
  });
});
