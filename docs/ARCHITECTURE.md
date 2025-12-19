# 🏗️ Arquitetura do Projeto inVa

## 📁 Estrutura

```
src/
├── background/          # Service Worker
│   └── background.ts
├── content/            # Content Scripts
│   ├── features/       # Features modulares
│   │   ├── index.ts   # Barrel export
│   │   ├── activity-message-monitor/
│   │   ├── comment-form/
│   │   ├── customer-username-validation/
│   │   ├── editor-sync/
│   │   └── knowledge-base-control/
│   └── contentScript.ts
├── popup/              # Interface do popup
│   ├── handlers/       # Lógica de negócio
│   ├── ui/            # Componentes UI
│   ├── popup-refactored.ts
│   ├── popup.html
│   └── popup.css
└── shared/            # Código compartilhado
    ├── core/          # Utilitários base
    ├── services/      # Serviços
    └── ui/            # Componentes UI
```

## 🎯 Princípios

### 1. Modularização
Cada feature é independente e autocontida.

### 2. Separação de Responsabilidades
- **UI**: Apenas manipulação de DOM
- **Handlers**: Apenas lógica de negócio
- **Services**: Apenas comunicação externa

### 3. Barrel Exports
Simplifica imports e reduz acoplamento.

### 4. Testabilidade
Código isolado e facilmente testável.

## 🔄 Fluxo de Dados

### Content Script
```
contentScript.ts → features/index.ts → feature específica
```

### Popup
```
popup-refactored.ts → handlers → services → chrome.storage
```

## 📚 Documentação

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura detalhada
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guia de migração
- [features/README.md](./src/content/features/README.md) - Guia de features
