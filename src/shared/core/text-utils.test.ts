import { describe, it, expect } from 'vitest';
import { normalizeContent, isContentEmpty, contentEquals } from './text-utils';

describe('text-utils', () => {
  describe('normalizeContent', () => {
    it('deve normalizar espaços em branco', () => {
      expect(normalizeContent('  hello   world  ')).toBe('hello   world');
    });

    it('deve converter diferentes tipos de quebra de linha para \\n', () => {
      expect(normalizeContent('hello\r\nworld')).toBe('hello\nworld');
      expect(normalizeContent('hello\rworld')).toBe('hello\nworld');
      expect(normalizeContent('hello\nworld')).toBe('hello\nworld');
    });

    it('deve remover espaços do início e fim', () => {
      expect(normalizeContent('   content   ')).toBe('content');
      expect(normalizeContent('\n\ncontent\n\n')).toBe('content');
    });

    it('deve lidar com strings vazias', () => {
      expect(normalizeContent('')).toBe('');
      expect(normalizeContent('   ')).toBe('');
      expect(normalizeContent('\n\n\n')).toBe('');
    });

    it('deve preservar espaços internos', () => {
      expect(normalizeContent('hello    world')).toBe('hello    world');
    });

    it('deve lidar com caracteres especiais', () => {
      expect(normalizeContent('  @#$%  ')).toBe('@#$%');
    });
  });

  describe('isContentEmpty', () => {
    it('deve retornar true para conteúdo vazio', () => {
      expect(isContentEmpty('')).toBe(true);
      expect(isContentEmpty('   ')).toBe(true);
      expect(isContentEmpty('\n\n')).toBe(true);
      expect(isContentEmpty('\r\n\r\n')).toBe(true);
    });

    it('deve retornar true para conteúdo apenas com nbsp', () => {
      expect(isContentEmpty('\u00a0')).toBe(true);
      expect(isContentEmpty('\u00a0\u00a0\u00a0')).toBe(true);
      expect(isContentEmpty('  \u00a0  ')).toBe(true);
    });

    it('deve retornar false para conteúdo não vazio', () => {
      expect(isContentEmpty('hello')).toBe(false);
      expect(isContentEmpty('  hello  ')).toBe(false);
      expect(isContentEmpty('0')).toBe(false);
      expect(isContentEmpty('.')).toBe(false);
    });

    it('deve lidar com quebras de linha e espaços misturados', () => {
      expect(isContentEmpty('\n  \n  \n')).toBe(true);
      expect(isContentEmpty('\n hello \n')).toBe(false);
    });
  });

  describe('contentEquals', () => {
    it('deve retornar true para conteúdos iguais', () => {
      expect(contentEquals('hello', 'hello')).toBe(true);
      expect(contentEquals('  hello  ', 'hello')).toBe(true);
      expect(contentEquals('hello\r\n', 'hello\n')).toBe(true);
    });

    it('deve retornar false para conteúdos diferentes', () => {
      expect(contentEquals('hello', 'world')).toBe(false);
      expect(contentEquals('hello', 'Hello')).toBe(false);
    });

    it('deve ignorar espaços em branco no início e fim', () => {
      expect(contentEquals('  hello  ', '  hello  ')).toBe(true);
      expect(contentEquals('\nhello\n', 'hello')).toBe(true);
    });

    it('deve normalizar quebras de linha antes de comparar', () => {
      expect(contentEquals('line1\r\nline2', 'line1\nline2')).toBe(true);
      expect(contentEquals('line1\rline2', 'line1\nline2')).toBe(true);
    });

    it('deve considerar espaços internos', () => {
      expect(contentEquals('hello  world', 'hello world')).toBe(false);
      expect(contentEquals('hello  world', 'hello  world')).toBe(true);
    });

    it('deve lidar com strings vazias', () => {
      expect(contentEquals('', '')).toBe(true);
      expect(contentEquals('   ', '')).toBe(true);
      expect(contentEquals('', '   ')).toBe(true);
    });
  });
});
