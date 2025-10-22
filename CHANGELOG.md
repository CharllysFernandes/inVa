# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
