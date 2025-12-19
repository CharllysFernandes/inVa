# inVa

Extensão para Google Chrome e Microsoft Edge escrita em TypeScript cujo objetivo é agilizar o fluxo de criação de chamados na plataforma **InvGate Service Desk**.

## 🚀 Quick Start

```bash
npm install
npm run build
```

Carregue a pasta `dist/` como extensão não empacotada no Chrome/Edge.

## 📚 Documentação

- **[docs/ARCHITECTURE_FINAL.md](./docs/ARCHITECTURE_FINAL.md)** - Arquitetura completa
- **[docs/CLEAN_CODE_SUMMARY.md](./docs/CLEAN_CODE_SUMMARY.md)** - Princípios Clean Code
- **[docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)** - Guia de migração
- **[docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Estrutura do projeto

## 🏗️ Arquitetura

Projeto organizado com **Clean Architecture** + **Clean Code**:

```
src/
├── domain/          # Regras de negócio
├── infrastructure/  # Detalhes técnicos
├── presentation/    # Controllers
├── popup/          # Entry point popup
├── content/        # Entry point content
└── shared/         # Utilitários
```

## ✨ Features

- ✅ Formulário de comentários com persistência
- ✅ Sincronização com CKEditor
- ✅ Validação de username
- ✅ Controle de base de conhecimento
- ✅ Sugestões de IA (OpenRouter)
- ✅ Debug mode

## 🧪 Testes

```bash
npm test
npm run test:coverage
```

## 📦 Build

```bash
npm run build      # Produção
npm run watch      # Desenvolvimento
```

## 📄 Licença

MIT
