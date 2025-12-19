# 📁 Estrutura do Projeto inVa

## 🎯 Visão Geral

Projeto organizado em camadas com separação clara de responsabilidades.

```
src/
├── background/          # Service Worker (MV3)
├── content/            # Content Scripts
│   └── features/       # Features modulares
├── popup/              # Interface do popup
│   ├── handlers/       # Lógica de negócio
│   └── ui/            # Componentes de UI
├── shared/            # Código compartilhado
│   ├── core/          # Utilitários base
│   ├── services/      # Serviços de negócio
│   └── ui/            # Componentes UI compartilhados
└── test/              # Configuração de testes
```

## 📦 Módulos Principais

### 1. Background (`src/background/`)
Service worker que roda em background.

**Responsabilidades:**
- Interceptar requisições OpenRouter (evitar CSP)
- Gerenciar eventos de instalação/atualização
- Comunicação entre content scripts e APIs externas

**Arquivos:**
- `background.ts` - Service worker principal

---

### 2. Content (`src/content/`)
Scripts injetados nas páginas do InvGate.

**Responsabilidades:**
- Orquestrar inicialização de features
- Validar URL da página
- Gerenciar ciclo de vida das features

**Arquivos:**
- `contentScript.ts` - Orquestrador principal (~60 linhas)

#### 2.1 Features (`src/content/features/`)
Funcionalidades modulares e independentes.

**Estrutura padrão:**
```
feature-name/
├── index.ts           # Export público
├── implementation.ts  # Lógica (manager/controller/monitor)
├── types.ts          # Tipos (opcional)
└── utils.ts          # Utilitários (opcional)
```

**Features disponíveis:**
- `activity-message-monitor` - Monitora artigos de atividade
- `comment-form` - Formulário de comentários
- `customer-username-validation` - Validação de username
- `editor-sync` - Sincronização com CKEditor
- `knowledge-base-control` - Controle de visibilidade KB

**Barrel Export:**
- `index.ts` - Exporta todas as features

---

### 3. Popup (`src/popup/`)
Interface de configuração da extensão.

**Estrutura refatorada:**
```
popup/
├── handlers/              # Lógica de negócio
│   ├── debug.ts          # Debug e logs
│   ├── general-settings.ts # Configurações gerais
│   ├── openrouter.ts     # OpenRouter API
│   └── url-config.ts     # Configuração de URL
├── ui/                   # Componentes de UI
│   ├── elements.ts       # Referências DOM
│   ├── status.ts         # Mensagens de status
│   └── version.ts        # Exibição de versão
├── popup.html            # Estrutura HTML
├── popup.css             # Estilos
├── popup.ts              # Script original (legacy)
└── popup-refactored.ts   # Script refatorado (novo)
```

**Benefícios da refatoração:**
- ✅ Redução de 400+ para ~60 linhas no arquivo principal
- ✅ Handlers reutilizáveis e testáveis
- ✅ Separação clara de UI e lógica
- ✅ Fácil manutenção e extensão

---

### 4. Shared (`src/shared/`)
Código compartilhado entre todos os módulos.

#### 4.1 Core (`src/shared/core/`)
Utilitários fundamentais e constantes.

**Arquivos:**
- `constants.ts` - Constantes (STORAGE_KEYS, SELECTORS, LIMITS)
- `types.ts` - Tipos TypeScript base
- `logger.ts` - Sistema de logging
- `utils.ts` - Utilitários gerais (storage, URL)
- `dom-utils.ts` - Manipulação de DOM
- `text-utils.ts` - Normalização de texto
- `rate-limiter.ts` - Controle de taxa
- `index.ts` - Barrel export

#### 4.2 Services (`src/shared/services/`)
Serviços de negócio.

**Arquivos:**
- `comment-storage.ts` - Gerenciamento de comentários
- `openrouter-api.ts` - Cliente OpenRouter API
- `ai-suggestions.ts` - Sugestões de IA
- `index.ts` - Barrel export

#### 4.3 UI (`src/shared/ui/`)
Componentes de UI compartilhados.

**Arquivos:**
- `elemento.ts` - Criação de formulário de comentários
- `index.ts` - Barrel export

---

## 🔄 Fluxo de Dados

### Content Script Flow
```
contentScript.ts
    ↓
waitForDOMReady()
    ↓
initializeActivityMessageMonitor()
    ↓
getStoredCreateTicketUrl()
    ↓
matchesUrl() → ✓
    ↓
initializeCustomerUsernameMonitor()
initializeKnowledgeBaseControl()
initializeCommentForm()
```

### Popup Flow
```
popup-refactored.ts
    ↓
displayVersion()
    ↓
loadUrlConfig()
loadOpenRouterConfig()
loadGeneralSettings()
loadDebugState()
    ↓
Event Listeners
    ↓
handlers/* (processam ações)
    ↓
ui/status.ts (feedback visual)
```

---

## 📐 Convenções

### Nomenclatura de Arquivos
- **Implementação**: `kebab-case.ts`
- **Testes**: `kebab-case.test.ts`
- **Tipos**: `types.ts`
- **Utilitários**: `utils.ts`
- **Barrel exports**: `index.ts`

### Nomenclatura de Funções
- **Inicialização**: `initialize<FeatureName>()`
- **Handlers**: `handle<Action>()` ou `<action>Handler()`
- **Loaders**: `load<Data>()`
- **Savers**: `save<Data>()`

### Imports
Use barrel exports quando disponível:
```typescript
// ✅ Bom
import { initializeCommentForm } from "@content/features";

// ❌ Evite
import { initializeCommentForm } from "@content/features/comment-form";
```

---

## 🧪 Testes

### Estrutura
```
tests/
├── unit/           # Testes unitários
└── integration/    # Testes de integração
```

### Localização
Testes ficam junto com implementação:
```
feature/
├── index.ts
├── manager.ts
└── manager.test.ts
```

---

## 🚀 Próximos Passos

### Melhorias Planejadas
1. ✅ Remover arquivos duplicados (`editor-sync.ts` na raiz)
2. ✅ Modularizar popup (handlers + ui)
3. ✅ Criar barrel exports
4. ⏳ Migrar testes para pasta dedicada
5. ⏳ Adicionar testes de integração
6. ⏳ Implementar feature flags
7. ⏳ Adicionar CI/CD

### Refatorações Futuras
- Extrair lógica de background para handlers
- Criar sistema de eventos entre features
- Implementar lazy loading de features
- Adicionar telemetria e analytics

---

## 📚 Documentação Relacionada

- [README.md](./README.md) - Documentação geral
- [REFACTORING.md](./REFACTORING.md) - Histórico de refatorações
- [features/README.md](./src/content/features/README.md) - Guia de features
- [VERSIONING.md](./docs/VERSIONING.md) - Versionamento
