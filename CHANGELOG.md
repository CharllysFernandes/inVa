# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

### [0.1.2](https://github.com/CharllysFernandes/inVa/compare/v0.1.1...v0.1.2) (2025-10-22)

### 0.1.1 (2025-10-22)


### ♻️ Refatorações

* melhorar a lógica de limpeza de comentários e ajustar a interface do formulário ([5a8e7ff](https://github.com/CharllysFernandes/inVa/commit/5a8e7ff59b79171f8728ce8cb15caf7d75166379))
* melhorar a lógica de sincronização do CKEditor e simplificar a remoção de comentários armazenados ([300a4c3](https://github.com/CharllysFernandes/inVa/commit/300a4c38f303495356d88fd4be1dec670d7cbdbe))
* remover formulário de opções e simplificar a lógica de estado vazio ([51a1650](https://github.com/CharllysFernandes/inVa/commit/51a1650b11a53423b1b86bcaeee6404849f8396b))
* remover funcionalidade de destaque e simplificar o código do popup ([95a50b2](https://github.com/CharllysFernandes/inVa/commit/95a50b2a70e43dbcc42db7bfeed894adcbb16dad))
* remover página de opções e ajustar a interface do popup ([b4fc86d](https://github.com/CharllysFernandes/inVa/commit/b4fc86dcb35184c62f05f564f378502669630ace))


### 📚 Documentação

* atualizar a descrição da extensão e adicionar aviso legal e principais funcionalidades ([79d432f](https://github.com/CharllysFernandes/inVa/commit/79d432fb32e773641e74824b22ff8f07c93240b3))


### ✨ Novos Recursos

* add comprehensive versioning documentation and examples ([4d1411a](https://github.com/CharllysFernandes/inVa/commit/4d1411a0f4c0029e0d0c9e36a1e3ae2eeba8ada1))
* add form for call annotation and implement logging functionality ([b1fae62](https://github.com/CharllysFernandes/inVa/commit/b1fae62c3ed46424db46f2d0057c005100ca4a19))
* add unit tests for comment storage, DOM utilities, element creation, and text utilities ([8a99ebf](https://github.com/CharllysFernandes/inVa/commit/8a99ebfe71684be4a0f01a8e0cd7a268b90066b0))
* implement CKEditor text insertion and local storage for comments ([a98bc82](https://github.com/CharllysFernandes/inVa/commit/a98bc821f887e5531a9370f6a753ea3ca0c38169))
* Implementar melhorias rápidas e refatoração do projeto inVa ([a1dd52e](https://github.com/CharllysFernandes/inVa/commit/a1dd52e0fc408730cd8c5e26f15a9428668611d4))
* initialize inVa Chrome extension with TypeScript ([491729d](https://github.com/CharllysFernandes/inVa/commit/491729df4906f8d2eb239949d3babf6f0cd30db1))
* sincronizar conteúdo do CKEditor com armazenamento local e melhorar a interface do popup ([1455ad5](https://github.com/CharllysFernandes/inVa/commit/1455ad5d07248db97558bfd92f14b51cda69b9a1))

## [0.1.0] - 2025-10-21

### ✨ Novos Recursos

- Sistema de rate limiting para operações de Storage
- Proteção contra throttling da Chrome Storage API
- RateLimiter class com algoritmo de sliding window
- Configurações pré-definidas para READ/WRITE/DELETE operations

### 📚 Documentação

- Adicionado JSDoc completo em todos os arquivos
- Documentação detalhada de tipos e interfaces
- Exemplos de uso nas funções principais

### ✅ Testes

- 150 testes unitários implementados
- Cobertura de testes para rate limiter
- Testes de integração para storage operations

### 🔧 Build/CI

- Configuração do Webpack para build
- TypeScript strict mode habilitado
- Vitest para execução de testes
