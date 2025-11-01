# 🚀 Build e Release - Guia Completo

Este documento descreve o processo completo de build e release da extensão inVa para o GitHub.

## 📋 Índice

- [Build de Produção](#-build-de-produção)
- [Preparação de Release](#-preparação-de-release)
- [Publicação no GitHub](#-publicação-no-github)
- [Fluxo Completo](#-fluxo-completo)

## 🔨 Build de Produção

### Build Manual

```bash
# Limpar pasta dist anterior
npm run clean

# Build de produção (minificado)
npm run build

# Build de desenvolvimento (com source maps)
npm run dev

# Build com watch mode (recompila automaticamente)
npm run watch
```

### O que o Build Faz?

1. **Limpa** a pasta `dist/`
2. **Compila** TypeScript para JavaScript
3. **Minifica** o código (em modo produção)
4. **Copia** arquivos estáticos:
   - `manifest.json`
   - `popup.html`
   - `popup.css`
   - `Logo.png`
5. **Gera** três arquivos principais:
   - `background.js` - Service worker
   - `contentScript.js` - Script injetado nas páginas
   - `popup.js` - Interface do popup

### Estrutura do Build

```
dist/
├── background.js          # Service worker
├── contentScript.js       # Content script
├── popup.js              # Popup script
├── popup.html            # Popup HTML
├── popup.css             # Popup CSS
├── manifest.json         # Manifest da extensão
└── Logo.png             # Ícone
```

## 📦 Preparação de Release

### Script Automático (Recomendado)

O script `prepare-release.js` automatiza todo o processo:

```bash
npm run prepare:release
```

### O que o Script Faz?

1. ✅ **Valida versões** (package.json ↔ manifest.json)
2. ✅ **Verifica Git status** (mudanças não commitadas)
3. ✅ **Executa testes** (`npm test -- --run`)
4. ✅ **Valida segurança** (CSP checker)
5. ✅ **Cria build** de produção
6. ✅ **Gera arquivo ZIP** (`inVa-vX.X.X.zip`)
7. ✅ **Cria release notes** (`release-vX.X.X.md`)

### Saída do Script

```
releases/
├── inVa-v0.1.3.zip          # ZIP para publicação
└── release-v0.1.3.md        # Notas de release
```

## 🌐 Publicação no GitHub

### Passo a Passo

#### 1. Criar Versão com standard-version

```bash
# Analisa commits e cria versão automaticamente
npm run release

# Ou força um tipo específico
npm run release:patch   # 0.1.3 → 0.1.4
npm run release:minor   # 0.1.3 → 0.2.0
npm run release:major   # 0.1.3 → 1.0.0
```

Isso cria:

- Tag Git (ex: `v0.1.4`)
- Atualiza `CHANGELOG.md`
- Commit de release

#### 2. Preparar Release

```bash
npm run prepare:release
```

Isso cria:

- Build de produção
- Arquivo ZIP
- Notas de release

#### 3. Push para GitHub

```bash
# Push do commit e tags
git push --follow-tags origin main
```

#### 4. Criar Release no GitHub

1. Acesse: https://github.com/CharllysFernandes/inVa/releases/new

2. **Tag**: Selecione a tag recém-criada (ex: `v0.1.4`)

3. **Release title**: `v0.1.4 - [Descrição curta]`

4. **Description**: Cole o conteúdo de `releases/release-v0.1.4.md`

5. **Attach binaries**: Faça upload do arquivo `releases/inVa-v0.1.4.zip`

6. **Publish release**: Clique para publicar

### Release Notes Template

O script gera automaticamente release notes com:

- 📦 Informações do arquivo (nome, tamanho)
- 📝 Notas da versão (do CHANGELOG)
- 🚀 Instruções de instalação
- ✅ Checklist de verificação
- 🔗 Links úteis

## 🔄 Fluxo Completo

### Workflow Recomendado

```bash
# 1. Desenvolver e testar
git checkout -b feat/new-feature
# ... desenvolver ...
git commit -m "feat: adicionar nova funcionalidade"
npm test
npm run build

# 2. Merge para main
git checkout main
git merge feat/new-feature

# 3. Criar versão
npm run release

# 4. Revisar mudanças
git show HEAD
cat CHANGELOG.md

# 5. Preparar release
npm run prepare:release

# 6. Push
git push --follow-tags origin main

# 7. Criar release no GitHub (manual)
# Acesse: https://github.com/CharllysFernandes/inVa/releases/new
# Faça upload do ZIP
# Publique
```

### Fluxo Visual

```
┌─────────────────────┐
│  Desenvolver        │
│  feat/my-feature    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  npm test           │
│  npm run build      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  git merge          │
│  npm run release    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ prepare:release     │
│ ✓ Testes            │
│ ✓ Build             │
│ ✓ ZIP               │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  git push --follow- │
│  tags origin main   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  GitHub Release     │
│  + Upload ZIP       │
│  + Release Notes    │
└─────────────────────┘
```

## 🛠️ Troubleshooting

### Erro: "Versões não sincronizadas"

```bash
# Sincronizar versões
node scripts/sync-version.js
```

### Erro: "Mudanças não commitadas"

```bash
# Ver mudanças
git status

# Commitar ou fazer stash
git add .
git commit -m "chore: ..."
# ou
git stash
```

### Erro: "Testes falharam"

```bash
# Executar testes e ver erros
npm test -- --run

# Executar testes específicos
npm test -- --run path/to/test.ts

# Ver cobertura
npm run test:coverage
```

### Erro: "Build falhou"

```bash
# Verificar erros de TypeScript
npm run typecheck

# Limpar e rebuildar
npm run clean
npm run build
```

### Problema com ZIP

Se o arquivo ZIP não foi criado:

```bash
# Instalar dependência archiver
npm install

# Verificar se dist/ existe
ls -la dist/

# Executar script novamente
npm run prepare:release
```

## 📊 Checklist Pré-Release

Use este checklist antes de cada release:

- [ ] Todos os testes passam: `npm test -- --run`
- [ ] TypeScript sem erros: `npm run typecheck`
- [ ] Build de produção funciona: `npm run build`
- [ ] Segurança validada: `npm run test:security`
- [ ] Versões sincronizadas (package.json ↔ manifest.json)
- [ ] CHANGELOG atualizado
- [ ] Documentação atualizada
- [ ] Commits seguem Conventional Commits
- [ ] Git status limpo ou stashed
- [ ] Branch main atualizada

## 🔍 Validação Manual

Antes de publicar, teste manualmente:

1. **Descompacte o ZIP**:

   ```bash
   cd releases
   unzip inVa-v0.1.4.zip -d test-release
   ```

2. **Carregar no Chrome**:

   - Abra `chrome://extensions`
   - Ative "Modo do desenvolvedor"
   - "Carregar sem compactação"
   - Selecione pasta `test-release`

3. **Testar funcionalidades**:

   - [ ] Popup abre corretamente
   - [ ] Comentários são salvos
   - [ ] Sincronização funciona
   - [ ] Sem erros no console

4. **Validar tamanho**:
   ```bash
   ls -lh releases/inVa-v0.1.4.zip
   # Deve ser < 5MB idealmente
   ```

## 📚 Scripts Disponíveis

| Script                    | Descrição                                  |
| ------------------------- | ------------------------------------------ |
| `npm run build`           | Build de produção (limpa + webpack)        |
| `npm run dev`             | Build de desenvolvimento                   |
| `npm run watch`           | Build com watch mode                       |
| `npm run clean`           | Limpa pasta dist/                          |
| `npm test`                | Executa testes (watch mode)                |
| `npm test -- --run`       | Executa testes uma vez                     |
| `npm run typecheck`       | Valida TypeScript                          |
| `npm run test:security`   | Valida CSP e segurança                     |
| `npm run release`         | Cria nova versão (standard-version)        |
| `npm run prepare:release` | **Prepara release completo (ZIP + notes)** |

## 🎯 Boas Práticas

### ✅ Fazer

- Testar extensivamente antes de release
- Usar `prepare:release` para automatizar
- Validar manualmente o ZIP antes de publicar
- Incluir release notes detalhadas
- Manter CHANGELOG atualizado
- Seguir Semantic Versioning

### ❌ Evitar

- Publicar sem testes
- Pular validação de segurança
- Releases com versões dessincronizadas
- Arquivos desnecessários no ZIP
- Release notes genéricas
- Quebrar Conventional Commits

## 📖 Referências

- [VERSIONING.md](./VERSIONING.md) - Guia de versionamento
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) - Checklist detalhado
- [TESTING.md](./TESTING.md) - Guia de testes
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Pronto para criar seu primeiro release?** Execute `npm run prepare:release` e siga os passos! 🚀
