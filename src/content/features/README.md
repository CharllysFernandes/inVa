# 📦 Features da Extensão inVa

Este diretório contém todas as features modulares da extensão, organizadas de forma independente e autocontida.

## 🏗️ Estrutura Padrão de Feature

Cada feature segue esta estrutura:

```
feature-name/
├── index.ts           # Ponto de entrada público (exports)
├── implementation.ts  # Lógica principal (manager/controller/monitor)
├── types.ts          # Tipos TypeScript (opcional)
└── utils.ts          # Utilitários auxiliares (opcional)
```

## 📋 Features Disponíveis

### 1. **activity-message-monitor**
Monitora artigos de mensagens de atividade e exibe indicadores visuais de status.

**Arquivos:**
- `index.ts` - Export público
- `monitor.ts` - Lógica de monitoramento

**Uso:**
```typescript
import { initializeActivityMessageMonitor } from "@content/features/activity-message-monitor";
initializeActivityMessageMonitor();
```

---

### 2. **comment-form**
Gerencia injeção, persistência e sincronização do formulário de comentários.

**Arquivos:**
- `index.ts` - Export público
- `manager.ts` - Gerenciador do formulário
- `types.ts` - Tipos da feature

**Uso:**
```typescript
import { initializeCommentForm } from "@content/features/comment-form";
await initializeCommentForm(savedUrl);
```

---

### 3. **customer-username-validation**
Monitora e valida o username do cliente contra o email do usuário logado.

**Arquivos:**
- `index.ts` - Export público
- `monitor.ts` - Lógica de validação

**Uso:**
```typescript
import { initializeCustomerUsernameMonitor } from "@content/features/customer-username-validation";
initializeCustomerUsernameMonitor();
```

---

### 4. **editor-sync**
Sincroniza conteúdo com CKEditor (suporta modo iframe e inline).

**Arquivos:**
- `index.ts` - Export público
- `manager.ts` - Gerenciador de sincronização
- `utils.ts` - Conversão de texto para HTML

**Uso:**
```typescript
import { editorSync } from "@content/features/editor-sync";
editorSync.sync("Meu texto");
```

---

### 5. **knowledge-base-control**
Controla a visibilidade da base de conhecimento na página.

**Arquivos:**
- `index.ts` - Export público
- `controller.ts` - Controlador de visibilidade

**Uso:**
```typescript
import { initializeKnowledgeBaseControl } from "@content/features/knowledge-base-control";
initializeKnowledgeBaseControl();
```

---

## 🚀 Como Criar Nova Feature

### Passo 1: Criar Estrutura
```bash
mkdir src/content/features/minha-feature
cd src/content/features/minha-feature
```

### Passo 2: Criar `index.ts`
```typescript
/**
 * Minha Feature
 * Descrição do que a feature faz
 * @module minha-feature
 */

export { initializeMinhaFeature } from "./manager";
export type { MinhaFeatureConfig } from "./types";
```

### Passo 3: Criar Implementação
```typescript
// manager.ts
import { logger } from "@shared/core";

let initialized = false;

export function initializeMinhaFeature(): void {
  if (initialized) {
    return;
  }

  initialized = true;
  void logger.info("minha-feature", "Feature initialized");

  // Sua lógica aqui
}
```

### Passo 4: Adicionar ao ContentScript
```typescript
// src/content/contentScript.ts
import { initializeMinhaFeature } from "@content/features/minha-feature";

// No fluxo principal
initializeMinhaFeature();
```

## 📐 Convenções de Nomenclatura

### Arquivos de Implementação
- **`manager.ts`** - Gerencia estado e coordena operações complexas
- **`controller.ts`** - Controla comportamento de UI/DOM
- **`monitor.ts`** - Observa e reage a mudanças (DOM, storage, etc.)
- **`utils.ts`** - Funções utilitárias puras sem estado
- **`types.ts`** - Definições de tipos TypeScript

### Funções de Inicialização
Sempre use o padrão: `initialize<FeatureName>()`

✅ Bom:
- `initializeCommentForm()`
- `initializeEditorSync()`
- `initializeKnowledgeBaseControl()`

❌ Evite:
- `startFeature()`
- `setupFeature()`
- `runFeature()`

### Nomes de Features
Use kebab-case para pastas e camelCase para código:

```
📁 customer-username-validation/
   └── initializeCustomerUsernameMonitor()
```

## 🧪 Testando Features

Cada feature deve ter seus próprios testes:

```typescript
// minha-feature/manager.test.ts
import { describe, it, expect } from "vitest";
import { initializeMinhaFeature } from "./manager";

describe("MinhaFeature", () => {
  it("should initialize without errors", () => {
    expect(() => initializeMinhaFeature()).not.toThrow();
  });
});
```

## 🔒 Princípios de Design

### 1. **Encapsulamento**
- Exporte apenas o necessário via `index.ts`
- Mantenha implementação interna privada

### 2. **Single Responsibility**
- Cada feature tem uma responsabilidade clara
- Se crescer muito, considere dividir em sub-features

### 3. **Independência**
- Features não devem depender diretamente umas das outras
- Use eventos ou shared services para comunicação

### 4. **Inicialização Idempotente**
- Sempre verifique se já foi inicializada
- Use flag `initialized` para evitar duplicação

```typescript
let initialized = false;

export function initializeFeature(): void {
  if (initialized) {
    return; // Já inicializada, não faz nada
  }
  initialized = true;
  // ... resto da inicialização
}
```

## 📊 Dependências Permitidas

### ✅ Pode Importar
- `@shared/core` - Utilitários, constantes, logger
- `@shared/services` - Serviços compartilhados
- `@shared/ui` - Componentes de UI
- Outras features via `@content/features/*` (com moderação)

### ❌ Evite Importar
- Implementação interna de outras features
- Arquivos fora de `src/`
- Dependências circulares

## 🐛 Debug de Features

Use o logger centralizado:

```typescript
import { logger } from "@shared/core";

void logger.debug("minha-feature", "Debug message", { data: value });
void logger.info("minha-feature", "Info message");
void logger.warn("minha-feature", "Warning message");
void logger.error("minha-feature", "Error message", { error });
```

Ative debug no popup da extensão para ver logs detalhados.

## 📚 Recursos Adicionais

- [REFACTORING.md](../../../REFACTORING.md) - Documentação completa da refatoração
- [README.md](../../../README.md) - Documentação geral do projeto
- [VERSIONING.md](../../../docs/VERSIONING.md) - Guia de versionamento
