# 🧪 Testes Unitários - inVa

## Visão Geral

Este projeto utiliza **Vitest** como framework de testes, com **Happy DOM** para simulação do ambiente de navegador.

## Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm test -- --watch

# Executar testes com interface UI
npm run test:ui

# Executar testes com cobertura
npm run test:coverage
```

## Estrutura dos Testes

### 📁 Arquivos de Teste

```
src/
├── test/
│   └── setup.ts              # Setup global e mocks
├── shared/
│   ├── text-utils.test.ts    # Testes de utilitários de texto
│   ├── dom-utils.test.ts     # Testes de utilitários DOM
│   ├── comment-storage.test.ts # Testes de storage
│   └── elemento.test.ts      # Testes de factory function
```

## Cobertura Atual

| Módulo | Testes | Status |
|--------|--------|--------|
| `text-utils.ts` | 16 | ✅ 100% |
| `dom-utils.ts` | 13 | ✅ 100% |
| `comment-storage.ts` | 17 | ✅ 100% |
| `elemento.ts` | 23 | ✅ 100% |
| **Total** | **69** | ✅ |

## Descrição dos Testes

### 📝 text-utils.test.ts

Testa funções de normalização e validação de texto:
- `normalizeContent()`: Normalização de espaços e quebras de linha
- `isContentEmpty()`: Detecção de conteúdo vazio (incluindo nbsp)
- `contentEquals()`: Comparação de conteúdo normalizado

**Casos de teste:**
- Normalização de whitespace
- Conversão de diferentes tipos de quebra de linha
- Remoção de espaços inicial/final
- Strings vazias e caracteres especiais
- Detecção de nbsp (`\u00a0`)

### 🔧 dom-utils.test.ts

Testa utilitários de manipulação de DOM:
- `waitForElement()`: Aguarda elemento aparecer no DOM
- `waitForDOMReady()`: Aguarda DOM estar pronto
- `debounce()`: Debouncer genérico

**Casos de teste:**
- Elementos já existentes vs. elementos atrasados
- Timeout de espera
- Seletores simples e complexos
- Cancelamento de execuções pendentes
- Preservação de argumentos

### 💾 comment-storage.test.ts

Testa gerenciador de armazenamento de comentários:
- `getKey()`: Geração de chaves com prefixo
- `load()`: Carregamento de valores
- `save()`: Salvamento de valores
- `remove()`: Remoção com rastreamento de motivo
- `getPendingRemovalReason()`: Verificação de remoção pendente

**Casos de teste:**
- Operações CRUD completas
- Múltiplas chaves simultâneas
- Caracteres especiais
- Fluxo completo de ciclo de vida

### 🎨 elemento.test.ts

Testa factory function de criação de formulário:
- `injectCommentFormStyles()`: Injeção de CSS
- `createCommentForm()`: Criação programática de elementos

**Casos de teste:**
- Criação de elementos HTML
- Aplicação de classes CSS
- Atributos ARIA de acessibilidade
- Configurações personalizadas (placeholder, rows, clearButton)
- Estrutura DOM correta
- Prevenção de duplicação de estilos

## Mocks

### Chrome APIs

O arquivo `src/test/setup.ts` fornece mocks para:
- `chrome.storage.local`
- `chrome.storage.sync`
- `chrome.storage.onChanged`
- `chrome.runtime.getManifest()`

Esses mocks simulam o comportamento real das APIs do Chrome Extension em ambiente de testes.

## Boas Práticas

### ✅ O que testamos:
- Funções puras e utilitárias
- Lógica de negócio isolada
- Criação e manipulação de elementos DOM
- Operações de storage (com mocks)

### ❌ O que não testamos (ainda):
- Integração completa com CKEditor
- Content scripts em páginas reais
- Service worker (background.ts)
- Popup UI com eventos do navegador

## Adicionar Novos Testes

1. Crie um arquivo `*.test.ts` próximo ao módulo testado
2. Importe as funções a serem testadas
3. Use `describe()` para agrupar testes relacionados
4. Use `it()` para casos de teste individuais
5. Use `expect()` para asserções

Exemplo:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myModule', () => {
  describe('myFunction', () => {
    it('deve fazer algo esperado', () => {
      const result = myFunction('input');
      expect(result).toBe('expected output');
    });
  });
});
```

## Configuração

A configuração do Vitest está em `vitest.config.ts`:
- Ambiente: `happy-dom` (simulação de navegador)
- Setup: `src/test/setup.ts` (mocks globais)
- Coverage: `v8` provider com relatórios em text/json/html

## Debugging

Para debugar testes no VS Code:
1. Adicione breakpoints no código de teste
2. Execute: `npm test -- --run` com debugger anexado
3. Ou use `console.log()` dentro dos testes

## Próximos Passos

- [ ] Adicionar testes de integração para `editor-sync.ts`
- [ ] Testar fluxos completos do `contentScript.ts`
- [ ] Aumentar cobertura para 90%+
- [ ] Adicionar testes E2E com Playwright
- [ ] CI/CD automático com GitHub Actions
